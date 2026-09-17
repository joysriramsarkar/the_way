/**
 * api/v1.ts — Federation & Public Knowledge Contribution API
 * Implements Chapters 23, 59, 60, 61 of The Way roadmap:
 * - Federation-compatible IDs (TW-W-xxxx, TW-P-xxxx, TW-O-xxxx)
 * - Cross-platform mapping (Open Library, OpenAlex, Crossref, Wikidata)
 * - Peer Node Manifest & Schema Discovery
 * - Resource catalog and peer ingestion endpoint
 */

import fs from 'fs';
import path from 'path';
import type { ApiRequest, ApiResponse, FederationResource, Organization, FederationManifest } from '../types';

const DATA_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const FED_FILE = path.join(DATA_DIR, 'federation_resources.json');
const ORG_FILE = path.join(DATA_DIR, 'organizations.json');

// Helper to safely load local books data
function loadLocalClassics(): any[] {
  try {
    let booksDataPath = path.join(__dirname, '..', 'public', 'assets', 'js', 'books-data.js');
    if (!fs.existsSync(booksDataPath)) {
      booksDataPath = path.join(__dirname, '..', 'assets', 'js', 'books-data.js');
    }
    if (fs.existsSync(booksDataPath)) {
      const content = fs.readFileSync(booksDataPath, 'utf8');
      const match = content.match(/const\s+WORKS\s*=\s*(\[[\s\S]*?\]);\s*const/);
      if (match) {
        const fn = new Function(`return ${match[1]};`);
        return fn() || [];
      }
    }
  } catch (e: any) {
    console.error('[Federation] Error loading local classics:', e.message);
  }
  return [];
}

// Initial seed organizations
const DEFAULT_ORGS: Organization[] = [
  {
    federation_id: 'TW-O-000001',
    name: "Workers' Study Collective",
    name_bn: "ওয়ার্কার্স স্টাডি কালেক্টিভ",
    country: "India",
    country_flag: "🇮🇳",
    type: "Study Circle",
    icon: "📚",
    desc: "Autonomous worker-student reading collective studying political economy, trade unionism, and subcontinental labor history.",
    members: 120,
    verified: true,
    focus: ["Labor", "Political Economy", "Education"],
    created_at: "2026-01-15T00:00:00Z"
  },
  {
    federation_id: 'TW-O-000002',
    name: "Bangladesh Garment Sramik Sangram Parishad",
    name_bn: "বাংলাদেশ গার্মেন্টস শ্রমিক সংগ্রাম পরিষদ",
    country: "Bangladesh",
    country_flag: "🇧🇩",
    type: "Trade Union",
    icon: "⚒️",
    desc: "Federation of apparel trade unions fighting for living wages and safety democracy on factory floors.",
    members: 14500,
    verified: true,
    focus: ["RMG Labor", "Living Wage", "Legal Rights"],
    created_at: "2026-01-20T00:00:00Z"
  },
  {
    federation_id: 'TW-O-000003',
    name: "Movimento dos Trabalhadores Sem Terra (MST)",
    name_bn: "মুভিমেন্তো দোস ত্রাবালিয়াদোরেস সেম তেরা (এমএসটি)",
    country: "Brazil",
    country_flag: "🇧🇷",
    type: "Peasant Movement",
    icon: "🌾",
    desc: "Landless rural workers movement struggling for agrarian reform and agroecological popular sovereignty.",
    members: 350000,
    verified: true,
    focus: ["Agrarian Reform", "Ecology", "Cooperatives"],
    created_at: "2026-02-01T00:00:00Z"
  },
  {
    federation_id: 'TW-O-000004',
    name: "Hellenic Federation of Metalworkers",
    name_bn: "হেলেনিক মেটালওয়ার্কার্স ফেডারেশন",
    country: "Greece",
    country_flag: "🇬🇷",
    type: "Trade Union",
    icon: "🏭",
    desc: "National trade union federation defending metal and industrial workers against austerity.",
    members: 8200,
    verified: true,
    focus: ["Industrial Labor", "Strikes", "Solidarity"],
    created_at: "2026-02-10T00:00:00Z"
  },
  {
    federation_id: 'TW-O-000005',
    name: "Institut Tribune Socialiste",
    name_bn: "আঁস্তিতু ত্রিবুন সোসিয়ালিস্ত",
    country: "France",
    country_flag: "🇫🇷",
    type: "Research Center",
    icon: "🎓",
    desc: "Independent research center preserving the history of self-management socialism and democratic planning.",
    members: 430,
    verified: false,
    focus: ["History", "Self-Management", "Archives"],
    created_at: "2026-02-15T00:00:00Z"
  }
];

