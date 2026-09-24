'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Logo from './Logo';
import { useI18n } from './I18nProvider';

export default function Footer() {
  const { lang, t } = useI18n();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setTimeout(() => {
        setSubscribed(false);
        setEmail('');
      }, 3500);
    }
  };

  return (
    <footer className="theway-footer" role="contentinfo">
      <div className="container">
        <div className="footer-top-grid">
          {/* Brand Col */}
          <div className="footer-brand-col">
            <Link href="/" aria-label="The Way Home">
              <Logo variant="light" height={44} />
            </Link>
            <p style={{ fontSize: '0.9rem', color: '#9ca3af', lineHeight: 1.7, marginTop: '1rem', marginBottom: '1.5rem' }}>
              {t('footer.desc', 'আন্তর্জাতিক সমাজতান্ত্রিক চিন্তন, রাজনৈতিক অর্থনীতি, সাম্রাজ্যবাদ-বিরোধী গণসংগ্রাম ও শ্রমিক শ্রেণির মুক্তির উন্মুক্ত বহুমাত্রিক জ্ঞান-পোর্টাল।')}
            </p>
            <div className="footer-motto-box">
              {t('footer.motto', '“জগতের সকল শোষিত মানুষ, এক হও!”')}
              <br />
              <span style={{ fontSize: '0.8rem', opacity: 0.85, fontWeight: 500 }}>
                {t('footer.motto_author', '— কার্ল মার্ক্স ও ফ্রেডরিখ এঙ্গেলস')}
              </span>
            </div>
          </div>

          {/* Core Focus Sections */}
          <div className="footer-links-col">
            <h4 className="footer-col-title">{t('footer.col_topics', 'প্রধান বিষয়সমূহ')}</h4>
            <ul className="footer-links-list">
              <li><Link href="/sections/theory-philosophy">{t('nav.theory', 'তত্ত্ব ও দর্শন')}</Link></li>
              <li><Link href="/sections/imperialism-geopolitics">{t('nav.imperialism', 'সাম্রাজ্যবাদ ও বিশ্ব-রাজনীতি')}</Link></li>
              <li><Link href="/sections/labor-peasant">{t('nav.labour', 'শ্রম ও গণসংগ্রাম')}</Link></li>
              <li><Link href="/sections/political-economy">{t('nav.economy', 'রাজনৈতিক অর্থনীতি')}</Link></li>
              <li><Link href="/sections/culture-revolution">{t('nav.culture', 'সংস্কৃতি ও বিপ্লব')}</Link></li>
              <li><Link href="/sections/manifestos-archives">{t('nav.manifestos', 'ইশতেহার ও ঐতিহাসিক দলিল')}</Link></li>
            </ul>
          </div>

          {/* Movement & Hub */}
          <div className="footer-links-col">
            <h4 className="footer-col-title">{t('footer.col_resources', 'আন্দোলন ও সম্পদ')}</h4>
            <ul className="footer-links-list">
              <li>
                <Link href="/books" style={{ color: 'var(--crimson-light)', fontWeight: 700 }}>
                  📖 {t('nav.library', 'লাইব্রেরি')}
                </Link>
              </li>
              <li>
                <Link href="/events">
                  📅 {t('nav.events', 'ইভেন্ট')}
                </Link>
              </li>
              <li>
                <Link href="/organizations">
                  🏛️ {t('nav.organizations', 'সংগঠন')}
                </Link>
              </li>
              <li>
                <Link href="/feed">
                  🌐 {t('nav.feed', 'ফিড')}
                </Link>
              </li>
              <li>
                <Link href="/directory">
                  👥 {t('nav.directory', 'ডিরেক্টরি')}
                </Link>
              </li>
              <li>
                <Link href="/submit" style={{ color: '#f43f5e', fontWeight: 700 }}>
                  ✍️ {t('nav.organize', 'সংগঠিত হোন')}
                </Link>
              </li>
              <li>
                <Link href="/login" style={{ color: 'var(--gold-bright)' }}>
                  🔒 {t('nav.admin', 'অ্যাডমিন')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Box */}
          <div className="footer-newsletter-col">
            <h4 className="footer-col-title">{t('footer.bulletin_title', 'মেহনতি মানুষের সমাজতান্ত্রিক বুলেটিন')}</h4>
            <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '1rem', lineHeight: 1.6 }}>
              {t('footer.bulletin_desc', 'বিশ্বজুড়ে শ্রমিক আন্দোলন, সাম্রাজ্যবাদবিরোধী রিপোর্ট ও তাত্ত্বিক বিশ্লেষণ প্রতি সপ্তাহে আপনার ইনবক্সে পেতে সাবস্ক্রাইব করুন।')}
            </p>
            {subscribed ? (
              <div style={{ padding: '8px 12px', background: 'rgba(34,197,94,0.15)', color: '#22c55e', borderRadius: '6px', fontSize: '13px' }}>
                {t('footer.bulletin_success', '✓ সাবস্ক্রিপশন সফল হয়েছে! ধন্যবাদ।')}
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="subscribe-form-row">
                <input
                  type="email"
                  placeholder={t('footer.bulletin_placeholder', 'আপনার ইমেইল ঠিকানা...')}
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="subscribe-input"
                  style={{ background: '#161b22', color: '#fff', borderColor: '#374151' }}
                />
                <button type="submit" className="btn-solid-crimson" style={{ padding: '0.5rem 0.85rem', fontSize: '0.8rem' }}>
                  {t('footer.bulletin_btn', 'সাবস্ক্রাইব')}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom-bar">
          <div>
            {t('footer.copyleft', 'ↄ কপিলেফট ২০২৬ দ্য ওয়ে কালেক্টিভ — জ্ঞানের মুক্ত প্রসারে কোনো কপিরাইট নেই।')}
          </div>
          <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center' }}>
            <span>{t('footer.workers_unite', 'Workers of the world, unite!')}</span>
            <a href="#top" style={{ color: 'var(--crimson-light)', textDecoration: 'none', fontWeight: 600 }}>
              {t('footer.back_to_top', '↑ শীর্ষে যান')}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
