/**
 * api/auth.ts — Authentication & User Management Engine using Neon PostgreSQL
 * Handles: Login, Register, Session Verification, Logout, Password Change
 */

import jwt from 'jsonwebtoken';
import sql from './_lib/db';
import { verifySession, requireAuth, hashPassword, verifyPassword } from './_lib/auth';
import { logActivity } from './_lib/activity';
import type { ApiRequest, ApiResponse } from '@/types';

export default async function handler(req: ApiRequest, res: ApiResponse) {
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

  const { action } = req.query as { action?: string };

  try {
    // ── 1. ME (Session Check) ──────────────────────────────────────────
    if (action === 'me') {
      const s = await requireAuth(req, res);
      if (!s) return;
      return res.status(200).json({
        user: {
          email: s.email,
          role: s.role,
          name: s.name || s.email,
          picture: s.picture || ''
        }
      });
    }

    // ── 2. LOGOUT ──────────────────────────────────────────────────────
    if (action === 'logout') {
      const s = verifySession(req);
      if (s) {
        logActivity({
          actor: s,
          action: 'auth.logout',
          category: 'auth',
          summary: `${s.name || s.email} logged out`,
          target_id: s.email,
          target_name: s.email,
          details: {},
          req
        }).catch(() => {});
      }
      res.setHeader('Set-Cookie', 'theway_session=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/');
      return res.status(200).json({ success: true });
    }

    // ── 3. REGISTER (New User / Contributor Account Creation) ──────────
    if (action === 'register' && req.method === 'POST') {
      const { name, email, password, role, bio } = req.body || {};

      if (!name || !email || !password) {
        return res.status(400).json({ error: 'নাম, ইমেইল এবং পাসওয়ার্ড আবশ্যক (Name, email and password are required).' });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে (Password must be at least 6 characters).' });
      }

      const emailNorm = String(email).trim().toLowerCase();
      const nameNorm = String(name).trim();
      // Security: Public registration cannot assign Admin/Editor/Moderator roles
      const userRole = role === 'User' ? 'User' : 'Contributor';
      const pwdHash = hashPassword(password);
      const secret = process.env.SESSION_SECRET || 'theway_revolutionary_portal_jwt_secret_key_2026';

      const existingRows = await sql.query('SELECT id, email, status FROM allowed_admins WHERE LOWER(email) = LOWER($1) LIMIT 1', [emailNorm]);
      if (existingRows && existingRows.length > 0) {
        return res.status(400).json({
          error: 'এই ইমেইলটি ইতিমধ্যে নিবন্ধিত রয়েছে। অনুগ্রহ করে লগইন করুন।'
        });
      }

      const inserted = await sql.query(`
        INSERT INTO allowed_admins (email, name, password_hash, role, bio, added_by, status)
        VALUES ($1, $2, $3, $4, $5, 'self_registration', 'active')
        RETURNING *;
      `, [emailNorm, nameNorm, pwdHash, userRole, bio ? String(bio).trim() : 'দ্য ওয়ে নিয়মিত লেখক ও পাঠক']);

      const created = inserted[0];

      const token = jwt.sign(
        {
          email: emailNorm,
          role: userRole,
          name: nameNorm,
          picture: ''
        },
        secret,
        { expiresIn: '24h' }
      );

      res.setHeader(
        'Set-Cookie',
        `theway_session=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=86400; Path=/`
      );

      logActivity({
        actor: { email: emailNorm, name: nameNorm, role: userRole as any },
        action: 'auth.register',
        category: 'auth',
        summary: `New account registered: ${nameNorm} (${emailNorm}) as ${userRole}`,
        target_id: emailNorm,
        target_name: emailNorm,
        details: { role: userRole },
        req
      }).catch(() => {});

      return res.status(201).json({
        success: true,
        message: 'অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!',
        token,
        user: {
          email: emailNorm,
          name: nameNorm,
          role: userRole
        }
      });
    }

    // ── 4. LOGIN (Email & Password Authentication) ─────────────────────
    if (action === 'login' && req.method === 'POST') {
      const { email, password } = req.body || {};
      if (!email || !password) {
        return res.status(400).json({ error: 'ইমেইল এবং পাসওয়ার্ড প্রদান করুন (Email and password are required).' });
      }

      const emailNorm = String(email).trim().toLowerCase();
      const primaryAdminEmail = (process.env.ADMIN_EMAIL || 'joysriram.sarkar.56@gmail.com').trim().toLowerCase();
      const secret = process.env.SESSION_SECRET || 'theway_revolutionary_portal_jwt_secret_key_2026';

      let matchedUser: any = null;
      let isValidPassword = false;

      const rows = await sql.query('SELECT * FROM allowed_admins WHERE LOWER(email) = LOWER($1) LIMIT 1', [emailNorm]);
      const dbAdmin = rows[0];

      if (dbAdmin) {
        if (dbAdmin.status !== 'active') {
          return res.status(403).json({ error: 'অ্যাকাউন্ট স্থগিত রয়েছে।' });
        }
        matchedUser = dbAdmin;
        if (dbAdmin.password_hash && verifyPassword(password, dbAdmin.password_hash)) {
          isValidPassword = true;
        } else if (!dbAdmin.password_hash && process.env.ADMIN_PASSWORD && password === process.env.ADMIN_PASSWORD) {
          // One-time setup/migration of primary admin password hash to database
          isValidPassword = true;
          const newHash = hashPassword(password);
          await sql.query('UPDATE allowed_admins SET password_hash = $1 WHERE id = $2', [newHash, dbAdmin.id]);
        }
      }

      if (!isValidPassword || !matchedUser) {
        return res.status(401).json({
          error: 'ভুল ইমেইল অথবা পাসওয়ার্ড! সঠিক তথ্য দিয়ে পুনরায় চেষ্টা করুন (Invalid credentials).'
        });
      }

      const userName = matchedUser.name || (emailNorm === primaryAdminEmail ? 'Joysriram Sarkar' : emailNorm.split('@')[0]);
      const userRole = matchedUser.role || 'Admin';

      const token = jwt.sign(
        {
          email: matchedUser.email,
          role: userRole,
          name: userName,
          picture: matchedUser.picture || ''
        },
        secret,
        { expiresIn: '24h' }
      );

      res.setHeader(
        'Set-Cookie',
        `theway_session=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=86400; Path=/`
      );

      logActivity({
        actor: { email: matchedUser.email, name: userName, role: userRole },
        action: 'auth.login',
        category: 'auth',
        summary: `${userName} (${matchedUser.email}) logged in successfully as ${userRole}`,
        target_id: matchedUser.id || matchedUser.email,
        target_name: matchedUser.email,
        details: { method: 'Email/Password', role: userRole },
        req
      }).catch(() => {});

      return res.status(200).json({
        success: true,
        token,
        user: {
          email: matchedUser.email,
          role: userRole,
          name: userName,
          picture: matchedUser.picture || ''
        }
      });
    }

    // ── 5. CHANGE PASSWORD ─────────────────────────────────────────────
    if (action === 'change-password' && req.method === 'POST') {
      const s = await requireAuth(req, res);
      if (!s) return;

      const { newPassword } = req.body || {};
      if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ error: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।' });
      }

      const newHash = hashPassword(newPassword);
      await sql.query('UPDATE allowed_admins SET password_hash = $1 WHERE LOWER(email) = LOWER($2)', [newHash, s.email]);

      logActivity({
        actor: s,
        action: 'auth.change_password',
        category: 'auth',
        summary: `${s.name || s.email} updated account password`,
        target_id: s.email,
        target_name: s.email,
        details: {},
        req
      }).catch(() => {});

      return res.status(200).json({ success: true, message: 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে।' });
    }

    return res.status(400).json({ error: 'Unknown action or method' });
  } catch (err: any) {
    console.error('[Auth Handler Error]:', err.message);
    return res.status(500).json({ error: err.message });
  }
}

