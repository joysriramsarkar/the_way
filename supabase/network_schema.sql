-- ════════════════════════════════════════════════════════════════════
-- THE WAY — Network Extension Schema
-- Phase 1: Socialist Network Tables
-- Run AFTER supabase_schema.sql
-- ════════════════════════════════════════════════════════════════════

-- 1. LANGUAGES TABLE
CREATE TABLE IF NOT EXISTS public.languages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,       -- ISO 639-1 (bn, en, es)
    bcp47 TEXT NOT NULL,             -- BCP 47 tag (bn-BD, en, es)
    name TEXT NOT NULL,              -- English name
    native_name TEXT NOT NULL,       -- Name in the language itself
    script TEXT,                     -- ISO 15924 (Beng, Latn, Arab)
    direction TEXT DEFAULT 'ltr',    -- 'ltr' or 'rtl'
    enabled BOOLEAN DEFAULT TRUE,
    tier INTEGER DEFAULT 2,          -- 1 = core, 2 = extended
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_languages_code ON public.languages (code);
CREATE INDEX IF NOT EXISTS idx_languages_enabled ON public.languages (enabled);

-- 2. PROFILES TABLE (extends allowed_admins)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email TEXT UNIQUE NOT NULL REFERENCES public.allowed_admins(email) ON DELETE CASCADE,
    
    -- Display
    display_name TEXT,               -- Can be real name or pseudonym
    pseudonym TEXT,                  -- Chosen pen name / activist name
    use_pseudonym BOOLEAN DEFAULT FALSE,
    bio TEXT,
    avatar_url TEXT,
    cover_url TEXT,
    
    -- Location (all optional for privacy)
    country_code TEXT,               -- ISO 3166-1 alpha-2
    country_name TEXT,
    region TEXT,                     -- State/Province (optional)
    city TEXT,                       -- City (optional)
    location_visibility TEXT DEFAULT 'public', -- 'public', 'members', 'hidden'
    
    -- Political identity
    ideology_tags TEXT[] DEFAULT '{}',   -- ['marxist', 'eco_socialist', 'feminist']
    ideology_visibility TEXT DEFAULT 'public',
    
    -- Languages
    languages JSONB DEFAULT '[]'::jsonb,  -- [{code: 'bn', level: 'native'}, {code: 'en', level: 'advanced'}]
    
    -- Interests
    interest_tags TEXT[] DEFAULT '{}',   -- ['labour', 'political_economy', 'history']
    
    -- Contribution skills
    contribution_skills TEXT[] DEFAULT '{}', -- ['translation', 'writing', 'research', 'moderation']
    
    -- Privacy settings
    profile_visibility TEXT DEFAULT 'public',   -- 'public', 'members', 'hidden'
    allow_messages BOOLEAN DEFAULT TRUE,
    show_reading_list BOOLEAN DEFAULT TRUE,
    
    -- Verification
    is_verified BOOLEAN DEFAULT FALSE,
    verified_as TEXT,                -- 'researcher', 'journalist', 'translator', 'organizer'
    verified_at TIMESTAMPTZ,
    
    -- Stats (denormalized for performance)
    followers_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    posts_count INTEGER DEFAULT 0,
    articles_count INTEGER DEFAULT 0,
    translations_count INTEGER DEFAULT 0,
    reading_circles_count INTEGER DEFAULT 0,
    
    -- Timestamps
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    last_active_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_user_email ON public.profiles (user_email);
CREATE INDEX IF NOT EXISTS idx_profiles_country ON public.profiles (country_code);
CREATE INDEX IF NOT EXISTS idx_profiles_ideology ON public.profiles USING GIN (ideology_tags);
CREATE INDEX IF NOT EXISTS idx_profiles_interests ON public.profiles USING GIN (interest_tags);

-- 3. FOLLOWS TABLE
CREATE TABLE IF NOT EXISTS public.follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_email TEXT NOT NULL REFERENCES public.allowed_admins(email) ON DELETE CASCADE,
    following_email TEXT NOT NULL REFERENCES public.allowed_admins(email) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (follower_email, following_email),
    CHECK (follower_email != following_email)
);

