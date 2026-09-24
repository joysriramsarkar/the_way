'use client';

import React from 'react';
import { useI18n, SUPPORTED_LANGUAGES } from '@/components/I18nProvider';

const LANG_DETAILS = [
  { code: 'bn', name: 'বাংলা', engName: 'Bengali', region: 'Bangladesh, West Bengal, Global Diaspora', icon: '🇧🇩' },
  { code: 'en', name: 'English', engName: 'English', region: 'International Working Class Lingua Franca', icon: '🌐' },
  { code: 'es', name: 'Español', engName: 'Spanish', region: 'Latin America, Spain, Anti-Imperialist Front', icon: '🇨🇺' },
  { code: 'hi', name: 'हिन्दी', engName: 'Hindi', region: 'South Asia, Peasant & Workers Movements', icon: '🇮🇳' },
  { code: 'ar', name: 'العربية', engName: 'Arabic', region: 'West Asia, North Africa, Palestine Solidarity', icon: '🇵🇸' },
  { code: 'pt', name: 'Português', engName: 'Portuguese', region: 'Brazil, Southern Africa, Lusophone Left', icon: '🇧🇷' },
  { code: 'fr', name: 'Français', engName: 'French', region: 'Sahel, Anti-Neocolonial Africa, Global Left', icon: '🇫🇷' },
  { code: 'ru', name: 'Русский', engName: 'Russian', region: 'Post-Soviet Space, October Revolution Legacy', icon: '🇷🇺' },
  { code: 'zh', name: '中文', engName: 'Chinese', region: 'East Asia, Socialist Theory & Modern Marxism', icon: '🇨🇳' }
];

export default function LanguagesPage() {
  const { lang, setLang } = useI18n();

  return (
    <div className="languages-page page-wrap" style={{ maxWidth: '1000px', margin: '36px auto', padding: '0 20px' }}>
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '30px', fontWeight: 800, margin: '0 0 8px', color: 'var(--text-primary)' }}>
          🌐 আন্তর্জাতিক বহুভাষিক পোর্টাল (International Languages)
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px', maxWidth: '640px', margin: '0 auto' }}>
          বিশ্বের সর্বহারা মানুষের একতা ও আন্তর্জাতিকতাবাদের চেতনা ধারণ করে ৯টি প্রধান ভাষায় দ্য ওয়ের প্রকাশনা পরিচালিত হয়।
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '22px' }}>
        {LANG_DETAILS.map((l) => {
          const isActive = lang === l.code;
          return (
            <div
              key={l.code}
              className="card"
              style={{
                padding: '24px',
                border: isActive ? '2px solid #c2182b' : '1px solid var(--border-color)',
                borderRadius: '14px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '28px' }}>{l.icon}</span>
                  <span className="role-badge" style={{ background: isActive ? '#c2182b' : 'var(--border-color)', color: isActive ? '#fff' : 'var(--text-secondary)' }}>
                    {l.code.toUpperCase()}
                  </span>
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 2px', color: 'var(--text-primary)' }}>
                  {l.name}
                </h3>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{l.engName}</span>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '12px', lineHeight: 1.5 }}>
                  {l.region}
                </p>
              </div>

              <div style={{ marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => setLang(l.code)}
                  style={{
                    width: '100%',
                    padding: '9px',
                    borderRadius: '8px',
                    border: 'none',
                    background: isActive ? '#16a34a' : '#c2182b',
                    color: '#fff',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '13.5px'
                  }}
                >
                  {isActive ? '✓ বর্তমান ভাষা' : `${l.name}-এ পোর্টাল দেখুন`}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
