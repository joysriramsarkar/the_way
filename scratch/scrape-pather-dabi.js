/**
 * scratch/scrape-pather-dabi.js
 * Scrapes all 31 chapters of "পথের দাবী" (Pather Dabi) by Sarat Chandra Chattopadhyay
 * from Bengali Wikisource and writes to assets/js/books/pather-dabi.json,
 * and also syncs with Supabase if configured in .env.
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Load .env
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

let sb = null;
if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
  try {
    const { createClient } = require('@supabase/supabase-js');
    sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
  } catch (e) {
    console.warn('Supabase client not loaded:', e.message);
  }
}

const BENGALI_NUMS = [
  '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯', '১০',
  '১১', '১২', '১৩', '১৪', '১৫', '১৬', '১৭', '১৮', '১৯', '২০',
  '২১', '২২', '২৩', '২৪', '২৫', '২৬', '২৭', '২৮', '২৯', '৩০', '৩১'
];

const BENGALI_WORDS = [
  'প্রথম পরিচ্ছেদ', 'দ্বিতীয় পরিচ্ছেদ', 'তৃতীয় পরিচ্ছেদ', 'চতুর্থ পরিচ্ছেদ', 'পঞ্চম পরিচ্ছেদ',
  'ষষ্ঠ পরিচ্ছেদ', 'সপ্তম পরিচ্ছেদ', 'অষ্টম পরিচ্ছেদ', 'নবম পরিচ্ছেদ', 'দশম পরিচ্ছেদ',
  'একাদশ পরিচ্ছেদ', 'দ্বাদশ পরিচ্ছেদ', 'ত্রয়োদশ পরিচ্ছেদ', 'চতুর্দশ পরিচ্ছেদ', 'পঞ্চদশ পরিচ্ছেদ',
  'ষোড়শ পরিচ্ছেদ', 'সপ্তদশ পরিচ্ছেদ', 'অষ্টাদশ পরিচ্ছেদ', 'ঊনবিংশ পরিচ্ছেদ', 'বিংশ পরিচ্ছেদ',
  'একবিংশ পরিচ্ছেদ', 'দ্বাবিংশ পরিচ্ছেদ', 'ত্রয়োবিংশ পরিচ্ছেদ', 'চতুর্বিংশ পরিচ্ছেদ', 'পঞ্চবিংশ পরিচ্ছেদ',
  'ষড়বিংশ পরিচ্ছেদ', 'সপ্তবিংশ পরিচ্ছেদ', 'অষ্টাবিংশ পরিচ্ছেদ', 'ঊনত্রিংশ পরিচ্ছেদ', 'ত্রিংশ পরিচ্ছেদ', 'একত্রিংশ পরিচ্ছেদ'
];

const EN_WORDS = [
  'Chapter 1', 'Chapter 2', 'Chapter 3', 'Chapter 4', 'Chapter 5',
  'Chapter 6', 'Chapter 7', 'Chapter 8', 'Chapter 9', 'Chapter 10',
  'Chapter 11', 'Chapter 12', 'Chapter 13', 'Chapter 14', 'Chapter 15',
  'Chapter 16', 'Chapter 17', 'Chapter 18', 'Chapter 19', 'Chapter 20',
  'Chapter 21', 'Chapter 22', 'Chapter 23', 'Chapter 24', 'Chapter 25',
  'Chapter 26', 'Chapter 27', 'Chapter 28', 'Chapter 29', 'Chapter 30', 'Chapter 31'
];

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'TheWay-Scraper/1.0 (Educational Bengali Archive; mailto:admin@theway.org)' } }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
      res.on('error', reject);
    }).on('error', reject);
  });
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function cleanHtml(rawHtml) {
  let html = rawHtml
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<div itemscope=""[^>]*class="[^"]*wikisource-header-template[^"]*"[\s\S]*?<\/div>\s*<\/div>/gi, '')
    .replace(/<div class="footertemplate[\s\S]*?<\/div>\s*<\/div>/gi, '')
    .replace(/<span class="pagenum[^>]*>[\s\S]*?<\/span>/gi, '')
    .replace(/<span class="ws-noexport[^>]*>[\s\S]*?<\/span>/gi, '')
    .replace(/<div[^>]+class="[^"]*ws-noexport[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')
    .replace(/<span style="display:inline-block;\s*width:\s*2em;?"[^>]*>[\s\S]*?<\/span>/gi, '')
    .replace(/&#160;/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/<!--[\s\S]*?-->/g, '');

  const pMatches = [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)];
  const paras = [];

  for (let i = 0; i < pMatches.length; i++) {
    let pContent = pMatches[i][1]
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<span class="pagenum[^>]*>[\s\S]*?<\/span>/gi, '')
      .replace(/<span class="ws-noexport[^>]*>[\s\S]*?<\/span>/gi, '')
      .replace(/<span style="display:inline-block;\s*width:\s*2em;?"[^>]*>[\s\S]*?<\/span>/gi, '')
      .replace(/&#160;/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .trim();

    const plainText = pContent.replace(/<[^>]+>/g, '').trim();
    if (plainText.length > 2) {
      if (i === 0 && paras.length === 0) {
        paras.push(`<p class="lead-text">${pContent}</p>`);
      } else {
        paras.push(`<p>${pContent}</p>`);
      }
    }
  }

  return paras.join('\n');
}

async function scrapeAll() {
  console.log('🚀 Starting "পথের দাবী" (Pather Dabi) scraper...');
  const chaptersData = [];

  for (let i = 0; i < BENGALI_NUMS.length; i++) {
    const numBn = BENGALI_NUMS[i];
    const wordBn = BENGALI_WORDS[i];
    const wordEn = EN_WORDS[i];
    const pageTitle = `পথের_দাবী_(শরৎচন্দ্র_চট্টোপাধ্যায়,_১৯৫৮)/${numBn}`;
    const url = `https://bn.wikisource.org/w/api.php?action=parse&page=${encodeURIComponent(pageTitle)}&format=json&prop=text`;

    console.log(`[${i + 1}/31] Fetching: ${wordBn} (${pageTitle})...`);

    try {
      await sleep(350);
      const res = await fetchJson(url);
      if (res.error) {
        console.error(`❌ Error fetching ${numBn}:`, res.error);
        continue;
      }

      const contentHtml = cleanHtml(res.parse.text['*']);
      const wordCount = contentHtml.replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length;
      console.log(`   ✓ Extracted: ${wordCount} words (${contentHtml.length} chars)`);

      chaptersData.push({
        id: `pather-dabi-ch${i + 1}`,
        chapter_order: i + 1,
        number: wordBn,
        chapter_number: wordBn,
        title_bn: `${wordBn}`,
        title_en: wordEn,
        source_url: `https://bn.wikisource.org/wiki/${encodeURIComponent('পথের_দাবী_(শরৎচন্দ্র_চট্টোপাধ্যায়,_১৯৫৮)')}/${encodeURIComponent(numBn)}`,
        word_count: wordCount,
        content_html: contentHtml
      });
    } catch (e) {
      console.error(`❌ Failed chapter ${numBn}:`, e.message);
    }
  }

  console.log(`\n📚 Total chapters scraped successfully: ${chaptersData.length}/31`);

  // Write to local json file
  const outPath = path.join(__dirname, '..', 'assets', 'js', 'books', 'pather-dabi.json');
  fs.writeFileSync(outPath, JSON.stringify(chaptersData, null, 2), 'utf8');
  console.log(`✅ Saved complete JSON to ${outPath} (${(fs.statSync(outPath).size / 1024).toFixed(1)} KB)`);

  // If Supabase is available, sync to DB as well
  if (sb) {
    console.log('\n🔄 Syncing with Supabase database...');
    try {
      const bookPayload = {
        slug: 'pather-dabi',
        title_bn: 'পথের দাবী (উপন্যাস — সম্পূর্ণ সংস্করণ)',
        title_en: 'Pather Dabi (The Demand of the Road — Novel)',
        subtitle_bn: 'ব্রিটিশ সাম্রাজ্যবাদবিরোধী বিপ্লবী দল, ডাক্তার সব্যসাচী ও অমর মুক্তি সংগ্রাম (১৯২৬ / ১৯৫৮ সংস্করণ)',
        subtitle_en: 'Sarat Chandra Chattopadhyay’s Banned Anti-Imperialist Revolutionary Classic (1926)',
        author_bn: 'শরৎচন্দ্র চট্টোপাধ্যায়',
        author_en: 'Sarat Chandra Chattopadhyay',
        year: '১৯২৬',
        category: 'literature',
        category_name_bn: 'বিপ্লবী সাহিত্য ও ধ্রুপদী উপন্যাস',
        cover_color: 'linear-gradient(135deg, #7c2d12 0%, #c2410c 50%, #991b1b 100%)',
        cover_icon: '🔥',
        summary_bn: 'বাংলা সাহিত্যের অবিসংবাদিত রাজদ্রোহী বিপ্লবী উপন্যাস। পরাধীন ভারতবর্ষে সশস্ত্র বিপ্লবের মাধ্যমে ব্রিটিশ শাসন উচ্ছেদ করার শপথ নেওয়া গুপ্ত বিপ্লবী দল ‘পথের দাবী’, তাদের অবিস্মরণীয় নেতা ডাক্তার সব্যসাচী, অপূর্ব, ভারতী ও সুমিত্রার আত্মত্যাগ ও রাজনৈতিক দ্বন্দ্বের কালজয়ী মহা-আখ্যান। ব্রিটিশ সরকার প্রকাশের পরপরই বইটি বাজেয়াপ্ত ও নিষিদ্ধ করেছিল।',
        summary_en: 'Sarat Chandra Chattopadhyay’s legendary banned revolutionary masterpiece chronicling Sabyasachi, the enigmatic leader of the underground anti-colonial revolutionary movement Pather Dabi.',
        famous_quote_bn: '“দেশের স্বাধীনতা মানুষের সবচেয়ে বড় অধিকার। যে জাতি দাসত্ব মেনে নেয়, সে জাতির বেঁচে থাকার কোনো অধিকার নেই।”',
        famous_quote_en: '“Freedom is the supreme right of human existence; no law above conscience can justify the subjugation of a people.”',
        reading_time_mins: 360,
        pages_count: chaptersData.length,
        rating: 5.0,
        source_url: 'https://bn.wikisource.org/wiki/%E0%A6%AA%E0%A6%A5%E0%A7%87%E0%A6%B0_%E0%A6%A6%E0%A6%BE%E0%A6%AC%E0%A7%80_(%E0%A6%B6%E0%A6%B0%E0%A7%8E%E0%A6%9A%E0%A6%A8%E0%A7%8D%E0%A6%A6%E0%A7%8D%E0%A6%B0_%E0%A6%9A%E0%A6%9F%E0%A7%8B%E0%A6%AA%E0%A6%BE%E0%A6%A7%E0%A7%8D%E0%A6%AF%E0%A6%BE%E0%A6%AF%E0%A6%BC,_%E0%A7%A7%E0%A7%AF%E0%A7%AB%E0%A7%AE)',
        is_active: true
      };

      const { data: bookData, error: bookErr } = await sb
        .from('books')
        .upsert(bookPayload, { onConflict: 'slug' })
        .select()
        .single();

      if (bookErr) {
        console.error('❌ Supabase book error:', bookErr.message);
      } else {
        const bookId = bookData.id;
        console.log(`✅ Upserted book in Supabase (ID: ${bookId})`);

        for (const ch of chaptersData) {
          const { data: cData, error: cErr } = await sb
            .from('book_chapters')
            .upsert({
              book_id: bookId,
              chapter_order: ch.chapter_order,
              chapter_slug: `chapter-${ch.chapter_order}`,
              chapter_number: ch.number,
              title_bn: ch.title_bn,
              title_en: ch.title_en,
              source_url: ch.source_url,
              word_count: ch.word_count
            }, { onConflict: 'book_id,chapter_order' })
            .select()
            .single();

          if (cErr) {
            console.error(`  ❌ Chapter ${ch.chapter_order} DB error:`, cErr.message);
            continue;
          }

          // Split into pages (~1200 words)
          const paragraphs = ch.content_html.split('\n').filter(p => p.trim());
          const pages = [];
          let curPage = [];
          let curWords = 0;
          for (const para of paragraphs) {
            const pw = para.replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length;
            if (curWords + pw > 1200 && curPage.length > 0) {
              pages.push(curPage.join('\n'));
              curPage = [para];
              curWords = pw;
            } else {
              curPage.push(para);
              curWords += pw;
            }
          }
          if (curPage.length > 0) pages.push(curPage.join('\n'));

          for (let pIdx = 0; pIdx < pages.length; pIdx++) {
            const pageWordCount = pages[pIdx].replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length;
            await sb.from('book_pages').upsert({
              chapter_id: cData.id,
              book_id: bookId,
              page_number: pIdx + 1,
              content_html: pages[pIdx],
              word_count: pageWordCount
            }, { onConflict: 'chapter_id,page_number' });
          }
        }
        console.log('✅ Supabase chapters and pages sync complete!');
      }
    } catch (dbErr) {
      console.error('Supabase sync error:', dbErr.message);
    }
  }

  console.log('\n🎉 Finished scraping and integrating "পথের দাবী"!');
}

scrapeAll().catch(e => console.error('Fatal:', e));
