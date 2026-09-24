'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

const SECTIONS = [
  { slug: 'theory-philosophy', label: 'তত্ত্ব ও দর্শন (Theory & Philosophy)' },
  { slug: 'imperialism-geopolitics', label: 'সাম্রাজ্যবাদ ও বিশ্ব-রাজনীতি (Imperialism & Geopolitics)' },
  { slug: 'labor-peasant', label: 'শ্রম ও গণসংগ্রাম (Labor & Peasant Struggles)' },
  { slug: 'political-economy', label: 'রাজনৈতিক অর্থনীতি (Political Economy)' },
  { slug: 'culture-revolution', label: 'সংস্কৃতি ও বিপ্লব (Culture & Revolution)' },
  { slug: 'manifestos-archives', label: 'ইশতেহার ও ঐতিহাসিক দলিল (Manifestos & Archives)' }
];

function EditorContent() {
  const searchParams = useSearchParams();
  const articleId = searchParams.get('id') || '';
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [deck, setDeck] = useState('');
  const [section, setSection] = useState('theory-philosophy');
  const [author, setAuthor] = useState('');
  const [authorRole, setAuthorRole] = useState('');
  const [heroImgUrl, setHeroImgUrl] = useState('');
  const [tags, setTags] = useState('');
  const [contentHtml, setContentHtml] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');

  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Load existing article if editing
  useEffect(() => {
    if (!articleId) return;

    fetch(`/api/articles?action=public-get&id=${encodeURIComponent(articleId)}`)
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Failed to load');
      })
      .then((data) => {
        if (data) {
          setTitle(data.title || '');
          setSlug(data.slug || '');
          setDeck(data.deck || '');
          setSection(data.section || 'theory-philosophy');
          setAuthor(data.author || '');
          setAuthorRole(data.author_role || '');
          setHeroImgUrl(data.hero_img_url || '');
          setTags(Array.isArray(data.tags) ? data.tags.join(', ') : data.tags || '');
          setContentHtml(data.content_html || data.content || '');
          setStatus(data.status === 'published' ? 'published' : 'draft');
        }
      })
      .catch((err) => {
        console.error('Failed to load article:', err);
      });
  }, [articleId]);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!articleId && !slug) {
      // Auto-generate basic slug
      const generated = val
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_]+/g, '-')
        .slice(0, 50);
      setSlug(generated);
    }
  };

  const handleSave = async (publishNow = false) => {
    setSaving(true);
    setSaveMessage(null);

    const targetStatus = publishNow ? 'published' : status;

    const payload = {
      id: articleId || undefined,
      title,
      slug: slug || `article-${Date.now()}`,
      deck,
      section,
      author: author || 'সম্পাদকীয় পরিষদ',
      author_role: authorRole || 'দ্য ওয়ে সম্পাদকীয় টিম',
      hero_img_url: heroImgUrl,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      content: contentHtml,
      status: targetStatus
    };

    try {
      const res = await fetch(`/api/articles?action=${publishNow ? 'publish' : 'save'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setStatus(targetStatus);
        setSaveMessage(publishNow ? '✓ নিবন্ধটি সফলভাবে প্রকাশিত হয়েছে!' : '✓ ড্রাফট সংরক্ষিত হয়েছে!');
        setTimeout(() => setSaveMessage(null), 3000);
      } else {
        const errData = await res.json().catch(() => ({}));
        setSaveMessage(`✕ সংরক্ষণ ব্যর্থ হয়েছে: ${errData.error || errData.message || 'সার্ভার ত্রুটি'}`);
        setTimeout(() => setSaveMessage(null), 4000);
      }
    } catch {
      setSaveMessage('✕ সার্ভারে সংযোগ স্থাপন করা সম্ভব হয়নি।');
      setTimeout(() => setSaveMessage(null), 4000);
    } finally {
      setSaving(false);
    }
  };

  // Helper formatting buttons
  const insertFormatting = (before: string, after: string = '') => {
    setContentHtml((prev) => prev + before + after);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-body)', color: 'var(--text-primary)' }}>
      {/* Top Toolbar */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'var(--bg-card)',
          borderBottom: '1px solid var(--border-color)',
          padding: '10px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <Link href="/admin" style={{ color: '#c2182b', textDecoration: 'none', fontWeight: 700, fontSize: '13px' }}>
            ← অ্যাডমিন প্যানেল
          </Link>
          <span style={{ color: 'var(--text-muted)' }}>|</span>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: '12px',
              textTransform: 'uppercase',
              background: status === 'published' ? 'rgba(34,197,94,0.15)' : 'rgba(234,179,8,0.15)',
              color: status === 'published' ? '#22c55e' : '#eab308'
            }}
          >
            {status === 'published' ? 'প্রকাশিত (Published)' : 'খসড়া (Draft)'}
          </span>
          {saveMessage && <span style={{ fontSize: '12.5px', color: '#22c55e', fontWeight: 600 }}>{saveMessage}</span>}
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            style={{
              padding: '7px 16px',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              background: 'transparent',
              color: 'var(--text-primary)',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            {saving ? 'সংরক্ষণ হচ্ছে...' : '💾 ড্রাফট সেভ'}
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={saving}
            style={{
              padding: '7px 18px',
              borderRadius: '6px',
              border: 'none',
              background: '#c2182b',
              color: '#fff',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            🚀 প্রকাশ করুন
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div style={{ maxWidth: '960px', margin: '30px auto', padding: '0 20px 80px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Title */}
          <div>
            <input
              type="text"
              placeholder="প্রবন্ধের পূর্ণাঙ্গ শিরোনাম লিখুন..."
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              style={{
                width: '100%',
                fontSize: '26px',
                fontWeight: 800,
                fontFamily: "'Noto Serif Bengali', serif",
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                outline: 'none'
              }}
            />
          </div>

          {/* Subtitle / Deck */}
          <div>
            <textarea
              rows={2}
              placeholder="সংক্ষিপ্ত ভূমিকা বা ডেক (Deck / Summary)..."
              value={deck}
              onChange={(e) => setDeck(e.target.value)}
              style={{
                width: '100%',
                fontSize: '15px',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Metadata Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                বিভাগ (Section)
              </label>
              <select
                value={section}
                onChange={(e) => setSection(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
              >
                {SECTIONS.map((s) => (
                  <option key={s.slug} value={s.slug}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                স্লাগ (URL Slug)
              </label>
              <input
                type="text"
                placeholder="article-slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                লেখক
              </label>
              <input
                type="text"
                placeholder="যেমন: কার্ল মার্ক্স"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                ট্যাগ (কমা দিয়ে আলাদা)
              </label>
              <input
                type="text"
                placeholder="সমাজতন্ত্র, উদ্বৃত্ত মূল্য, সাম্রাজ্যবাদ"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
              />
            </div>
          </div>

          {/* Editor Header: Formatting Buttons & Tab Switch */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginTop: '12px' }}>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => insertFormatting('<h3>', '</h3>')}
                style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '12px' }}
              >
                H3
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('<strong>', '</strong>')}
                style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}
              >
                B
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('<em>', '</em>')}
                style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '12px', fontStyle: 'italic' }}
              >
                I
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('<blockquote>“', '”</blockquote>')}
                style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '12px' }}
              >
                Quote
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('<p>', '</p>')}
                style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '12px' }}
              >
                P
              </button>
            </div>

            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                type="button"
                onClick={() => setActiveTab('write')}
                style={{
                  padding: '4px 12px',
                  borderRadius: '4px',
                  border: 'none',
                  background: activeTab === 'write' ? '#c2182b' : 'transparent',
                  color: activeTab === 'write' ? '#fff' : 'var(--text-muted)',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                ✏️ এডিটর
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                style={{
                  padding: '4px 12px',
                  borderRadius: '4px',
                  border: 'none',
                  background: activeTab === 'preview' ? '#c2182b' : 'transparent',
                  color: activeTab === 'preview' ? '#fff' : 'var(--text-muted)',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                👁️ লাইভ প্রিভিউ
              </button>
            </div>
          </div>

          {/* Main Text Area / Preview */}
          {activeTab === 'write' ? (
            <textarea
              rows={16}
              placeholder="প্রবন্ধের সম্পূর্ণ বক্তব্য লিখুন (HTML বা অনুচ্ছেদ সমর্থনযোগ্য)..."
              value={contentHtml}
              onChange={(e) => setContentHtml(e.target.value)}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                fontSize: '15px',
                lineHeight: 1.75,
                fontFamily: "'Noto Serif Bengali', serif",
                resize: 'vertical',
                minHeight: '380px'
              }}
            />
          ) : (
            <div
              className="card article-content-body"
              style={{
                padding: '30px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-card)',
                minHeight: '380px',
                fontSize: '16px',
                lineHeight: 1.8
              }}
              dangerouslySetInnerHTML={{ __html: contentHtml || '<p style="color:var(--text-muted)">প্রিভিউ দেখার জন্য কিছু লিখুন...</p>' }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function ArticleEditorPage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center' }}>এডিটর লোড হচ্ছে...</div>}>
      <EditorContent />
    </Suspense>
  );
}
