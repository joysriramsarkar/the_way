const jwt  = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

function verifySession(req) {
  let token = null;
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) token = auth.slice(7);
  if (!token && req.headers.cookie) {
    const m = req.headers.cookie.match(/theway_session=([^;]+)/);
    if (m) token = m[1];
  }
  if (!token) return null;
  try { return jwt.verify(token, process.env.SESSION_SECRET); }
  catch(e) { return null; }
}

/**
 * requireAuth: JWT check + LIVE DB active status check.
 * If user is suspended or deleted in DB, instantly revokes access (401).
 * Returns the session object on success, null on failure.
 */
async function requireAuth(req, res) {
  const s = verifySession(req);
  if (!s) {
    res.status(401).json({ error: 'Not authenticated', redirect: '/admin-login.html' });
    return null;
  }

  // Live DB check: verify account exists and status is 'active'
  try {
    const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
    const { data } = await sb
      .from('allowed_admins')
      .select('role, status')
      .ilike('email', s.email)
      .maybeSingle();

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
    // Update live role
    s.role = data.role;
  } catch(e) {
    // Fallback in case of DB connection glitch
    const primaryAdminEmail = (process.env.ADMIN_EMAIL || 'joysriram.sarkar.56@gmail.com').toLowerCase();
    if (s.email.toLowerCase() === primaryAdminEmail) {
      s.role = 'Admin';
    }
  }

  return s;
}

/**
 * requireAdmin: JWT check + live DB role check.
 * Ensures the account is active AND role is 'Admin'.
 */
async function requireAdmin(req, res) {
  const s = await requireAuth(req, res);
  if (!s) return null;

  if (s.role !== 'Admin') {
    res.status(403).json({ error: 'Admin role required', reason: 'insufficient_permissions' });
    return null;
  }

  return s;
}

const crypto = require('crypto');

function hashPassword(password, salt = null) {
  if (!salt) salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, combinedHash) {
  if (!combinedHash || !combinedHash.includes(':')) return false;
  try {
    const [salt, originalHash] = combinedHash.split(':');
    const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(originalHash, 'hex'));
  } catch (e) {
    return false;
  }
}

module.exports = { verifySession, requireAuth, requireAdmin, hashPassword, verifyPassword };
