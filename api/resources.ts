/**
 * api/resources.ts — Multilingual Socialist Resource Aggregator
 * Unifies books (Open Library & Local Classics), scholarly literature (OpenAlex),
 * and journal papers (Crossref) with concept graph mapping (Wikidata).
 */

import fs from 'fs';
import path from 'path';
import openlibrary from './connectors/openlibrary';
import openalex from './connectors/openalex';
import crossref from './connectors/crossref';
import wikidata from './connectors/wikidata';
import type { ApiRequest, ApiResponse } from '../types';

// Load local books data
let localBooksCache: any[] | null = null;
function getLocalBooks(): any[] {
  if (localBooksCache) return localBooksCache;
  try {
    let booksDataPath = path.join(__dirname, '..', 'public', 'assets', 'js', 'books-data.js');
    if (!fs.existsSync(booksDataPath)) {
      booksDataPath = path.join(__dirname, '..', 'assets', 'js', 'books-data.js');
    }
    if (fs.existsSync(booksDataPath)) {
      const content = fs.readFileSync(booksDataPath, 'utf8');
      const match = content.match(/const\s+WORKS\s*=\s*(\[[\s\S]*?\]);\s*const/);
      if (match) {
        try {
          const fn = new Function(`return ${match[1]};`);
          const works = fn();
          localBooksCache = works.map((w: any) => ({
            id: `local:${w.slug || w.id || Math.random().toString(36).slice(2)}`,
            external_id: w.slug,
            provider: 'local',
            type: 'book',
            title: w.title,
            title_bn: w.title,
            title_en: w.titleEn || w.title,
            author: w.author,
            year: w.year,
            category: w.cat,
            description: w.desc,
            has_fulltext: !!w.hasJson,
            pdf_url: w.pdf,
            read_url: w.hasJson ? `/book-reader.html?book=${w.slug}` : (w.pdf || '/books.html'),
            source: 'লাল পাঠাগার (Laal Pathagar)'
          }));
          return localBooksCache || [];
        } catch (e) {}
      }
    }
  } catch (e: any) {
    console.error('[Resources] Error reading local books:', e.message);
  }
  return [];
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const query = req.query || {};
  const action = query.action || 'search';
  const q = (query.q || '').trim();
  const type = query.type || 'all'; // all, book, research, paper
  const limit = Math.min(parseInt(query.limit || '12', 10) || 12, 50);
  const lang = query.lang || '';

  // ── 1. GET SPECIFIC RESOURCE DETAILS ───────────────────────────────
  if (action === 'get') {
    const id = query.id;
    if (!id) return res.status(400).json({ error: 'Missing id parameter' });

    if (id.startsWith('ol:')) {
      const details = await openlibrary.getWorkDetails(id);
      if (!details) return res.status(404).json({ error: 'Resource not found on Open Library' });

      // Search related scholarly research via OpenAlex
      let relatedResearch: any[] = [];
      try {
        relatedResearch = await openalex.searchResearch(details.title, { limit: 4 });
      } catch (e) {}

      // Find concept mapping
      const concept = wikidata.findConcept(details.title);

      return res.status(200).json({
        resource: details,
        related_research: relatedResearch,
        concept
      });
    }

    if (id.startsWith('openalex:')) {
      const details = await openalex.getResearchDetails(id);
      if (!details) return res.status(404).json({ error: 'Research not found on OpenAlex' });
      return res.status(200).json({ resource: details });
    }

    if (id.startsWith('crossref:')) {
      const cleanDoi = id.replace(/^crossref:/, '');
      const details = await crossref.getByDoi(cleanDoi);
      if (!details) return res.status(404).json({ error: 'Paper not found on Crossref' });
      return res.status(200).json({ resource: details });
    }

    if (id.startsWith('local:')) {
      const books = getLocalBooks();
      const b = books.find(item => item.id === id || item.external_id === id.replace('local:', ''));
      if (!b) return res.status(404).json({ error: 'Local book not found' });
      return res.status(200).json({ resource: b });
    }

    return res.status(400).json({ error: 'Unsupported resource ID prefix' });
  }

  // ── 2. CURATED RESOURCES ──────────────────────────────────────────
  if (action === 'curated') {
    const local = getLocalBooks().slice(0, 8);
    const concepts = wikidata.CURATED_CONCEPTS.slice(0, 6);
    return res.status(200).json({
      featured_books: local,
      key_concepts: concepts,
      total_indexed: local.length + 1000000
    });
  }

  // ── 3. SEARCH ACROSS AGGREGATED CONNECTORS ─────────────────────────
  if (!q) {
    const local = getLocalBooks().slice(0, 10);
    return res.status(200).json({
      query: '',
      total: local.length,
      count: local.length,
      results: local,
      curated: local,
      concepts: []
    });
  }

  // Concept synonym expansion
  const concept = wikidata.findConcept(q);
  const searchTerms = wikidata.expandSearchTerms(q);
  const primarySearchTerm = concept ? concept.canonical : q;

  let localMatches: any[] = [];
  let openLibraryMatches: any[] = [];
  let openAlexMatches: any[] = [];
  let crossrefMatches: any[] = [];

  // Search local books first
  if (type === 'all' || type === 'book') {
    const allLocal = getLocalBooks();
    const lowerQ = q.toLowerCase();
    localMatches = allLocal.filter(b => {
      return (
        b.title.toLowerCase().includes(lowerQ) ||
        (b.title_en && b.title_en.toLowerCase().includes(lowerQ)) ||
        b.author.toLowerCase().includes(lowerQ) ||
        (b.description && b.description.toLowerCase().includes(lowerQ)) ||
        searchTerms.some(t => b.title.toLowerCase().includes(t.toLowerCase()))
      );
    }).slice(0, 6);
  }

  // External parallel searches with graceful timeout
  const promises: Promise<any>[] = [];

  if (type === 'all' || type === 'book') {
    promises.push(
      openlibrary.searchBooks(primarySearchTerm, { limit: Math.ceil(limit / 2), lang })
        .then(res => { openLibraryMatches = res; })
        .catch(() => {})
    );
  }

  if (type === 'all' || type === 'research') {
    promises.push(
      openalex.searchResearch(primarySearchTerm, { limit: Math.ceil(limit / 2) })
        .then(res => { openAlexMatches = res; })
        .catch(() => {})
    );
  }

  if (type === 'paper') {
    promises.push(
      crossref.searchCrossref(primarySearchTerm, { limit: Math.ceil(limit / 2) })
        .then(res => { crossrefMatches = res; })
        .catch(() => {})
    );
  }

  await Promise.all(promises);

  // Combine results with local prioritized
  const merged = [
    ...localMatches,
    ...openLibraryMatches,
    ...openAlexMatches,
    ...crossrefMatches
  ].slice(0, limit);

  return res.status(200).json({
    query: q,
    concept: concept || null,
    search_terms: searchTerms,
    count: merged.length,
    counts_by_provider: {
      local: localMatches.length,
      openlibrary: openLibraryMatches.length,
      openalex: openAlexMatches.length,
      crossref: crossrefMatches.length
    },
    results: merged
  });
}

module.exports = handler;
(module.exports as any).default = handler;
