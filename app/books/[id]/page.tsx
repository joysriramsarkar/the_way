'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface Chapter {
  id: string;
  number?: string;
  title_bn: string;
  title_en?: string;
  content_html: string;
}

interface BookMeta {
  id: string;
  title: string;
  author: string;
  year?: string;
}

const BOOK_METAS: Record<string, BookMeta> = {
  'communist-manifesto': {
    id: 'communist-manifesto',
    title: 'কমিউনিস্ট পার্টির ইশতেহার (Communist Manifesto)',
    author: 'কার্ল মার্ক্স ও ফ্রেডরিখ এঙ্গেলস',
    year: '১৮৪৮'
  },
  'das-kapital': {
    id: 'das-kapital',
    title: 'পুঁজি: প্রথম খণ্ড (Das Kapital Vol. 1)',
    author: 'কার্ল মার্ক্স',
    year: '১৮৬৭'
  },
  'capital-vol-1': {
    id: 'das-kapital',
    title: 'পুঁজি: প্রথম খণ্ড (Das Kapital Vol. 1)',
    author: 'কার্ল মার্ক্স',
    year: '১৮৬৭'
  },
  'state-and-revolution': {
    id: 'state-and-revolution',
    title: 'রাষ্ট্র ও বিপ্লব (The State and Revolution)',
    author: 'ভি. আই. লেনিন',
    year: '১৯১৭'
  },
  'gorky-mother': {
    id: 'gorky-mother',
    title: 'মা (Mother)',
    author: 'ম্যাক্সিম গোর্কি',
    year: '১৯০৬'
  },
  'imperialism-highest-stage': {
    id: 'imperialism-highest-stage',
    title: 'সাম্রাজ্যবাদ: পুঁজিবাদের সর্বোচ্চ পর্যায়',
    author: 'ভি. আই. লেনিন',
    year: '১৯১৬'
  },
  'why-i-am-an-atheist': {
    id: 'why-i-am-an-atheist',
    title: 'আমি কেন নাস্তিক (Why I am an Atheist)',
    author: 'ভগত সিং',
    year: '১৯৩০'
  },
  'pather-dabi': {
    id: 'pather-dabi',
    title: 'পথের দাবী (Pather Dabi)',
    author: 'শরৎচন্দ্র চট্টোপাধ্যায়',
    year: '১৯২৬'
  }
};

type ReaderTheme = 'light' | 'sepia' | 'dark' | 'crimson';

