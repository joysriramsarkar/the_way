/**
 * api/admins.ts — Single endpoint for all admin management operations using Neon PostgreSQL
 */

import crypto from 'crypto';
import { requireAuth, requireAdmin, verifySession, hashPassword } from './_lib/auth';
import { logActivity } from './_lib/activity';
import activityLogHandler from './_handlers/activity-log';
import sql from './_lib/db';
import type { ApiRequest, ApiResponse } from '@/types';

async function countGmailAdmins(excludeId?: string): Promise<number> {
  let q = "SELECT COUNT(*) as count FROM allowed_admins WHERE status = 'active' AND role = 'Admin' AND LOWER(email) LIKE '%@gmail.com'";
  const params: any[] = [];
  if (excludeId) {
    params.push(excludeId);
    q += " AND id != $1";
  }
  const rows = await sql.query(q, params);
  return parseInt(rows[0]?.count || '0', 10);
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  // Delegate to activity-log handler if requested
  if (req.query?._route === 'activity-log' || (req.url && req.url.includes('/activity-log'))) {
    return await activityLogHandler(req, res);
  }

  res.setHeader('Access-Control-Allow-Origin', (req.headers.origin as string) || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { action, id } = req.query as { action?: string; id?: string };

  try {
    // ── LIST ────────────────────────────────────────────────────────
    if (action === 'list' && req.method === 'GET') {
      const session = await requireAdmin(req, res);
      if (!session) return;
      const rows = await sql.query(`
        SELECT id, email, role, status, added_by, added_at, modified_by, modified_at, modified_action
        FROM allowed_admins
        ORDER BY added_at ASC;
      `);
      return res.status(200).json(rows || []);
    }

    // ── CHECK (own access) ───────────────────────────────────────────
    if (action === 'check' && req.method === 'GET') {
      res.setHeader('Cache-Control', 'no-store');
      const session = verifySession(req);
      if (!session) return res.status(401).json({ ok: false, reason: 'invalid_token' });
      const rows = await sql.query('SELECT status, role FROM allowed_admins WHERE LOWER(email) = LOWER($1) LIMIT 1', [session.email]);
      const data = rows[0];
      if (!data) return res.status(200).json({ ok: false, reason: 'not_found' });
      if (data.status !== 'active') return res.status(200).json({ ok: false, reason: data.status });
      return res.status(200).json({ ok: true, role: data.role });
    }

    // ── ADD ─────────────────────────────────────────────────────────
    if (action === 'add' && req.method === 'POST') {
      const session = await requireAdmin(req, res);
      if (!session) return;

      const { email, role, name, password, bio } = req.body || {};
      if (!email || !role) return res.status(400).json({ error: 'email and role are required' });
      const allowedRoles = ['Admin', 'Moderator', 'Editor', 'Contributor', 'User'];
      if (!allowedRoles.includes(role)) return res.status(400).json({ error: `role must be one of: ${allowedRoles.join(', ')}` });

      const emailNorm = String(email).toLowerCase().trim();
      const existingRows = await sql.query('SELECT status FROM allowed_admins WHERE LOWER(email) = LOWER($1) LIMIT 1', [emailNorm]);
      const existing = existingRows[0];
      if (existing) {
        if (existing.status === 'active') return res.status(400).json({ error: 'already_active', message: 'This email already has active access.' });
        if (existing.status === 'suspended') return res.status(400).json({ error: 'already_suspended', message: 'This email is currently suspended. Go to the Suspended tab and restore them instead.' });
        if (existing.status === 'deleted') return res.status(400).json({ error: 'already_in_recycle', message: 'This email is in the Recycle bin. Go to the Recycle tab and restore them instead.' });
      }

      const initialPassword = password ? String(password) : crypto.randomBytes(8).toString('hex');
      const pwdHash = hashPassword(initialPassword);

      const createdRows = await sql.query(`
        INSERT INTO allowed_admins (email, name, password_hash, role, bio, added_by, status)
        VALUES ($1, $2, $3, $4, $5, $6, 'active')
        RETURNING *;
      `, [emailNorm, name ? String(name).trim() : emailNorm.split('@')[0], pwdHash, role, bio || '', session.email]);

      const data = createdRows[0];

      logActivity({
        actor: session,
        action: 'admin.add',
        category: 'admins',
        summary: `${session.name || session.email} added account "${emailNorm}" (${role})`,
        target_id: data.id,
        target_name: emailNorm,
        details: { role, target_email: emailNorm },
        req
      }).catch(() => {});

      return res.status(201).json(data);
    }

    // ── UPDATE (role / status) ───────────────────────────────────────
    if (action === 'update' && req.method === 'PATCH') {
      const session = await requireAdmin(req, res);
      if (!session) return;
      if (!id) return res.status(400).json({ error: 'id required' });

      const { status, role } = req.body || {};
      if (!status && !role) return res.status(400).json({ error: 'No valid updates' });

      const targetRows = await sql.query('SELECT * FROM allowed_admins WHERE id = $1 LIMIT 1', [id]);
      const target = targetRows[0];
      if (!target) return res.status(404).json({ error: 'Admin not found' });

      if (target.email.toLowerCase() === session.email.toLowerCase()) {
        if (status === 'suspended' || status === 'deleted') {
          return res.status(400).json({ error: 'You cannot suspend or remove your own account.' });
        }
      }

      const isGmailAdmin = target.email.toLowerCase().endsWith('@gmail.com') && target.role === 'Admin';
      const willDeactivate = (status === 'suspended' || status === 'deleted') && target.status === 'active';
      if (willDeactivate && isGmailAdmin) {
        const remaining = await countGmailAdmins(id);
        if (remaining < 2) return res.status(400).json({ error: 'min_admins', message: 'At least 2 Gmail Admin accounts must remain active. Add another Gmail Admin first.' });
      }

      const willDowngrade = role === 'Moderator' && target.role === 'Admin';
      if (willDowngrade && isGmailAdmin && target.status === 'active') {
        const remaining = await countGmailAdmins(id);
        if (remaining < 2) return res.status(400).json({ error: 'min_admins', message: 'At least 2 Gmail Admin accounts must remain active. Add another Gmail Admin before downgrading this one.' });
      }

      let auditAction: string | null = null;
      let actionSummary = '';
      if (status === 'suspended') {
        auditAction = 'suspended';
        actionSummary = `${session.name || session.email} suspended account "${target.email}"`;
      }
      if (status === 'active' && target.status === 'suspended') {
        auditAction = 'unsuspended';
        actionSummary = `${session.name || session.email} unsuspended/restored account "${target.email}"`;
      }
      if (status === 'active' && target.status === 'deleted') {
        auditAction = 'restored';
        actionSummary = `${session.name || session.email} restored account "${target.email}" from recycle bin`;
      }
      if (status === 'deleted') {
        auditAction = 'deleted';
        actionSummary = `${session.name || session.email} moved account "${target.email}" to recycle bin`;
      }
      if (role && role !== target.role) {
        auditAction = 'role_changed_to_' + role;
        actionSummary = `${session.name || session.email} changed role of "${target.email}" from ${target.role} to ${role}`;
      }

      const updatedRows = await sql.query(`
        UPDATE allowed_admins
        SET status = COALESCE($1, status),
            role = COALESCE($2, role),
            modified_by = $3,
            modified_at = NOW(),
            modified_action = $4
        WHERE id = $5
        RETURNING *;
      `, [status || null, role || null, session.email, auditAction, id]);

      const data = updatedRows[0];

      if (auditAction) {
        logActivity({
          actor: session,
          action: 'admin.' + auditAction,
          category: 'admins',
          summary: actionSummary,
          target_id: target.id,
          target_name: target.email,
          details: { old: target, updates: { status, role } },
          req
        }).catch(() => {});
      }

      return res.status(200).json(data);
    }

    // ── REMOVE (soft-delete → recycle) ──────────────────────────────
    if (action === 'remove' && req.method === 'DELETE') {
      const session = await requireAdmin(req, res);
      if (!session) return;
      if (!id) return res.status(400).json({ error: 'id required' });

      const targetRows = await sql.query('SELECT * FROM allowed_admins WHERE id = $1 LIMIT 1', [id]);
      const target = targetRows[0];
      if (!target) return res.status(404).json({ error: 'Admin not found' });

      if (target.email.toLowerCase() === session.email.toLowerCase()) {
        return res.status(400).json({ error: 'You cannot remove your own account.' });
      }

      const isGmailAdmin = target.status === 'active' && target.role === 'Admin' && target.email.toLowerCase().endsWith('@gmail.com');
      if (isGmailAdmin) {
        const count = await countGmailAdmins(id);
        if (count < 2) return res.status(400).json({ error: 'min_admins', message: 'At least 2 Gmail Admin accounts must remain active. Add another Gmail Admin first.' });
      }

      await sql.query(`
        UPDATE allowed_admins
        SET status = 'deleted', modified_by = $1, modified_at = NOW(), modified_action = 'deleted'
        WHERE id = $2;
      `, [session.email, id]);

      logActivity({
        actor: session,
        action: 'admin.remove_to_recycle',
        category: 'admins',
        summary: `${session.name || session.email} moved account "${target.email}" to Recycle bin`,
        target_id: target.id,
        target_name: target.email,
        details: { previousStatus: target.status },
        req
      }).catch(() => {});

      return res.status(200).json({ success: true });
    }

    // ── PURGE (permanent delete from recycle) ───────────────────────
    if (action === 'purge' && req.method === 'DELETE') {
      const session = await requireAdmin(req, res);
      if (!session) return;
      if (!id) return res.status(400).json({ error: 'id required' });

      const targetRows = await sql.query('SELECT status, email FROM allowed_admins WHERE id = $1 LIMIT 1', [id]);
      const target = targetRows[0];
      if (!target) return res.status(404).json({ error: 'Not found' });
      if (target.status !== 'deleted') return res.status(400).json({ error: 'Account must be in Recycle before permanent deletion.' });

      await sql.query('DELETE FROM allowed_admins WHERE id = $1', [id]);

      logActivity({
        actor: session,
        action: 'admin.purge_permanent',
        category: 'admins',
        summary: `${session.name || session.email} permanently deleted account "${target.email}" from whitelist`,
        target_id: id,
        target_name: target.email,
        details: {},
        req
      }).catch(() => {});

      return res.status(200).json({ success: true, email: target.email });
    }

    return res.status(400).json({ error: 'Unknown action or method' });
  } catch (err: any) {
    console.error('[Admins Handler Error]:', err.message);
    return res.status(500).json({ error: err.message });
  }
}

