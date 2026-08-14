const { requireAdmin } = require('../_lib/auth');
const { createClient } = require('@supabase/supabase-js');

async function countGmailAdmins(sb, excludeId) {
  const { data } = await sb
    .from('allowed_admins')
    .select('id, email, role')
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

  const session = await requireAdmin(req, res);
  if (!session) return;

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'id required' });

  const { status, role } = req.body || {};
  const updates = {};
  if (status && ['active', 'suspended', 'deleted'].includes(status)) updates.status = status;
  if (role  && ['Admin', 'Moderator'].includes(role))               updates.role   = role;
  if (!Object.keys(updates).length) return res.status(400).json({ error: 'No valid updates' });

  const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

  const { data: target } = await sb.from('allowed_admins').select('*').eq('id', id).single();
  if (!target) return res.status(404).json({ error: 'Admin not found' });

  // Block self-suspend / self-delete
  if (target.email.toLowerCase() === session.email.toLowerCase()) {
    if (updates.status === 'suspended' || updates.status === 'deleted') {
      return res.status(400).json({ error: 'You cannot suspend or remove your own account.' });
    }
  }

  const isGmailAdmin = target.email.toLowerCase().endsWith('@gmail.com') && target.role === 'Admin';

  // Min-2 Gmail Admin rule: suspending / removing a Gmail Admin
  const willDeactivate = (updates.status === 'suspended' || updates.status === 'deleted')
                        && target.status === 'active';
  if (willDeactivate && isGmailAdmin) {
    const remaining = await countGmailAdmins(sb, id);
    if (remaining < 2) {
      return res.status(400).json({
        error: 'min_admins',
        message: 'At least 2 Gmail Admin accounts must remain active. Add another Gmail Admin first.'
      });
    }
  }

  // Min-2 Gmail Admin rule: downgrading Admin → Moderator
  const willDowngrade = updates.role === 'Moderator' && target.role === 'Admin';
  if (willDowngrade && isGmailAdmin && target.status === 'active') {
    const remaining = await countGmailAdmins(sb, id);
    if (remaining < 2) {
      return res.status(400).json({
        error: 'min_admins',
        message: 'At least 2 Gmail Admin accounts must remain active. Add another Gmail Admin before downgrading this one.'
      });
    }
  }

  // Audit trail
  let action = null;
  if (updates.status === 'suspended')  action = 'suspended';
  if (updates.status === 'active' && target.status === 'suspended') action = 'unsuspended';
  if (updates.status === 'active' && target.status === 'deleted')   action = 'restored';
  if (updates.status === 'deleted')    action = 'deleted';
  if (updates.role && updates.role !== target.role)                 action = 'role_changed_to_' + updates.role;

  if (action) {
    updates.modified_by     = session.email;
    updates.modified_at     = new Date().toISOString();
    updates.modified_action = action;
  }

  const { data, error } = await sb
    .from('allowed_admins').update(updates).eq('id', id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json(data);
};
