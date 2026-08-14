const { requireAuth } = require('../_lib/auth');
const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const session = requireAuth(req, res);
  if (!session) return;

  const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
  const { data, error } = await sb
    .from('articles')
    .select('id, slug, title, deck, section, author, status, created_at, updated_at, published_at, hero_img_url')
    .order('updated_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json(data || []);
};
