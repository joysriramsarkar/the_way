/**
 * api/sitemap.ts — Dynamic Multilingual XML Sitemap Generator
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { ApiRequest, ApiResponse } from '../types';

function escapeXml(unsafe: string | null | undefined): string {
  return (unsafe || '').toString().replace(/[<>&'"]/g, c => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default:  return c;
    }
  });
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=7200');

  let sb: SupabaseClient | null = null;
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
    try {
      sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
    } catch(e) {}
  }
  const host = (req.headers && (req.headers['x-forwarded-host'] || req.headers.host)) || 'thewaysocialist.vercel.app';
  const proto = (req.headers && req.headers['x-forwarded-proto']) || 'https';
  const baseUrl = `${proto}://${host}`;

  let articles: any[] = [];
  let sections: any[] = [];

  if (sb) {
    try {
      const { data: artData } = await sb
        .from('articles')
        .select('slug, updated_at, published_at, title, hero_img_url')
        .eq('status', 'published')
        .or('is_deleted.is.null,is_deleted.eq.false')
        .order('published_at', { ascending: false });
      if (artData) articles = artData;
    } catch(e) {}

    try {
      const { data: secData } = await sb
        .from('sections')
        .select('slug, updated_at, created_at')
        .eq('is_active', true)
        .eq('is_deleted', false);
      if (secData) sections = secData.filter((s: any) => s.slug && !s.slug.startsWith('__'));
    } catch(e) {}
  }

  const now = new Date().toISOString();

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <!-- Homepage -->
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <!-- Events -->
  <url>
    <loc>${baseUrl}/events</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <!-- Library -->
  <url>
    <loc>${baseUrl}/books</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>
  <!-- Search -->
  <url>
    <loc>${baseUrl}/search</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <!-- Feed -->
  <url>
    <loc>${baseUrl}/feed</loc>
    <lastmod>${now}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.8</priority>
  </url>
  <!-- Directory -->
  <url>
    <loc>${baseUrl}/directory</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.75</priority>
  </url>
  <!-- Groups -->
  <url>
    <loc>${baseUrl}/groups</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.75</priority>
  </url>
  <!-- Solidarity -->
  <url>
    <loc>${baseUrl}/solidarity</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <!-- Translations -->
  <url>
    <loc>${baseUrl}/translations</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <!-- Organizations -->
  <url>
    <loc>${baseUrl}/organizations</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.75</priority>
  </url>
  <!-- Languages -->
  <url>
    <loc>${baseUrl}/languages</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <!-- Resources -->
  <url>
    <loc>${baseUrl}/resource</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.85</priority>
  </url>
`;

  // Sections
  sections.forEach((s: any) => {
    if (s.slug) {
      xml += `  <url>
    <loc>${baseUrl}/section/${escapeXml(s.slug)}</loc>
    <lastmod>${s.updated_at || s.created_at || now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>\n`;
    }
  });

  // Articles
  articles.forEach((a: any) => {
    if (a.slug) {
      const artUrl = `${baseUrl}/article/${escapeXml(a.slug)}`;
      const artDate = a.updated_at || a.published_at || now;
      xml += `  <url>
    <loc>${artUrl}</loc>
    <lastmod>${artDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>${a.hero_img_url ? `
    <image:image>
      <image:loc>${escapeXml(a.hero_img_url)}</image:loc>
      <image:title>${escapeXml(a.title)}</image:title>
    </image:image>` : ''}
  </url>\n`;
    }
  });

  xml += `</urlset>`;

  if (typeof res.send === 'function') {
    return res.status(200).send(xml);
  }
  res.statusCode = 200;
  return res.end(xml);
}

module.exports = handler;
(module.exports as any).default = handler;