// Curated research papers with TW-P IDs
const DEFAULT_PAPERS: FederationResource[] = [
  {
    federation_id: 'TW-P-000001',
    type: 'paper',
    title: 'Unequal Exchange and the Universal Law of Value in the 21st Century',
    title_bn: 'একবিংশ শতকে অসম বিনিময় ও মূল্যের বৈশ্বিক নিয়ম',
    author: 'Samir Amin & Collective',
    year: 2018,
    identifiers: {
      doi: '10.1080/08854300.2018.1492582',
      openalex: 'W2741809807',
      wikidata: 'Q115862341'
    },
    languages: ['en', 'fr', 'es'],
    license: 'CC-BY-SA 4.0',
    tags: ['imperialism', 'political-economy', 'dependency-theory']
  },
  {
    federation_id: 'TW-P-000002',
    type: 'paper',
    title: 'Digital Taylorism, Platform Capitalism and the New Working Class',
    title_bn: 'ডিজিটাল টেইলরিজম, প্ল্যাটফর্ম পুঁজিবাদ ও নতুন শ্রমজীবী শ্রেণি',
    author: 'Ursula Huws',
    year: 2021,
    identifiers: {
      doi: '10.1177/08969205211025732',
      openalex: 'W3165982012',
      wikidata: 'Q117498223'
    },
    languages: ['en', 'bn'],
    license: 'Open Access',
    tags: ['labor', 'platform-capitalism', 'technology']
  }
];

// Well-known identifier mapping for classics
const CLASSIC_IDENTIFIERS: Record<string, { openlibrary?: string; wikidata?: string; doi?: string }> = {
  'manifesto': { openlibrary: 'OL45804W', wikidata: 'Q131105' },
  'capital-1': { openlibrary: 'OL7353617M', wikidata: 'Q5879' },
  'state-rev': { openlibrary: 'OL2181775W', wikidata: 'Q1196144' },
  'imperialism': { openlibrary: 'OL262768W', wikidata: 'Q686259' },
  'what-is-done': { openlibrary: 'OL262760W', wikidata: 'Q1143822' },
  'reform-rev': { openlibrary: 'OL13953503W', wikidata: 'Q1429986' },
  'wretched-earth': { openlibrary: 'OL2717013W', wikidata: 'Q1197946' },
  'pedagogy-oppressed': { openlibrary: 'OL2633083W', wikidata: 'Q1638634' },
  'wage-labor': { openlibrary: 'OL45814W', wikidata: 'Q1889476' },
  'socialism-utopian': { openlibrary: 'OL45811W', wikidata: 'Q1196720' }
};

