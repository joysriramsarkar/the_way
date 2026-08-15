-- ════════════════════════════════════════════════════════════════════
-- THE WAY (দ্য ওয়ে) — Supabase Complete Database Schema & Initial Data
-- Run this script in your Supabase SQL Editor:
-- Dashboard > SQL Editor > New query > Run
-- ════════════════════════════════════════════════════════════════════

-- 1. SECTIONS TABLE
CREATE TABLE IF NOT EXISTS public.sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    locked BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,
    admin_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_sections_slug ON public.sections (slug) WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_sections_order ON public.sections (display_order);

-- 2. ARTICLES TABLE
CREATE TABLE IF NOT EXISTS public.articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL,
    title TEXT NOT NULL,
    deck TEXT,
    section TEXT,
    author TEXT DEFAULT 'দ্য ওয়ে সম্পাদকীয় পর্ষদ',
    author_role TEXT,
    author_bio TEXT,
    author_photo_url TEXT,
    hero_img_url TEXT,
    hero_caption TEXT,
    hero_credit TEXT,
    content_html TEXT,
    status TEXT DEFAULT 'published', -- 'draft' or 'published'
    created_by TEXT,
    published_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_articles_slug ON public.articles (slug);
CREATE INDEX IF NOT EXISTS idx_articles_status ON public.articles (status);
CREATE INDEX IF NOT EXISTS idx_articles_section ON public.articles (section);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON public.articles (published_at DESC);

-- 3. ALLOWED ADMINS & USERS TABLE
CREATE TABLE IF NOT EXISTS public.allowed_admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    password_hash TEXT,
    role TEXT NOT NULL DEFAULT 'Contributor', -- 'Admin', 'Moderator', 'Editor', 'Contributor', 'User'
    status TEXT NOT NULL DEFAULT 'active',    -- 'active', 'suspended', 'deleted'
    bio TEXT,
    avatar_url TEXT,
    added_by TEXT DEFAULT 'system',
    added_at TIMESTAMPTZ DEFAULT NOW(),
    modified_by TEXT,
    modified_at TIMESTAMPTZ,
    modified_action TEXT
);

CREATE INDEX IF NOT EXISTS idx_allowed_admins_email ON public.allowed_admins (email);
CREATE INDEX IF NOT EXISTS idx_allowed_admins_role ON public.allowed_admins (role);

-- 4. ARTICLE SUBMISSIONS & REVISIONS TABLE
-- Stores new article submissions from writers and revision requests from general users
CREATE TABLE IF NOT EXISTS public.article_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_type TEXT NOT NULL DEFAULT 'new_article', -- 'new_article' or 'revision'
    target_article_id UUID,
    target_article_slug TEXT,
    title TEXT NOT NULL,
    deck TEXT,
    section TEXT,
    author_name TEXT NOT NULL,
    author_email TEXT NOT NULL,
    author_role TEXT,
    author_bio TEXT,
    hero_img_url TEXT,
    hero_caption TEXT,
    content_html TEXT NOT NULL,
    revision_notes TEXT,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    reviewer_email TEXT,
    reviewer_feedback TEXT,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_submissions_status ON public.article_submissions (status);
CREATE INDEX IF NOT EXISTS idx_submissions_email ON public.article_submissions (author_email);
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON public.article_submissions (created_at DESC);

-- 5. ACTIVITY LOGS / AUDIT TRAIL TABLE
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_email TEXT NOT NULL,
    actor_name TEXT,
    actor_role TEXT,
    action TEXT NOT NULL,
    category TEXT,
    summary TEXT,
    target_id TEXT,
    target_name TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs (created_at DESC);

-- ════════════════════════════════════════════════════════════════════
-- 6. ROW LEVEL SECURITY (RLS) & PERMISSIONS
-- ════════════════════════════════════════════════════════════════════

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT ON public.sections TO anon, authenticated;
GRANT SELECT ON public.articles TO anon, authenticated;
GRANT SELECT ON public.allowed_admins TO anon, authenticated;
GRANT SELECT, INSERT ON public.article_submissions TO anon, authenticated;

