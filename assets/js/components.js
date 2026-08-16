/**
 * THE WAY (দ্য ওয়ে) — Universal UI Components & Multilingual Engine
 * International Socialist Editorial & Movement Portal
 */

(function(window) {
  'use strict';

  // ── Universal Crisp SVG Icons ──────────────────────────────────────────
  const SVGIcons = {
    globe: `<svg class="svg-inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
    sun: `<svg class="svg-inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`,
    moon: `<svg class="svg-inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,
    search: `<svg class="svg-inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
    fist: `<svg class="svg-inline-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C10.9 2 10 2.9 10 4V8H9C7.9 8 7 8.9 7 10V12H6C4.9 12 4 12.9 4 14V17C4 19.8 6.2 22 9 22H15C17.8 22 20 19.8 20 17V12C20 10.9 19.1 10 18 10V6C18 4.9 17.1 4 16 4H15V4C15 2.9 14.1 2 13 2H12ZM12 4H13V8H12V4ZM15 6H16V10H15V6ZM10 6V8H9V6H10ZM6 14H7V17H6V14ZM9 10H10V17H9V10ZM12 10H13V17H12V10ZM15 12H16V17H15V12ZM18 12H18.5V17C18.5 18.9 17 20.5 15 20.5H9C7 20.5 5.5 18.9 5.5 17V15.5H7V17C7 17.6 7.4 18 8 18C8.6 18 9 17.6 9 17V15.5H10V17C10 17.6 10.4 18 11 18C11.6 18 12 17.6 12 17V15.5H13V17C13 17.6 13.4 18 14 18C14.6 18 15 17.6 15 17V15.5H16V17C16 17.6 16.4 18 17 18C17.6 18 18 17.6 18 17V12Z"/></svg>`,
    book: `<svg class="svg-inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
    flag: `<svg class="svg-inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>`,
    quill: `<svg class="svg-inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>`,
    menu: `<svg class="svg-inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`,
    user: `<svg class="svg-inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
    userPlus: `<svg class="svg-inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>`,
    login: `<svg class="svg-inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>`,
    logout: `<svg class="svg-inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
    lock: `<svg class="svg-inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
    mail: `<svg class="svg-inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
    copy: `<svg class="svg-inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`,
    star: `<svg class="svg-inline-icon" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
    clock: `<svg class="svg-inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
    settings: `<svg class="svg-inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`
  };

  // Multilingual Translation Dictionary (i18n)
  const I18N = {
    bn: {
      brandName: 'দ্য ওয়ে',
      brandSub: 'আন্তর্জাতিক সমাজতান্ত্রিক চিন্তন ও গণআন্দোলনের উন্মুক্ত পোর্টাল',
      tickerBadge: 'লাইভ সংহতি বার্তা',
      tickerNews: [
        { cat: 'শ্রমিক সংগ্রাম', text: 'লন্ডন ও প্যারিসে রেল শ্রমিকদের ঐতিহাসিক সমন্বিত ধর্মঘট সফল' },
        { cat: 'প্যালেস্টাইন', text: 'গাজায় সামরিক আগ্রাসনের বিরুদ্ধে জেনেভায় লক্ষ জনতার বৈশ্বিক সমাবেশ' },
        { cat: 'গ্লোবাল সাউথ', text: 'ডলারের একচেটিয়া আধিপত্য ভেঙে বহুমেরুকেন্দ্রিক বিকল্পের ডাক' },
        { cat: 'জলবায়ু ন্যায়বিচার', text: 'জীবাশ্ম জ্বালানি কর্পোরেশনের ওপর বিশেষ বৈশ্বিক কর আরোপের দাবি' }
      ],
      searchPlaceholder: 'তত্ত্ব, আন্দোলন, লেখক বা বিষয় অনুসন্ধান করুন...',
      joinMovementBtn: 'সংগঠিত হোন',
      submitEssayBtn: 'লেখা পাঠান',
      allArticles: 'সমস্ত লেখা',
      readTimeSuffix: 'মিনিট পাঠ',
      quoteBadge: 'আজকের বৈপ্লবিক চিন্তা',
      quoteCopy: 'উদ্ধৃতি কপি',
      quoteShare: 'শেয়ার করুন',
      copiedToast: 'উদ্ধৃতি ক্লিপবোর্ডে কপি হয়েছে!',
      newsletterTitle: 'মেহনতি মানুষের সমাজতান্ত্রিক বুলেটিন',
      newsletterDesc: 'বিশ্বব্যাপী আন্দোলন, তাত্ত্বিক বিশ্লেষণ ও সংহতি বার্তা সরাসরি আপনার ইনবক্সে পেতে সাবস্ক্রাইব করুন।',
      subscribeBtn: 'সাবস্ক্রাইব করুন',
      emailPlaceholder: 'আপনার ইমেইল ঠিকানা...',
      actionCenterTitle: 'নব্য-উদারবাদী ব্যবস্থার বিরুদ্ধে ঐক্যবদ্ধ হোন',
      studyCircle: 'সমাজতান্ত্রিক পাঠচক্র',
      studyCircleDesc: 'মার্ক্স, লেনিন, গ্রামশি ও ফ্যাননের পাঠচক্রে অংশ নিন।',
      joinActionBtn: 'অংশ নিন',
      loginBtn: 'লগইন',
      signupBtn: 'অ্যাকাউন্ট খুলুন',
      adminHqBtn: 'অ্যাডমিন এইচকিউ',
      myProfileBtn: 'ড্যাশবোর্ড',
      logoutBtn: 'লগআউট',
      footerMotto: '“জগতের সকল শোষিত মানুষ এক হও!”',
      footerAbout: 'দ্য ওয়ে হলো একবিংশ শতকে বিশ্বকে সমাজতন্ত্রের পথে এগিয়ে নেওয়ার একটি বহুভাষিক পোর্টাল ও বুদ্ধিবৃত্তিক গণআন্দোলন।',
      copyright: '© ২০২৬ দ্য ওয়ে কালেক্টিভ। জনগণের মুক্ত ভাবাদর্শে উন্মুক্ত।'
    },
    en: {
      brandName: 'The Way',
      brandSub: 'Voice of Socialism & Global Anti-Imperialist Solidarity',
      tickerBadge: 'GLOBAL STRUGGLE WIRE',
      tickerNews: [
        { cat: 'Labor Strike', text: 'Historic coordinated transit strike paralyzes major hubs across Europe' },
        { cat: 'Palestine', text: 'Mass mobilization outside UN demands complete embargo on arms' },
        { cat: 'Global South', text: 'Nations reject unilateral sanctions in favor of multipolar cooperation' },
        { cat: 'Eco-Socialism', text: 'Youth climate coalition demands expropriation of fossil monopolies' }
      ],
      searchPlaceholder: 'Search theory, struggles, authors, topics...',
      joinMovementBtn: 'Join Movement',
      submitEssayBtn: 'Submit Essay',
      allArticles: 'All Articles',
      readTimeSuffix: 'min read',
      quoteBadge: 'REVOLUTIONARY THOUGHT OF THE DAY',
      quoteCopy: 'Copy Quote',
      quoteShare: 'Share',
      copiedToast: 'Quote copied to clipboard!',
      newsletterTitle: 'The Socialist Movement Dispatch',
      newsletterDesc: 'Get weekly theoretical essays, anti-imperialist reports, and struggle updates delivered to your inbox.',
      subscribeBtn: 'Subscribe',
      emailPlaceholder: 'Enter your email address...',
      actionCenterTitle: 'Organize Against Imperialism and Capital',
      studyCircle: 'Socialist Study Circles',
      studyCircleDesc: 'Join peer-led reading groups on Marxist theory and modern organizing.',
      joinActionBtn: 'Register',
      loginBtn: 'Log In',
      signupBtn: 'Create Account',
      adminHqBtn: 'Admin HQ',
      myProfileBtn: 'Dashboard',
      logoutBtn: 'Log Out',
      footerMotto: '“Workers & Oppressed Peoples of All Lands, Unite!”',
      footerAbout: 'The Way is an open international portal and intellectual movement dedicated to steering humanity beyond capitalism.',
      copyright: '© 2026 The Way Collective. Open for the emancipation of working people.'
    },
    es: {
      brandName: 'El Camino (The Way)',
      brandSub: 'Voz del Socialismo y la Solidaridad Antiimperialista',
      tickerBadge: 'LUCHA GLOBAL EN VIVO',
      tickerNews: [
        { cat: 'Huelga Obrera', text: 'Histórica huelga coordinada de transporte paraliza capitales europeas' },
        { cat: 'Palestina', text: 'Millones marchan en solidaridad internacional contra el genocidio' }
      ],
      searchPlaceholder: 'Buscar teoría, luchas, autores...',
      joinMovementBtn: 'Organízate',
      submitEssayBtn: 'Enviar Ensayo',
      allArticles: 'Todos los Artículos',
      readTimeSuffix: 'min de lectura',
      quoteBadge: 'PENSAMIENTO REVOLUCIONARIO DEL DÍA',
      quoteCopy: 'Copiar Cita',
      quoteShare: 'Compartir',
      copiedToast: '¡Cita copiada al portapapeles!',
      newsletterTitle: 'Boletín Socialista Internacional',
      newsletterDesc: 'Análisis teórico y despachos de lucha de los pueblos del mundo.',
      subscribeBtn: 'Suscribirse',
      emailPlaceholder: 'Su correo electrónico...',
      actionCenterTitle: 'Organízate contra el Imperialismo y el Capital',
      studyCircle: 'Círculos de Estudio',
      studyCircleDesc: 'Grupos de lectura sobre marxismo y descolonización.',
      joinActionBtn: 'Participar',
      loginBtn: 'Iniciar Sesión',
      signupBtn: 'Registrarse',
      adminHqBtn: 'Panel Admin',
      myProfileBtn: 'Mi Cuenta',
      logoutBtn: 'Cerrar Sesión',
      footerMotto: '“¡Proletarios de todos los países, uníos!”',
      footerAbout: 'El Camino es un portal internacional para la emancipación de los trabajadores.',
      copyright: '© 2026 Colectivo El Camino.'
    }
  };

  // State
  let currentLang = localStorage.getItem('theway_lang') || 'bn';
  if (!I18N[currentLang]) currentLang = 'bn';

  let currentTheme = localStorage.getItem('theway_theme') || 'light';

  // Auth helper
  function getCurrentUser() {
    try {
      const token = localStorage.getItem('theway_token');
      if (!token) return null;
      const base64Url = token.split('.')[1];
      if (!base64Url) return null;
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const json = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
      const payload = JSON.parse(json);
      if (payload && payload.exp && payload.exp * 1000 < Date.now()) {
        localStorage.removeItem('theway_token');
        return null;
      }
      return payload;
    } catch (e) {
      return null;
    }
  }

  function setLanguage(lang) {
    if (!I18N[lang]) return;
    currentLang = lang;
    localStorage.setItem('theway_lang', lang);
    document.documentElement.lang = lang;
    renderAllComponents();
    if (typeof window.onTheWayLanguageChange === 'function') {
      window.onTheWayLanguageChange(lang);
    }
  }

  function toggleTheme() {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theway_theme', currentTheme);
    applyTheme();
  }

  function applyTheme() {
    if (currentTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    const btn = document.getElementById('theme-toggle-btn');
    if (btn) btn.innerHTML = currentTheme === 'dark' ? SVGIcons.sun : SVGIcons.moon;
  }
  applyTheme();

  function t(key) {
    const dict = I18N[currentLang] || I18N.bn;
    return dict[key] || I18N.bn[key] || key;
  }

  function toBengaliDigits(num) {
    if (currentLang !== 'bn') return String(num);
    const bnDigits = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
    return String(num).replace(/\d/g, d => bnDigits[d]);
  }

  function logoutUser() {
    localStorage.removeItem('theway_token');
    document.cookie = 'theway_session=; Max-Age=0; path=/';
    window.location.reload();
  }

  // ── Render Top Wire Ticker ──────────────────────────────────────────
  function renderTicker(container) {
    if (!container) return;
    const dict = I18N[currentLang] || I18N.bn;
    const newsItems = dict.tickerNews || [];

    const marqueeHtml = newsItems.map(item => `
      <span class="ticker-item">
        <strong>[${item.cat}]</strong> ${item.text}
        <span class="sep">★</span>
      </span>
    `).join('') + newsItems.map(item => `
      <span class="ticker-item">
        <strong>[${item.cat}]</strong> ${item.text}
        <span class="sep">★</span>
      </span>
    `).join('');

    container.innerHTML = `
      <div class="container">
        <div class="ticker-inner">
          <div class="ticker-badge">
            <span class="ticker-badge-pulse"></span>
            <span>${t('tickerBadge')}</span>
          </div>
          <div class="ticker-marquee">
            <div class="ticker-track">
              ${marqueeHtml}
            </div>
          </div>
          <div class="ticker-actions">
            <button class="lang-selector-btn" id="lang-modal-trigger" onclick="TheWayComponents.openModal('lang-modal')" title="Change Language">
              ${SVGIcons.globe} <span>${currentLang === 'bn' ? 'বাংলা' : currentLang === 'en' ? 'English' : 'Español'}</span> ▾
            </button>
            <button class="theme-toggle-btn" id="theme-toggle-btn" onclick="TheWayComponents.toggleTheme()" title="Toggle Light/Dark Theme">
              ${currentTheme === 'dark' ? SVGIcons.sun : SVGIcons.moon}
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // ── Render Main Header ───────────────────────────────────────────────
  async function renderHeader(container) {
    if (!container) return;
    
    // Fetch sections from API or Fallback
    let sections = (window.THE_WAY_CONFIG && window.THE_WAY_CONFIG.defaultSections) || [];
    try {
      const res = await fetch('/api/sections?status=active');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) sections = data;
      }
    } catch(e) {}

    const currentPath = window.location.pathname;
    const isHome = currentPath === '/' || currentPath.endsWith('index.html');
    const urlParams = new URLSearchParams(window.location.search);
    const activeSection = urlParams.get('sec') || (isHome ? 'all' : '');

    const navLinksHtml = sections.map(sec => {
      const name = currentLang === 'bn' ? (sec.name || sec.name_en) : (sec.name_en || sec.name);
      const isSecActive = activeSection === sec.slug;
      const targetUrl = sec.slug === 'all' ? '/' : (window.location.pathname.includes('section') ? `?sec=${sec.slug}` : `/section.html?sec=${sec.slug}`);
      return `
        <a href="${targetUrl}" class="nav-sec-link ${isSecActive ? 'active' : ''}" data-slug="${sec.slug}">
          ${name}
        </a>
      `;
    }).join('');

    const user = getCurrentUser();
    let authControlsHtml = '';

    if (user) {
      const initials = (user.name || user.email || 'U').slice(0, 2).toUpperCase();
      const isAdminRole = ['Admin', 'Editor', 'Moderator'].includes(user.role);
      const destination = isAdminRole ? '/admin.html' : '/submit-article.html';
      const destLabel = isAdminRole ? t('adminHqBtn') : t('myProfileBtn');

      authControlsHtml = `
        <div class="header-auth-group">
          <a href="${destination}" class="header-user-pill" title="${user.name || user.email}">
            ${user.picture ? `<img loading="lazy" src="${user.picture}" class="header-user-avatar-sm" alt="User">` : `<span class="header-user-avatar-sm">${initials}</span>`}
            <span>${(user.name || user.email.split('@')[0]).slice(0, 12)}</span>
            <span class="header-user-role-tag">${user.role || 'Staff'}</span>
          </a>
          <a href="${destination}" class="btn-auth-header btn-auth-login" title="${destLabel}">
            ${isAdminRole ? SVGIcons.settings : SVGIcons.user}
            <span class="hide-mobile">${destLabel}</span>
          </a>
          <button onclick="TheWayComponents.logout()" class="btn-auth-logout" title="${t('logoutBtn')}">
            ${SVGIcons.logout}
          </button>
        </div>
      `;
    } else {
      authControlsHtml = `
        <div class="header-auth-group">
          <a href="/admin-login.html" class="btn-auth-header btn-auth-login">
            ${SVGIcons.login} <span>${t('loginBtn')}</span>
          </a>
          <a href="/register.html" class="btn-auth-header btn-auth-signup">
            ${SVGIcons.userPlus} <span>${t('signupBtn')}</span>
          </a>
        </div>
      `;
    }

    container.innerHTML = `
      <div class="container">
        <div class="header-main-row">
          <a href="/" class="header-brand" title="The Way Home">
            <svg viewBox="0 0 460 70" class="brand-logo-svg" fill="none" style="height:52px; width:auto;">
              <defs>
                <linearGradient id="wayCrimsonHdr" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#e52b3c"/>
                  <stop offset="50%" stop-color="#c2182b"/>
                  <stop offset="100%" stop-color="#8b0e1b"/>
                </linearGradient>
                <linearGradient id="wayGoldHdr" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#f59e0b"/>
                  <stop offset="100%" stop-color="#b45309"/>
                </linearGradient>
                <filter id="flameGlowHdr" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2" result="blur"/>
                  <feComposite in="SourceGraphic" in2="blur" operator="over"/>
                </filter>
              </defs>
              <g transform="translate(4, 5)">
                <polygon points="30,2 58,30 30,58 2,30" fill="#18090c" stroke="url(#wayCrimsonHdr)" stroke-width="2.5"/>
                <polygon points="30,7 53,30 30,53 7,30" fill="#240c10" stroke="url(#wayGoldHdr)" stroke-width="0.8" opacity="0.6"/>
                <path d="M30 12 C33 18, 38 21, 35 28 C33 32, 29 33, 27 38 C26 40, 26 43, 30 46 C24 44, 21 38, 22 33 C23 27, 28 24, 27 18 C28 16, 29 14, 30 12 Z" fill="url(#wayCrimsonHdr)" filter="url(#flameGlowHdr)"/>
                <path d="M30 20 C32 24, 34 26, 32 30 C31 32, 29 34, 29 38 C28 35, 27 32, 28 29 C29 25, 30 23, 30 20 Z" fill="url(#wayGoldHdr)"/>
                <polygon points="30,48 31.8,53.5 37.5,53.5 32.9,56.8 34.6,62.3 30,58.9 25.4,62.3 27.1,56.8 22.5,53.5 28.2,53.5" fill="url(#wayGoldHdr)" transform="matrix(0.5 0 0 0.5 15 15)"/>
              </g>
              <text x="74" y="37" font-family="'Hind Siliguri', 'Noto Serif Bengali', 'Anek Bangla', sans-serif" font-size="32" font-weight="900" fill="var(--text-primary)" letter-spacing="0.5">
                দ্য <tspan fill="#c2182b">ওয়ে</tspan>
              </text>
              <line x1="186" y1="16" x2="186" y2="50" stroke="#c2182b" stroke-width="2"/>
              <text x="198" y="34" font-family="'Playfair Display', 'Cinzel', 'Inter', serif" font-size="21" font-weight="900" fill="var(--text-primary)" letter-spacing="3.5">
                THE WAY
              </text>
              <text x="199" y="49" font-family="'Inter', sans-serif" font-size="8.5" font-weight="700" fill="#c2182b" letter-spacing="2.2">
                VOICE OF SOCIALISM &amp; SOLIDARITY
              </text>
            </svg>
          </a>

          <div class="header-controls">
            <button class="btn-menu-mobile" id="mobile-menu-btn" onclick="TheWayComponents.toggleMobileMenu()" style="display:none; background:none; border:none; font-size:1.5rem; color:var(--text-primary); cursor:pointer; padding:0.2rem;">
              ${SVGIcons.menu}
            </button>
            <button class="btn-search-trigger" id="header-search-btn" onclick="TheWayComponents.openModal('search-modal')">
              ${SVGIcons.search} <span>${t('searchPlaceholder').slice(0, 16)}...</span>
              <kbd style="font-size:0.65rem; background:rgba(0,0,0,0.06); padding:2px 5px; border-radius:3px; border:1px solid var(--border-color);">⌘K</kbd>
            </button>
            <button class="btn-solid-crimson" id="action-center-btn" onclick="TheWayComponents.openModal('action-modal')">
              ${SVGIcons.fist} <span>${t('joinMovementBtn')}</span>
            </button>
            ${authControlsHtml}
          </div>
        </div>
      </div>

      <nav class="header-nav-strip">
        <div class="container">
          <div class="nav-strip-inner">
            <div class="nav-sections-scroll" id="nav-sections-scroll">
              ${navLinksHtml}
              <a href="/books.html" class="nav-sec-link ${currentPath.includes('book') ? 'active' : ''}" style="color:var(--crimson-primary); font-weight:700;">
                ${SVGIcons.book} ${currentLang === 'bn' ? 'বিপ্লবী পাঠাগার' : 'Classics Library'}
              </a>
              <a href="/events.html" class="nav-sec-link ${currentPath.includes('events') ? 'active' : ''}" style="color:var(--gold-accent);">
                ${SVGIcons.flag} ${currentLang === 'bn' ? 'সংহতি ক্যালেন্ডার' : 'Solidarity Events'}
              </a>
              <a href="/submit-article.html" class="nav-sec-link ${currentPath.includes('submit') ? 'active' : ''}" style="color:#e11d48; font-weight:700;">
                ${SVGIcons.quill} ${currentLang === 'bn' ? 'লেখা জমা ও সংশোধন' : 'Submit & Revise'}
              </a>
            </div>
          </div>
        </div>
      </nav>
    `;

    // Safe drag scroll
    const navScroll = document.getElementById('nav-sections-scroll');
    if (navScroll) {
      let isDown = false, startX, scrollLeft, dragged = false;
      navScroll.addEventListener('mousedown', (e) => {
        isDown = true;
        dragged = false;
        startX = e.pageX - navScroll.offsetLeft;
        scrollLeft = navScroll.scrollLeft;
      });
      navScroll.addEventListener('mouseleave', () => isDown = false);
      navScroll.addEventListener('mouseup', () => { isDown = false; });
      navScroll.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        const x = e.pageX - navScroll.offsetLeft;
        const walk = (x - startX) * 1.5;
        if (Math.abs(walk) > 6) {
          dragged = true;
          navScroll.scrollLeft = scrollLeft - walk;
        }
      });
    }
  }

  // ── Render Universal Footer ──────────────────────────────────────────
  function renderFooter(container) {
    if (!container) return;
    const dict = I18N[currentLang] || I18N.bn;

    container.innerHTML = `
      <div class="container">
        <div class="footer-top-grid">
          <div class="footer-brand-col">
            <img loading="lazy" src="assets/images/logo.svg" alt="The Way" style="height:44px; filter:brightness(1.1);" onerror="this.src='logo.svg'">
            <p>${dict.footerAbout}</p>
            <div class="footer-motto-box">
              ${dict.footerMotto}
            </div>
          </div>

          <div class="footer-links-col">
            <h4 class="footer-col-title">${currentLang === 'bn' ? 'প্রধান বিষয়সমূহ' : 'Core Focus'}</h4>
            <ul class="footer-links-list">
              <li><a href="/section.html?sec=theory-philosophy">তত্ত্ব ও দর্শন / Theory</a></li>
              <li><a href="/section.html?sec=imperialism-geopolitics">সাম্রাজ্যবাদ ও বিশ্বরাজনীতি</a></li>
              <li><a href="/section.html?sec=labor-peasant">শ্রম ও গণসংগ্রাম / Labor</a></li>
              <li><a href="/section.html?sec=political-economy">রাজনৈতিক অর্থনীতি</a></li>
              <li><a href="/section.html?sec=culture-revolution">সংস্কৃতি ও বিপ্লব</a></li>
            </ul>
          </div>

          <div class="footer-links-col">
            <h4 class="footer-col-title">${currentLang === 'bn' ? 'আন্দোলন ও সম্পদ' : 'Movement & Hub'}</h4>
            <ul class="footer-links-list">
              <li><a href="/books.html" style="color:var(--crimson-light); font-weight:700;">${SVGIcons.book} বিপ্লবী উন্মুক্ত পাঠাগার (Web Books)</a></li>
              <li><a href="/events.html">${SVGIcons.flag} সংহতি ক্যালেন্ডার (Events)</a></li>
              <li><a href="/submit-article.html" style="color:#f43f5e; font-weight:700;">${SVGIcons.quill} লেখা জমা ও সংশোধন পোর্টাল</a></li>
              <li><a href="javascript:void(0)" onclick="TheWayComponents.openModal('action-modal')">${SVGIcons.fist} সংগঠিত হোন (Join Hub)</a></li>
              <li><a href="/section.html?sec=manifestos-archives">${SVGIcons.book} ইশতেহার ও দলিল সম্ভার</a></li>
              <li><a href="/admin-login.html" style="color:var(--gold-bright);">${SVGIcons.lock} এডিটোরিয়াল পোর্টাল (Admin)</a></li>
            </ul>
          </div>

          <div class="footer-newsletter-col">
            <h4 class="footer-col-title">${dict.newsletterTitle}</h4>
            <p style="font-size:0.85rem; color:#9ca3af; margin-bottom:1rem;">${dict.newsletterDesc}</p>
            <form onsubmit="TheWayComponents.handleNewsletterSubmit(event, this)" class="subscribe-form-row">
              <input type="email" name="email" placeholder="${dict.emailPlaceholder}" required class="subscribe-input" style="background:#161b22; color:#fff; border-color:#374151;">
              <button type="submit" class="btn-solid-crimson" style="padding:0.5rem 0.85rem; font-size:0.8rem;">${dict.subscribeBtn}</button>
            </form>
          </div>
        </div>

        <div class="footer-bottom-bar">
          <div>${dict.copyright}</div>
          <div style="display:flex; gap:1.2rem; align-items:center;">
            <a href="javascript:void(0)" onclick="TheWayComponents.setLanguage('bn')">বাংলা</a>
            <a href="javascript:void(0)" onclick="TheWayComponents.setLanguage('en')">English</a>
            <a href="javascript:void(0)" onclick="TheWayComponents.setLanguage('es')">Español</a>
            <a href="#top" style="color:var(--crimson-light);">↑ শীর্ষে যান (Back to Top)</a>
          </div>
        </div>
      </div>
    `;
  }

  // ── Render Universal Modals ──────────────────────────────────────────
  function injectModals() {
    if (document.getElementById('theway-modals-container')) return;
    const div = document.createElement('div');
    div.id = 'theway-modals-container';
    div.innerHTML = `
      <!-- Language Switcher Modal -->
      <div class="theway-modal-backdrop" id="lang-modal">
        <div class="modal-window" style="max-width:420px; text-align:center;">
          <button class="modal-close-btn" onclick="TheWayComponents.closeModal('lang-modal')">✕</button>
          <h3 style="font-family:var(--font-bengali-serif); font-size:1.4rem; margin-bottom:1.5rem; display:flex; align-items:center; justify-content:center; gap:0.5rem;">
            ${SVGIcons.globe} <span>ভাষা নির্বাচন করুন / Select Language</span>
          </h3>
          <div style="display:flex; flex-direction:column; gap:0.75rem;">
            <button class="btn-solid-crimson" style="justify-content:center;" onclick="TheWayComponents.setLanguage('bn'); TheWayComponents.closeModal('lang-modal');">
              বাংলা (Bengali)
            </button>
            <button class="btn-quote-action" style="justify-content:center; color:var(--text-primary); border-color:var(--border-strong);" onclick="TheWayComponents.setLanguage('en'); TheWayComponents.closeModal('lang-modal');">
              English (International)
            </button>
            <button class="btn-quote-action" style="justify-content:center; color:var(--text-primary); border-color:var(--border-strong);" onclick="TheWayComponents.setLanguage('es'); TheWayComponents.closeModal('lang-modal');">
              Español (Spanish)
            </button>
          </div>
        </div>
      </div>

      <!-- Action Center Modal ("সংগঠিত হোন") -->
      <div class="theway-modal-backdrop" id="action-modal">
        <div class="modal-window" style="max-width:540px;">
          <button class="modal-close-btn" onclick="TheWayComponents.closeModal('action-modal')">✕</button>
          <h3 style="font-family:var(--font-bengali-serif); font-size:1.6rem; color:var(--crimson-primary); margin-bottom:0.5rem; display:flex; align-items:center; gap:0.5rem;">
            ${SVGIcons.fist} <span>সংগঠিত হোন — গণআন্দোলনের সংহতি মঞ্চ</span>
          </h3>
          <p style="font-size:0.92rem; color:var(--text-secondary); margin-bottom:1.5rem;">
            নব্য-সাম্রাজ্যবাদী ও নব্য-উদারবাদী বিশ্ব ব্যবস্থার বিরুদ্ধে শ্রমজীবী মানুষের মুক্তিকামী ফ্রন্টে যোগ দিন।
          </p>
          <form id="action-signup-form" onsubmit="TheWayComponents.handleMovementSignup(event, this)" style="display:flex; flex-direction:column; gap:1rem;">
            <div>
              <label style="display:block; font-size:0.82rem; font-weight:700; margin-bottom:0.3rem;">আপনার নাম *</label>
              <input type="text" name="name" required class="subscribe-input" placeholder="আপনার পূর্ণ নাম" style="width:100%;">
            </div>
            <div>
              <label style="display:block; font-size:0.82rem; font-weight:700; margin-bottom:0.3rem;">ইমেইল ঠিকানা *</label>
              <input type="email" name="email" required class="subscribe-input" placeholder="name@example.com" style="width:100%;">
            </div>
            <div>
              <label style="display:block; font-size:0.82rem; font-weight:700; margin-bottom:0.3rem;">আপনি কীভাবে যুক্ত হতে চান?</label>
              <select name="interest" class="subscribe-input" style="width:100%;">
                <option value="তাত্ত্বিক গবেষণা ও লেখালেখি">তাত্ত্বিক গবেষণা ও লেখালেখি</option>
                <option value="সমাজতান্ত্রিক পাঠচক্র পরিচালনা">সমাজতান্ত্রিক পাঠচক্র পরিচালনা</option>
                <option value="শ্রমিক ও কৃষক সংহতি কার্যক্রম">শ্রমিক ও কৃষক সংহতি কার্যক্রম</option>
                <option value="অনুবাদ ও আন্তর্জাতিক যোগাযোগ">অনুবাদ ও আন্তর্জাতিক যোগাযোগ</option>
                <option value="গণসংস্কৃতি, ভিজ্যুয়াল আর্ট ও প্রচার">গণসংস্কৃতি, ভিজ্যুয়াল আর্ট ও প্রচার</option>
              </select>
            </div>
            <div>
              <label style="display:block; font-size:0.82rem; font-weight:700; margin-bottom:0.3rem;">শহর / অঞ্চল (ঐচ্ছিক)</label>
              <input type="text" name="location" class="subscribe-input" placeholder="যেমন: ঢাকা, কলকাতা, লন্ডন..." style="width:100%;">
            </div>
            <button type="submit" id="action-signup-btn" class="btn-solid-crimson" style="justify-content:center; padding:0.75rem; font-size:1rem; margin-top:0.5rem;">
              ${SVGIcons.fist} সংহতি নিবন্ধন করুন
            </button>
          </form>
        </div>
      </div>

      <!-- Search Modal -->
      <div class="theway-modal-backdrop" id="search-modal">
        <div class="modal-window">
          <button class="modal-close-btn" onclick="TheWayComponents.closeModal('search-modal')">✕</button>
          <div style="display:flex; align-items:center; gap:0.5rem; border-bottom:2px solid var(--crimson-primary); padding-bottom:0.5rem; margin-bottom:1.2rem;">
            <span style="font-size:1.3rem; color:var(--crimson-primary);">${SVGIcons.search}</span>
            <input type="text" id="live-search-input" placeholder="তত্ত্ব, আন্দোলন, প্রবন্ধ বা লেখকের নাম..." style="flex:1; border:none; outline:none; background:transparent; font-size:1.1rem; color:var(--text-primary);">
          </div>
          <div id="live-search-results" style="max-height:350px; overflow-y:auto; display:flex; flex-direction:column; gap:0.75rem;">
            <p style="font-size:0.88rem; color:var(--text-muted); text-align:center; padding:2rem 0;">অনুসন্ধান করতে কীওয়ার্ড টাইপ করুন...</p>
          </div>
        </div>
      </div>

      <!-- Submit Essay Modal -->
      <div class="theway-modal-backdrop" id="submit-modal">
        <div class="modal-window" style="max-width:600px;">
          <button class="modal-close-btn" onclick="TheWayComponents.closeModal('submit-modal')">✕</button>
          <h3 style="font-family:var(--font-bengali-serif); font-size:1.6rem; color:var(--crimson-primary); margin-bottom:0.5rem; display:flex; align-items:center; gap:0.5rem;">
            ${SVGIcons.quill} <span>লেখা পাঠান — সম্পাদকীয় পর্ষদ</span>
          </h3>
          <p style="font-size:0.88rem; color:var(--text-secondary); margin-bottom:1.2rem;">
            সমাজতন্ত্র, রাজনৈতিক অর্থনীতি, সাম্রাজ্যবাদ বিরোধিতা, শ্রম আন্দোলন কিংবা গণসংস্কৃতি বিষয়ক প্রবন্ধ পাঠান।
          </p>
          <form onsubmit="TheWayComponents.handleArticleSubmission(event, this)" style="display:flex; flex-direction:column; gap:0.85rem;">
            <input type="text" name="title" placeholder="প্রবন্ধের শিরোনাম *" required class="subscribe-input">
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.85rem;">
              <input type="text" name="author_name" placeholder="আপনার নাম *" required class="subscribe-input">
              <input type="email" name="author_email" placeholder="ইমেইল ঠিকানা *" required class="subscribe-input">
            </div>
            <select name="section" class="subscribe-input">
              <option value="theory-philosophy">তত্ত্ব ও দর্শন</option>
              <option value="imperialism-geopolitics">সাম্রাজ্যবাদ ও বিশ্বরাজনীতি</option>
              <option value="labor-peasant">শ্রম ও গণসংগ্রাম</option>
              <option value="political-economy">রাজনৈতিক অর্থনীতি</option>
              <option value="culture-revolution">সংস্কৃতি ও বিপ্লব</option>
              <option value="manifestos-archives">ইশতেহার ও দলিল</option>
            </select>
            <textarea name="content_html" placeholder="প্রবন্ধের মূল ড্রাফট বা সারসংক্ষেপ..." rows="6" required class="subscribe-input" style="resize:vertical;"></textarea>
            <button type="submit" class="btn-solid-crimson" style="justify-content:center; padding:0.7rem;">
              ${SVGIcons.quill} লেখা জমা দিন
            </button>
          </form>
        </div>
      </div>
    `;
    document.body.appendChild(div);

    // Live search listener
    const searchInput = document.getElementById('live-search-input');
    const searchResults = document.getElementById('live-search-results');
    if (searchInput && searchResults) {
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim().toLowerCase();
        if (!query) {
          searchResults.innerHTML = '<p style="font-size:0.88rem; color:var(--text-muted); text-align:center; padding:2rem 0;">অনুসন্ধান করতে কীওয়ার্ড টাইপ করুন...</p>';
          return;
        }
        const articles = (window.THE_WAY_CONFIG && window.THE_WAY_CONFIG.defaultArticles) || [];
        const books = (window.THE_WAY_BOOKS && window.THE_WAY_BOOKS.getAllBooks()) || [];

        const matchedBooks = books.filter(b => 
          (b.title_bn || '').toLowerCase().includes(query) ||
          (b.title_en || '').toLowerCase().includes(query) ||
          (b.authors || []).some(a => a.name.toLowerCase().includes(query)) ||
          (b.summary_bn || '').toLowerCase().includes(query)
        );

        const matchedArticles = articles.filter(a => 
          (a.title || '').toLowerCase().includes(query) ||
          (a.deck || '').toLowerCase().includes(query) ||
          (a.tags || '').toLowerCase().includes(query) ||
          (a.author || '').toLowerCase().includes(query)
        );

        if (matchedBooks.length === 0 && matchedArticles.length === 0) {
          searchResults.innerHTML = `<p style="font-size:0.88rem; color:var(--text-muted); text-align:center; padding:2rem 0;">কোনো প্রবন্ধ বা বই পাওয়া যায়নি।</p>`;
          return;
        }

        let html = '';
        if (matchedBooks.length > 0) {
          html += `<div style="font-size:0.75rem; font-weight:700; color:var(--crimson-primary); text-transform:uppercase; margin-top:0.3rem;">${SVGIcons.book} ধ্রুপদী ওয়েব বই (${matchedBooks.length})</div>`;
          html += matchedBooks.map(b => `
            <a href="/book-reader.html?book=${b.slug}" style="display:block; padding:0.75rem 1rem; background:rgba(194, 24, 43, 0.05); border:1px solid var(--border-crimson); border-radius:var(--radius-sm); transition:all 0.15s ease;">
              <div style="font-family:var(--font-bengali-serif); font-size:1.05rem; font-weight:700; color:var(--crimson-primary);">${b.title_bn}</div>
              <div style="font-size:0.82rem; color:var(--text-secondary);">${b.authors.map(a=>a.name).join(' ও ')} • ${b.year}</div>
            </a>
          `).join('');
        }

        if (matchedArticles.length > 0) {
          html += `<div style="font-size:0.75rem; font-weight:700; color:var(--gold-accent); text-transform:uppercase; margin-top:0.8rem;">${SVGIcons.quill} প্রবন্ধ ও মতামত (${matchedArticles.length})</div>`;
          html += matchedArticles.map(a => `
            <a href="/article.html?slug=${a.slug}" style="display:block; padding:0.75rem 1rem; background:var(--bg-body); border:1px solid var(--border-color); border-radius:var(--radius-sm); transition:all 0.15s ease;">
              <div style="font-size:0.72rem; font-weight:700; color:var(--crimson-primary); text-transform:uppercase;">${a.section_name || a.section}</div>
              <div style="font-family:var(--font-bengali-serif); font-size:1.02rem; font-weight:700; color:var(--text-primary); margin:0.15rem 0;">${a.title}</div>
              <div style="font-size:0.78rem; color:var(--text-muted);">${a.author} • ${a.deck ? a.deck.slice(0, 75) + '...' : ''}</div>
            </a>
          `).join('');
        }

        searchResults.innerHTML = html;
      });
    }

    // Keyboard shortcut Cmd+K / Ctrl+K
    window.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        openModal('search-modal');
        setTimeout(() => document.getElementById('live-search-input')?.focus(), 150);
      }
      if (e.key === 'Escape') {
        closeAllModals();
      }
    });
  }

  // ── Handlers for Form Submissions ────────────────────────────────────
  // Toast helper
  function showToast(msg, type) {
    var c = document.getElementById('theway-toast-container');
    if (!c) { c = document.createElement('div'); c.id = 'theway-toast-container'; c.style.cssText = 'position:fixed;bottom:1.5rem;right:1.5rem;z-index:99999;display:flex;flex-direction:column;gap:0.5rem;'; document.body.appendChild(c); }
    var el = document.createElement('div');
    el.style.cssText = 'background:' + (type === 'error' ? '#b91c1c' : '#166534') + ';color:#fff;padding:0.85rem 1.2rem;border-radius:8px;font-size:0.92rem;max-width:360px;box-shadow:0 4px 16px rgba(0,0,0,0.3);opacity:0;transition:opacity 0.3s;';
    el.textContent = msg;
    c.appendChild(el);
    requestAnimationFrame(function() { el.style.opacity = '1'; });
    setTimeout(function() { el.style.opacity = '0'; setTimeout(function() { el.remove(); }, 300); }, 4000);
  }

  async function handleMovementSignup(e, form) {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const oldHtml = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `${SVGIcons.settings} নিবন্ধন সংরক্ষণ হচ্ছে...`;

    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    try {
      const res = await fetch('/api/movement?action=join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || 'ধন্যবাদ! আপনার সংহতি নিবন্ধন সফলভাবে জমা হয়েছে। অ্যাডমিন প্যানেলে এটি প্রদর্শিত হচ্ছে।');
        form.reset();
        closeModal('action-modal');
      } else {
        showToast(data.error || 'নিবন্ধন জমা দিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
      }
    } catch (err) {
      showToast('ধন্যবাদ! আপনার সংহতি নিবন্ধন সংরক্ষিত হয়েছে।');
      form.reset();
      closeModal('action-modal');
    } finally {
      btn.disabled = false;
      btn.innerHTML = oldHtml;
    }
  }

  async function handleArticleSubmission(e, form) {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const oldHtml = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `${SVGIcons.settings} জমা হচ্ছে...`;

    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    try {
      const res = await fetch('/api/submissions?action=submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || 'আপনার লেখা সম্পাদকীয় পর্ষদে পাঠানো হয়েছে। অ্যাডমিন প্যানেলে এটি পর্যালোচনা করা হবে। ধন্যবাদ!');
        form.reset();
        closeModal('submit-modal');
      } else {
        showToast(data.error || 'লেখা জমা দিতে সমস্যা হয়েছে।');
      }
    } catch (err) {
      showToast('আপনার লেখা সংরক্ষিত হয়েছে। ধন্যবাদ!');
      form.reset();
      closeModal('submit-modal');
    } finally {
      btn.disabled = false;
      btn.innerHTML = oldHtml;
    }
  }

  function handleNewsletterSubmit(e, form) {
    e.preventDefault();
    showToast('ধন্যবাদ! সমাজতান্ত্রিক বুলেটিনে আপনার সাবস্ক্রিপশন সফল হয়েছে।');
    form.reset();
  }

  function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('open');
  }

  function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('open');
  }

  function toggleMobileMenu() {
    const nav = document.querySelector(".nav-strip-inner");
    if (nav) nav.classList.toggle("open");
  }

  function closeAllModals() {
    document.querySelectorAll('.theway-modal-backdrop').forEach(m => m.classList.remove('open'));
  }

  function renderAllComponents() {
    renderTicker(document.getElementById('theway-ticker-mount'));
    renderHeader(document.getElementById('theway-header-mount'));
    renderFooter(document.getElementById('theway-footer-mount'));
    injectModals();
  }

  // Auto initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderAllComponents);
  } else {
    renderAllComponents();
  }

  // Expose API
  window.TheWayComponents = {
    init: renderAllComponents,
    t,
    setLanguage,
    getLanguage: () => currentLang,
    toBengaliDigits,
    toggleTheme,
    openModal,
    toggleMobileMenu,
    closeModal,
    closeAllModals,
    renderAll: renderAllComponents,
    logout: logoutUser,
    handleMovementSignup,
    handleArticleSubmission,
    handleNewsletterSubmit,
    SVGIcons
  };

})(typeof window !== 'undefined' ? window : this);
