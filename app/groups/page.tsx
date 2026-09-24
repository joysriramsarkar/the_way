'use client';

import React, { useEffect, useState } from 'react';

interface Group {
  id: string;
  name: string;
  description: string;
  language: string;
  category: string;
  member_count: number;
  meeting_schedule?: string;
  contact_info?: string;
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLang, setSelectedLang] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [joinedGroups, setJoinedGroups] = useState<Record<string, boolean>>({});

  // New Group Form state
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [groupLang, setGroupLang] = useState('bn');
  const [category, setCategory] = useState('Theory');

  useEffect(() => {
    fetch('/api/network?action=groups')
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Failed to load groups');
      })
      .then((data) => {
        if (data.success && Array.isArray(data.groups)) {
          const mapped: Group[] = data.groups.map((g: any) => ({
            id: g.id,
            name: g.name_bn || g.name,
            description: g.description || '',
            language: g.lang || 'bn',
            category: g.category || 'Theory',
            member_count: g.members_count || 1,
            meeting_schedule: g.meeting_schedule || 'সাপ্তাহিক অনলাইন/সশরীরে'
          }));
          setGroups(mapped);
        } else {
          setGroups([]);
        }
      })
      .catch(() => {
        setGroups([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const toggleJoin = (groupId: string) => {
    setJoinedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const res = await fetch('/api/network?action=groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          name_bn: name.trim(),
          category,
          lang: groupLang,
          description: desc.trim()
        })
      });
      const data = await res.json();
      if (res.ok && data.group) {
        const newG: Group = {
          id: data.group.id,
          name: data.group.name_bn || data.group.name,
          description: data.group.description || '',
          language: data.group.lang || 'bn',
          category: data.group.category || 'Theory',
          member_count: data.group.members_count || 1,
          meeting_schedule: 'সাপ্তাহিক অনলাইন'
        };
        setGroups([newG, ...groups]);
      } else {
        alert(data.error || 'গ্রুপ তৈরি করতে সমস্যা হয়েছে। অনুগ্রহ করে লগইন করুন।');
      }
    } catch {
      alert('সার্ভারে যোগাযোগ করা যায়নি।');
    }

    setShowModal(false);
    setName('');
    setDesc('');
  };

  const filtered = groups.filter((g) => {
    const langMatch = selectedLang === 'all' || g.language === selectedLang;
    const catMatch = selectedCategory === 'all' || g.category.toLowerCase() === selectedCategory.toLowerCase();
    return langMatch && catMatch;
  });

  return (
    <div className="groups-page page-wrap" style={{ maxWidth: '1100px', margin: '30px auto', padding: '0 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 6px', color: 'var(--text-primary)' }}>
            📚 গ্রুপ ও পাঠচক্র (Reading Circles & Study Groups)
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14.5px', margin: 0 }}>
            বিষয়ভিত্তিক সমাজতান্ত্রিক অধ্যয়ন ও পাঠচক্রে যোগ দিন বা নতুন পাঠশালা গড়ে তুলুন।
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          style={{ background: '#c2182b', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px 22px', fontWeight: 700, cursor: 'pointer', fontSize: '14.5px' }}
        >
          ➕ নতুন গ্রুপ তৈরি করুন
        </button>
      </div>

      {/* Language filter row */}
      <div className="filter-chips-row" style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '24px', paddingBottom: '6px' }}>
        {[
          { code: 'all', label: 'সব ভাষা' },
          { code: 'bn', label: 'বাংলা' },
          { code: 'en', label: 'English' },
          { code: 'es', label: 'Español' },
          { code: 'hi', label: 'हिन्दी' },
          { code: 'ar', label: 'العربية' },
          { code: 'pt', label: 'Português' },
          { code: 'fr', label: 'Français' },
          { code: 'ru', label: 'Русский' },
          { code: 'zh', label: '中文 (Chinese)' }
        ].map((item) => (
          <button
            key={item.code}
            type="button"
            className={`filter-chip ${selectedLang === item.code ? 'active' : ''}`}
            onClick={() => setSelectedLang(item.code)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Group Cards Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
          পাঠচক্রের তালিকা লোড হচ্ছে...
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
          কোনো পাঠচক্র বা গ্রুপ পাওয়া যায়নি। আপনি নতুন গ্রুপ শুরু করতে পারেন।
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '22px' }}>
          {filtered.map((grp) => {
            const isJoined = joinedGroups[grp.id];
            return (
              <div key={grp.id} className="group-card card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <span style={{ fontSize: '26px' }}>📖</span>
                  <span className="interest-chip" style={{ fontSize: '11px', textTransform: 'uppercase' }}>
                    {grp.language} • {grp.category}
                  </span>
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px', color: 'var(--text-primary)' }}>
                  {grp.name}
                </h3>
                <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.5, flex: 1, marginBottom: '18px' }}>
                  {grp.description}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
                  <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                    👥 {grp.member_count + (isJoined ? 1 : 0)} জন সদস্য
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleJoin(grp.id)}
                    style={{
                      padding: '8px 18px',
                      borderRadius: '8px',
                      border: isJoined ? '1px solid #16a34a' : '1px solid #c2182b',
                      background: isJoined ? 'rgba(22, 163, 74, 0.1)' : '#c2182b',
                      color: isJoined ? '#16a34a' : '#fff',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '13px'
                    }}
                  >
                    {isJoined ? '✓ যুক্ত হয়েছেন' : 'যোগ দিন'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Group Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="card modal-content" style={{ maxWidth: '500px', width: '100%', padding: '28px', borderRadius: '16px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 16px' }}>নতুন পাঠচক্র তৈরি করুন</h2>
            <form onSubmit={handleCreateGroup}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>গ্রুপের নাম *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="যেমন: রোজা লুক্সেমবার্গ স্টাডি সার্কেল"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', color: 'var(--text-primary)' }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>বিবরণ / লক্ষ্য *</label>
                <textarea
                  required
                  rows={3}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="পাঠচক্রের উদ্দেশ্য ও আলোচনার বিষয়বস্তু লিখুন..."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', color: 'var(--text-primary)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>ভাষা</label>
                  <select
                    value={groupLang}
                    onChange={(e) => setGroupLang(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', color: 'var(--text-primary)' }}
                  >
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
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>বিভাগ</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', color: 'var(--text-primary)' }}
                  >
                    <option value="Theory">Theory & Philosophy</option>
                    <option value="Labor">Labor & Peasant</option>
                    <option value="Geopolitics">Imperialism & Geopolitics</option>
                    <option value="Economy">Political Economy</option>
                    <option value="Culture">Culture & Revolution</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ background: 'transparent', border: '1px solid var(--border-color)', padding: '10px 18px', borderRadius: '8px', color: 'var(--text-secondary)', cursor: 'pointer' }}
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  style={{ background: '#c2182b', border: 'none', padding: '10px 22px', borderRadius: '8px', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
                >
                  তৈরি করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
