/**
 * api/books.js — Books Library API
 * Routes via ?action= query param
 *
 * GET /api/books?action=list               — list all active books
 * GET /api/books?action=get&slug=X         — get book metadata + chapters list
 * GET /api/books?action=chapter&id=CHAP_ID — get full chapter pages content
 * GET /api/books?action=page&id=CHAP_ID&page=N — get single page of a chapter
 */

const { createClient } = require('@supabase/supabase-js');

function sb() {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { action, slug, id, page } = req.query;

  // ── LIST ALL BOOKS ────────────────────────────────────────────────
  if (!action || action === 'list') {
    const { data, error } = await sb()
      .from('books')
      .select('id, slug, title_bn, title_en, author_bn, translator_bn, year, category, category_name_bn, cover_color, cover_icon, summary_bn, famous_quote_bn, reading_time_mins, pages_count, rating')
      .eq('is_active', true)
      .order('created_at', { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data || []);
  }

  // ── GET BOOK METADATA + CHAPTERS ─────────────────────────────────
  if (action === 'get') {
    if (!slug) return res.status(400).json({ error: 'slug required' });

    const { data: book, error: bErr } = await sb()
      .from('books')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (bErr || !book) return res.status(404).json({ error: 'Book not found' });

    const { data: chapters, error: cErr } = await sb()
      .from('book_chapters')
      .select('id, chapter_order, chapter_slug, chapter_number, title_bn, title_en, word_count')
      .eq('book_id', book.id)
      .order('chapter_order', { ascending: true });

    if (cErr) return res.status(500).json({ error: cErr.message });

    return res.status(200).json({ ...book, chapters: chapters || [] });
  }

  // ── GET ALL PAGES OF A CHAPTER ────────────────────────────────────
  if (action === 'chapter') {
    if (!id) return res.status(400).json({ error: 'chapter id required' });

    const { data: chapter, error: cErr } = await sb()
      .from('book_chapters')
      .select('id, chapter_number, title_bn, title_en, book_id, source_url')
      .eq('id', id)
      .single();

    if (cErr || !chapter) return res.status(404).json({ error: 'Chapter not found' });

    const { data: pages, error: pErr } = await sb()
      .from('book_pages')
      .select('id, page_number, content_html, word_count')
      .eq('chapter_id', id)
      .order('page_number', { ascending: true });

    if (pErr) return res.status(500).json({ error: pErr.message });

    return res.status(200).json({ ...chapter, pages: pages || [] });
  }

  // ── GET SINGLE PAGE ───────────────────────────────────────────────
  if (action === 'page') {
    if (!id) return res.status(400).json({ error: 'chapter id required' });
    const pageNum = parseInt(page || '1', 10);

    const { data, error } = await sb()
      .from('book_pages')
      .select('id, page_number, content_html, word_count')
      .eq('chapter_id', id)
      .eq('page_number', pageNum)
      .single();

    if (error || !data) return res.status(404).json({ error: 'Page not found' });
    return res.status(200).json(data);
  }

  return res.status(400).json({ error: 'Unknown action' });
};
