const fs = require('fs');
const path = require('path');

async function runTests() {
  console.log('====================================================');
  console.log('  TESTING THE WAY — PHASE 2 & 3 IMPLEMENTATION');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, name, details = '') {
    if (condition) {
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${name} — ${details}`);
      failed++;
    }
  }

  // ── 1. TEST LOCALES JSON VALIDITY ─────────────────────────────────
  const locales = ['bn', 'en', 'es', 'hi', 'ar', 'pt', 'fr'];
  for (const loc of locales) {
    try {
      const p = path.join(__dirname, '..', 'public', 'locales', `${loc}.json`);
      const raw = fs.readFileSync(p, 'utf8');
      const parsed = JSON.parse(raw);
      assert(Object.keys(parsed).length > 20, `Locale ${loc}.json valid and loaded (${Object.keys(parsed).length} keys)`);
    } catch (e) {
      assert(false, `Locale ${loc}.json`, e.message);
    }
  }

  // ── 2. TEST WIKIDATA CONCEPT CONNECTOR ────────────────────────────
  const wikidata = require('../api/_connectors/wikidata');
  const conceptBn = wikidata.findConcept('সাম্রাজ্যবাদ');
  assert(conceptBn && conceptBn.canonical === 'imperialism', 'Wikidata findConcept (Bengali -> Imperialism)');

  const conceptEn = wikidata.findConcept('surplus value');
  assert(conceptEn && conceptEn.labels.bn === 'উদ্বৃত্ত মূল্য', 'Wikidata findConcept (English -> Surplus Value)');

  const expanded = wikidata.expandSearchTerms('উদ্বৃত্ত মূল্য');
  assert(expanded.includes('Surplus value') && expanded.includes('উদ্বৃত্ত মূল্য'), 'Wikidata expandSearchTerms');

  // ── 3. TEST OPENLIBRARY CONNECTOR ─────────────────────────────────
  const openlibrary = require('../api/_connectors/openlibrary');
  try {
    const books = await openlibrary.searchBooks('Das Kapital', { limit: 2 });
    assert(Array.isArray(books) && books.length > 0, `OpenLibrary searchBooks (returned ${books.length} books)`);
  } catch (e) {
    assert(false, 'OpenLibrary searchBooks', e.message);
  }

  // ── 4. TEST OPENALEX CONNECTOR ────────────────────────────────────
  const openalex = require('../api/_connectors/openalex');
  try {
    const papers = await openalex.searchResearch('Marxism imperialism', { limit: 2 });
    assert(Array.isArray(papers) && papers.length > 0, `OpenAlex searchResearch (returned ${papers.length} papers)`);
  } catch (e) {
    assert(false, 'OpenAlex searchResearch', e.message);
  }

  // ── 5. TEST CROSSREF CONNECTOR ────────────────────────────────────
  const crossref = require('../api/_connectors/crossref');
  try {
    const papers = await crossref.searchCrossref('Historical Materialism', { limit: 2 });
    assert(Array.isArray(papers) && papers.length > 0, `Crossref searchCrossref (returned ${papers.length} items)`);
  } catch (e) {
    assert(false, 'Crossref searchCrossref', e.message);
  }

  // ── 6. TEST RESOURCES API ─────────────────────────────────────────
  const resourcesHandler = require('../api/_handlers/resources');
  {
    const req = { method: 'GET', query: { q: '' }, headers: {} };
    let responseData = null;
    let statusCode = 200;
    const res = {
      status(c) { statusCode = c; return this; },
      json(d) { responseData = d; return this; },
      setHeader() {}
    };
    await resourcesHandler(req, res);
    assert(responseData && responseData.curated && responseData.curated.length > 0, 'Resources API curated works');
  }

  {
    const req = { method: 'GET', query: { q: 'capitalism' }, headers: {} };
    let responseData = null;
    const res = {
      status() { return this; },
      json(d) { responseData = d; return this; },
      setHeader() {}
    };
    await resourcesHandler(req, res);
    assert(responseData && responseData.results && responseData.results.length > 0, `Resources API search (found ${responseData.count} items)`);
  }

  // ── 7. TEST SEARCH API ────────────────────────────────────────────
  const searchHandler = require('../api/search');
  {
    const req = { method: 'GET', query: { q: 'লেনিন' }, headers: {} };
    let responseData = null;
    const res = {
      status() { return this; },
      json(d) { responseData = d; return this; },
      setHeader() {}
    };
    await searchHandler(req, res);
    assert(responseData && responseData.concept && (responseData.concept.canonical === 'leninism' || responseData.concept.canonical === 'vladimir lenin'), 'Search API concept detection');
    assert(responseData && responseData.counts && responseData.counts.total > 0, 'Search API categorized counts');
  }

  // ── 8. TEST NETWORK API ───────────────────────────────────────────
  const networkHandler = require('../api/network');
  {
    // GET Posts
    const req = { method: 'GET', query: { action: 'posts' }, headers: {} };
    let responseData = null;
    const res = {
      status() { return this; },
      json(d) { responseData = d; return this; },
      setHeader() {}
    };
    await networkHandler(req, res);
    assert(responseData && responseData.success && Array.isArray(responseData.posts), `Network API GET posts (${responseData.posts?.length} posts)`);
  }

  let createdPostId = null;
  {
    // CREATE Post
    const req = {
      method: 'POST',
      query: { action: 'create_post' },
      body: {
        content: 'সংহতি সমাবেশ এবং আন্তর্জাতিক মুক্ত কমরেডশিপ নেটওয়ার্ক টেস্ট পোস্ট।',
        author: { name: 'Comrade Joy', username: 'joy_sarkar', role: 'Editorial Board' },
        category: 'debate',
        tags: ['solidarity', 'test']
      },
      headers: {}
    };
    let responseData = null;
    const res = {
      status() { return this; },
      json(d) { responseData = d; return this; },
      setHeader() {}
    };
    await networkHandler(req, res);
    assert(responseData && responseData.success && responseData.post?.id, `Network API create post (${responseData.post?.id})`);
    createdPostId = responseData?.post?.id;
  }

  if (createdPostId) {
    // REACT to Post
    const req = {
      method: 'POST',
      query: { action: 'react' },
      body: { post_id: createdPostId, type: 'solidarity' },
      headers: {}
    };
    let responseData = null;
    const res = {
      status() { return this; },
      json(d) { responseData = d; return this; },
      setHeader() {}
    };
    await networkHandler(req, res);
    assert(responseData && responseData.success && responseData.reactions?.solidarity === 2, `Network API react to post (count: ${responseData.reactions?.solidarity})`);

    // COMMENT on Post
    const cReq = {
      method: 'POST',
      query: { action: 'comment' },
      body: { post_id: createdPostId, author: 'Comrade Lenin', content: 'দারুণ উদ্যোগ!' },
      headers: {}
    };
    let cData = null;
    const cRes = {
      status() { return this; },
      json(d) { cData = d; return this; },
      setHeader() {}
    };
    await networkHandler(cReq, cRes);
    assert(cData && cData.success && cData.comments?.length > 0, 'Network API add comment');
  }

  {
    // GET Groups
    const req = { method: 'GET', query: { action: 'groups' }, headers: {} };
    let responseData = null;
    const res = {
      status() { return this; },
      json(d) { responseData = d; return this; },
      setHeader() {}
    };
    await networkHandler(req, res);
    assert(responseData && responseData.success && responseData.groups?.length > 0, `Network API groups list (${responseData.groups?.length} groups)`);
  }

  {
    // GET Solidarity Requests
    const req = { method: 'GET', query: { action: 'solidarity_requests' }, headers: {} };
    let responseData = null;
    const res = {
      status() { return this; },
      json(d) { responseData = d; return this; },
      setHeader() {}
    };
    await networkHandler(req, res);
    assert(responseData && responseData.success && responseData.requests?.length > 0, `Network API solidarity requests (${responseData.requests?.length} campaigns)`);
  }

  console.log('\n----------------------------------------------------');
  console.log(`  TOTAL: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('----------------------------------------------------');

  if (failed > 0) process.exit(1);
}

runTests().catch(err => {
  console.error('[FATAL TEST ERROR]', err);
  process.exit(1);
});
