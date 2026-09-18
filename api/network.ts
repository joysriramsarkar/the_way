/**
 * api/network.ts — The Way Socialist Network Engine using Neon PostgreSQL
 * Handles Posts, Comments, Reactions, Profiles, Groups, and Solidarity Campaigns.
 */

import sql from './_lib/db';
import { verifySession } from './_lib/auth';
import movementHandler from './_handlers/movement';
import type { ApiRequest, ApiResponse } from '../types';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.query?._route === 'movement' || (req.url && req.url.includes('/movement'))) {
    return await movementHandler(req, res);
  }

  res.setHeader('Access-Control-Allow-Origin', (req.headers && req.headers.origin) || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const query = req.query || {};
  const action = query.action || 'posts';
  const session = verifySession(req);

  try {
    // ══════════════════════════════════════════════════════════════════
    // 1. POSTS ACTIONS
    // ══════════════════════════════════════════════════════════════════
    if (action === 'posts' || action === 'create_post') {
      if (req.method === 'GET') {
        const filter = query.filter || 'all';
        const lang = query.lang || 'all';
        const limit = Math.min(parseInt((query.limit as string) || '20', 10) || 20, 50);

        let queryStr = `
          SELECT p.*,
            COALESCE(json_agg(c.*) FILTER (WHERE c.id IS NOT NULL), '[]') AS comments
          FROM network_posts p
          LEFT JOIN network_comments c ON c.post_id = p.id
        `;
        const conditions: string[] = [];
        const params: any[] = [];

        if (filter !== 'all') {
          params.push(filter);
          conditions.push(`p.post_type = $${params.length}`);
        }
        if (lang !== 'all') {
          params.push(lang);
          conditions.push(`p.lang = $${params.length}`);
        }

        if (conditions.length > 0) {
          queryStr += ` WHERE ` + conditions.join(' AND ');
        }

        params.push(limit);
        queryStr += ` GROUP BY p.id ORDER BY p.created_at DESC LIMIT $${params.length}`;

        const posts = await sql.query(queryStr, params);

        return res.status(200).json({
          success: true,
          total: posts.length,
          posts
        });
      }

      if (req.method === 'POST') {
        const body = req.body || {};
        const content = (body.content || '').trim();
        if (!content) {
          return res.status(400).json({ error: 'Post content cannot be empty' });
        }

        const authorName = (session && (session.name || session.email)) || 'সম্পাদকীয়';
        const initials = 'এডমিন';
        const postType = body.post_type || body.category || 'post';
        const lang = body.lang || 'bn';
        const postId = 'post_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);

        const rows = await sql.query(`
          INSERT INTO network_posts (id, author, country, country_flag, initials, lang, post_type, content, reactions)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb)
          RETURNING *;
        `, [
          postId,
          authorName,
          body.country || 'আন্তর্জাতিক',
          body.country_flag || '🚩',
          initials,
          lang,
          postType,
          content,
          JSON.stringify({ solidarity: 1 })
        ]);

        return res.status(201).json({ success: true, post: rows[0] });
      }
    }

    // ── REACT TO POST ────────────────────────────────────────────────
    if (action === 'react' && req.method === 'POST') {
      const { postId, post_id } = req.body || {};
      const targetPostId = postId || post_id;
      if (!targetPostId) return res.status(400).json({ error: 'Missing postId' });

      const updated = await sql.query(`
        UPDATE network_posts
        SET reactions = jsonb_set(
          COALESCE(reactions, '{}'::jsonb),
          '{solidarity}',
          (COALESCE((reactions->>'solidarity')::int, 0) + 1)::text::jsonb
        )
        WHERE id = $1
        RETURNING reactions;
      `, [targetPostId]);

      if (!updated || updated.length === 0) return res.status(404).json({ error: 'Post not found' });
      return res.status(200).json({ success: true, reactions: updated[0].reactions });
    }

    // ── ADD COMMENT ──────────────────────────────────────────────────
    if (action === 'comment' && req.method === 'POST') {
      const { postId, post_id, content, author } = req.body || {};
      const targetPostId = postId || post_id;
      if (!targetPostId || !content) return res.status(400).json({ error: 'Missing postId or content' });

      const authorName = (session && (session.name || session.email)) || author || 'সম্পাদকীয়';
      const commentId = 'c_' + Date.now() + '_' + Math.random().toString(36).slice(2, 5);

      const rows = await sql.query(`
        INSERT INTO network_comments (id, post_id, author, content)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
      `, [commentId, targetPostId, authorName, content.trim()]);

      const comments = await sql.query(`
        SELECT * FROM network_comments WHERE post_id = $1 ORDER BY created_at ASC;
      `, [targetPostId]);

      return res.status(201).json({ success: true, comment: rows[0], comments: comments || [rows[0]] });
    }

    // ══════════════════════════════════════════════════════════════════
    // 2. PROFILES / DIRECTORY
    // ══════════════════════════════════════════════════════════════════
    if (action === 'profile' || action === 'profiles' || action === 'people') {
      if (req.method === 'GET') {
        const rows = await sql.query(`
          SELECT id, email, name, role, bio, avatar_url, added_at as created_at
          FROM allowed_admins
          WHERE status = 'active'
          ORDER BY added_at ASC;
        `);
        return res.status(200).json({
          success: true,
          profiles: rows.map(r => ({
            id: r.id,
            name: r.name || 'অ্যাডমিন প্যানেল',
            role: r.role || 'Contributor',
            bio: r.bio || 'দ্য ওয়ে সম্পাদকীয় কর্মী ও লেখক',
            country: 'আন্তর্জাতিক',
            country_flag: '🚩',
            languages: ['বাংলা', 'English']
          }))
        });
      }
    }

    // ══════════════════════════════════════════════════════════════════
    // 3. GROUPS & READING CIRCLES
    // ══════════════════════════════════════════════════════════════════
    if (action === 'groups' || action === 'get_groups') {
      if (req.method === 'GET') {
        const groups = await sql.query(`
          SELECT * FROM network_groups
          ORDER BY members_count DESC;
        `);
        return res.status(200).json({ success: true, total: groups.length, groups });
      }

      if (req.method === 'POST') {
        const body = req.body || {};
        if (!body.name) return res.status(400).json({ error: 'Group name required' });

        const newId = 'grp_' + Date.now();
        const rows = await sql.query(`
          INSERT INTO network_groups (id, name, name_bn, category, lang, members_count, description)
          VALUES ($1, $2, $3, $4, $5, 1, $6)
          RETURNING *;
        `, [
          newId,
          body.name,
          body.name_bn || body.name,
          body.category || 'General',
          body.lang || 'bn',
          body.description || ''
        ]);

        return res.status(201).json({ success: true, group: rows[0] });
      }
    }

    // ══════════════════════════════════════════════════════════════════
    // 4. SOLIDARITY ACTIONS
    // ══════════════════════════════════════════════════════════════════
    if (action === 'solidarity' || action === 'solidarity_requests' || action === 'campaigns') {
      if (req.method === 'GET') {
        const requests = await sql.query(`
          SELECT * FROM solidarity_campaigns
          ORDER BY pledges_count DESC;
        `);
        return res.status(200).json({ success: true, total: requests.length, requests });
      }

      if (req.method === 'POST') {
        const body = req.body || {};
        if (!body.title || !body.organization) {
          return res.status(400).json({ error: 'Title and Organization are required' });
        }

        const newId = 'sol_' + Date.now();
        const rows = await sql.query(`
          INSERT INTO solidarity_campaigns (id, title, organization, country, country_flag, status, description, needs, pledges_count)
          VALUES ($1, $2, $3, $4, $5, 'active', $6, $7::jsonb, 1)
          RETURNING *;
        `, [
          newId,
          body.title,
          body.organization,
          body.country || 'Global',
          body.country_flag || '🌍',
          body.description || '',
          JSON.stringify(body.needs || ['Public Statement'])
        ]);

        return res.status(201).json({ success: true, request: rows[0] });
      }
    }

    // ── PLEDGE SOLIDARITY ────────────────────────────────────────────
    if (action === 'pledge' && req.method === 'POST') {
      const { requestId } = req.body || {};
      if (!requestId) return res.status(400).json({ error: 'Missing requestId' });

      const updated = await sql.query(`
        UPDATE solidarity_campaigns
        SET pledges_count = COALESCE(pledges_count, 0) + 1
        WHERE id = $1
        RETURNING pledges_count;
      `, [requestId]);

      if (!updated || updated.length === 0) return res.status(404).json({ error: 'Solidarity request not found' });

      return res.status(200).json({
        success: true,
        message: 'সংহতি প্রতিজ্ঞা সফলভাবে গৃহীত হয়েছে!',
        count: updated[0].pledges_count
      });
    }

    return res.status(400).json({ error: 'Invalid network action' });
  } catch (err: any) {
    console.error('[Network Handler Error]:', err.message);
    return res.status(500).json({ error: err.message });
  }
}

module.exports = handler;
(module.exports as any).default = handler;
