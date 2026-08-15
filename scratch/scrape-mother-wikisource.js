/**
 * scratch/scrape-mother-wikisource.js
 * Scrapes all chapters of "মা" (Mother) by Maxim Gorky (trans. Bimal Sen)
 * from Bengali Wikisource and inserts them into Supabase.
 *
 * Run: node scratch/scrape-mother-wikisource.js
 */

const https = require('https');
const { createClient } = require('@supabase/supabase-js');

// Load .env
const fs = require('fs');
const path = require('path');
const envFile = path.join(__dirname, '..', '.env');
if (fs.existsSync(envFile)) {
  fs.readFileSync(envFile, 'utf8').split(/\r?\n/).forEach(line => {
    const t = line.trim();
    if (t && !t.startsWith('#')) {
      const idx = t.indexOf('=');
      if (idx !== -1) {
        const k = t.slice(0, idx).trim();
        const v = t.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
        if (!process.env[k]) process.env[k] = v;
      }
    }
  });
}

const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

// ── Utility: fetch URL ────────────────────────────────────────────────────
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'TheWay-Scraper/1.0 (Educational Bengali Socialist Archive)' } }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchUrl(res.headers.location).then(resolve).catch(reject);
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
      res.on('error', reject);
    }).on('error', reject);
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── HTML Content Extractor ────────────────────────────────────────────────
function extractWikisourceText(html) {
  // Extract only the main article content area
  let content = '';

  // Get the mw-parser-output div content
  const parserMatch = html.match(/<div[^>]+class="[^"]*mw-parser-output[^"]*"[^>]*>([\s\S]*?)<\/div>\s*(?:<!--|\s*<div id="catlinks)/);
  if (parserMatch) {
    content = parserMatch[1];
  } else {
    // fallback: get all paragraphs between the main content markers
    const bodyMatch = html.match(/id="bodyContent"[^>]*>([\s\S]*?)id="footer"/);
    content = bodyMatch ? bodyMatch[1] : html;
  }

  // Remove navigation, header, style, and script blocks
  content = content
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<link[^>]*>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    // Remove page number spans (Wikisource page markers)
    .replace(/<span[^>]*class="[^"]*pagenum[^"]*"[^>]*>[\s\S]*?<\/span>/gi, '')
    .replace(/<span[^>]*class="[^"]*ws-noexport[^"]*"[^>]*>[\s\S]*?<\/span>/gi, '')
    // Remove header/footer navigation divs
    .replace(/<div[^>]+class="[^"]*wst-auxtoc[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')
    .replace(/<div[^>]+class="[^"]*ws-noexport[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')
    .replace(/<div[^>]+class="[^"]*printfooter[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')
    .replace(/<div[^>]+class="[^"]*catlinks[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')
    // Remove empty divs used as spacers
    .replace(/<div[^>]*class="[^"]*wst-nop[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')
    // Convert wikisource indent spans to proper HTML
    .replace(/<span style="display:inline-block; width:2em;"[^>]*>[\s\S]*?<\/span>/gi, '')
    // Clean up horizontal rules
    .replace(/<hr[^>]*class="[^"]*wst-rule[^"]*"[^>]*\/?>/gi, '<hr class="chapter-divider">')
    // Remove center div wrappers but keep content
    .replace(/<div[^>]+class="[^"]*wst-center[^"]*"[^>]*>([\s\S]*?)<\/div>/gi, '<div class="text-center">$1</div>')
    // Clean whitespace
    .replace(/\s{3,}/g, '\n\n')
    .trim();

  // Extract just the paragraphs and meaningful elements
  const paragraphs = [];
  const pMatches = content.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi);
  for (const m of pMatches) {
    const text = m[1]
      .replace(/<[^>]+>/g, '') // strip inner tags for content check
      .replace(/&nbsp;/g, ' ')
      .replace(/&#\d+;/g, '')
      .trim();
    if (text.length > 3) {
      // Keep original HTML paragraph
      let pHtml = m[0]
        .replace(/style="[^"]*"/gi, '') // remove inline styles
        .replace(/ class="[^"]*"/gi, '') // remove wikisource classes
        .replace(/<br\s*\/?>/gi, '<br>');
      paragraphs.push(pHtml.trim());
    }
  }

  if (paragraphs.length === 0) return null;
  return paragraphs.join('\n');
}

// ── Chapter definitions for "মা" ─────────────────────────────────────────
const BENGALI_NUMS_P1 = [
  'এক', 'দুই', 'তিন', 'চার', 'পাঁচ', 'ছয়', 'সাত', 'আট', 'নয়', 'দশ',
  'এগারো', 'বারো', 'তেরো', 'চোদ্দ', 'পনেরো', 'ষোল', 'সতেরো', 'আঠারো', 'উনিশ', 'কুড়ি'
];
const BENGALI_NUMS_P2 = [
  'এক', 'দুই', 'তিন', 'চার', 'পাঁচ', 'ছয়', 'সাত', 'আট', 'নয়', 'দশ',
  'এগারো', 'বারো', 'তেরো', 'চোদ্দ', 'পনেরো', 'ষোল'
];

// English ordinals for display
const EN_NUMS_P1 = ['One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten',
  'Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen','Twenty'];
const EN_NUMS_P2 = ['One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten',
  'Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen'];

const BASE_URL = 'https://bn.wikisource.org/wiki';
const BOOK_PATH = '%E0%A6%AE%E0%A6%BE_(%E0%A6%AE%E0%A7%8D%E0%A6%AF%E0%A6%BE%E0%A6%95%E0%A7%8D%E0%A6%B8%E0%A6%BF%E0%A6%AE_%E0%A6%97%E0%A7%8B%E0%A6%B0%E0%A7%8D%E0%A6%95%E0%A6%BF,_%E0%A6%AC%E0%A6%BF%E0%A6%AE%E0%A6%B2_%E0%A6%B8%E0%A7%87%E0%A6%A8)';
const PART1_PATH = '%E0%A6%AA%E0%A7%8D%E0%A6%B0%E0%A6%A5%E0%A6%AE_%E0%A6%96%E0%A6%A3%E0%A7%8D%E0%A6%A1';
const PART2_PATH = '%E0%A6%A6%E0%A7%8D%E0%A6%AC%E0%A6%BF%E0%A6%A4%E0%A7%80%E0%A6%AF%E0%A6%BC_%E0%A6%96%E0%A6%A3%E0%A7%8D%E0%A6%A1';

function encodeChapterNum(bn) {
  return encodeURIComponent(bn);
}

// Build chapter list
const ALL_CHAPTERS = [];
BENGALI_NUMS_P1.forEach((bn, i) => {
  ALL_CHAPTERS.push({
    chapterOrder: i + 1,
    chapterSlug: `part1-${i + 1}`,
    chapterNumber: `প্রথম খণ্ড — ${bn}`,
    titleBn: `প্রথম খণ্ড: পরিচ্ছেদ ${bn}`,
    titleEn: `Part I, Chapter ${EN_NUMS_P1[i]}`,
    url: `${BASE_URL}/${BOOK_PATH}/${PART1_PATH}/${encodeChapterNum(bn)}`
  });
});
BENGALI_NUMS_P2.forEach((bn, i) => {
  ALL_CHAPTERS.push({
    chapterOrder: 20 + i + 1,
    chapterSlug: `part2-${i + 1}`,
    chapterNumber: `দ্বিতীয় খণ্ড — ${bn}`,
    titleBn: `দ্বিতীয় খণ্ড: পরিচ্ছেদ ${bn}`,
    titleEn: `Part II, Chapter ${EN_NUMS_P2[i]}`,
    url: `${BASE_URL}/${BOOK_PATH}/${PART2_PATH}/${encodeChapterNum(bn)}`
  });
});

// ── Main Scraper ──────────────────────────────────────────────────────────
async function main() {
  console.log('🚀 Starting "মা" (Mother) Wikisource scraper...');
  console.log(`📚 Total chapters to scrape: ${ALL_CHAPTERS.length}`);

  // 1. Upsert book metadata
  console.log('\n[1/4] Inserting book metadata into Supabase...');
  const { data: bookData, error: bookErr } = await sb
    .from('books')
    .upsert({
      slug: 'maxim-gorky-mother-novel',
      title_bn: 'মা (উপন্যাস — সম্পূর্ণ সংস্করণ)',
      title_en: 'Mother (Complete Novel)',
      subtitle_bn: 'বলশেভিক মেহনতি মানুষের জাগরণের অমর আখ্যান (অনুবাদ: বিমল সেন, কলকাতা ১৯৫০)',
      subtitle_en: 'The Epic Socialist Masterpiece — Translated by Bimal Sen (1950)',
      author_bn: 'ম্যাক্সিম গোর্কি',
      author_en: 'Maxim Gorky',
      translator_bn: 'বিমল সেন',
      translator_en: 'Bimal Sen',
      year: '১৯০৬',
      category: 'literature',
      category_name_bn: 'বিপ্লবী সাহিত্য ও ধ্রুপদী উপন্যাস',
      cover_color: 'linear-gradient(135deg, #831843 0%, #be185d 50%, #c2182b 100%)',
      cover_icon: '🥀',
      summary_bn: 'বিশ্ব সাহিত্যের অবিসংবাদিত সমাজতান্ত্রিক মহা-উপন্যাস। ১৯০৫ সালের প্রথম রুশ বিপ্লবের অগ্নিগর্ভ পটভূমিতে সরমোভো কারখানার দাসত্ব থেকে শুরু করে এক অশিক্ষিত শ্রমিকের মায়ের নির্ভীক বিপ্লবী কমরেডে রূপান্তরের পূর্ণাঙ্গ আখ্যান।',
      famous_quote_bn: '"সত্যের আলো একবার মানুষের মনে জ্বলে উঠলে কোনো পুলিশ, চাবুক বা কারাগার দিয়ে তাকে আর নেভানো যায় না।"',
      famous_quote_en: '"Truth once kindled in a human soul cannot be extinguished by any police or prison."',
      reading_time_mins: 600,
      pages_count: 205,
      rating: 5.0,
      source_url: 'https://bn.wikisource.org/wiki/%E0%A6%AE%E0%A6%BE_(%E0%A6%AE%E0%A7%8D%E0%A6%AF%E0%A6%BE%E0%A6%95%E0%A7%8D%E0%A6%B8%E0%A6%BF%E0%A6%AE_%E0%A6%97%E0%A7%8B%E0%A6%B0%E0%A7%8D%E0%A6%95%E0%A6%BF,_%E0%A6%AC%E0%A6%BF%E0%A6%AE%E0%A6%B2_%E0%A6%B8%E0%A7%87%E0%A6%A8)',
      is_active: true
    }, { onConflict: 'slug' })
    .select()
    .single();

  if (bookErr) { console.error('❌ Book insert error:', bookErr.message); process.exit(1); }
  const bookId = bookData.id;
  console.log(`✅ Book inserted. ID: ${bookId}`);

  // 2. Scrape and insert chapters
  console.log('\n[2/4] Scraping chapters from Wikisource...');
  let successCount = 0;
  let failCount = 0;

  for (const ch of ALL_CHAPTERS) {
    console.log(`\n  📖 Chapter ${ch.chapterOrder}/${ALL_CHAPTERS.length}: ${ch.chapterNumber}`);
    console.log(`     URL: ${ch.url}`);

    try {
      // Fetch HTML
      await sleep(1200); // polite delay
      const html = await fetchUrl(ch.url);

      // Extract text
      const contentHtml = extractWikisourceText(html);
      if (!contentHtml || contentHtml.length < 50) {
        console.log(`  ⚠️  Skipped (no content extracted)`);
        failCount++;
        continue;
      }

      const wordCount = contentHtml.replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length;
      console.log(`     ✓ Extracted ${wordCount} words`);

      // Upsert chapter
      const { data: chapData, error: chapErr } = await sb
        .from('book_chapters')
        .upsert({
          book_id: bookId,
          chapter_order: ch.chapterOrder,
          chapter_slug: ch.chapterSlug,
          chapter_number: ch.chapterNumber,
          title_bn: ch.titleBn,
          title_en: ch.titleEn,
          source_url: ch.url,
          word_count: wordCount
        }, { onConflict: 'book_id,chapter_order' })
        .select()
        .single();

      if (chapErr) {
        console.error(`  ❌ Chapter DB error:`, chapErr.message);
        failCount++;
        continue;
      }
      const chapterId = chapData.id;

      // Split content into pages (~1200 words per page)
      const paragraphs = contentHtml.split('\n').filter(p => p.trim());
      const pages = [];
      let currentPage = [];
      let currentWords = 0;
      const PAGE_WORD_LIMIT = 1200;

      for (const para of paragraphs) {
        const paraWords = para.replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length;
        if (currentWords + paraWords > PAGE_WORD_LIMIT && currentPage.length > 0) {
          pages.push(currentPage.join('\n'));
          currentPage = [para];
          currentWords = paraWords;
        } else {
          currentPage.push(para);
          currentWords += paraWords;
        }
      }
      if (currentPage.length > 0) pages.push(currentPage.join('\n'));

      // Insert pages
      for (let pi = 0; pi < pages.length; pi++) {
        const pw = pages[pi].replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length;
        const { error: pageErr } = await sb
          .from('book_pages')
          .upsert({
            chapter_id: chapterId,
            book_id: bookId,
            page_number: pi + 1,
            content_html: pages[pi],
            word_count: pw
          }, { onConflict: 'chapter_id,page_number' });

        if (pageErr) {
          console.error(`  ❌ Page ${pi + 1} DB error:`, pageErr.message);
        }
      }
      console.log(`  ✅ Saved ${pages.length} page(s) for this chapter.`);
      successCount++;

    } catch (err) {
      console.error(`  ❌ Fetch error:`, err.message);
      failCount++;
    }
  }

  console.log('\n══════════════════════════════════════════');
  console.log(`🎉 Scraping complete!`);
  console.log(`   ✅ Success: ${successCount} chapters`);
  console.log(`   ❌ Failed:  ${failCount} chapters`);
  console.log('══════════════════════════════════════════\n');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
