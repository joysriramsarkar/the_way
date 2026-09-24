/**
 * api/translations.ts — Collaborative Translation Engine using Neon PostgreSQL
 */

import sql from './_lib/db';
import { verifySession } from './_lib/auth';
import type { ApiRequest, ApiResponse } from '../types';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', (req.headers && req.headers.origin) || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const query = req.query || {};
  const body = req.body || {};
  const action = query.action || body.action || 'list';
  const session = verifySession(req);

  try {
    // ── 1. LIST TRANSLATION PROJECTS ──────────────────────────────────
    if (action === 'list') {
      const status = query.status || body.status || 'all';
      const lang = query.lang || body.lang || 'all';

      let sqlQuery = 'SELECT * FROM translations';
      const conditions: string[] = [];
      const params: any[] = [];

      if (status !== 'all') {
        params.push(status);
        conditions.push(`status = $${params.length}`);
      }
      if (lang !== 'all') {
        params.push(lang);
        conditions.push(`(target_lang = $${params.length} OR source_lang = $${params.length})`);
      }

      if (conditions.length > 0) {
        sqlQuery += ' WHERE ' + conditions.join(' AND ');
      }

      sqlQuery += ' ORDER BY updated_at DESC;';

      const rows = await sql.query(sqlQuery, params);

      return res.status(200).json({
        success: true,
        total: rows.length,
        projects: rows,
        proposals: rows,
        languages: ['bn', 'en', 'es', 'hi', 'ar', 'pt', 'fr', 'ru', 'zh']
      });
    }

    // ── 2. GET SINGLE PROJECT ─────────────────────────────────────────
    if (action === 'get') {
      const id = query.id || body.id || body.project_id;
      if (!id) return res.status(400).json({ error: 'id is required' });

      const rows = await sql.query('SELECT * FROM translations WHERE id = $1 LIMIT 1', [id]);
      if (!rows || rows.length === 0) return res.status(404).json({ error: 'Translation project not found' });
      return res.status(200).json({ success: true, project: rows[0] });
    }

    // ── 3. REQUEST NEW TRANSLATION ────────────────────────────────────
    if (action === 'request' && req.method === 'POST') {
      const source_title = body.source_title || body.title;
      const target_lang = body.target_lang;
      if (!source_title || !target_lang) {
        return res.status(400).json({ error: 'Source title and target language are required' });
      }

      const id = 'tr_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
      const rows = await sql.query(`
        INSERT INTO translations (id, source_title, source_author, source_lang, target_lang, status, original_text, proposer_name, proposer_email)
        VALUES ($1, $2, $3, $4, $5, 'requested', $6, $7, $8)
        RETURNING *;
      `, [
        id,
        source_title,
        body.source_author || body.author || 'Socialist Classic',
        body.source_lang || 'en',
        target_lang,
        body.original_text || body.source_text || '',
        body.proposer_name || null,
        body.proposer_email || null
      ]);

      return res.status(201).json({ success: true, project: rows[0] });
    }

    // ── 4. CLAIM TRANSLATION PROJECT ──────────────────────────────────
    if (action === 'claim' && req.method === 'POST') {
      const id = body.id || body.project_id;
      if (!id) return res.status(400).json({ error: 'id required' });

      const name = (session && (session.name || session.email)) || body.translator_name || 'Comrade Translator';
      const rows = await sql.query(`
        UPDATE translations
        SET translator = $1, translator_name = $1, translator_email = $2, status = 'in_progress', updated_at = NOW()
        WHERE id = $3
        RETURNING *;
      `, [name, body.translator_email || null, id]);

      if (!rows || rows.length === 0) return res.status(404).json({ error: 'Project not found' });
      return res.status(200).json({ success: true, project: rows[0] });
    }

    // ── 5. SAVE DRAFT ─────────────────────────────────────────────────
    if (action === 'save_draft' && req.method === 'POST') {
      const id = body.id || body.project_id;
      if (!id) return res.status(400).json({ error: 'id required' });

      const rows = await sql.query(`
        UPDATE translations
        SET translated_text = COALESCE($1, translated_text),
            progress = COALESCE($2, progress),
            updated_at = NOW()
        WHERE id = $3
        RETURNING *;
      `, [body.translated_text ?? null, body.progress ?? null, id]);

      if (!rows || rows.length === 0) return res.status(404).json({ error: 'Project not found' });
      return res.status(200).json({ success: true, project: rows[0] });
    }

    // ── 6. SUBMIT FOR REVIEW ──────────────────────────────────────────
    if (action === 'submit_review' && req.method === 'POST') {
      const id = body.id || body.project_id;
      if (!id) return res.status(400).json({ error: 'id required' });

      const rows = await sql.query(`
        UPDATE translations
        SET status = 'review_requested', progress = 100, updated_at = NOW()
        WHERE id = $1
        RETURNING *;
      `, [id]);

      if (!rows || rows.length === 0) return res.status(404).json({ error: 'Project not found' });
      return res.status(200).json({ success: true, project: rows[0] });
    }

    // ── 7. PUBLISH TRANSLATION ────────────────────────────────────────
    if (action === 'publish' && req.method === 'POST') {
      const id = body.id || body.project_id;
      if (!id) return res.status(400).json({ error: 'id required' });

      const reviewer = (session && (session.name || session.email)) || 'Editorial Collective';
      const rows = await sql.query(`
        UPDATE translations
        SET status = 'published', reviewer = $1, updated_at = NOW()
        WHERE id = $2
        RETURNING *;
      `, [reviewer, id]);

      if (!rows || rows.length === 0) return res.status(404).json({ error: 'Project not found' });
      return res.status(200).json({ success: true, project: rows[0] });
    }

    return res.status(400).json({ error: 'Invalid translation action' });
  } catch (err: any) {
    console.error('[Translations Handler Error]:', err.message);
    return res.status(500).json({ error: err.message });
  }
}

