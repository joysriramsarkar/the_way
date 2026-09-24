/**
 * api/v1.ts — Federation & Public Knowledge Contribution API
 * Implements Chapters 23, 59, 60, 61 of The Way roadmap:
 * - Federation-compatible IDs (TW-W-xxxx, TW-P-xxxx, TW-O-xxxx)
 * - Cross-platform mapping (Open Library, OpenAlex, Crossref, Wikidata)
 * - Peer Node Manifest & Schema Discovery
 * - Resource catalog and peer ingestion endpoint
 * - Backed durably by Neon PostgreSQL (federation_resources, organizations)
 */

import sql from './_lib/db';
import type { ApiRequest, ApiResponse, FederationManifest } from '../types';

function formatOrganization(o: any) {
  if (!o) return o;
  return {
    federation_id: o.federation_id,
    id: o.federation_id,
    name: o.name,
    name_bn: o.name_bn || o.name,
    country: o.country,
    country_flag: o.country_flag || '🌍',
    type: o.type,
    org_type: o.type,
    icon: o.icon || '🏛️',
    desc: o.description,
    description: o.description,
    members: o.members || 1,
    verified: Boolean(o.verified),
    focus: Array.isArray(o.focus) ? o.focus : (typeof o.focus === 'string' ? JSON.parse(o.focus) : []),
    created_at: o.created_at
  };
}

