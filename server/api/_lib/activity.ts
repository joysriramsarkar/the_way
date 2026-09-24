/**
 * api/_lib/activity.ts — Enterprise Activity Logger for The Way (দ্য ওয়ে)
 */

import sql from './db';
import type { ApiRequest } from '@/types';

export function extractClientInfo(req: ApiRequest | null): { ip: string; userAgent: string } {
  if (!req) return { ip: 'unknown', userAgent: 'unknown' };
  const headers = req.headers || {};
  const forwarded = headers['x-forwarded-for'];
  const ip = typeof forwarded === 'string'
    ? forwarded.split(',')[0].trim()
    : (req.socket ? req.socket.remoteAddress || 'unknown' : 'unknown');
  const userAgent = (headers['user-agent'] as string) || 'unknown';
  return { ip, userAgent };
}

export interface LogActivityParams {
  actor?: { email?: string; name?: string; role?: string } | null;
  action: string;
  category?: 'auth' | 'admins' | 'articles' | 'sections' | 'layout' | 'settings' | 'general' | string;
  summary?: string;
  target_id?: string | number | null;
  target_name?: string | null;
  details?: Record<string, any>;
  req?: ApiRequest | null;
}

export async function logActivity({
  actor = null,
  action,
  category = 'general',
  summary,
  target_id = null,
  target_name = null,
  details = {},
  req = null
}: LogActivityParams): Promise<any> {
  try {
    const { ip, userAgent } = extractClientInfo(req);
    const enrichedDetails = {
      ...details,
      ip: details.ip || ip,
      userAgent: details.userAgent || userAgent,
      logged_at: new Date().toISOString()
    };

    const actorEmail = actor ? (actor.email || 'system') : 'system';
    const actorName  = actor ? (actor.name || actor.email || 'System') : 'System';
    const actorRole  = actor ? (actor.role || 'Admin') : 'System';

    const rows = await sql.query(`
      INSERT INTO activity_logs (actor_email, actor_name, actor_role, action, category, summary, target_id, target_name, details, ip_address, user_agent)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10, $11)
      RETURNING *;
    `, [
      actorEmail,
      actorName,
      actorRole,
      action || 'unknown',
      category || 'general',
      summary || action,
      target_id ? String(target_id) : null,
      target_name ? String(target_name) : null,
      JSON.stringify(enrichedDetails),
      ip,
      userAgent
    ]);

    return rows[0];
  } catch (err: any) {
    console.error('[ActivityLogger] Error logging activity to Neon:', err.message);
    return null;
  }
}

export default { logActivity, extractClientInfo };

