/**
 * api/_handlers/activity-log.ts — Endpoint for Immutable Activity & Audit Logs using Neon PostgreSQL
 * 
 * Supports:
 *   GET  /api/activity-log?action=list   — List filtered, paginated audit logs (requireAuth)
 *   GET  /api/activity-log?action=stats  — Get activity metrics summary (requireAuth)
 *   POST /api/activity-log?action=log    — Record an authenticated frontend activity (requireAuth)
 * 
 * IMMUTABILITY GUARANTEE: No DELETE or CLEAR endpoints exist.
 */

import { requireAuth } from '../_lib/auth';
import { logActivity } from '../_lib/activity';
import sql from '../_lib/db';
import type { ApiRequest, ApiResponse } from '../../types';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', (req.headers.origin as string) || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { action } = req.query as { action?: string };

  try {
    // ── 1. LIST AUDIT LOGS ──────────────────────────────────────────
    if (action === 'list' && req.method === 'GET') {
      const session = await requireAuth(req, res);
      if (!session) return;

      const category = (req.query.category as string) || 'all';
      const actor    = (req.query.actor as string) || '';
      const search   = ((req.query.search as string) || '').trim().toLowerCase();
      const limit    = Math.min(Math.max(parseInt((req.query.limit as string) || '100', 10), 1), 500);
      const offset   = Math.max(parseInt((req.query.offset as string) || '0', 10), 0);

      let queryStr = 'SELECT * FROM activity_logs';
      let countQueryStr = 'SELECT COUNT(*) as count FROM activity_logs';
      const conditions: string[] = [];
      const params: any[] = [];

      if (category && category !== 'all') {
        params.push(category);
        conditions.push(`category = $${params.length}`);
      }
      if (actor) {
        params.push(`%${actor}%`);
        conditions.push(`actor_email ILIKE $${params.length}`);
      }
      if (search) {
        params.push(`%${search}%`);
        conditions.push(`(summary ILIKE $${params.length} OR actor_email ILIKE $${params.length} OR actor_name ILIKE $${params.length} OR target_name ILIKE $${params.length} OR action ILIKE $${params.length})`);
      }

      if (conditions.length > 0) {
        const whereClause = ' WHERE ' + conditions.join(' AND ');
        queryStr += whereClause;
        countQueryStr += whereClause;
      }

      const countRows = await sql.query(countQueryStr, params);
      const total = parseInt(countRows[0]?.count || '0', 10);

      params.push(limit);
      queryStr += ` ORDER BY created_at DESC LIMIT $${params.length}`;
      params.push(offset);
      queryStr += ` OFFSET $${params.length}`;

      const items = await sql.query(queryStr, params);

      return res.status(200).json({
        items,
        total,
        limit,
        offset
      });
    }

    // ── 2. GET ACTIVITY METRICS STATS ───────────────────────────────
    if (action === 'stats' && req.method === 'GET') {
      const session = await requireAuth(req, res);
      if (!session) return;

      const totalRows = await sql.query('SELECT COUNT(*) as count FROM activity_logs');
      const totalLogs = parseInt(totalRows[0]?.count || '0', 10);

      const todayRows = await sql.query("SELECT COUNT(*) as count FROM activity_logs WHERE created_at >= CURRENT_DATE");
      const todayCount = parseInt(todayRows[0]?.count || '0', 10);

      const actorsRows = await sql.query("SELECT COUNT(DISTINCT actor_email) as count FROM activity_logs WHERE actor_email IS NOT NULL");
      const uniqueActorsCount = parseInt(actorsRows[0]?.count || '0', 10);

      const latestRow = await sql.query('SELECT created_at FROM activity_logs ORDER BY created_at DESC LIMIT 1');
      const lastActivityAt = latestRow[0]?.created_at || null;

      return res.status(200).json({
        totalLogs,
        todayCount,
        uniqueActorsCount,
        lastActivityAt
      });
    }

    // ── 3. RECORD CLIENT-SIDE LOG ───────────────────────────────────
    if (action === 'log' && req.method === 'POST') {
      const session = await requireAuth(req, res);
      if (!session) return;

      const { action: actName, category, summary, target_id, target_name, details } = req.body || {};
      if (!actName || !summary) {
        return res.status(400).json({ error: 'action and summary are required' });
      }

      const recorded = await logActivity({
        actor: session,
        action: actName,
        category: category || 'general',
        summary,
        target_id,
        target_name,
        details: details || {},
        req
      });

      return res.status(201).json({ success: true, log: recorded });
    }

    return res.status(400).json({ error: 'Unknown action' });
  } catch (err: any) {
    console.error('[ActivityLog Handler Error]:', err.message);
    return res.status(500).json({ error: err.message });
  }
}

