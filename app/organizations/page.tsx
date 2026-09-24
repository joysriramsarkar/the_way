'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/components/I18nProvider';

interface OrgItem {
  id: string;
  federation_id?: string;
  name: string;
  name_bn?: string;
  country?: string;
  country_flag?: string;
  type: string;
  icon?: string;
  desc?: string;
  members?: number;
  verified?: boolean;
  focus?: string[];
  website?: string;
}

export default function OrganizationsPage() {
  const { lang, t } = useI18n();
  const [orgs, setOrgs] = useState<OrgItem[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formNameBn, setFormNameBn] = useState('');
  const [formType, setFormType] = useState('trade_union');
  const [formCountry, setFormCountry] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formFocus, setFormFocus] = useState('');
  const [formWebsite, setFormWebsite] = useState('');
  const [modalSuccess, setModalSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/network?action=organizations')
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Failed');
      })
      .then((data) => {
        if (data.success && Array.isArray(data.organizations)) {
          setOrgs(data.organizations);
        } else {
          setOrgs([]);
        }
      })
      .catch(() => {
        setOrgs([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleRegisterOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    const newOrg: OrgItem = {
      id: `org_${Date.now()}`,
      federation_id: `TW-O-${Math.floor(1000 + Math.random() * 9000)}`,
      name: formName,
      name_bn: formNameBn || formName,
      type: formType,
      country: formCountry,
      desc: formDesc,
      focus: formFocus.split(',').map((s) => s.trim()).filter(Boolean),
      website: formWebsite,
      members: 1
    };

    try {
      await fetch('/api/network?action=register_org', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrg)
      });
    } catch {}

    setOrgs([newOrg, ...orgs]);
    setModalSuccess(true);
    setTimeout(() => {
      setModalSuccess(false);
      setIsModalOpen(false);
      setFormName('');
      setFormNameBn('');
      setFormCountry('');
      setFormDesc('');
      setFormFocus('');
      setFormWebsite('');
    }, 1200);
  };

  const filteredOrgs = orgs.filter((org) => {
    const matchesType =
      filterType === 'all' ||
      org.type.toLowerCase().replace(/_/g, ' ') === filterType.toLowerCase().replace(/_/g, ' ') ||
      (filterType === 'trade_union' && org.type.includes('union')) ||
      (filterType === 'study_circle' && org.type.includes('study')) ||
      (filterType === 'research_center' && org.type.includes('research')) ||
      (filterType === 'peasant_movement' && (org.type.includes('peasant') || org.type.includes('landless'))) ||
      (filterType === 'cultural_collective' && org.type.includes('cultural'));

    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      org.name.toLowerCase().includes(q) ||
      (org.name_bn && org.name_bn.toLowerCase().includes(q)) ||
      (org.country && org.country.toLowerCase().includes(q)) ||
      (org.desc && org.desc.toLowerCase().includes(q));

    return matchesType && matchesSearch;
  });

  const getTypeName = (type: string) => {
    switch (type) {
      case 'trade_union':
        return t('orgs.filter_trade_union', '⚒️ ট্রেড ইউনিয়ন');
      case 'peasant_movement':
        return t('orgs.filter_peasant', '🌾 কৃষক আন্দোলন');
      case 'study_circle':
        return t('orgs.filter_study_circle', '📚 পাঠচক্র');
      case 'research_center':
        return t('orgs.filter_research', '🎓 গবেষণা কেন্দ্র');
      case 'cultural_collective':
        return t('orgs.filter_cultural', '🎭 সাংস্কৃতিক কালেক্টিভ');
      default:
        return '🏛️ সংগঠন';
    }
  };

  return (
    <div className="container" style={{ maxWidth: '1180px', margin: '0 auto', padding: '24px 20px 60px' }}>
      {/* Hero Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(25,7,11,0.95) 0%, rgba(12,3,5,0.98) 100%)',
          border: '1px solid rgba(196,18,48,0.3)',
          borderRadius: '16px',
          padding: '2.5rem 2rem',
          margin: '1.5rem 0 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
        }}
      >
        <div style={{ maxWidth: '680px' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#c41230', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
            🏛️ {t('orgs.badge', 'বৈশ্বিক যৌথ পরিকাঠামো (COLLECTIVE INFRASTRUCTURE)')}
          </div>
          <h1 style={{ fontFamily: "'Noto Serif Bengali', serif", fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.75rem' }}>
            {t('orgs.title', 'সমাজতান্ত্রিক সংগঠন নেটওয়ার্ক (Organizations)')}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
            {t('orgs.desc', 'আন্তর্জাতিক ট্রেড ইউনিয়ন, কৃষক আন্দোলন, পাঠচক্র, মুক্ত গবেষণা কেন্দ্র এবং সাংস্কৃতিক কালেক্টিভগুলোর উন্মুক্ত সমন্বিত ডিরেক্টরি।')}
          </p>
        </div>
        <div>
          <button
            onClick={() => setIsModalOpen(true)}
            style={{
              background: '#c41230',
              color: '#fff',
              border: 'none',
              padding: '0.75rem 1.4rem',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(196,18,48,0.4)',
              transition: 'all 0.15s ease'
            }}
          >
            {t('orgs.btn_new', '+ নতুন সংগঠন যোগ করুন')}
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { key: 'all', label: t('orgs.filter_all', 'সব সংগঠন') },
            { key: 'trade_union', label: t('orgs.filter_trade_union', '⚒️ ট্রেড ইউনিয়ন') },
            { key: 'study_circle', label: t('orgs.filter_study_circle', '📚 পাঠচক্র') },
            { key: 'research_center', label: t('orgs.filter_research', '🎓 গবেষণা কেন্দ্র') },
            { key: 'peasant_movement', label: t('orgs.filter_peasant', '🌾 কৃষক আন্দোলন') },
            { key: 'cultural_collective', label: t('orgs.filter_cultural', '🎭 সাংস্কৃতিক কালেক্টিভ') }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterType(tab.key)}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                border: filterType === tab.key ? '1px solid #c41230' : '1px solid var(--border-color)',
                background: filterType === tab.key ? '#c41230' : 'var(--bg-card)',
                color: filterType === tab.key ? '#fff' : 'var(--text-primary)',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ minWidth: '240px' }}>
          <input
            type="text"
            placeholder={t('orgs.search_placeholder', 'সংগঠনের নাম বা দেশ দিয়ে খুঁজুন...')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 14px',
              borderRadius: '20px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              fontSize: '13px'
            }}
          />
        </div>
      </div>

      {/* Organization Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          {t('orgs.loading', 'সংগঠনসমূহ লোড হচ্ছে...')}
        </div>
      ) : filteredOrgs.length === 0 ? (
        <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
          {t('orgs.empty', 'কোনো সংগঠন পাওয়া যায়নি।')}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
          {filteredOrgs.map((org) => {
            const displayName = (lang === 'bn' || !org.name) ? (org.name_bn || org.name) : org.name;
            const subName = (lang === 'bn') ? (org.name_bn && org.name !== org.name_bn ? org.name : '') : (org.name_bn && org.name_bn !== org.name ? org.name_bn : '');

            return (
              <div
                key={org.id}
                className="card"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '14px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s ease'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <span style={{ fontSize: '2rem' }}>{org.icon || '🏛️'}</span>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      {org.verified && (
                        <span title="Verified International Front" style={{ fontSize: '11px', background: 'rgba(34,197,94,0.15)', color: '#22c55e', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                          ✓ {t('orgs.verified', 'যাচাইকৃত')}
                        </span>
                      )}
                      <span style={{ fontSize: '11px', background: 'rgba(196,18,48,0.15)', color: '#c41230', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                        {getTypeName(org.type)}
                      </span>
                    </div>
                  </div>

                  <h3 style={{ fontFamily: "'Noto Serif Bengali', serif", fontSize: '1.25rem', fontWeight: 700, margin: '0 0 4px', color: 'var(--text-primary)' }}>
                    {displayName}
                  </h3>
                  {subName && (
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                      {subName}
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                    <span>{org.country_flag || '📍'}</span>
                    <span>{org.country || 'International'}</span>
                    {org.members && <span> • 👥 {org.members.toLocaleString()} {t('orgs.members_count', 'মেম্বার')}</span>}
                  </div>

                  <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.55, margin: '0 0 16px' }}>
                    {org.desc}
                  </p>

                  {org.focus && org.focus.length > 0 && (
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                      {org.focus.map((f) => (
                        <span key={f} className="interest-chip" style={{ fontSize: '11px' }}>
                          #{f}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    ID: {org.federation_id || org.id.slice(0, 10)}
                  </span>
                  {org.website ? (
                    <a
                      href={org.website}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: '#c41230', textDecoration: 'none', fontWeight: 700, fontSize: '12.5px' }}
                    >
                      {t('orgs.view_website', 'ওয়েবসাইট দেখুন ➔')}
                    </a>
                  ) : (
                    <button
                      onClick={() => alert(`'${org.name}'-এর সাথে যোগাযোগ বা সংহতির বার্তা পোর্টাল অ্যাডমিনকে পাঠানো হচ্ছে।`)}
                      style={{ background: 'transparent', border: 'none', color: '#c41230', fontWeight: 700, fontSize: '12.5px', cursor: 'pointer', padding: 0 }}
                    >
                      {t('orgs.contact_us', 'যোগাযোগ করুন ➔')}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal for Registering Organization */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
        >
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              padding: '28px',
              maxWidth: '540px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
              color: 'var(--text-primary)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontFamily: "'Noto Serif Bengali', serif", fontSize: '1.3rem', fontWeight: 700, margin: 0 }}>
                🏛️ সংগঠন প্রোফাইল নিবন্ধন
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                ✕
              </button>
            </div>

            {modalSuccess ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#22c55e', background: 'rgba(34,197,94,0.1)', borderRadius: '10px' }}>
                ✓ সংগঠনের আবেদন সফলভাবে গৃহীত হয়েছে!
              </div>
            ) : (
              <form onSubmit={handleRegisterOrg} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px', color: 'var(--text-secondary)' }}>
                    সংগঠনের নাম (English) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Workers' Solidarity Collective"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', color: 'var(--text-primary)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px', color: 'var(--text-secondary)' }}>
                    বাংলা নাম
                  </label>
                  <input
                    type="text"
                    placeholder="যেমন: শ্রমিক সংহতি কালেক্টিভ"
                    value={formNameBn}
                    onChange={(e) => setFormNameBn(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', color: 'var(--text-primary)' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px', color: 'var(--text-secondary)' }}>
                      ধরন
                    </label>
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', color: 'var(--text-primary)' }}
                    >
                      <option value="trade_union">⚒️ ট্রেড ইউনিয়ন</option>
                      <option value="peasant_movement">🌾 কৃষক আন্দোলন</option>
                      <option value="study_circle">📚 পাঠচক্র ও সেল</option>
                      <option value="research_center">🎓 গবেষণা কেন্দ্র</option>
                      <option value="cultural_collective">🎭 সাংস্কৃতিক কালেক্টিভ</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px', color: 'var(--text-secondary)' }}>
                      দেশ / অবস্থান
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Bangladesh / Global"
                      value={formCountry}
                      onChange={(e) => setFormCountry(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', color: 'var(--text-primary)' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px', color: 'var(--text-secondary)' }}>
                    ফোকাস এরিয়া বা কি-ওয়ার্ড (কমা দিয়ে আলাদা করুন)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Labor Rights, Anti-Imperialism, Study"
                    value={formFocus}
                    onChange={(e) => setFormFocus(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', color: 'var(--text-primary)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px', color: 'var(--text-secondary)' }}>
                    ওয়েবসাইট বা সোশ্যাল মিডিয়া লিঙ্ক
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={formWebsite}
                    onChange={(e) => setFormWebsite(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', color: 'var(--text-primary)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px', color: 'var(--text-secondary)' }}>
                    সংক্ষিপ্ত পরিচিতি ও উদ্দেশ্য
                  </label>
                  <textarea
                    rows={3}
                    placeholder="সংগঠনের আদর্শ, কাজের পরিধি এবং কার্যক্রমের বিবরণ..."
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', color: 'var(--text-primary)', resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    style={{ background: 'transparent', border: '1px solid var(--border-color)', padding: '8px 16px', borderRadius: '6px', color: 'var(--text-secondary)', cursor: 'pointer' }}
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    style={{ background: '#c41230', border: 'none', color: '#fff', padding: '8px 18px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    সংগঠন যুক্ত করুন
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
