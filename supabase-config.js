/**
 * THE WAY (দ্য ওয়ে) — Supabase Configuration & Resilient Fallback Engine
 * Root redirect/export to assets/js/supabase-config.js logic
 */

(function(window) {
  'use strict';

  const DEFAULT_SUPABASE_URL = 'https://aenhajqjsgskimfzvlfr.supabase.co';
  const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFlbmhhanFqc2dza2ltZnp2bGZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2MDc1MDUsImV4cCI6MjEwMjE4MzUwNX0.q0wmF77hpsb8M7CQOYMq8GrDuQJ32vn1NcWFXTc5UAY';

  const SUPABASE_URL = window.SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

  let _client = null;
  function getSupabaseClient() {
    if (_client) return _client;
    if (typeof window.supabase !== 'undefined' && typeof window.supabase.createClient === 'function') {
      try {
        _client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        return _client;
      } catch (e) {
        console.warn('[TheWay] Supabase client init warning:', e.message);
      }
    }
    return null;
  }

  const DEFAULT_SECTIONS = [
    { name: 'সমস্ত লেখা', name_en: 'All Articles', slug: 'all', admin_id: 'all', display_order: 0, is_active: true, locked: true, subtitle: 'আন্তর্জাতিক সমাজতান্ত্রিক চিন্তন ও গণআন্দোলনের সামগ্রিক মহাফেজখানা' },
    { name: 'তত্ত্ব ও দর্শন', name_en: 'Theory & Philosophy', slug: 'theory-philosophy', admin_id: 'theory-philosophy', display_order: 1, is_active: true, locked: false, subtitle: 'মার্ক্সীয় দ্বন্দ্ববাদ, ঐতিহাসিক বস্তুবাদ, উত্তর-ঔপনিবেশিক পাঠ ও মুক্তিচিন্তা' },
    { name: 'সাম্রাজ্যবাদ ও বিশ্ব-রাজনীতি', name_en: 'Imperialism & Geopolitics', slug: 'imperialism-geopolitics', admin_id: 'imperialism-geopolitics', display_order: 2, is_active: true, locked: false, subtitle: 'নব্য-সাম্রাজ্যবাদী আগ্রাসন, গ্লোবাল সাউথ প্রতিরোধ ও প্যালেস্টাইন সংহতি' },
    { name: 'শ্রম ও গণসংগ্রাম', name_en: 'Labor & Peasant Movements', slug: 'labor-peasant', admin_id: 'labor-peasant', display_order: 3, is_active: true, locked: false, subtitle: 'শ্রমিক ধর্মঘট, কৃষক জাগরণ, গিগ-শ্রমিক প্রতিরোধ ও ট্রেড ইউনিয়ন আন্দোলন' },
    { name: 'রাজনৈতিক অর্থনীতি', name_en: 'Political Economy', slug: 'political-economy', admin_id: 'political-economy', display_order: 4, is_active: true, locked: false, subtitle: 'নব্য-উদারবাদের সংকট, সম্পদ পুঞ্জীভবন ও সমাজতান্ত্রিক অর্থনীতির বিকল্প' },
    { name: 'সংস্কৃতি ও বিপ্লব', name_en: 'Culture & Revolution', slug: 'culture-revolution', admin_id: 'culture-revolution', display_order: 5, is_active: true, locked: false, subtitle: 'বিপ্লবী সাহিত্য, গণসঙ্গীত, সিনেমা, গণসংস্কৃতি ও সাংস্কৃতিক হেজেমনি' },
    { name: 'ইশতেহার ও দলিল', name_en: 'Manifestos & Archives', slug: 'manifestos-archives', admin_id: 'manifestos-archives', display_order: 6, is_active: true, locked: false, subtitle: 'ঐতিহাসিক সমাজতান্ত্রিক ঘোষণাপত্র, শ্রমিক আন্দোলনের চার্টার ও রণনীতি' }
  ];

  const DEFAULT_ARTICLES = [
    {
      id: 'art-lead-socialism-2026',
      slug: 'socialism-renaissance-against-neo-imperialism',
      title: 'নব্য-সাম্রাজ্যবাদের যুগে সমাজতন্ত্রের পুনর্জাগরণ ও বৈশ্বিক সংহতির পথ',
      title_en: 'The Renaissance of Socialism in the Age of Neo-Imperialism & Global Solidarity',
      deck: 'পুঁজিবাদের অন্তহীন সংকট, যুদ্ধোন্মাদনা ও করপোরেট লুণ্ঠনের মুখে বিশ্বের মেহনতি মানুষের ঐক্যবদ্ধ বিপ্লবী বিকল্প নির্মাণ এখন সময়ের অনিবার্য দাবি।',
      section: 'imperialism-geopolitics',
      section_name: 'সাম্রাজ্যবাদ ও বিশ্ব-রাজনীতি',
      author: 'সম্পাদকীয় পর্ষদ (Editorial Collective)',
      author_role: 'দ্য ওয়ে আন্তর্জাতিক ব্যুরো',
      author_bio: 'দ্য ওয়ে সম্পাদকীয় পরিষদ আন্তর্জাতিক সমাজতান্ত্রিক সংহতি ও সাম্রাজ্যবাদ বিরোধী আন্দোলনের চিন্তাবিদদের যৌথ মঞ্চ।',
      author_photo_url: 'assets/images/img1.png',
      hero_img_url: 'assets/images/img1.png',
      hero_img_alt: 'বিশ্বজুড়ে মেহনতি জনতার সংহতি মিছিল',
      hero_caption: 'নব্য-উদারবাদী বিশ্ব ব্যবস্থার বিকল্প গড়ে তুলতে গ্লোবাল সাউথের সংগ্রামী জনতা।',
      hero_credit: 'দ্য ওয়ে আর্কাইভ / আন্তর্জাতিক সংহতি নেটওয়ার্ক',
      lang: 'bn',
      tags: 'সমাজতন্ত্র, সাম্রাজ্যবাদ, গ্লোবাল সাউথ, বিশ্বসংহতি, রাজনৈতিক অর্থনীতি',
      status: 'published',
      published_at: '2026-08-15T09:00:00.000Z',
      created_at: '2026-08-15T09:00:00.000Z',
      content_html: `
        <p class="lead-paragraph">একবিংশ শতাব্দীর তৃতীয় দশকে এসে বিশ্ব পুঁজিবাদী ব্যবস্থা তার ইতিহাসে সবচেয়ে গভীর ও তীব্র বহুমাত্রিক সংকটের মুখোমুখি। একদিকে চরম সম্পদ পুঞ্জীভবন, যেখানে বিশ্বের শীর্ষ ১ শতাংশ ধনী বৈশ্বিক সম্পদের অর্ধেকের বেশি নিয়ন্ত্রণ করছে; অন্যদিকে কোটি কোটি মেহনতি মানুষ শিকার হচ্ছে সীমাহীন মুদ্রাস্ফীতি, বেকারত্ব ও জলবায়ু বিপর্যয়ের। এই প্রেক্ষাপটে 'দ্য ওয়ে' হাজির হয়েছে এক সুস্পষ্ট ঐতিহাসিক ঘোষণাপত্র নিয়ে—সমাজতন্ত্র কোনো অতীত স্মৃতি নয়, বরং মানবজাতির মুক্তির একমাত্র জীবন্ত ভবিষ্যৎ।</p>
        <h2>১. নব্য-উদারবাদের পতন ও যুদ্ধের উন্মাদনা</h2>
        <p>নব্য-উদারবাদী বিশ্বায়নের যে মোহময় মিথ্যা গত চার দশক ধরে বাজার অর্থনীতি প্রচার করেছিল, তা আজ ধসে পড়েছে। ওয়াশিংটন কনসেনসাস ও সাম্রাজ্যবাদী আর্থিক প্রতিষ্ঠানগুলো (আইএমএফ, বিশ্বব্যাংক) গ্লোবাল সাউথের দেশগুলোকে ঋণের ফাঁদে ফেলে তাদের সার্বভৌমত্ব কেড়ে নিয়েছে।</p>
        <blockquote class="featured-quote">
          <p>“সাম্রাজ্যবাদ কেবল ভৌগোলিক দখলদারিত্ব নয়; এটি হলো পুঁজির বিশ্বজনীন একচেটিয়া শোষণ কাঠামো, যা মানুষের শ্রম ও প্রকৃতির রক্ত শুষে নিয়ে গুটিকয়েক করপোরেট সাম্রাজ্য গড়ে তোলে।”</p>
          <cite>— দ্য ওয়ে ইশতেহার, ২০২৬</cite>
        </blockquote>
        <h2>২. গ্লোবাল সাউথের জেগে ওঠা ও বহুমেরুকেন্দ্রিক বিশ্ব</h2>
        <p>পশ্চিমের একমেরুকেন্দ্রিক আধিপত্য ও ডলারের একচেটিয়া সাম্রাজ্য আজ চ্যালেঞ্জের মুখে। লাতিন আমেরিকা থেকে আফ্রিকা, মধ্যপ্রাচ্য থেকে এশিয়া—সর্বত্র জনগণের মাঝে জন্ম নিচ্ছে নতুন সাম্রাজ্যবাদবিরোধী চেতনা।</p>
      `
    },
    {
      id: 'art-gramsci-hegemony',
      slug: 'gramsci-hegemony-and-counter-hegemonic-struggle',
      title: 'গ্রামশি, হেজেমনি ও সাংস্কৃতিক প্রতিরোধের আধুনিক রণকৌশল',
      title_en: 'Gramsci, Hegemony and Modern Strategies of Counter-Hegemony',
      deck: 'শাসক শ্রেণি কেবল বন্দুক দিয়ে নয়, চিন্তা ও সংস্কৃতির প্রভুত্ব দিয়ে রাজত্ব করে। কেন সাংস্কৃতিক প্রতিরোধ বিপ্লবের অবিচ্ছেদ্য অংশ?',
      section: 'theory-philosophy',
      section_name: 'তত্ত্ব ও দর্শন',
      author: 'ড. সৌমিক রায়হান',
      author_role: 'রাজনৈতিক তাত্ত্বিক ও লেখক',
      author_bio: 'ড. সৌমিক রায়হান মার্ক্সীয় তত্ত্ব, সংস্কৃতি ও ফ্রাঙ্কফুর্ট স্কুল নিয়ে গবেষণা করেন।',
      author_photo_url: 'assets/images/img2.png',
      hero_img_url: 'assets/images/img2.png',
      hero_img_alt: 'অ্যান্তোনিও গ্রামশির দার্শনিক প্রতিকৃতি',
      hero_caption: 'কারাগারে বসে গ্রামশি যে নোটবুক রচনা করেছিলেন, তা আধুনিক বিপ্লবের পথনির্দেশক।',
      hero_credit: 'দ্য ওয়ে থিওরি কালেকশন',
      lang: 'bn',
      tags: 'গ্রামশি, হেজেমনি, মার্ক্সবাদ, দর্শন, সংস্কৃতি',
      status: 'published',
      published_at: '2026-08-14T14:30:00.000Z',
      created_at: '2026-08-14T14:30:00.000Z',
      content_html: `
        <p class="lead-paragraph">ইতালীয় মার্ক্সবাদী চিন্তাবিদ আন্তোনিও গ্রামশি যখন মুসোলিনির ফ্যাসিস্ট কারাগারে বন্দি ছিলেন, তখন তিনি লিখেছিলেন: <em>“পুরনো বিশ্ব মরছে, এবং নতুন বিশ্ব জন্ম নিতে লড়াই করছে: এই সংকটকালে নানা রকম দানবের জন্ম হয়।”</em></p>
        <h2>আধিপত্য বনাম সম্মতি: শাসক শ্রেণির অস্ত্র</h2>
        <p>গ্রামশি দেখিয়েছেন, বুর্জোয়া শ্রেণি তাদের শাসন টিকিয়ে রাখে দুটি উপায়ে: একটি হলো বলপ্রয়োগ এবং অন্যটি হলো ‘সম্মতি উৎপাদন’ (হেজেমনি)।</p>
      `
    },
    {
      id: 'art-neoliberal-crisis-en',
      slug: 'crisis-of-late-neoliberalism-and-socialist-alternative',
      title: 'The Terminal Crisis of Late Neoliberalism and the Urgent Need for Democratic Planning',
      title_en: 'The Terminal Crisis of Late Neoliberalism and the Urgent Need for Democratic Planning',
      deck: 'As global financialization cannibalizes public infrastructure and exacerbates extreme inequality, socialist economic planning emerges as the sole viable future.',
      section: 'political-economy',
      section_name: 'রাজনৈতিক অর্থনীতি',
      author: 'Elena Rostova & Tariq Mansoor',
      author_role: 'Political Economists & Editors',
      author_bio: 'Elena and Tariq specialize in international trade, labor economics, and post-capitalist transition systems.',
      author_photo_url: 'assets/images/img3.png',
      hero_img_url: 'assets/images/img3.png',
      hero_img_alt: 'Wall Street vs Mass Protest',
      hero_caption: 'The contradiction between runaway speculation and workers’ material livelihood.',
      hero_credit: 'The Way International Bureau',
      lang: 'en',
      tags: 'Neoliberalism, Political Economy, Capitalism, Planning, Labor',
      status: 'published',
      published_at: '2026-08-13T11:15:00.000Z',
      created_at: '2026-08-13T11:15:00.000Z',
      content_html: `
        <p class="lead-paragraph">We are living through the unraveling of the neoliberal consensus that has dictated world economics since the late 1970s.</p>
        <h2>The Myth of the Self-Regulating Market</h2>
        <p>Neoliberal dogma asserted that deregulation and austerity would unleash universal prosperity. In reality, it created extreme wealth concentration.</p>
      `
    }
  ];

  const REVOLUTIONARY_QUOTES = [
    {
      quote_bn: "জগতের সকল শোষিত মানুষ এক হও!",
      quote_en: "Workers and oppressed peoples of all lands, unite!",
      author: "কার্ল মার্ক্স ও ফ্রিডরিখ এঙ্গেলস (Karl Marx & Friedrich Engels)",
      source: "কমিউনিস্ট ইশতেহার, ১৮৪৮"
    },
    {
      quote_bn: "বিপ্লবী তত্ত্ব ছাড়া কোনো বিপ্লবী আন্দোলন হতে পারে না।",
      quote_en: "Without revolutionary theory there can be no revolutionary movement.",
      author: "ভ্লাদিমির লেনিন (Vladimir Lenin)",
      source: "হোয়াট ইজ টু বি ডান?, ১৯০২"
    },
    {
      quote_bn: "পুরনো বিশ্ব মরছে, নতুন বিশ্ব জন্ম নিতে লড়াই করছে; এই সংকটকালেই নানা দানবের জন্ম হয়।",
      quote_en: "The old world is dying, and the new world struggles to be born: now is the time of monsters.",
      author: "আন্তোনিও গ্রামশি (Antonio Gramsci)",
      source: "প্রিজন নোটবুকস, ১৯৩০"
    },
    {
      quote_bn: "যেখানে অবিচারই আইন, সেখানে প্রতিরোধই মানুষের নৈতিক কর্তব্য।",
      quote_en: "When injustice becomes law, resistance becomes duty.",
      author: "চে গুয়েভারা (Che Guevara)",
      source: "ভাষণ ও দিনলিপি"
    },
    {
      quote_bn: "জালিমকে খতম না করা পর্যন্ত মজলুমের কোনো বিশ্রাম নাই।",
      quote_en: "There can be no rest for the oppressed until the oppressors are brought down.",
      author: "মওলানা আবদুল হামিদ খান ভাসানী (Maulana Bhashani)",
      source: "কাগমারী সম্মেলন ও ঐতিহাসিক ভাষণ"
    }
  ];

  window.THE_WAY_CONFIG = {
    brandNameBn: 'দ্য ওয়ে',
    brandNameEn: 'The Way',
    taglineBn: 'আন্তর্জাতিক সমাজতান্ত্রিক চিন্তন ও গণআন্দোলনের উন্মুক্ত পোর্টাল',
    taglineEn: 'Voice of Socialism & Anti-Imperialist Solidarity',
    mottoBn: '“জগতের সকল শোষিত মানুষ এক হও!”',
    mottoEn: '“Workers & Oppressed Peoples of All Lands, Unite!”',
    supabaseUrl: SUPABASE_URL,
    supabaseAnonKey: SUPABASE_ANON_KEY,
    getClient: getSupabaseClient,
    defaultSections: DEFAULT_SECTIONS,
    defaultArticles: DEFAULT_ARTICLES,
    revolutionaryQuotes: REVOLUTIONARY_QUOTES,
  };

})(typeof window !== 'undefined' ? window : this);
