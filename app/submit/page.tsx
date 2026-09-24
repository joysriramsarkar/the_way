'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';

export default function SubmitPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'new' | 'revision' | 'my-list'>('new');
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New Article Form
  const [title, setTitle] = useState('');
  const [deck, setDeck] = useState('');
  const [section, setSection] = useState('theory-philosophy');
  const [authorName, setAuthorName] = useState(user?.name || '');
  const [authorEmail, setAuthorEmail] = useState(user?.email || '');
  const [authorRole, setAuthorRole] = useState(user?.role || '');
  const [content, setContent] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Revision Form
  const [revSlug, setRevSlug] = useState('');
  const [revTitle, setRevTitle] = useState('');
  const [revDeck, setRevDeck] = useState('');
  const [revContent, setRevContent] = useState('');

  // Submissions list
  const [mySubmissions, setMySubmissions] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState(false);

  useEffect(() => {
    if (user) {
      setAuthorName(user.name || '');
      setAuthorEmail(user.email || '');
      setAuthorRole(user.role || '');
    }
  }, [user]);

  const loadSubmissions = async () => {
    setLoadingList(true);
    const token = localStorage.getItem('theway_token');
    try {
      const res = await fetch('/api/articles?action=my_submissions', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setMySubmissions(data.submissions || []);
      }
    } catch {
      // fallback
      setMySubmissions([]);
    } finally {
      setLoadingList(false);
    }
  };

  const handleNewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMsg(null);

    const payload = {
      submission_type: 'new_article',
      title,
      deck,
      section,
      author_name: authorName,
      author_email: authorEmail,
      author_role: authorRole,
      content_html: content,
      revision_notes: notes
    };

    try {
      const res = await fetch('/api/articles?action=submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMsg({ type: 'success', text: '🎉 লেখাটি সফলভাবে জমা হয়েছে! সম্পাদকীয় পরিষদ পর্যালোচনা করে অবগত করবে।' });
        setTitle('');
        setDeck('');
        setContent('');
        setNotes('');
      } else {
        setMsg({ type: 'error', text: data.error || 'জমা দিতে সমস্যা হয়েছে।' });
      }
    } catch {
      setMsg({ type: 'error', text: 'সার্ভারের সাথে সংযোগ করা যায়নি।' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="submit-page page-wrap" style={{ maxWidth: '900px', margin: '36px auto', padding: '0 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 8px', color: 'var(--text-primary)' }}>
          ✍️ লেখা জমা ও সংশোধন কেন্দ্র
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14.5px', maxWidth: '640px', margin: '0 auto' }}>
          আন্তর্জাতিক সমাজতান্ত্রিক চিন্তন, রাজনৈতিক বিশ্লেষণ, শ্রমিক আন্দোলন ও গবেষণাধর্মী লেখা জমা দিন অথবা প্রকাশিত লেখার সংশোধনের প্রস্তাব পাঠান।
        </p>
      </div>

      {msg && (
        <div
          style={{
            padding: '12px 18px',
            borderRadius: '10px',
            marginBottom: '20px',
            background: msg.type === 'success' ? 'rgba(22,163,74,0.1)' : 'rgba(239,68,68,0.1)',
            border: msg.type === 'success' ? '1px solid #16a34a' : '1px solid #ef4444',
            color: msg.type === 'success' ? '#16a34a' : '#ef4444',
            fontSize: '14px'
          }}
        >
          {msg.text}
        </div>
      )}

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-card)', padding: '6px', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '26px' }}>
        <button
          type="button"
          onClick={() => setActiveTab('new')}
          style={{
            flex: 1,
            padding: '12px',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'new' ? '#c2182b' : 'transparent',
            color: activeTab === 'new' ? '#fff' : 'var(--text-secondary)',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          ✍️ নতুন লেখা জমা
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('revision')}
          style={{
            flex: 1,
            padding: '12px',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'revision' ? '#c2182b' : 'transparent',
            color: activeTab === 'revision' ? '#fff' : 'var(--text-secondary)',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          📝 পুরনো লেখা সংশোধন
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('my-list');
            loadSubmissions();
          }}
          style={{
            flex: 1,
            padding: '12px',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'my-list' ? '#c2182b' : 'transparent',
            color: activeTab === 'my-list' ? '#fff' : 'var(--text-secondary)',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          📋 আমার জমা ও আবেদনের অবস্থা
        </button>
      </div>

      {/* TAB 1: NEW ARTICLE */}
      {activeTab === 'new' && (
        <div className="card" style={{ padding: '32px' }}>
          <form onSubmit={handleNewSubmit}>
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 600, marginBottom: '6px' }}>লেখার শিরোনাম *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="যেমন: নব্য-সাম্রাজ্যবাদের যুগে গণআন্দোলনের রূপরেখা"
                style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', color: 'var(--text-primary)' }}
              />
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 600, marginBottom: '6px' }}>সারসংক্ষেপ / সাবটাইটেল</label>
              <input
                type="text"
                value={deck}
                onChange={(e) => setDeck(e.target.value)}
                placeholder="লেখার মূল বক্তব্যের সংক্ষিপ্ত ১-২ বাক্যের বিবরণ"
                style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', color: 'var(--text-primary)' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '18px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 600, marginBottom: '6px' }}>বিভাগ *</label>
                <select
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', color: 'var(--text-primary)' }}
                >
                  <option value="theory-philosophy">তত্ত্ব ও দর্শন</option>
                  <option value="imperialism-geopolitics">সাম্রাজ্যবাদ ও বিশ্ব-রাজনীতি</option>
                  <option value="labor-peasant">শ্রম ও গণসংগ্রাম</option>
                  <option value="political-economy">রাজনৈতিক অর্থনীতি</option>
                  <option value="culture-revolution">সংস্কৃতি ও বিপ্লব</option>
                  <option value="manifestos-archives">ইশতেহার ও দলিল</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 600, marginBottom: '6px' }}>লেখকের নাম *</label>
                <input
                  type="text"
                  required
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', color: 'var(--text-primary)' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 600, marginBottom: '6px' }}>পূর্ণাঙ্গ বিষয়বস্তু (Content) *</label>
              <textarea
                required
                rows={10}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="লেখার মূল অনুচ্ছেদসমূহ লিখুন..."
                style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', color: 'var(--text-primary)', lineHeight: 1.6 }}
              />
            </div>

            <div style={{ textAlign: 'right' }}>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{ background: '#c2182b', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px 28px', fontWeight: 700, cursor: 'pointer', fontSize: '15px' }}
              >
                {isSubmitting ? 'জমা হচ্ছে...' : '📤 লেখা জমা দিন (Submit Article)'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: REVISION */}
      {activeTab === 'revision' && (
        <div className="card" style={{ padding: '32px' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
            ইতিমধ্যে প্রকাশিত কোনো লেখার তথ্যগত ত্রুটি, ভাষাগত বা তাত্ত্বিক সংশোধনের প্রস্তাব পাঠাতে পারেন।
          </p>
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 600, marginBottom: '6px' }}>লেখা নির্বাচন করুন</label>
            <input
              type="text"
              placeholder="আর্টিকেলের লিঙ্ক বা টাইটেল লিখুন..."
              value={revSlug}
              onChange={(e) => setRevSlug(e.target.value)}
              style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', color: 'var(--text-primary)' }}
            />
          </div>
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 600, marginBottom: '6px' }}>সংশোধনের বিবরণ ও সংশোধিত লেখা</label>
            <textarea
              rows={8}
              value={revContent}
              onChange={(e) => setRevContent(e.target.value)}
              placeholder="কী কী সংশোধন প্রস্তাব করছেন বিস্তারিত উল্লেখ করুন..."
              style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', color: 'var(--text-primary)' }}
            />
          </div>
          <button
            type="button"
            onClick={() => {
              alert('সংশোধন প্রস্তাব প্রেরিত হয়েছে। সম্পাদকীয় দল দ্রুত পর্যালোচনা করবে।');
              setRevSlug('');
              setRevContent('');
            }}
            style={{ background: '#c2182b', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px 24px', fontWeight: 700, cursor: 'pointer' }}
          >
            📝 সংশোধনের আবেদন পাঠান
          </button>
        </div>
      )}

      {/* TAB 3: MY SUBMISSIONS */}
      {activeTab === 'my-list' && (
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '18px' }}>আমার জমাকৃত লেখা ও আবেদনসমূহ</h3>
          {loadingList ? (
            <p style={{ color: 'var(--text-muted)' }}>লোড হচ্ছে...</p>
          ) : mySubmissions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
              এখনো কোনো লেখা বা আবেদন জমা দেওয়া হয়নি।
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
              <thead>
                <tr style={{ background: 'var(--bg-body)', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '10px 14px', textAlign: 'left' }}>শিরোনাম</th>
                  <th style={{ padding: '10px 14px', textAlign: 'left' }}>ধরন</th>
                  <th style={{ padding: '10px 14px', textAlign: 'left' }}>অবস্থা</th>
                </tr>
              </thead>
              <tbody>
                {mySubmissions.map((s) => (
                  <tr key={s.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px 14px' }}><strong>{s.title}</strong></td>
                    <td style={{ padding: '12px 14px' }}>{s.submission_type}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <span className="role-badge" style={{ background: s.status === 'approved' ? '#16a34a' : '#d97706' }}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
