/**
 * api/connectors/openalex.ts
 * OpenAlex API Connector
 * Provides search and metadata for open academic literature, research papers,
 * journal articles, and theoretical concepts.
 * Free & public API: https://openalex.org
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

/**
 * Reconstruct abstract from OpenAlex inverted index
 */
function reconstructAbstract(invertedIndex?: Record<string, number[]> | null): string {
  if (!invertedIndex || typeof invertedIndex !== 'object') return '';
  const wordPositions: { word: string; pos: number }[] = [];
  for (const [word, positions] of Object.entries(invertedIndex)) {
    for (const pos of positions) {
      wordPositions.push({ word, pos });
    }
  }
  wordPositions.sort((a, b) => a.pos - b.pos);
  return wordPositions.map(w => w.word).join(' ');
}

export interface OpenAlexResearch {
  id: string;
  external_id: string;
  provider: string;
  type: string;
  title: string;
  author: string;
  authors: string[] | any[];
  year: number | null;
  journal: string;
  doi: string | null;
  cited_by_count: number;
  is_oa: boolean;
  pdf_url: string | null;
  url: string;
  abstract: string;
  concepts: string[] | any[];
  source?: string;
  landing_page_url?: string;
  referenced_works_count?: number;
}

/**
 * Search scholarly works on OpenAlex
 */
export async function searchResearch(query: string, options: { limit?: number; page?: number } = {}): Promise<OpenAlexResearch[]> {
  if (!query || !query.trim()) return [];
  const limit = options.limit || 12;
  const page = options.page || 1;
  const cacheKey = `openalex:${query}:${limit}:${page}`;

  const cached = getCached<OpenAlexResearch[]>(cacheKey);
  if (cached) return cached;

  try {
    const url = new URL('https://api.openalex.org/works');
    url.searchParams.set('search', query.trim());
    url.searchParams.set('per-page', String(limit));
    url.searchParams.set('page', String(page));

    const res = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'TheWaySocialistNetwork/2.0 (mailto:contact@theway.network)'
      }
    });

    if (!res.ok) throw new Error(`OpenAlex API error: ${res.status}`);
    const data: any = await res.json();

    const normalized: OpenAlexResearch[] = (data.results || []).map((item: any) => {
      const cleanId = (item.id || '').replace('https://openalex.org/', '');
      const authors: string[] = (item.authorships || []).map((a: any) => a.author?.display_name).filter(Boolean);
      const hostVenue = item.primary_location?.source?.display_name || item.host_venue?.display_name || '';
      const doi = item.doi || (item.ids && item.ids.doi) || null;
      const pdfUrl = item.primary_location?.pdf_url || item.open_access?.oa_url || null;
      const landingUrl = item.primary_location?.landing_page_url || doi || item.id;
      const abstract = reconstructAbstract(item.abstract_inverted_index);

      return {
        id: `openalex:${cleanId}`,
        external_id: cleanId,
        provider: 'openalex',
        type: 'research',
        title: item.title || 'Untitled Research',
        author: authors[0] || 'Unknown Researcher',
        authors,
        year: item.publication_year || null,
        journal: hostVenue,
        doi,
        cited_by_count: item.cited_by_count || 0,
        is_oa: !!item.open_access?.is_oa,
        pdf_url: pdfUrl,
        url: landingUrl,
        abstract: abstract ? (abstract.slice(0, 300) + (abstract.length > 300 ? '...' : '')) : '',
        concepts: (item.concepts || []).slice(0, 4).map((c: any) => c.display_name),
        source: 'OpenAlex Scholarly Graph'
      };
    });

    setCache(cacheKey, normalized);
    return normalized;
  } catch (err: any) {
    console.error('[OpenAlex Connector Error]', err.message);
    return [];
  }
}

/**
 * Fetch detailed work by OpenAlex ID
 */
export async function getResearchDetails(workId: string): Promise<OpenAlexResearch | null> {
  const cleanId = workId.replace(/^openalex:/, '').replace('https://openalex.org/', '');
  const cacheKey = `openalex:work:${cleanId}`;
  const cached = getCached<OpenAlexResearch>(cacheKey);
  if (cached) return cached;

  try {
    const res = await fetch(`https://api.openalex.org/works/${cleanId}`, {
      headers: {
        'User-Agent': 'TheWaySocialistNetwork/2.0 (mailto:contact@theway.network)'
      }
    });
    if (!res.ok) return null;
    const item: any = await res.json();

    const authors = (item.authorships || []).map((a: any) => ({
      name: a.author?.display_name,
      institution: a.institutions && a.institutions[0]?.display_name
    }));

    const abstract = reconstructAbstract(item.abstract_inverted_index);

    const result: OpenAlexResearch = {
      id: `openalex:${cleanId}`,
      external_id: cleanId,
      provider: 'openalex',
      type: 'research',
      title: item.title,
      authors,
      author: authors[0]?.name || 'Unknown',
      year: item.publication_year,
      journal: item.primary_location?.source?.display_name || '',
      doi: item.doi,
      cited_by_count: item.cited_by_count || 0,
      is_oa: !!item.open_access?.is_oa,
      pdf_url: item.primary_location?.pdf_url || item.open_access?.oa_url,
      landing_page_url: item.primary_location?.landing_page_url || item.doi,
      url: item.id,
      abstract,
      concepts: (item.concepts || []).map((c: any) => ({
        name: c.display_name,
        score: c.score
      })),
      referenced_works_count: (item.referenced_works || []).length
    };

    setCache(cacheKey, result);
    return result;
  } catch (err: any) {
    console.error('[OpenAlex getResearchDetails Error]', err.message);
    return null;
  }
}

export default {
  searchResearch,
  getResearchDetails
};
