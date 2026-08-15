-- ════════════════════════════════════════════════════════════════════
-- THE WAY — Books Library Schema Migration
-- বই পাঠাগার ডেটাবেস — সম্পূর্ণ টেক্সট সংরক্ষণ
-- Run in Supabase Dashboard → SQL Editor → New Query → Run
-- ════════════════════════════════════════════════════════════════════

-- 1. BOOKS TABLE
CREATE TABLE IF NOT EXISTS public.books (
  id              UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT    UNIQUE NOT NULL,
  title_bn        TEXT    NOT NULL,
  title_en        TEXT,
  subtitle_bn     TEXT,
  subtitle_en     TEXT,
  author_bn       TEXT,
  author_en       TEXT,
  translator_bn   TEXT,
  translator_en   TEXT,
  year            TEXT,
  category        TEXT    DEFAULT 'classics',
  category_name_bn TEXT,
  cover_color     TEXT    DEFAULT 'linear-gradient(135deg, #b91c1c 0%, #7f1d1d 100%)',
  cover_icon      TEXT    DEFAULT 'book',
  summary_bn      TEXT,
  summary_en      TEXT,
  famous_quote_bn TEXT,
  famous_quote_en TEXT,
  reading_time_mins INTEGER DEFAULT 60,
  pages_count     INTEGER DEFAULT 0,
  rating          NUMERIC(3,1) DEFAULT 5.0,
  source_url      TEXT,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_books_slug     ON public.books (slug);
CREATE INDEX IF NOT EXISTS idx_books_category ON public.books (category);

-- 2. BOOK CHAPTERS TABLE
CREATE TABLE IF NOT EXISTS public.book_chapters (
  id             UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id        UUID    NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  chapter_order  INTEGER NOT NULL,
  chapter_slug   TEXT    NOT NULL,
  chapter_number TEXT,
  title_bn       TEXT    NOT NULL,
  title_en       TEXT,
  source_url     TEXT,
  word_count     INTEGER DEFAULT 0,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (book_id, chapter_order)
);

CREATE INDEX IF NOT EXISTS idx_book_chapters_book_id ON public.book_chapters (book_id);
CREATE INDEX IF NOT EXISTS idx_book_chapters_order   ON public.book_chapters (book_id, chapter_order);

-- 3. BOOK PAGES TABLE
CREATE TABLE IF NOT EXISTS public.book_pages (
  id           UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id   UUID    NOT NULL REFERENCES public.book_chapters(id) ON DELETE CASCADE,
  book_id      UUID    NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  page_number  INTEGER NOT NULL,
  content_html TEXT    NOT NULL,
  word_count   INTEGER DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (chapter_id, page_number)
);

CREATE INDEX IF NOT EXISTS idx_book_pages_chapter_id ON public.book_pages (chapter_id);
CREATE INDEX IF NOT EXISTS idx_book_pages_book_id    ON public.book_pages (book_id);

-- PERMISSIONS
GRANT SELECT ON public.books         TO anon, authenticated;
GRANT SELECT ON public.book_chapters TO anon, authenticated;
GRANT SELECT ON public.book_pages    TO anon, authenticated;
GRANT ALL ON public.books         TO service_role;
GRANT ALL ON public.book_chapters TO service_role;
GRANT ALL ON public.book_pages    TO service_role;

ALTER TABLE public.books         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_pages    ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read active books"         ON public.books;
DROP POLICY IF EXISTS "Service role full access on books"    ON public.books;
DROP POLICY IF EXISTS "Public can read book chapters"        ON public.book_chapters;
DROP POLICY IF EXISTS "Service role full access on chapters" ON public.book_chapters;
DROP POLICY IF EXISTS "Public can read book pages"           ON public.book_pages;
DROP POLICY IF EXISTS "Service role full access on pages"    ON public.book_pages;

CREATE POLICY "Public can read active books"
  ON public.books FOR SELECT TO anon, authenticated USING (is_active = TRUE);
CREATE POLICY "Service role full access on books"
  ON public.books FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Public can read book chapters"
  ON public.book_chapters FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Service role full access on chapters"
  ON public.book_chapters FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Public can read book pages"
  ON public.book_pages FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Service role full access on pages"
  ON public.book_pages FOR ALL TO service_role USING (true) WITH CHECK (true);
