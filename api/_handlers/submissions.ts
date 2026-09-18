/**
 * api/_handlers/submissions.ts — Article Submissions & Revision Requests Engine using Neon PostgreSQL
 */

import sql from '../_lib/db';
import { verifySession, requireAuth } from '../_lib/auth';
import { logActivity } from '../_lib/activity';
import type { ApiRequest, ApiResponse } from '../../types';

function generateSlug(text: string): string {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s\u0980-\u09FF-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .slice(0, 100) || `article-${Date.now()}`;
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', (req.headers.origin as string) || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { action } = req.query as { action?: string };

  try {
    // ── 1. SUBMIT ──────────────────────────────────────────────────────
    if (action === 'submit' && req.method === 'POST') {
      const session = verifySession(req);
      const body = req.body || {};
      const {
        submission_type = 'new_article',
        target_article_id = null,
        target_article_slug = '',
        title,
        deck = '',
        section = 'theory-philosophy',
        author_name,
        author_email,
        author_role = '',
        author_bio = '',
        hero_img_url = '',
        hero_caption = '',
        content_html,
        revision_notes = ''
      } = body;

      const finalEmail = (session && session.email) || author_email;
      const finalName  = (session && session.name)  || author_name || 'সম্পাদকীয়';

      if (!title || !content_html) {
        return res.status(400).json({ error: 'লেখার শিরোনাম এবং বিষয়বস্তু আবশ্যক (Title and content are required).' });
      }
      if (!finalEmail || !finalName) {
        return res.status(400).json({ error: 'লেখকের নাম এবং ইমেইল প্রদান করুন (Author name and email are required).' });
      }

      const rows = await sql.query(`
        INSERT INTO article_submissions (
          submission_type, target_article_id, target_article_slug, title, deck, section,
          author_name, author_email, author_role, author_bio, hero_img_url, hero_caption,
          content_html, revision_notes, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'pending')
        RETURNING *;
      `, [
        submission_type,
        target_article_id || null,
        target_article_slug || '',
        String(title).trim(),
        String(deck).trim(),
        String(section).trim(),
        String(finalName).trim(),
        String(finalEmail).trim().toLowerCase(),
        String(author_role).trim(),
        String(author_bio).trim(),
        String(hero_img_url).trim(),
        String(hero_caption).trim(),
        String(content_html).trim(),
        String(revision_notes).trim()
      ]);

      const saved = rows[0];

      if (session) {
        logActivity({
          actor: session,
          action: submission_type === 'revision' ? 'submission.revision_request' : 'submission.new_article',
          category: 'submissions',
          summary: `${finalName} submitted a ${submission_type === 'revision' ? 'revision request' : 'new article draft'}: "${title}"`,
          target_id: saved.id,
          target_name: title,
          details: { type: submission_type, notes: revision_notes },
          req
        }).catch(() => {});
      }

      return res.status(201).json({
        success: true,
        message: submission_type === 'revision'
          ? 'লেখাটির সংশোধনের আবেদন সফলভাবে গৃহীত হয়েছে! সম্পাদকীয় পর্যালোচনার পর তা হালনাগাদ করা হবে।'
          : 'আপনার নতুন লেখার খসড়া সফলভাবে জমা হয়েছে! সম্পাদকীয় পরিষদ পর্যালোচনা করে তা প্রকাশ করবে।',
        submission: saved
      });
    }

    // ── 2. LIST ────────────────────────────────────────────────────────
    if (action === 'list' && req.method === 'GET') {
      const session = verifySession(req);
      const { status_filter, my_only } = req.query as { status_filter?: string; my_only?: string };

      let queryStr = 'SELECT * FROM article_submissions';
      const conditions: string[] = [];
      const params: any[] = [];

      if (status_filter && status_filter !== 'all') {
        params.push(status_filter);
        conditions.push(`status = $${params.length}`);
      }

      if (my_only === 'true' && session) {
        params.push(session.email.toLowerCase());
        conditions.push(`LOWER(author_email) = $${params.length}`);
      } else {
        const isAdmin = session && ['Admin', 'Moderator', 'Editor'].includes(session.role || '');
        if (!isAdmin) {
          if (session) {
            params.push(session.email.toLowerCase());
            conditions.push(`LOWER(author_email) = $${params.length}`);
          } else {
            return res.status(401).json({ error: 'Authentication required' });
          }
        }
      }

      if (conditions.length > 0) {
        queryStr += ' WHERE ' + conditions.join(' AND ');
      }

      queryStr += ' ORDER BY created_at DESC;';

      const results = await sql.query(queryStr, params);
      return res.status(200).json(results || []);
    }

    // ── 3. REVIEW (Approve / Reject) ──────────────────────────────────
    if (action === 'review' && req.method === 'POST') {
      const session = await requireAuth(req, res);
      if (!session) return;

      if (!session.role || !['Admin', 'Moderator', 'Editor'].includes(session.role)) {
        return res.status(403).json({ error: 'শুধুমাত্র অ্যাডমিন ও সম্পাদকবৃন্দ আবেদন পর্যালোচনা করতে পারেন।' });
      }

      const { submission_id, status: reviewStatus, reviewer_feedback = '' } = req.body || {};
      if (!submission_id || !['approved', 'rejected'].includes(reviewStatus)) {
        return res.status(400).json({ error: 'submission_id and valid status (approved/rejected) are required' });
      }

      const subRows = await sql.query('SELECT * FROM article_submissions WHERE id = $1 LIMIT 1', [submission_id]);
      if (!subRows || subRows.length === 0) {
        return res.status(404).json({ error: 'আবেদনটি খুঁজে পাওয়া যায়নি (Submission not found).' });
      }
      const sub = subRows[0];

      if (reviewStatus === 'approved') {
        if (sub.submission_type === 'new_article') {
          const newSlug = generateSlug(sub.title);
          await sql.query(`
            INSERT INTO articles (slug, title, deck, section, author, author_role, author_bio, hero_img_url, hero_caption, content_html, status, created_by, published_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'published', $11, NOW())
            ON CONFLICT DO NOTHING;
          `, [
            newSlug, sub.title, sub.deck || '', sub.section || 'theory-philosophy',
            sub.author_name || 'সম্পাদকীয়', sub.author_role || 'দ্য ওয়ে সম্পাদকীয় পর্ষদ', sub.author_bio || '',
            sub.hero_img_url || '', sub.hero_caption || '', sub.content_html, sub.author_email
          ]);
        } else if (sub.submission_type === 'revision') {
          if (sub.target_article_id) {
            await sql.query(`
              UPDATE articles
              SET title = $1, deck = $2, section = $3, content_html = $4, updated_at = NOW()
              WHERE id = $5;
            `, [sub.title, sub.deck, sub.section, sub.content_html, sub.target_article_id]);
          } else if (sub.target_article_slug) {
            await sql.query(`
              UPDATE articles
              SET title = $1, deck = $2, section = $3, content_html = $4, updated_at = NOW()
              WHERE slug = $5;
            `, [sub.title, sub.deck, sub.section, sub.content_html, sub.target_article_slug]);
          }
        }
      }

      await sql.query(`
        UPDATE article_submissions
        SET status = $1, reviewer_email = $2, reviewer_feedback = $3, reviewed_at = NOW(), updated_at = NOW()
        WHERE id = $4;
      `, [reviewStatus, session.email, reviewer_feedback, submission_id]);

      logActivity({
        actor: session,
        action: `submission.${reviewStatus}`,
        category: 'submissions',
        summary: `${session.name || session.email} ${reviewStatus} submission: "${sub.title}" (${sub.submission_type})`,
        target_id: String(sub.id),
        target_name: sub.title,
        details: { status: reviewStatus, feedback: reviewer_feedback },
        req
      }).catch(() => {});

      return res.status(200).json({
        success: true,
        message: reviewStatus === 'approved'
          ? 'আবেদনটি সফলভাবে অনুমোদিত ও সংশ্লিষ্ট লেখাটি প্রকাশিত/হালনাগাদ হয়েছে!'
          : 'আবেদনটি সফলভাবে প্রত্যাখ্যান করা হয়েছে।',
        status: reviewStatus
      });
    }

    return res.status(400).json({ error: 'Unknown action or method' });
  } catch (err: any) {
    console.error('[Submissions Handler Error]:', err.message);
    return res.status(500).json({ error: err.message });
  }
}

module.exports = handler;
(module.exports as any).default = handler;
