/**
 * /api/sections.ts — Full CRUD and site layout handler using Neon PostgreSQL
 */

import sql from './_lib/db';
import { verifySession, requireAuth, requireAdmin } from './_lib/auth';
import { logActivity } from './_lib/activity';
import type { ApiRequest, ApiResponse } from '../types';

function rowToAdminSection(row: any) {
  return {
    id:        row.admin_id || row.slug,
    name:      row.name,
    slug:      row.slug || '',
    locked:    row.locked    || false,
    deleted:   row.is_deleted || false,
    deletedAt: row.deleted_at || null,
    createdAt: row.created_at || null,
  };
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const action = req.query && (req.query.action as string);

  try {
    // ── MENU CONFIGURATION ──────────────────────────────────────────────────
    if (action === 'menu') {
      const DEFAULT_MENU_CONFIG = {
        sectionsTitle: 'Sections',
        seriesTitle: 'Featured series',
        series: [
          {
            id: 'series-1',
            title: 'Wondering',
            href: '/section/findings',
            description: 'A series of profound questions explored by The Way (দ্য ওয়ে) experts.',
            enabled: true
          }
        ],
        exploreTitle: 'Explore The Way (দ্য ওয়ে)',
        explore: [
          { id: 'exp-1', label: 'Solidarity Events', href: '/events.html', target: '_self', enabled: true },
          { id: 'exp-2', label: 'Revolutionary Library', href: '/books.html', target: '_self', enabled: true },
          { id: 'exp-3', label: 'Submit Essay', href: '/submit-article.html', target: '_self', enabled: true },
          { id: 'exp-4', label: 'Manifestos & Archives', href: '/section.html?sec=manifestos-archives', target: '_self', enabled: true },
          { id: 'exp-5', label: 'Editorial HQ', href: '/admin-login.html', target: '_self', enabled: true }
        ],
        latestTitle: 'Read the latest',
        latestMode: 'curated',
        latest: [
          {
            id: 'latest-1',
            title: "For families in transition, 'not all traditions are equal'",
            href: '/section/community-heritage',
            imageUrl: 'img1.webp',
            enabled: true
          },
          {
            id: 'latest-2',
            title: 'The art of the pen: How writing shapes cultural identity',
            href: '/section/culture',
            imageUrl: 'img3.webp',
            enabled: true
          }
        ]
      };

      if (req.method === 'GET') {
        const rows = await sql.query('SELECT value FROM site_settings WHERE key = $1 LIMIT 1', ['navigation_menu_config']);
        if (rows && rows[0] && rows[0].value) return res.status(200).json(rows[0].value);
        return res.status(200).json(DEFAULT_MENU_CONFIG);
      }

      if (req.method === 'POST') {
        const session = await requireAuth(req, res);
        if (!session) return;
        const menuConfig = req.body || {};

        await sql.query(`
          INSERT INTO site_settings (key, value, updated_at)
          VALUES ($1, $2::jsonb, NOW())
          ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
        `, ['navigation_menu_config', JSON.stringify(menuConfig)]);

        logActivity({
          actor: session,
          action: 'layout.menu_save',
          category: 'layout',
          summary: `${session.name || session.email} updated Navigation Menu configuration`,
          target_id: 'navigation_menu_config',
          target_name: 'Navigation Menu',
          details: {},
          req
        }).catch(() => {});

        return res.status(200).json({ ok: true, data: menuConfig });
      }
    }

    // ── HEADER CONFIGURATION ────────────────────────────────────────────────
    if (action === 'header') {
      const DEFAULT_HEADER_CONFIG = {
        siteTitle: 'The Way (দ্য ওয়ে)',
        tabTagline: 'Insights, Stories & Heritage',
        browserTabTitle: 'The Way (দ্য ওয়ে) — Insights, Stories & Heritage',
        metaDescription: 'The Official Publication of The Way Society — Cambridge, Massachusetts.',
        faviconUrl: '',
        logoSvg: null,
        logoHeight: 80,
        enabledNavSections: null,
        subsections: [
          { id: 'sub-1', label: 'FAMILY LEGACY', href: '/section/community-heritage', icon: null, enabled: true },
          { id: 'sub-2', label: 'EXPERIENCE', href: '/section/culture', icon: null, enabled: true },
          { id: 'sub-3', label: 'RESEARCH & VALUES', href: '/section/privacy-values', icon: null, enabled: true },
          { id: 'sub-4', label: 'PERSPECTIVES', href: '/section/opinion', icon: null, enabled: true }
        ],
        social: [
          { id: 'soc-1', platform: 'instagram', label: 'Instagram', href: 'https://instagram.com', enabled: true },
          { id: 'soc-2', platform: 'linkedin', label: 'LinkedIn', href: 'https://linkedin.com', enabled: true },
          { id: 'soc-3', platform: 'tiktok', label: 'TikTok', href: 'https://tiktok.com', enabled: true },
          { id: 'soc-4', platform: 'facebook', label: 'Facebook', href: 'https://facebook.com', enabled: true },
          { id: 'soc-5', platform: 'youtube', label: 'YouTube', href: 'https://youtube.com', enabled: true }
        ]
      };

      if (req.method === 'GET') {
        const rows = await sql.query('SELECT value FROM site_settings WHERE key = $1 LIMIT 1', ['site_header_config']);
        if (rows && rows[0] && rows[0].value) return res.status(200).json(rows[0].value);
        return res.status(200).json(DEFAULT_HEADER_CONFIG);
      }

      if (req.method === 'POST') {
        const session = await requireAuth(req, res);
        if (!session) return;
        const headerConfig = req.body || {};

        await sql.query(`
          INSERT INTO site_settings (key, value, updated_at)
          VALUES ($1, $2::jsonb, NOW())
          ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
        `, ['site_header_config', JSON.stringify(headerConfig)]);

        logActivity({
          actor: session,
          action: 'layout.header_save',
          category: 'layout',
          summary: `${session.name || session.email} updated Header configuration & site title`,
          target_id: 'site_header_config',
          target_name: 'Header Settings',
          details: {},
          req
        }).catch(() => {});

        return res.status(200).json({ ok: true, data: headerConfig });
      }
    }

    // ── HOMEPAGE CONFIGURATION ──────────────────────────────────────────────
    if (action === 'homepage') {
      const DEFAULT_HOMEPAGE_CONFIG = {
        hero: {
          main: {
            articleId: null,
            title: 'Karl Marx and Historical Materialism: Understanding Class Struggle in Modern Capitalism.',
            subtitle: 'An exclusive exploration of family heritage, intellectual tradition, and the enduring power of private knowledge.',
            imageUrl: 'img1.webp',
            href: '/section/findings',
            enabled: true
          },
          sidebar: [
            {
              id: 'h-side-1',
              articleId: null,
              title: 'Lenin and the Theory of Imperialism: How Finance Capital Dominates Global Trade',
              description: 'From the Paris Commune to October 1917: Lessons of working-class governance and power',
              imageUrl: 'img5.webp',
              tag: 'Heritage Archive',
              href: '/section/community-heritage',
              enabled: true
            },
            {
              id: 'h-side-2',
              articleId: null,
              title: 'Stalin’s Problems of Leninism: Preserving the Dictatorship of the Proletariat',
              description: "The family's influence on culture, art, and intellectual discourse runs deeper than most realize",
              imageUrl: 'img6.webp',
              tag: '',
              href: '/section/culture',
              enabled: true
            }
          ]
        },
        smallArticles: [
          {
            id: 'sm-1',
            articleId: null,
            title: 'Mao Zedong and the Cultural Revolution: Ideological Struggle Under Socialism',
            imageUrl: 'img2.webp',
            href: '/section/community-heritage',
            enabled: true
          },
          {
            id: 'sm-2',
            articleId: null,
            title: 'Why handwritten correspondence is making a private comeback',
            imageUrl: 'img3.webp',
            href: '/section/culture',
            enabled: true
          },
          {
            id: 'sm-3',
            articleId: null,
            title: 'Engels on the Origin of the Family, Private Property, and the State',
            imageUrl: 'img4.webp',
            href: '/section/privacy-values',
            enabled: true
          }
        ],
        eventsSection: {
          eventsHeading: 'Upcoming Events',
          seeAllText: 'See all events',
          seeAllHref: '/events.html',
          events: [
            {
              id: 'ev-1',
              date: 'Sep. 22, 2026',
              title: 'Debate, Debrief, and Dissect: The Role of Privacy in the Modern Family and American Life',
              meta: '4 p.m. Thursday ■ International Anti-Imperialist Forum, Geneva & Livestream',
              href: '/events.html',
              enabled: true
            },
            {
              id: 'ev-2',
              date: 'Oct. 16, 2026',
              title: 'Global Labor Strike and Multipolar Economic Solidarity',
              meta: '4 p.m. Friday ■ Socialist Research Institute, Global Hub',
              href: '/events.html',
              enabled: true
            }
          ],
          featured: {
            articleId: null,
            title: "Rubies decoded: 'Heritage is just one piece of the puzzle'",
            description: 'Rare archival manifestos shine in new Socialist retrospective',
            imageUrl: 'img5.webp',
            href: '/section/community-heritage',
            enabled: true
          }
        }
      };

      if (req.method === 'GET') {
        const rows = await sql.query('SELECT value FROM site_settings WHERE key = $1 LIMIT 1', ['site_homepage_config']);
        if (rows && rows[0] && rows[0].value) return res.status(200).json(rows[0].value);
        return res.status(200).json(DEFAULT_HOMEPAGE_CONFIG);
      }

      if (req.method === 'POST') {
        const session = await requireAuth(req, res);
        if (!session) return;
        const homepageConfig = req.body || {};

        await sql.query(`
          INSERT INTO site_settings (key, value, updated_at)
          VALUES ($1, $2::jsonb, NOW())
          ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
        `, ['site_homepage_config', JSON.stringify(homepageConfig)]);

        logActivity({
          actor: session,
          action: 'layout.homepage_save',
          category: 'layout',
          summary: `${session.name || session.email} updated Homepage builder configuration`,
          target_id: 'site_homepage_config',
          target_name: 'Homepage Builder',
          details: {},
          req
        }).catch(() => {});

        return res.status(200).json({ ok: true, data: homepageConfig });
      }
    }

    // ── FOOTER CONFIGURATION ────────────────────────────────────────────────
    if (action === 'footer') {
      const DEFAULT_FOOTER_CONFIG = {
        sectionsTitle: 'Sections',
        enabledSections: null,
        exploreTitle: 'Explore The Way (দ্য ওয়ে)',
        explore: [
          { id: 'f-exp-1', label: 'Events', href: '/events.html', target: '_self', enabled: true },
          { id: 'f-exp-2', label: 'Article archive', href: '/', target: '_self', enabled: true },
          { id: 'f-exp-3', label: 'About us', href: '/', target: '_self', enabled: true }
        ],
        seriesTitle: 'Our recent series',
        series: [
          {
            id: 'f-ser-1',
            title: 'Wondering',
            href: '/section/findings',
            description: 'A series of profound questions explored by The Way (দ্য ওয়ে) experts.',
            enabled: true
          }
        ],
        socialTitle: 'Follow us on',
        social: [
          { id: 'f-soc-1', platform: 'instagram', label: 'Instagram', href: 'https://instagram.com', enabled: true },
          { id: 'f-soc-2', platform: 'linkedin', label: 'LinkedIn', href: 'https://linkedin.com', enabled: true }
        ],
        logoSvg: '',
        logoHeight: 80,
        tagline: 'The Official Publication of The Way Society',
        copyright: '© 2026 The Way (দ্য ওয়ে). All rights reserved.',
        bottomLinks: [
          { id: 'f-bot-4', label: 'Privacy Policy', href: '#', target: '_self', enabled: true }
        ]
      };

      if (req.method === 'GET') {
        const rows = await sql.query('SELECT value FROM site_settings WHERE key = $1 LIMIT 1', ['site_footer_config']);
        if (rows && rows[0] && rows[0].value) return res.status(200).json(rows[0].value);
        return res.status(200).json(DEFAULT_FOOTER_CONFIG);
      }

      if (req.method === 'POST') {
        const session = await requireAuth(req, res);
        if (!session) return;
        const footerConfig = req.body || {};

        await sql.query(`
          INSERT INTO site_settings (key, value, updated_at)
          VALUES ($1, $2::jsonb, NOW())
          ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
        `, ['site_footer_config', JSON.stringify(footerConfig)]);

        logActivity({
          actor: session,
          action: 'layout.footer_save',
          category: 'layout',
          summary: `${session.name || session.email} updated Footer layout configuration`,
          target_id: 'site_footer_config',
          target_name: 'Footer Layout',
          details: {},
          req
        }).catch(() => {});

        return res.status(200).json({ ok: true, data: footerConfig });
      }
    }

    // ── SECTION CUSTOM CONFIG ───────────────────────────────────────────────
    if (action === 'section-config') {
      const slug = (req.query && (req.query.slug as string)) || (req.body && req.body.slug) || 'all';

      if (req.method === 'GET') {
        const rows = await sql.query('SELECT value FROM site_settings WHERE key = $1 LIMIT 1', ['sections_custom_configs']);
        const allConfigs = (rows && rows[0] && rows[0].value) || {};
        if (req.query.all === '1' || !req.query.slug) {
          return res.status(200).json(allConfigs);
        }
        return res.status(200).json(allConfigs[slug] || {
          featuredArticleId: null,
          selectedArticleIds: [],
          customTitle: '',
          description: ''
        });
      }

      if (req.method === 'POST') {
        const session = await requireAuth(req, res);
        if (!session) return;

        const payload = req.body || {};
        const rows = await sql.query('SELECT value FROM site_settings WHERE key = $1 LIMIT 1', ['sections_custom_configs']);
        const allConfigs = (rows && rows[0] && rows[0].value) || {};

        allConfigs[slug] = {
          featuredArticleId: payload.featuredArticleId || null,
          selectedArticleIds: Array.isArray(payload.selectedArticleIds) ? payload.selectedArticleIds.slice(0, 4) : [],
          customTitle: payload.customTitle || '',
          description: payload.description || '',
          updatedAt: new Date().toISOString()
        };

        await sql.query(`
          INSERT INTO site_settings (key, value, updated_at)
          VALUES ($1, $2::jsonb, NOW())
          ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
        `, ['sections_custom_configs', JSON.stringify(allConfigs)]);

        return res.status(200).json({ ok: true, data: allConfigs[slug] });
      }
    }

    // ── SECTIONS CRUD (GET / POST / PUT / PATCH / DELETE) ───────────────────
    if (req.method === 'GET') {
      const statusParam = (req.query && (req.query.status as string)) || 'active';
      const session = verifySession(req);

      let rows: any[] = [];
      if (statusParam === 'all' && session) {
        rows = await sql.query(`
          SELECT * FROM sections
          WHERE is_deleted = FALSE OR is_deleted IS NULL
          ORDER BY display_order ASC;
        `);
        return res.status(200).json(rows.map(rowToAdminSection));
      } else {
        rows = await sql.query(`
          SELECT name, slug, display_order FROM sections
          WHERE is_active = TRUE AND is_deleted = FALSE AND (locked = FALSE OR locked IS NULL)
          ORDER BY display_order ASC;
        `);
        return res.status(200).json(rows);
      }
    }

    if (req.method === 'POST') {
      const session = await requireAuth(req, res);
      if (!session) return;

      const body = req.body || {};
      const name = (body.name || '').trim();
      const slug = (body.slug || '').trim();
      const adminId = (body.admin_id || slug || '').trim();

      if (!name) return res.status(400).json({ error: 'name is required' });
      if (!slug) return res.status(400).json({ error: 'slug is required' });

      const existing = await sql.query(
        'SELECT id FROM sections WHERE (name = $1 OR slug = $2 OR admin_id = $3) AND is_deleted = FALSE LIMIT 1',
        [name, slug, adminId]
      );
      if (existing && existing.length > 0) {
        return res.status(409).json({ error: 'A section with that name or slug already exists.' });
      }

      const maxRow = await sql.query('SELECT display_order FROM sections ORDER BY display_order DESC LIMIT 1');
      const nextOrder = (maxRow && maxRow[0] ? maxRow[0].display_order : 0) + 1;

      const created = await sql.query(`
        INSERT INTO sections (name, slug, admin_id, display_order, is_active, locked, is_deleted)
        VALUES ($1, $2, $3, $4, TRUE, FALSE, FALSE)
        RETURNING *;
      `, [name, slug, adminId, nextOrder]);

      const data = created[0];

      logActivity({
        actor: session,
        action: 'section.create',
        category: 'sections',
        summary: `${session.name || session.email} created new section "${name}" (/section/${slug})`,
        target_id: adminId,
        target_name: name,
        details: { slug, name, admin_id: adminId },
        req
      }).catch(() => {});

      return res.status(201).json(rowToAdminSection(data));
    }

    if (req.method === 'PUT') {
      const session = await requireAuth(req, res);
      if (!session) return;

      const id = req.query && (req.query.id as string);
      const body = req.body || {};
      const name = (body.name || '').trim();
      const slug = (body.slug || '').trim();

      if (!id) return res.status(400).json({ error: 'id (admin_id) is required' });
      if (!name) return res.status(400).json({ error: 'name is required' });

      const updated = await sql.query(`
        UPDATE sections
        SET name = $1, slug = $2
        WHERE admin_id = $3 OR slug = $3
        RETURNING *;
      `, [name, slug, id]);

      if (!updated || updated.length === 0) return res.status(404).json({ error: 'Section not found' });
      const data = updated[0];

      logActivity({
        actor: session,
        action: 'section.edit',
        category: 'sections',
        summary: `${session.name || session.email} renamed section ID "${id}" to "${name}" (/section/${slug})`,
        target_id: id,
        target_name: name,
        details: { slug, name },
        req
      }).catch(() => {});

      return res.status(200).json(rowToAdminSection(data));
    }

    if (req.method === 'PATCH') {
      const session = await requireAuth(req, res);
      if (!session) return;

      const id = req.query && (req.query.id as string);
      if (!id) return res.status(400).json({ error: 'id (admin_id) is required' });

      const restored = await sql.query(`
        UPDATE sections
        SET is_active = TRUE, is_deleted = FALSE, deleted_at = NULL
        WHERE admin_id = $1 OR slug = $1
        RETURNING *;
      `, [id]);

      if (!restored || restored.length === 0) return res.status(404).json({ error: 'Section not found' });
      return res.status(200).json(rowToAdminSection(restored[0]));
    }

    if (req.method === 'DELETE') {
      const id = req.query && (req.query.id as string);
      const mode = req.query && (req.query.mode as string);
      if (!id) return res.status(400).json({ error: 'id (admin_id) is required' });

      if (id === 'all' || id.toLowerCase() === 'all') {
        return res.status(400).json({ error: 'The "All" section is a permanent core section and cannot be deleted.' });
      }

      if (mode === 'permanent') {
        const session = await requireAdmin(req, res);
        if (!session) return;

        await sql.query('DELETE FROM sections WHERE admin_id = $1 OR slug = $1', [id]);
        return res.status(200).json({ ok: true });
      }

      const session = await requireAuth(req, res);
      if (!session) return;

      const trashed = await sql.query(`
        UPDATE sections
        SET is_active = FALSE, is_deleted = TRUE, deleted_at = NOW()
        WHERE admin_id = $1 OR slug = $1
        RETURNING *;
      `, [id]);

      if (!trashed || trashed.length === 0) return res.status(404).json({ error: 'Section not found' });
      return res.status(200).json(rowToAdminSection(trashed[0]));
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    console.error('[Sections Handler Error]:', err.message);
    return res.status(500).json({ error: err.message });
  }
}

