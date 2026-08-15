/**
 * THE WAY (দ্য ওয়ে) — Universal UI Components & Multilingual Engine
 * International Socialist Editorial & Movement Portal
 */

(function(window) {
  'use strict';

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
      footerMotto: '“¡Proletarios de todos los países, uníos!”',
      footerAbout: 'El Camino es un portal internacional para la emancipación de los trabajadores.',
      copyright: '© 2026 Colectivo El Camino.'
    }
  };

  // State
  let currentLang = localStorage.getItem('theway_lang') || 'bn';
  if (!I18N[currentLang]) currentLang = 'bn';

  let currentTheme = localStorage.getItem('theway_theme') || 'light';

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
  }
  applyTheme();

  function t(key) {
    const dict = I18N[currentLang] || I18N.bn;
    return dict[key] || I18N.bn[key] || key;
  }

  // Convert English digits to Bengali digits
  function toBengaliDigits(num) {
    if (currentLang !== 'bn') return String(num);
    const bnDigits = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
    return String(num).replace(/\d/g, d => bnDigits[d]);
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
              🌐 <span>${currentLang === 'bn' ? 'বাংলা' : currentLang === 'en' ? 'English' : 'Español'}</span> ▾
            </button>
            <button class="theme-toggle-btn" id="theme-toggle-btn" onclick="TheWayComponents.toggleTheme()" title="Toggle Light/Dark Theme">
              ${currentTheme === 'dark' ? '☀️' : '🌙'}
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

    container.innerHTML = `
      <div class="container">
        <div class="header-main-row">
          <a href="/" class="header-brand" title="The Way Home">
            <img src="assets/images/logo.svg" alt="The Way (দ্য ওয়ে)" class="brand-logo-svg" onerror="this.src='logo.svg'">
          </a>

          <div class="header-controls">
            <button class="btn-search-trigger" id="header-search-btn" onclick="TheWayComponents.openModal('search-modal')">
              🔍 <span>${t('searchPlaceholder').slice(0, 16)}...</span>
              <kbd style="font-size:0.65rem; background:rgba(0,0,0,0.06); padding:2px 5px; border-radius:3px; border:1px solid var(--border-color);">⌘K</kbd>
            </button>
            <button class="btn-solid-crimson" id="action-center-btn" onclick="TheWayComponents.openModal('action-modal')">
              ✊ <span>${t('joinMovementBtn')}</span>
            </button>
          </div>
        </div>
      </div>

      <nav class="header-nav-strip">
        <div class="container">
          <div class="nav-strip-inner">
            <div class="nav-sections-scroll" id="nav-sections-scroll">
              ${navLinksHtml}
              <a href="/events.html" class="nav-sec-link ${currentPath.includes('events') ? 'active' : ''}" style="color:var(--gold-accent);">
                🚩 ${currentLang === 'bn' ? 'সংহতি ক্যালেন্ডার' : 'Solidarity Events'}
              </a>
            </div>
          </div>
        </div>
      </nav>
    `;

    // Safe drag scroll without preventing standard clicks
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
            <img src="assets/images/logo.svg" alt="The Way" style="height:44px; filter:brightness(1.1);" onerror="this.src='logo.svg'">
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
              <li><a href="/events.html">🚩 সংহতি ক্যালেন্ডার (Events)</a></li>
              <li><a href="javascript:void(0)" onclick="TheWayComponents.openModal('action-modal')">✊ সংগঠিত হোন (Join Hub)</a></li>
              <li><a href="javascript:void(0)" onclick="TheWayComponents.openModal('submit-modal')">✍️ লেখা পাঠান (Submit Essay)</a></li>
              <li><a href="/section.html?sec=manifestos-archives">📜 ইশতেহার ও দলিল সম্ভার</a></li>
              <li><a href="/admin-login.html" style="color:var(--gold-bright);">🔒 এডিটোরিয়াল পোর্টাল (Admin)</a></li>
            </ul>
          </div>

          <div class="footer-newsletter-col">
            <h4 class="footer-col-title">${dict.newsletterTitle}</h4>
            <p style="font-size:0.85rem; color:#9ca3af; margin-bottom:1rem;">${dict.newsletterDesc}</p>
            <form onsubmit="event.preventDefault(); alert('ধন্যবাদ! আপনার সাবস্ক্রিপশন সম্পন্ন হয়েছে।');" class="subscribe-form-row">
              <input type="email" placeholder="${dict.emailPlaceholder}" required class="subscribe-input" style="background:#161b22; color:#fff; border-color:#374151;">
              <button type="submit" class="btn-solid-crimson" style="padding:0.5rem 0.85rem; font-size:0.8rem;">${dict.subscribeBtn}</button>
            </form>
          </div>
        </div>

        <div class="footer-bottom-bar">
          <div>${dict.copyright}</div>
          <div style="display:flex; gap:1.2rem;">
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
          <h3 style="font-family:var(--font-bengali-serif); font-size:1.4rem; margin-bottom:1.5rem;">🌐 ভাষা নির্বাচন করুন / Select Language</h3>
          <div style="display:flex; flex-direction:column; gap:0.75rem;">
            <button class="btn-solid-crimson" style="justify-content:center;" onclick="TheWayComponents.setLanguage('bn'); TheWayComponents.closeModal('lang-modal');">
              🇧🇩 বাংলা (Bengali)
            </button>
            <button class="btn-quote-action" style="justify-content:center; color:var(--text-primary); border-color:var(--border-strong);" onclick="TheWayComponents.setLanguage('en'); TheWayComponents.closeModal('lang-modal');">
              🌍 English (International)
            </button>
            <button class="btn-quote-action" style="justify-content:center; color:var(--text-primary); border-color:var(--border-strong);" onclick="TheWayComponents.setLanguage('es'); TheWayComponents.closeModal('lang-modal');">
              🇪🇸 Español (Spanish)
            </button>
          </div>
        </div>
      </div>

      <!-- Action Center Modal -->
      <div class="theway-modal-backdrop" id="action-modal">
        <div class="modal-window" style="max-width:540px;">
          <button class="modal-close-btn" onclick="TheWayComponents.closeModal('action-modal')">✕</button>
          <h3 style="font-family:var(--font-bengali-serif); font-size:1.6rem; color:var(--crimson-primary); margin-bottom:0.5rem;">
            ✊ সংগঠিত হোন — গণআন্দোলনের সংহতি মঞ্চ
          </h3>
          <p style="font-size:0.92rem; color:var(--text-secondary); margin-bottom:1.5rem;">
            নব্য-সাম্রাজ্যবাদী ও নব্য-উদারবাদী বিশ্ব ব্যবস্থার বিরুদ্ধে শ্রমজীবী মানুষের মুক্তিকামী ফ্রন্টে যোগ দিন।
          </p>
          <form onsubmit="event.preventDefault(); alert('ধন্যবাদ! আপনার সংহতি বার্তা নিবন্ধিত হয়েছে। আমাদের প্রতিনিধি যোগাযোগ করবেন।'); TheWayComponents.closeModal('action-modal');" style="display:flex; flex-direction:column; gap:1rem;">
            <div>
              <label style="display:block; font-size:0.82rem; font-weight:700; margin-bottom:0.3rem;">আপনার নাম</label>
              <input type="text" required class="subscribe-input" style="width:100%;">
            </div>
            <div>
              <label style="display:block; font-size:0.82rem; font-weight:700; margin-bottom:0.3rem;">ইমেইল ঠিকানা</label>
              <input type="email" required class="subscribe-input" style="width:100%;">
            </div>
            <div>
              <label style="display:block; font-size:0.82rem; font-weight:700; margin-bottom:0.3rem;">আপনি কীভাবে যুক্ত হতে চান?</label>
              <select class="subscribe-input" style="width:100%;">
                <option>তাত্ত্বিক গবেষণা ও লেখালেখি</option>
                <option>সমাজতান্ত্রিক পাঠচক্র পরিচালনা</option>
                <option>শ্রমিক ও কৃষক সংহতি কার্যক্রম</option>
                <option>অনুবাদ ও আন্তর্জাতিক যোগাযোগ</option>
              </select>
            </div>
            <button type="submit" class="btn-solid-crimson" style="justify-content:center; padding:0.75rem; font-size:1rem; margin-top:0.5rem;">
              সংহতি নিবন্ধন করুন
            </button>
          </form>
        </div>
      </div>

      <!-- Search Modal -->
      <div class="theway-modal-backdrop" id="search-modal">
        <div class="modal-window">
          <button class="modal-close-btn" onclick="TheWayComponents.closeModal('search-modal')">✕</button>
          <div style="display:flex; align-items:center; gap:0.5rem; border-bottom:2px solid var(--crimson-primary); padding-bottom:0.5rem; margin-bottom:1.2rem;">
            <span style="font-size:1.3rem;">🔍</span>
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
          <h3 style="font-family:var(--font-bengali-serif); font-size:1.6rem; color:var(--crimson-primary); margin-bottom:0.5rem;">
            ✍️ লেখা পাঠান — সম্পাদকীয় পর্ষদ
          </h3>
          <p style="font-size:0.88rem; color:var(--text-secondary); margin-bottom:1.2rem;">
            সমাজতন্ত্র, রাজনৈতিক অর্থনীতি, সাম্রাজ্যবাদ বিরোধিতা, শ্রম আন্দোলন কিংবা গণসংস্কৃতি বিষয়ক প্রবন্ধ পাঠান।
          </p>
          <form onsubmit="event.preventDefault(); alert('আপনার লেখা সম্পাদকীয় পর্ষদে পাঠানো হয়েছে। ধন্যবাদ!'); TheWayComponents.closeModal('submit-modal');" style="display:flex; flex-direction:column; gap:0.85rem;">
            <input type="text" placeholder="প্রবন্ধের শিরোনাম" required class="subscribe-input">
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.85rem;">
              <input type="text" placeholder="আপনার নাম" required class="subscribe-input">
              <input type="email" placeholder="ইমেইল ঠিকানা" required class="subscribe-input">
            </div>
            <textarea placeholder="প্রবন্ধের সারসংক্ষেপ বা মূল ড্রাফট..." rows="5" required class="subscribe-input" style="resize:vertical;"></textarea>
            <button type="submit" class="btn-solid-crimson" style="justify-content:center; padding:0.7rem;">জমা দিন</button>
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
        const matches = articles.filter(a => 
          (a.title || '').toLowerCase().includes(query) ||
          (a.deck || '').toLowerCase().includes(query) ||
          (a.tags || '').toLowerCase().includes(query) ||
          (a.author || '').toLowerCase().includes(query)
        );

        if (matches.length === 0) {
          searchResults.innerHTML = `<p style="font-size:0.88rem; color:var(--text-muted); text-align:center; padding:2rem 0;">কোনো প্রবন্ধ পাওয়া যায়নি।</p>`;
          return;
        }

        searchResults.innerHTML = matches.map(a => `
          <a href="/article.html?slug=${a.slug}" style="display:block; padding:0.75rem 1rem; background:var(--bg-body); border:1px solid var(--border-color); border-radius:var(--radius-sm); transition:all 0.15s ease;">
            <div style="font-size:0.75rem; font-weight:700; color:var(--crimson-primary); text-transform:uppercase;">${a.section_name || a.section}</div>
            <div style="font-family:var(--font-bengali-serif); font-size:1.05rem; font-weight:700; color:var(--text-primary); margin:0.2rem 0;">${a.title}</div>
            <div style="font-size:0.8rem; color:var(--text-muted);">${a.author} • ${a.deck ? a.deck.slice(0, 75) + '...' : ''}</div>
          </a>
        `).join('');
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

  function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('open');
  }

  function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('open');
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
    t,
    setLanguage,
    getLanguage: () => currentLang,
    toBengaliDigits,
    toggleTheme,
    openModal,
    closeModal,
    closeAllModals,
    renderAll: renderAllComponents
  };

})(typeof window !== 'undefined' ? window : this);
