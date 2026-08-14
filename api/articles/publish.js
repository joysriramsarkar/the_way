const { requireAdmin } = require('../_lib/auth');
const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const session = await requireAdmin(req, res);
  if (!session) return;

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'id required' });

  const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
  const { data: article } = await sb.from('articles').select('status').eq('id', id).single();
  if (!article) return res.status(404).json({ error: 'Article not found' });

  const newStatus = article.status === 'published' ? 'draft' : 'published';
  const updates = {
    status: newStatus,
    published_at: newStatus === 'published' ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await sb.from('articles').update(updates).eq('id', id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json(data);
};
