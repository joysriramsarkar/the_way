const { requireAuth } = require('../_lib/auth');
const { createClient } = require('@supabase/supabase-js');

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100) || 'untitled';
}

function estimateReadTime(html) {
  const words = (html || '').replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const session = requireAuth(req, res);
  if (!session) return;

  const {
    id, title = '', deck = '', section = '', author = '', author_role = '',
    author_bio = '', hero_img_url = '', hero_caption = '', hero_credit = '',
    content_html = ''
  } = req.body || {};

  const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

  if (id) {
    // UPDATE existing article
    const { data: existing } = await sb.from('articles').select('slug, status').eq('id', id).single();
    if (!existing) return res.status(404).json({ error: 'Article not found' });

    const updates = {
      title, deck, section, author, author_role, author_bio,
      hero_img_url, hero_caption, hero_credit, content_html,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await sb.from('articles').update(updates).eq('id', id).select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);

  } else {
    // CREATE new article
    let slug = slugify(title || 'untitled');
    // Ensure slug is unique
    const { data: existing } = await sb.from('articles').select('slug').ilike('slug', slug + '%');
    if (existing && existing.length > 0) {
      const suffixes = existing.map(a => {
        const m = a.slug.match(/-(\d+)$/);
        return m ? parseInt(m[1]) : 0;
      });
      slug = slug + '-' + (Math.max(...suffixes) + 1);
    }

    const { data, error } = await sb.from('articles').insert({
      slug, title, deck, section, author, author_role, author_bio,
      hero_img_url, hero_caption, hero_credit, content_html,
      status: 'draft',
      created_by: session.email,
    }).select().single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data);
  }
};
