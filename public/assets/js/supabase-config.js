/**
 * THE WAY (দ্য ওয়ে) — Supabase Configuration & Resilient Fallback Engine
 * International Socialist Editorial & Movement Portal
 * Curated Articles & Foundational Texts: Marx, Engels, Lenin, Stalin, Mao Zedong, Gramsci
 */

(function(window) {
  'use strict';

  const DEFAULT_SUPABASE_URL = 'https://gyhkpjjwwiakhpdqatuh.supabase.co';
  const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_I0VMIhMDmPpuLH0MpEvaKA_c_vDrRSV';

  const SUPABASE_URL = window.SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

  let _client = null;
  function getSupabaseClient() {
    if (_client) return _client;
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
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
    { name: 'তত্ত্ব ও দর্শন', name_en: 'Theory & Philosophy', slug: 'theory-philosophy', admin_id: 'theory-philosophy', display_order: 1, is_active: true, locked: false, subtitle: 'মার্ক্সীয় দ্বন্দ্ববাদ, ঐতিহাসিক বস্তুবাদ, লেনিনবাদ ও মুক্তিদর্শন' },
    { name: 'সাম্রাজ্যবাদ ও বিশ্ব-রাজনীতি', name_en: 'Imperialism & Geopolitics', slug: 'imperialism-geopolitics', admin_id: 'imperialism-geopolitics', display_order: 2, is_active: true, locked: false, subtitle: 'নব্য-সাম্রাজ্যবাদী আগ্রাসন, গ্লোবাল সাউথ প্রতিরোধ ও প্যালেস্টাইন সংহতি' },
    { name: 'শ্রম ও গণসংগ্রাম', name_en: 'Labor & Peasant Movements', slug: 'labor-peasant', admin_id: 'labor-peasant', display_order: 3, is_active: true, locked: false, subtitle: 'শ্রমিক ধর্মঘট, কৃষক জাগরণ, গিগ-শ্রমিক প্রতিরোধ ও ট্রেড ইউনিয়ন আন্দোলন' },
    { name: 'রাজনৈতিক অর্থনীতি', name_en: 'Political Economy', slug: 'political-economy', admin_id: 'political-economy', display_order: 4, is_active: true, locked: false, subtitle: 'নব্য-উদারবাদের সংকট, উদ্বৃত্ত মূল্য ও সমাজতান্ত্রিক অর্থনীতির বিকল্প' },
    { name: 'সংস্কৃতি ও বিপ্লব', name_en: 'Culture & Revolution', slug: 'culture-revolution', admin_id: 'culture-revolution', display_order: 5, is_active: true, locked: false, subtitle: 'মহান সর্বহারা সাংস্কৃতিক বিপ্লব, বিপ্লবী শিল্প-সাহিত্য ও প্রতি-আধিপত্য' },
    { name: 'ইশতেহার ও দলিল', name_en: 'Manifestos & Archives', slug: 'manifestos-archives', admin_id: 'manifestos-archives', display_order: 6, is_active: true, locked: false, subtitle: 'ঐতিহাসিক কমিউনিস্ট ঘোষণাপত্র, পার্টি দলিল ও বৈপ্লবিক রণনীতি' }
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
      author_photo_url: 'assets/images/img1.webp',
      hero_img_url: 'assets/images/img1.webp',
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
        <p>নব্য-উদারবাদী বিশ্বায়নের যে মোহময় মিথ্যা গত চার দশক ধরে বাজার অর্থনীতি প্রচার করেছিল, তা আজ ধসে পড়েছে। ওয়াশিংটন কনসেনসাস ও সাম্রাজ্যবাদী আর্থিক প্রতিষ্ঠানগুলো গ্লোবাল সাউথের দেশগুলোকে ঋণের ফাঁদে ফেলে তাদের সার্বভৌমত্ব কেড়ে নিয়েছে।</p>

        <blockquote class="featured-quote">
          <p>“সাম্রাজ্যবাদ কেবল ভৌগোলিক দখলদারিত্ব নয়; এটি হলো পুঁজির বিশ্বজনীন একচেটিয়া শোষণ কাঠামো, যা মানুষের শ্রম ও প্রকৃতির রক্ত শুষে নিয়ে গুটিকয়েক করপোরেট সাম্রাজ্য গড়ে তোলে।”</p>
          <cite>— দ্য ওয়ে ইশতেহার, ২০২৬</cite>
        </blockquote>

        <h2>২. মার্ক্স, লেনিন ও সমাজতান্ত্রিক বিপ্লবের উত্তরাধিকার</h2>
        <p>কার্ল মার্ক্স ও ফ্রিডরিখ এঙ্গেলসের বৈজ্ঞানিক সমাজতন্ত্র, লেনিনের সাম্রাজ্যবাদ ও রাষ্ট্রতত্ত্ব, স্ট্যালিনের সমাজতান্ত্রিক নির্মাণ ও পার্টি কাঠামোর বিকাশ, এবং মাও সেতুং-এর সাংস্কৃতিক বিপ্লব ও গণলাইন—এই সমস্ত ঐতিহাসিক অভিজ্ঞতাকে ধারণ করেই আমাদের একবিংশ শতাব্দীর নতুন সমাজতান্ত্রিক বিকল্পের রূপরেখা নির্মাণ করতে হবে।</p>
      `
    },
    {
      id: 'art-stalin-problems-leninism',
      slug: 'stalin-problems-of-leninism-contemporary-relevance',
      title: 'স্ট্যালিনের ‘Problems of Leninism’ ও সমাজতান্ত্রিক নির্মাণের ঐতিহাসিক প্রাসঙ্গিকতা',
      title_en: 'Stalin’s Problems of Leninism & The Construction of Socialist Society',
      deck: 'সাম্রাজ্যবাদী ঘেরাওয়ের মুখে প্রলেতারীয় একনায়কত্ব রক্ষা, পার্টি শৃঙ্খলা এবং কৃষক-শ্রমিক মৈত্রীর দ্বান্দ্বিক পাঠ।',
      section: 'theory-philosophy',
      section_name: 'তত্ত্ব ও দর্শন',
      author: 'প্রফেসর অমিত দাশগুপ্ত',
      author_role: 'সোভিয়েত ইতিহাস ও মার্ক্সীয় দর্শন গবেষক',
      author_bio: 'সমাজতান্ত্রিক রূপান্তর ও বিশ শতকের বলশেভিক ইতিহাস বিশেষজ্ঞ।',
      author_photo_url: 'assets/images/img2.webp',
      hero_img_url: 'assets/images/img2.webp',
      hero_img_alt: 'লেনিন ও স্ট্যালিনের তাত্ত্বিক দলিল',
      hero_caption: 'লেনিনবাদের সমস্যাবলি: সাম্রাজ্যবাদের যুগে সর্বহারা বিপ্লবের বিজ্ঞান।',
      hero_credit: 'দ্য ওয়ে ইতিহাস আর্কাইভ',
      lang: 'bn',
      tags: 'স্ট্যালিন, লেনিনবাদ, সমাজতন্ত্র, পার্টি, প্রলেতারিয়েত',
      status: 'published',
      published_at: '2026-08-15T08:00:00.000Z',
      created_at: '2026-08-15T08:00:00.000Z',
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
      id: 'art-mao-cultural-revolution',
      slug: 'mao-cultural-revolution-and-continuing-revolution',
      title: 'মাও সেতুং, সাংস্কৃতিক বিপ্লব এবং সমাজতন্ত্রের ভেতর বুর্জোয়া ভাবাদর্শের বিরুদ্ধে লড়াই',
      title_en: 'Mao Zedong, The Cultural Revolution and Ideological Struggle Under Socialism',
      deck: 'ক্ষমতা দখলের পরও কেন বুর্জোয়া সংস্কৃতি ও আমলাতন্ত্রের বিরুদ্ধে গণমানুষের সার্বক্ষণিক সাংস্কৃতিক বিপ্লব অনিবার্য?',
      section: 'culture-revolution',
      section_name: 'সংস্কৃতি ও বিপ্লব',
      author: 'ড. তানভীর হাসান',
      author_role: 'রাজনৈতিক তাত্ত্বিক ও লেখক',
      author_bio: 'চীনা সমাজতান্ত্রিক ইতিহাস ও মাওবাদী দ্বন্দ্বতত্ত্ব গবেষক।',
      author_photo_url: 'assets/images/img3.webp',
      hero_img_url: 'assets/images/img3.webp',
      hero_img_alt: 'সাংস্কৃতিক বিপ্লবের ব্যানার ও গণসমাবেশ',
      hero_caption: 'সমাজতন্ত্রের অভ্যন্তরে অব্যাহত বিপ্লবের আহ্বান।',
      hero_credit: 'পিপলস আর্ট কালেকশন',
      lang: 'bn',
      tags: 'মাও সেতুং, সাংস্কৃতিক বিপ্লব, দ্বন্দ্বতত্ত্ব, সমাজতন্ত্র, আমলাতন্ত্র',
      status: 'published',
      published_at: '2026-08-14T18:00:00.000Z',
      created_at: '2026-08-14T18:00:00.000Z',
      content_html: `
        <p class="lead-paragraph">মাও সেতুং মার্ক্সবাদী দর্শনে যে মৌলিক সংযোজনটি করেছিলেন, তা হলো সমাজতান্ত্রিক সমাজে শ্রেণি সংগ্রামের অনিবার্যতা। উৎপাদন উপায়ের ওপর ব্যক্তিগত মালিকানা বিলোপ করলেই স্বয়ংক্রিয়ভাবে বুর্জোয়া চিন্তার অবসান ঘটে না। পুরোনো সমাজের মূল্যবোধ ও স্বার্থপরতা দীর্ঘদিন মানুষের অবচেতনে রয়ে যায়।</p>

        <blockquote class="featured-quote">
          <p>“বুর্জোয়াদের রাজনৈতিক ক্ষমতা কেড়ে নেওয়ার পরও তাদের সাংস্কৃতিক আধিপত্যকে ভাঙতে না পারলে সমাজতন্ত্র ভেতর থেকেই ধসে পড়বে।”</p>
          <cite>— মাও সেতুং, ১৯৬৬</cite>
        </blockquote>
      `
    },
    {
      id: 'art-marx-engels-capital',
      slug: 'marx-das-kapital-and-surplus-value-theory',
      title: 'কার্ল মার্ক্স ও ‘পুঁজি’: উদ্বৃত্ত মূল্য এবং আধুনিক পুঁজিবাদী শোষণের স্বরূপ',
      title_en: 'Karl Marx and Das Kapital: The Theory of Surplus Value and Modern Exploitation',
      deck: 'কীভাবে শ্রমিকের শ্রম চুরি করে পুঁজিপতিরা পাহাড়সম সম্পদের মালিক হয়—মার্ক্সীয় অর্থনীতির অকাট্য ব্যবচ্ছেদ।',
      section: 'political-economy',
      section_name: 'রাজনৈতিক অর্থনীতি',
      author: 'ড. সৌমিক রায়হান',
      author_role: 'রাজনৈতিক অর্থনীতিবিদ',
      author_bio: 'মার্ক্সীয় অর্থনীতি ও নব্য-উদারবাদ গবেষক।',
      author_photo_url: 'assets/images/img4.webp',
      hero_img_url: 'assets/images/img4.webp',
      hero_img_alt: 'কার্ল মার্ক্সের প্রতিকৃতি ও ডাস ক্যাপিটালের পান্ডুলিপি',
      hero_caption: 'পুঁজিবাদী ব্যবস্থার বৈজ্ঞানিক ব্যবচ্ছেদ।',
      hero_credit: 'দ্য ওয়ে থিওরি আর্কাইভ',
      lang: 'bn',
      tags: 'মার্ক্স, ক্যাপিটাল, উদ্বৃত্ত মূল্য, পুঁজিবাদ, শ্রম',
      status: 'published',
      published_at: '2026-08-14T12:00:00.000Z',
      created_at: '2026-08-14T12:00:00.000Z',
      content_html: `
        <p class="lead-paragraph">১৮৬৭ সালে কার্ল মার্ক্সের ‘ডাস ক্যাপিটাল’ (পুঁজি) প্রকাশিত হওয়ার পর মানব সমাজ প্রথম জানতে পারল পুঁজিপতিদের মুনাফার আসল গোপন রহস্য। পুঁজিপতি কোনো জাদু দিয়ে ধনী হয় না; সে শ্রমিককে তার শ্রমের পূর্ণ মূল্য না দিয়ে উদ্বৃত্ত শ্রম আত্মসাৎ করে।</p>
      `
    },
    {
      id: 'art-lenin-imperialism-state',
      slug: 'lenin-state-and-revolution-imperialism',
      title: 'লেনিন: ‘রাষ্ট্র ও বিপ্লব’ এবং ‘সাম্রাজ্যবাদ: পুঁজিবাদের সর্বোচ্চ পর্যায়’',
      title_en: 'Lenin: The State and Revolution & Imperialism the Highest Stage of Capitalism',
      deck: 'আমলাতান্ত্রিক রাষ্ট্রযন্ত্রের শ্রেণি-চরিত্র ও একচেটিয়া লগ্নী পুঁজির বৈশ্বিক আগ্রাসনের বিরুদ্ধে সমাজতান্ত্রিক বিকল্প।',
      section: 'manifestos-archives',
      section_name: 'ইশতেহার ও দলিল',
      author: 'আহমেদ হাসান',
      author_role: 'আন্তর্জাতিক সম্পর্ক বিশ্লেষক',
      author_bio: 'লেনিনবাদী পররাষ্ট্রনীতি ও সাম্রাজ্যবাদ বিরোধী আন্দোলন বিশেষজ্ঞ।',
      author_photo_url: 'assets/images/img5.webp',
      hero_img_url: 'assets/images/img5.webp',
      hero_img_alt: 'ভ্লাদিমির লেনিনের বক্তৃতা ও ১৯১৭ বিপ্লব',
      hero_caption: 'বলশেভিক বিপ্লব ও মেহনতি মানুষের রাষ্ট্র গঠন।',
      hero_credit: 'অক্টোবর বিপ্লব মহাফেজখানা',
      lang: 'bn',
      tags: 'লেনিন, রাষ্ট্র ও বিপ্লব, সাম্রাজ্যবাদ, বলশেভিক, বিপ্লব',
      status: 'published',
      published_at: '2026-08-13T15:00:00.000Z',
      created_at: '2026-08-13T15:00:00.000Z',
      content_html: `
        <p class="lead-paragraph">লেনিনের দুটি কালজয়ী কাজ বিশ শতকের গতিপথ পাল্টে দিয়েছিল। একটিতে তিনি দেখিয়েছেন কেন রাষ্ট্র কোনো নিরপেক্ষ মধ্যস্থতাকারী নয় বরং বুর্জোয়া শোষণের হাতিয়ার; অন্যটিতে দেখিয়েছেন কেন একচেটিয়া লগ্নী পুঁজির আধিপত্য বিশ্বযুদ্ধ ও উপনিবেশবাদের জন্ম দেয়।</p>
      `
    }
  ];

  // Helper APIs for components and pages
  window.THE_WAY_CONFIG = {
    supabaseUrl: SUPABASE_URL,
    supabaseAnonKey: SUPABASE_ANON_KEY,
    getClient: getSupabaseClient,
    defaultSections: DEFAULT_SECTIONS,
    defaultArticles: DEFAULT_ARTICLES,
    async fetchArticles(sectionSlug) {
      const sb = getSupabaseClient();
      if (sb) {
        try {
          let query = sb.from('articles').select('*').eq('status', 'published').order('published_at', { ascending: false });
          if (sectionSlug && sectionSlug !== 'all') {
            query = query.eq('section', sectionSlug);
          }
          const { data, error } = await query;
          if (!error && Array.isArray(data) && data.length > 0) return data;
        } catch (e) {}
      }
      if (sectionSlug && sectionSlug !== 'all') {
        return DEFAULT_ARTICLES.filter(a => a.section === sectionSlug);
      }
      return DEFAULT_ARTICLES;
    },
    async fetchArticleBySlug(slug) {
      const sb = getSupabaseClient();
      if (sb) {
        try {
          const { data, error } = await sb.from('articles').select('*').eq('slug', slug).maybeSingle();
          if (!error && data) return data;
        } catch (e) {}
      }
      return DEFAULT_ARTICLES.find(a => a.slug === slug) || null;
    }
  };

})(typeof window !== 'undefined' ? window : this);