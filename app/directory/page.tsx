'use client';

import React, { useState, useEffect } from 'react';

interface Comrade {
  id: string;
  name: string;
  role: string;
  location: string;
  bio: string;
  languages: string[];
  interests: string[];
  articles_count: number;
}

export default function DirectoryPage() {
  const [members, setMembers] = useState<Comrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedLang, setSelectedLang] = useState('all');

  useEffect(() => {
    fetch('/api/network?action=people')
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Failed to load profiles');
      })
      .then((data) => {
        if (data.success && Array.isArray(data.profiles)) {
          const mapped: Comrade[] = data.profiles.map((p: any) => ({
            id: String(p.id || p.email),
            name: p.name || p.email,
            role: p.role || 'গবেষক ও লেখক',
            location: p.country || 'বাংলাদেশ / আন্তর্জাতিক',
            bio: p.bio || 'দ্য ওয়ে চিন্তন ও গণআন্দোলনের সহযোদ্ধা।',
            languages: Array.isArray(p.languages) ? p.languages : ['bn', 'en'],
            interests: p.interests || ['সমাজতন্ত্র', 'রাজনৈতিক অর্থনীতি', 'গণসংগ্রাম'],
            articles_count: p.articles || p.articles_count || 0
          }));
          setMembers(mapped);
        } else {
          setMembers([]);
        }
      })
      .catch(() => {
        setMembers([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = members.filter((m) => {
    const matchSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.bio.toLowerCase().includes(search.toLowerCase()) ||
      (m.interests && m.interests.some((i) => i.toLowerCase().includes(search.toLowerCase())));

    const matchLang = selectedLang === 'all' || (m.languages && m.languages.includes(selectedLang));
    return matchSearch && matchLang;
  });

  return (
    <div className="directory-page page-wrap" style={{ maxWidth: '1100px', margin: '30px auto', padding: '0 20px' }}>
      <div style={{ marginBottom: '26px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 6px', color: 'var(--text-primary)' }}>
          👥 কর্মী, চিন্তক ও গবেষক ডিরেক্টরি (Comrades Directory)
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14.5px', margin: 0 }}>
          বিশ্বজুড়ে সমাজতান্ত্রিক ভাবাদর্শের লেখক, গবেষক ও সক্রিয় কমরেডদের সাথে যুক্ত হোন।
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="card" style={{ padding: '18px 24px', marginBottom: '26px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="নাম, ক্ষেত্র বা আগ্রহ লিখে খুঁজুন..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: '240px', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', color: 'var(--text-primary)' }}
        />
        <select
          value={selectedLang}
          onChange={(e) => setSelectedLang(e.target.value)}
          style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', color: 'var(--text-primary)' }}
        >
          <option value="all">সব ভাষা (All Languages)</option>
          <option value="bn">বাংলা (Bengali)</option>
          <option value="en">English</option>
          <option value="es">Español</option>
          <option value="hi">हिन्दी</option>
          <option value="ar">العربية</option>
          <option value="pt">Português</option>
          <option value="fr">Français</option>
          <option value="ru">Русский</option>
          <option value="zh">中文 (Chinese)</option>
        </select>
      </div>

      {/* Directory Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
          ডিরেক্টরি তালিকা লোড হচ্ছে...
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
          কোনো গবেষক বা কমরেড প্রোফাইল পাওয়া যায়নি।
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '22px' }}>
          {filtered.map((m) => (
            <div key={m.id} className="card profile-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#c2182b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 800 }}>
                  {m.name.slice(0, 1)}
                </div>
                <div>
                  <h3 style={{ margin: '0 0 2px', fontSize: '17px', color: 'var(--text-primary)' }}>{m.name}</h3>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{m.role} • {m.location}</span>
                </div>
              </div>

              <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.5, flex: 1, marginBottom: '16px' }}>
                {m.bio}
              </p>

              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                {m.interests.map((it) => (
                  <span key={it} className="interest-chip" style={{ fontSize: '11.5px' }}>
                    {it}
                  </span>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                  📝 {m.articles_count} প্রকাশিত লেখা
                </span>
                <button
                  type="button"
                  style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid #c2182b', background: 'transparent', color: '#c2182b', fontWeight: 600, fontSize: '12.5px', cursor: 'pointer' }}
                  onClick={() => alert(`${m.name}-এর সাথে যোগাযোগের বার্তা পাঠানো হয়েছে।`)}
                >
                  বার্তা পাঠান
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
