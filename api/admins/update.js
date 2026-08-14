const { requireAdmin } = require('../_lib/auth');
const { createClient } = require('@supabase/supabase-js');

async function countGmailAdmins(sb, excludeId) {
  const { data } = await sb
    .from('allowed_admins')
    .select('id, email')
    .eq('status', 'active')
    .eq('role', 'Admin');
  return (data || [])
    .filter(a => a.email.toLowerCase().endsWith('@gmail.com') && a.id !== excludeId)
    .length;
}

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
  if (status && ['active', 'suspended', 'deleted'].includes(status)) updates.status = status;
  if (role && ['Admin', 'Moderator'].includes(role)) updates.role = role;
  if (!Object.keys(updates).length) return res.status(400).json({ error: 'No valid updates' });

  const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

  // Fetch target
  const { data: target } = await sb.from('allowed_admins').select('*').eq('id', id).single();
  if (!target) return res.status(404).json({ error: 'Admin not found' });

  // Block self-suspend/self-delete
  if (target.email.toLowerCase() === session.email.toLowerCase()) {
    if (updates.status === 'suspended' || updates.status === 'deleted') {
      return res.status(400).json({ error: 'You cannot suspend or remove your own account.' });
    }
  }

  // Min-2 @gmail.com Admin rule for suspend
  const willDeactivate = updates.status === 'suspended' || updates.status === 'deleted';
  const isGmailAdmin = target.status === 'active'
    && target.role === 'Admin'
    && target.email.toLowerCase().endsWith('@gmail.com');

  if (willDeactivate && isGmailAdmin) {
    // Count remaining active Gmail Admins excluding this one
    const remaining = await countGmailAdmins(sb, id);
    if (remaining < 2) {
      return res.status(400).json({
        error: 'min_admins',
        message: 'At least 2 Gmail Admin accounts must remain active. Add another Gmail Admin before suspending this one.'
      });
    }
  }

  const { data, error } = await sb
    .from('allowed_admins').update(updates).eq('id', id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json(data);
};
