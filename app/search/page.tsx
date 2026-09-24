'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface SearchResultItem {
  id: string;
  type: 'article' | 'book' | 'research' | 'people' | 'group' | string;
  title: string;
  subtitle?: string;
  author?: string;
  url?: string;
  section?: string;
  published_at?: string;
  year?: string;
  doi?: string;
  venue?: string;
  role?: string;
  country?: string;
}

interface ConceptMapping {
  canonical: string;
  bn?: string;
  wikidata_id?: string;
  description?: string;
}

function SearchPageContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [activeCategory, setActiveCategory] = useState<'all' | 'articles' | 'books' | 'research' | 'people' | 'groups'>('all');
  const [loading, setLoading] = useState(false);
  const [concept, setConcept] = useState<ConceptMapping | null>(null);
  const [results, setResults] = useState<{
    articles: SearchResultItem[];
    books: SearchResultItem[];
    research: SearchResultItem[];
    people: SearchResultItem[];
    groups: SearchResultItem[];
  }>({
    articles: [],
    books: [],
    research: [],
    people: [],
    groups: []
  });

  const performSearch = async (searchTerm: string, category: string) => {
    if (!searchTerm.trim()) {
      setResults({ articles: [], books: [], research: [], people: [], groups: [] });
      setConcept(null);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchTerm)}&category=${encodeURIComponent(category)}`);
      if (res.ok) {
        const data = await res.json();
        setConcept(data.concept || null);
        setResults({
          articles: data.categories?.articles || data.results?.articles || [],
          books: data.categories?.books || data.results?.books || [],
          research: data.categories?.research || data.results?.research || [],
          people: data.categories?.people || data.results?.people || [],
          groups: data.categories?.groups || data.results?.groups || []
        });
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery, activeCategory);
    }
  }, [initialQuery, activeCategory]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query, activeCategory);
  };

  const allItems: SearchResultItem[] = [
    ...(activeCategory === 'all' || activeCategory === 'articles' ? results.articles : []),
    ...(activeCategory === 'all' || activeCategory === 'books' ? results.books : []),
    ...(activeCategory === 'all' || activeCategory === 'research' ? results.research : []),
    ...(activeCategory === 'all' || activeCategory === 'people' ? results.people : []),
    ...(activeCategory === 'all' || activeCategory === 'groups' ? results.groups : [])
  ];

  const getBadge = (type: string) => {
    switch (type) {
      case 'article':
        return { label: 'প্রবন্ধ', bg: 'rgba(59,130,246,0.15)', color: '#60a5fa' };
      case 'book':
        return { label: 'বই / ক্লাসিকস', bg: 'rgba(196,18,48,0.15)', color: '#f87171' };
      case 'research':
        return { label: 'একাডেমিক গবেষণা', bg: 'rgba(168,85,247,0.15)', color: '#c084fc' };
      case 'people':
        return { label: 'কর্মী / তাত্ত্বিক', bg: 'rgba(34,197,94,0.15)', color: '#4ade80' };
      case 'group':
        return { label: 'পাঠচক্র ও সেল', bg: 'rgba(234,179,8,0.15)', color: '#facc15' };
      default:
        return { label: 'রিসোর্স', bg: 'rgba(255,255,255,0.1)', color: '#e5e7eb' };
    }
  };

  return (
    <div className="container" style={{ maxWidth: '1080px', margin: '0 auto', padding: '24px 20px 60px' }}>
      {/* Search Header Hero */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(20,5,8,0.95) 0%, rgba(10,3,5,0.98) 100%)',
          border: '1px solid rgba(196,18,48,0.25)',
          borderRadius: '16px',
          padding: '2.5rem 2rem',
          margin: '1.5rem 0 2rem',
          textAlign: 'center',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
        }}
      >
        <h1 style={{ fontFamily: "'Noto Serif Bengali', serif", fontSize: '2.2rem', fontWeight: 800, margin: '0 0 10px', color: '#fff' }}>
          🔍 বহুভাষিক সমাজতান্ত্রিক জ্ঞান অনুসন্ধান
        </h1>
        <p style={{ color: '#d1d5db', fontSize: '0.98rem', maxWidth: '640px', margin: '0 auto 20px', lineHeight: 1.5 }}>
          আন্তর্জাতিক সমাজতান্ত্রিক প্রবন্ধ, ধ্রুপদী বই, ওপেনঅ্যালেক্স গবেষণা, উইকিডাটা কনসেপ্ট ও আন্দোলন কর্মীদের সমন্বিত নলেজ গ্রাফ সার্চ।
        </p>

        {/* Search Bar Input */}
        <form onSubmit={handleFormSubmit} style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', gap: '8px' }}>
          <input
            type="text"
            placeholder="তত্ত্ব, বই, সাম্রাজ্যবাদ, উদ্বৃত্ত মূল্য..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1,
              padding: '12px 18px',
              borderRadius: '24px',
              border: '1px solid rgba(196,18,48,0.4)',
              background: 'rgba(255,255,255,0.06)',
              color: '#fff',
              fontSize: '1rem',
              outline: 'none'
            }}
          />
          <button
            type="submit"
            style={{
              background: '#c41230',
              color: '#fff',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '24px',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer'
            }}
          >
            অনুসন্ধান
          </button>
        </form>
      </div>

      {/* Category Tabs */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '24px', borderBottom: '1px solid var(--border-color)' }}>
        {[
          { key: 'all', label: 'সব ফলাফল' },
          { key: 'articles', label: '📄 প্রবন্ধ' },
          { key: 'books', label: '📚 বই ও ক্লাসিকস' },
          { key: 'research', label: '🎓 গবেষণা ও জার্নাল' },
          { key: 'people', label: '👥 ব্যক্তিত্ব' },
          { key: 'groups', label: '🚩 পাঠচক্র ও গ্রুপ' }
        ].map((c) => (
          <button
            key={c.key}
            onClick={() => setActiveCategory(c.key as any)}
            style={{
              padding: '6px 14px',
              borderRadius: '16px',
              border: activeCategory === c.key ? '1px solid #c41230' : '1px solid transparent',
              background: activeCategory === c.key ? 'rgba(196,18,48,0.15)' : 'transparent',
              color: activeCategory === c.key ? '#fff' : 'var(--text-muted)',
              fontWeight: activeCategory === c.key ? 700 : 500,
              fontSize: '13.5px',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Concept Box if mapped */}
      {concept && (
        <div
          className="card"
          style={{
            background: 'linear-gradient(135deg, rgba(196,18,48,0.1), rgba(0,0,0,0.2))',
            border: '1px solid rgba(196,18,48,0.3)',
            borderRadius: '12px',
            padding: '16px 20px',
            marginBottom: '24px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '11px', background: '#c41230', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
              উইকিডাটা নলেজ কনসেপ্ট
            </span>
            <strong style={{ fontSize: '15px', color: 'var(--text-primary)' }}>{concept.canonical}</strong>
            {concept.bn && <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>({concept.bn})</span>}
          </div>
          {concept.description && (
            <p style={{ margin: 0, fontSize: '13.5px', color: 'var(--text-secondary)' }}>
              {concept.description}
            </p>
          )}
        </div>
      )}

      {/* Results List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          নলেজ গ্রাফ ও ডেটাবেজে অনুসন্ধান চলছে...
        </div>
      ) : allItems.length === 0 ? (
        <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
          {query ? `‘${query}’ সম্পর্কিত কোনো ফলাফল পাওয়া যায়নি। অন্য কোনো কি-ওয়ার্ড দিয়ে খুঁজুন।` : 'সার্চ বক্সে যেকোনো শব্দ লিখে খুঁজুন।'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {allItems.map((item, idx) => {
            const badge = getBadge(item.type);
            const targetUrl = item.url || (item.type === 'article' ? `/articles/${item.id}` : (item.type === 'book' ? `/books` : '#'));

            return (
              <div
                key={`${item.type}-${item.id || idx}`}
                className="card"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '18px 22px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  transition: 'border-color 0.2s, transform 0.2s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: badge.bg, color: badge.color }}>
                    {badge.label}
                  </span>
                  {item.author && <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>• {item.author}</span>}
                  {item.year && <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>• ({item.year})</span>}
                </div>

                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '2px 0', color: 'var(--text-primary)' }}>
                  <Link href={targetUrl} style={{ color: 'inherit', textDecoration: 'none' }}>
                    {item.title}
                  </Link>
                </h3>

                {(item.subtitle || item.venue) && (
                  <p style={{ margin: 0, fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {item.subtitle || item.venue}
                  </p>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', fontSize: '12px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>
                    {item.section || item.country || (item.doi ? `DOI: ${item.doi}` : '')}
                  </span>
                  <Link
                    href={targetUrl}
                    style={{ color: '#c41230', fontWeight: 700, textDecoration: 'none' }}
                  >
                    বিস্তারিত দেখুন ➔
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>অনুসন্ধান পাতা লোড হচ্ছে...</div>}>
      <SearchPageContent />
    </Suspense>
  );
}
