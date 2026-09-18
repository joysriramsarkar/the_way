/**
 * api/_lib/auth.ts — Authentication and Session Verification
 */

import jwt from 'jsonwebtoken';
import sql from './db';
import crypto from 'crypto';
import type { ApiRequest, ApiResponse, AuthUserSession } from '../../types';

export function verifySession(req: ApiRequest): AuthUserSession | null {
  if (!req || !req.headers) return null;
  let token: string | null = null;
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) token = auth.slice(7);
  if (!token && req.headers.cookie) {
    const m = req.headers.cookie.match(/theway_session=([^;]+)/);
    if (m) token = m[1];
  }
  if (!token) return null;
  try {
    const secret = process.env.SESSION_SECRET || 'theway_dev_session_secret_12345';
    return jwt.verify(token, secret) as AuthUserSession;
  } catch (e) {
    return null;
  }
}

/**
 * requireAuth: JWT check + LIVE DB active status check.
 */
export async function requireAuth(req: ApiRequest, res: ApiResponse): Promise<AuthUserSession | null> {
  const s = verifySession(req);
  if (!s) {
    res.status(401).json({ error: 'Not authenticated', redirect: '/admin-login.html' });
    return null;
  }

  // Live DB check on Neon allowed_admins
  try {
    const rows = await sql.query('SELECT role, status FROM allowed_admins WHERE LOWER(email) = LOWER($1) LIMIT 1', [s.email]);
    const data = rows[0];

    if (!data || data.status !== 'active') {
      const primaryAdminEmail = (process.env.ADMIN_EMAIL || 'joysriram.sarkar.56@gmail.com').toLowerCase();
      if (s.email.toLowerCase() === primaryAdminEmail) {
        s.role = 'Admin';
        return s;
      }
      res.status(401).json({
        error: 'Account access revoked or suspended',
        reason: !data ? 'not_found' : data.status,
        redirect: '/admin-login.html'
      });
      return null;
    }

    s.role = data.role as any;
  } catch (e) {
    const primaryAdminEmail = (process.env.ADMIN_EMAIL || 'joysriram.sarkar.56@gmail.com').toLowerCase();
    if (s.email.toLowerCase() === primaryAdminEmail) {
      s.role = 'Admin';
    }
  }

  return s;
}

/**
 * requireAdmin: JWT check + live DB role check.
 */
export async function requireAdmin(req: ApiRequest, res: ApiResponse): Promise<AuthUserSession | null> {
  const s = await requireAuth(req, res);
  if (!s) return null;

  if (s.role !== 'Admin') {
    res.status(403).json({ error: 'Admin role required', reason: 'insufficient_permissions' });
    return null;
  }

  return s;
}

export function hashPassword(password: string, salt: string | null = null): string {
  if (!salt) salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, combinedHash: string): boolean {
  if (!combinedHash || !combinedHash.includes(':')) return false;
  try {
    const [salt, originalHash] = combinedHash.split(':');
    const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(originalHash, 'hex'));
  } catch (e) {
    return false;
  }
}

export default {
  verifySession,
  requireAuth,
  requireAdmin,
  hashPassword,
  verifyPassword
};
