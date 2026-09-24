'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CATEGORIES, WORKS, BookWork } from '@/data/books-data';

export default function BooksPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filtered = WORKS.filter((b) => {
    const matchesCat = selectedCategory === 'all' || b.cat === selectedCategory;
    const matchesSearch =
      search.trim() === '' ||
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase()) ||
      (b.orig && b.orig.toLowerCase().includes(search.toLowerCase())) ||
      (b.desc && b.desc.toLowerCase().includes(search.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="books-page page-wrap" style={{ maxWidth: '1200px', margin: '36px auto', padding: '0 20px' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '28px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <span style={{ fontSize: '32px' }}>📖</span>
          <h1 style={{ fontSize: '30px', fontWeight: 900, margin: 0, color: 'var(--text-primary)' }}>
            লাল পাঠাগার — বিপ্লবী সাহিত্যের মুক্ত ভাণ্ডার
          </h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px', margin: 0, maxWidth: '800px', lineHeight: 1.6 }}>
          মার্কস, এঙ্গেলস, লেনিন, রোজা লুক্সেমবার্গ, মাও সেতুং, ফ্রান্তস ফানোঁ থেকে শুরু করে লাতিন আমেরিকা ও বাংলার কৃষক-শ্রমিক বিপ্লবের ধ্রুপদী টেক্সট, ডিজিটাইজড বই ও রিডার।
        </p>
      </div>

      {/* Search & Category Filter */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
        <div className="card" style={{ padding: '12px 18px' }}>
          <input
            type="text"
            placeholder="বইয়ের নাম, লেখক বা বিষয় দিয়ে খুঁজুন (উদাঃ পুঁজি, লেনিন, ইশতেহার, সাম্রাজ্যবাদ)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-body)',
              color: 'var(--text-primary)',
              fontSize: '15px',
              outline: 'none'
            }}
          />
        </div>

        {/* Category Chips */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            onClick={() => setSelectedCategory('all')}
            style={{
              padding: '7px 16px',
              borderRadius: '20px',
              border: selectedCategory === 'all' ? '1px solid #c2182b' : '1px solid var(--border-color)',
              background: selectedCategory === 'all' ? '#c2182b' : 'var(--bg-card)',
              color: selectedCategory === 'all' ? '#fff' : 'var(--text-primary)',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            সব বই ({WORKS.length})
          </button>
          {CATEGORIES.map((cat) => {
            const count = WORKS.filter((w) => w.cat === cat.id).length;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  padding: '7px 16px',
                  borderRadius: '20px',
                  border: isSelected ? '1px solid #c2182b' : '1px solid var(--border-color)',
                  background: isSelected ? '#c2182b' : 'var(--bg-card)',
                  color: isSelected ? '#fff' : 'var(--text-primary)',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {cat.title} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Book Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '22px' }}>
        {filtered.map((b) => {
          const categoryObj = CATEGORIES.find((c) => c.id === b.cat);
          const readerId = b.slug || b.id;
          return (
            <div
              key={b.id}
              className="card"
              style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-card)',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <span style={{ fontSize: '32px' }}>📕</span>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '3px 10px',
                    borderRadius: '12px',
                    background: 'var(--bg-body)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-muted)'
                  }}
                >
                  {categoryObj?.title || b.cat} • {b.year}
                </span>
              </div>

              <h2 style={{ fontSize: '19px', fontWeight: 800, margin: '0 0 6px', color: 'var(--text-primary)', lineHeight: 1.35 }}>
                {b.title}
              </h2>
              {b.orig && (
                <span style={{ fontSize: '12.5px', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '8px' }}>
                  {b.orig}
                </span>
              )}

              <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#c2182b', marginBottom: '12px' }}>
                ✍️ {b.author}
              </span>

              <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.6, flex: 1, marginBottom: '20px' }}>
                {b.desc}
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '14px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {b.links && b.links.length > 0 && b.links[0]?.url && (
                    <a
                      href={b.links[0].url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: '12px',
                        color: 'var(--text-muted)',
                        textDecoration: 'none',
                        border: '1px solid var(--border-color)',
                        padding: '4px 8px',
                        borderRadius: '6px'
                      }}
                    >
                      🔗 {b.links[0].label || 'উৎস'}
                    </a>
                  )}
                  {b.pdf && (
                    <a
                      href={b.pdf}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: '12px',
                        color: 'var(--text-muted)',
                        textDecoration: 'none',
                        border: '1px solid var(--border-color)',
                        padding: '4px 8px',
                        borderRadius: '6px'
                      }}
                    >
                      📥 PDF
                    </a>
                  )}
                </div>

                <Link
                  href={`/books/${readerId}`}
                  style={{
                    background: '#c2182b',
                    color: '#fff',
                    textDecoration: 'none',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '13px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  ডিজিটাল রিডার ➔
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '18px' }}>কোনো বই পাওয়া যায়নি। অন্য কোনো বিষয় বা লেখকের নাম দিয়ে চেষ্টা করুন।</p>
        </div>
      )}
    </div>
  );
}
