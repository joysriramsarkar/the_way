/**
 * api/activity-log.ts — Endpoint for Immutable Activity & Audit Logs
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
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { ApiRequest, ApiResponse } from '../../types';

function sb(): SupabaseClient {
  const url = process.env.SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_KEY || '';
  return createClient(url, key);
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', (req.headers.origin as string) || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { action } = req.query as { action?: string };

  // ── 1. LIST AUDIT LOGS ──────────────────────────────────────────
  if (action === 'list' && req.method === 'GET') {
    const session = await requireAuth(req, res);
    if (!session) return;

    const category = (req.query.category as string) || 'all';
    const actor    = (req.query.actor as string) || '';
    const search   = ((req.query.search as string) || '').trim().toLowerCase();
    const limit    = Math.min(Math.max(parseInt((req.query.limit as string) || '100', 10), 1), 500);
    const offset   = Math.max(parseInt((req.query.offset as string) || '0', 10), 0);

    const client = sb();
    let logs: any = null;

    // Try fetching from `activity_logs` table
    try {
      let query = client
        .from('activity_logs')
        .select('*', { count: 'exact' })
        .order('timestamp', { ascending: false });

      if (category && category !== 'all') {
        query = query.eq('category', category);
      }
      if (actor) {
        query = query.ilike('actor_email', `%${actor}%`);
      }
      if (search) {
        query = query.or(`summary.ilike.%${search}%,actor_email.ilike.%${search}%,actor_name.ilike.%${search}%,target_name.ilike.%${search}%,action.ilike.%${search}%`);
      }

      query = query.range(offset, offset + limit - 1);

      const { data, count, error } = await query;
      if (!error && Array.isArray(data)) {
        logs = {
          items: data,
          total: count !== null ? count : data.length,
          limit,
          offset
        };
      }
    } catch (e: any) {
      console.warn('[activity-log/list] Supabase table query failed:', e?.message);
    }

    // Fallback: fetch from site_settings store or sections system table
    if (!logs) {
      try {
        let rawList: any[] = [];
        try {
          const { data: storeRow } = await client
            .from('site_settings')
            .select('value')
            .eq('key', 'activity_logs_store')
            .maybeSingle();

          if (storeRow && Array.isArray(storeRow.value) && storeRow.value.length > 0) {
            rawList = storeRow.value;
          }
        } catch (e) {}

        if (rawList.length === 0) {
          try {
            const { data: secRow } = await client
              .from('sections')
              .select('name')
              .eq('admin_id', '__activity_logs_store__')
              .maybeSingle();

            if (secRow && secRow.name) {
              const parsed = JSON.parse(secRow.name);
              if (Array.isArray(parsed)) rawList = parsed;
            }
          } catch (e) {}
        }

        // Apply filters in memory
        if (category && category !== 'all') {
          rawList = rawList.filter(l => l.category === category);
        }
        if (actor) {
          rawList = rawList.filter(l => (l.actor_email || '').toLowerCase().includes(actor.toLowerCase()));
        }
        if (search) {
          rawList = rawList.filter(l =>
            (l.summary || '').toLowerCase().includes(search) ||
            (l.actor_email || '').toLowerCase().includes(search) ||
            (l.actor_name || '').toLowerCase().includes(search) ||
            (l.target_name || '').toLowerCase().includes(search) ||
            (l.action || '').toLowerCase().includes(search)
          );
        }

        const total = rawList.length;
        const paged = rawList.slice(offset, offset + limit);

        logs = {
          items: paged,
          total,
          limit,
          offset
        };
      } catch (fbErr: any) {
        console.error('[activity-log/list] Fallback list failed:', fbErr?.message);
        logs = { items: [], total: 0, limit, offset };
      }
    }

    return res.status(200).json(logs);
  }

  // ── 2. GET ACTIVITY METRICS STATS ───────────────────────────────
  if (action === 'stats' && req.method === 'GET') {
    const session = await requireAuth(req, res);
    if (!session) return;

    const client = sb();
    let totalLogs = 0;
    let todayCount = 0;
    const uniqueActors = new Set<string>();
    let lastActivityAt: string | null = null;

    try {
      const { data: recent, count, error } = await client
        .from('activity_logs')
        .select('actor_email, timestamp', { count: 'exact' })
        .order('timestamp', { ascending: false })
        .limit(1000);

      if (!error && Array.isArray(recent)) {
        totalLogs = count !== null ? count : recent.length;
        if (recent.length > 0) lastActivityAt = recent[0].timestamp;

        const todayStart = new Date();
        todayStart.setUTCHours(0, 0, 0, 0);

        recent.forEach((r: any) => {
          if (r.actor_email) uniqueActors.add(r.actor_email);
          if (r.timestamp && new Date(r.timestamp) >= todayStart) {
            todayCount++;
          }
        });
      }
    } catch (e) {}

    // Fallback if table returned 0
    if (totalLogs === 0) {
      try {
        let list: any[] = [];
        try {
          const { data: storeRow } = await client
            .from('site_settings')
            .select('value')
            .eq('key', 'activity_logs_store')
            .maybeSingle();

          if (storeRow && Array.isArray(storeRow.value) && storeRow.value.length > 0) {
            list = storeRow.value;
          }
        } catch (e) {}

        if (list.length === 0) {
          try {
            const { data: secRow } = await client
              .from('sections')
              .select('name')
              .eq('admin_id', '__activity_logs_store__')
              .maybeSingle();

            if (secRow && secRow.name) {
              const parsed = JSON.parse(secRow.name);
              if (Array.isArray(parsed)) list = parsed;
            }
          } catch (e) {}
        }

        totalLogs = list.length;
        if (list.length > 0) lastActivityAt = list[0].timestamp;

        const todayStart = new Date();
        todayStart.setUTCHours(0, 0, 0, 0);

        list.forEach((r: any) => {
          if (r.actor_email) uniqueActors.add(r.actor_email);
          if (r.timestamp && new Date(r.timestamp) >= todayStart) {
            todayCount++;
          }
        });
      } catch (e) {}
    }

    return res.status(200).json({
      totalLogs,
      todayCount,
      uniqueActorsCount: uniqueActors.size,
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
}

module.exports = handler;
(module.exports as any).default = handler;
