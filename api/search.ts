/**
 * api/search.ts — Unified Multilingual Socialist Concept Search Engine
 * Searches across Articles, Books, Research Literature, People, Groups, and Organizations.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import openlibrary from './_connectors/openlibrary';
import openalex from './_connectors/openalex';
import wikidata from './_connectors/wikidata';
import resourcesHandler from './_handlers/resources';
import fs from 'fs';
import path from 'path';
import type { ApiRequest, ApiResponse } from '../types';

function getSbClient(): SupabaseClient | null {
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
    try {
      return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
    } catch (e) {}
  }
  return null;
}

function readJSONSafe<T>(filename: string, defaultVal: T): T {
  try {
    const p = path.join(__dirname, '..', 'data', filename);
    if (fs.existsSync(p)) {
      return JSON.parse(fs.readFileSync(p, 'utf8')) || defaultVal;
    }
  } catch (e) {}
  return defaultVal;
}

// Built-in seed socialist profiles for discovery
const DEFAULT_PROFILES = [
  {
    id: 'p1',
    name: 'Ana Rodriguez',
    pseudonym: 'Ana R',
    country: 'Argentina',
    country_code: 'AR',
    city: 'Buenos Aires',
    role: 'Marxist Organizer',
    ideologies: ['Marxist', 'Eco-socialist', 'Feminist'],
    languages: ['Spanish', 'English'],
    interests: ['Labour', 'Political Economy', 'Ecology'],
    contributions: { articles: 12, translations: 7, circles: 3 },
    bio: 'Labour organizer and researcher focused on Latin American mining extractivism and worker cooperatives.'
  },
  {
    id: 'p2',
    name: 'তানভীর আহমেদ (Tanveer Ahmed)',
    pseudonym: 'Red Sparrow',
    country: 'Bangladesh',
    country_code: 'BD',
    city: 'Dhaka',
    role: 'Labour Researcher',
    ideologies: ['Marxist-Leninist', 'Historical Materialism'],
    languages: ['Bengali', 'English'],
    interests: ['RMG Labour', 'Imperialism', 'Agrarian Questions'],
    contributions: { articles: 18, translations: 14, circles: 5 },
    bio: 'গার্মেন্টস ও অনানুষ্ঠানিক খাতের শ্রমিক আন্দোলন নিয়ে গবেষণা ও পাঠচক্র সঞ্চালক।'
  },
  {
    id: 'p3',
    name: 'Priya Nair',
    pseudonym: 'Priya N',
    country: 'India',
    country_code: 'IN',
    city: 'Kolkata',
    role: 'Political Economist',
    ideologies: ['Marxist', 'Democratic Socialist'],
    languages: ['Bengali', 'English', 'Hindi'],
    interests: ['Surplus Value', 'Peasant Movements', 'Women in Labour'],
    contributions: { articles: 9, translations: 5, circles: 2 },
    bio: 'Working on contemporary peasant resistance and surplus value extraction in South Asia.'
  },
  {
    id: 'p4',
    name: 'João Silva',
    pseudonym: 'Companheiro Joao',
    country: 'Brazil',
    country_code: 'BR',
    city: 'São Paulo',
    role: 'Trade Unionist',
    ideologies: ['Eco-socialist', 'Council Communist'],
    languages: ['Portuguese', 'Spanish', 'English'],
    interests: ['Amazon Preservation', 'Indigenous Solidarity', 'Urban Struggles'],
    contributions: { articles: 6, translations: 11, circles: 4 },
    bio: 'Sindicalista e pesquisador sobre a luta pela terra e transição ecológica justa.'
  }
];

// Built-in seed groups
const DEFAULT_GROUPS = [
  {
    id: 'g1',
    name: 'Marxist Political Economy Study Circle',
    name_bn: 'মার্ক্সবাদী রাজনৈতিক অর্থনীতি পাঠচক্র',
    category: 'Theory & Economy',
    members_count: 142,
    lang: 'en',
    description: "Weekly reading group analyzing Marx's Capital, theories of crisis, and imperialism."
  },
  {
    id: 'g2',
    name: 'বাংলা সমাজতান্ত্রিক পাঠশালা',
    name_bn: 'বাংলা সমাজতান্ত্রিক পাঠশালা',
    category: 'Philosophy & History',
    members_count: 320,
    lang: 'bn',
    description: 'ঐতিহাসিক বস্তুবাদ, দ্বন্দ্বমূলক বস্তুবাদ এবং ভারতীয় উপমহাদেশের কমিউনিস্ট আন্দোলনের ইতিহাস পাঠ।'
  },
  {
    id: 'g3',
    name: 'Global Labour History Collective',
    name_bn: 'বিশ্ব শ্রমিক ইতিহাস কালেক্টিভ',
    category: 'Labour',
    members_count: 98,
    lang: 'en',
    description: 'Documenting workers strikes, trade union histories, and wildcat actions across the Global South.'
  },
  {
    id: 'g4',
    name: 'Eco-socialism and Just Transition',
    name_bn: 'ইকো-সোশ্যালিজম ও ন্যায্য রূপান্তর',
    category: 'Ecology',
    members_count: 115,
    lang: 'es',
    description: 'Grupo de estudio sobre la crisis ecológica capitalista, extractivismo y soberanía popular.'
  }
];

export default async function handler(req: ApiRequest, res: ApiResponse) {
  // Delegate to resources handler if rewritten from /api/resources
  if (req.query?._route === 'resources' || (req.url && req.url.includes('/resources'))) {
    return await resourcesHandler(req, res);
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'public, max-age=30, s-maxage=120');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const query = req.query || {};
  const q = (query.q || '').trim();
  const category = query.category || 'all'; // all, articles, books, research, people, groups, solidarity

  if (!q) {
    return res.status(200).json({
      query: '',
      concept: null,
      categories: {
        articles: [],
        books: [],
        research: [],
        people: DEFAULT_PROFILES.slice(0, 4),
        groups: DEFAULT_GROUPS.slice(0, 4)
      },
      counts: { articles: 0, books: 0, research: 0, people: 4, groups: 4 }
    });
  }

  // 1. Detect Concept & Expand multilingual synonyms
  const concept = wikidata.findConcept(q);
  const searchTerms = wikidata.expandSearchTerms(q);
  const primarySearchTerm = concept ? concept.canonical : q;
  const lowerQ = q.toLowerCase();

  const results: Record<string, any[]> = {
    articles: [],
    books: [],
    research: [],
    people: [],
    groups: [],
    solidarity: []
  };

  const tasks: Promise<any>[] = [];

  // 2. Search Articles (Supabase or local articles)
  if (category === 'all' || category === 'articles') {
    tasks.push((async () => {
      try {
        const client = getSbClient();
        if (client) {
          const { data } = await client
            .from('articles')
            .select('id, slug, title, deck, section, author, published_at, hero_img_url')
            .eq('status', 'published')
            .or(`title.ilike.%${q}%,deck.ilike.%${q}%,author.ilike.%${q}%`)
            .limit(8);
          if (data && data.length) {
            results.articles = data.map((a: any) => ({
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
        }
      } catch (e) {}
    })());
  }

  // 3. Search Books (Open Library + Local Classics)
  if (category === 'all' || category === 'books') {
    tasks.push((async () => {
      try {
        const olBooks = await openlibrary.searchBooks(primarySearchTerm, { limit: 6 });
        results.books = olBooks;
      } catch (e) {}
    })());
  }

  // 4. Search Academic Research (OpenAlex)
  if (category === 'all' || category === 'research') {
    tasks.push((async () => {
      try {
        const papers = await openalex.searchResearch(primarySearchTerm, { limit: 6 });
        results.research = papers;
      } catch (e) {}
    })());
  }

  // 5. Search People (Profiles)
  if (category === 'all' || category === 'people') {
    const customProfiles = readJSONSafe<any[]>('network_profiles.json', []);
    const allProfiles = [...customProfiles, ...DEFAULT_PROFILES];
    results.people = allProfiles.filter(p => {
      const text = `${p.name} ${p.pseudonym || ''} ${p.country} ${p.city || ''} ${(p.ideologies || []).join(' ')} ${(p.interests || []).join(' ')} ${(p.languages || []).join(' ')}`.toLowerCase();
      return text.includes(lowerQ) || searchTerms.some(term => text.includes(term.toLowerCase()));
    }).slice(0, 6);
  }

  // 6. Search Groups
  if (category === 'all' || category === 'groups') {
    const customGroups = readJSONSafe<any[]>('network_groups.json', []);
    const allGroups = [...customGroups, ...DEFAULT_GROUPS];
    results.groups = allGroups.filter(g => {
      const text = `${g.name} ${g.name_bn || ''} ${g.category} ${g.description || ''}`.toLowerCase();
      return text.includes(lowerQ) || searchTerms.some(term => text.includes(term.toLowerCase()));
    }).slice(0, 6);
  }

  // 7. Search Solidarity Requests
  if (category === 'all' || category === 'solidarity') {
    const solidarityRequests = readJSONSafe<any[]>('network_solidarity.json', []);
    results.solidarity = solidarityRequests.filter(s => {
      const text = `${s.title} ${s.organization} ${s.country} ${s.description} ${(s.needs || []).join(' ')}`.toLowerCase();
      return text.includes(lowerQ) || searchTerms.some(term => text.includes(term.toLowerCase()));
    }).slice(0, 6);
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

module.exports = handler;
(module.exports as any).default = handler;