CREATE INDEX IF NOT EXISTS idx_follows_follower ON public.follows (follower_email);
CREATE INDEX IF NOT EXISTS idx_follows_following ON public.follows (following_email);

-- 4. POSTS TABLE
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_email TEXT NOT NULL REFERENCES public.allowed_admins(email) ON DELETE CASCADE,
    
    content TEXT NOT NULL,
    content_language TEXT DEFAULT 'bn',  -- BCP47 language code
    post_type TEXT DEFAULT 'post',       -- 'post', 'question', 'debate', 'solidarity_request', 'translation_request'
    
    -- Optional rich content
    media_urls TEXT[],
    link_url TEXT,
    link_title TEXT,
    link_description TEXT,
    
    -- Context
    group_id UUID,           -- If posted in a group
    article_id UUID,         -- If commenting on an article
    
    -- Debate structure
    is_debate BOOLEAN DEFAULT FALSE,
    debate_title TEXT,
    
    -- Visibility
    visibility TEXT DEFAULT 'public',   -- 'public', 'members', 'followers', 'group'
    
    -- Moderation
    status TEXT DEFAULT 'active',       -- 'active', 'hidden', 'removed'
    moderation_note TEXT,
    
    -- Stats
    reactions_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    
    -- Metadata
    tags TEXT[] DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_posts_author ON public.posts (author_email);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_language ON public.posts (content_language);
CREATE INDEX IF NOT EXISTS idx_posts_type ON public.posts (post_type);
CREATE INDEX IF NOT EXISTS idx_posts_group ON public.posts (group_id);
CREATE INDEX IF NOT EXISTS idx_posts_tags ON public.posts USING GIN (tags);

