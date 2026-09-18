/**
 * api/connectors/crossref.ts
 * Crossref API Connector
 * Provides DOI metadata lookup and academic paper discovery.
 * Free & public API: https://www.crossref.org/documentation/retrieve-metadata/rest-api
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheItem<any>>();
const CACHE_TTL_MS = 10 * 60 * 1000;

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

export interface CrossrefWork {
  id: string;
  external_id: string;
  provider: string;
  type: string;
  title: string;
  author: string;
  authors: string[];
  year: number | null;
  journal: string;
  doi: string;
  url: string;
  publisher: string;
  source: string;
  abstract?: string;
}

/**
 * Search works on Crossref
 */
export async function searchCrossref(query: string, options: { limit?: number; page?: number } = {}): Promise<CrossrefWork[]> {
  if (!query || !query.trim()) return [];
  const limit = options.limit || 10;
  const cacheKey = `crossref:${query}:${limit}`;

  const cached = getCached<CrossrefWork[]>(cacheKey);
  if (cached) return cached;

  try {
    const url = new URL('https://api.crossref.org/works');
    url.searchParams.set('query', query.trim());
    url.searchParams.set('rows', String(limit));

    const res = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'TheWaySocialistNetwork/2.0 (mailto:contact@theway.network)'
      }
    });

    if (!res.ok) throw new Error(`Crossref API error: ${res.status}`);
    const data: any = await res.json();

    const items: any[] = data.message?.items || [];
    const normalized: CrossrefWork[] = items.map(item => {
      const authors: string[] = (item.author || []).map((a: any) => `${a.given || ''} ${a.family || ''}`.trim()).filter(Boolean);
      const year = item['published-print']?.['date-parts']?.[0]?.[0] || 
                   item['published-online']?.['date-parts']?.[0]?.[0] || 
                   item.created?.['date-parts']?.[0]?.[0] || null;

      return {
        id: `crossref:${item.DOI}`,
        external_id: item.DOI,
        provider: 'crossref',
        type: 'paper',
        title: (item.title && item.title[0]) || 'Untitled Paper',
        author: authors[0] || 'Unknown Author',
        authors,
        year,
        journal: (item['container-title'] && item['container-title'][0]) || item.publisher || '',
        doi: item.DOI,
        url: item.URL || `https://doi.org/${item.DOI}`,
        publisher: item.publisher || '',
        source: 'Crossref'
      };
    });

    setCache(cacheKey, normalized);
    return normalized;
  } catch (err: any) {
    console.error('[Crossref Connector Error]', err.message);
    return [];
  }
}

/**
 * Fetch paper metadata by DOI
 */
export async function getByDoi(doi: string): Promise<CrossrefWork | null> {
  const cleanDoi = doi.replace(/^https?:\/\/doi\.org\//, '').replace(/^doi:/, '');
  const cacheKey = `crossref:doi:${cleanDoi}`;
  const cached = getCached<CrossrefWork>(cacheKey);
  if (cached) return cached;

  try {
    const res = await fetch(`https://api.crossref.org/works/${cleanDoi}`, {
      headers: {
        'User-Agent': 'TheWaySocialistNetwork/2.0 (mailto:contact@theway.network)'
      }
    });
    if (!res.ok) return null;
    const data: any = await res.json();
    const item = data.message;
    if (!item) return null;

    const authors: string[] = (item.author || []).map((a: any) => `${a.given || ''} ${a.family || ''}`.trim()).filter(Boolean);
    const year = item['published-print']?.['date-parts']?.[0]?.[0] || 
                 item['published-online']?.['date-parts']?.[0]?.[0] || null;

    const result: CrossrefWork = {
      id: `crossref:${item.DOI}`,
      external_id: item.DOI,
      provider: 'crossref',
      type: 'paper',
      title: (item.title && item.title[0]) || 'Untitled Paper',
      authors,
      author: authors[0] || 'Unknown',
      year,
      journal: (item['container-title'] && item['container-title'][0]) || '',
      doi: item.DOI,
      url: item.URL || `https://doi.org/${item.DOI}`,
      publisher: item.publisher || '',
      abstract: item.abstract || null,
      source: 'Crossref'
    };

    setCache(cacheKey, result);
    return result;
  } catch (err: any) {
    console.error('[Crossref DOI Error]', err.message);
    return null;
  }
}

export default {
  searchCrossref,
  getByDoi
};
