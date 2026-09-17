/**
 * api/connectors/openlibrary.ts
 * Open Library API Connector
 * Provides search, work metadata, editions lookup, and book covers.
 * Free & public API: https://openlibrary.org/dev/docs/api
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheItem<any>>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache

function getCached<T>(key: string): T | null {
  const item = cache.get(key);
  if (item && (Date.now() - item.timestamp < CACHE_TTL_MS)) {
    return item.data as T;
  }
  return null;
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
  if (cache.size > 500) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey) cache.delete(oldestKey);
  }
}

export interface OpenLibraryBook {
  id: string;
  external_id: string;
  provider: string;
  type: string;
  title: string;
  subtitle?: string;
  author: string;
  authors: string[];
  year: number | null;
  languages: string[];
  editions_count: number;
  cover_url: string | null;
  thumbnail_url: string | null;
  subjects: string[];
  has_fulltext: boolean;
  url: string;
  source: string;
  description?: string;
  covers?: string[];
  editions?: any[];
}

/**
 * Search books on Open Library
 */
export async function searchBooks(query: string, options: { limit?: number; page?: number; lang?: string } = {}): Promise<OpenLibraryBook[]> {
  if (!query || !query.trim()) return [];
  const limit = options.limit || 12;
  const page = options.page || 1;
  const cacheKey = `search:${query}:${limit}:${page}:${options.lang || ''}`;

  const cached = getCached<OpenLibraryBook[]>(cacheKey);
  if (cached) return cached;

  try {
    const url = new URL('https://openlibrary.org/search.json');
    url.searchParams.set('q', query.trim());
    url.searchParams.set('limit', String(limit));
    url.searchParams.set('page', String(page));
    if (options.lang) url.searchParams.set('lang', options.lang);

    const res = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'TheWaySocialistNetwork/2.0 (contact@theway.network)'
      }
    });

    if (!res.ok) throw new Error(`Open Library API error: ${res.status}`);
    const data: any = await res.json();

    const normalized: OpenLibraryBook[] = (data.docs || []).map((doc: any) => {
      const workKey = (doc.key || '').replace('/works/', '');
      const coverId = doc.cover_i;
      const coverUrl = coverId 
        ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
        : null;

      return {
        id: `ol:${workKey}`,
        external_id: workKey,
        provider: 'openlibrary',
        type: 'book',
        title: doc.title || 'Untitled',
        subtitle: doc.subtitle || '',
        author: (doc.author_name && doc.author_name[0]) || 'Unknown',
        authors: doc.author_name || [],
        year: doc.first_publish_year || (doc.publish_year && doc.publish_year[0]) || null,
        languages: doc.language || [],
        editions_count: doc.edition_count || 1,
        cover_url: coverUrl,
        thumbnail_url: coverId ? `https://covers.openlibrary.org/b/id/${coverId}-S.jpg` : null,
        subjects: (doc.subject || []).slice(0, 5),
        has_fulltext: !!doc.has_fulltext,
        url: `https://openlibrary.org${doc.key || ''}`,
        source: 'Open Library'
      };
    });

    setCache(cacheKey, normalized);
    return normalized;
  } catch (err: any) {
    console.error('[OpenLibrary Connector Error]', err.message);
    return [];
  }
}

/**
 * Fetch detailed work metadata and editions
 */
export async function getWorkDetails(workId: string): Promise<OpenLibraryBook | null> {
  const cleanId = workId.replace(/^ol:/, '').replace(/^\/works\//, '');
  const cacheKey = `work:${cleanId}`;
  const cached = getCached<OpenLibraryBook>(cacheKey);
  if (cached) return cached;

  try {
    const workRes = await fetch(`https://openlibrary.org/works/${cleanId}.json`, {
      headers: { 'User-Agent': 'TheWaySocialistNetwork/2.0' }
    });
    if (!workRes.ok) return null;
    const workData: any = await workRes.json();

    // Fetch editions for this work
    let editions: any[] = [];
    try {
      const edRes = await fetch(`https://openlibrary.org/works/${cleanId}/editions.json?limit=15`, {
        headers: { 'User-Agent': 'TheWaySocialistNetwork/2.0' }
      });
      if (edRes.ok) {
        const edData: any = await edRes.json();
        editions = (edData.entries || []).map((e: any) => ({
          title: e.title,
          publish_date: e.publish_date,
          publishers: e.publishers || [],
          languages: (e.languages || []).map((l: any) => (l.key || '').replace('/languages/', '')),
          isbn_13: (e.isbn_13 && e.isbn_13[0]) || null,
          cover_url: e.covers && e.covers[0] ? `https://covers.openlibrary.org/b/id/${e.covers[0]}-M.jpg` : null
        }));
      }
    } catch (e) {}

    // Extract description
    let description = '';
    if (typeof workData.description === 'string') {
      description = workData.description;
    } else if (workData.description && workData.description.value) {
      description = workData.description.value;
    }

    const result: OpenLibraryBook = {
      id: `ol:${cleanId}`,
      external_id: cleanId,
      provider: 'openlibrary',
      type: 'book',
      title: workData.title,
      author: 'Unknown',
      authors: [],
      year: null,
      languages: [],
      editions_count: editions.length,
      cover_url: workData.covers && workData.covers[0] ? `https://covers.openlibrary.org/b/id/${workData.covers[0]}-M.jpg` : null,
      thumbnail_url: null,
      description,
      subjects: workData.subjects || [],
      covers: (workData.covers || []).map((c: any) => `https://covers.openlibrary.org/b/id/${c}-L.jpg`),
      editions,
      has_fulltext: false,
      source: 'Open Library',
      url: `https://openlibrary.org/works/${cleanId}`
    };

    setCache(cacheKey, result);
    return result;
  } catch (err: any) {
    console.error('[OpenLibrary getWorkDetails Error]', err.message);
    return null;
  }
}

export default {
  searchBooks,
  getWorkDetails
};