-- 5. COMMENTS TABLE
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_email TEXT NOT NULL REFERENCES public.allowed_admins(email) ON DELETE CASCADE,
    
    -- Target (post or article)
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,  -- Nested comments
    
    content TEXT NOT NULL,
    content_language TEXT DEFAULT 'bn',
    
    -- Moderation
    status TEXT DEFAULT 'active',
    
    -- Stats
    reactions_count INTEGER DEFAULT 0,
    replies_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CHECK (post_id IS NOT NULL OR article_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_comments_post ON public.comments (post_id);
CREATE INDEX IF NOT EXISTS idx_comments_article ON public.comments (article_id);
CREATE INDEX IF NOT EXISTS idx_comments_author ON public.comments (author_email);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON public.comments (parent_comment_id);

-- 6. REACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email TEXT NOT NULL REFERENCES public.allowed_admins(email) ON DELETE CASCADE,
    
    -- Target
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
    
    reaction_type TEXT NOT NULL DEFAULT 'solidarity',  -- 'solidarity', 'insightful', 'important', 'question'
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE (user_email, post_id, reaction_type),
    CHECK (post_id IS NOT NULL OR comment_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_reactions_post ON public.reactions (post_id);
CREATE INDEX IF NOT EXISTS idx_reactions_user ON public.reactions (user_email);

-- 7. GROUPS TABLE
CREATE TABLE IF NOT EXISTS public.groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    long_description TEXT,
    
    group_type TEXT DEFAULT 'study_group',  -- 'study_group', 'reading_circle', 'organization_group', 'regional'
    emoji_icon TEXT DEFAULT '📚',
    
    -- Reading circle specifics
    reading_book_title TEXT,
    reading_schedule TEXT,          -- e.g. 'Every Sunday'
    reading_timezone TEXT,
    reading_seats INTEGER,
    reading_mode TEXT DEFAULT 'online',  -- 'online', 'hybrid', 'in_person'
    
    -- Languages
    primary_language TEXT DEFAULT 'bn',
    additional_languages TEXT[] DEFAULT '{}',
    
    -- Topics
    topic_tags TEXT[] DEFAULT '{}',
    
    -- Privacy
    visibility TEXT DEFAULT 'public',   -- 'public', 'private', 'invite_only'
    join_mode TEXT DEFAULT 'open',      -- 'open', 'request', 'invite_only'
    
    -- Moderation
    created_by TEXT NOT NULL REFERENCES public.allowed_admins(email),
    status TEXT DEFAULT 'active',       -- 'active', 'archived', 'suspended'
    
    -- Rules
    group_rules TEXT,
    
    -- Stats
    members_count INTEGER DEFAULT 0,
    posts_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_groups_slug ON public.groups (slug);
CREATE INDEX IF NOT EXISTS idx_groups_type ON public.groups (group_type);
CREATE INDEX IF NOT EXISTS idx_groups_language ON public.groups (primary_language);
CREATE INDEX IF NOT EXISTS idx_groups_topics ON public.groups USING GIN (topic_tags);
CREATE INDEX IF NOT EXISTS idx_groups_created_at ON public.groups (created_at DESC);

-- 8. GROUP MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.group_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    user_email TEXT NOT NULL REFERENCES public.allowed_admins(email) ON DELETE CASCADE,
    
    role TEXT DEFAULT 'member',         -- 'member', 'moderator', 'admin'
    status TEXT DEFAULT 'active',       -- 'active', 'pending', 'banned'
    
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE (group_id, user_email)
);

CREATE INDEX IF NOT EXISTS idx_group_members_group ON public.group_members (group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user ON public.group_members (user_email);
CREATE INDEX IF NOT EXISTS idx_group_members_role ON public.group_members (role);

-- 9. ORGANIZATIONS TABLE
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    long_description TEXT,
    
    org_type TEXT NOT NULL,  -- 'political', 'labor', 'peasant', 'study_circle', 'research', 'publication', 'student', 'cultural', 'environmental', 'community'
    emoji_icon TEXT DEFAULT '🏛️',
    logo_url TEXT,
    
    -- Location
    country_code TEXT,
    country_name TEXT,
    city TEXT,
    
    -- Language
    primary_language TEXT DEFAULT 'bn',
    languages TEXT[] DEFAULT '{}',
    
    -- Online presence
    website_url TEXT,
    social_links JSONB DEFAULT '{}'::jsonb,
    
    -- Metadata
    founded_year INTEGER,
    ideology_tags TEXT[] DEFAULT '{}',
    focus_tags TEXT[] DEFAULT '{}',
    
    -- Verification
    is_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMPTZ,
    
    -- Created by
    created_by TEXT NOT NULL REFERENCES public.allowed_admins(email),
    status TEXT DEFAULT 'active',
    
    -- Stats
    members_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_organizations_slug ON public.organizations (slug);
CREATE INDEX IF NOT EXISTS idx_organizations_type ON public.organizations (org_type);
CREATE INDEX IF NOT EXISTS idx_organizations_country ON public.organizations (country_code);
CREATE INDEX IF NOT EXISTS idx_organizations_language ON public.organizations (primary_language);
CREATE INDEX IF NOT EXISTS idx_organizations_ideology ON public.organizations USING GIN (ideology_tags);
CREATE INDEX IF NOT EXISTS idx_organizations_focus ON public.organizations USING GIN (focus_tags);

-- 10. ORGANIZATION MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_email TEXT NOT NULL REFERENCES public.allowed_admins(email) ON DELETE CASCADE,
    
    role TEXT DEFAULT 'member',         -- 'member', 'editor', 'admin'
    title TEXT,                         -- Optional: 'Country Editor', 'Translator'
    status TEXT DEFAULT 'active',
    
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE (org_id, user_email)
);

CREATE INDEX IF NOT EXISTS idx_org_members_org ON public.organization_members (org_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user ON public.organization_members (user_email);

-- 11. EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    
    event_type TEXT NOT NULL,  -- 'study_circle', 'conference', 'lecture', 'book_launch', 'labor_event', 'protest', 'solidarity_event', 'film_screening', 'workshop', 'webinar'
    
    -- Time
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ,
    timezone TEXT DEFAULT 'Asia/Kolkata',
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_rule TEXT,            -- e.g. 'FREQ=WEEKLY;BYDAY=SU'
    
    -- Location
    mode TEXT DEFAULT 'online',      -- 'online', 'in_person', 'hybrid'
    location_name TEXT,              -- Venue name
    location_address TEXT,
    country_code TEXT,
    city TEXT,
    online_link TEXT,                -- Zoom/Meet link (shared only with attendees)
    
    -- Language
    primary_language TEXT DEFAULT 'bn',
    languages TEXT[] DEFAULT '{}',
    
    -- Organizer
    organizer_email TEXT REFERENCES public.allowed_admins(email),
    org_id UUID REFERENCES public.organizations(id),
    group_id UUID REFERENCES public.groups(id),
    
    -- Capacity
    max_attendees INTEGER,
    
    -- Topics
    topic_tags TEXT[] DEFAULT '{}',
    
    -- Related content
    related_article_id UUID REFERENCES public.articles(id),
    
    -- Visibility
    visibility TEXT DEFAULT 'public',
    
    -- Moderation
    status TEXT DEFAULT 'upcoming',  -- 'upcoming', 'ongoing', 'ended', 'cancelled'
    
    -- Stats
    attendees_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_slug ON public.events (slug);
CREATE INDEX IF NOT EXISTS idx_events_starts_at ON public.events (starts_at);
CREATE INDEX IF NOT EXISTS idx_events_type ON public.events (event_type);
CREATE INDEX IF NOT EXISTS idx_events_country ON public.events (country_code);
CREATE INDEX IF NOT EXISTS idx_events_language ON public.events (primary_language);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events (status);
CREATE INDEX IF NOT EXISTS idx_events_topics ON public.events USING GIN (topic_tags);

-- 12. EVENT ATTENDEES TABLE
CREATE TABLE IF NOT EXISTS public.event_attendees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    user_email TEXT NOT NULL REFERENCES public.allowed_admins(email) ON DELETE CASCADE,
    
    status TEXT DEFAULT 'registered',   -- 'registered', 'attended', 'cancelled'
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE (event_id, user_email)
);

CREATE INDEX IF NOT EXISTS idx_event_attendees_event ON public.event_attendees (event_id);
CREATE INDEX IF NOT EXISTS idx_event_attendees_user ON public.event_attendees (user_email);

-- ════════════════════════════════════════════════════════════════════
-- RLS POLICIES FOR NETWORK TABLES
-- ════════════════════════════════════════════════════════════════════

GRANT SELECT ON public.languages TO anon, authenticated;
GRANT SELECT ON public.profiles TO anon, authenticated;
GRANT SELECT ON public.follows TO anon, authenticated;
GRANT SELECT ON public.posts TO anon, authenticated;
GRANT SELECT ON public.comments TO anon, authenticated;
GRANT SELECT ON public.reactions TO anon, authenticated;
GRANT SELECT ON public.groups TO anon, authenticated;
GRANT SELECT ON public.group_members TO anon, authenticated;
GRANT SELECT ON public.organizations TO anon, authenticated;
GRANT SELECT ON public.organization_members TO anon, authenticated;
GRANT SELECT ON public.events TO anon, authenticated;
GRANT SELECT ON public.event_attendees TO anon, authenticated;

GRANT INSERT, UPDATE ON public.profiles TO authenticated;
GRANT INSERT ON public.follows TO authenticated;
GRANT INSERT ON public.posts TO authenticated;
GRANT INSERT ON public.comments TO authenticated;
GRANT INSERT ON public.reactions TO authenticated;
GRANT INSERT ON public.group_members TO authenticated;
GRANT INSERT ON public.event_attendees TO authenticated;

GRANT ALL ON public.languages TO service_role;
GRANT ALL ON public.profiles TO service_role;
GRANT ALL ON public.follows TO service_role;
GRANT ALL ON public.posts TO service_role;
GRANT ALL ON public.comments TO service_role;
GRANT ALL ON public.reactions TO service_role;
GRANT ALL ON public.groups TO service_role;
GRANT ALL ON public.group_members TO service_role;
GRANT ALL ON public.organizations TO service_role;
GRANT ALL ON public.organization_members TO service_role;
GRANT ALL ON public.events TO service_role;
GRANT ALL ON public.event_attendees TO service_role;

ALTER TABLE public.languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_attendees ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public read languages" ON public.languages FOR SELECT TO anon, authenticated USING (enabled = TRUE);
CREATE POLICY "Public read profiles" ON public.profiles FOR SELECT TO anon, authenticated USING (profile_visibility = 'public');
CREATE POLICY "Public read follows" ON public.follows FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read posts" ON public.posts FOR SELECT TO anon, authenticated USING (status = 'active' AND visibility = 'public');
CREATE POLICY "Public read comments" ON public.comments FOR SELECT TO anon, authenticated USING (status = 'active');
CREATE POLICY "Public read reactions" ON public.reactions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read groups" ON public.groups FOR SELECT TO anon, authenticated USING (status = 'active' AND visibility = 'public');
CREATE POLICY "Public read group members" ON public.group_members FOR SELECT TO anon, authenticated USING (status = 'active');
CREATE POLICY "Public read organizations" ON public.organizations FOR SELECT TO anon, authenticated USING (status = 'active');
CREATE POLICY "Public read org members" ON public.organization_members FOR SELECT TO anon, authenticated USING (status = 'active');
CREATE POLICY "Public read events" ON public.events FOR SELECT TO anon, authenticated USING (status != 'cancelled' AND visibility = 'public');
CREATE POLICY "Public read event attendees" ON public.event_attendees FOR SELECT TO anon, authenticated USING (true);

-- Service role full access
CREATE POLICY "Service role full access languages" ON public.languages FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access profiles" ON public.profiles FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access follows" ON public.follows FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access posts" ON public.posts FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access comments" ON public.comments FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access reactions" ON public.reactions FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access groups" ON public.groups FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access group members" ON public.group_members FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access organizations" ON public.organizations FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access org members" ON public.organization_members FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access events" ON public.events FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access event attendees" ON public.event_attendees FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ════════════════════════════════════════════════════════════════════
-- SEED DATA: LANGUAGES REGISTRY
-- ════════════════════════════════════════════════════════════════════

INSERT INTO public.languages (code, bcp47, name, native_name, script, direction, enabled, tier) VALUES
  ('bn', 'bn-BD', 'Bengali',    'বাংলা',         'Beng', 'ltr', TRUE, 1),
  ('en', 'en',    'English',    'English',        'Latn', 'ltr', TRUE, 1),
  ('hi', 'hi',    'Hindi',      'हिन्दी',         'Deva', 'ltr', TRUE, 1),
  ('es', 'es',    'Spanish',    'Español',        'Latn', 'ltr', TRUE, 1),
  ('pt', 'pt',    'Portuguese', 'Português',      'Latn', 'ltr', TRUE, 1),
  ('fr', 'fr',    'French',     'Français',       'Latn', 'ltr', TRUE, 1),
  ('ar', 'ar',    'Arabic',     'العربية',        'Arab', 'rtl', TRUE, 1),
  ('ru', 'ru',    'Russian',    'Русский',        'Cyrl', 'ltr', TRUE, 1),
  ('zh', 'zh-CN', 'Chinese',    '中文',           'Hans', 'ltr', TRUE, 1),
  ('de', 'de',    'German',     'Deutsch',        'Latn', 'ltr', TRUE, 1),
  ('it', 'it',    'Italian',    'Italiano',       'Latn', 'ltr', TRUE, 1),
  ('tr', 'tr',    'Turkish',    'Türkçe',         'Latn', 'ltr', TRUE, 1),
  ('fa', 'fa',    'Persian',    'فارسی',          'Arab', 'rtl', TRUE, 1),
  ('id', 'id',    'Indonesian', 'Bahasa Indonesia','Latn', 'ltr', TRUE, 1),
  ('ta', 'ta',    'Tamil',      'தமிழ்',          'Taml', 'ltr', TRUE, 2),
  ('te', 'te',    'Telugu',     'తెలుగు',         'Telu', 'ltr', TRUE, 2),
  ('ml', 'ml',    'Malayalam',  'മലയാളം',         'Mlym', 'ltr', TRUE, 2),
  ('mr', 'mr',    'Marathi',    'मराठी',          'Deva', 'ltr', TRUE, 2),
  ('ur', 'ur',    'Urdu',       'اردو',           'Arab', 'rtl', TRUE, 2),
  ('ne', 'ne',    'Nepali',     'नेपाली',         'Deva', 'ltr', TRUE, 2)
ON CONFLICT (code) DO NOTHING;

-- ════════════════════════════════════════════════════════════════════
-- SEED DATA: SAMPLE GROUPS
-- ════════════════════════════════════════════════════════════════════

INSERT INTO public.groups (name, slug, description, group_type, emoji_icon, primary_language, additional_languages, topic_tags, created_by, visibility, join_mode) VALUES
  ('মার্ক্সীয় রাজনৈতিক অর্থনীতি', 'marxist-political-economy-bn', 'মার্ক্স, এঙ্গেলস ও তাদের উত্তরসূরিদের রাজনৈতিক অর্থনীতির পাঠচক্র', 'study_group', '📚', 'bn', ARRAY['en'], ARRAY['political_economy', 'marxism', 'labour'], 'joysriram.sarkar.56@gmail.com', 'public', 'open'),
  ('Bengali Socialist Readers', 'bengali-socialist-readers', 'বাংলা ভাষায় সমাজতান্ত্রিক সাহিত্য পাঠ ও আলোচনা', 'reading_circle', '🔴', 'bn', ARRAY['en'], ARRAY['marxism', 'history', 'culture'], 'joysriram.sarkar.56@gmail.com', 'public', 'open'),
  ('Global Labour Movement', 'global-labour-movement', 'International labour struggles, trade unions, and workers'' movements', 'study_group', '✊', 'en', ARRAY['bn', 'es', 'pt'], ARRAY['labour', 'imperialism', 'political_economy'], 'joysriram.sarkar.56@gmail.com', 'public', 'open'),
  ('Latin American Left Studies', 'latin-american-left', 'Movimientos de izquierda, socialismo del siglo XXI, y luchas populares', 'study_group', '🌎', 'es', ARRAY['en', 'pt'], ARRAY['anti_colonialism', 'imperialism', 'labour'], 'joysriram.sarkar.56@gmail.com', 'public', 'open'),
  ('Eco-Socialism Circle', 'eco-socialism-circle', 'Marxist ecology, degrowth, climate crisis and socialist alternatives', 'study_group', '🌿', 'en', ARRAY['bn', 'es', 'de'], ARRAY['ecology', 'political_economy', 'marxism'], 'joysriram.sarkar.56@gmail.com', 'public', 'open'),
  ('Marxist Feminism', 'marxist-feminism', 'Social reproduction theory, gendered labour, and feminist Marxism', 'study_group', '✊', 'en', ARRAY['bn', 'es', 'fr'], ARRAY['feminism', 'labour', 'philosophy'], 'joysriram.sarkar.56@gmail.com', 'public', 'open')
ON CONFLICT (slug) DO NOTHING;

-- ════════════════════════════════════════════════════════════════════
-- SEED DATA: SAMPLE EVENTS
-- ════════════════════════════════════════════════════════════════════

INSERT INTO public.events (title, slug, description, event_type, starts_at, timezone, mode, primary_language, topic_tags, organizer_email, visibility, status) VALUES
  ('Capital Vol. I পাঠচক্র — পর্ব ১', 'capital-vol1-patha-chokkho-1', 'মার্ক্সের ক্যাপিটাল প্রথম খণ্ডের প্রথম অধ্যায় নিয়ে আলোচনা। সবার জন্য উন্মুক্ত।', 'study_circle', NOW() + INTERVAL '7 days', 'Asia/Kolkata', 'online', 'bn', ARRAY['marxism', 'political_economy'], 'joysriram.sarkar.56@gmail.com', 'public', 'upcoming'),
  ('State and Revolution Reading Group', 'state-revolution-reading-group', 'Lenin''s State and Revolution — Chapter by chapter discussion in English', 'study_circle', NOW() + INTERVAL '10 days', 'UTC', 'online', 'en', ARRAY['marxism', 'history', 'imperialism'], 'joysriram.sarkar.56@gmail.com', 'public', 'upcoming'),
  ('Labour Rights Webinar: Gig Economy', 'labour-rights-gig-economy-webinar', 'Global gig economy — platform capitalism and new forms of labour exploitation', 'webinar', NOW() + INTERVAL '14 days', 'UTC', 'online', 'en', ARRAY['labour', 'political_economy'], 'joysriram.sarkar.56@gmail.com', 'public', 'upcoming')
ON CONFLICT (slug) DO NOTHING;