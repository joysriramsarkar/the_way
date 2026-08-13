const { requireAdmin } = require('../_lib/auth');
const { createClient } = require('@supabase/supabase-js');
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'DELETE') return res.status(405).end();
  const session = requireAdmin(req, res);
  if (!session) return;
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'id required' });
  const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
  const { data: target } = await sb.from('allowed_admins').select('email').eq('id', id).single();
  if (target && target.email === session.email) {
    return res.status(400).json({ error: 'Cannot remove your own account' });
  }
  const { error } = await sb.from('allowed_admins').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ success: true });
};
