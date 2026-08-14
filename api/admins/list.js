const { requireAdmin } = require('../_lib/auth');
const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const session = requireAdmin(req, res);
  if (!session) return;

  const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
  const includeDeleted = req.query && req.query.include_deleted === 'true';

  let query = sb
    .from('allowed_admins')
    .select('id, email, role, added_by, added_at, status, modified_by, modified_at, modified_action')
    .order('added_at', { ascending: false });

  if (!includeDeleted) query = query.neq('status', 'deleted');

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json(data);
};
