'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface ResourceDetails {
  id: string;
  title: string;
  title_bn?: string;
  title_en?: string;
  author: string;
  year?: string | number;
  description?: string;
  category?: string;
  provider?: string;
  read_url?: string;
  pdf_url?: string;
  editions?: Array<{
    title: string;
    language: string;
    year?: string;
    publisher?: string;
  }>;
  related_research?: Array<{
    id: string;
    title: string;
    authors?: string[];
    year?: string | number;
    venue?: string;
    doi?: string;
  }>;
  concept?: {
    canonical: string;
    wikidata_id?: string;
    description?: string;
  };
}

export default function ResourceDetailPage() {
  const params = useParams();
  const rawId = (params?.id as string) || '';
  const [resource, setResource] = useState<ResourceDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!rawId) return;

    fetch(`/api/search?_route=resources&action=get&id=${encodeURIComponent(rawId)}`)
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Not found');
      })
      .then((data) => {
        setResource(data.resource || data);
      })
      .catch(() => {
        setResource(null);
      })
      .finally(() => setLoading(false));
  }, [rawId]);

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
        রিসোর্স বিবরণী লোড হচ্ছে...
      </div>
    );
  }

  if (!resource) {
    return (
      <div style={{ padding: '60px', textAlign: 'center' }}>
        <h2>রিসোর্স পাওয়া যায়নি</h2>
        <Link href="/search" style={{ color: '#c41230' }}>← অনুসন্ধানে ফিরে যান</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '1080px', margin: '0 auto', padding: '24px 20px 60px' }}>
      {/* Breadcrumb */}
      <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
        <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>হোম</Link> &gt;{' '}
        <Link href="/books" style={{ color: 'inherit', textDecoration: 'none' }}>লাইব্রেরি</Link> &gt;{' '}
        <span>{resource.title_bn || resource.title}</span>
      </div>

      {/* Hero Card */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, rgba(26,6,10,0.95), rgba(12,4,6,0.98))',
          border: '1px solid rgba(196,18,48,0.25)',
          borderRadius: '16px',
          padding: '2.5rem',
          margin: '0 0 2rem',
          display: 'grid',
          gridTemplateColumns: 'minmax(140px, 200px) 1fr',
          gap: '2rem',
          color: '#fff',
          boxShadow: '0 16px 40px rgba(0,0,0,0.5)'
        }}
      >
        {/* Cover */}
        <div
          style={{
            background: '#1a1012',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '3.5rem',
            height: '240px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.6)'
          }}
        >
          📕
        </div>

        {/* Info */}
        <div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', background: '#c41230', color: '#fff', padding: '3px 8px', borderRadius: '4px', fontWeight: 700 }}>
              {resource.provider || 'Socialist Archive'}
            </span>
            {resource.year && (
              <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.1)', color: '#e5e7eb', padding: '3px 8px', borderRadius: '4px' }}>
                প্রকাশকাল: {resource.year}
              </span>
            )}
          </div>

          <h1 style={{ fontFamily: "'Noto Serif Bengali', serif", fontSize: '2rem', fontWeight: 800, margin: '0 0 8px', lineHeight: 1.3 }}>
            {resource.title}
          </h1>

          <div style={{ fontSize: '15px', color: '#f87171', fontWeight: 600, marginBottom: '14px' }}>
            লেখক: {resource.author}
          </div>

          <p style={{ fontSize: '14.5px', color: '#d1d5db', lineHeight: 1.6, marginBottom: '20px' }}>
            {resource.description}
          </p>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {resource.read_url && (
              <Link
                href={resource.read_url}
                style={{
                  background: '#c41230',
                  color: '#fff',
                  textDecoration: 'none',
                  padding: '9px 20px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '13.5px'
                }}
              >
                📖 অনলাইনে পড়ুন
              </Link>
            )}
            {resource.pdf_url && (
              <a
                href={resource.pdf_url}
                target="_blank"
                rel="noreferrer"
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  color: '#fff',
                  textDecoration: 'none',
                  padding: '9px 18px',
                  borderRadius: '8px',
                  fontSize: '13.5px'
                }}
              >
                📥 পিডিএফ ডাউনলোড
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Concept Mapping */}
      {resource.concept && (
        <div className="card" style={{ padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '14px', margin: '0 0 6px', color: '#c41230', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            উইকিডাটা তাত্ত্বিক কনসেপ্ট
          </h3>
          <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>
            {resource.concept.canonical}
          </div>
          <p style={{ margin: 0, fontSize: '13.5px', color: 'var(--text-secondary)' }}>
            {resource.concept.description}
          </p>
        </div>
      )}

      {/* Editions Grid */}
      {resource.editions && resource.editions.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontFamily: "'Noto Serif Bengali', serif", fontSize: '1.4rem', fontWeight: 700, margin: '0 0 16px', color: 'var(--text-primary)' }}>
            উপলব্ধ সংস্করণসমূহ (Editions)
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {resource.editions.map((ed, idx) => (
              <div
                key={idx}
                className="card"
                style={{
                  padding: '16px 20px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-card)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11px', background: 'rgba(196,18,48,0.12)', color: '#c41230', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                    🌐 {ed.language}
                  </span>
                  {ed.year && <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{ed.year}</span>}
                </div>
                <h4 style={{ fontSize: '14.5px', fontWeight: 700, margin: '0 0 4px', color: 'var(--text-primary)' }}>
                  {ed.title}
                </h4>
                {ed.publisher && (
                  <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>প্রকাশক: {ed.publisher}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related Research Papers via OpenAlex */}
      {resource.related_research && resource.related_research.length > 0 && (
        <div>
          <h2 style={{ fontFamily: "'Noto Serif Bengali', serif", fontSize: '1.4rem', fontWeight: 700, margin: '0 0 16px', color: 'var(--text-primary)' }}>
            সংশ্লিষ্ট একাডেমিক গবেষণাপত্র (OpenAlex Scholarly Graph)
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {resource.related_research.map((paper) => (
              <div
                key={paper.id}
                className="card"
                style={{
                  padding: '16px 20px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-card)'
                }}
              >
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 6px', color: 'var(--text-primary)' }}>
                  {paper.title}
                </h4>
                <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  {paper.authors?.join(', ')} • <em>{paper.venue}</em> ({paper.year})
                </div>
                {paper.doi && (
                  <div style={{ fontSize: '12px' }}>
                    <a
                      href={`https://doi.org/${paper.doi}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: '#c41230', textDecoration: 'none', fontWeight: 600 }}
                    >
                      DOI লিঙ্ক ➔
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
