/**
 * api/network.ts — The Way Socialist Network Engine using Neon PostgreSQL
 * Handles Posts, Comments, Reactions, Profiles, Groups, Events, Follows, and Solidarity.
 */

import sql from './_lib/db';
import { verifySession } from './_lib/auth';
import movementHandler from './_handlers/movement';
import type { ApiRequest, ApiResponse } from '../types';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.query?._route === 'movement' || (req.url && req.url.includes('/movement'))) {
    return await movementHandler(req, res);
  }

  const origin = req.headers?.origin as string;
  const allowedOrigins = [
    'https://thewaysocialist.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000'
  ];
  if (origin && (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app'))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (!origin) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

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

        // Following Feed Filter
        if (filter === 'following') {
          if (session) {
            const followRows = await sql.query('SELECT following_email FROM follows WHERE follower_email = $1', [session.email]);
            const followingEmails = followRows.map((r: any) => r.following_email);
            if (followingEmails.length === 0) {
              return res.status(200).json({
                success: true,
                total: 0,
                posts: [],
                message: 'আপনি এখনও কাউকে অনুসরণ করেননি।'
              });
            }
            params.push(followingEmails);
            conditions.push(`LOWER(p.author_email) = ANY($${params.length})`);
          } else {
            return res.status(200).json({
              success: true,
              total: 0,
              posts: [],
              message: 'অনুসরণকৃতদের পোস্ট দেখতে লগইন করুন।'
            });
          }
        } else if (filter !== 'all') {
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
        // Enforce Authentication
        if (!session) {
          return res.status(401).json({ error: 'পোস্ট করার জন্য লগইন আবশ্যক (Authentication required to publish post).' });
        }

        const body = req.body || {};
        const content = (body.content || '').trim();
        if (!content) {
          return res.status(400).json({ error: 'Post content cannot be empty' });
        }

        // Author is derived strictly from authenticated session
        const authorName = session.name || session.email;
        const authorEmail = session.email;
        const initials = authorName.slice(0, 2).toUpperCase();
        const postType = body.post_type || body.category || 'post';
        const lang = body.lang || 'bn';
        const postId = 'post_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);

        const rows = await sql.query(`
          INSERT INTO network_posts (id, author, author_email, country, country_flag, initials, lang, post_type, content, reactions)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb)
          RETURNING *;
        `, [
          postId,
          authorName,
          authorEmail,
          body.country || 'আন্তর্জাতিক',
          body.country_flag || '🚩',
          initials,
          lang,
          postType,
          content,
          JSON.stringify({ solidarity: 1 })
        ]);

        // Auto-react by author
        try {
          await sql.query(`
            INSERT INTO post_reactions (post_id, user_email, reaction_type)
            VALUES ($1, $2, 'solidarity')
            ON CONFLICT DO NOTHING;
          `, [postId, authorEmail]);
        } catch (e) {}

        return res.status(201).json({ success: true, post: rows[0] });
      }
    }

    // ── REACT TO POST (1 User = 1 Reaction with Toggle) ───────────────
    if (action === 'react' && req.method === 'POST') {
      if (!session) {
        return res.status(401).json({ error: 'সংহতি প্রকাশের জন্য লগইন আবশ্যক (Authentication required to react).' });
      }

      const { postId, post_id, type } = req.body || {};
      const targetPostId = postId || post_id;
      if (!targetPostId) return res.status(400).json({ error: 'Missing postId' });

      const reactionType = type || 'solidarity';
      const userEmail = session.email;

      // Check if user already reacted
      const existing = await sql.query(
        'SELECT id FROM post_reactions WHERE post_id = $1 AND user_email = $2 AND reaction_type = $3 LIMIT 1',
        [targetPostId, userEmail, reactionType]
      );

      let userReacted = false;
      if (existing && existing.length > 0) {
        // Toggle OFF (remove reaction)
        await sql.query('DELETE FROM post_reactions WHERE id = $1', [existing[0].id]);
        await sql.query(`
          UPDATE network_posts
          SET reactions = jsonb_set(
            COALESCE(reactions, '{}'::jsonb),
            '{solidarity}',
            GREATEST(0, (COALESCE((reactions->>'solidarity')::int, 1) - 1))::text::jsonb
          )
          WHERE id = $1
        `, [targetPostId]);
        userReacted = false;
      } else {
        // Toggle ON (add reaction)
        await sql.query(
          'INSERT INTO post_reactions (post_id, user_email, reaction_type) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
          [targetPostId, userEmail, reactionType]
        );
        await sql.query(`
          UPDATE network_posts
          SET reactions = jsonb_set(
            COALESCE(reactions, '{}'::jsonb),
            '{solidarity}',
            (COALESCE((reactions->>'solidarity')::int, 0) + 1)::text::jsonb
          )
          WHERE id = $1
        `, [targetPostId]);
        userReacted = true;
      }

      const updated = await sql.query('SELECT reactions FROM network_posts WHERE id = $1', [targetPostId]);
      if (!updated || updated.length === 0) return res.status(404).json({ error: 'Post not found' });

      const count = (updated[0].reactions && updated[0].reactions.solidarity) || 0;
      return res.status(200).json({ success: true, count, reactions: updated[0].reactions, userReacted });
    }

    // ── ADD COMMENT ──────────────────────────────────────────────────
    if (action === 'comment' && req.method === 'POST') {
      if (!session) {
        return res.status(401).json({ error: 'মন্তব্য করার জন্য লগইন আবশ্যক (Authentication required to comment).' });
      }

      const { postId, post_id, content } = req.body || {};
      const targetPostId = postId || post_id;
      if (!targetPostId || !content) return res.status(400).json({ error: 'Missing postId or content' });

      // Author name is taken strictly from authenticated session
      const authorName = session.name || session.email;
      const authorEmail = session.email;
      const commentId = 'c_' + Date.now() + '_' + Math.random().toString(36).slice(2, 5);

      const rows = await sql.query(`
        INSERT INTO network_comments (id, post_id, author, author_email, content)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
      `, [commentId, targetPostId, authorName, authorEmail, content.trim()]);

      const comments = await sql.query(`
        SELECT * FROM network_comments WHERE post_id = $1 ORDER BY created_at ASC;
      `, [targetPostId]);

      return res.status(201).json({ success: true, comment: rows[0], comments: comments || [rows[0]] });
    }

    // ══════════════════════════════════════════════════════════════════
    // 2. FOLLOW SYSTEM
    // ══════════════════════════════════════════════════════════════════
    if (action === 'follow' && req.method === 'POST') {
      if (!session) {
        return res.status(401).json({ error: 'অনুসরণ করার জন্য লগইন আবশ্যক (Authentication required to follow).' });
      }

      const { targetEmail, target_email } = req.body || {};
      const followingEmail = (targetEmail || target_email || query.targetEmail || '').trim().toLowerCase();

      if (!followingEmail || followingEmail === session.email.toLowerCase()) {
        return res.status(400).json({ error: 'Invalid target user to follow' });
      }

      await sql.query(`
        INSERT INTO follows (follower_email, following_email)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING;
      `, [session.email.toLowerCase(), followingEmail]);

      const countRows = await sql.query('SELECT COUNT(*) as count FROM follows WHERE LOWER(following_email) = LOWER($1)', [followingEmail]);
      const followersCount = parseInt(countRows[0]?.count || '0', 10);

      return res.status(200).json({ success: true, following: true, followers_count: followersCount });
    }

    if (action === 'unfollow' && req.method === 'POST') {
      if (!session) {
        return res.status(401).json({ error: 'লগইন আবশ্যক' });
      }

      const { targetEmail, target_email } = req.body || {};
      const followingEmail = (targetEmail || target_email || query.targetEmail || '').trim().toLowerCase();

      await sql.query('DELETE FROM follows WHERE LOWER(follower_email) = LOWER($1) AND LOWER(following_email) = LOWER($2)', [session.email.toLowerCase(), followingEmail]);

      const countRows = await sql.query('SELECT COUNT(*) as count FROM follows WHERE LOWER(following_email) = LOWER($1)', [followingEmail]);
      const followersCount = parseInt(countRows[0]?.count || '0', 10);

      return res.status(200).json({ success: true, following: false, followers_count: followersCount });
    }

    if (action === 'follow_status' && req.method === 'GET') {
      const targetEmail = ((query.targetEmail || query.email || '') as string).trim().toLowerCase();
      let isFollowing = false;

      if (session && targetEmail) {
        const rows = await sql.query(
          'SELECT 1 FROM follows WHERE LOWER(follower_email) = LOWER($1) AND LOWER(following_email) = LOWER($2) LIMIT 1',
          [session.email.toLowerCase(), targetEmail]
        );
        isFollowing = rows.length > 0;
      }

      const fCount = await sql.query('SELECT COUNT(*) as count FROM follows WHERE LOWER(following_email) = LOWER($1)', [targetEmail]);
      const fgCount = await sql.query('SELECT COUNT(*) as count FROM follows WHERE LOWER(follower_email) = LOWER($1)', [targetEmail]);

      return res.status(200).json({
        success: true,
        is_following: isFollowing,
        followers_count: parseInt(fCount[0]?.count || '0', 10),
        following_count: parseInt(fgCount[0]?.count || '0', 10)
      });
    }

    // ══════════════════════════════════════════════════════════════════
    // 3. PROFILES / DIRECTORY
    // ══════════════════════════════════════════════════════════════════
    if (action === 'profile' && req.method === 'GET') {
      let targetId = ((query.id || query.user || query.email || (session ? session.email : '')) as string).trim();
      if (!targetId || targetId === 'default' || targetId === 'me') {
        if (session && session.email) {
          targetId = session.email;
        } else {
          const firstAdmin = await sql.query("SELECT email FROM allowed_admins WHERE status = 'active' ORDER BY added_at ASC LIMIT 1");
          targetId = firstAdmin[0]?.email || '';
        }
      }

      if (!targetId) {
        return res.status(404).json({
          success: false,
          error: 'profile_not_found',
          message: 'প্রোফাইল পাওয়া যায়নি।'
        });
      }

      const rows = await sql.query(`
        SELECT id, email, name, role, bio, avatar_url, added_at as created_at
        FROM allowed_admins
        WHERE status = 'active' AND (id::text = $1 OR LOWER(email) = LOWER($1) OR LOWER(name) = LOWER($1))
        LIMIT 1;
      `, [targetId]);

      const user = rows[0];
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'profile_not_found',
          message: 'প্রোফাইল পাওয়া যায়নি।'
        });
      }

      // Real database-calculated contributions
      const fCount = await sql.query('SELECT COUNT(*) as count FROM follows WHERE LOWER(following_email) = LOWER($1)', [user.email]);
      const fgCount = await sql.query('SELECT COUNT(*) as count FROM follows WHERE LOWER(follower_email) = LOWER($1)', [user.email]);
      const artCount = await sql.query('SELECT COUNT(*) as count FROM articles WHERE (author = $1 OR created_by = $2) AND is_deleted = false', [user.name, user.email]);
      const trCount = await sql.query('SELECT COUNT(*) as count FROM translations WHERE LOWER(translator_email) = LOWER($1)', [user.email]);
      const grpCount = await sql.query('SELECT COUNT(*) as count FROM group_members WHERE LOWER(user_email) = LOWER($1)', [user.email]);

      // Real posts, articles, translations
      const userPosts = await sql.query(`
        SELECT id, content, created_at, reactions
        FROM network_posts
        WHERE LOWER(author_email) = LOWER($1) OR author = $2
        ORDER BY created_at DESC LIMIT 20;
      `, [user.email, user.name]);

      const userArticles = await sql.query(`
        SELECT id, slug, title, section_slug as section, created_at
        FROM articles
        WHERE (author = $1 OR created_by = $2) AND is_deleted = false
        ORDER BY created_at DESC LIMIT 20;
      `, [user.name, user.email]);

      const userTranslations = await sql.query(`
        SELECT id, source_title as title, source_lang, target_lang
        FROM translations
        WHERE LOWER(translator_email) = LOWER($1) OR LOWER(translator) = LOWER($2)
        ORDER BY updated_at DESC LIMIT 20;
      `, [user.email, user.name]);

      return res.status(200).json({
        success: true,
        profile: {
          id: user.id,
          name: user.name || user.email.split('@')[0],
          display_name: user.name || user.email.split('@')[0],
          email: user.email,
          role: user.role,
          bio: user.bio || 'দ্য ওয়ে আন্তর্জাতিক সমাজতান্ত্রিক সংহতি ও চিন্তন নেটওয়ার্কের সক্রিয় সদস্য।',
          country: 'বাংলাদেশ / আন্তর্জাতিক',
          country_name: 'বাংলাদেশ / আন্তর্জাতিক',
          country_flag: '🚩',
          languages: ['বাংলা', 'English'],
          stats: {
            followers: parseInt(fCount[0]?.count || '0', 10),
            following: parseInt(fgCount[0]?.count || '0', 10),
            articles: parseInt(artCount[0]?.count || '0', 10),
            translations: parseInt(trCount[0]?.count || '0', 10),
            circles: parseInt(grpCount[0]?.count || '0', 10)
          },
          posts: userPosts.map((p: any) => ({
            id: p.id,
            content: p.content,
            created_at: p.created_at,
            likes: (p.reactions && p.reactions.solidarity) || 0
          })),
          articles: userArticles,
          translations: userTranslations,
          is_verified: user.role === 'Admin' || user.role === 'Editor'
        }
      });
    }

    if (action === 'profiles' || action === 'people') {
      if (req.method === 'GET') {
        const rows = await sql.query(`
          SELECT a.id, a.email, a.name, a.role, a.bio, a.avatar_url, a.added_at,
            (SELECT COUNT(*) FROM articles WHERE (author = a.name OR created_by = a.email) AND is_deleted = false) as articles_count,
            (SELECT COUNT(*) FROM follows WHERE LOWER(following_email) = LOWER(a.email)) as followers_count
          FROM allowed_admins a
          WHERE a.status = 'active'
          ORDER BY a.added_at ASC;
        `);

        return res.status(200).json({
          success: true,
          total: rows.length,
          profiles: rows.map((r: any) => ({
            id: r.id,
            name: r.name || r.email.split('@')[0],
            email: r.email,
            role: r.role || 'Contributor',
            bio: r.bio || 'দ্য ওয়ে সম্পাদকীয় কর্মী ও মুক্ত সমাজতান্ত্রিক চিন্তক',
            country: 'আন্তর্জাতিক',
            country_flag: '🚩',
            languages: ['bn', 'en'],
            followers: parseInt(r.followers_count || '0', 10),
            articles: parseInt(r.articles_count || '0', 10),
            translations: 0,
            verified: r.role === 'Admin' || r.role === 'Editor'
          }))
        });
      }
    }

    // ══════════════════════════════════════════════════════════════════
    // 4. GROUPS & MEMBERSHIPS
    // ══════════════════════════════════════════════════════════════════
    if (action === 'groups' || action === 'get_groups') {
      if (req.method === 'GET') {
        const groups = await sql.query(`
          SELECT g.*,
            (SELECT COUNT(*) FROM group_members gm WHERE gm.group_id = g.id) as real_members_count
          FROM network_groups g
          ORDER BY g.created_at ASC;
        `);
        return res.status(200).json({
          success: true,
          total: groups.length,
          groups: groups.map((g: any) => ({
            ...g,
            members_count: Math.max(parseInt(g.members_count || '0', 10), parseInt(g.real_members_count || '0', 10))
          }))
        });
      }

      if (req.method === 'POST') {
        if (!session) {
          return res.status(401).json({ error: 'গ্রুপ তৈরির জন্য লগইন আবশ্যক' });
        }

        const body = req.body || {};
        if (!body.name) return res.status(400).json({ error: 'Group name required' });

        const newId = 'grp_' + Date.now();
        const rows = await sql.query(`
          INSERT INTO network_groups (id, name, name_bn, category, group_type, lang, members_count, description, created_by)
          VALUES ($1, $2, $3, $4, $5, $6, 1, $7, $8)
          RETURNING *;
        `, [
          newId,
          body.name,
          body.name_bn || body.name,
          body.category || 'General',
          body.group_type || 'study_group',
          body.lang || 'bn',
          body.description || '',
          session.email
        ]);

        // Auto-join creator as organizer
        await sql.query(`
          INSERT INTO group_members (group_id, user_email, role)
          VALUES ($1, $2, 'organizer')
          ON CONFLICT DO NOTHING;
        `, [newId, session.email]);

        return res.status(201).json({ success: true, group: rows[0] });
      }
    }

    if (action === 'join_group' && req.method === 'POST') {
      if (!session) return res.status(401).json({ error: 'গ্রুপে যোগদানের জন্য লগইন আবশ্যক' });

      const { groupId, group_id } = req.body || {};
      const targetGroupId = groupId || group_id;
      if (!targetGroupId) return res.status(400).json({ error: 'Missing groupId' });

      await sql.query(`
        INSERT INTO group_members (group_id, user_email, role, status)
        VALUES ($1, $2, 'member', 'active')
        ON CONFLICT DO NOTHING;
      `, [targetGroupId, session.email]);

      const countRows = await sql.query('SELECT COUNT(*) as count FROM group_members WHERE group_id = $1', [targetGroupId]);
      const membersCount = parseInt(countRows[0]?.count || '1', 10);

      await sql.query('UPDATE network_groups SET members_count = $1 WHERE id = $2', [membersCount, targetGroupId]);

      return res.status(200).json({ success: true, joined: true, members_count: membersCount });
    }

    if (action === 'leave_group' && req.method === 'POST') {
      if (!session) return res.status(401).json({ error: 'লগইন আবশ্যক' });

      const { groupId, group_id } = req.body || {};
      const targetGroupId = groupId || group_id;
      if (!targetGroupId) return res.status(400).json({ error: 'Missing groupId' });

      await sql.query('DELETE FROM group_members WHERE group_id = $1 AND user_email = $2', [targetGroupId, session.email]);

      const countRows = await sql.query('SELECT COUNT(*) as count FROM group_members WHERE group_id = $1', [targetGroupId]);
      const membersCount = parseInt(countRows[0]?.count || '0', 10);

      await sql.query('UPDATE network_groups SET members_count = $1 WHERE id = $2', [membersCount, targetGroupId]);

      return res.status(200).json({ success: true, joined: false, members_count: membersCount });
    }

    // ══════════════════════════════════════════════════════════════════
    // 5. EVENTS ARCHITECTURE
    // ══════════════════════════════════════════════════════════════════
    if (action === 'events' || action === 'calendar') {
      if (req.method === 'GET') {
        const filter = query.filter || 'all';
        let queryStr = 'SELECT * FROM events';
        const conditions: string[] = [];

        if (filter === 'upcoming') {
          conditions.push(`start_at >= NOW()`);
        } else if (filter === 'past') {
          conditions.push(`start_at < NOW()`);
        }

        if (conditions.length > 0) {
          queryStr += ' WHERE ' + conditions.join(' AND ');
        }

        queryStr += ' ORDER BY start_at ASC LIMIT 50;';
        const events = await sql.query(queryStr);

        return res.status(200).json({
          success: true,
          total: events.length,
          events
        });
      }

      if (req.method === 'POST') {
        if (!session) return res.status(401).json({ error: 'অনুষ্ঠান সৃষ্টির জন্য লগইন আবশ্যক' });

        const body = req.body || {};
        if (!body.title || !body.start_at) {
          return res.status(400).json({ error: 'Title and start_at are required' });
        }

        const newId = 'evt_' + Date.now();
        const rows = await sql.query(`
          INSERT INTO events (id, title, title_bn, description, event_type, language, start_at, timezone, country, country_flag, city, online_url, organizer, organizer_email, status)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'upcoming')
          RETURNING *;
        `, [
          newId,
          body.title,
          body.title_bn || body.title,
          body.description || '',
          body.event_type || 'study_circle',
          body.language || 'bn',
          body.start_at,
          body.timezone || 'Asia/Dhaka',
          body.country || 'Bangladesh',
          body.country_flag || '🇧🇩',
          body.city || '',
          body.online_url || '',
          body.organizer || session.name || 'কমরেড কালেক্টিভ',
          session.email
        ]);

        return res.status(201).json({ success: true, event: rows[0] });
      }
    }

    // ══════════════════════════════════════════════════════════════════
    // 6. SOLIDARITY ACTIONS
    // ══════════════════════════════════════════════════════════════════
    if (action === 'solidarity' || action === 'solidarity_requests' || action === 'campaigns') {
      if (req.method === 'GET') {
        const requests = await sql.query(`
          SELECT * FROM solidarity_campaigns
          ORDER BY pledges_count DESC;
        `);
        return res.status(200).json({ success: true, total: requests.length, requests, campaigns: requests });
      }

      if (req.method === 'POST') {
        if (!session) return res.status(401).json({ error: 'সংহতি আবেদন তৈরির জন্য লগইন আবশ্যক' });

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

    // ══════════════════════════════════════════════════════════════════
    // 7. ORGANIZATIONS CATALOG
    // ══════════════════════════════════════════════════════════════════
    if (action === 'organizations' || action === 'orgs') {
      const rows = await sql.query(`
        SELECT * FROM organizations
        ORDER BY created_at DESC;
      `);
      const orgs = (rows || []).map((o: any) => ({
        id: o.federation_id || o.id,
        federation_id: o.federation_id,
        name: o.name,
        name_bn: o.name_bn || o.name,
        country: o.country,
        country_flag: o.country_flag || '🌍',
        type: o.type,
        icon: o.icon || '🏛️',
        desc: o.description,
        description: o.description,
        members: o.members || 1,
        verified: Boolean(o.verified),
        focus: Array.isArray(o.focus) ? o.focus : (typeof o.focus === 'string' ? JSON.parse(o.focus) : []),
        website: o.website || ''
      }));

      return res.status(200).json({
        success: true,
        total: orgs.length,
        organizations: orgs
      });
    }

    return res.status(400).json({ error: 'Invalid network action' });
  } catch (err: any) {
    console.error('[Network Handler Error]:', err.message);
    return res.status(500).json({ error: err.message });
  }
}

