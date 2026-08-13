/* ═══════════════════════════════════════════════════════════
   THE PRIVATIAN FAMILY — Supabase Configuration
   Central database connection for all pages
═══════════════════════════════════════════════════════════ */

const PRIVATIAN_SUPABASE_URL = 'https://aenhajqsgskimfzvlfr.supabase.co';
const PRIVATIAN_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFlbmhhanFqc2dza2ltZnp2bGZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2MDc1MDUsImV4cCI6MjEwMjE4MzUwNX0.q0wmF77hpsb8M7CQOYMq8GrDuQJ32vn1NcWFXTc5UAY';

// Initialize Supabase client
function initSupabaseClient() {
  if (window.supabase && window.supabase.createClient) {
    window._sb = window.supabase.createClient(PRIVATIAN_SUPABASE_URL, PRIVATIAN_SUPABASE_KEY);
    return window._sb;
  }
  return null;
}

// ── SECTIONS ─────────────────────────────────────────────────

async function db_getSections() {
  const sb = window._sb;
  if (!sb) return null;
  try {
    const { data, error } = await sb
      .from('sections')
      .select('*')
      .eq('is_active', true)
      .order('display_order');
    if (error) throw error;
    return data || [];
  } catch(e) {
    console.warn('[Supabase] getSections failed:', e.message);
    return null;
  }
}

async function db_saveSections(activeSections) {
  const sb = window._sb;
  if (!sb) return false;
  try {
    // Delete all non-locked sections
    await sb.from('sections').delete().eq('locked', false);

    // Re-insert
    const rows = activeSections
      .filter(s => !s.locked && !s.deleted && s.id !== 'all')
      .map((s, i) => ({
        name: s.name,
        slug: s.slug || s.id,
        display_order: i + 1,
        is_active: true,
        locked: false
      }));

    if (rows.length > 0) {
      const { error } = await sb.from('sections').insert(rows);
      if (error) throw error;
    }
    return true;
  } catch(e) {
    console.warn('[Supabase] saveSections failed:', e.message);
    return false;
  }
}

// ── ARTICLES ─────────────────────────────────────────────────

async function db_getArticles(sectionSlug, limit) {
  const sb = window._sb;
  if (!sb) return null;
  try {
    let query = sb.from('articles')
      .select('*')
      .order('published_at', { ascending: false });
    if (sectionSlug) query = query.eq('section_slug', sectionSlug);
    if (limit) query = query.limit(limit);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch(e) {
    console.warn('[Supabase] getArticles failed:', e.message);
    return null;
  }
}

async function db_saveArticle(article) {
  const sb = window._sb;
  if (!sb) return false;
  try {
    const row = {
      title: article.title,
      slug: article.slug || article.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 60),
      excerpt: article.excerpt || '',
      content: article.content || '',
      section_slug: article.section_slug || article.sectionId || '',
      author: article.author || 'The Privatian Family',
      featured_image: article.featured_image || article.image || '',
      is_featured: article.is_featured || false,
      published_at: article.published_at || new Date().toISOString()
    };
    const { error } = article.id
      ? await sb.from('articles').update(row).eq('id', article.id)
      : await sb.from('articles').insert(row);
    if (error) throw error;
    return true;
  } catch(e) {
    console.warn('[Supabase] saveArticle failed:', e.message);
    return false;
  }
}

async function db_deleteArticle(id) {
  const sb = window._sb;
  if (!sb) return false;
  try {
    const { error } = await sb.from('articles').delete().eq('id', id);
    if (error) throw error;
    return true;
  } catch(e) {
    console.warn('[Supabase] deleteArticle failed:', e.message);
    return false;
  }
}

// Auto-init when script loads
document.addEventListener('DOMContentLoaded', function() {
  if (window.supabase && window.supabase.createClient) {
    initSupabaseClient();
  }
});