function formatResource(r: any) {
  if (!r) return r;
  return {
    federation_id: r.federation_id,
    type: r.type,
    slug: r.slug || r.federation_id,
    title: r.title,
    title_bn: r.title_bn || r.title,
    title_en: r.title_en || r.title,
    author: r.author,
    year: r.year,
    category: r.category || 'theory',
    description: r.description || '',
    identifiers: typeof r.identifiers === 'string' ? JSON.parse(r.identifiers) : (r.identifiers || {}),
    languages: typeof r.languages === 'string' ? JSON.parse(r.languages) : (r.languages || ['bn', 'en']),
    license: r.license || 'CC-BY-SA 4.0',
    pdf_url: r.pdf_url || null,
    read_url: r.read_url || null,
    source_collection: r.source_collection || 'The Way Classics',
    created_at: r.created_at
  };
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

  try {
    // ── 1. MANIFEST / NODE INFO ─────────────────────────────────────────
    if ((endpoint === 'manifest' || endpoint === 'nodeinfo') && req.method === 'GET') {
      const worksRes = await sql.query("SELECT COUNT(*)::int as count FROM federation_resources WHERE type = 'work'");
      const papersRes = await sql.query("SELECT COUNT(*)::int as count FROM federation_resources WHERE type = 'paper'");
      const orgsRes = await sql.query("SELECT COUNT(*)::int as count FROM organizations");

      const worksCount = (worksRes as any[])[0]?.count || 0;
      const papersCount = (papersRes as any[])[0]?.count || 0;
      const orgsCount = (orgsRes as any[])[0]?.count || 0;

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
        languages: ['bn', 'en', 'es', 'hi', 'ar', 'pt', 'fr', 'ru', 'zh'],
        prefixes: {
          works: 'TW-W-',
          papers: 'TW-P-',
          organizations: 'TW-O-'
        },
        stats: {
          works_count: worksCount,
          papers_count: papersCount,
          organizations_count: orgsCount,
          languages_count: 9
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
        const orgRes = await sql.query('SELECT * FROM organizations WHERE federation_id = $1', [id]);
        if ((orgRes as any[]).length > 0) {
          const org = formatOrganization((orgRes as any[])[0]);
          return res.status(200).json({ success: true, resource: org });
        }
        return res.status(404).json({ error: `Organization with ID ${id} not found.` });
      }

      const itemRes = await sql.query('SELECT * FROM federation_resources WHERE federation_id = $1 OR slug = $1', [id]);
      if ((itemRes as any[]).length > 0) {
        const item = formatResource((itemRes as any[])[0]);
        return res.status(200).json({ success: true, resource: item });
      }
      return res.status(404).json({ error: `Resource with ID ${id} not found.` });
    }

    // ── 3. ORGANIZATIONS CATALOG ────────────────────────────────────────
    if (endpoint === 'organizations' || endpoint === 'orgs') {
      const country = (query.country || '').trim().toLowerCase();
      const type = (query.type || '').trim().toLowerCase();
      const q = (query.q || '').trim().toLowerCase();

      let queryStr = 'SELECT * FROM organizations WHERE 1=1';
      const params: any[] = [];

      if (country) {
        params.push(`%${country}%`);
        queryStr += ` AND LOWER(country) LIKE $${params.length}`;
      }
      if (type && type !== 'all') {
        params.push(type);
        queryStr += ` AND LOWER(type) = $${params.length}`;
      }
      if (q) {
        params.push(`%${q}%`);
        queryStr += ` AND (LOWER(name) LIKE $${params.length} OR LOWER(COALESCE(name_bn, '')) LIKE $${params.length} OR LOWER(COALESCE(description, '')) LIKE $${params.length})`;
      }

      queryStr += ' ORDER BY created_at DESC';
      const rows = (await sql.query(queryStr, params)) as any[];
      const orgs = rows.map(formatOrganization);

      return res.status(200).json({
        success: true,
        total: orgs.length,
        organizations: orgs
      });
    }

    // ── 4. RESOURCES CATALOG (GET) ──────────────────────────────────────
    if (req.method === 'GET' && (endpoint === 'resources' || endpoint === 'catalog' || !endpoint)) {
      const type = (query.type || 'all').trim().toLowerCase();
      const lang = (query.lang || '').trim().toLowerCase();
      const q = (query.q || '').trim().toLowerCase();
      const page = Math.max(parseInt(query.page || '1', 10) || 1, 1);
      const limit = Math.min(parseInt(query.limit || '20', 10) || 20, 100);

      let whereClause = ' WHERE 1=1';
      const params: any[] = [];

      if (type !== 'all') {
        params.push(type);
        whereClause += ` AND LOWER(type) = $${params.length}`;
      }
      if (lang) {
        params.push(JSON.stringify([lang]));
        whereClause += ` AND languages @> $${params.length}::jsonb`;
      }
      if (q) {
        params.push(`%${q}%`);
        whereClause += ` AND (
          LOWER(title) LIKE $${params.length} OR
          LOWER(COALESCE(title_bn, '')) LIKE $${params.length} OR
          LOWER(COALESCE(title_en, '')) LIKE $${params.length} OR
          LOWER(author) LIKE $${params.length} OR
          LOWER(COALESCE(description, '')) LIKE $${params.length} OR
          LOWER(COALESCE(category, '')) LIKE $${params.length}
        )`;
      }

      // Count total matching
      const countRes = (await sql.query(`SELECT COUNT(*)::int as total FROM federation_resources${whereClause}`, params)) as any[];
      const total = countRes[0]?.total || 0;

      // Paginate
      const offset = (page - 1) * limit;
      const dataParams = [...params, limit, offset];
      const dataQuery = `
        SELECT * FROM federation_resources${whereClause}
        ORDER BY CASE WHEN type = 'work' THEN 1 WHEN type = 'paper' THEN 2 ELSE 3 END, federation_id ASC
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}
      `;

      const rows = (await sql.query(dataQuery, dataParams)) as any[];
      const resources = rows.map(formatResource);

      return res.status(200).json({
        success: true,
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
        resources
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

        const countRes = (await sql.query('SELECT COUNT(*)::int as count FROM organizations')) as any[];
        const nextNum = String((countRes[0]?.count || 0) + 1).padStart(6, '0');
        const fedId = `TW-O-${nextNum}`;

        const inserted = (await sql.query(`
          INSERT INTO organizations (
            federation_id, name, name_bn, country, country_flag, type, icon, description, members, verified, focus, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb, NOW())
          RETURNING *
        `, [
          fedId,
          body.name.trim(),
          body.name_bn || body.name.trim(),
          body.country.trim(),
          body.country_flag || '🌍',
          body.org_type || body.type || 'Trade Union',
          body.icon || '🏛️',
          body.desc || body.description || 'Federated socialist network participant.',
          parseInt(body.members, 10) || 10,
          false,
          JSON.stringify(Array.isArray(body.focus) ? body.focus : [body.org_type || 'Solidarity'])
        ])) as any[];

        const newOrg = formatOrganization(inserted[0]);

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
      const countRes = (await sql.query('SELECT COUNT(*)::int as count FROM federation_resources WHERE type = $1', [itemType])) as any[];
      const nextNum = String((countRes[0]?.count || 0) + 1).padStart(6, '0');
      const fedId = `${prefix}${nextNum}`;

      const inserted = (await sql.query(`
        INSERT INTO federation_resources (
          federation_id, type, slug, title, title_bn, title_en, author, year, category, description, identifiers, languages, license, pdf_url, read_url, source_collection, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb, $12::jsonb, $13, $14, $15, $16, NOW())
        RETURNING *
      `, [
        fedId,
        itemType,
        body.slug || fedId,
        body.title.trim(),
        body.title_bn || body.title.trim(),
        body.title_en || body.title.trim(),
        body.author.trim(),
        parseInt(body.year, 10) || new Date().getFullYear(),
        body.category || 'theory',
        body.description || '',
        JSON.stringify({
          openlibrary: body.identifiers?.openlibrary || null,
          wikidata: body.identifiers?.wikidata || null,
          doi: body.identifiers?.doi || null,
          openalex: body.identifiers?.openalex || null
        }),
        JSON.stringify(Array.isArray(body.languages) && body.languages.length ? body.languages : ['bn', 'en']),
        body.license || 'CC-BY-SA 4.0',
        body.pdf_url || null,
        body.read_url || null,
        body.source_collection || 'Federated Peer Node'
      ])) as any[];

      const newResource = formatResource(inserted[0]);

      return res.status(201).json({
        success: true,
        message: 'Resource successfully ingested into socialist federation graph.',
        federation_id: fedId,
        resource: newResource
      });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (err: any) {
    console.error('[Federation API Error]', err);
    return res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
}

