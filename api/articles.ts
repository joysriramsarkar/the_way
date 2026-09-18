/**
 * api/articles.ts — Single endpoint for all article operations using Neon PostgreSQL
 * Routes via ?action= query param to stay within Vercel Hobby 12-function limit
 */

import { requireAuth, requireAdmin, verifySession } from './_lib/auth';
import { logActivity } from './_lib/activity';
import submissionsHandler from './_handlers/submissions';
import sql from './_lib/db';
import type { ApiRequest, ApiResponse } from '../types';

function slugify(text: string): string {
  return (text || '')
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100) || 'untitled';
}

function normalizeAuthor(author?: string, role?: string): { author: string; author_role: string } {
  const fictionalNames = ['প্রফেসর অমিত দাশগুপ্ত', 'ড. তানভীর হাসান', 'ড. সৌমিক রায়হান', 'আহমেদ হাসান'];
  let cleanAuthor = (author || '').trim();
  let cleanRole = (role || '').trim();

  if (!cleanAuthor || fictionalNames.some(fn => cleanAuthor.includes(fn))) {
    cleanAuthor = 'সম্পাদকীয়';
  }
  if (!cleanRole || fictionalNames.some(fn => cleanRole.includes(fn))) {
    cleanRole = 'দ্য ওয়ে সম্পাদকীয় পর্ষদ';
  }
  return { author: cleanAuthor, author_role: cleanRole };
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  // Delegate to submissions handler if requested
  if (req.query?._route === 'submissions' || (req.url && req.url.includes('/submissions'))) {
    return await submissionsHandler(req, res);
  }

  res.setHeader('Access-Control-Allow-Origin', (req.headers.origin as string) || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { action, id } = req.query as { action?: string; id?: string };

  try {
    // ── PUBLIC: list published articles (no auth) ───────────────────
    if (action === 'public' && req.method === 'GET') {
      const section = (req.query.section as string) || '';
      const limit = Math.min(parseInt((req.query.limit as string) || '50', 10), 100);
      const offset = Math.max(parseInt((req.query.offset as string) || '0', 10), 0);

      let queryStr = `
        SELECT id, slug, title, deck, section, author, author_role, published_at, hero_img_url, tags
        FROM articles
        WHERE status = 'published' AND is_deleted = FALSE
      `;
      const params: any[] = [];

      if (section && section !== 'all') {
        params.push(`%${section}%`);
        queryStr += ` AND section ILIKE $${params.length}`;
      }

      params.push(limit);
      queryStr += ` ORDER BY published_at DESC LIMIT $${params.length}`;
      params.push(offset);
      queryStr += ` OFFSET $${params.length}`;

      const rows = await sql.query(queryStr, params);
      const normalizedRows = (rows || []).map((r: any) => {
        const { author, author_role } = normalizeAuthor(r.author, r.author_role);
        return { ...r, author, author_role };
      });
      return res.status(200).json(normalizedRows);
    }

    // ── GET SINGLE ARTICLE: by slug or by ID ────────────────────────
    if (action === 'public-get' && req.method === 'GET') {
      const slug = (req.query.slug as string) || '';
      if (id) {
        const session = await requireAuth(req, res);
        if (!session) return;

        const rows = await sql.query('SELECT * FROM articles WHERE id = $1 AND is_deleted = FALSE LIMIT 1', [id]);
        if (!rows || rows.length === 0) return res.status(404).json({ error: 'Article not found' });
        const data = rows[0];

        if (req.query.preview === '1' && data.content) {
          try {
            const draftObj = JSON.parse(data.content);
            if (draftObj && typeof draftObj === 'object') Object.assign(data, draftObj);
          } catch (e) {}
        }

        const norm = normalizeAuthor(data.author, data.author_role);
        data.author = norm.author;
        data.author_role = norm.author_role;

        return res.status(200).json(data);
      } else if (slug) {
        const rows = await sql.query('SELECT * FROM articles WHERE slug = $1 AND status = \'published\' AND is_deleted = FALSE LIMIT 1', [slug]);
        if (!rows || rows.length === 0) return res.status(404).json({ error: 'Article not found or not published' });
        const data = rows[0];
        const norm = normalizeAuthor(data.author, data.author_role);
        data.author = norm.author;
        data.author_role = norm.author_role;
        return res.status(200).json(data);
      } else {
        return res.status(400).json({ error: 'id or slug required' });
      }
    }

    // ── LIST (public: published only; admin: all active) ──────────────
    if (action === 'list' && req.method === 'GET') {
      const session = verifySession(req);
      let queryStr: string;
      if (!session) {
        queryStr = `
          SELECT id, slug, title, deck, section, author, author_role, status, created_at, updated_at, published_at, hero_img_url, tags, content_html
          FROM articles
          WHERE status = 'published' AND is_deleted = FALSE
          ORDER BY updated_at DESC
        `;
      } else {
        queryStr = `
          SELECT id, slug, title, deck, section, author, author_role, status, created_at, updated_at, published_at, hero_img_url, tags, content_html
          FROM articles
          WHERE is_deleted = FALSE
          ORDER BY updated_at DESC
        `;
      }
      const rows = await sql.query(queryStr);
      const normalizedRows = (rows || []).map((r: any) => {
        const { author, author_role } = normalizeAuthor(r.author, r.author_role);
        return { ...r, author, author_role };
      });
      return res.status(200).json(normalizedRows);
    }

    // ── TRASH LIST (admin) ──────────────────────────────────────
    if (action === 'trash' && req.method === 'GET') {
      const session = await requireAuth(req, res);
      if (!session) return;
      const rows = await sql.query(`
        SELECT id, slug, title, section, author, status, deleted_at, hero_img_url
        FROM articles
        WHERE is_deleted = TRUE
        ORDER BY deleted_at DESC
      `);
      return res.status(200).json(rows || []);
    }

    // ── RESTORE (from trash) ────────────────────────────────────
    if (action === 'restore' && req.method === 'PATCH') {
      const session = await requireAuth(req, res);
      if (!session) return;
      if (!id) return res.status(400).json({ error: 'id required' });
      await sql.query('UPDATE articles SET is_deleted = FALSE, deleted_at = NULL WHERE id = $1', [id]);
      return res.status(200).json({ success: true });
    }

    // ── GET (public: published; admin: any status with draft) ───
    if (action === 'get' && req.method === 'GET') {
      const session = verifySession(req);
      const slug = (req.query.slug as string) || '';

      let rows: any[] = [];
      if (id) {
        if (!session) {
          rows = await sql.query('SELECT * FROM articles WHERE id = $1 AND status = \'published\' AND is_deleted = FALSE LIMIT 1', [id]);
        } else {
          rows = await sql.query('SELECT * FROM articles WHERE id = $1 AND is_deleted = FALSE LIMIT 1', [id]);
        }
      } else if (slug) {
        if (!session) {
          rows = await sql.query('SELECT * FROM articles WHERE slug = $1 AND status = \'published\' AND is_deleted = FALSE LIMIT 1', [slug]);
        } else {
          rows = await sql.query('SELECT * FROM articles WHERE slug = $1 AND is_deleted = FALSE LIMIT 1', [slug]);
        }
      } else {
        return res.status(400).json({ error: 'id or slug required' });
      }

      if (!rows || rows.length === 0) return res.status(404).json({ error: 'Article not found' });
      const data = rows[0];

      if (session && data.content) {
        try {
          const draftObj = JSON.parse(data.content);
          if (draftObj && typeof draftObj === 'object') {
            data._has_draft = true;
            Object.assign(data, draftObj);
          }
        } catch (e) {}
      }

      const norm = normalizeAuthor(data.author, data.author_role);
      data.author = norm.author;
      data.author_role = norm.author_role;

      return res.status(200).json(data);
    }

    // ── SAVE (create, update draft, or publish live) ──────────────────
    if (action === 'save' && req.method === 'POST') {
      const session = await requireAuth(req, res);
      if (!session) return;

      const {
        id: bodyId, title = '', deck = '', section = '', author: rawAuthor = '', author_role: rawRole = '',
        author_bio = '', author_photo_url = '', hero_img_url = '', hero_img_alt = '',
        hero_caption = '', hero_credit = '', content_html = '', slug: bodySlug,
        seo_title = '', meta_description = '', tags = '', status: bodyStatus,
        is_draft = false,
      } = req.body || {};

      const { author, author_role } = normalizeAuthor(rawAuthor, rawRole);

      if (bodyId) {
        const existingRows = await sql.query('SELECT id, status, content, title FROM articles WHERE id = $1 LIMIT 1', [bodyId]);
        const existing = existingRows[0];

        if (existing && existing.status === 'published' && is_draft) {
          const draftPayload = {
            title, deck, section, author, author_role, author_bio, author_photo_url,
            hero_img_url, hero_img_alt, hero_caption, hero_credit, content_html,
            seo_title, meta_description, tags,
            draft_saved_at: new Date().toISOString()
          };

          const updatedRows = await sql.query(`
            UPDATE articles
            SET content = $1
            WHERE id = $2
            RETURNING *;
          `, [JSON.stringify(draftPayload), bodyId]);

          logActivity({
            actor: session,
            action: 'article.save_draft',
            category: 'articles',
            summary: `${session.name || session.email} saved working draft for article "${title || existing.title || bodyId}"`,
            target_id: bodyId,
            target_name: title || existing.title || bodyId,
            details: { is_draft: true },
            req
          }).catch(() => {});

          return res.status(200).json({ ...updatedRows[0], ...draftPayload, _is_working_draft: true });
        }

        // Live publish or direct update
        const cleanSlug = bodySlug ? slugify(bodySlug) : undefined;
        let publishedAtClause = '';
        const params: any[] = [
          title, deck, section, author, author_role, author_bio, author_photo_url,
          hero_img_url, hero_caption, hero_credit, content_html, tags
        ];

        let sqlUpdates = `
          title = $1, deck = $2, section = $3, author = $4, author_role = $5, author_bio = $6,
          author_photo_url = $7, hero_img_url = $8, hero_caption = $9, hero_credit = $10,
          content_html = $11, tags = $12, content = NULL, updated_at = NOW()
        `;

        if (bodyStatus) {
          params.push(bodyStatus);
          sqlUpdates += `, status = $${params.length}`;
          if (bodyStatus === 'published') {
            sqlUpdates += `, published_at = COALESCE(published_at, NOW())`;
          } else if (bodyStatus === 'draft') {
            sqlUpdates += `, published_at = NULL`;
          }
        }

        if (cleanSlug) {
          params.push(cleanSlug);
          sqlUpdates += `, slug = $${params.length}`;
        }

        params.push(bodyId);
        const updateQuery = `
          UPDATE articles
          SET ${sqlUpdates}
          WHERE id = $${params.length}
          RETURNING *;
        `;

        const updated = await sql.query(updateQuery, params);
        const data = updated[0];

        logActivity({
          actor: session,
          action: bodyStatus === 'published' ? 'article.publish' : 'article.edit',
          category: 'articles',
          summary: bodyStatus === 'published'
            ? `${session.name || session.email} published article "${title || data?.title || bodyId}"`
            : `${session.name || session.email} edited article "${title || data?.title || bodyId}"`,
          target_id: bodyId,
          target_name: title || data?.title || bodyId,
          details: { status: data?.status, section: data?.section },
          req
        }).catch(() => {});

        return res.status(200).json(data);
      } else {
        // CREATE
        const rawSlug = (bodySlug || '').trim() ? slugify(bodySlug) : slugify(title || 'untitled');
        let finalSlug = rawSlug;

        const existingSlugs = await sql.query('SELECT slug FROM articles WHERE slug ILIKE $1', [rawSlug + '%']);
        if (existingSlugs && existingSlugs.length > 0) {
          const hasExact = existingSlugs.some((a: any) => a.slug === rawSlug);
          if (hasExact) {
            const nums = existingSlugs.map((a: any) => { const m = a.slug.match(/-(\d+)$/); return m ? parseInt(m[1]) : 0; });
            finalSlug = rawSlug + '-' + (Math.max(...nums, 0) + 1);
          }
        }

        const initialStatus = bodyStatus || 'draft';
        const createdRows = await sql.query(`
          INSERT INTO articles (slug, title, deck, section, author, author_role, author_bio, author_photo_url, hero_img_url, hero_caption, hero_credit, content_html, tags, status, published_at, created_by)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, ${initialStatus === 'published' ? 'NOW()' : 'NULL'}, $15)
          RETURNING *;
        `, [
          finalSlug, title, deck, section, author, author_role, author_bio, author_photo_url,
          hero_img_url, hero_caption, hero_credit, content_html, tags, initialStatus, session.email
        ]);

        const data = createdRows[0];

        logActivity({
          actor: session,
          action: initialStatus === 'published' ? 'article.publish' : 'article.create',
          category: 'articles',
          summary: `${session.name || session.email} created new article "${data.title || 'Untitled'}" (${data.status})`,
          target_id: data.id,
          target_name: data.title || 'Untitled',
          details: { status: data.status, section: data.section },
          req
        }).catch(() => {});

        return res.status(201).json(data);
      }
    }

    // ── PUBLISH ──────────────────────────────────────────────────────
    if (action === 'publish' && req.method === 'POST') {
      const session = await requireAdmin(req, res);
      if (!session) return;
      if (!id) return res.status(400).json({ error: 'id required' });

      const existingRows = await sql.query('SELECT * FROM articles WHERE id = $1 LIMIT 1', [id]);
      if (!existingRows || existingRows.length === 0) return res.status(404).json({ error: 'Not found' });
      const existing = existingRows[0];

      const updated = await sql.query(`
        UPDATE articles
        SET status = 'published', published_at = NOW(), updated_at = NOW(), content = NULL
        WHERE id = $1
        RETURNING *;
      `, [id]);

      const data = updated[0];

      logActivity({
        actor: session,
        action: 'article.publish',
        category: 'articles',
        summary: `${session.name || session.email} published article "${data.title || existing.title || id}"`,
        target_id: id,
        target_name: data.title || existing.title || id,
        details: { status: 'published' },
        req
      }).catch(() => {});

      return res.status(200).json(data);
    }

    // ── UNPUBLISH ────────────────────────────────────────────────────
    if (action === 'unpublish' && req.method === 'POST') {
      const session = await requireAdmin(req, res);
      if (!session) return;
      if (!id) return res.status(400).json({ error: 'id required' });

      const updated = await sql.query(`
        UPDATE articles
        SET status = 'draft', published_at = NULL, updated_at = NOW()
        WHERE id = $1
        RETURNING *;
      `, [id]);

      const data = updated[0];

      logActivity({
        actor: session,
        action: 'article.unpublish',
        category: 'articles',
        summary: `${session.name || session.email} unpublished article "${data?.title || id}" to draft`,
        target_id: id,
        target_name: data?.title || id,
        details: { status: 'draft' },
        req
      }).catch(() => {});

      return res.status(200).json(data);
    }

    // ── DELETE ─────────────────────────────────────────────────────
    if (action === 'delete' && req.method === 'DELETE') {
      if (!id) return res.status(400).json({ error: 'id required' });
      const mode = req.query.mode;
      if (mode === 'permanent') {
        const session = await requireAdmin(req, res);
        if (!session) return;

        await sql.query('DELETE FROM articles WHERE id = $1', [id]);

        logActivity({
          actor: session,
          action: 'article.delete_permanent',
          category: 'articles',
          summary: `${session.name || session.email} permanently deleted article ID "${id}"`,
          target_id: id,
          target_name: id,
          details: { permanent: true },
          req
        }).catch(() => {});

        return res.status(200).json({ success: true, permanent: true });
      }

      // Soft delete
      const session = await requireAuth(req, res);
      if (!session) return;

      await sql.query('UPDATE articles SET is_deleted = TRUE, deleted_at = NOW() WHERE id = $1', [id]);

      logActivity({
        actor: session,
        action: 'article.move_to_trash',
        category: 'articles',
        summary: `${session.name || session.email} moved article ID "${id}" to trash`,
        target_id: id,
        target_name: id,
        details: { is_deleted: true },
        req
      }).catch(() => {});

      return res.status(200).json({ success: true, soft: true });
    }

    // ── UPLOAD (image) ───────────────────────────────────────────────
    if (action === 'upload' && req.method === 'POST') {
      const session = await requireAuth(req, res);
      if (!session) return;

      // Handle image upload / data url
      const { dataUrl, filename } = req.body || {};
      if (dataUrl) {
        return res.status(200).json({ publicUrl: dataUrl });
      }
      return res.status(200).json({ publicUrl: 'assets/images/img1.webp' });
    }

    return res.status(400).json({ error: 'Unknown action or method' });
  } catch (err: any) {
    console.error('[Articles Handler Error]:', err.message);
    return res.status(500).json({ error: err.message });
  }
}

module.exports = handler;
(module.exports as any).default = handler;
