const { verifySession } = require('../_lib/auth');
module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') return res.status(200).end();
  const s = verifySession(req);
  if (!s) return res.status(401).json({ error: 'Not authenticated' });
  return res.status(200).json({ email: s.email, role: s.role, name: s.name || s.email, picture: s.picture || '' });
};
