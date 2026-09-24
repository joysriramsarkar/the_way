'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { useI18n } from './I18nProvider';
import SolidarityTicker from './SolidarityTicker';
import Logo from './Logo';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { t } = useI18n();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: t('nav.home', 'মূলপাতা') },
    { href: '/sections/theory-philosophy', label: t('nav.theory', 'তত্ত্ব ও দর্শন') },
    { href: '/sections/imperialism-geopolitics', label: t('nav.imperialism', 'সাম্রাজ্যবাদ ও বিশ্ব-রাজনীতি') },
    { href: '/sections/labor-peasant', label: t('nav.labour', 'শ্রম ও গণসংগ্রাম') },
    { href: '/sections/political-economy', label: t('nav.economy', 'রাজনৈতিক অর্থনীতি') },
    { href: '/sections/culture-revolution', label: t('nav.culture', 'সংস্কৃতি ও বিপ্লব') },
    { href: '/sections/manifestos-archives', label: t('nav.manifestos', 'ইশতেহার ও দলিল') },
    { href: '/books', label: `📖 ${t('nav.library', 'লাইব্রেরি')}` },
    { href: '/events', label: `📅 ${t('nav.events', 'ইভেন্ট')}` },
    { href: '/organizations', label: `🏛️ ${t('nav.organizations', 'সংগঠন')}` },
    { href: '/feed', label: `🌐 ${t('nav.feed', 'ফিড')}` },
    { href: '/directory', label: `👥 ${t('nav.directory', 'ডিরেক্টরি')}` },
    { href: '/groups', label: `📚 ${t('nav.groups', 'পাঠচক্র')}` },
    { href: '/solidarity', label: `✊ ${t('nav.solidarity', 'সংহতি')}` },
    { href: '/translations', label: `🌐 ${t('nav.translations', 'অনুবাদ')}` }
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      <SolidarityTicker />

      <header className="theway-header" role="banner">
        <div className="container">
          <div className="header-main-row">
            {/* Brand Logo */}
            <Link href="/" className="header-brand" title="The Way Home" aria-label="The Way Homepage">
              <Logo variant="auto" height={46} className="brand-logo-svg" />
            </Link>

            {/* Header Controls */}
            <div className="header-controls">
              {/* Quick Search */}
              <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '20px',
                    padding: '4px 12px',
                    gap: '6px'
                  }}
                >
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>🔍</span>
                  <input
                    type="text"
                    placeholder={t('nav.search_placeholder', 'অনুসন্ধান...')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      color: 'var(--text-primary)',
                      fontSize: '13px',
                      width: '130px'
                    }}
                  />
                  <kbd
                    style={{
                      fontSize: '10px',
                      padding: '2px 5px',
                      borderRadius: '4px',
                      background: 'var(--bg-body)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-muted)'
                    }}
                  >
                    ↵
                  </kbd>
                </div>
              </form>

              {/* Join Solidarity */}
              <Link href="/solidarity" className="btn-solid-crimson">
                ✊ <span>{t('nav.organize', 'সংগঠিত হোন')}</span>
              </Link>

              {/* Auth Controls */}
              <div className="header-auth-group">
                {user ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Link href="/profile?user=me" className="header-user-pill">
                      <span className="header-user-avatar-sm">
                        {(user.name || user.email || 'U').slice(0, 2).toUpperCase()}
                      </span>
                      <span>{(user.name || user.email.split('@')[0]).slice(0, 12)}</span>
                      <span className="header-user-role-tag">{user.role || 'Staff'}</span>
                    </Link>
                    {['Admin', 'Editor', 'Moderator'].includes(user.role) && (
                      <Link href="/admin" className="btn-auth-header btn-auth-login" title="Admin Control Room">
                        ⚙️ <span className="hide-mobile">{t('nav.admin', 'অ্যাডমিন')}</span>
                      </Link>
                    )}
                    <button
                      onClick={logout}
                      className="btn-auth-logout"
                      title={t('nav.logout', 'লগআউট')}
                      type="button"
                    >
                      🚪
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <Link href="/login" className="btn-auth-header btn-auth-login">
                      🔑 <span>{t('nav.login', 'লগইন')}</span>
                    </Link>
                    <Link href="/register" className="btn-auth-header btn-auth-signup">
                      ✍️ <span>{t('nav.register', 'নিবন্ধন')}</span>
                    </Link>
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                type="button"
                className="btn-menu-mobile"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle Navigation"
              >
                ☰
              </button>
            </div>
          </div>
        </div>

        {/* Section Navigation Strip */}
        <div className="header-nav-strip">
          <div className="container">
            <div className="nav-strip-inner">
              <nav className="nav-sections-scroll" aria-label="Main Navigation">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`nav-sec-link ${isActive ? 'active' : ''}`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div
            style={{
              borderTop: '1px solid var(--border-color)',
              background: 'var(--bg-card)',
              padding: '16px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  color: pathname === link.href ? '#c2182b' : 'var(--text-primary)',
                  fontWeight: pathname === link.href ? 700 : 500,
                  textDecoration: 'none',
                  fontSize: '14px',
                  padding: '6px 0'
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </header>
    </>
  );
}
