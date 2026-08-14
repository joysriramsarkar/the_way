/**
 * GET /api/admins/check
 * Silent access verification: checks whether the current JWT holder still
 * has an active account in the database. Called every 30 min from the admin
 * panel without triggering a visible page refresh.
 *
 * Returns:
 *   { ok: true }                              — still active
 *   { ok: false, reason: 'suspended' }        — account suspended
 *   { ok: false, reason: 'deleted' }          — account removed
 *   { ok: false, reason: 'not_found' }        — email not in whitelist
 *   401                                       — invalid / expired JWT
 */

const { verifySession } = require('../_lib/auth');
const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const session = verifySession(req);
  if (!session) return res.status(401).json({ ok: false, reason: 'invalid_token' });

  const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
  const { data } = await sb
    .from('allowed_admins')
    .select('status, role')
    .ilike('email', session.email)
    .single();

  if (!data) return res.status(200).json({ ok: false, reason: 'not_found' });
  if (data.status !== 'active') return res.status(200).json({ ok: false, reason: data.status });
  // Return DB role so client can detect stale JWT role (e.g. Admin→Moderator downgrade)
  return res.status(200).json({ ok: true, role: data.role });
};