export default function BookReaderPage() {
  const params = useParams();
  const rawId = (params?.id as string) || 'communist-manifesto';
  const bookSlug = rawId === 'capital-vol-1' ? 'das-kapital' : rawId;

  const [meta, setMeta] = useState<BookMeta>(
    BOOK_METAS[rawId] || {
      id: rawId,
      title: 'সমাজতান্ত্রিক সাহিত্য (Socialist Literature)',
      author: 'আন্তর্জাতিক লেখক পরিষদ'
    }
  );

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<ReaderTheme>('light');
  const [fontSize, setFontSize] = useState<number>(18);
  const [tocOpen, setTocOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Load chapter data from public/assets/js/books/[slug].json
  useEffect(() => {
    setLoading(true);
    fetch(`/assets/books/${bookSlug}.json`)
      .then((res) => (res.ok ? res : fetch(`/assets/js/books/${bookSlug}.json`)))
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Not found');
      })
      .then((data: Chapter[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setChapters(data);
        } else {
          throw new Error('Empty');
        }
      })
      .catch(() => {
        setChapters([]);
      })
      .finally(() => setLoading(false));
  }, [bookSlug]);

  // Track scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const el = document.documentElement;
      const total = el.scrollHeight - el.clientHeight;
      if (total > 0) {
        setScrollProgress((el.scrollTop / total) * 100);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const currentChapter = chapters[activeChapterIndex] || null;

  // Theme styling definitions
  const themeStyles = {
    light: {
      bgBody: '#f8f6f0',
      bgContent: '#ffffff',
      textPrimary: '#1a1a1a',
      textSecondary: '#4a4a4a',
      borderColor: '#e5e0d8',
      navBg: '#ffffff'
    },
    sepia: {
      bgBody: '#f4ecd8',
      bgContent: '#fcf6e8',
      textPrimary: '#3b2a1a',
      textSecondary: '#5c4530',
      borderColor: '#e3d2b8',
      navBg: '#fcf6e8'
    },
    dark: {
      bgBody: '#0d1117',
      bgContent: '#161b22',
      textPrimary: '#e6edf3',
      textSecondary: '#8b949e',
      borderColor: '#30363d',
      navBg: '#161b22'
    },
    crimson: {
      bgBody: '#140507',
      bgContent: '#1f0b0e',
      textPrimary: '#fce7e9',
      textSecondary: '#f0a3aa',
      borderColor: '#4a151b',
      navBg: '#1f0b0e'
    }
  }[theme];

  return (
    <div
      style={{
        backgroundColor: themeStyles.bgBody,
        color: themeStyles.textPrimary,
        minHeight: '100vh',
        transition: 'background-color 0.2s, color 0.2s'
      }}
    >
      {/* Scroll Progress Bar */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '3px',
          width: `${scrollProgress}%`,
          backgroundColor: '#c2182b',
          zIndex: 9999,
          transition: 'width 0.1s linear'
        }}
      />

      {/* Sticky Reader Navbar */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          backgroundColor: themeStyles.navBg,
          borderBottom: `1px solid ${themeStyles.borderColor}`,
          padding: '10px 18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
          <Link
            href="/books"
            style={{
              color: '#c2182b',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            ← পাঠাগার
          </Link>
          <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '13.5px', fontWeight: 600 }}>
            {meta.title}
          </div>
        </div>

        {/* Reader Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          {/* TOC Button */}
          <button
            onClick={() => setTocOpen(!tocOpen)}
            style={{
              background: 'transparent',
              border: `1px solid ${themeStyles.borderColor}`,
              color: themeStyles.textPrimary,
              padding: '5px 10px',
              borderRadius: '6px',
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            📑 সূচিপত্র ({chapters.length})
          </button>

          {/* Font Resizing */}
          <div style={{ display: 'flex', border: `1px solid ${themeStyles.borderColor}`, borderRadius: '6px', overflow: 'hidden' }}>
            <button
              onClick={() => setFontSize((s) => Math.max(s - 2, 14))}
              style={{ background: 'transparent', border: 'none', padding: '4px 8px', color: themeStyles.textPrimary, cursor: 'pointer', fontSize: '12px' }}
              title="ফন্ট ছোট করুন"
            >
              A-
            </button>
            <button
              onClick={() => setFontSize(18)}
              style={{ background: 'transparent', border: 'none', borderLeft: `1px solid ${themeStyles.borderColor}`, borderRight: `1px solid ${themeStyles.borderColor}`, padding: '4px 8px', color: themeStyles.textPrimary, cursor: 'pointer', fontSize: '12px' }}
              title="স্বাভাবিক আকার"
            >
              A
            </button>
            <button
              onClick={() => setFontSize((s) => Math.min(s + 2, 28))}
              style={{ background: 'transparent', border: 'none', padding: '4px 8px', color: themeStyles.textPrimary, cursor: 'pointer', fontSize: '12px' }}
              title="ফন্ট বড় করুন"
            >
              A+
            </button>
          </div>

          {/* Theme Switcher Pills */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {(['light', 'sepia', 'dark', 'crimson'] as ReaderTheme[]).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                title={`${t} থিম`}
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  border: theme === t ? '2px solid #c2182b' : '1px solid rgba(0,0,0,0.2)',
                  cursor: 'pointer',
                  backgroundColor:
                    t === 'light' ? '#ffffff' : t === 'sepia' ? '#f4ecd8' : t === 'dark' ? '#161b22' : '#2d0a10'
                }}
              />
            ))}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div style={{ maxWidth: '820px', margin: '30px auto', padding: '0 20px 80px' }}>
        {/* Table of Contents Drawer */}
        {tocOpen && (
          <div
            style={{
              backgroundColor: themeStyles.bgContent,
              border: `1px solid ${themeStyles.borderColor}`,
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '24px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>অধ্যায় সূচিপত্র</h3>
              <button onClick={() => setTocOpen(false)} style={{ background: 'transparent', border: 'none', color: themeStyles.textPrimary, cursor: 'pointer' }}>✕</button>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {chapters.map((ch, idx) => (
                <li key={ch.id || idx}>
                  <button
                    onClick={() => {
                      setActiveChapterIndex(idx);
                      setTocOpen(false);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      background: activeChapterIndex === idx ? 'rgba(194, 24, 43, 0.1)' : 'transparent',
                      color: activeChapterIndex === idx ? '#c2182b' : themeStyles.textPrimary,
                      border: 'none',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: activeChapterIndex === idx ? 700 : 500,
                      fontSize: '14px'
                    }}
                  >
                    {ch.number ? `${ch.number}: ` : ''}{ch.title_bn}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Reader Card Content */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: themeStyles.textSecondary }}>
            বইয়ের অধ্যায় লোড হচ্ছে...
          </div>
        ) : !currentChapter ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: themeStyles.bgContent, borderRadius: '14px', border: `1px solid ${themeStyles.borderColor}` }}>
            <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>বইটির ডিজিটাল অনুলিপি এখনও প্রস্তুত হয়নি</h3>
            <p style={{ color: themeStyles.textSecondary, fontSize: '14px', maxWidth: '480px', margin: '0 auto 18px' }}>
              এই ঐতিহাসিক কাজের ডিজিটাল অধ্যায়সমূহ আন্তর্জাতিক অনুবাদ ও ডিজিটাইজেশন ব্রিগেডের মাধ্যমে যুক্ত করা হচ্ছে।
            </p>
            <Link href="/books" style={{ color: '#c2182b', fontWeight: 600 }}>← লাইব্রেরিতে ফিরে যান</Link>
          </div>
        ) : (
          <article
            style={{
              backgroundColor: themeStyles.bgContent,
              border: `1px solid ${themeStyles.borderColor}`,
              borderRadius: '14px',
              padding: '40px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
            }}
          >
            {/* Chapter Header */}
            <div style={{ textAlign: 'center', marginBottom: '32px', borderBottom: `1px solid ${themeStyles.borderColor}`, paddingBottom: '24px' }}>
              {currentChapter.number && (
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#c2182b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                  {currentChapter.number}
                </div>
              )}
              <h1
                style={{
                  fontFamily: "'Noto Serif Bengali', serif",
                  fontSize: `${fontSize * 1.5}px`,
                  fontWeight: 800,
                  margin: '0 0 8px',
                  lineHeight: 1.3
                }}
              >
                {currentChapter.title_bn}
              </h1>
              {currentChapter.title_en && (
                <div style={{ fontSize: '14px', color: themeStyles.textSecondary, fontStyle: 'italic' }}>
                  {currentChapter.title_en}
                </div>
              )}
            </div>

            {/* Chapter Text Body */}
            <div
              className="reader-text-content"
              style={{
                fontSize: `${fontSize}px`,
                lineHeight: 1.85,
                color: themeStyles.textPrimary,
                fontFamily: "'Noto Serif Bengali', serif"
              }}
              dangerouslySetInnerHTML={{ __html: currentChapter.content_html }}
            />

            {/* Navigation Footer */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '48px',
                paddingTop: '24px',
                borderTop: `1px solid ${themeStyles.borderColor}`
              }}
            >
              <button
                disabled={activeChapterIndex === 0}
                onClick={() => {
                  setActiveChapterIndex((i) => Math.max(i - 1, 0));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                style={{
                  padding: '8px 18px',
                  borderRadius: '8px',
                  border: `1px solid ${themeStyles.borderColor}`,
                  background: 'transparent',
                  color: activeChapterIndex === 0 ? 'rgba(128,128,128,0.4)' : themeStyles.textPrimary,
                  cursor: activeChapterIndex === 0 ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  fontSize: '13.5px'
                }}
              >
                ← পূর্ববর্তী অধ্যায়
              </button>

              <span style={{ fontSize: '13px', color: themeStyles.textSecondary }}>
                অধ্যায় {activeChapterIndex + 1} / {chapters.length}
              </span>

              <button
                disabled={activeChapterIndex >= chapters.length - 1}
                onClick={() => {
                  setActiveChapterIndex((i) => Math.min(i + 1, chapters.length - 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                style={{
                  padding: '8px 18px',
                  borderRadius: '8px',
                  border: 'none',
                  background: activeChapterIndex >= chapters.length - 1 ? 'rgba(128,128,128,0.4)' : '#c2182b',
                  color: '#fff',
                  cursor: activeChapterIndex >= chapters.length - 1 ? 'not-allowed' : 'pointer',
                  fontWeight: 700,
                  fontSize: '13.5px'
                }}
              >
                পরবর্তী অধ্যায় ➔
              </button>
            </div>
          </article>
        )}
      </div>
    </div>
  );
}
