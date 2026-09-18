/**
 * api/movement.ts — Solidarity & Movement Network API
 * Handles "সংগঠিত হোন" (Join Movement) signups, organizing circles, and member management.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { verifySession, requireAuth, requireAdmin } from '../_lib/auth';
import { logActivity } from '../_lib/activity';
import {
  getLocalMovementSignups,
  saveLocalMovementSignup,
  updateLocalMovementSignup,
  deleteLocalMovementSignup
} from '../_lib/db-fallback';
import type { ApiRequest, ApiResponse } from '../../types';

function getSupabase(): SupabaseClient {
  const url = process.env.SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_KEY || '';
  return createClient(url, key);
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', (req.headers.origin as string) || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { action, id } = req.query as { action?: string; id?: string };
  const sb = getSupabase();

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

    const memberData = {
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      interest: String(interest).trim(),
      location: String(location).trim(),
      phone: String(phone).trim(),
      notes: String(notes).trim(),
      status: 'new',
      created_at: new Date().toISOString()
    };

    try {
      // Save locally first
      const savedLocal = saveLocalMovementSignup(memberData);

      // Attempt Supabase insert if table exists
      try {
        await sb.from('movement_signups').insert(savedLocal);
      } catch (sbErr) {
        // Fallback is already saved
      }

      await logActivity({
        actor: { email: memberData.email, name: memberData.name, role: 'Visitor' },
        action: 'movement_signup',
        category: 'movement',
        summary: `নতুন সংহতি নিবন্ধন: ${memberData.name} (${memberData.interest})`,
        target_id: savedLocal.id,
        target_name: memberData.name,
        details: { email: memberData.email, interest: memberData.interest },
        req
      });

      return res.status(201).json({
        success: true,
        message: 'ধন্যবাদ! আপনার সংহতি নিবন্ধন সফলভাবে জমা হয়েছে। আমাদের প্রতিনিধি শীঘ্রই যোগাযোগ করবেন।',
        data: savedLocal
      });
    } catch (err: any) {
      console.error('[movement.ts] Error submitting signup:', err);
      return res.status(500).json({ error: 'নিবন্ধন সংরক্ষণ করতে সমস্যা হয়েছে।' });
    }
  }

  // ── 2. ADMIN LIST SIGNUPS ──────────────────────────────────────────
  if (action === 'list' && req.method === 'GET') {
    const user = await requireAuth(req, res);
    if (!user) return;

    const { status, search } = req.query as { status?: string; search?: string };

    try {
      let list: any[] = [];
      try {
        let query = sb.from('movement_signups').select('*').order('created_at', { ascending: false });
        if (status && status !== 'all') query = query.eq('status', status);
        const { data, error } = await query;
        if (!error && Array.isArray(data) && data.length > 0) {
          list = data;
        }
      } catch (e) {}

      if (list.length === 0) {
        list = getLocalMovementSignups();
        if (status && status !== 'all') {
          list = list.filter(m => m.status === status);
        }
      }

      if (search) {
        const q = String(search).toLowerCase();
        list = list.filter(m =>
          (m.name || '').toLowerCase().includes(q) ||
          (m.email || '').toLowerCase().includes(q) ||
          (m.interest || '').toLowerCase().includes(q) ||
          (m.location || '').toLowerCase().includes(q)
        );
      }

      return res.status(200).json({ success: true, count: list.length, data: list });
    } catch (err: any) {
      console.error('[movement.ts] List error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  // ── 3. ADMIN UPDATE STATUS / NOTES ─────────────────────────────────
  if (action === 'update' && (req.method === 'PATCH' || req.method === 'POST')) {
    const user = await requireAuth(req, res);
    if (!user) return;

    const targetId = id || req.body?.id;
    if (!targetId) return res.status(400).json({ error: 'Member ID required.' });

    const updates: Record<string, any> = {};
    if (req.body?.status) updates.status = req.body.status;
    if (req.body?.notes !== undefined) updates.notes = req.body.notes;
    if (req.body?.assigned_to !== undefined) updates.assigned_to = req.body.assigned_to;
    updates.updated_at = new Date().toISOString();

    try {
      const updatedLocal = updateLocalMovementSignup(targetId, updates);
      try {
        await sb.from('movement_signups').update(updates).eq('id', targetId);
      } catch (e) {}

      await logActivity({
        actor: user,
        action: 'update_movement_status',
        category: 'movement',
        summary: `সংহতি সদস্য স্ট্যাটাস পরিবর্তন: ${targetId} -> ${updates.status || 'updated'}`,
        target_id: targetId,
        target_name: 'Movement Signup',
        details: updates,
        req
      });

      return res.status(200).json({ success: true, data: updatedLocal || updates });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ── 4. ADMIN DELETE SIGNUP ─────────────────────────────────────────
  if (action === 'delete' && (req.method === 'DELETE' || req.method === 'POST')) {
    const admin = await requireAdmin(req, res);
    if (!admin) return;

    const targetId = id || req.body?.id;
    if (!targetId) return res.status(400).json({ error: 'Member ID required.' });

    try {
      deleteLocalMovementSignup(targetId);
      try {
        await sb.from('movement_signups').delete().eq('id', targetId);
      } catch (e) {}

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
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(400).json({ error: 'Unknown movement action.' });
}

module.exports = handler;
(module.exports as any).default = handler;
