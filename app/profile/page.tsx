'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';

interface ProfileData {
  id: string;
  name: string;
  role: string;
  country: string;
  bio: string;
  ideology: string[];
  languages: string[];
  stats: {
    followers: number;
    following: number;
    articles: number;
    translations: number;
    circles: number;
  };
  posts: Array<{
    id: string;
    content: string;
    created_at: string;
    likes: number;
  }>;
  articles: Array<{
    id: string;
    slug: string;
    title: string;
    section: string;
    created_at: string;
  }>;
  translations: Array<{
    id: string;
    title: string;
    source_lang: string;
    target_lang: string;
  }>;
}

function ProfileContent() {
  const searchParams = useSearchParams();
  const userId = searchParams.get('id') || searchParams.get('user') || 'default';
  const { user } = useAuth();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'articles' | 'translations' | 'about'>('posts');
  const [following, setFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  useEffect(() => {
    setLoading(true);
    const target: string = userId === 'me' && user ? (user.email || user.id || '') : (userId || '');
    fetch(`/api/network?action=profile&id=${encodeURIComponent(target)}`)
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Failed to load profile');
      })
      .then((data) => {
        if (data.success && data.profile) {
          const p = data.profile;
          setProfile({
            id: String(p.id),
            name: p.name || p.email,
            role: p.role || 'সহযোদ্ধা ও গবেষক',
            country: p.country || 'বাংলাদেশ / আন্তর্জাতিক',
            bio: p.bio || 'দ্য ওয়ে আন্তর্জাতিক সমাজতান্ত্রিক চিন্তন ও গণআন্দোলনের সহযোদ্ধা।',
            ideology: ['Socialism', 'International Solidarity', 'Marxism'],
            languages: Array.isArray(p.languages) ? p.languages : ['বাংলা', 'English'],
            stats: {
              followers: p.stats?.followers || 0,
              following: p.stats?.following || 0,
              articles: p.stats?.articles || 0,
              translations: p.stats?.translations || 0,
              circles: p.stats?.circles || 0
            },
            posts: Array.isArray(p.posts) ? p.posts : [],
            articles: Array.isArray(p.articles) ? p.articles : [],
            translations: Array.isArray(p.translations) ? p.translations : []
          });
          setFollowersCount(p.stats?.followers || 0);
        } else {
          setProfile(null);
        }
      })
      .catch(() => {
        setProfile(null);
      })
      .finally(() => setLoading(false));
  }, [user, userId]);

  const toggleFollow = () => {
    if (following) {
      setFollowersCount((c) => Math.max(0, c - 1));
      setFollowing(false);
    } else {
      setFollowersCount((c) => c + 1);
      setFollowing(true);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ maxWidth: '980px', margin: '40px auto', textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
        কমরেড প্রোফাইল লোড হচ্ছে...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container" style={{ maxWidth: '600px', margin: '60px auto', textAlign: 'center', padding: '40px 20px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 12px' }}>প্রোফাইল পাওয়া যায়নি</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
          অনুরোধকৃত কমরেড বা লেখকের প্রোফাইল ডাটাবেজে উপস্থিত নেই।
        </p>
        <Link href="/directory" className="btn btn-primary" style={{ display: 'inline-block' }}>
          ডিরেক্টরি দেখুন
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '980px', margin: '0 auto', padding: '24px 20px 60px' }}>
      {/* Profile Hero Card */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, rgba(25,7,11,0.95) 0%, rgba(12,3,5,0.98) 100%)',
          border: '1px solid rgba(196,18,48,0.3)',
          borderRadius: '16px',
          padding: '2rem',
          margin: '1.5rem 0 2rem',
          color: 'var(--text-primary)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
        }}
      >
        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div
            style={{
              width: '88px',
              height: '88px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #c2182b, #7d0e19)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.4rem',
              fontWeight: 800,
              boxShadow: '0 4px 16px rgba(194, 24, 43, 0.4)',
              flexShrink: 0
            }}
          >
            {profile.name.charAt(0)}
          </div>

          {/* User Details */}
          <div style={{ flex: 1, minWidth: '260px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
              <h1 style={{ fontFamily: "'Noto Serif Bengali', serif", fontSize: '1.8rem', fontWeight: 800, margin: 0, color: '#fff' }}>
                {profile.name}
              </h1>
              <span
                style={{
                  background: 'rgba(34, 197, 94, 0.2)',
                  color: '#4ade80',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: 700
                }}
              >
                ✓ Verified
              </span>
            </div>

            <div style={{ fontSize: '13.5px', color: '#f87171', fontWeight: 600, marginBottom: '8px' }}>
              {profile.role} • 📍 {profile.country}
            </div>

            <p style={{ fontSize: '14px', color: '#d1d5db', lineHeight: 1.55, margin: '0 0 16px', maxWidth: '640px' }}>
              {profile.bio}
            </p>

            {/* Ideology and Languages */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
              {profile.ideology.map((idg) => (
                <span key={idg} className="interest-chip" style={{ fontSize: '11px', background: 'rgba(255,255,255,0.08)', color: '#f3f4f6' }}>
                  #{idg}
                </span>
              ))}
              {profile.languages.map((l) => (
                <span key={l} style={{ fontSize: '11px', background: 'rgba(196,18,48,0.2)', color: '#fca5a5', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                  🌐 {l}
                </span>
              ))}
            </div>

            {/* Stats Row */}
            <div
              style={{
                display: 'flex',
                gap: '20px',
                flexWrap: 'wrap',
                borderTop: '1px solid rgba(255,255,255,0.1)',
                paddingTop: '14px',
                marginBottom: '16px'
              }}
            >
              <div>
                <strong style={{ fontSize: '18px', color: '#fff' }}>{followersCount}</strong>
                <span style={{ fontSize: '12px', color: '#9ca3af', display: 'block' }}>অনুসরণকারী</span>
              </div>
              <div>
                <strong style={{ fontSize: '18px', color: '#fff' }}>{profile.stats.following}</strong>
                <span style={{ fontSize: '12px', color: '#9ca3af', display: 'block' }}>অনুসরণ করছেন</span>
              </div>
              <div>
                <strong style={{ fontSize: '18px', color: '#fff' }}>{profile.stats.articles}</strong>
                <span style={{ fontSize: '12px', color: '#9ca3af', display: 'block' }}>প্রবন্ধ</span>
              </div>
              <div>
                <strong style={{ fontSize: '18px', color: '#fff' }}>{profile.stats.translations}</strong>
                <span style={{ fontSize: '12px', color: '#9ca3af', display: 'block' }}>অনুবাদ</span>
              </div>
              <div>
                <strong style={{ fontSize: '18px', color: '#fff' }}>{profile.stats.circles}</strong>
                <span style={{ fontSize: '12px', color: '#9ca3af', display: 'block' }}>পাঠচক্র</span>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={toggleFollow}
                style={{
                  background: following ? 'rgba(255,255,255,0.15)' : '#c2182b',
                  color: '#fff',
                  border: 'none',
                  padding: '7px 18px',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                {following ? '✓ অনুসরণ করছেন' : '+ অনুসরণ করুন'}
              </button>
              <button
                onClick={() => alert(`'${profile.name}'-কে ব্যক্তিগত বার্তা পাঠানোর ফিচার শীঘ্রই আসছে!`)}
                style={{
                  background: 'transparent',
                  color: 'rgba(255,255,255,0.85)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  padding: '7px 16px',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                ✉️ বার্তা পাঠান
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', marginBottom: '24px' }}>
        {[
          { key: 'posts', label: '💬 পোস্ট ও মতামত' },
          { key: 'articles', label: '✍️ প্রকাশিত প্রবন্ধ' },
          { key: 'translations', label: '🌐 অনুবাদসমূহ' },
          { key: 'about', label: 'ℹ️ পরিচিতি' }
        ].map((tb) => (
          <button
            key={tb.key}
            onClick={() => setActiveTab(tb.key as any)}
            style={{
              padding: '10px 18px',
              border: 'none',
              background: 'transparent',
              color: activeTab === tb.key ? '#c2182b' : 'var(--text-muted)',
              borderBottom: activeTab === tb.key ? '2px solid #c2182b' : '2px solid transparent',
              fontWeight: activeTab === tb.key ? 700 : 500,
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            {tb.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      {activeTab === 'posts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {profile.posts.map((post) => (
            <div
              key={post.id}
              className="card"
              style={{
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-card)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{profile.name}</span>
                <span>{post.created_at}</span>
              </div>
              <p style={{ fontSize: '14.5px', lineHeight: 1.6, color: 'var(--text-primary)', margin: '0 0 12px' }}>
                {post.content}
              </p>
              <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>
                <button
                  onClick={() => alert('সংহতি প্রতিক্রিয়া জানানো হয়েছে!')}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  ✊ সংহতি ({post.likes})
                </button>
                <button
                  onClick={() => alert('মন্তব্য করার বক্স খুলছে...')}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  💬 মন্তব্য
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'articles' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {profile.articles.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              কোনো প্রকাশিত প্রবন্ধ পাওয়া যায়নি।
            </div>
          ) : (
            profile.articles.map((art) => (
              <div
                key={art.id}
                className="card"
                style={{
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-card)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <span style={{ fontSize: '11px', background: 'rgba(194,24,43,0.1)', color: '#c2182b', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                    {art.section}
                  </span>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '6px 0 2px', color: 'var(--text-primary)' }}>
                    <Link href={`/articles/${art.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                      {art.title}
                    </Link>
                  </h3>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>প্রকাশের তারিখ: {art.created_at}</span>
                </div>
                <Link
                  href={`/articles/${art.slug}`}
                  style={{ color: '#c2182b', textDecoration: 'none', fontWeight: 700, fontSize: '13px' }}
                >
                  পড়ুন ➔
                </Link>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'translations' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {profile.translations.map((tr) => (
            <div
              key={tr.id}
              className="card"
              style={{
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-card)'
              }}
            >
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 6px', color: 'var(--text-primary)' }}>
                {tr.title}
              </h3>
              <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                ভাষা রূপান্তর: <strong>{tr.source_lang}</strong> ➔ <strong>{tr.target_lang}</strong>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'about' && (
        <div className="card" style={{ padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 12px', color: 'var(--text-primary)' }}>
            রাজনৈতিক দৃষ্টিভঙ্গি ও ভূমিকা
          </h3>
          <p style={{ fontSize: '14px', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
            {profile.bio}
          </p>
          <div style={{ marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
            <h4 style={{ fontSize: '14px', margin: '0 0 8px' }}>আন্তর্জাতিক নেটওয়ার্ক পরিচিতি:</h4>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
              The Way প্ল্যাটফর্মের উন্মুক্ত ফেডারেশন আইডি: <code>TW-USR-{profile.id}</code>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>প্রোফাইল লোড হচ্ছে...</div>}>
      <ProfileContent />
    </Suspense>
  );
}
