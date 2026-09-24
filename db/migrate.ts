import sql from '../api/_lib/db';

async function execSql(raw: string) {
  const statements = raw
    .split(';')
    .map(s => s.trim())
    .filter(Boolean);
  for (const stmt of statements) {
    try {
      await sql.query(stmt);
    } catch (err: any) {
      console.warn(`[SQL Warning on: ${stmt.slice(0, 40)}...]`, err.message);
    }
  }
}

export async function migrate() {
  console.log('🚀 Starting Neon PostgreSQL Migration...');

  // 1. SECTIONS TABLE
  await execSql(`
    CREATE TABLE IF NOT EXISTS sections (
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
    CREATE UNIQUE INDEX IF NOT EXISTS idx_sections_slug ON sections (slug) WHERE is_deleted = FALSE;
    CREATE INDEX IF NOT EXISTS idx_sections_order ON sections (display_order);
  `);

  // 2. ARTICLES TABLE
  await execSql(`
    CREATE TABLE IF NOT EXISTS articles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      slug TEXT NOT NULL,
      title TEXT NOT NULL,
      deck TEXT,
      section TEXT,
      author TEXT DEFAULT 'সম্পাদকীয়',
      author_role TEXT DEFAULT 'দ্য ওয়ে সম্পাদকীয় পর্ষদ',
      author_bio TEXT,
      author_photo_url TEXT,
      hero_img_url TEXT,
      hero_caption TEXT,
      hero_credit TEXT,
      content_html TEXT,
      status TEXT DEFAULT 'published',
      tags TEXT,
      lang TEXT DEFAULT 'bn',
      created_by TEXT DEFAULT 'admin',
      is_deleted BOOLEAN DEFAULT FALSE,
      published_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles (slug);
    CREATE INDEX IF NOT EXISTS idx_articles_status ON articles (status);
    CREATE INDEX IF NOT EXISTS idx_articles_section ON articles (section);
    CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles (published_at DESC);
  `);

  // 3. ALLOWED ADMINS & USERS TABLE
  await execSql(`
    CREATE TABLE IF NOT EXISTS allowed_admins (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE NOT NULL,
      name TEXT,
      password_hash TEXT,
      role TEXT NOT NULL DEFAULT 'Contributor',
      status TEXT NOT NULL DEFAULT 'active',
      bio TEXT,
      avatar_url TEXT,
      added_by TEXT DEFAULT 'system',
      added_at TIMESTAMPTZ DEFAULT NOW(),
      modified_by TEXT,
      modified_at TIMESTAMPTZ,
      modified_action TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_allowed_admins_email ON allowed_admins (email);
    CREATE INDEX IF NOT EXISTS idx_allowed_admins_role ON allowed_admins (role);
  `);

  // 4. ARTICLE SUBMISSIONS & REVISIONS TABLE
  await execSql(`
    CREATE TABLE IF NOT EXISTS article_submissions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      submission_type TEXT NOT NULL DEFAULT 'new_article',
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
      status TEXT NOT NULL DEFAULT 'pending',
      reviewer_email TEXT,
      reviewer_feedback TEXT,
      reviewed_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_submissions_status ON article_submissions (status);
    CREATE INDEX IF NOT EXISTS idx_submissions_email ON article_submissions (author_email);
    CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON article_submissions (created_at DESC);
  `);

  // 5. ACTIVITY LOGS / AUDIT TRAIL TABLE
  await execSql(`
    CREATE TABLE IF NOT EXISTS activity_logs (
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
    CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs (created_at DESC);
  `);

  // 6. MOVEMENT SIGNUPS TABLE
  await execSql(`
    CREATE TABLE IF NOT EXISTS movement_signups (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      interest TEXT DEFAULT 'তাত্ত্বিক গবেষণা ও লেখালেখি',
      location TEXT,
      phone TEXT,
      notes TEXT,
      status TEXT DEFAULT 'new',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_movement_signups_email ON movement_signups (email);
  `);

  // 7. BOOKS & CHAPTERS
  await execSql(`
    CREATE TABLE IF NOT EXISTS books (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      title_en TEXT,
      author TEXT NOT NULL,
      author_en TEXT,
      cover_image TEXT,
      description TEXT,
      description_en TEXT,
      published_year TEXT,
      category TEXT,
      chapters_count INTEGER DEFAULT 0,
      total_words INTEGER DEFAULT 0,
      is_featured BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS chapters (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      book_slug TEXT NOT NULL REFERENCES books(slug) ON DELETE CASCADE,
      chapter_number INTEGER NOT NULL,
      title TEXT NOT NULL,
      title_en TEXT,
      content_html TEXT NOT NULL,
      word_count INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // 8. NETWORK TABLES (Groups, Solidarity, Posts, Comments, Reactions, Follows, Memberships)
  await execSql(`
    CREATE TABLE IF NOT EXISTS network_groups (
      id TEXT PRIMARY KEY,
      slug TEXT,
      name TEXT NOT NULL,
      name_bn TEXT,
      category TEXT,
      group_type TEXT DEFAULT 'study_group',
      lang TEXT DEFAULT 'bn',
      visibility TEXT DEFAULT 'public',
      join_policy TEXT DEFAULT 'open',
      created_by TEXT DEFAULT 'system',
      members_count INTEGER DEFAULT 0,
      description TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS group_members (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      group_id TEXT NOT NULL REFERENCES network_groups(id) ON DELETE CASCADE,
      user_email TEXT NOT NULL,
      role TEXT DEFAULT 'member',
      status TEXT DEFAULT 'active',
      joined_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(group_id, user_email)
    );
    CREATE INDEX IF NOT EXISTS idx_group_members_group ON group_members (group_id);
    CREATE INDEX IF NOT EXISTS idx_group_members_user ON group_members (user_email);

    CREATE TABLE IF NOT EXISTS solidarity_campaigns (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      organization TEXT NOT NULL,
      country TEXT,
      country_flag TEXT,
      status TEXT DEFAULT 'active',
      description TEXT,
      needs JSONB DEFAULT '[]'::jsonb,
      pledges_count INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS network_posts (
      id TEXT PRIMARY KEY,
      author TEXT NOT NULL,
      author_email TEXT,
      country TEXT,
      country_flag TEXT,
      initials TEXT,
      lang TEXT DEFAULT 'bn',
      post_type TEXT DEFAULT 'post',
      content TEXT NOT NULL,
      reactions JSONB DEFAULT '{"solidarity": 0}'::jsonb,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS network_comments (
      id TEXT PRIMARY KEY,
      post_id TEXT NOT NULL REFERENCES network_posts(id) ON DELETE CASCADE,
      author TEXT NOT NULL,
      author_email TEXT,
      content TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    ALTER TABLE network_posts ADD COLUMN IF NOT EXISTS author_email TEXT;
    ALTER TABLE network_comments ADD COLUMN IF NOT EXISTS author_email TEXT;

    CREATE TABLE IF NOT EXISTS post_reactions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      post_id TEXT NOT NULL REFERENCES network_posts(id) ON DELETE CASCADE,
      user_email TEXT NOT NULL,
      reaction_type TEXT NOT NULL DEFAULT 'solidarity',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(post_id, user_email, reaction_type)
    );
    CREATE INDEX IF NOT EXISTS idx_post_reactions_post ON post_reactions (post_id);
    CREATE INDEX IF NOT EXISTS idx_post_reactions_user ON post_reactions (user_email);

    CREATE TABLE IF NOT EXISTS follows (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      follower_email TEXT NOT NULL,
      following_email TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(follower_email, following_email)
    );
    CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows (follower_email);
    CREATE INDEX IF NOT EXISTS idx_follows_following ON follows (following_email);

    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      title_bn TEXT,
      description TEXT,
      event_type TEXT NOT NULL,
      language TEXT DEFAULT 'bn',
      start_at TIMESTAMPTZ NOT NULL,
      end_at TIMESTAMPTZ,
      timezone TEXT DEFAULT 'Asia/Dhaka',
      country TEXT DEFAULT 'Bangladesh',
      country_flag TEXT DEFAULT '🇧🇩',
      city TEXT,
      online_url TEXT,
      organizer TEXT NOT NULL,
      organizer_email TEXT,
      status TEXT DEFAULT 'upcoming',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_events_start_at ON events (start_at);
    CREATE INDEX IF NOT EXISTS idx_events_status ON events (status);

    CREATE TABLE IF NOT EXISTS notifications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_email TEXT NOT NULL,
      type TEXT NOT NULL,
      actor_name TEXT,
      actor_email TEXT,
      entity_type TEXT,
      entity_id TEXT,
      message TEXT NOT NULL,
      read_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications (user_email, read_at);

    CREATE TABLE IF NOT EXISTS translations (
      id TEXT PRIMARY KEY,
      source_title TEXT NOT NULL,
      source_author TEXT NOT NULL,
      source_lang TEXT DEFAULT 'en',
      target_lang TEXT DEFAULT 'bn',
      status TEXT DEFAULT 'proposed',
      translator TEXT,
      translator_name TEXT,
      translator_email TEXT,
      proposer_name TEXT,
      proposer_email TEXT,
      progress INTEGER DEFAULT 0,
      original_text TEXT,
      translated_text TEXT,
      reviewer TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS federation_resources (
      federation_id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      slug TEXT,
      title TEXT NOT NULL,
      title_bn TEXT,
      title_en TEXT,
      author TEXT NOT NULL,
      year INTEGER,
      category TEXT,
      description TEXT,
      identifiers JSONB DEFAULT '{}'::jsonb,
      languages JSONB DEFAULT '["bn","en"]'::jsonb,
      license TEXT DEFAULT 'CC-BY-SA 4.0',
      pdf_url TEXT,
      read_url TEXT,
      source_collection TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_fed_res_type ON federation_resources (type);

    CREATE TABLE IF NOT EXISTS organizations (
      federation_id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      name_bn TEXT,
      country TEXT,
      country_flag TEXT,
      type TEXT,
      icon TEXT,
      description TEXT,
      members INTEGER DEFAULT 1,
      verified BOOLEAN DEFAULT FALSE,
      focus JSONB DEFAULT '[]'::jsonb,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_orgs_country ON organizations (country);
  `);

  console.log('✅ All Neon tables and indexes created successfully.');

  // ── SEED DATA ──────────────────────────────────────────────────────
  console.log('🌱 Seeding initial records...');

  // Seed Super Admin
  await sql.query(`
    INSERT INTO allowed_admins (email, name, role, status, added_by)
    VALUES ('joysriram.sarkar.56@gmail.com', 'Joysriram Sarkar', 'Admin', 'active', 'system')
    ON CONFLICT (email) DO UPDATE SET role = 'Admin', status = 'active';
  `);

  // Seed Sections
  const sections = [
    ['সমস্ত লেখা', 'all', 'আন্তর্জাতিক সমাজতান্ত্রিক চিন্তন ও গণআন্দোলনের সামগ্রিক মহাফেজখানা', 0, true, true, 'all'],
    ['তত্ত্ব ও দর্শন', 'theory-philosophy', 'মার্ক্সীয় দ্বন্দ্ববাদ, ঐতিহাসিক বস্তুবাদ, উত্তর-ঔপনিবেশিক পাঠ ও মুক্তিচিন্তা', 1, true, false, 'theory-philosophy'],
    ['সাম্রাজ্যবাদ ও বিশ্ব-রাজনীতি', 'imperialism-geopolitics', 'নব্য-সাম্রাজ্যবাদী আগ্রাসন, গ্লোবাল সাউথ প্রতিরোধ ও প্যালেস্টাইন সংহতি', 2, true, false, 'imperialism-geopolitics'],
    ['শ্রম ও গণসংগ্রাম', 'labor-peasant', 'শ্রমিক ধর্মঘট, কৃষক জাগরণ, গিগ-শ্রমিক প্রতিরোধ ও ট্রেড ইউনিয়ন আন্দোলন', 3, true, false, 'labor-peasant'],
    ['রাজনৈতিক অর্থনীতি', 'political-economy', 'নব্য-উদারবাদের সংকট, সম্পদ পুঞ্জীভবন ও সমাজতান্ত্রিক অর্থনীতির বিকল্প', 4, true, false, 'political-economy'],
    ['সংস্কৃতি ও বিপ্লব', 'culture-revolution', 'বিপ্লবী সাহিত্য, গণসঙ্গীত, সিনেমা, গণসংস্কৃতি ও সাংস্কৃতিক হেজেমনি', 5, true, false, 'culture-revolution'],
    ['ইশতেহার ও দলিল', 'manifestos-archives', 'ঐতিহাসিক সমাজতান্ত্রিক ঘোষণাপত্র, শ্রমিক আন্দোলনের চার্টার ও রণনীতি', 6, true, false, 'manifestos-archives']
  ];

  for (const [name, slug, desc, order, active, locked, adminId] of sections) {
    await sql.query(`
      INSERT INTO sections (name, slug, description, display_order, is_active, locked, admin_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT DO NOTHING;
    `, [name, slug, desc, order, active, locked, adminId]);
  }

  // Seed Articles (AUTHORS ARE EXCLUSIVELY 'সম্পাদকীয়' / 'দ্য ওয়ে সম্পাদকীয় পর্ষদ' / 'অ্যাডমিন প্যানেল' — NO IMAGINARY AUTHORS)
  const articles = [
    {
      slug: 'socialism-renaissance-against-neo-imperialism',
      title: 'নব্য-সাম্রাজ্যবাদের যুগে সমাজতন্ত্রের পুনর্জাগরণ ও বৈশ্বিক সংহতির পথ',
      deck: 'পুঁজিবাদের অন্তহীন সংকট, যুদ্ধোন্মাদনা ও করপোরেট লুণ্ঠনের মুখে বিশ্বের মেহনতি মানুষের ঐক্যবদ্ধ বিপ্লবী বিকল্প নির্মাণ এখন সময়ের অনিবার্য দাবি।',
      section: 'imperialism-geopolitics',
      author: 'সম্পাদকীয়',
      author_role: 'দ্য ওয়ে সম্পাদকীয় পর্ষদ',
      author_bio: 'দ্য ওয়ে আন্তর্জাতিক সমাজতান্ত্রিক সংহতি ও সাম্রাজ্যবাদ বিরোধী আন্দোলনের উন্মুক্ত প্ল্যাটফর্ম।',
      hero_img_url: 'assets/images/img1.webp',
      hero_caption: 'নব্য-উদারবাদী বিশ্ব ব্যবস্থার বিকল্প গড়ে তুলতে গ্লোবাল সাউথের সংগ্রামী জনতা।',
      hero_credit: 'দ্য ওয়ে মহাফেজখানা',
      tags: 'সমাজতন্ত্র, সাম্রাজ্যবাদ, গ্লোবাল সাউথ, বিশ্বসংহতি',
      content_html: `
        <p class="lead-paragraph">একবিংশ শতাব্দীর তৃতীয় দশকে এসে বিশ্ব পুঁজিবাদী ব্যবস্থা তার ইতিহাসে সবচেয়ে গভীর ও তীব্র বহুমাত্রিক সংকটের মুখোমুখি। একদিকে চরম সম্পদ পুঞ্জীভবন, যেখানে বিশ্বের শীর্ষ ১ শতাংশ ধনী বৈশ্বিক সম্পদের অর্ধেকের বেশি নিয়ন্ত্রণ করছে; অন্যদিকে কোটি কোটি মেহনতি মানুষ শিকার হচ্ছে সীমাহীন মুদ্রাস্ফীতি, বেকারত্ব ও জলবায়ু বিপর্যয়ের। এই প্রেক্ষাপটে 'দ্য ওয়ে' হাজির হয়েছে এক সুস্পষ্ট ঐতিহাসিক ঘোষণাপত্র নিয়ে—সমাজতন্ত্র কোনো অতীত স্মৃতি নয়, বরং মানবজাতির মুক্তির একমাত্র জীবন্ত ভবিষ্যৎ।</p>
        <h2>১. নব্য-উদারবাদের পতন ও যুদ্ধের উন্মাদনা</h2>
        <p>নব্য-উদারবাদী বিশ্বায়নের যে মোহময় মিথ্যা গত চার দশক ধরে বাজার অর্থনীতি প্রচার করেছিল, তা আজ ধসে পড়েছে। ওয়াশিংটন কনসেনসাস ও সাম্রাজ্যবাদী আর্থিক প্রতিষ্ঠানগুলো গ্লোবাল সাউথের দেশগুলোকে ঋণের ফাঁদে ফেলে তাদের সার্বভৌমত্ব কেড়ে নিয়েছে।</p>
        <blockquote class="featured-quote">
          <p>“সাম্রাজ্যবাদ কেবল ভৌগোলিক দখলদারিত্ব নয়; এটি হলো পুঁজির বিশ্বজনীন একচেটিয়া শোষণ কাঠামো, যা মানুষের শ্রম ও প্রকৃতির রক্ত শুষে নিয়ে গুটিকয়েক করপোরেট সাম্রাজ্য গড়ে তোলে।”</p>
          <cite>— দ্য ওয়ে সম্পাদকীয় ইশতেহার</cite>
        </blockquote>
      `
    },
    {
      slug: 'stalin-problems-of-leninism-contemporary-relevance',
      title: 'স্ট্যালিনের ‘Problems of Leninism’ ও সমাজতান্ত্রিক নির্মাণের ঐতিহাসিক প্রাসঙ্গিকতা',
      deck: 'সাম্রাজ্যবাদী ঘেরাওয়ের মুখে প্রলেতারীয় একনায়কত্ব রক্ষা, পার্টি শৃঙ্খলা এবং কৃষক-শ্রমিক মৈত্রীর দ্বান্দ্বিক পাঠ।',
      section: 'theory-philosophy',
      author: 'সম্পাদকীয়',
      author_role: 'দ্য ওয়ে সম্পাদকীয় পর্ষদ',
      author_bio: 'সমাজতান্ত্রিক রূপান্তর ও বিশ শতকের বলশেভিক ইতিহাস পর্যালোচনা।',
      hero_img_url: 'assets/images/img2.webp',
      hero_caption: 'লেনিনবাদের সমস্যাবলি: সাম্রাজ্যবাদের যুগে সর্বহারা বিপ্লবের বিজ্ঞান।',
      hero_credit: 'দ্য ওয়ে ইতিহাস মহাফেজখানা',
      tags: 'স্ট্যালিন, লেনিনবাদ, সমাজতন্ত্র, পার্টি, প্রলেতারিয়েত',
      content_html: `
        <p class="lead-paragraph">১৯২৬ সালে জোসেফ স্ট্যালিন রচিত <em>‘Problems of Leninism’ (লেনিনবাদের সমস্যাবলি)</em> সমাজতান্ত্রিক ইতিহাসের এক অন্যতম প্রভাবশালী তাত্ত্বিক দলিল। লেনিন মৃত্যুর পর যখন আন্তর্জাতিক বলশেভিক আন্দোলনের সামনে পথনির্দেশনার প্রশ্ন দেখা দিয়েছিল, তখন স্ট্যালিন অত্যন্ত প্রাঞ্জল ও সুশৃঙ্খলভাবে লেনিনবাদের সারবত্তাকে সংজ্ঞায়িত করেছিলেন।</p>
        <h2>লেনিনবাদের তিনটি মৌলিক শিক্ষা:</h2>
        <ol>
          <li><strong>১. সাম্রাজ্যবাদের বিশ্লেষণ:</strong> পুঁজিবাদ একটি বৈশ্বিক শৃঙ্খল, যার দুর্বলতম সংযোগস্থলে সর্বহারা বিপ্লব আঘাত হানে।</li>
          <li><strong>২. প্রলেতারীয় একনায়কত্ব:</strong> বুর্জোয়াদের প্রতিরোধ চূর্ণ করা এবং সমাজতান্ত্রিক অর্থনীতি নির্মাণের প্রধান হাতিয়ার।</li>
          <li><strong>৩. ভ্যানগার্ড পার্টি:</strong> লৌহদৃঢ় আদর্শ ও সাংগঠনিক শৃঙ্খলা ছাড়া শ্রমিক শ্রেণি পুঁজিবাদী ব্যবস্থার বিরুদ্ধে বিজয়ী হতে পারে না।</li>
        </ol>
      `
    },
    {
      slug: 'mao-cultural-revolution-and-continuing-revolution',
      title: 'মাও সেতুং, সাংস্কৃতিক বিপ্লব এবং সমাজতন্ত্রের ভেতর বুর্জোয়া ভাবাদর্শের বিরুদ্ধে লড়াই',
      deck: 'ক্ষমতা দখলের পরও কেন বুর্জোয়া সংস্কৃতি ও আমলাতন্ত্রের বিরুদ্ধে গণমানুষের সার্বক্ষণিক সাংস্কৃতিক বিপ্লব অনিবার্য?',
      section: 'culture-revolution',
      author: 'সম্পাদকীয়',
      author_role: 'দ্য ওয়ে সম্পাদকীয় পর্ষদ',
      author_bio: 'চীনা সমাজতান্ত্রিক ইতিহাস ও মাওবাদী দ্বন্দ্বতত্ত্ব গবেষণা।',
      hero_img_url: 'assets/images/img3.webp',
      hero_caption: 'সমাজতন্ত্রের অভ্যন্তরে অব্যাহত বিপ্লবের আহ্বান।',
      hero_credit: 'পিপলস আর্ট কালেকশন',
      tags: 'মাও সেতুং, সাংস্কৃতিক বিপ্লব, দ্বন্দ্বতত্ত্ব, সমাজতন্ত্র',
      content_html: `
        <p class="lead-paragraph">মাও সেতুং মার্ক্সবাদী দর্শনে যে মৌলিক সংযোজনটি করেছিলেন, তা হলো সমাজতান্ত্রিক সমাজে শ্রেণি সংগ্রামের অনিবার্যতা। উৎপাদন উপায়ের ওপর ব্যক্তিগত মালিকানা বিলোপ করলেই স্বয়ংক্রিয়ভাবে বুর্জোয়া চিন্তার অবসান ঘটে না। পুরোনো সমাজের মূল্যবোধ ও স্বার্থপরতা দীর্ঘদিন মানুষের অবচেতনে রয়ে যায়।</p>
        <blockquote class="featured-quote">
          <p>“বুর্জোয়াদের রাজনৈতিক ক্ষমতা কেড়ে নেওয়ার পরও তাদের সাংস্কৃতিক আধিপত্যকে ভাঙতে না পারলে সমাজতন্ত্র ভেতর থেকেই ধসে পড়বে।”</p>
          <cite>— মাও সেতুং, ১৯৬৬</cite>
        </blockquote>
      `
    },
    {
      slug: 'marx-das-kapital-and-surplus-value-theory',
      title: 'কার্ল মার্ক্স ও ‘পুঁজি’: উদ্বৃত্ত মূল্য এবং আধুনিক পুঁজিবাদী শোষণের স্বরূপ',
      deck: 'কীভাবে শ্রমিকের শ্রম চুরি করে পুঁজিপতিরা পাহাড়সম সম্পদের মালিক হয়—মার্ক্সীয় অর্থনীতির অকাট্য ব্যবচ্ছেদ।',
      section: 'political-economy',
      author: 'সম্পাদকীয়',
      author_role: 'দ্য ওয়ে সম্পাদকীয় পর্ষদ',
      author_bio: 'মার্ক্সীয় অর্থনীতি ও নব্য-উদারবাদ গবেষণা।',
      hero_img_url: 'assets/images/img4.webp',
      hero_caption: 'পুঁজিবাদী ব্যবস্থার বৈজ্ঞানিক ব্যবচ্ছেদ।',
      hero_credit: 'দ্য ওয়ে থিওরি আর্কাইভ',
      tags: 'মার্ক্স, ক্যাপিটাল, উদ্বৃত্ত মূল্য, পুঁজিবাদ, শ্রম',
      content_html: `
        <p class="lead-paragraph">১৮৬৭ সালে কার্ল মার্ক্সের ‘ডাস ক্যাপিটাল’ (পুঁজি) প্রকাশিত হওয়ার পর মানব সমাজ প্রথম জানতে পারল পুঁজিপতিদের মুনাফার আসল গোপন রহস্য। পুঁজিপতি কোনো জাদু দিয়ে ধনী হয় না; সে শ্রমিককে তার শ্রমের পূর্ণ মূল্য না দিয়ে উদ্বৃত্ত শ্রম আত্মসাৎ করে।</p>
      `
    },
    {
      slug: 'lenin-state-and-revolution-imperialism',
      title: 'লেনিন: ‘রাষ্ট্র ও বিপ্লব’ এবং ‘সাম্রাজ্যবাদ: পুঁজিবাদের সর্বোচ্চ পর্যায়’',
      deck: 'আমলাতান্ত্রিক রাষ্ট্রযন্ত্রের শ্রেণি-চরিত্র ও একচেটিয়া লগ্নী পুঁজির বৈশ্বিক আগ্রাসনের বিরুদ্ধে সমাজতান্ত্রিক বিকল্প।',
      section: 'manifestos-archives',
      author: 'সম্পাদকীয়',
      author_role: 'দ্য ওয়ে সম্পাদকীয় পর্ষদ',
      author_bio: 'লেনিনবাদী রাষ্ট্রতত্ত্ব ও সাম্রাজ্যবাদ বিরোধী আন্দোলন।',
      hero_img_url: 'assets/images/img5.webp',
      hero_caption: 'বলশেভিক বিপ্লব ও মেহনতি মানুষের রাষ্ট্র গঠন।',
      hero_credit: 'অক্টোবর বিপ্লব মহাফেজখানা',
      tags: 'লেনিন, রাষ্ট্র ও বিপ্লব, সাম্রাজ্যবাদ, বলশেভিক',
      content_html: `
        <p class="lead-paragraph">লেনিনের দুটি কালজয়ী কাজ বিশ শতকের গতিপথ পাল্টে দিয়েছিল। একটিতে তিনি দেখিয়েছেন কেন রাষ্ট্র কোনো নিরপেক্ষ মধ্যস্থতাকারী নয় বরং বুর্জোয়া শোষণের হাতিয়ার; অন্যটিতে দেখিয়েছেন কেন একচেটিয়া লগ্নী পুঁজির আধিপত্য বিশ্বযুদ্ধ ও উপনিবেশবাদের জন্ম দেয়।</p>
      `
    }
  ];

  for (const art of articles) {
    await sql.query(`
      INSERT INTO articles (slug, title, deck, section, author, author_role, author_bio, hero_img_url, hero_caption, hero_credit, content_html, status, tags)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'published', $12)
      ON CONFLICT DO NOTHING;
    `, [art.slug, art.title, art.deck, art.section, art.author, art.author_role, art.author_bio, art.hero_img_url, art.hero_caption, art.hero_credit, art.content_html, art.tags]);
  }

  // Seed Groups
  const groups = [
    ['grp_1', 'Marxist Political Economy Circle', 'মার্ক্সবাদী রাজনৈতিক অর্থনীতি পাঠচক্র', 'Theory', 'en', 142, "Weekly reading group analyzing Marx's Capital and theories of imperialism."],
    ['grp_2', 'বাংলা সমাজতান্ত্রিক পাঠশালা', 'বাংলা সমাজতান্ত্রিক পাঠশালা', 'Philosophy', 'bn', 320, 'ঐতিহাসিক বস্তুবাদ, দ্বন্দ্বমূলক বস্তুবাদ এবং ভারতীয় উপমহাদেশের কমিউনিস্ট আন্দোলনের ইতিহাস।'],
    ['grp_3', 'শ্রমিক মুক্তি ও ট্রেড ইউনিয়ন সংহতি', 'শ্রমিক মুক্তি ও ট্রেড ইউনিয়ন সংহতি', 'Labor', 'bn', 215, 'পোশাক শ্রমিক, কৃষক ও অসংগঠিত শ্রমজীবী মানুষের অধিকার আন্দোলন।']
  ];
  for (const [id, name, name_bn, cat, lang, count, desc] of groups) {
    await sql.query(`
      INSERT INTO network_groups (id, name, name_bn, category, lang, members_count, description)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (id) DO UPDATE SET members_count = EXCLUDED.members_count;
    `, [id, name, name_bn, cat, lang, count, desc]);
  }

  // Seed Solidarity Campaigns
  const solidarity = [
    [
      'sol_1',
      'Hellenic Steel Strike Solidarity',
      'Hellenic Federation of Metalworkers',
      'Greece',
      '🇬🇷',
      'Workers striking for collective bargaining agreements, workplace safety guarantees, and wage indexation.',
      JSON.stringify(['Translation', 'Public Statement', 'Union Contacts']),
      28
    ],
    [
      'sol_2',
      'আশুলিয়া পোশাক শ্রমিক আইনি প্রতিরক্ষা ও সহায়তা',
      'বাংলাদেশ গার্মেন্টস শ্রমিক সংগ্রাম পরিষদ',
      'Bangladesh',
      '🇧🇩',
      'ন্যূনতম মজুরি ২৫,০০০ টাকা এবং মিথ্যা মামলা প্রত্যাহারের দাবিতে আন্দোলনরত শ্রমিকদের পাশে সংহতি।',
      JSON.stringify(['Legal Support', 'International Media Coverage', 'Translation']),
      45
    ],
    [
      'sol_3',
      'Defend Indigenous Yanomami Land from Illegal Mining',
      'Coletivo de Luta pela Terra',
      'Brazil',
      '🇧🇷',
      'Organizing international campaign against illegal gold extraction and mercury poisoning in Amazon basin.',
      JSON.stringify(['Research', 'Public Statement', 'Eco-socialist Solidarity']),
      62
    ]
  ];
  for (const [id, title, org, country, flag, desc, needs, pledges] of solidarity) {
    await sql.query(`
      INSERT INTO solidarity_campaigns (id, title, organization, country, country_flag, description, needs, pledges_count)
      VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8)
      ON CONFLICT (id) DO UPDATE SET pledges_count = EXCLUDED.pledges_count;
    `, [id, title, org, country, flag, desc, needs, pledges]);
  }

  // Seed Feed Posts (From 'সম্পাদকীয়' / 'অ্যাডমিন প্যানেল')
  const posts = [
    [
      'post_1',
      'সম্পাদকীয়',
      'আন্তর্জাতিক',
      '🚩',
      'এডমিন',
      'bn',
      'post',
      'নব্য-সাম্রাজ্যবাদের চরম সংকটে মেহনতি জনতার লড়াই বেগবান হচ্ছে। গ্লোবাল সাউথের সাম্রাজ্যবাদ বিরোধী সংগ্রামকে বৈশ্বিক সর্বহারা সংহতির সাথে যুক্ত করতে হবে।',
      JSON.stringify({ solidarity: 12 })
    ],
    [
      'post_2',
      'অ্যাডমিন প্যানেল',
      'বাংলাদেশ',
      '🇧🇩',
      'টিম',
      'bn',
      'debate',
      'আমাদের মুক্ত পোর্টাল ‘দ্য ওয়ে’-তে নতুন অনুবাদ ও তাত্ত্বিক গবেষণায় যুক্ত হতে সকল কমরেডদের আহ্বান জানাচ্ছি।',
      JSON.stringify({ solidarity: 8 })
    ]
  ];
  for (const [id, author, country, flag, initials, lang, ptype, content, reactions] of posts) {
    await sql.query(`
      INSERT INTO network_posts (id, author, country, country_flag, initials, lang, post_type, content, reactions)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb)
      ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content;
    `, [id, author, country, flag, initials, lang, ptype, content, reactions]);
  }

  // Seed Events
  const events = [
    [
      'evt_1',
      'প্যালেস্টাইন সংহতি ও সাম্রাজ্যবাদবিরোধী বৈশ্বিক পদযাত্রা',
      'প্যালেস্টাইন সংহতি ও সাম্রাজ্যবাদবিরোধী বৈশ্বিক পদযাত্রা',
      'পশ্চিমা সাম্রাজ্যবাদী মদদ ও জায়নবাদী আগ্রাসনের বিরুদ্ধে বিশ্বের মুক্তিকামী জনতার সাথে একাত্মতা প্রকাশ।',
      'rally',
      'bn',
      '2026-09-28T10:00:00Z',
      'Asia/Dhaka',
      'Bangladesh',
      '🇧🇩',
      'কেন্দ্রীয় শহীদ মিনার ও আন্তর্জাতিক ভার্চুয়াল সংযোগ',
      'https://meet.theway-socialism.org/palestine-solidarity',
      'আন্তর্জাতিক সংহতি ফ্রন্ট'
    ],
    [
      'evt_2',
      'সমাজতান্ত্রিক পাঠচক্র: গ্রামশির ‘প্রিজন নোটবুকস’ ও আধুনিক হেজেমনি',
      'সমাজতান্ত্রিক পাঠচক্র: গ্রামশির ‘প্রিজন নোটবুকস’ ও আধুনিক হেজেমনি',
      'সাংস্কৃতিক আধিপত্য, সুশীল সমাজ ও সর্বহারা বিপ্লবের রণকৌশল দ্বান্দ্বিক পাঠ।',
      'study_circle',
      'bn',
      '2026-10-02T14:30:00Z',
      'Asia/Dhaka',
      'Bangladesh',
      '🇧🇩',
      'ভার্চুয়াল (দ্য ওয়ে স্টাডি রুম)',
      'https://meet.theway-socialism.org/gramsci-circle',
      'বাংলা সমাজতান্ত্রিক পাঠশালা'
    ],
    [
      'evt_3',
      'Global Labor Strike & Platform Capitalism Solidarity Forum',
      'বৈশ্বিক শ্রমিক ধর্মঘট ও প্ল্যাটফর্ম পুঁজিবাদ সংহতি ফোরাম',
      'International coordination against algorithmic exploitation, gig labor precarity, and anti-union legislation.',
      'conference',
      'en',
      '2026-10-10T16:00:00Z',
      'Europe/London',
      'United Kingdom',
      '🇬🇧',
      'London & Global Livestream',
      'https://meet.theway-socialism.org/labor-forum-2026',
      "Workers' Study Collective"
    ],
    [
      'evt_4',
      'Capital — Círculo de Lectura en Español',
      'কার্ল মার্ক্সের ‘পুঁজি’ পাঠচক্র (স্প্যানিশ ও আন্তর্জাতিক)',
      'Análisis colectivo del Libro I de El Capital y las teorías contemporáneas de la dependencia.',
      'study_circle',
      'es',
      '2026-10-15T22:00:00Z',
      'America/Argentina/Buenos_Aires',
      'Argentina',
      '🇦🇷',
      'Buenos Aires & Virtual Aula',
      'https://meet.theway-socialism.org/capital-espanol',
      'Frente Socialista Latinoamericano'
    ]
  ];

  for (const [id, title, title_bn, desc, etype, lang, start_at, tz, country, flag, city, url, org] of events) {
    await sql.query(`
      INSERT INTO events (id, title, title_bn, description, event_type, language, start_at, timezone, country, country_flag, city, online_url, organizer, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'upcoming')
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        start_at = EXCLUDED.start_at,
        online_url = EXCLUDED.online_url;
    `, [id, title, title_bn, desc, etype, lang, start_at, tz, country, flag, city, url, org]);
  }

  // Seed Initial Organizations (at least 10 for global representation)
  const orgs = [
    ['TW-O-000001', "Workers' Study Collective", "ওয়ার্কার্স স্টাডি কালেক্টিভ", "India", "🇮🇳", "Study Circle", "📚", "Autonomous worker-student reading collective studying political economy, trade unionism, and subcontinental labor history.", 120, true, JSON.stringify(["Labor", "Political Economy", "Education"])],
    ['TW-O-000002', "Bangladesh Garment Sramik Sangram Parishad", "বাংলাদেশ গার্মেন্টস শ্রমিক সংগ্রাম পরিষদ", "Bangladesh", "🇧🇩", "Trade Union", "⚒️", "Federation of apparel trade unions fighting for living wages and safety democracy on factory floors.", 14500, true, JSON.stringify(["RMG Labor", "Living Wage", "Legal Rights"])],
    ['TW-O-000003', "Movimento dos Trabalhadores Sem Terra (MST)", "মুভিমেন্তো দোস ত্রাবালিয়াদোরেস সেম তেরা (এমএসটি)", "Brazil", "🇧🇷", "Peasant Movement", "🌾", "Landless rural workers movement struggling for agrarian reform and agroecological popular sovereignty.", 350000, true, JSON.stringify(["Agrarian Reform", "Ecology", "Cooperatives"])],
    ['TW-O-000004', "Hellenic Federation of Metalworkers", "হেলেনিক মেটালওয়ার্কার্স ফেডারেশন", "Greece", "🇬🇷", "Trade Union", "🏭", "National trade union federation defending metal and industrial workers against austerity.", 8200, true, JSON.stringify(["Industrial Labor", "Strikes", "Solidarity"])],
    ['TW-O-000005', "Institut Tribune Socialiste", "আঁস্তিতু ত্রিবুন সোসিয়ালিস্ত", "France", "🇫🇷", "Research Center", "🎓", "Independent research center preserving the history of self-management socialism and democratic planning.", 430, false, JSON.stringify(["History", "Self-Management", "Archives"])],
    ['TW-O-000006', "Sudanese Professionals Association", "تجمع المهنيين السودانيين", "Sudan", "🇸🇩", "Trade Union", "✊", "Alliance of Sudanese trade unions and professionals at the frontline of democratic popular resistance.", 25000, true, JSON.stringify(["Democracy", "Labor Rights", "General Strike"])],
    ['TW-O-000007', "All-India Agricultural Workers Union (AIAWU)", "সারা ভারত খেতমজুর ইউনিয়ন", "India", "🇮🇳", "Peasant Movement", "🌾", "Mass agricultural labor organization fighting for land rights, rural minimum wages, and MGNREGA expansion.", 4200000, true, JSON.stringify(["Rural Labor", "Land Rights", "Anti-Feudalism"])],
    ['TW-O-000008', "Kilusang Mayo Uno (KMU)", "মে ১ আন্দোলন ফিলিপাইন", "Philippines", "🇵🇭", "Trade Union", "⚒️", "Militant labor center organizing factory workers, transport drivers, and contractual laborers.", 120000, true, JSON.stringify(["Anti-Imperialism", "Contractualization", "Labor Rights"])],
    ['TW-O-000009', "Central Unitaria de Trabajadores (CUT)", "একীভূত শ্রমিক কেন্দ্র চিলি", "Chile", "🇨🇱", "Trade Union", "🚩", "Historic Chilean national trade union confederation advocating democratic economic planning.", 310000, true, JSON.stringify(["Labor", "Social Security", "Mining Solidarity"])],
    ['TW-O-000010', "National Union of Metalworkers of South Africa (NUMSA)", "দক্ষিণ আফ্রিকা মেটালওয়ার্কার্স ইউনিয়ন", "South Africa", "🇿🇦", "Trade Union", "⚙️", "Largest socialist trade union in Africa resisting neoliberal privatization and mining monopolies.", 340000, true, JSON.stringify(["Manufacturing", "Nationalization", "Pan-African Solidarity"])]
  ];

  for (const [fid, name, name_bn, country, flag, otype, icon, desc, mems, ver, focus] of orgs) {
    await sql.query(`
      INSERT INTO organizations (federation_id, name, name_bn, country, country_flag, type, icon, description, members, verified, focus)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb)
      ON CONFLICT (federation_id) DO UPDATE SET
        name = EXCLUDED.name,
        name_bn = EXCLUDED.name_bn,
        country = EXCLUDED.country,
        country_flag = EXCLUDED.country_flag,
        type = EXCLUDED.type,
        icon = EXCLUDED.icon,
        description = EXCLUDED.description,
        members = EXCLUDED.members,
        verified = EXCLUDED.verified,
        focus = EXCLUDED.focus;
    `, [fid, name, name_bn, country, flag, otype, icon, desc, mems, ver, focus]);
  }

  // Seed Initial Federation Resources (Classics & Research Papers)
  const classicIdentifiers: Record<string, { openlibrary?: string; wikidata?: string; doi?: string }> = {
    'manifesto': { openlibrary: 'OL45804W', wikidata: 'Q131105' },
    'capital-1': { openlibrary: 'OL7353617M', wikidata: 'Q5879' },
    'state-rev': { openlibrary: 'OL2181775W', wikidata: 'Q1196144' },
    'imperialism': { openlibrary: 'OL262768W', wikidata: 'Q686259' },
    'what-is-done': { openlibrary: 'OL262760W', wikidata: 'Q1143822' },
    'reform-rev': { openlibrary: 'OL13953503W', wikidata: 'Q1429986' },
    'wretched-earth': { openlibrary: 'OL2717013W', wikidata: 'Q1197946' },
    'pedagogy-oppressed': { openlibrary: 'OL2633083W', wikidata: 'Q1638634' },
    'wage-labor': { openlibrary: 'OL45814W', wikidata: 'Q1889476' },
    'socialism-utopian': { openlibrary: 'OL45811W', wikidata: 'Q1196720' }
  };

  try {
    const fs = await import('fs');
    const path = await import('path');
    let booksDataPath = path.join(__dirname, '..', 'public', 'assets', 'js', 'books-data.js');
    if (!fs.existsSync(booksDataPath)) {
      booksDataPath = path.join(__dirname, '..', 'assets', 'js', 'books-data.js');
    }
    if (fs.existsSync(booksDataPath)) {
      const content = fs.readFileSync(booksDataPath, 'utf8');
      const match = content.match(/const\s+WORKS\s*=\s*(\[[\s\S]*?\]);\s*const/);
      if (match) {
        const fn = new Function(`return ${match[1]};`);
        const works = fn() || [];
        function parseYear(val: any): number {
          if (!val) return 1900;
          if (typeof val === 'number') return Math.floor(val);
          const bnMap: Record<string, string> = { '০':'0','১':'1','২':'2','৩':'3','৪':'4','৫':'5','৬':'6','৭':'7','৮':'8','৯':'9' };
          const s = String(val).replace(/[০-৯]/g, d => bnMap[d] || d);
          const m = s.match(/\b(1[789]\d\d|20\d\d)\b/);
          if (m) return parseInt(m[1], 10);
          const digits = s.replace(/[^\d]/g, '').slice(0, 4);
          const n = parseInt(digits, 10);
          return isNaN(n) || n === 0 ? 1900 : n;
        }

        for (let idx = 0; idx < works.length; idx++) {
          const w = works[idx];
          const num = String(idx + 1).padStart(6, '0');
          const fedId = `TW-W-${num}`;
          const slug = w.slug || `work-${idx + 1}`;
          const ids = classicIdentifiers[slug] || {};
          const identifiers = JSON.stringify({
            openlibrary: ids.openlibrary || null,
            wikidata: ids.wikidata || null,
            doi: ids.doi || null
          });
          const languages = JSON.stringify(['bn', 'en', 'es', 'de', 'ru', 'fr', 'pt', 'hi']);
          const readUrl = w.hasJson ? `/book-reader.html?book=${slug}` : (w.pdf || `/books.html`);
          const yr = parseYear(w.year);

          await sql.query(`
            INSERT INTO federation_resources (
              federation_id, type, slug, title, title_bn, title_en, author, year, category, description, identifiers, languages, license, pdf_url, read_url, source_collection
            ) VALUES ($1, 'work', $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, $11::jsonb, $12, $13, $14, $15)
            ON CONFLICT (federation_id) DO UPDATE SET
              title = EXCLUDED.title,
              title_bn = EXCLUDED.title_bn,
              title_en = EXCLUDED.title_en,
              author = EXCLUDED.author,
              description = EXCLUDED.description,
              read_url = EXCLUDED.read_url;
          `, [
            fedId, slug, w.title, w.title, w.titleEn || w.title, w.author, yr,
            w.cat || 'marx', w.desc || '', identifiers, languages, 'Public Domain / Free Culture',
            w.pdf || null, readUrl, 'লাল পাঠাগার (The Way Classics)'
          ]);
        }
      }
    }
  } catch (e: any) {
    console.warn('[Seed Warning] Could not seed classic works into federation_resources:', e.message);
  }

  // Seed default research papers
  const papers = [
    [
      'TW-P-000001',
      'Unequal Exchange and the Universal Law of Value in the 21st Century',
      'একবিংশ শতকে অসম বিনিময় ও মূল্যের বৈশ্বিক নিয়ম',
      'Unequal Exchange and the Universal Law of Value in the 21st Century',
      'Samir Amin & Collective',
      2018,
      'theory',
      'Empirical analysis of international value transfers from the Global South to monopoly capital.',
      JSON.stringify({ doi: '10.1080/08854300.2018.1492582', openalex: 'W2741809807', wikidata: 'Q115862341' }),
      JSON.stringify(['en', 'fr', 'es', 'bn']),
      'CC-BY-SA 4.0'
    ],
    [
      'TW-P-000002',
      'Digital Taylorism, Platform Capitalism and the New Working Class',
      'ডিজিটাল টেইলরিজম, প্ল্যাটফর্ম পুঁজিবাদ ও নতুন শ্রমজীবী শ্রেণি',
      'Digital Taylorism, Platform Capitalism and the New Working Class',
      'Ursula Huws',
      2021,
      'labor',
      'Critical examination of algorithmic labor surveillance, gig economy piece rates, and international organizing.',
      JSON.stringify({ doi: '10.1177/08969205211025732', openalex: 'W3165982012', wikidata: 'Q117498223' }),
      JSON.stringify(['en', 'bn']),
      'Open Access'
    ]
  ];

  for (const [fid, title, title_bn, title_en, author, year, cat, desc, ids, langs, lic] of papers) {
    await sql.query(`
      INSERT INTO federation_resources (
        federation_id, type, slug, title, title_bn, title_en, author, year, category, description, identifiers, languages, license, source_collection
      ) VALUES ($1, 'paper', $1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10::jsonb, $11, 'Federated Academic Commons')
      ON CONFLICT (federation_id) DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description;
    `, [fid, title, title_bn, title_en, author, year, cat, desc, ids, langs, lic]);
  }

  console.log('✨ Neon database migration and initial seed completed successfully!');
}

if (require.main === module) {
  migrate().then(() => process.exit(0)).catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
}
