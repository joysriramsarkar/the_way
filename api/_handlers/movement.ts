/**
 * api/_handlers/movement.ts — Solidarity & Movement Network API using Neon PostgreSQL
 * Handles "সংগঠিত হোন" (Join Movement) signups, organizing circles, and member management.
 */

import sql from '../_lib/db';
import { verifySession, requireAuth, requireAdmin } from '../_lib/auth';
import { logActivity } from '../_lib/activity';
import type { ApiRequest, ApiResponse } from '../../types';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', (req.headers.origin as string) || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { action, id } = req.query as { action?: string; id?: string };

  try {
    // ── 1. PUBLIC JOIN / SIGNUP ("সংগঠিত হোন") ─────────────────────────
    if ((action === 'join' || action === 'signup') && req.method === 'POST') {
      const body = req.body || {};
      const {
        name,
        email,
        interest = 'তাত্ত্বিক গবেষণা ও লেখালেখি',
        location = '',
        phone = '',
        notes = ''
      } = body;

      if (!name || !email) {
        return res.status(400).json({ error: 'নাম এবং ইমেইল ঠিকানা আবশ্যক (Name and email are required).' });
      }

      const rows = await sql.query(`
        INSERT INTO movement_signups (name, email, interest, location, phone, notes, status)
        VALUES ($1, $2, $3, $4, $5, $6, 'new')
        RETURNING *;
      `, [
        String(name).trim(),
        String(email).trim().toLowerCase(),
        String(interest).trim(),
        String(location).trim(),
        String(phone).trim(),
        String(notes).trim()
      ]);

      const saved = rows[0];

      await logActivity({
        actor: { email: saved.email, name: saved.name, role: 'Visitor' },
        action: 'movement_signup',
        category: 'movement',
        summary: `নতুন সংহতি নিবন্ধন: ${saved.name} (${saved.interest})`,
        target_id: saved.id,
        target_name: saved.name,
        details: { email: saved.email, interest: saved.interest },
        req
      });

      return res.status(201).json({
        success: true,
        message: 'ধন্যবাদ! আপনার সংহতি নিবন্ধন সফলভাবে জমা হয়েছে। আমাদের প্রতিনিধি শীঘ্রই যোগাযোগ করবেন।',
        data: saved
      });
    }

    // ── 2. ADMIN LIST SIGNUPS ──────────────────────────────────────────
    if (action === 'list' && req.method === 'GET') {
      const user = await requireAuth(req, res);
      if (!user) return;

      const { status, search } = req.query as { status?: string; search?: string };

      let queryStr = 'SELECT * FROM movement_signups';
      const conditions: string[] = [];
      const params: any[] = [];

      if (status && status !== 'all') {
        params.push(status);
        conditions.push(`status = $${params.length}`);
      }

      if (search) {
        params.push(`%${search}%`);
        conditions.push(`(name ILIKE $${params.length} OR email ILIKE $${params.length} OR location ILIKE $${params.length})`);
      }

      if (conditions.length > 0) {
        queryStr += ' WHERE ' + conditions.join(' AND ');
      }

      queryStr += ' ORDER BY created_at DESC;';

      const list = await sql.query(queryStr, params);
      return res.status(200).json({ success: true, count: list.length, data: list });
    }

    // ── 3. ADMIN UPDATE STATUS / NOTES ─────────────────────────────────
    if (action === 'update' && (req.method === 'PATCH' || req.method === 'POST')) {
      const user = await requireAuth(req, res);
      if (!user) return;

      const targetId = id || req.body?.id;
      if (!targetId) return res.status(400).json({ error: 'Member ID required.' });

      const { status, notes } = req.body || {};

      const updated = await sql.query(`
        UPDATE movement_signups
        SET status = COALESCE($1, status),
            notes = COALESCE($2, notes)
        WHERE id = $3
        RETURNING *;
      `, [status || null, notes ?? null, targetId]);

      if (!updated || updated.length === 0) return res.status(404).json({ error: 'Signup not found' });

      await logActivity({
        actor: user,
        action: 'update_movement_status',
        category: 'movement',
        summary: `সংহতি সদস্য স্ট্যাটাস পরিবর্তন: ${targetId} -> ${status || 'updated'}`,
        target_id: targetId,
        target_name: 'Movement Signup',
        details: { status, notes },
        req
      });

      return res.status(200).json({ success: true, data: updated[0] });
    }

    // ── 4. ADMIN DELETE SIGNUP ─────────────────────────────────────────
    if (action === 'delete' && (req.method === 'DELETE' || req.method === 'POST')) {
      const admin = await requireAdmin(req, res);
      if (!admin) return;

      const targetId = id || req.body?.id;
      if (!targetId) return res.status(400).json({ error: 'Member ID required.' });

      await sql.query('DELETE FROM movement_signups WHERE id = $1', [targetId]);

      await logActivity({
        actor: admin,
        action: 'delete_movement_member',
        category: 'movement',
        summary: `সংহতি সদস্য ডিলিট করা হয়েছে: ${targetId}`,
        target_id: targetId,
        target_name: 'Movement Member',
        details: {},
        req
      });

      return res.status(200).json({ success: true, message: 'সদস্য সফলভাবে মুছে ফেলা হয়েছে।' });
    }

    return res.status(400).json({ error: 'Unknown movement action.' });
  } catch (err: any) {
    console.error('[Movement Handler Error]:', err.message);
    return res.status(500).json({ error: err.message });
  }
}

