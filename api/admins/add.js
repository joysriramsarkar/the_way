const { requireAdmin } = require('../_lib/auth');
const { createClient } = require('@supabase/supabase-js');
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();
  const session = requireAdmin(req, res);
  if (!session) return;
  const { email, role } = req.body || {};
  if (!email || !role) return res.status(400).json({ error: 'email and role are required' });
  if (!['Admin', 'Moderator'].includes(role)) return res.status(400).json({ error: 'role must be Admin or Moderator' });
  const emailNorm = email.toLowerCase().trim();
  const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
  const { data, error } = await sb
    .from('allowed_admins')
    .insert({ email: emailNorm, role, added_by: session.email, status: 'active' })
    .select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
};