function initFederationStore(): { resources: FederationResource[]; orgs: Organization[] } {
  let resources: FederationResource[] = [];
  if (fs.existsSync(FED_FILE)) {
    try {
      resources = JSON.parse(fs.readFileSync(FED_FILE, 'utf8')) || [];
    } catch(e) {}
  }

  // If empty or missing classics, seed with local classics
  const hasWorks = resources.some(r => r.type === 'work');
  if (!hasWorks) {
    const rawWorks = loadLocalClassics();
    rawWorks.forEach((w: any, idx: number) => {
      const num = String(idx + 1).padStart(6, '0');
      const fedId = `TW-W-${num}`;
      const slug = w.slug || `work-${idx + 1}`;
      const ids = CLASSIC_IDENTIFIERS[slug] || {};

      resources.push({
        federation_id: fedId,
        type: 'work',
        slug: slug,
        title: w.title,
        title_bn: w.title,
        title_en: w.titleEn || w.title,
        author: w.author,
        year: w.year,
        category: w.cat || 'marx',
        description: w.desc,
        identifiers: {
          openlibrary: ids.openlibrary || null,
          wikidata: ids.wikidata || null,
          doi: ids.doi || null
        },
        languages: ['bn', 'en', 'es', 'de', 'ru', 'fr'],
        license: 'Public Domain / Free Culture',
        pdf_url: w.pdf || null,
        read_url: w.hasJson ? `/book-reader.html?book=${slug}` : (w.pdf || `/books.html`),
        source_collection: 'লাল পাঠাগার (The Way Classics)'
      });
    });

    // Add initial research papers
    DEFAULT_PAPERS.forEach(p => resources.push(p));

    try {
      fs.writeFileSync(FED_FILE, JSON.stringify(resources, null, 2), 'utf8');
    } catch(e) {}
  }

  // Check organizations file
  let orgs: Organization[] = [];
  if (fs.existsSync(ORG_FILE)) {
    try {
      orgs = JSON.parse(fs.readFileSync(ORG_FILE, 'utf8')) || [];
    } catch(e) {}
  }
  if (!orgs.length) {
    orgs = DEFAULT_ORGS;
    try {
      fs.writeFileSync(ORG_FILE, JSON.stringify(orgs, null, 2), 'utf8');
    } catch(e) {}
  }

  return { resources, orgs };
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  // Global CORS & standard headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Federation-Node');
  res.setHeader('Cache-Control', 'public, max-age=30, s-maxage=120');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { resources, orgs } = initFederationStore();

  const query = req.query || {};
  const reqUrl = req.url || '';
  
  // Extract sub-endpoint: from query parameter, or from URL path /api/v1/:sub
  let endpoint = (query.endpoint || '').toLowerCase();
  if (!endpoint) {
    const cleanUrl = reqUrl.split('?')[0].replace(/^\/api\/v1\/?/, '');
    if (cleanUrl) endpoint = cleanUrl.split('/')[0].toLowerCase();
  }
  if (!endpoint) {
    endpoint = req.method === 'POST' ? 'ingest' : 'manifest';
  }

  const host = (req.headers && (req.headers['x-forwarded-host'] || req.headers.host)) || 'localhost:3000';
  const proto = (req.headers && req.headers['x-forwarded-proto']) || 'http';
  const baseUrl = `${proto}://${host}`;

  // ── 1. MANIFEST / NODE INFO ─────────────────────────────────────────
  if ((endpoint === 'manifest' || endpoint === 'nodeinfo') && req.method === 'GET') {
    const worksCount = resources.filter(r => r.type === 'work').length;
    const papersCount = resources.filter(r => r.type === 'paper').length;
    const orgsCount = orgs.length;

    const manifest: FederationManifest = {
      federation: 'The Way Revolutionary Federation',
      node_id: 'theway.social',
      name: 'The Way — International Socialist Network',
      name_bn: 'দ্য ওয়ে — আন্তর্জাতিক সমাজতান্ত্রিক নেটওয়ার্ক',
      description: 'Federation-compatible socialist knowledge graph, revolutionary literature, open academic connectors and movement organizations.',
      version: '2.0.0',
      protocols: [
        'open-socialist-knowledge/v1',
        'federation/v1',
        'ActivityPub-Lite'
      ],
      base_url: baseUrl,
      languages: ['bn', 'en', 'es', 'hi', 'ar', 'pt', 'fr', 'ru'],
      prefixes: {
        works: 'TW-W-',
        papers: 'TW-P-',
        organizations: 'TW-O-'
      },
      stats: {
        works_count: worksCount,
        papers_count: papersCount,
        organizations_count: orgsCount,
        languages_count: 8
      },
      endpoints: {
        manifest: `${baseUrl}/api/v1?endpoint=manifest`,
        resources: `${baseUrl}/api/v1?endpoint=resources`,
        resource_lookup: `${baseUrl}/api/v1?endpoint=resource&id={TW-W-xxxx}`,
        organizations: `${baseUrl}/api/v1?endpoint=organizations`
      },
      license: 'CC-BY-SA 4.0 & Open Knowledge'
    };

    return res.status(200).json(manifest);
  }

  // ── 2. GET SINGLE RESOURCE ──────────────────────────────────────────
  if (endpoint === 'resource') {
    const id = (query.id || '').trim();
    if (!id) {
      return res.status(400).json({ error: 'Missing parameter: id (e.g. TW-W-000001 or TW-O-000001)' });
    }

    if (id.startsWith('TW-O-')) {
      const org = orgs.find(o => o.federation_id === id || o.id === id);
      if (org) return res.status(200).json({ success: true, resource: org });
      return res.status(404).json({ error: `Organization with ID ${id} not found.` });
    }

    const item = resources.find(r => r.federation_id === id || r.slug === id || r.id === id);
    if (item) {
      return res.status(200).json({ success: true, resource: item });
    }
    return res.status(404).json({ error: `Resource with ID ${id} not found.` });
  }

  // ── 3. ORGANIZATIONS CATALOG ────────────────────────────────────────
  if (endpoint === 'organizations' || endpoint === 'orgs') {
    const country = (query.country || '').trim().toLowerCase();
    const type = (query.type || '').trim().toLowerCase();
    const q = (query.q || '').trim().toLowerCase();

    let filtered = [...orgs];
    if (country) {
      filtered = filtered.filter(o => (o.country || '').toLowerCase().includes(country));
    }
    if (type && type !== 'all') {
      filtered = filtered.filter(o => (o.type || '').toLowerCase() === type);
    }
    if (q) {
      filtered = filtered.filter(o => 
        (o.name || '').toLowerCase().includes(q) ||
        (o.name_bn || '').toLowerCase().includes(q) ||
        (o.desc || '').toLowerCase().includes(q) ||
        (o.focus || []).some(f => f.toLowerCase().includes(q))
      );
    }

    return res.status(200).json({
      success: true,
      total: filtered.length,
      organizations: filtered
    });
  }

  // ── 4. RESOURCES CATALOG (GET) ──────────────────────────────────────
  if (req.method === 'GET' && (endpoint === 'resources' || endpoint === 'catalog' || !endpoint)) {
    const type = (query.type || 'all').trim().toLowerCase();
    const lang = (query.lang || '').trim().toLowerCase();
    const q = (query.q || '').trim().toLowerCase();
    const page = Math.max(parseInt(query.page || '1', 10) || 1, 1);
    const limit = Math.min(parseInt(query.limit || '20', 10) || 20, 100);

    let list = [...resources];

    if (type !== 'all') {
      list = list.filter(r => (r.type || '').toLowerCase() === type);
    }
    if (lang) {
      list = list.filter(r => (r.languages || []).includes(lang));
    }
    if (q) {
      list = list.filter(r => 
        (r.title || '').toLowerCase().includes(q) ||
        (r.title_bn || '').toLowerCase().includes(q) ||
        (r.title_en || '').toLowerCase().includes(q) ||
        (r.author || '').toLowerCase().includes(q) ||
        (r.description || '').toLowerCase().includes(q) ||
        (r.category || '').toLowerCase().includes(q) ||
        (r.tags || []).some(t => t.toLowerCase().includes(q))
      );
    }

    const total = list.length;
    const start = (page - 1) * limit;
    const paginated = list.slice(start, start + limit);

    return res.status(200).json({
      success: true,
      page,
      limit,
      total,
      total_pages: Math.ceil(total / limit),
      resources: paginated
    });
  }

  // ── 5. PEER FEDERATION INGESTION (POST) ─────────────────────────────
  if (req.method === 'POST') {
    const body = req.body || {};
    const itemType = (body.type || 'work').toLowerCase();

    // Ingest Organization
    if (itemType === 'org' || itemType === 'organization') {
      if (!body.name || !body.country) {
        return res.status(400).json({ error: 'Validation failed: Organization name and country are required.' });
      }

      const nextNum = String(orgs.length + 1).padStart(6, '0');
      const newOrg: Organization = {
        federation_id: `TW-O-${nextNum}`,
        id: `org_${Date.now()}`,
        name: body.name.trim(),
        name_bn: body.name_bn || body.name,
        country: body.country.trim(),
        country_flag: body.country_flag || '🌍',
        type: body.org_type || body.type || 'Trade Union',
        icon: body.icon || '🏛️',
        desc: body.desc || body.description || 'Federated socialist network participant.',
        members: parseInt(body.members, 10) || 10,
        verified: false,
        focus: Array.isArray(body.focus) ? body.focus : [body.org_type || 'Solidarity'],
        created_at: new Date().toISOString()
      };

      orgs.unshift(newOrg);
      try {
        fs.writeFileSync(ORG_FILE, JSON.stringify(orgs, null, 2), 'utf8');
      } catch(e) {}

      return res.status(201).json({
        success: true,
        message: 'Organization successfully registered in Federation graph.',
        federation_id: newOrg.federation_id,
        organization: newOrg
      });
    }

    // Ingest Work or Paper
    if (!body.title || !body.author) {
      return res.status(400).json({ error: 'Validation failed: Resource title and author are required.' });
    }

    const prefix = itemType === 'paper' ? 'TW-P-' : 'TW-W-';
    const countType = resources.filter(r => r.type === itemType).length;
    const nextNum = String(countType + 1).padStart(6, '0');
    const fedId = `${prefix}${nextNum}`;

    const newResource: FederationResource = {
      federation_id: fedId,
      type: itemType,
      title: body.title.trim(),
      title_bn: body.title_bn || body.title,
      title_en: body.title_en || body.title,
      author: body.author.trim(),
      year: parseInt(body.year, 10) || new Date().getFullYear(),
      category: body.category || 'theory',
      description: body.description || '',
      identifiers: {
        openlibrary: body.identifiers?.openlibrary || null,
        wikidata: body.identifiers?.wikidata || null,
        doi: body.identifiers?.doi || null,
        openalex: body.identifiers?.openalex || null
      },
      languages: Array.isArray(body.languages) && body.languages.length ? body.languages : ['bn', 'en'],
      license: body.license || 'CC-BY-SA 4.0',
      pdf_url: body.pdf_url || null,
      read_url: body.read_url || null,
      source_collection: body.source_collection || 'Federated Peer Node',
      created_at: new Date().toISOString()
    };

    resources.unshift(newResource);
    try {
      fs.writeFileSync(FED_FILE, JSON.stringify(resources, null, 2), 'utf8');
    } catch(e) {}

    return res.status(201).json({
      success: true,
      message: 'Resource successfully ingested into socialist federation graph.',
      federation_id: fedId,
      resource: newResource
    });
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}

module.exports = handler;
(module.exports as any).default = handler;
