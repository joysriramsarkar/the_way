/**
 * api/article-seo.ts — Server-side SEO & OpenGraph renderer for articles using Neon PostgreSQL
 * Serves complete pre-rendered meta tags & HTML to crawlers & users for instant link previews
 */

import sql from './_lib/db';
import fs from 'fs';
import path from 'path';
import type { ApiRequest, ApiResponse } from '../types';

function escapeHtml(str: string): string {
  return (str || '').toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');

  const slug = (req.query?.slug as string) || '';
  const id   = (req.query?.id as string) || '';

  const host = (req.headers['x-forwarded-host'] as string) || (req.headers.host as string) || 'thewaysocialist.vercel.app';
  const proto = (req.headers['x-forwarded-proto'] as string) || 'https';
  const baseUrl = `${proto}://${host}`;

  let article: any = null;

  try {
    if (slug) {
      const rows = await sql.query('SELECT * FROM articles WHERE slug = $1 AND status = \'published\' AND is_deleted = FALSE LIMIT 1', [slug]);
      if (rows && rows[0]) article = rows[0];
    } else if (id) {
      const rows = await sql.query('SELECT * FROM articles WHERE id = $1 AND is_deleted = FALSE LIMIT 1', [id]);
      if (rows && rows[0]) article = rows[0];
    }
  } catch (err) {}

  let html = '';
  try {
    let templatePath = path.join(process.cwd(), 'public', 'article.html');
    if (!fs.existsSync(templatePath)) {
      templatePath = path.join(process.cwd(), 'article.html');
    }
    if (fs.existsSync(templatePath)) {
      html = fs.readFileSync(templatePath, 'utf8');
    }
  } catch (e) {}

  if (!html) {
    const targetUrl = `/article.html?slug=${encodeURIComponent(slug)}`;
    if (typeof res.redirect === 'function') {
      return res.redirect(302, targetUrl);
    }
    res.writeHead(302, { Location: targetUrl });
    return res.end();
  }

  if (!article) {
    if (typeof res.send === 'function') {
      return res.status(200).send(html);
    }
    res.statusCode = 200;
    return res.end(html);
  }

  const title = article.seo_title || article.title || 'Article';
  const fullTitle = `${title} — The Way (দ্য ওয়ে)`;
  const desc = article.meta_description || article.deck || 'The Way (দ্য ওয়ে) — Insights, Stories & Heritage.';
  const canonicalUrl = `${baseUrl}/article/${article.slug || ''}`;
  const imgUrl = article.hero_img_url || `${baseUrl}/assets/images/img1.webp`;
  const publishedTime = article.published_at || article.created_at || new Date().toISOString();
  const modifiedTime = article.updated_at || article.published_at || article.created_at || new Date().toISOString();
  const fictionalNames = ['অমিত দাশগুপ্ত', 'তানভীর হাসান', 'সৌমিক রায়হান', 'আহমেদ হাসান', 'Amit Dasgupta', 'Tanvir Hasan', 'Soumik Rayhan'];
  let author = (article.author || '').trim();
  if (!author || fictionalNames.some(f => author.toLowerCase().includes(f.toLowerCase()))) {
    author = 'সম্পাদকীয়';
  }
  const section = article.section || 'General';

  const schemaJson = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": canonicalUrl
    },
    "headline": article.title || title,
    "description": desc,
    "image": article.hero_img_url ? [article.hero_img_url] : [],
    "datePublished": publishedTime,
    "dateModified": modifiedTime,
    "author": [{
      "@type": "Person",
      "name": author
    }],
    "publisher": {
      "@type": "Organization",
      "name": "The Way (দ্য ওয়ে)",
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/assets/images/favicon.svg`
      }
    },
    "articleSection": section
  });

  const metaTags = `
  <title>${escapeHtml(fullTitle)}</title>
  <meta name="description" content="${escapeHtml(desc)}" />
  <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />

  <!-- Open Graph / Facebook / WhatsApp -->
  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="The Way (দ্য ওয়ে)" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(desc)}" />
  <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />
  <meta property="og:image" content="${escapeHtml(imgUrl)}" />
  <meta property="article:published_time" content="${escapeHtml(publishedTime)}" />
  <meta property="article:modified_time" content="${escapeHtml(modifiedTime)}" />
  <meta property="article:section" content="${escapeHtml(section)}" />
  <meta property="article:author" content="${escapeHtml(author)}" />

  <!-- Twitter / X -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(desc)}" />
  <meta name="twitter:image" content="${escapeHtml(imgUrl)}" />

  <!-- Google Structured Data (JSON-LD) -->
  <script type="application/ld+json">
${schemaJson}
  </script>
`;

  html = html.replace(/<title>[^<]*<\/title>/i, '');
  html = html.replace(/<meta name="description"[^>]*>/i, '');
  html = html.replace(/<head>/i, `<head>\n${metaTags}`);

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  if (typeof res.send === 'function') {
    return res.status(200).send(html);
  }
  res.statusCode = 200;
  return res.end(html);
}

