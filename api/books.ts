/**
 * api/books.ts — Books Library API using Neon PostgreSQL
 */

import sql from './_lib/db';
import type { ApiRequest, ApiResponse } from '../types';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', (req.headers.origin as string) || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { action, slug, id } = req.query as { action?: string; slug?: string; id?: string };

  try {
    // ── LIST ALL BOOKS ────────────────────────────────────────────────
    if (!action || action === 'list') {
      const rows = await sql.query(`
        SELECT * FROM books
        ORDER BY created_at ASC;
      `);
      return res.status(200).json(rows || []);
    }

    // ── GET BOOK METADATA + CHAPTERS ─────────────────────────────────
    if (action === 'get') {
      if (!slug) return res.status(400).json({ error: 'slug required' });

      const bookRows = await sql.query('SELECT * FROM books WHERE slug = $1 LIMIT 1', [slug]);
      if (!bookRows || bookRows.length === 0) return res.status(404).json({ error: 'Book not found' });
      const book = bookRows[0];

      const chapters = await sql.query(`
        SELECT * FROM chapters
        WHERE book_slug = $1
        ORDER BY chapter_number ASC;
      `, [slug]);

      return res.status(200).json({ ...book, chapters: chapters || [] });
    }

    // ── GET CHAPTER CONTENT ──────────────────────────────────────────
    if (action === 'chapter') {
      if (!id) return res.status(400).json({ error: 'chapter id required' });

      const chapterRows = await sql.query('SELECT * FROM chapters WHERE id = $1 LIMIT 1', [id]);
      if (!chapterRows || chapterRows.length === 0) return res.status(404).json({ error: 'Chapter not found' });

      return res.status(200).json(chapterRows[0]);
    }

    return res.status(400).json({ error: 'Unknown action' });
  } catch (err: any) {
    console.error('[Books Handler Error]:', err.message);
    return res.status(500).json({ error: err.message });
  }
}

module.exports = handler;
(module.exports as any).default = handler;
