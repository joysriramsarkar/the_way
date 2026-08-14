/**
 * GET /api/sections — Public endpoint (no auth required)
 * Returns active sections from Supabase, ordered by display_order.
 * Used by the public-facing homepage and other pages to dynamically
 * render section/category labels.
 *
 * Query params:
 *   ?status=active  (default) -- only active, non-deleted sections
 *   ?status=all     -- all sections (admin use)
 */

const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
  // CORS -- public read access
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const status = (req.query && req.query.status) || 'active';

  try {
    const sb = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    let query = sb
      .from('sections')
      .select('name, slug, display_order, is_active, locked, is_deleted')
      .order('display_order', { ascending: true });

    if (status !== 'all') {
      query = query.eq('is_active', true).eq('is_deleted', false);
    }

    const { data, error } = await query;
    if (error) throw error;

    const sections = (data || [])
      .filter(function(r) { return !r.locked; })
      .map(function(r) {
        return { name: r.name, slug: r.slug, display_order: r.display_order };
      });

    return res.status(200).json(sections);
  } catch (e) {
    console.error('[GET /api/sections] error:', e.message);
    return res.status(500).json({ error: 'Failed to fetch sections' });
  }
};
