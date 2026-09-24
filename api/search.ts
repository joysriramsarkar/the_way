/**
 * api/search.ts — Unified Multilingual Socialist Concept Search Engine using Neon PostgreSQL
 * Searches across Articles, Books, Research Literature, People, Groups, and Organizations.
 */

import sql from './_lib/db';
import openlibrary from './_connectors/openlibrary';
import openalex from './_connectors/openalex';
import wikidata from './_connectors/wikidata';
import resourcesHandler from './_handlers/resources';
import { getAllBooks } from '../data/books-data';
import type { ApiRequest, ApiResponse } from '../types';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.query?._route === 'resources' || (req.url && req.url.includes('/resources'))) {
    return await resourcesHandler(req, res);
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'public, max-age=30, s-maxage=120');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const query = req.query || {};
  const q = ((query.q as string) || '').trim();
  const category = (query.category as string) || 'all';

  if (!q) {
    return res.status(200).json({
      query: '',
      concept: null,
      categories: {
        articles: [],
        books: [],
        research: [],
        people: [],
        groups: []
      },
      counts: { articles: 0, books: 0, research: 0, people: 0, groups: 0 }
    });
  }

  const concept = wikidata.findConcept(q);
  const searchTerms = wikidata.expandSearchTerms(q);
  const primarySearchTerm = concept ? concept.canonical : q;

  const results: Record<string, any[]> = {
    articles: [],
    books: [],
    research: [],
    people: [],
    groups: [],
    solidarity: []
  };

  const tasks: Promise<any>[] = [];

  // 1. Search Articles from Neon DB
  if (category === 'all' || category === 'articles') {
    tasks.push((async () => {
      try {
        const rows = await sql.query(`
          SELECT id, slug, title, deck, section, author, published_at, hero_img_url
          FROM articles
          WHERE status = 'published' AND is_deleted = FALSE
            AND (title ILIKE $1 OR deck ILIKE $1 OR author ILIKE $1 OR tags ILIKE $1)
          LIMIT 8;
        `, [`%${q}%`]);

        if (rows && rows.length) {
          results.articles = rows.map((a: any) => ({
            id: a.id,
            type: 'article',
            title: a.title,
            subtitle: a.deck,
            author: a.author,
            url: `/article/${a.slug}`,
            section: a.section,
            published_at: a.published_at
          }));
        }
      } catch (e) {}
    })());
  }

  // 2. Search Books — first search local library, then fall back to Open Library
  if (category === 'all' || category === 'books') {
    tasks.push((async () => {
      try {
        // Search local books-data first (supports Bengali titles and socialist works)
        const qLower = q.toLowerCase();
        const localMatches = getAllBooks().filter(b =>
          b.title.toLowerCase().includes(qLower) ||
          (b.orig || '').toLowerCase().includes(qLower) ||
          b.author.toLowerCase().includes(qLower) ||
          (b.desc || '').toLowerCase().includes(qLower)
        ).slice(0, 6).map(b => ({
          id: b.id,
          type: 'book',
          title: b.title,
          subtitle: b.orig || '',
          author: b.author,
          year: b.year,
          url: `/library#${b.cat}`,
          source: 'local'
        }));

        // Then fetch from Open Library for broader results
        const olBooks = await openlibrary.searchBooks(primarySearchTerm, { limit: 6 });

        // Merge — local results first to avoid duplicates
        const combined: any[] = [...localMatches];
        for (const ob of olBooks) {
          if (!combined.find(l => l.title.toLowerCase() === ((ob as any).title || '').toLowerCase())) {
            combined.push(ob);
          }
        }
        results.books = combined.slice(0, 10);
      } catch (e) {
        // Fallback: just search local books
        try {
          const qLower = q.toLowerCase();
          results.books = getAllBooks().filter(b =>
            b.title.toLowerCase().includes(qLower) ||
            (b.orig || '').toLowerCase().includes(qLower) ||
            b.author.toLowerCase().includes(qLower)
          ).slice(0, 8).map(b => ({
            id: b.id,
            type: 'book',
            title: b.title,
            subtitle: b.orig || '',
            author: b.author,
            year: b.year,
            url: `/library#${b.cat}`,
            source: 'local'
          }));
        } catch {}
      }
    })());
  }

  // 3. Search Academic Research
  if (category === 'all' || category === 'research') {
    tasks.push((async () => {
      try {
        const papers = await openalex.searchResearch(primarySearchTerm, { limit: 6 });
        results.research = papers;
      } catch (e) {}
    })());
  }

  // 4. Search People / Comrades from allowed_admins
  if (category === 'all' || category === 'people') {
    tasks.push((async () => {
      try {
        const rows = await sql.query(`
          SELECT id, name, role, bio FROM allowed_admins
          WHERE status = 'active' AND (name ILIKE $1 OR email ILIKE $1 OR bio ILIKE $1)
          LIMIT 6;
        `, [`%${q}%`]);
        results.people = rows.map((p: any) => ({
          id: p.id,
          name: p.name || 'অ্যাডমিন প্যানেল',
          role: p.role,
          bio: p.bio,
          country: 'আন্তর্জাতিক'
        }));
      } catch (e) {}
    })());
  }

  // 5. Search Groups from network_groups
  if (category === 'all' || category === 'groups') {
    tasks.push((async () => {
      try {
        const rows = await sql.query(`
          SELECT * FROM network_groups
          WHERE name ILIKE $1 OR name_bn ILIKE $1 OR description ILIKE $1
          LIMIT 6;
        `, [`%${q}%`]);
        results.groups = rows;
      } catch (e) {}
    })());
  }

  // 6. Search Solidarity from solidarity_campaigns
  if (category === 'all' || category === 'solidarity') {
    tasks.push((async () => {
      try {
        const rows = await sql.query(`
          SELECT * FROM solidarity_campaigns
          WHERE title ILIKE $1 OR organization ILIKE $1 OR description ILIKE $1
          LIMIT 6;
        `, [`%${q}%`]);
        results.solidarity = rows;
      } catch (e) {}
    })());
  }

  await Promise.all(tasks);

  const counts = {
    articles: results.articles.length,
    books: results.books.length,
    research: results.research.length,
    people: results.people.length,
    groups: results.groups.length,
    solidarity: results.solidarity.length,
    total: results.articles.length + results.books.length + results.research.length + results.people.length + results.groups.length + results.solidarity.length
  };

  return res.status(200).json({
    query: q,
    concept,
    search_terms: searchTerms,
    counts,
    categories: results
  });
}

