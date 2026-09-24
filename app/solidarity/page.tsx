'use client';

import React, { useState, useEffect } from 'react';

interface Campaign {
  id: string;
  title: string;
  category: string;
  location: string;
  description: string;
  target_amount?: number;
  raised_amount?: number;
  urgency: 'high' | 'medium' | 'normal';
  organizer: string;
}

export default function SolidarityPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState('all');
  const [supported, setSupported] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch('/api/network?action=solidarity')
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Failed to load campaigns');
      })
      .then((data) => {
        if (data.success && Array.isArray(data.campaigns)) {
          const mapped: Campaign[] = data.campaigns.map((c: any) => ({
            id: c.id,
            title: c.title,
            category: Array.isArray(c.needs) ? c.needs.join(', ') : (c.category || 'General Solidarity'),
            location: `${c.country_flag || '📍'} ${c.country || 'আন্তর্জাতিক'}`,
            description: c.description || '',
            urgency: c.status === 'urgent' ? 'high' : 'medium',
            organizer: c.organization || 'আন্তর্জাতিক যৌথ সংহতি সেল',
            target_amount: c.target_amount || undefined,
            raised_amount: c.raised_amount || undefined
          }));
          setCampaigns(mapped);
        } else {
          setCampaigns([]);
        }
      })
      .catch(() => {
        setCampaigns([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = selectedCat === 'all' ? campaigns : campaigns.filter((c) => c.category.toLowerCase().includes(selectedCat.toLowerCase()));

  const handleSupport = async (id: string) => {
    setSupported((prev) => ({ ...prev, [id]: true }));
    try {
      await fetch('/api/network?action=pledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId: id })
      });
    } catch {}
    alert('ধন্যবাদ! আপনার সংহতি নথিভুক্ত হয়েছে এবং সমন্বয়কদের কাছে পাঠানো হয়েছে।');
  };

  return (
    <div className="solidarity-page page-wrap" style={{ maxWidth: '1100px', margin: '30px auto', padding: '0 20px' }}>
      <div style={{ marginBottom: '26px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 6px', color: 'var(--text-primary)' }}>
          ✊ আন্তর্জাতিক সংহতি ও গণসংগ্রাম সেল (Solidarity Network)
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14.5px', margin: 0 }}>
          বিশ্বজুড়ে নিপীড়িত মানুষ, ধর্মঘটী শ্রমিক ও মুক্তিকামী জনতার পাশে দাঁড়ানোর সক্রিয় মঞ্চ।
        </p>
      </div>

      {/* Category filter */}
      <div className="filter-chips-row" style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '24px', paddingBottom: '6px' }}>
        {[
          { code: 'all', label: 'সব আন্দোলন' },
          { code: 'Emergency', label: 'জরুরি সাহায্য (Emergency)' },
          { code: 'Labor', label: 'শ্রমিক ধর্মঘট (Labor Strike)' },
          { code: 'Legal', label: 'আইনি সহায়তা (Legal Defense)' },
          { code: 'Indigenous', label: 'আদিবাসী ও ভূমি রক্ষা' }
        ].map((item) => (
          <button
            key={item.code}
            type="button"
            className={`filter-chip ${selectedCat === item.code ? 'active' : ''}`}
            onClick={() => setSelectedCat(item.code)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Campaigns Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
          সংহতি ক্যাম্পেইন লোড হচ্ছে...
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
          কোনো সক্রিয় সংহতি ক্যাম্পেইন পাওয়া যায়নি।
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
          {filtered.map((cam) => {
            const percent = cam.target_amount ? Math.min(100, Math.round(((cam.raised_amount || 0) / cam.target_amount) * 100)) : 0;
            const isDone = supported[cam.id];

            return (
              <div key={cam.id} className="card solidarity-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span className="role-badge" style={{ background: cam.urgency === 'high' ? '#c2182b' : '#d97706', color: '#fff', fontSize: '11px' }}>
                    {cam.urgency === 'high' ? 'জরুরি সংহতি' : 'সক্রিয় ক্যাম্পেইন'}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>📍 {cam.location}</span>
                </div>

                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 10px', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                  {cam.title}
                </h3>

                <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.5, flex: 1, marginBottom: '16px' }}>
                  {cam.description}
                </p>

                {/* Progress bar */}
                {cam.target_amount ? (
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                      <span>সংগ্রহ: ৳{cam.raised_amount?.toLocaleString('bn-BD')}</span>
                      <span>লক্ষ্য: ৳{cam.target_amount?.toLocaleString('bn-BD')} ({percent}%)</span>
                    </div>
                    <div style={{ width: '100%', height: '7px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${percent}%`, height: '100%', background: '#c2182b', borderRadius: '4px' }} />
                    </div>
                  </div>
                ) : null}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>দ্বারা: {cam.organizer}</span>
                  <button
                    type="button"
                    onClick={() => handleSupport(cam.id)}
                    style={{
                      padding: '8px 18px',
                      borderRadius: '8px',
                      border: 'none',
                      background: isDone ? '#16a34a' : '#c2182b',
                      color: '#fff',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '13px'
                    }}
                  >
                    {isDone ? '✓ সংহতি প্রকাশ করেছেন' : '✊ সংহতি প্রকাশ ও সহায়তা'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
