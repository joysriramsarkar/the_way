/**
 * THE WAY (দ্য ওয়ে) — Supabase Configuration & Resilient Fallback Engine
 * International Socialist Editorial & Movement Portal
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

  // Pre-loaded revolutionary socialist sections
  const DEFAULT_SECTIONS = [
    { name: 'সমস্ত লেখা', name_en: 'All Articles', slug: 'all', admin_id: 'all', display_order: 0, is_active: true, locked: true, subtitle: 'আন্তর্জাতিক সমাজতান্ত্রিক চিন্তন ও গণআন্দোলনের সামগ্রিক মহাফেজখানা' },
    { name: 'তত্ত্ব ও দর্শন', name_en: 'Theory & Philosophy', slug: 'theory-philosophy', admin_id: 'theory-philosophy', display_order: 1, is_active: true, locked: false, subtitle: 'মার্ক্সীয় দ্বন্দ্ববাদ, ঐতিহাসিক বস্তুবাদ, উত্তর-ঔপনিবেশিক পাঠ ও মুক্তিচিন্তা' },
    { name: 'সাম্রাজ্যবাদ ও বিশ্ব-রাজনীতি', name_en: 'Imperialism & Geopolitics', slug: 'imperialism-geopolitics', admin_id: 'imperialism-geopolitics', display_order: 2, is_active: true, locked: false, subtitle: 'নব্য-সাম্রাজ্যবাদী আগ্রাসন, গ্লোবাল সাউথ প্রতিরোধ ও প্যালেস্টাইন সংহতি' },
    { name: 'শ্রম ও গণসংগ্রাম', name_en: 'Labor & Peasant Movements', slug: 'labor-peasant', admin_id: 'labor-peasant', display_order: 3, is_active: true, locked: false, subtitle: 'শ্রমিক ধর্মঘট, কৃষক জাগরণ, গিগ-শ্রমিক প্রতিরোধ ও ট্রেড ইউনিয়ন আন্দোলন' },
    { name: 'রাজনৈতিক অর্থনীতি', name_en: 'Political Economy', slug: 'political-economy', admin_id: 'political-economy', display_order: 4, is_active: true, locked: false, subtitle: 'নব্য-উদারবাদের সংকট, সম্পদ পুঞ্জীভবন ও সমাজতান্ত্রিক অর্থনীতির বিকল্প' },
    { name: 'সংস্কৃতি ও বিপ্লব', name_en: 'Culture & Revolution', slug: 'culture-revolution', admin_id: 'culture-revolution', display_order: 5, is_active: true, locked: false, subtitle: 'বিপ্লবী সাহিত্য, গণসঙ্গীত, সিনেমা, গণসংস্কৃতি ও সাংস্কৃতিক হেজেমনি' },
    { name: 'ইশতেহার ও দলিল', name_en: 'Manifestos & Archives', slug: 'manifestos-archives', admin_id: 'manifestos-archives', display_order: 6, is_active: true, locked: false, subtitle: 'ঐতিহাসিক সমাজতান্ত্রিক ঘোষণাপত্র, শ্রমিক আন্দোলনের চার্টার ও রণনীতি' }
  ];

  // Pre-loaded inaugural socialist essays & analyses
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
        <p>নব্য-উদারবাদী বিশ্বায়নের যে মোহময় মিথ্যা গত চার দশক ধরে বাজার অর্থনীতি প্রচার করেছিল, তা আজ ধসে পড়েছে। ওয়াশিংটন কনসেনসাস ও সাম্রাজ্যবাদী আর্থিক প্রতিষ্ঠানগুলো (আইএমএফ, বিশ্বব্যাংক) গ্লোবাল সাউথের দেশগুলোকে ঋণের ফাঁদে ফেলে তাদের সার্বভৌমত্ব কেড়ে নিয়েছে। যখনই কোনো জাতি নিজস্ব প্রাকৃতিক সম্পদের ওপর জনগণের অধিকার প্রতিষ্ঠা করতে চেয়েছে, তখনই নেমে এসেছে নিষেধাজ্ঞা, সামরিক ক্যু অথবা সরাসরি যুদ্ধ।</p>

        <blockquote class="featured-quote">
          <p>“সাম্রাজ্যবাদ কেবল ভৌগোলিক দখলদারিত্ব নয়; এটি হলো পুঁজির বিশ্বজনীন একচেটিয়া শোষণ কাঠামো, যা মানুষের শ্রম ও প্রকৃতির রক্ত শুষে নিয়ে গুটিকয়েক করপোরেট সাম্রাজ্য গড়ে তোলে।”</p>
          <cite>— দ্য ওয়ে ইশতেহার, ২০২৬</cite>
        </blockquote>

        <h2>২. গ্লোবাল সাউথের জেগে ওঠা ও বহুমেরুকেন্দ্রিক বিশ্ব</h2>
        <p>পশ্চিমের একমেরুকেন্দ্রিক আধিপত্য ও ডলারের একচেটিয়া সাম্রাজ্য আজ চ্যালেঞ্জের মুখে। লাতিন আমেরিকা থেকে আফ্রিকা, মধ্যপ্রাচ্য থেকে এশিয়া—সর্বত্র জনগণের মাঝে জন্ম নিচ্ছে নতুন সাম্রাজ্যবাদবিরোধী চেতনা। ফিলিস্তিনের মুক্তিকামী জনতার দীর্ঘস্থায়ী লড়াই গোটা বিশ্বের বিবেককে নাড়া দিয়েছে এবং পশ্চিমা সাম্রাজ্যবাদের মুখোশ উন্মোচন করে দিয়েছে।</p>

        <div class="callout callout-red">
          <h4>বৈপ্লবিক সংহতির মূল স্তম্ভসমূহ:</h4>
          <ul>
            <li><strong>শ্রমের সামাজিকীকরণ:</strong> উৎপাদনের প্রধান উপায়গুলোর ওপর মুনাফালোভী করপোরেট মালিকানার অবসান ও গণতান্ত্রিক গণমালিকানা প্রতিষ্ঠা।</li>
            <li><strong>আন্তর্জাতিক শ্রমিক সংহতি:</strong> জাতীয় ও আঞ্চলিক বিভাজন ভেঙে বিশ্বজুড়ে শ্রমিক শ্রেণির ঐক্যবদ্ধ আন্দোলন।</li>
            <li><strong>পরিবেশগত সমাজতন্ত্র (Eco-Socialism):</strong> মুনাফার জন্য প্রকৃতি ধ্বংস নয়, বরং পরিবেশের সুরক্ষায় পরিকল্পিত অর্থনীতি।</li>
          </ul>
        </div>

        <h2>৩. আমাদের অঙ্গীকার ও পথচলা</h2>
        <p>‘দ্য ওয়ে’ কেবল একটি নিবন্ধ পাঠের পোর্টাল নয়; এটি হলো বিপ্লবীদের চিন্তার যুদ্ধক্ষেত্র ও আন্তর্জাতিক নেটওয়ার্ক। আমরা মেহনতি মানুষের প্রতিশব্দ হতে চাই, কারখানার মজুর থেকে মাঠের কৃষক, ক্যাম্পাসের বিদ্রোহী শিক্ষার্থী থেকে বুদ্ধিজীবী—সবার চিন্তার মশাল প্রজ্বলিত রাখা আমাদের অঙ্গীকার।</p>
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
        <p class="lead-paragraph">ইতালীয় মার্ক্সবাদী চিন্তাবিদ আন্তোনিও গ্রামশি যখন মুসোলিনির ফ্যাসিস্ট কারাগারে বন্দি ছিলেন, তখন তিনি লিখেছিলেন: <em>“পুরনো বিশ্ব মরছে, এবং নতুন বিশ্ব জন্ম নিতে লড়াই করছে: এই সংকটকালে নানা রকম দানবের জন্ম হয়।”</em> আজ একবিংশ শতকে যখন নব্য-ফ্যাসিবাদ ও দক্ষিণপন্থী পপুলিজম বিশ্বজুড়ে মাথাচাড়া দিচ্ছে, তখন গ্রামশির ‘সাংস্কৃতিক হেজেমনি’ (Cultural Hegemony) তত্ত্ব বোঝা আগের চেয়ে অনেক বেশি জরুরি হয়ে পড়েছে।</p>
        
        <h2>আধিপত্য বনাম সম্মতি: শাসক শ্রেণির অস্ত্র</h2>
        <p>গ্রামশি দেখিয়েছেন, বুর্জোয়া শ্রেণি তাদের শাসন টিকিয়ে রাখে দুটি উপায়ে: একটি হলো বলপ্রয়োগ (রাষ্ট্রযন্ত্র, পুলিশ, সেনাবাহিনী) এবং অন্যটি হলো ‘সম্মতি উৎপাদন’ (স্কুল, গণমাধ্যম, ধর্ম, শিল্প ও জনপ্রিয় সংস্কৃতি)। পুঁজিবাদ মানুষের মনে এই বিশ্বাস তৈরি করে যে তাদের শোষণমূলক ব্যবস্থাপনাই হলো ‘স্বাভাবিক’ ও ‘একমাত্র বিকল্প’।</p>

        <blockquote class="pull-quote">
          “বিপ্লব কেবল রাষ্ট্রীয় ক্ষমতা দখলের যুদ্ধ নয়; এটি হলো মানুষের মননে বুর্জোয়া ভাবাদর্শের বিরুদ্ধে বিকল্প সমাজতান্ত্রিক সংস্কৃতির স্থায়ী জয়।”
        </blockquote>

        <h2>কাউন্টার-হেজেমনি গড়ে তোলার পথ</h2>
        <p>একটি কার্যকর বিপ্লবের জন্য ‘ওয়ার অব পজিশন’ (War of Position) পরিচালনা করতে হবে। সমাজতান্ত্রিক বুদ্ধিজীবীদের ভূমিকা হলো মেহনতি শ্রেণির সাথে অঙ্গাঙ্গীভাবে যুক্ত হয়ে ‘জৈব বুদ্ধিজীবী’ (Organic Intellectuals) হিসেবে গড়ে ওঠা এবং শাসক শ্রেণির বয়ানের বিরুদ্ধে জনগণের প্রতিরোধের ভাষা তৈরি করা।</p>
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
        <p class="lead-paragraph">We are living through the unraveling of the neoliberal consensus that has dictated world economics since the late 1970s. From runaway inflation and sovereign debt traps in the Global South to crumbling public healthcare and housing unaffordability in the core capitalist nations, capitalism has proved structurally incapable of meeting human need.</p>
        
        <h2>The Myth of the Self-Regulating Market</h2>
        <p>Neoliberal dogma asserted that deregulation, privatization, and austerity would unleash universal prosperity. In reality, it unleashed an era of hyper-financialization where speculative capital extracts wealth from the productive real economy while slashing the social safety net.</p>

        <blockquote class="featured-quote">
          <p>“Capitalism produces wealth not as a means of collective human elevation, but as an engine of relentless accumulation. When humanity’s survival clashes with capital's growth, capital chooses extinction.”</p>
          <cite>— The Way Economic Dispatch, 2026</cite>
        </blockquote>

        <h2>Why Democratic Socialist Planning is Necessary</h2>
        <p>Modern computational power and decentralized democratic governance provide humanity with the tools to plan production rationally. Instead of producing for corporate profit, society can direct its labor and ecological resources toward renewable energy, universal healthcare, accessible housing, and scientific advancement for all.</p>
      `
    },
    {
      id: 'art-labor-gig-organizing',
      slug: 'digital-sweatshops-and-the-new-working-class-strikes',
      title: 'ডিজিটাল শ্রম, গিগ অর্থনীতি ও নতুন শতাব্দীর শ্রমিক বিদ্রোহ',
      title_en: 'Digital Sweatshops, Gig Economy and the New Working-Class Strikes',
      deck: 'অ্যালগরিদমের দাসত্ব ও কন্ট্রাক্ট শ্রমের নামে আধুনিক শোষণযন্ত্র ভেঙে দিয়ে বিশ্বজুড়ে গড়ে উঠছে তরুণ শ্রমিকদের নতুন গণসংগ্রাম।',
      section: 'labor-peasant',
      section_name: 'শ্রম ও গণসংগ্রাম',
      author: 'কবির হাসান ও আনিসা করিম',
      author_role: 'শ্রমিক অধিকার গবেষক ও সংগঠক',
      author_bio: 'গার্মেন্টস, রাইডশেয়ারিং ও ডেলিভারি শ্রমিক ইউনিয়নের সাথে সক্রিয়ভাবে কাজ করছেন।',
      author_photo_url: 'assets/images/img4.png',
      hero_img_url: 'assets/images/img4.png',
      hero_img_alt: 'ধর্মঘটরতা শ্রমিকদের মিছিল',
      hero_caption: 'অ্যালগরিদমিক শোষণের বিরুদ্ধে বিশ্বব্যাপী গিগ শ্রমিকদের ঐতিহাসিক ঐক্য।',
      hero_credit: 'লেবার মুভমেন্ট আর্কাইভ',
      lang: 'bn',
      tags: 'শ্রমিক, গিগ অর্থনীতি, ধর্মঘট, ইউনিয়ন, অধিকার',
      status: 'published',
      published_at: '2026-08-12T16:00:00.000Z',
      created_at: '2026-08-12T16:00:00.000Z',
      content_html: `
        <p class="lead-paragraph">স্মার্টফোনের স্ক্রিন ও অ্যাপ্লিকেশনের আড়ালে পুঁজিপতিরা তৈরি করেছে এক আধুনিক দাসত্ব প্রথা—যার নাম ‘গিগ অর্থনীতি’। রাইডার, ডেলিভারি কর্মী, কল সেন্টার কর্মী কিংবা তৈরি পোশাক কারখানার শ্রমিক—সকলের শ্রমকে আজ খণ্ডিত করে নূন্যতম মজুরি ও সামাজিক নিরাপত্তা থেকে বঞ্চিত করা হচ্ছে। কিন্তু এই শোষণের ভেতর থেকেই জন্ম নিচ্ছে নতুন প্রতিরোধ।</p>
        
        <h2>অ্যালগরিদমিক নজরদারি বনাম শ্রমিক একতা</h2>
        <p>করপোরেট কোম্পানিগুলো তথাকথিত ‘ফ্লেক্সিবল ওয়ার্ক’-এর নামে শ্রমিকদের ট্রেড ইউনিয়ন করার মৌলিক অধিকার হরণ করতে চেয়েছে। কিন্তু বাংলাদেশ থেকে যুক্তরাজ্য, ভারত থেকে আমেরিকা—সর্বত্র ডেলিভারি ও লজিস্টিক শ্রমিকরা রুখে দাঁড়িয়েছে। ধর্মঘট ও সমন্বিত অ্যাপ শাটডাউনের মাধ্যমে তারা প্রমাণ করেছে, শ্রম ছাড়া পুঁজির কোনো অস্তিত্ব নেই।</p>

        <div class="callout callout-red">
          <h4>শ্রমিক আন্দোলনের দাবিনামা:</h4>
          <ul>
            <li>সকল গিগ ও চুক্তিভিত্তিক কর্মীকে অবিলম্বে প্রাতিষ্ঠানিক স্থায়ী শ্রমিক হিসেবে স্বীকৃতি।</li>
            <li>জীবনযাত্রার মান অনুযায়ী নূন্যতম মর্যাদাপূর্ণ জাতীয় মজুরি ও স্বাস্থ্যবীমা নিশ্চিতকরণ।</li>
            <li>কাজের সময় ও কাজের গতি নির্ধারণে অ্যালগরিদমিক একনায়কতন্ত্রের অবসান ও স্বচ্ছতা।</li>
          </ul>
        </div>
      `
    },
    {
      id: 'art-climate-eco-socialism',
      slug: 'capitalist-ecocide-and-eco-socialist-alternative',
      title: 'পুঁজিবাদী পরিবেশ-ধ্বংস বনাম ইকো-সোশ্যালিজম: পৃথিবী বাঁচানোর চূড়ান্ত লড়াই',
      title_en: 'Capitalist Ecocide vs Eco-Socialism: The Final Battle to Save the Earth',
      deck: 'মুনাফার অন্ধ লোভে পৃথিবীর ফুসফুস পুড়ছে। সবুজ পুঁজিবাদের ভণ্ডামি পেরিয়ে ইকো-সোশ্যালিজমের বিপ্লবী পথই পরিবেশ রক্ষার একমাত্র গ্যারান্টি।',
      section: 'political-economy',
      section_name: 'রাজনৈতিক অর্থনীতি',
      author: 'ড. মালিহা জামান',
      author_role: 'পরিবেশ সমাজতাত্ত্বিক',
      author_bio: 'জলবায়ু রাজনীতি ও গ্লোবাল সাউথের আদিবাসী পরিবেশ অধিকার আন্দোলনের অ্যাক্টিভিস্ট।',
      author_photo_url: 'assets/images/img5.png',
      hero_img_url: 'assets/images/img5.png',
      hero_img_alt: 'ধোঁয়াচ্ছন্ন কলকারখানা ও প্রতিবাদী জনতার ব্যানার',
      hero_caption: 'সবুজ পুঁজিবাদের ভণ্ডামির বিপরীতে মেহনতি মানুষের জলবায়ু সংগ্রাম।',
      hero_credit: 'ইকো-সোশ্যালিস্ট কোয়ালিশন',
      lang: 'bn',
      tags: 'পরিবেশ, জলবায়ু, ইকো-সোশ্যালিজম, পুঁজিবাদ, প্রকৃতি',
      status: 'published',
      published_at: '2026-08-11T10:00:00.000Z',
      created_at: '2026-08-11T10:00:00.000Z',
      content_html: `
        <p class="lead-paragraph">জলবায়ু সংকট কোনো প্রাকৃতিক দুর্ঘটনা নয়; এটি হলো পুঁজিবাদের অন্তর্নিহিত লুণ্ঠনমূলক চরিত্রের অবশ্যম্ভাবী পরিণতি। যে অর্থনৈতিক ব্যবস্থা ক্রমাগত অনন্ত প্রবৃদ্ধির ওপর টিকে থাকে, তা সীমাবদ্ধ গ্রহের বাস্তুতন্ত্রের সাথে মৌলিকভাবে সাংঘর্ষিক। ধনী দেশগুলোর জীবাশ্ম জ্বালানি কর্পোরেশনগুলো যখন বিলিয়ন ডলার মুনাফা কামায়, তখন সমুদ্রের স্ফীতিতে তলিয়ে যাচ্ছে বাংলাদেশ ও প্রশান্ত মহাসাগরীয় দ্বীপরাষ্ট্রগুলো।</p>
        
        <h2>সবুজ পুঁজিবাদের বিভ্রম (Greenwashing)</h2>
        <p>কার্বন ক্রেডিট ও ‘সবুজ বাজার’ হলো আরেকটি করপোরেট তামাশা। দূষণকারী কোম্পানিগুলো টাকা দিয়ে পরিবেশ ধ্বংসের লাইসেন্স কেনে। প্রকৃত সমাধান লুকিয়ে আছে প্রকৃতির ওপর মুনাফার নিয়ন্ত্রণ ভেঙে দিয়ে সমাজতান্ত্রিক পরিকল্পনা গ্রহণ করার মধ্যে।</p>
      `
    },
    {
      id: 'art-palestine-anti-imperialism',
      slug: 'palestine-liberation-and-anti-imperialist-front',
      title: 'প্যালেস্টাইন মুক্তি ও বিশ্ব সাম্রাজ্যবাদ-বিরোধী জনতার ফ্রন্ট',
      title_en: 'Palestine Liberation and the Global Anti-Imperialist United Front',
      deck: 'গাজার ধ্বংসস্তূপে আজ মানবজাতির বিবেকের পরীক্ষা। সাম্রাজ্যবাদী পশ্চিমা মদদের বিরুদ্ধে বিশ্বজুড়ে গড়ে উঠছে অভূতপূর্ব গণপ্রতিরোধ।',
      section: 'imperialism-geopolitics',
      section_name: 'সাম্রাজ্যবাদ ও বিশ্ব-রাজনীতি',
      author: 'আহমেদ হাসান ও রামিন খুরশিদ',
      author_role: 'মধ্যপ্রাচ্য ও সাম্রাজ্যবাদ বিষয়ক রাজনৈতিক গবেষক',
      author_bio: 'প্যালেস্টাইন সংহতি আন্দোলন ও এশিয়ান বামপন্থী ফোরামের যৌথ প্রতিবেদক।',
      author_photo_url: 'assets/images/img6.png',
      hero_img_url: 'assets/images/img6.png',
      hero_img_alt: 'প্যালেস্টাইনের পতাকাবাহী বিশাল আন্তর্জাতিক সংহতি সমাবেশ',
      hero_caption: 'উপনিবেশ ও বর্ণবাদের বিরুদ্ধে লড়াকু বিশ্বজনতার উত্তাল মিছিল।',
      hero_credit: 'গ্লোবাল সলিডারিটি আর্কাইভ',
      lang: 'bn',
      tags: 'প্যালেস্টাইন, সাম্রাজ্যবাদ, প্রতিরোধ, সংহতি, যুদ্ধাপরাধ',
      status: 'published',
      published_at: '2026-08-10T08:30:00.000Z',
      created_at: '2026-08-10T08:30:00.000Z',
      content_html: `
        <p class="lead-paragraph">প্যালেস্টাইনের সংগ্রাম কেবল একটি ভূখণ্ডের লড়াই নয়; এটি সমকালীন বিশ্বের সবচেয়ে মৌলিক উপনিবেশ-বিরোধী ও সাম্রাজ্যবাদ-বিরোধী সংগ্রাম। পশ্চিমা সাম্রাজ্যবাদ মধ্যপ্রাচ্যে তার ভূ-রাজনৈতিক আধিপত্য টিকিয়ে রাখতে জায়নবাদী বর্ণবাদী রাষ্ট্রকে অস্ত্র ও অর্থের যোগান দিয়ে যাচ্ছে। কিন্তু বিশ্বজুড়ে কোটি কোটি মেহনতি মানুষ রাজপথে নেমে এসে পরিষ্কার বার্তা দিয়েছে—এই গণহত্যার অবসান চাই।</p>
        
        <h2>আন্তর্জাতিক বয়কট ও শ্রমিকদের ভূমিকা</h2>
        <p>ইতালি ও ভারতের বন্দর শ্রমিকরা যখন অস্ত্রবাহী জাহাজে মালামাল তুলতে অস্বীকৃতি জানায়, তখন প্রমাণ হয় মেহনতি শ্রেণির সংহতির শক্তি। সাম্রাজ্যবাদের শিকল ভাঙতে হলে এই বৈশ্বিক সংহতি ফ্রন্টকে আরও সুসংগঠিত করতে হবে।</p>
      `
    }
  ];

  // Daily revolutionary quotes
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
      quote_bn: "আমরা এমন এক পৃথিবী গড়তে চাই যেখানে কেউ কারো ওপর প্রভুত্ব করবে না, শোষণের চির অবসান ঘটবে।",
      quote_en: "We must dare to invent the future and build a society free from human exploitation.",
      author: "টমাস সাঙ্কারা (Thomas Sankara)",
      source: "বুর্কিনা ফাসো বৈপ্লবিক পরিষদ"
    },
    {
      quote_bn: "ক্ষুধার রাজ্যে পৃথিবী গদ্যময়, পূর্ণিমা চাঁদ যেন ঝলসানো রুটি।",
      quote_en: "In the realm of hunger the earth is prosaic, the full moon is like charred bread.",
      author: "সুকান্ত ভট্টাচার্য (Sukanta Bhattacharya)",
      source: "ছাড়পত্র"
    },
    {
      quote_bn: "জালিমকে খতম না করা পর্যন্ত মজলুমের কোনো বিশ্রাম নাই।",
      quote_en: "There can be no rest for the oppressed until the oppressors are brought down.",
      author: "মওলানা আবদুল হামিদ খান ভাসানী (Maulana Bhashani)",
      source: "কাগমারী সম্মেলন ও ঐতিহাসিক ভাষণ"
    }
  ];

  // Expose to global window
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