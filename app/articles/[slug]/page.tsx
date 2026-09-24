'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useI18n } from '@/components/I18nProvider';
import { calculateReadTime } from '@/lib/readTime';

interface ArticleData {
  id: string;
  slug: string;
  title: string;
  deck?: string;
  section: string;
  section_name?: string;
  author?: string;
  author_name?: string;
  author_role?: string;
  created_at?: string;
  published_at?: string;
  content_html?: string;
  hero_img_url?: string;
  tags?: string[] | string;
}

export default function ArticlePage() {
  const { lang, t } = useI18n();
  const params = useParams();
  const slug = params?.slug as string;
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/articles?action=get&slug=${encodeURIComponent(slug)}`)
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Not found');
      })
      .then((data) => {
        setArticle(data.article || data);
      })
      .catch(() => {
        setArticle(null);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div style={{ maxWidth: '860px', margin: '60px auto', padding: '0 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
        লেখা লোড হচ্ছে...
      </div>
    );
  }

  if (!article) {
    return (
      <div style={{ maxWidth: '860px', margin: '60px auto', padding: '0 20px', textAlign: 'center' }}>
        <h2>লেখাটি পাওয়া যায়নি</h2>
        <Link href="/" style={{ color: '#c2182b', textDecoration: 'none', fontWeight: 600 }}>← মূলপাতায় ফিরে যান</Link>
      </div>
    );
  }

  return (
    <article className="article-reader-container">
      {/* Breadcrumb matching article.css */}
      <nav className="article-breadcrumb" aria-label="Breadcrumb">
        <Link href="/">হোম</Link>
        <span className="breadcrumb-sep">/</span>
        <Link href={`/sections/${article.section}`}>
          {article.section_name || article.section}
        </Link>
        <span className="breadcrumb-sep">/</span>
        <span style={{ color: 'var(--text-muted)' }}>প্রবন্ধ</span>
      </nav>

      {/* Article Header matching article.css */}
      <header className="article-header">
        <span className="article-section-pill">
          {article.section_name || 'সাম্রাজ্যবাদ ও বিশ্ব-রাজনীতি'}
        </span>
        <h1 className="article-title-main">{article.title}</h1>
        {article.deck && <p className="article-deck-lead">{article.deck}</p>}

        {/* Author & Stats Bar */}
        <div className="article-meta-card">
          <div className="article-author-info">
            <img
              loading="lazy"
              src={article.hero_img_url || '/assets/images/img1.webp'}
              alt={article.author_name}
              className="author-photo-large"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/assets/images/img1.webp';
              }}
            />
            <div className="author-names">
              <strong>{article.author_name || article.author || 'সম্পাদকীয়'}</strong>
              <span>{article.author_role || 'সম্পাদকীয় পর্ষদ'}</span>
            </div>
          </div>

          {(() => {
            const rt = calculateReadTime(article.content_html, lang);
            const dateLocale = lang === 'bn' ? 'bn-BD' : lang === 'hi' ? 'hi-IN' : lang === 'ar' ? 'ar-SA' : 'en-US';
            const dateVal = article.published_at || article.created_at || new Date().toISOString();
            return (
              <div className="article-stats-right">
                <span className="stat-badge" title={rt.text} style={{ cursor: 'help' }}>
                  ⏱️ {rt.badge}
                </span>
                <span className="stat-badge">
                  📅 {new Date(dateVal).toLocaleDateString(dateLocale, { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
            );
          })()}
        </div>
      </header>

      {/* Article Body Content */}
      <div
        className="article-body"
        style={{ fontSize: '18px', lineHeight: 1.85, color: 'var(--text-primary)' }}
        dangerouslySetInnerHTML={{ __html: article.content_html || '' }}
      />

      {/* Tags */}
      {(() => {
        const rawTags: unknown = article.tags;
        const tagList: string[] = Array.isArray(rawTags)
          ? (rawTags as unknown[]).map((t: unknown) => String(t).trim()).filter(Boolean)
          : typeof rawTags === 'string'
            ? rawTags.replace(/^[{\[]|[}\]]$/g, '').split(',').map((t: string) => t.trim().replace(/^["']|["']$/g, '')).filter(Boolean)
            : [];
        if (tagList.length === 0) return null;
        return (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '36px', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
            {tagList.map((tg) => (
              <span key={tg} className="interest-chip">
                #{tg}
              </span>
            ))}
          </div>
        );
      })()}

      {/* Revision callout */}
      <div className="card" style={{ marginTop: '40px', padding: '22px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h4 style={{ margin: '0 0 4px', fontSize: '15px' }}>লেখায় কোনো তথ্যগত ত্রুটি বা সংশোধনের প্রস্তাব আছে?</h4>
          <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>সম্পাদকীয় পরিষদের কাছে সংশোধনের আবেদন পাঠান।</span>
        </div>
        <Link
          href={`/submit?revision=true&slug=${article.slug}`}
          style={{ background: '#c2182b', color: '#fff', padding: '9px 18px', borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontWeight: 700 }}
        >
          📝 সংশোধন প্রস্তাব পাঠান
        </Link>
      </div>
    </article>
  );
}
