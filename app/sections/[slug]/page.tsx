'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const SECTIONS_META: Record<string, { title: string; desc: string; icon: string }> = {
  'theory-philosophy': {
    title: 'তত্ত্ব ও দর্শন (Theory & Philosophy)',
    desc: 'দ্বন্দ্বমূলক বস্তুবাদ, ঐতিহাসিক বস্তুবাদ, উদ্বৃত্ত মূল্য তত্ত্ব ও সমাজতান্ত্রিক চিন্তন।',
    icon: '📕'
  },
  'imperialism-geopolitics': {
    title: 'সাম্রাজ্যবাদ ও বিশ্ব-রাজনীতি (Imperialism & Geopolitics)',
    desc: 'নয়া-উপনিবেশবাদ, ডলার অস্ত্রায়ন, সামরিক জোট ও বহুমেরুকেন্দ্রিক বিকল্পের অন্বেষণ।',
    icon: '🌐'
  },
  'labor-peasant': {
    title: 'শ্রম ও গণসংগ্রাম (Labor & Movements)',
    desc: 'শ্রমিক শ্রেণির লড়াই, কৃষক আন্দোলন, ট্রেড ইউনিয়ন সংগ্রাম ও ধর্মঘট।',
    icon: '✊'
  },
  'political-economy': {
    title: 'রাজনৈতিক অর্থনীতি (Political Economy)',
    desc: 'পুঁজির সঞ্চয়ন, অসম বিনিময়, নিওলিবারেল বেসরকারীকরণ ও সমাজতান্ত্রিক পরিকল্পনা।',
    icon: '📊'
  },
  'culture-revolution': {
    title: 'সংস্কৃতি ও বিপ্লব (Culture & Revolution)',
    desc: 'সংস্কৃতির হেজেমনি, সর্বহারা সাহিত্য, পথনাটক ও বিপ্লবী গণসঙ্গীত।',
    icon: '🎭'
  },
  'manifestos-archives': {
    title: 'ইশতেহার ও দলিল (Manifestos & Archives)',
    desc: 'কমিউনিস্ট ইশতেহার, ঐতিহাসিক প্রস্তাব ও পার্টি দলিলের সংগ্রহশালা।',
    icon: '📜'
  }
};

export default function SectionPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const meta = SECTIONS_META[slug] || {
    title: 'বিভাগীয় সংগ্রহ',
    desc: 'সমাজতান্ত্রিক চিন্তন ও বিশ্লেষণের আর্কাইভ।',
    icon: '📂'
  };

  const [articles, setArticles] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/articles?action=list&section=${slug}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          setArticles(data);
        } else {
          setArticles([]);
        }
      })
      .catch(() => {
        setArticles([]);
      });
  }, [slug]);

  return (
    <div className="section-page page-wrap" style={{ maxWidth: '1000px', margin: '36px auto', padding: '0 20px' }}>
      <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '24px', marginBottom: '32px' }}>
        <span style={{ fontSize: '32px' }}>{meta.icon}</span>
        <h1 style={{ fontSize: '32px', fontWeight: 800, margin: '8px 0', color: 'var(--text-primary)' }}>
          {meta.title}
        </h1>
        <p style={{ fontSize: '16px', color: 'var(--text-secondary)', margin: 0 }}>
          {meta.desc}
        </p>
      </div>

      {articles.length === 0 ? (
        <div className="card" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '17px', margin: '0 0 10px' }}>এই বিভাগে এখনও কোনো প্রবন্ধ প্রকাশিত হয়নি।</p>
          <Link href="/" style={{ color: '#c2182b', textDecoration: 'none', fontWeight: 600 }}>← মূলপাতায় ফিরে যান</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {articles.map((art) => (
            <article key={art.id} className="card" style={{ padding: '24px' }}>
              <h2 style={{ fontSize: '22px', margin: '0 0 8px' }}>
                <Link href={`/articles/${art.slug}`} style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>
                  {art.title}
                </Link>
              </h2>
              <p style={{ fontSize: '14.5px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>
                {art.deck}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
                <span>✍️ {art.author_name}</span>
                <Link href={`/articles/${art.slug}`} style={{ color: '#c2182b', fontWeight: 700, textDecoration: 'none' }}>
                  পড়ুন ➔
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
