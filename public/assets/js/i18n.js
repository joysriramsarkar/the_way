/**
 * THE WAY — i18n Engine (Multilingual UI)
 * Handles locale detection, string loading, RTL support, language switching
 */

const TheWayI18n = (() => {
  'use strict';

  const SUPPORTED_LOCALES = ['bn', 'en', 'es', 'hi', 'pt', 'fr', 'ar', 'ru'];
  const DEFAULT_LOCALE = 'bn';
  const STORAGE_KEY = 'theway_locale';
  const RTL_LOCALES = ['ar', 'fa', 'ur', 'he'];

  let currentLocale = DEFAULT_LOCALE;
  let strings = {};
  let loadedLocales = {};

  function detectLocale() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED_LOCALES.includes(stored)) return stored;
    const browserLang = (navigator.language || navigator.userLanguage || '').split('-')[0].toLowerCase();
    if (SUPPORTED_LOCALES.includes(browserLang)) return browserLang;
    return DEFAULT_LOCALE;
  }

  async function loadLocale(locale) {
    if (loadedLocales[locale]) return loadedLocales[locale];
    try {
      const response = await fetch(`/locales/${locale}.json`);
      if (!response.ok) throw new Error(`Failed to load locale: ${locale}`);
      const data = await response.json();
      loadedLocales[locale] = data;
      return data;
    } catch (e) {
      console.warn(`[i18n] Could not load locale '${locale}':`, e);
      if (locale !== DEFAULT_LOCALE) return await loadLocale(DEFAULT_LOCALE);
      return {};
    }
  }

  function applyDirection(locale) {
    const isRTL = RTL_LOCALES.includes(locale);
    document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', locale);
  }

  function translateDOM() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const translation = t(key);
      if (translation && translation !== key) el.textContent = translation;
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const translation = t(key);
      if (translation && translation !== key) el.setAttribute('placeholder', translation);
    });
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      const translation = t(key);
      if (translation && translation !== key) el.setAttribute('title', translation);
    });
  }

  function t(key, params = {}) {
    let str = strings[key] || key;
    Object.keys(params).forEach(param => {
      str = str.replace(new RegExp(`{{${param}}}`, 'g'), params[param]);
    });
    return str;
  }

  async function setLocale(locale) {
    if (!SUPPORTED_LOCALES.includes(locale)) {
      console.warn(`[i18n] Unsupported locale: ${locale}`);
      return;
    }
    strings = await loadLocale(locale);
    currentLocale = locale;
    localStorage.setItem(STORAGE_KEY, locale);
    applyDirection(locale);
    translateDOM();
    window.dispatchEvent(new CustomEvent('theway:locale-changed', {
      detail: { locale, direction: RTL_LOCALES.includes(locale) ? 'rtl' : 'ltr' }
    }));
  }

  async function init() {
    const locale = detectLocale();
    strings = await loadLocale(locale);
    currentLocale = locale;
    applyDirection(locale);
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', translateDOM);
    } else {
      translateDOM();
    }
  }

  function getLocale() { return currentLocale; }
  function isRTL() { return RTL_LOCALES.includes(currentLocale); }

  function formatNumber(num) {
    try { return new Intl.NumberFormat(currentLocale).format(num); }
    catch (e) { return num.toString(); }
  }

  function formatDate(dateStr, options = {}) {
    try {
      const date = new Date(dateStr);
      const defaultOptions = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Intl.DateTimeFormat(currentLocale, { ...defaultOptions, ...options }).format(date);
    } catch (e) { return dateStr; }
  }

  function relativeTime(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return t('common.just_now');
    if (diff < 3600) return `${Math.floor(diff / 60)}m ${t('common.ago')}`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ${t('common.ago')}`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)} ${t('common.days_ago')}`;
    return formatDate(dateStr);
  }

  function buildLanguageSwitcher(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const langs = [
      { code: 'bn', label: 'বাংলা' },
      { code: 'en', label: 'English' },
      { code: 'es', label: 'Español' },
      { code: 'hi', label: 'हिन्दी' },
      { code: 'pt', label: 'Português' },
      { code: 'fr', label: 'Français' },
      { code: 'ar', label: 'العربية' },
      { code: 'ru', label: 'Русский' }
    ];

    container.innerHTML = `
      <div class="lang-switcher" role="navigation" aria-label="Language selector">
        <button class="lang-switcher-toggle" id="lang-toggle-btn" aria-expanded="false" aria-haspopup="listbox">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
          <span id="current-lang-label">${langs.find(l => l.code === currentLocale)?.label || 'বাংলা'}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <div class="lang-dropdown" id="lang-dropdown" role="listbox" aria-label="Select language" hidden>
          ${langs.map(lang => `
            <button class="lang-option ${lang.code === currentLocale ? 'active' : ''}" role="option" data-lang="${lang.code}" aria-selected="${lang.code === currentLocale}" onclick="TheWayI18n.selectLang('${lang.code}')">${lang.label}</button>
          `).join('')}
        </div>
      </div>
    `;

    document.getElementById('lang-toggle-btn')?.addEventListener('click', () => {
      const dropdown = document.getElementById('lang-dropdown');
      const btn = document.getElementById('lang-toggle-btn');
      const isHidden = dropdown.hidden;
      dropdown.hidden = !isHidden;
      btn.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
    });

    document.addEventListener('click', (e) => {
      if (!container.contains(e.target)) {
        const dropdown = document.getElementById('lang-dropdown');
        if (dropdown) dropdown.hidden = true;
      }
    });
  }

  function selectLang(locale) {
    setLocale(locale).then(() => {
      const langMap = { bn: 'বাংলা', en: 'English', es: 'Español', hi: 'हिन्दी', pt: 'Português', fr: 'Français', ar: 'العربية', ru: 'Русский' };
      const label = document.getElementById('current-lang-label');
      if (label) label.textContent = langMap[locale] || locale;
      document.querySelectorAll('.lang-option').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === locale);
        btn.setAttribute('aria-selected', btn.dataset.lang === locale);
      });
      const dropdown = document.getElementById('lang-dropdown');
      if (dropdown) dropdown.hidden = true;
    });
  }

  return { init, t, setLocale, getLocale, getLang: getLocale, isRTL, formatNumber, formatDate, relativeTime, buildLanguageSwitcher, selectLang, translateDOM };
})();

TheWayI18n.init();