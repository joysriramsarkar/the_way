'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface SolidarityEvent {
  id: string;
  title: string;
  event_type: 'rally' | 'study_circle' | 'conference' | 'strike' | string;
  start_at: string;
  city?: string;
  country?: string;
  url?: string;
  description: string;
  timezone?: string;
  organizer?: string;
}

const MONTHS_BN = ['জানু', 'ফেব্রু', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টে', 'অক্টো', 'নভে', 'ডিসে'];

export default function EventsPage() {
  const [events, setEvents] = useState<SolidarityEvent[]>([]);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'study_circle' | 'rally' | 'past'>('all');
  const [loading, setLoading] = useState(true);

  // Form state
  const [title, setTitle] = useState('');
  const [eventType, setEventType] = useState('study_circle');
  const [startAt, setStartAt] = useState('');
  const [city, setCity] = useState('');
  const [url, setUrl] = useState('');
  const [desc, setDesc] = useState('');
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  useEffect(() => {
    fetch('/api/network?action=events')
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Failed');
      })
      .then((data) => {
        if (data.success && Array.isArray(data.events)) {
          setEvents(data.events);
        } else {
          setEvents([]);
        }
      })
      .catch(() => {
        setEvents([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const now = new Date();
  const filteredEvents = events.filter((e) => {
    const eDate = new Date(e.start_at);
    if (filter === 'upcoming') return eDate >= now;
    if (filter === 'past') return eDate < now;
    if (filter === 'study_circle') return e.event_type === 'study_circle';
    if (filter === 'rally') return e.event_type === 'rally' || e.event_type === 'strike';
    return true;
  });

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus('submitting');
    try {
      const res = await fetch('/api/network?action=submit_event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          event_type: eventType,
          start_at: startAt,
          city,
          url,
          description: desc
        })
      });
      if (res.ok) {
        setSubmitStatus('success');
        const newEvt: SolidarityEvent = {
          id: `local-${Date.now()}`,
          title,
          event_type: eventType,
          start_at: startAt || new Date().toISOString(),
          city,
          url,
          description: desc
        };
        setEvents([newEvt, ...events]);
        setTitle('');
        setStartAt('');
        setCity('');
        setUrl('');
        setDesc('');
      } else {
        setSubmitStatus('error');
      }
    } catch {
      setSubmitStatus('error');
    }
  };

  const getBadgeLabel = (type: string) => {
    switch (type) {
      case 'rally':
        return '🚩 সমাবেশ ও বিক্ষোভ';
      case 'study_circle':
        return '📚 তাত্ত্বিক পাঠচক্র';
      case 'conference':
        return '🏛️ আন্তর্জাতিক সম্মেলন';
      case 'strike':
        return '⚒️ শ্রমিক ধর্মঘট';
      default:
        return '✊ গণআন্দোলন';
    }
  };

  return (
    <div className="container" style={{ maxWidth: '1180px', margin: '0 auto', padding: '24px 20px 60px' }}>
      {/* Hero Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(24,9,12,0.95) 0%, rgba(13,17,23,0.98) 100%)',
          color: '#fff',
          padding: '2.5rem 2rem',
          borderRadius: '16px',
          margin: '1.5rem 0 2rem',
          border: '1px solid rgba(194, 24, 43, 0.4)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
        }}
      >
        <span
          style={{
            display: 'inline-block',
            background: '#c2182b',
            color: '#fff',
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            padding: '4px 10px',
            borderRadius: '4px',
            marginBottom: '12px'
          }}
        >
          আন্তর্জাতিক সংহতি ফ্রন্ট
        </span>
        <h1 style={{ fontFamily: "'Noto Serif Bengali', serif", fontSize: '2.4rem', fontWeight: 800, margin: '0 0 10px' }}>
          🚩 সংহতি ক্যালেন্ডার ও বৈশ্বিক সমাবেশ
        </h1>
        <p style={{ fontSize: '1.05rem', color: '#d1d5db', maxWidth: '720px', lineHeight: 1.6, margin: 0 }}>
          মেহনতি মানুষের বৈশ্বিক প্রতিরোধ, শ্রমিক ধর্মঘট, সাম্রাজ্যবাদ-বিরোধী মহাসমাবেশ ও সমাজতান্ত্রিক পাঠচক্রের কেন্দ্রীয় তথ্যমঞ্চ।
        </p>
      </div>

      {/* Filter Buttons */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[
          { key: 'all', label: 'সব অনুষ্ঠান' },
          { key: 'upcoming', label: '📅 আসন্ন' },
          { key: 'study_circle', label: '📚 পাঠচক্র' },
          { key: 'rally', label: '🚩 সমাবেশ ও ধর্মঘট' },
          { key: 'past', label: '⌛ অতীত অনুষ্ঠান' }
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key as any)}
            className={`filter-chip ${filter === f.key ? 'active' : ''}`}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              border: filter === f.key ? '1px solid #c2182b' : '1px solid var(--border-color)',
              background: filter === f.key ? '#c2182b' : 'var(--bg-card)',
              color: filter === f.key ? '#fff' : 'var(--text-primary)',
              transition: 'all 0.15s ease'
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Main Grid: Events List + Submit Sidebar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(300px, 1fr)', gap: '28px' }}>
        {/* Events Column */}
        <div>
          <h2 style={{ fontFamily: "'Noto Serif Bengali', serif", fontSize: '1.5rem', fontWeight: 700, margin: '0 0 20px', color: 'var(--text-primary)' }}>
            আন্তর্জাতিক কর্মসূচি ও পাঠচক্র ({filteredEvents.length})
          </h2>

          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              ইভেন্ট লোড হচ্ছে...
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="card" style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
              কোনো অনুষ্ঠান পাওয়া যায়নি।
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {filteredEvents.map((evt) => {
                const dt = new Date(evt.start_at);
                const day = dt.getDate();
                const month = MONTHS_BN[dt.getMonth()] || dt.toLocaleString('bn-BD', { month: 'short' });
                const timeFormatted = dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                return (
                  <article
                    key={evt.id}
                    className="card"
                    style={{
                      padding: '20px',
                      borderRadius: '12px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-card)',
                      display: 'grid',
                      gridTemplateColumns: '85px 1fr',
                      gap: '18px',
                      transition: 'border-color 0.2s, transform 0.2s'
                    }}
                  >
                    {/* Date Badge */}
                    <div
                      style={{
                        background: 'rgba(194, 24, 43, 0.1)',
                        border: '1px solid rgba(194, 24, 43, 0.3)',
                        color: '#c2182b',
                        borderRadius: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '10px 6px',
                        height: '76px',
                        textAlign: 'center'
                      }}
                    >
                      <span style={{ fontSize: '1.8rem', fontWeight: 900, lineHeight: 1 }}>{day}</span>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', marginTop: '2px' }}>{month}</span>
                    </div>

                    {/* Details */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '6px' }}>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: 'rgba(194,24,43,0.15)',
                            color: '#e63946'
                          }}
                        >
                          {getBadgeLabel(evt.event_type)}
                        </span>
                        {evt.city && (
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            📍 {evt.city}
                          </span>
                        )}
                      </div>

                      <h3 style={{ fontFamily: "'Noto Serif Bengali', serif", fontSize: '1.2rem', fontWeight: 700, margin: '0 0 8px', color: 'var(--text-primary)' }}>
                        {evt.title}
                      </h3>

                      <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.55, margin: '0 0 12px' }}>
                        {evt.description}
                      </p>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', fontSize: '12px', color: 'var(--text-muted)' }}>
                        <span>🕒 সময়: {timeFormatted} {evt.timezone ? `(${evt.timezone})` : ''}</span>
                        {evt.url && (
                          <a
                            href={evt.url}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: '#c2182b', textDecoration: 'none', fontWeight: 700 }}
                          >
                            অংশগ্রহণ ও বিবরণী ➔
                          </a>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {/* Submit Sidebar Box */}
        <div>
          <div
            className="card"
            style={{
              padding: '24px',
              borderRadius: '14px',
              border: '1px solid rgba(194, 24, 43, 0.35)',
              background: 'var(--bg-card)',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <h3 style={{ fontFamily: "'Noto Serif Bengali', serif", fontSize: '1.25rem', fontWeight: 700, margin: '0 0 6px', color: '#c2182b' }}>
              📢 আন্দোলনের খবর বা ইভেন্ট পাঠান
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 16px' }}>
              আপনার এলাকায় শ্রমিক ধর্মঘট, পাঠচক্র বা সাম্রাজ্যবাদবিরোধী কোনো কর্মসূচি থাকলে আন্তর্জাতিক ক্যালেন্ডারে অন্তর্ভুক্ত করতে বিবরণ পাঠান।
            </p>

            {submitStatus === 'success' && (
              <div style={{ padding: '10px', background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', borderRadius: '8px', fontSize: '13px', marginBottom: '14px' }}>
                ✓ ইভেন্টের তথ্য সফলভাবে জমা দেওয়া হয়েছে!
              </div>
            )}

            <form onSubmit={handleEventSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px', color: 'var(--text-secondary)' }}>
                  শিরোনাম *
                </label>
                <input
                  type="text"
                  placeholder="ইভেন্ট বা সমাবেশের শিরোনাম"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px', color: 'var(--text-secondary)' }}>
                  ধরন
                </label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', color: 'var(--text-primary)' }}
                >
                  <option value="study_circle">📚 তাত্ত্বিক পাঠচক্র</option>
                  <option value="rally">🚩 সমাবেশ ও বিক্ষোভ</option>
                  <option value="conference">🏛️ সম্মেলন ও কর্মশালা</option>
                  <option value="strike">⚒️ শ্রমিক ধর্মঘট</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px', color: 'var(--text-secondary)' }}>
                  তারিখ ও সময় *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={startAt}
                  onChange={(e) => setStartAt(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px', color: 'var(--text-secondary)' }}>
                  স্থান / শহর ও দেশ
                </label>
                <input
                  type="text"
                  placeholder="যেমন: ঢাকা, বাংলাদেশ"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px', color: 'var(--text-secondary)' }}>
                  অনলাইন লিংক (ঐচ্ছিক)
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px', color: 'var(--text-secondary)' }}>
                  সংক্ষিপ্ত বিবরণ *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="আয়োজক কালেক্টিভ ও কর্মসূচির উদ্দেশ্য..."
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', color: 'var(--text-primary)', resize: 'vertical' }}
                />
              </div>

              <button
                type="submit"
                disabled={submitStatus === 'submitting'}
                style={{
                  background: '#c2182b',
                  color: '#fff',
                  border: 'none',
                  padding: '10px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                {submitStatus === 'submitting' ? 'জমা হচ্ছে...' : 'ইভেন্ট জমা দিন ➔'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
