'use client';

import React, { useState } from 'react';
import { useI18n, SUPPORTED_LANGUAGES } from './I18nProvider';
import { useTheme } from './ThemeProvider';

const TICKER_DATA: Record<string, Array<{ cat: string; text: string }>> = {
  bn: [
    { cat: 'শ্রমিক সংগ্রাম', text: 'লন্ডন ও প্যারিসে রেল শ্রমিকদের ঐতিহাসিক সমন্বিত ধর্মঘট সফল' },
    { cat: 'প্যালেস্টাইন', text: 'গাজায় সামরিক আগ্রাসনের বিরুদ্ধে জেনেভায় লক্ষ জনতার বৈশ্বিক সমাবেশ' },
    { cat: 'গ্লোবাল সাউথ', text: 'ডলারের একচেটিয়া আধিপত্য ভেঙে বহুমেরুকেন্দ্রিক বিকল্পের ডাক' },
    { cat: 'ভারত', text: 'শ্রমিক ও কৃষক আন্দোলনের সংযুক্ত দেশব্যাপী বিক্ষোভ' },
    { cat: 'জলবায়ু ন্যায়বিচার', text: 'জীবাশ্ম জ্বালানি কর্পোরেশনের ওপর বিশেষ বৈশ্বিক কর আরোপের দাবি' }
  ],
  en: [
    { cat: 'Labor Struggle', text: 'Historic coordinated rail strike succeeds across London and Paris' },
    { cat: 'Palestine', text: 'Global mass rally of 100,000 in Geneva demands immediate end to aggression in Gaza' },
    { cat: 'Global South', text: 'Call for multipolar economic alternatives challenging US dollar monopoly' },
    { cat: 'India', text: 'Nationwide joint protest by worker and peasant organizations gains massive momentum' },
    { cat: 'Climate Justice', text: 'Global coalition demands windfall climate tax on fossil fuel monopolies' }
  ],
  hi: [
    { cat: 'मजदूर संघर्ष', text: 'लंदन और पेरिस में रेलकर्मियों की ऐतिहासिक संयुक्त हड़ताल सफल' },
    { cat: 'फिलिस्तीन', text: 'गाजा में हमले के खिलाफ जेनेवा में लाखों लोगों का विशाल प्रदर्शन' },
    { cat: 'ग्लोबल साउथ', text: 'डॉलर के एकाधिकार को चुनौती देते हुए बहुध्रुवीय विकल्प की मांग' },
    { cat: 'भारत', text: 'मजदूर और किसान संगठनों का देशव्यापी संयुक्त विरोध प्रदर्शन' },
    { cat: 'जलवायु न्याय', text: 'जीवाश्म ईंधन बहुराष्ट्रीय निगमों पर वैश्विक जलवायु कर लगाने की मांग' }
  ],
  es: [
    { cat: 'Lucha Obrera', text: 'Histórica huelga ferroviaria coordinada triunfa en Londres y París' },
    { cat: 'Palestina', text: 'Gran concentración de 100,000 personas en Ginebra exige cese de agresión en Gaza' },
    { cat: 'Sur Global', text: 'Llamamiento a alternativas multipolares frente a la hegemonía del dólar' },
    { cat: 'América Latina', text: 'Movimientos campesinos fortalecen la soberanía alimentaria y comunitaria' },
    { cat: 'Justicia Climática', text: 'Exigen impuesto extraordinario a corporaciones transnacionales fósiles' }
  ]
};

export default function SolidarityTicker() {
  const { lang, setLang, t } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const activeItems = TICKER_DATA[lang] || TICKER_DATA['en'] || TICKER_DATA['bn'];

  return (
    <div className="theway-ticker-bar">
      <div className="container">
        <div className="ticker-inner">
          <div className="ticker-badge">
            <span className="ticker-badge-pulse" />
            <span>{t('ticker.live', 'লাইভ সংহতি বার্তা')}</span>
          </div>

          <div className="ticker-marquee">
            <div className="ticker-track">
              {activeItems.concat(activeItems).map((item, idx) => (
                <span key={idx} className="ticker-item">
                  <strong>[{item.cat}]</strong> {item.text}
                  <span className="sep">★</span>
                </span>
              ))}
            </div>
          </div>

          <div className="ticker-actions">
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                className="lang-selector-btn"
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                title="ভাষা নির্বাচন"
                style={{ cursor: 'pointer' }}
              >
                🌐 <span>{SUPPORTED_LANGUAGES[lang] || 'বাংলা'}</span> ▾
              </button>
              {langMenuOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '6px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '6px 0',
                    zIndex: 2000,
                    boxShadow: 'var(--shadow-lg)',
                    minWidth: '130px',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  {Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => {
                        setLang(code as any);
                        setLangMenuOpen(false);
                      }}
                      style={{
                        padding: '6px 14px',
                        background: lang === code ? 'rgba(194, 24, 43, 0.12)' : 'transparent',
                        color: lang === code ? '#c2182b' : 'var(--text-primary)',
                        border: 'none',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontSize: '12.5px',
                        fontWeight: lang === code ? 700 : 500
                      }}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              className="theme-toggle-btn"
              onClick={toggleTheme}
              title="Light/Dark Mode Toggle"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#f3f4f6',
                borderRadius: '4px',
                padding: '4px 8px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
