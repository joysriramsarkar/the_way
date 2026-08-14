const jwt  = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

function verifySession(req) {
  let token = null;
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) token = auth.slice(7);
  if (!token && req.headers.cookie) {
    const m = req.headers.cookie.match(/privatian_session=([^;]+)/);
    if (m) token = m[1];
  }
  if (!token) return null;
  try { return jwt.verify(token, process.env.SESSION_SECRET); }
  catch(e) { return null; }
}

function requireAuth(req, res) {
  const s = verifySession(req);
  if (!s) { res.status(401).json({ error: 'Not authenticated', redirect: '/admin-login.html' }); return null; }
  return s;
}

/**
 * requireAdmin: JWT check + live DB role check.
 * Prevents stale-JWT privilege escalation when a user is downgraded mid-session.
 * Returns the session object on success, null on failure (after sending error response).
 */
async function requireAdmin(req, res) {
  const s = requireAuth(req, res);
  if (!s) return null;

  // Live DB check: verify the role in DB is still 'Admin' and account is active.
  // This catches mid-session role downgrades (Admin → Moderator) even before JWT expires.
  try {
    const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
    const { data } = await sb
      .from('allowed_admins')
      .select('role, status')
      .ilike('email', s.email)
      .maybeSingle();

    if (!data || data.status !== 'active' || data.role !== 'Admin') {
      res.status(403).json({
        error: 'Admin role required',
        reason: !data ? 'not_found' : data.role !== 'Admin' ? 'role_changed' : data.status
      });
      return null;
    }
  } catch(e) {
    // If DB check fails (network/config), fall back to JWT role as a safety net
    if (s.role !== 'Admin') {
      res.status(403).json({ error: 'Admin role required' });
      return null;
    }
  }

  return s;
}

module.exports = { verifySession, requireAuth, requireAdmin };
