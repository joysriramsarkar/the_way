const { requireAdmin } = require('../_lib/auth');
const { createClient } = require('@supabase/supabase-js');
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'PATCH') return res.status(405).end();
  const session = requireAdmin(req, res);
  if (!session) return;
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'id required' });
  const { status, role } = req.body || {};
  const updates = {};
  if (status && ['active', 'suspended'].includes(status)) updates.status = status;
  if (role && ['Admin', 'Moderator'].includes(role)) updates.role = role;
  if (!Object.keys(updates).length) return res.status(400).json({ error: 'No valid updates' });
  const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
  const { data, error } = await sb
    .from('allowed_admins').update(updates).eq('id', id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json(data);
};
