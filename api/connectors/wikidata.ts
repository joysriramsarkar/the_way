/**
 * api/connectors/wikidata.ts
 * Wikidata Entity & Multilingual Concept Connector
 * Maps socialist and Marxist concepts, authors, and events across languages.
 * Free & public API: https://www.wikidata.org/w/api.php
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheItem<any>>();
const CACHE_TTL_MS = 30 * 60 * 1000;

export interface CuratedConcept {
  id: string;
  canonical: string;
  labels: Record<string, string>;
  description: string;
}

export interface WikidataEntity {
  id: string;
  external_id: string;
  provider: string;
  label: string;
  description: string;
  url: string;
}

// Curated high-precision bilingual concept dictionary for instantaneous lookup
export const CURATED_CONCEPTS: CuratedConcept[] = [
  {
    id: 'Q168923',
    canonical: 'surplus value',
    labels: {
      bn: 'উদ্বৃত্ত মূল্য',
      en: 'Surplus value',
      es: 'Plusvalía',
      pt: 'Mais-valia',
      fr: 'Plus-value',
      de: 'Mehrwert',
      ar: 'فائض القيمة',
      ru: 'Прибавочная стоимость',
      hi: 'अधिशेष मूल्य'
    },
    description: 'The excess of value produced by the labor of workers over wages'
  },
  {
    id: 'Q7264',
    canonical: 'marxism',
    labels: {
      bn: 'মার্ক্সবাদ',
      en: 'Marxism',
      es: 'Marxismo',
      pt: 'Marxismo',
      fr: 'Marxisme',
      de: 'Marxismus',
      ar: 'ماركسية',
      ru: 'Марксизм',
      hi: 'मार्क्सवाद'
    },
    description: 'Method of socioeconomic analysis that views class relations and social conflict'
  },
  {
    id: 'Q8305',
    canonical: 'imperialism',
    labels: {
      bn: 'সাম্রাজ্যবাদ',
      en: 'Imperialism',
      es: 'Imperialismo',
      pt: 'Imperialismo',
      fr: 'Impérialisme',
      de: 'Imperialismus',
      ar: 'إمبريالية',
      ru: 'Империализм',
      hi: 'साम्राज्यवाद'
    },
    description: 'State policy, practice, or advocacy of extending power and dominion'
  },
  {
    id: 'Q180592',
    canonical: 'historical materialism',
    labels: {
      bn: 'ঐতিহাসিক বস্তুবাদ',
      en: 'Historical materialism',
      es: 'Materialismo histórico',
      pt: 'Materialismo histórico',
      fr: 'Matérialisme historique',
      de: 'Historischer Materialismus',
      ar: 'المادية التاريخية',
      ru: 'Исторический материализм',
      hi: 'ऐतिहासिक भौतिकवाद'
    },
    description: 'Marxist historiographical approach to human society and history'
  },
  {
    id: 'Q181970',
    canonical: 'class struggle',
    labels: {
      bn: 'শ্রেণি সংগ্রাম',
      en: 'Class struggle',
      es: 'Lucha de clases',
      pt: 'Luta de classes',
      fr: 'Lutte des classes',
      de: 'Klassenkampf',
      ar: 'صراع طبقي',
      ru: 'Классовая борьба',
      hi: 'वर्ग संघर्ष'
    },
    description: 'Tension or antagonism in society between socioeconomic classes'
  },
  {
    id: 'Q131156',
    canonical: 'proletariat',
    labels: {
      bn: 'সর্বহারা শ্রেণি',
      en: 'Proletariat',
      es: 'Proletariado',
      pt: 'Proletariado',
      fr: 'Prolétariat',
      de: 'Proletariat',
      ar: 'بروليتاريا',
      ru: 'Пролетариат',
      hi: 'सर्वहारा वर्ग'
    },
    description: 'Social class of wage-earners possessing only their labor-power'
  },
  {
    id: 'Q9061',
    canonical: 'karl marx',
    labels: {
      bn: 'কার্ল মার্ক্স',
      en: 'Karl Marx',
      es: 'Karl Marx',
      pt: 'Karl Marx',
      fr: 'Karl Marx',
      de: 'Karl Marx',
      ar: 'كارل ماركس',
      ru: 'Карл Маркс',
      hi: 'कार्ल मार्क्स'
    },
    description: 'German philosopher, economist, historian, and revolutionary socialist'
  },
  {
    id: 'Q1394',
    canonical: 'vladimir lenin',
    labels: {
      bn: 'ভ্লাদিমির লেনিন',
      en: 'Vladimir Lenin',
      es: 'Vladímir Lenin',
      pt: 'Vladimir Lenin',
      fr: 'Lénine',
      de: 'Wladimir Iljitsch Lenin',
      ar: 'فلاديمير لينين',
      ru: 'Владимир Ленин',
      hi: 'व्लादिमीर लेनिन'
    },
    description: 'Russian revolutionary, politician, and political theorist'
  },
  {
    id: 'Q7217',
    canonical: 'rosa luxemburg',
    labels: {
      bn: 'রোজা লুক্সেমবার্গ',
      en: 'Rosa Luxemburg',
      es: 'Rosa Luxemburgo',
      pt: 'Rosa Luxemburgo',
      fr: 'Rosa Luxemburg',
      de: 'Rosa Luxemburg',
      ar: 'روزا لوكسمبورغ',
      ru: 'Роза Люксембург',
      hi: 'रोज़ा लक्ज़मबर्ग'
    },
    description: 'Polish and naturalised-German anti-war activist and revolutionary socialist'
  },
  {
    id: 'Q34787',
    canonical: 'antonio gramsci',
    labels: {
      bn: 'আন্তোনিও গ্রামশি',
      en: 'Antonio Gramsci',
      es: 'Antonio Gramsci',
      pt: 'Antonio Gramsci',
      fr: 'Antonio Gramsci',
      de: 'Antonio Gramsci',
      ar: 'أنطونيو غرامشي',
      ru: 'Антонио Грамши',
      hi: 'अंतोनियो ग्राम्शी'
    },
    description: 'Italian Marxist philosopher and communist politician (hegemony theory)'
  }
];

function getCached<T>(key: string): T | null {
  const item = cache.get(key);
  if (item && (Date.now() - item.timestamp < CACHE_TTL_MS)) return item.data as T;
  return null;
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}

/**
 * Find concept mapping by term in any supported language
 */
