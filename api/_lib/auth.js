const jwt = require('jsonwebtoken');

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

function requireAdmin(req, res) {
  const s = requireAuth(req, res);
  if (!s) return null;
  if (s.role !== 'Admin') { res.status(403).json({ error: 'Admin role required' }); return null; }
  return s;
}

module.exports = { verifySession, requireAuth, requireAdmin };
