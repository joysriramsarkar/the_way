'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/components/I18nProvider';
import { calculateReadTime } from '@/lib/readTime';

interface Article {
  id: string;
  slug: string;
  title: string;
  deck?: string;
  section: string;
  section_name?: string;
  author_name: string;
  created_at: string;
  hero_img_url?: string;
  content_html?: string;
}

interface Group {
  id: string;
  name: string;
  description: string;
  member_count: number;
  tags: string[];
}

export default function HomePage() {
  const { lang, t } = useI18n();
  const [articles, setArticles] = useState<Article[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [artRes, netRes] = await Promise.allSettled([
          fetch('/api/articles?action=list'),
          fetch('/api/network?action=groups')
        ]);

        if (artRes.status === 'fulfilled' && artRes.value.ok) {
          const artData = await artRes.value.json();
          if (Array.isArray(artData)) setArticles(artData.slice(0, 6));
        }

        if (netRes.status === 'fulfilled' && netRes.value.ok) {
          const netData = await netRes.value.json();
          if (netData.groups && Array.isArray(netData.groups)) setGroups(netData.groups.slice(0, 3));
        }
      } catch (err) {
        console.error('Error fetching homepage data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const lead = articles.length > 0 ? articles[0] : null;
  const secondaries = articles.length > 1 ? articles.slice(1, 3) : [];

  return (
    <>
      {/* Global Statistics Bar */}
      <div className="global-stats-bar">
        <div className="global-stats-inner">
          <div className="stat-item">
            <span className="stat-icon">🌍</span>
            <span className="stat-number">{t('stats.countries_num', '১২')}</span>
            <span>{t('stats.countries_lbl', 'দেশ')}</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-icon">👥</span>
            <span className="stat-number">{t('stats.members_num', '৪,৮২১')}</span>
            <span>{t('stats.members_lbl', 'সদস্য')}</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-icon">📝</span>
            <span className="stat-number">{t('stats.contributors_num', '১৮২')}</span>
            <span>{t('stats.contributors_lbl', 'অবদানকারী')}</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-icon">📚</span>
            <span className="stat-number">{t('stats.texts_num', '১,২৪০')}</span>
            <span>{t('stats.texts_lbl', 'গ্রন্থ')}</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-icon">🌐</span>
            <span className="stat-number">{t('stats.languages_num', '৯')}</span>
            <span>{t('stats.languages_lbl', 'ভাষা')}</span>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="container" style={{ paddingBottom: '3rem' }}>
        {/* Hero Editorial Section */}
        <section className="hero-editorial-section">
          <div className="hero-editorial-grid">
            {/* Lead Story */}
            {lead ? (
              <article className="lead-story-card">
                <Link href={`/articles/${lead.slug}`} className="lead-story-media">
                  <img
                    src={lead.hero_img_url || '/assets/images/img1.webp'}
                    alt={lead.title}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/logo.svg';
                    }}
                  />
                  <span className="lead-section-badge">{lead.section_name || t('nav.theory', 'তত্ত্ব ও দর্শন')}</span>
                </Link>
                <div className="lead-story-body">
                  <h1 className="lead-story-title">
                    <Link href={`/articles/${lead.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                      {lead.title}
                    </Link>
                  </h1>
                  <p className="lead-story-deck">{lead.deck}</p>
                  <div className="story-meta-row">
                    <div className="author-meta">
                      <span className="author-avatar" style={{ background: '#c2182b', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700 }}>
                        ✍️
                      </span>
                      <span>{lead.author_name}</span>
                    </div>
                    <span>•</span>
                    <span title="নিবন্ধের প্রকৃত শব্দের ভিত্তিতে হিসাবকৃত">
                      ⏱️ {calculateReadTime(lead.content_html || lead.deck, lang).badge}
                    </span>
                    <Link href={`/articles/${lead.slug}`} style={{ marginLeft: 'auto', color: '#c2182b', fontWeight: 700, textDecoration: 'none' }}>
                      {t('home.read_full', 'পূর্ণাঙ্গ লেখা পড়ুন ➔')}
                    </Link>
                  </div>
                </div>
              </article>
            ) : (
              <div className="card" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                {isLoading ? t('home.loading', 'প্রবন্ধ লোড হচ্ছে...') : t('home.no_articles', 'কোনো প্রবন্ধ প্রকাশিত হয়নি।')}
              </div>
            )}

            {/* Secondary Editorial Column */}
            <div className="hero-secondary-col">
              {secondaries.map((art) => (
                <article key={art.id} className="secondary-story-card">
                  <Link href={`/articles/${art.slug}`} className="sec-story-thumb">
                    <img
                      src={art.hero_img_url || '/assets/images/img2.webp'}
                      alt={art.title}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/logo.svg';
                      }}
                    />
                  </Link>
                  <div className="sec-story-content">
                    <span className="sec-badge">{art.section_name || 'বিশ্লেষণ'}</span>
                    <h3 className="sec-title">
                      <Link href={`/articles/${art.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                        {art.title}
                      </Link>
                    </h3>
                    <div className="sec-meta">
                      <span>{art.author_name}</span>
                      <span>•</span>
                      <span>⏱️ {calculateReadTime(art.content_html || art.deck, lang).badge}</span>
                    </div>
                  </div>
                </article>
              ))}

              {/* Solidarity Callout Box */}
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(25,7,11,0.95), rgba(12,3,5,0.98))',
                  border: '1px solid rgba(194, 24, 43, 0.35)',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  color: '#fff'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', color: '#f87171', fontWeight: 700, fontSize: '14px' }}>
                  <span>✊</span> {t('home.solidarity_box_title', 'আন্তর্জাতিক সংহতি সেল')}
                </div>
                <p style={{ fontSize: '13px', color: '#d1d5db', lineHeight: 1.5, margin: '0 0 12px' }}>
                  {t('home.solidarity_box_desc', 'বিশ্বব্যাপী সাম্রাজ্যবাদ-বিরোধী লড়াইয়ে যৌথ সংহতি প্রকাশ করুন বা আপনার অঞ্চলের খবর পাঠান।')}
                </p>
                <Link
                  href="/solidarity"
                  className="btn-solid-crimson"
                  style={{ padding: '0.45rem 1rem', fontSize: '0.8rem', textDecoration: 'none' }}
                >
                  {t('home.solidarity_btn', 'সংহতি আবেদন দেখুন ➔')}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Revolutionary Quote */}
        <section
          style={{
            margin: '2rem 0',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderLeft: '4px solid #c2182b',
            borderRadius: '10px',
            padding: '1.5rem 2rem'
          }}
        >
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#c2182b', fontWeight: 700, marginBottom: '6px' }}>
            {t('home.quote_label', '★ আজকের বৈপ্লবিক চিন্তা')}
          </div>
          <blockquote style={{ margin: '0 0 8px', fontSize: '1.15rem', fontFamily: "'Noto Serif Bengali', serif", color: 'var(--text-primary)', lineHeight: 1.6 }}>
            {t('home.quote_text', '“দার্শনিকরা কেবল বিশ্বকে নানাভাবে ব্যাখ্যা করেছেন; কিন্তু আসল কাজ হলো এটিকে পরিবর্তন করা।”')}
          </blockquote>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{t('home.quote_author', '— কার্ল মার্ক্স (থিসিস অন ফয়ারবাখ, ১৮৪৫)')}</span>
        </section>

        {/* Network Sections: Comrades & Groups */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', margin: '2.5rem 0' }}>
          {/* Comrades & Thinkers */}
          <section className="network-section">
            <div className="network-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              <h2 className="network-section-title" style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                {t('home.comrades_title', '👥 মানুষ (Comrades & Thinkers)')}
              </h2>
              <Link href="/directory" style={{ color: '#c2182b', textDecoration: 'none', fontSize: '13px', fontWeight: 700 }}>
                {t('home.comrades_all', 'সবাইকে দেখুন ➔')}
              </Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { name: 'রাহুল রায়', role: 'গবেষক, রাজনৈতিক অর্থনীতি', tag: 'কৃষি শ্রম', id: '1' },
                { name: 'ফারহানা হক', role: 'অনুবাদক ও লেখক', tag: 'নারীবাদ', id: '2' },
                { name: 'আসিফ মাহমুদ', role: 'ট্রেড ইউনিয়ন সংগঠক', tag: 'শ্রম আন্দোলন', id: '3' }
              ].map((p) => (
                <div key={p.id} className="card" style={{ padding: '14px 18px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#c2182b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '16px' }}>
                    {p.name.charAt(0)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: 0, fontSize: '15px', color: 'var(--text-primary)' }}>
                      <Link href={`/profile?id=${p.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                        {p.name}
                      </Link>
                    </h4>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{p.role}</span>
                  </div>
                  <span className="interest-chip" style={{ fontSize: '11px' }}>#{p.tag}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Study Circles & Groups */}
          <section className="network-section">
            <div className="network-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              <h2 className="network-section-title" style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                {t('home.study_circles_title', '📚 অধ্যয়ন ও পাঠচক্র (Study Circles)')}
              </h2>
              <Link href="/groups" style={{ color: '#c2182b', textDecoration: 'none', fontSize: '13px', fontWeight: 700 }}>
                {t('home.study_circles_all', 'সব গ্রুপ ➔')}
              </Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { name: 'ঢাকা মার্ক্সীয় পাঠচক্র', members: 124, city: 'ঢাকা' },
                { name: 'আন্তর্জাতিক রাজনৈতিক অর্থনীতি সার্কেল', members: 88, city: 'কলকাতা' },
                { name: 'সর্বহারা সংস্কৃতি ও থিয়েটার দল', members: 45, city: 'চট্টগ্রাম' }
              ].map((g, idx) => (
                <div key={idx} className="card" style={{ padding: '14px 18px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: '0 0 2px', fontSize: '15px', color: 'var(--text-primary)' }}>
                      <Link href="/groups" style={{ color: 'inherit', textDecoration: 'none' }}>
                        {g.name}
                      </Link>
                    </h4>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>📍 {g.city} • 👥 {g.members} {t('orgs.members_count', 'সদস্য')}</span>
                  </div>
                  <Link href="/groups" style={{ color: '#c2182b', textDecoration: 'none', fontWeight: 700, fontSize: '12.5px' }}>
                    {t('home.join_btn', 'যোগ দিন ➔')}
                  </Link>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Action Center ("নব্য-উদারবাদী ব্যবস্থার বিরুদ্ধে ঐক্যবদ্ধ হোন") */}
        <section className="action-center-section" style={{ marginTop: '3rem' }}>
          <div className="action-center-grid">
            <div className="action-center-intro">
              <h2>{t('home.action_title_1', 'নব্য-উদারবাদী ব্যবস্থার বিরুদ্ধে')} <span>{t('home.action_title_2', 'ঐক্যবদ্ধ হোন')}</span></h2>
              <p>
                {t('home.action_desc', '‘দ্য ওয়ে’ কেবল একটি তাত্ত্বিক পোর্টাল নয়; এটি হলো সমকালীন সাম্রাজ্যবাদী ও করপোরেট শোষণের বিরুদ্ধে বিকল্প গণআন্দোলন ও মেহনতি মানুষের মুক্তিকামী আন্তর্জাতিক নেটওয়ার্ক।')}
              </p>
              <div className="action-cards-duo">
                <div className="action-item-card">
                  <h4>{t('home.action_study_title', '📚 সমাজতান্ত্রিক পাঠচক্র')}</h4>
                  <p>{t('home.action_study_desc', 'মার্ক্স, লেনিন, গ্রামশি ও ফ্যাননের চিন্তা নিয়ে স্থানীয় ও অনলাইন পাঠচক্রে অংশ নিন।')}</p>
                  <Link href="/groups" className="btn-solid-crimson" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', textDecoration: 'none' }}>
                    {t('home.action_study_btn', 'নিবন্ধন করুন ➔')}
                  </Link>
                </div>
                <div className="action-item-card">
                  <h4>{t('home.action_submit_title', '✍️ লেখা ও গবেষণা পাঠান')}</h4>
                  <p>{t('home.action_submit_desc', 'শ্রমিক আন্দোলন, রাজনৈতিক অর্থনীতি ও আন্তর্জাতিক রাজনীতি বিষয়ক আপনার বিশ্লেষণ জমা দিন।')}</p>
                  <Link href="/submit" className="btn-solid-crimson" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', textDecoration: 'none' }}>
                    {t('home.action_submit_btn', 'লেখা পাঠান ➔')}
                  </Link>
                </div>
              </div>
            </div>

            <div className="newsletter-subscribe-box">
              <h3>{t('home.newsletter_title', '★ সমাজতান্ত্রিক বুলেটিন')}</h3>
              <p>{t('home.newsletter_desc', 'বিশ্বজুড়ে শ্রমিক আন্দোলন, সাম্রাজ্যবাদবিরোধী রিপোর্ট ও তাত্ত্বিক বিশ্লেষণ প্রতি সপ্তাহে আপনার ইনবক্সে পেতে সাবস্ক্রাইব করুন।')}</p>
              <form onSubmit={(e) => { e.preventDefault(); alert(t('home.newsletter_success', 'বুলেটিনে সাবস্ক্রাইব করা হয়েছে!')); }} className="subscribe-form-row">
                <input type="email" placeholder={t('home.newsletter_placeholder', 'আপনার ইমেইল ঠিকানা...')} required className="subscribe-input" />
                <button type="submit" className="btn-solid-crimson">{t('home.newsletter_btn', 'সাবস্ক্রাইব')}</button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
