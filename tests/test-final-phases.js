const fs = require('fs');
const path = require('path');
const assert = require('assert');

async function run() {
  console.log('======================================================');
  console.log(' THE WAY (দ্য ওয়ে) — Final Phases Automated Test Suite');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    try {
      fn();
      console.log(`  ✓ ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ ${name}`);
      console.error(`    Error: ${err.message}`);
      failed++;
    }
  }

  async function asyncTest(name, fn) {
    try {
      await fn();
      console.log(`  ✓ ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ ${name}`);
      console.error(`    Error: ${err.message}`);
      failed++;
    }
  }

  function mockRes() {
    return {
      statusCode: 200,
      headers: {},
      body: null,
      setHeader(k, v) { this.headers[k] = v; return this; },
      status(c) { this.statusCode = c; return this; },
      json(d) { this.body = d; return this; },
      send(d) { this.body = d; return this; },
      end(d) { if (d) this.body = d; return this; }
    };
  }

  // ── 1. Collaborative Translation Workspace (server/api/translations.ts) ──
  console.log('[1] Testing Collaborative Translation Workspace (server/api/translations.ts)...');
  const translationsHandlerMod = require('../server/api/translations');
  const translationsHandler = translationsHandlerMod.default || translationsHandlerMod;

  await asyncTest('GET /api/translations returns active translation projects and languages', async () => {
    const req = { method: 'GET', query: {}, headers: {} };
    const res = mockRes();
    await translationsHandler(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert(Array.isArray(res.body.projects), 'projects must be an array');
    assert(Array.isArray(res.body.languages), 'languages must be an array');
    assert(res.body.languages.length >= 8, 'must support at least 8 languages');
  });

  let testProjectId = null;
  await asyncTest('POST /api/translations (action=request) creates a new translation proposal', async () => {
    const req = {
      method: 'POST',
      query: { action: 'request' },
      body: {
        source_title: 'Imperialism and the World Economy',
        source_author: 'Nikolai Bukharin',
        source_lang: 'en',
        target_lang: 'bn',
        proposer_name: 'Comrade Joy',
        proposer_email: 'joy@theway-socialism.org',
        original_text: 'The concentration of capital reaches an unprecedented scale.'
      },
      headers: {}
    };
    const res = mockRes();
    await translationsHandler(req, res);
    assert.strictEqual(res.statusCode, 201);
    assert(res.body.project && res.body.project.id);
    assert.strictEqual(res.body.project.status, 'requested');
    testProjectId = res.body.project.id;
  });

  await asyncTest('POST /api/translations (action=claim) assigns project to translator', async () => {
    assert(testProjectId, 'testProjectId required');
    const req = {
      method: 'POST',
      query: { action: 'claim' },
      body: {
        project_id: testProjectId,
        translator_name: 'Sarkar Translator',
        translator_email: 'translator@theway-socialism.org'
      },
      headers: {}
    };
    const res = mockRes();
    await translationsHandler(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.project.status, 'in_progress');
    assert.strictEqual(res.body.project.translator_name, 'Sarkar Translator');
  });

  await asyncTest('POST /api/translations (action=save_draft) updates draft translation', async () => {
    assert(testProjectId, 'testProjectId required');
    const req = {
      method: 'POST',
      query: { action: 'save_draft' },
      body: {
        project_id: testProjectId,
        translated_text: 'পুঁজির কেন্দ্রীভবন এক অভূতপূর্ব মাত্রায় পৌঁছায়।',
        progress: 45
      },
      headers: {}
    };
    const res = mockRes();
    await translationsHandler(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.project.progress, 45);
    assert(res.body.project.translated_text.includes('পুঁজির কেন্দ্রীভবন'));
  });

  await asyncTest('POST /api/translations (action=publish) publishes translated work', async () => {
    assert(testProjectId, 'testProjectId required');
    const req = {
      method: 'POST',
      query: { action: 'publish' },
      body: {
        project_id: testProjectId,
        reviewer_notes: 'Verified against original Marxist economic manuscripts'
      },
      headers: {}
    };
    const res = mockRes();
    await translationsHandler(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.project.status, 'published');
  });

  // ── 2. Federation & Public Knowledge API (server/api/v1.ts) ───────────────
  console.log('\n[2] Testing Federation & Public Knowledge API (server/api/v1.ts)...');
  const federationHandlerMod = require('../server/api/v1');
  const federationHandler = federationHandlerMod.default || federationHandlerMod;

  await asyncTest('GET /api/v1?endpoint=manifest returns node metadata & protocol spec', async () => {
    const req = { method: 'GET', query: { endpoint: 'manifest' }, headers: {} };
    const res = mockRes();
    await federationHandler(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.federation, 'The Way Revolutionary Federation');
    assert(res.body.protocols.includes('ActivityPub-Lite'));
    assert(res.body.stats.works_count > 0);
  });

  await asyncTest('GET /api/v1?endpoint=resources returns catalog with TW-W-xxxx IDs', async () => {
    const req = { method: 'GET', query: { endpoint: 'resources' }, headers: {} };
    const res = mockRes();
    await federationHandler(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert(Array.isArray(res.body.resources));
    assert(res.body.resources.length > 0);
    assert(res.body.resources[0].federation_id.startsWith('TW-W-'));
  });

  await asyncTest('GET /api/v1?endpoint=resource&id=TW-W-000001 returns specific classic', async () => {
    const req = { method: 'GET', query: { endpoint: 'resource', id: 'TW-W-000001' }, headers: {} };
    const res = mockRes();
    await federationHandler(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert(res.body.resource.author.includes('মার্কস') || res.body.resource.author.includes('Marx'), 'Author must be Marx');
  });

  await asyncTest('GET /api/v1?endpoint=organizations returns collectives with TW-O-xxxx IDs', async () => {
    const req = { method: 'GET', query: { endpoint: 'organizations' }, headers: {} };
    const res = mockRes();
    await federationHandler(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert(Array.isArray(res.body.organizations));
    assert(res.body.organizations.length >= 8);
    assert(res.body.organizations[0].federation_id.startsWith('TW-O-'));
  });

  await asyncTest('POST /api/v1 ingests peer federated resource with TW-W ID', async () => {
    const req = {
      method: 'POST',
      query: {},
      body: {
        type: 'work',
        title: 'Socialist Dialectics of Nature',
        title_bn: 'প্রকৃতির দ্বান্দ্বিকতা',
        author: 'Friedrich Engels',
        year: 1883,
        languages: ['de', 'en', 'bn'],
        license: 'Public Domain'
      },
      headers: {}
    };
    const res = mockRes();
    await federationHandler(req, res);
    assert.strictEqual(res.statusCode, 201);
    assert(res.body.federation_id.startsWith('TW-W-'));
    assert.strictEqual(res.body.resource.author, 'Friedrich Engels');
  });

  await asyncTest('POST /api/v1 ingests peer trade union / organization with TW-O ID', async () => {
    const req = {
      method: 'POST',
      query: {},
      body: {
        type: 'organization',
        name: 'Sudanese Workers Trade Union Federation',
        name_bn: 'সুদান ওয়ার্কার্স ট্রেড ইউনিয়ন ফেডারেশন',
        country: 'Sudan',
        country_flag: '🇸🇩',
        org_type: 'trade_union',
        focus: ['Labor Rights', 'Anti-Imperialism']
      },
      headers: {}
    };
    const res = mockRes();
    await federationHandler(req, res);
    assert.strictEqual(res.statusCode, 201);
    assert(res.body.federation_id.startsWith('TW-O-'));
    assert.strictEqual(res.body.organization.country, 'Sudan');
  });

  // ── 3. Frontend Architecture & Next.js App Router Pages ───────────
  console.log('\n[3] Testing Frontend Pages & Integrity...');

  const requiredNextPages = [
    'app/translations/page.tsx',
    'app/organizations/page.tsx',
    'app/languages/page.tsx',
    'app/resource/[id]/page.tsx',
    'app/search/page.tsx',
    'app/solidarity/page.tsx',
    'app/feed/page.tsx',
    'app/groups/page.tsx',
    'app/profile/page.tsx'
  ];

  requiredNextPages.forEach(pagePath => {
    test(`Page ${pagePath} exists and has valid component structure`, () => {
      const p = path.join(__dirname, '..', pagePath);
      assert(fs.existsSync(p), `${pagePath} must exist in project`);
      const content = fs.readFileSync(p, 'utf8');
      assert(content.includes('export default'), `${pagePath} must have default export`);
      assert(content.length > 500, `${pagePath} must have rich content`);
    });
  });

  // ── 4. Routing & Components Verification ──────────────────────────
  console.log('\n[4] Testing Navigation & Routing Configuration...');

  test('vercel.json includes rewrites for translations, organizations, languages, and api/v1', () => {
    const vercelConfig = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'vercel.json'), 'utf8'));
    const rewrites = vercelConfig.rewrites || [];
    assert(rewrites.some(r => r.source === '/translations'), 'vercel.json missing /translations');
    assert(rewrites.some(r => r.source === '/organizations'), 'vercel.json missing /organizations');
    assert(rewrites.some(r => r.source === '/languages'), 'vercel.json missing /languages');
    assert(rewrites.some(r => r.source === '/api/v1/:path*'), 'vercel.json missing /api/v1/:path*');
  });

  test('components/Header.tsx & I18nProvider.tsx contain navigation and 11-language switcher', () => {
    const headerCode = fs.readFileSync(path.join(__dirname, '..', 'components', 'Header.tsx'), 'utf8');
    assert(headerCode.includes("href: '/translations'"), 'Header.tsx missing /translations link');
    assert(headerCode.includes("href: '/organizations'"), 'Header.tsx missing /organizations link');
    assert(headerCode.includes("href: '/languages'"), 'Header.tsx missing /languages link');

    const i18nCode = fs.readFileSync(path.join(__dirname, '..', 'components', 'I18nProvider.tsx'), 'utf8');
    assert(i18nCode.includes("ar: 'العربية'"), 'I18nProvider language modal must have Arabic');
    assert(i18nCode.includes("ja: '日本語'"), 'I18nProvider must support Japanese');
    assert(i18nCode.includes("ko: '한국어'"), 'I18nProvider must support Korean');
  });

  test('server/api/sitemap.ts includes all new routes in XML sitemap', async () => {
    const sitemapHandlerMod = require('../server/api/sitemap');
    const sitemapHandler = sitemapHandlerMod.default || sitemapHandlerMod;
    const req = { method: 'GET', query: {}, headers: { host: 'thewaysocialist.vercel.app' } };
    const res = mockRes();
    await sitemapHandler(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert(res.body.includes('<loc>https://thewaysocialist.vercel.app/translations</loc>'));
    assert(res.body.includes('<loc>https://thewaysocialist.vercel.app/organizations</loc>'));
    assert(res.body.includes('<loc>https://thewaysocialist.vercel.app/languages</loc>'));
  });

  console.log('\n======================================================');
  console.log(` RESULTS: ${passed} passed, ${failed} failed`);
  console.log('======================================================\n');

  if (failed > 0) process.exit(1);
}

run().catch(err => {
  console.error('[FATAL RUN ERROR]', err);
  process.exit(1);
});