GRANT ALL ON public.sections TO service_role;
GRANT ALL ON public.articles TO service_role;
GRANT ALL ON public.allowed_admins TO service_role;
GRANT ALL ON public.article_submissions TO service_role;
GRANT ALL ON public.activity_logs TO service_role;

ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.allowed_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active sections" ON public.sections;
DROP POLICY IF EXISTS "Service role full access on sections" ON public.sections;
DROP POLICY IF EXISTS "Public can view published articles" ON public.articles;
DROP POLICY IF EXISTS "Service role full access on articles" ON public.articles;
DROP POLICY IF EXISTS "Public can view allowed admins" ON public.allowed_admins;
DROP POLICY IF EXISTS "Service role full access on allowed_admins" ON public.allowed_admins;
DROP POLICY IF EXISTS "Service role full access on activity_logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Service role full access on article_submissions" ON public.article_submissions;

CREATE POLICY "Public can view active sections"
ON public.sections FOR SELECT
TO anon, authenticated
USING (is_active = TRUE AND is_deleted = FALSE);

CREATE POLICY "Service role full access on sections"
ON public.sections FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Public can view published articles"
ON public.articles FOR SELECT
TO anon, authenticated
USING (status = 'published');

CREATE POLICY "Service role full access on articles"
ON public.articles FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Public can view allowed admins"
ON public.allowed_admins FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Service role full access on allowed_admins"
ON public.allowed_admins FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role full access on activity_logs"
ON public.activity_logs FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role full access on article_submissions"
ON public.article_submissions FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ════════════════════════════════════════════════════════════════════
-- 7. INITIAL ADMIN ACCESS & SECTIONS SETUP
-- ════════════════════════════════════════════════════════════════════

-- Set Joysriram Sarkar as the Primary Super Admin
INSERT INTO public.allowed_admins (email, name, role, status, added_by)
VALUES ('joysriram.sarkar.56@gmail.com', 'Joysriram Sarkar', 'Admin', 'active', 'system')
ON CONFLICT (email) DO UPDATE SET role = 'Admin', status = 'active';

-- Seed Inaugural Sections for The Way
INSERT INTO public.sections (name, slug, description, display_order, is_active, locked, admin_id)
VALUES 
  ('সমস্ত লেখা', 'all', 'আন্তর্জাতিক সমাজতান্ত্রিক চিন্তন ও গণআন্দোলনের সামগ্রিক মহাফেজখানা', 0, TRUE, TRUE, 'all'),
  ('তত্ত্ব ও দর্শন', 'theory-philosophy', 'মার্ক্সীয় দ্বন্দ্ববাদ, ঐতিহাসিক বস্তুবাদ, উত্তর-ঔপনিবেশিক পাঠ ও মুক্তিচিন্তা', 1, TRUE, FALSE, 'theory-philosophy'),
  ('সাম্রাজ্যবাদ ও বিশ্ব-রাজনীতি', 'imperialism-geopolitics', 'নব্য-সাম্রাজ্যবাদী আগ্রাসন, গ্লোবাল সাউথ প্রতিরোধ ও প্যালেস্টাইন সংহতি', 2, TRUE, FALSE, 'imperialism-geopolitics'),
  ('শ্রম ও গণসংগ্রাম', 'labor-peasant', 'শ্রমিক ধর্মঘট, কৃষক জাগরণ, গিগ-শ্রমিক প্রতিরোধ ও ট্রেড ইউনিয়ন আন্দোলন', 3, TRUE, FALSE, 'labor-peasant'),
  ('রাজনৈতিক অর্থনীতি', 'political-economy', 'নব্য-উদারবাদের সংকট, সম্পদ পুঞ্জীভবন ও সমাজতান্ত্রিক অর্থনীতির বিকল্প', 4, TRUE, FALSE, 'political-economy'),
  ('সংস্কৃতি ও বিপ্লব', 'culture-revolution', 'বিপ্লবী সাহিত্য, গণসঙ্গীত, সিনেমা, গণসংস্কৃতি ও সাংস্কৃতিক হেজেমনি', 5, TRUE, FALSE, 'culture-revolution'),
  ('ইশতেহার ও দলিল', 'manifestos-archives', 'ঐতিহাসিক সমাজতান্ত্রিক ঘোষণাপত্র, শ্রমিক আন্দোলনের চার্টার ও রণনীতি', 6, TRUE, FALSE, 'manifestos-archives')
ON CONFLICT DO NOTHING;
