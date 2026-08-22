/**
 * api/books.js — Books Library API
 * Routes via ?action= query param
 *
 * GET /api/books?action=list               — list all active books
 * GET /api/books?action=get&slug=X         — get book metadata + chapters list
 * GET /api/books?action=chapter&id=CHAP_ID — get full chapter pages content
 * GET /api/books?action=page&id=CHAP_ID&page=N — get single page of a chapter
 * POST /api/books?action=import            — import complete OCR book payload
 */

const { createClient } = require('@supabase/supabase-js');

function sb() {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { action, slug, id, page } = req.query;

  // ── IMPORT BOOK FROM OCR TOOL ─────────────────────────────────────
  if (req.method === 'POST' && action === 'import') {
    try {
      const payload = req.body;
      if (!payload || (!payload.title && !payload.title_bn)) {
        return res.status(400).json({ error: 'Invalid book payload. Title is required.' });
      }

      const bookTitle = payload.title_bn || payload.title || 'অনামী বই';
      const cleanSlug = (payload.slug || payload.id || bookTitle)
        .toLowerCase()
        .replace(/[^\w\u0980-\u09FF]+/g, '-')
        .replace(/^-+|-+$/g, '') || `book-${Date.now()}`;

      // 1. Insert or Upsert into books table
      const { data: book, error: bErr } = await sb()
        .from('books')
        .upsert({
          slug: cleanSlug,
          title_bn: bookTitle,
          title_en: payload.title_en || payload.originalPdfName || bookTitle,
          author_bn: payload.author_bn || payload.author || 'অজ্ঞাত সাহিত্যিক',
          translator_bn: payload.translator_bn || '',
          year: payload.year || String(new Date().getFullYear()),
          category: payload.category || 'classics',
          category_name_bn: payload.category_name_bn || 'ধ্রুপদী সাহিত্য',
          summary_bn: payload.summary_bn || `বাংলা PDF OCR ও উইকিসংকলন প্রুফরিডার স্টুডিও থেকে এক্সপোর্টকৃত সংস্করণ।`,
          pages_count: payload.totalPages || (payload.pages ? Object.keys(payload.pages).length : 0),
          is_active: true,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'slug' })
        .select()
        .single();

      if (bErr || !book) {
        return res.status(500).json({ error: bErr?.message || 'Failed to create book record' });
      }

      // 2. Create single chapter
      const { data: chapter, error: cErr } = await sb()
        .from('book_chapters')
        .upsert({
          book_id: book.id,
          chapter_order: 1,
          chapter_slug: 'full-book',
          chapter_number: '১',
          title_bn: 'সম্পূর্ণ সংস্করণ',
          title_en: 'Complete Edition',
          word_count: payload.totalWords || 0,
        }, { onConflict: 'book_id, chapter_order' })
        .select()
        .single();

      if (cErr || !chapter) {
        return res.status(500).json({ error: cErr?.message || 'Failed to create chapter record' });
      }

      // 3. Insert pages
      if (payload.pages) {
        const pageEntries = Object.entries(payload.pages);
        const rows = pageEntries.map(([pageNum, pData]) => ({
          chapter_id: chapter.id,
          book_id: book.id,
          page_number: parseInt(pageNum, 10),
          content_html: (pData.proofreadText || pData.draftText || '')
            .split(/\n{2,}/)
            .map((para) => `<p>${para.replace(/\n/g, '<br/>')}</p>`)
            .join('\n'),
          word_count: pData.wordCount || 0,
        }));

        if (rows.length > 0) {
          const { error: pErr } = await sb()
            .from('book_pages')
            .upsert(rows, { onConflict: 'chapter_id, page_number' });

          if (pErr) console.warn('[Import Pages Warning]', pErr);
        }
      }

      return res.status(200).json({
        success: true,
        message: `বই "${bookTitle}" সফলভাবে লাইব্রেরিতে যুক্ত হয়েছে!`,
        book,
        chapter,
      });
    } catch (err) {
      console.error('[Import OCR Error]', err);
      return res.status(500).json({ error: err.message || 'Internal error while importing book' });
    }
  }

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
