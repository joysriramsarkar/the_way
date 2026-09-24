'use client';

import React, { useState, useEffect } from 'react';

interface TranslationProject {
  id: string;
  title: string;
  original_author: string;
  source_lang: string;
  target_lang: string;
  status: 'available' | 'in_progress' | 'completed';
  claimed_by?: string;
  description: string;
}

export default function TranslationsPage() {
  const [projects, setProjects] = useState<TranslationProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [sourceFilter, setSourceFilter] = useState('all');
  const [targetFilter, setTargetFilter] = useState('all');

  useEffect(() => {
    fetch('/api/translations?action=list')
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Failed to load translations');
      })
      .then((data) => {
        if (data.success && Array.isArray(data.projects)) {
          const mapped: TranslationProject[] = data.projects.map((p: any) => ({
            id: p.id,
            title: p.source_title || p.title,
            original_author: p.source_author || p.author || 'আন্তর্জাতিক সমাজতান্ত্রিক চিন্তক',
            source_lang: p.source_lang || 'en',
            target_lang: p.target_lang || 'bn',
            status: p.status === 'completed' ? 'completed' : p.status === 'in_progress' ? 'in_progress' : 'available',
            claimed_by: p.translator_name || p.translator || (p.status === 'in_progress' ? 'অনুবাদক দল' : undefined),
            description: p.original_text || p.description || 'সমাজতান্ত্রিক তাত্ত্বিক দলিল ও রাজনৈতিক সাহিত্যের যৌথ অনুবাদ।'
          }));
          setProjects(mapped);
        } else {
          setProjects([]);
        }
      })
      .catch(() => {
        setProjects([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = projects.filter((p) => {
    const srcMatch = sourceFilter === 'all' || p.source_lang === sourceFilter;
    const tgtMatch = targetFilter === 'all' || p.target_lang === targetFilter;
    return srcMatch && tgtMatch;
  });

  const handleClaim = async (id: string) => {
    try {
      await fetch('/api/translations?action=claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
    } catch {}
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'in_progress', claimed_by: 'আপনি (দাবি করেছেন)' } : p))
    );
    alert('অভিনন্দন! অনুবাদ প্রজেক্টটি আপনার নামে নথিভুক্ত হয়েছে। ড্রাফট সম্পন্ন হলে জমা দিন।');
  };

  return (
    <div className="translations-page page-wrap" style={{ maxWidth: '1100px', margin: '30px auto', padding: '0 20px' }}>
      <div style={{ marginBottom: '26px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 6px', color: 'var(--text-primary)' }}>
          🌐 আন্তর্জাতিক অনুবাদ ব্রিগেড (Translation Hub)
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14.5px', margin: 0 }}>
          বিশ্বের সমাজতান্ত্রিক সাহিত্য, তত্ত্ব ও মুক্তিকামী দলিল বিভিন্ন ভাষায় অনূদিত করার যৌথ উদ্যোগ।
        </p>
      </div>

      {/* Filter row */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '24px', display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div>
          <label style={{ fontSize: '12.5px', fontWeight: 600, marginRight: '8px', color: 'var(--text-muted)' }}>মূল ভাষা:</label>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', color: 'var(--text-primary)' }}
          >
            <option value="all">সব ভাষা</option>
            <option value="en">English</option>
            <option value="ru">Русский (Russian)</option>
            <option value="de">Deutsch</option>
            <option value="es">Español</option>
            <option value="zh">中文 (Chinese)</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize: '12.5px', fontWeight: 600, marginRight: '8px', color: 'var(--text-muted)' }}>অনূদিত ভাষা:</label>
          <select
            value={targetFilter}
            onChange={(e) => setTargetFilter(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', color: 'var(--text-primary)' }}
          >
            <option value="all">সব ভাষা</option>
            <option value="bn">বাংলা (Bengali)</option>
            <option value="zh">中文 (Chinese)</option>
            <option value="es">Español</option>
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
          অনুবাদ প্রকল্প তালিকা লোড হচ্ছে...
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
          কোনো অনুবাদ প্রকল্প পাওয়া যায়নি।
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '22px' }}>
          {filtered.map((proj) => (
            <div key={proj.id} className="card trans-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span className="interest-chip" style={{ fontSize: '11.5px', fontWeight: 700 }}>
                  {proj.source_lang.toUpperCase()} ➔ {proj.target_lang.toUpperCase()}
                </span>
                <span
                  style={{
                    fontSize: '11.5px',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '12px',
                    background: proj.status === 'completed' ? 'rgba(22,163,74,0.1)' : proj.status === 'in_progress' ? 'rgba(217,119,6,0.1)' : 'rgba(2,132,199,0.1)',
                    color: proj.status === 'completed' ? '#16a34a' : proj.status === 'in_progress' ? '#d97706' : '#0284c7'
                  }}
                >
                  {proj.status === 'completed' ? '✓ সম্পন্ন' : proj.status === 'in_progress' ? '⏳ চলমান' : '✍️ অনুবাদযোগ্য'}
                </span>
              </div>

              <h3 style={{ fontSize: '17px', fontWeight: 700, margin: '0 0 4px', color: 'var(--text-primary)' }}>
                {proj.title}
              </h3>
              <span style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                লেখক: {proj.original_author}
              </span>

              <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.5, flex: 1, marginBottom: '18px' }}>
                {proj.description}
              </p>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {proj.claimed_by ? `দায়িত্বে: ${proj.claimed_by}` : 'এখনো কেউ নেয়নি'}
                </span>
                {proj.status === 'available' && (
                  <button
                    type="button"
                    onClick={() => handleClaim(proj.id)}
                    style={{ background: '#c2182b', color: '#fff', border: 'none', padding: '7px 16px', borderRadius: '6px', fontWeight: 700, fontSize: '12.5px', cursor: 'pointer' }}
                  >
                    অনুবাদ করুন
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
