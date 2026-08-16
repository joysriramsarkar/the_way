const https = require('https');

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

function cleanHtml(rawHtml) {
  // Remove scripts, styles, wikisource headers, footers, etc.
  let html = rawHtml
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<div itemscope=""[^>]*class="[^"]*wikisource-header-template[^"]*"[\s\S]*?<\/div>\s*<\/div>/gi, '')
    .replace(/<div class="footertemplate[\s\S]*?<\/div>\s*<\/div>/gi, '')
    .replace(/<span class="pagenum[^>]*>[\s\S]*?<\/span>/gi, '')
    .replace(/<span class="ws-noexport[^>]*>[\s\S]*?<\/span>/gi, '')
    .replace(/<div[^>]+class="[^"]*ws-noexport[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');

  const pMatches = [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)];
  const paras = [];
  for (const m of pMatches) {
    let pContent = m[1]
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<span class="pagenum[^>]*>[\s\S]*?<\/span>/gi, '')
      .replace(/<span class="ws-noexport[^>]*>[\s\S]*?<\/span>/gi, '')
      .trim();

    const plainText = pContent.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
    if (plainText.length > 3) {
      paras.push(`<p>${pContent}</p>`);
    }
  }

  return paras.join('\n');
}

async function test() {
  const page = 'পথের_দাবী_(শরৎচন্দ্র_চট্টোপাধ্যায়,_১৯৫৮)/১';
  const url = `https://bn.wikisource.org/w/api.php?action=parse&page=${encodeURIComponent(page)}&format=json&prop=text`;
  console.log('Fetching:', url);
  const data = await fetchJson(url);
  if (data.error) {
    console.error('Error:', data.error);
    return;
  }
  const clean = cleanHtml(data.parse.text['*']);
  console.log('Total characters extracted:', clean.length);
  console.log('Sample content (first 800 chars):');
  console.log(clean.slice(0, 800));
}

test();
