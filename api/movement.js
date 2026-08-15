/**
 * api/movement.js — Solidarity & Movement Network API
 * Handles "সংগঠিত হোন" (Join Movement) signups, organizing circles, and member management.
 */

const { createClient } = require('@supabase/supabase-js');
const { verifySession, requireAuth, requireAdmin } = require('./_lib/auth');
const { logActivity } = require('./_lib/activity');
const {
  getLocalMovementSignups,
  saveLocalMovementSignup,
  updateLocalMovementSignup,
  deleteLocalMovementSignup
} = require('./_lib/db-fallback');

function getSupabase() {
  const url = process.env.SUPABASE_URL || 'https://gyhkpjjwwiakhpdqatuh.supabase.co';
  const key = process.env.SUPABASE_SERVICE_KEY;
  return createClient(url, key);
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { action, id } = req.query;
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
      status: 'new', // 'new', 'contacted', 'active', 'archived'
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

      await logActivity(
        { email: memberData.email, name: memberData.name, role: 'Visitor' },
        'movement_signup',
        'movement',
        `নতুন সংহতি নিবন্ধন: ${memberData.name} (${memberData.interest})`,
        savedLocal.id,
        memberData.name,
        { email: memberData.email, interest: memberData.interest }
      );

      return res.status(201).json({
        success: true,
        message: 'ধন্যবাদ! আপনার সংহতি নিবন্ধন সফলভাবে জমা হয়েছে। আমাদের প্রতিনিধি শীঘ্রই যোগাযোগ করবেন।',
        data: savedLocal
      });
    } catch (err) {
      console.error('[movement.js] Error submitting signup:', err);
      return res.status(500).json({ error: 'নিবন্ধন সংরক্ষণ করতে সমস্যা হয়েছে।' });
    }
  }

  // ── 2. ADMIN LIST SIGNUPS ──────────────────────────────────────────
  if (action === 'list' && req.method === 'GET') {
    const user = requireAuth(req, res);
    if (!user) return;

    const { status, search } = req.query;

    try {
      let list = [];
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
    } catch (err) {
      console.error('[movement.js] List error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  // ── 3. ADMIN UPDATE STATUS / NOTES ─────────────────────────────────
  if (action === 'update' && (req.method === 'PATCH' || req.method === 'POST')) {
    const user = requireAuth(req, res);
    if (!user) return;

    const targetId = id || req.body.id;
    if (!targetId) return res.status(400).json({ error: 'Member ID required.' });

    const updates = {};
    if (req.body.status) updates.status = req.body.status;
    if (req.body.notes !== undefined) updates.notes = req.body.notes;
    if (req.body.assigned_to !== undefined) updates.assigned_to = req.body.assigned_to;
    updates.updated_at = new Date().toISOString();

    try {
      const updatedLocal = updateLocalMovementSignup(targetId, updates);
      try {
        await sb.from('movement_signups').update(updates).eq('id', targetId);
      } catch (e) {}

      await logActivity(
        user,
        'update_movement_status',
        'movement',
        `সংহতি সদস্য স্ট্যাটাস পরিবর্তন: ${targetId} -> ${updates.status || 'updated'}`,
        targetId,
        'Movement Signup',
        updates
      );

      return res.status(200).json({ success: true, data: updatedLocal || updates });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ── 4. ADMIN DELETE SIGNUP ─────────────────────────────────────────
  if (action === 'delete' && (req.method === 'DELETE' || req.method === 'POST')) {
    const admin = requireAdmin(req, res);
    if (!admin) return;

    const targetId = id || req.body.id;
    if (!targetId) return res.status(400).json({ error: 'Member ID required.' });

    try {
      deleteLocalMovementSignup(targetId);
      try {
        await sb.from('movement_signups').delete().eq('id', targetId);
      } catch (e) {}

      await logActivity(
        admin,
        'delete_movement_member',
        'movement',
        `সংহতি সদস্য ডিলিট করা হয়েছে: ${targetId}`,
        targetId,
        'Movement Member',
        {}
      );

      return res.status(200).json({ success: true, message: 'সদস্য সফলভাবে মুছে ফেলা হয়েছে।' });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(400).json({ error: 'Unknown movement action.' });
};