export function findConcept(term: string): CuratedConcept | null {
  if (!term) return null;
  const lower = term.trim().toLowerCase();
  for (const c of CURATED_CONCEPTS) {
    if (c.canonical.toLowerCase() === lower) return c;
    for (const val of Object.values(c.labels)) {
      if (val.toLowerCase() === lower || lower.includes(val.toLowerCase()) || val.toLowerCase().includes(lower)) {
        return c;
      }
    }
  }
  return null;
}

/**
 * Expand search term to multilingual synonyms using curated dictionary
 */
export function expandSearchTerms(term: string): string[] {
  const concept = findConcept(term);
  if (!concept) return [term];
  const terms = new Set<string>([term, concept.canonical]);
  for (const val of Object.values(concept.labels)) {
    terms.add(val);
  }
  return Array.from(terms);
}

/**
 * Search live Wikidata entities
 */
export async function searchEntities(query: string, lang: string = 'en'): Promise<WikidataEntity[]> {
  if (!query || !query.trim()) return [];
  const cacheKey = `wikidata:${query}:${lang}`;
  const cached = getCached<WikidataEntity[]>(cacheKey);
  if (cached) return cached;

  try {
    const url = new URL('https://www.wikidata.org/w/api.php');
    url.searchParams.set('action', 'wbsearchentities');
    url.searchParams.set('search', query.trim());
    url.searchParams.set('language', lang);
    url.searchParams.set('limit', '8');
    url.searchParams.set('format', 'json');
    url.searchParams.set('origin', '*');

    const res = await fetch(url.toString());
    if (!res.ok) return [];
    const data: any = await res.json();

    const results: WikidataEntity[] = (data.search || []).map((item: any) => ({
      id: `wikidata:${item.id}`,
      external_id: item.id,
      provider: 'wikidata',
      label: item.label,
      description: item.description || '',
      url: item.url || `https://www.wikidata.org/wiki/${item.id}`
    }));

    setCache(cacheKey, results);
    return results;
  } catch (err: any) {
    console.error('[Wikidata Connector Error]', err.message);
    return [];
  }
}

export default {
  CURATED_CONCEPTS,
  findConcept,
  expandSearchTerms,
  searchEntities
};
