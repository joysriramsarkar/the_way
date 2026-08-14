const { requireAdmin } = require('../_lib/auth');
const { createClient } = require('@supabase/supabase-js');

async function countGmailAdmins(sb) {
  const { data } = await sb
    .from('allowed_admins')
    .select('id, email')
    .eq('status', 'active')
    .eq('role', 'Admin');
  return (data || []).filter(a => a.email.toLowerCase().endsWith('@gmail.com')).length;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'DELETE') return res.status(405).end();

  const session = await requireAdmin(req, res);
  if (!session) return;

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'id required' });

  const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

  const { data: target } = await sb.from('allowed_admins').select('*').eq('id', id).single();
  if (!target) return res.status(404).json({ error: 'Admin not found' });

  // Block self-delete
  if (target.email.toLowerCase() === session.email.toLowerCase()) {
    return res.status(400).json({ error: 'You cannot remove your own account.' });
  }

  // Min-2 Gmail Admin rule (only if removing an active Gmail Admin)
  const isGmailAdmin = target.status === 'active'
    && target.role === 'Admin'
    && target.email.toLowerCase().endsWith('@gmail.com');

  if (isGmailAdmin) {
    const count = await countGmailAdmins(sb);
    if (count <= 2) {
      return res.status(400).json({
        error: 'min_admins',
        message: 'At least 2 Gmail Admin accounts must remain active. Add another Gmail Admin first.'
      });
    }
  }

  // Soft-delete with audit trail
  const { error } = await sb
    .from('allowed_admins')
    .update({
      status:          'deleted',
      modified_by:     session.email,
      modified_at:     new Date().toISOString(),
      modified_action: 'deleted'
    })
    .eq('id', id);

  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ success: true });
};
