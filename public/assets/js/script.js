/**
 * THE WAY (দ্য ওয়ে) — Homepage Dynamic Controller
 * International Socialist Editorial & Movement Portal
 */

(function() {
  'use strict';

  let currentQuoteIndex = 0;

  const ICONS = {
    clock: `<svg class="svg-inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
    calendar: `<svg class="svg-inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
    quill: `<svg class="svg-inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>`,
    copy: `<svg class="svg-inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`,
    refresh: `<svg class="svg-inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>`,
    book: `<svg class="svg-inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
    star: `<svg class="svg-inline-icon" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`
  };

  async function loadArticles() {
    let articles = (window.THE_WAY_CONFIG && window.THE_WAY_CONFIG.defaultArticles) || [];
    try {
      const res = await fetch('/api/articles?action=list');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          articles = data;
        }
      }
    } catch (e) {
      console.warn('[TheWay] Using default inaugural articles fallback');
    }
    return articles;
  }

  function getEstimatedReadTime(contentHtml, deck) {
    const text = (contentHtml || '') + ' ' + (deck || '');
    const clean = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const words = clean.split(' ').length;
    const minutes = Math.max(1, Math.ceil(words / 180));
    return minutes;
  }

  function renderHeroSection(articles) {
    const heroMount = document.getElementById('hero-editorial-mount');
    if (!heroMount || articles.length === 0) return;

    const leadArticle = articles[0];
    const secondaryArticles = articles.slice(1, 4);

    const lang = window.TheWayComponents ? window.TheWayComponents.getLanguage() : 'bn';
    const toBn = window.TheWayComponents ? window.TheWayComponents.toBengaliDigits : (n) => n;

    const leadReadTime = getEstimatedReadTime(leadArticle.content_html, leadArticle.deck);
    const readTimeStr = `${toBn(leadReadTime)} ${lang === 'bn' ? 'মিনিট পাঠ' : 'min read'}`;

    const leadHtml = `
      <article class="lead-story-card">
        <a href="/article.html?slug=${leadArticle.slug}" class="lead-story-media">
          <img loading="lazy" src="${leadArticle.hero_img_url || 'assets/images/img1.webp'}" alt="${leadArticle.hero_img_alt || leadArticle.title}">
          <span class="lead-section-badge">${leadArticle.section_name || leadArticle.section}</span>
        </a>
        <div class="lead-story-body">
          <h1 class="lead-story-title">
            <a href="/article.html?slug=${leadArticle.slug}">${leadArticle.title}</a>
          </h1>
          <p class="lead-story-deck">${leadArticle.deck || ''}</p>
          <div class="story-meta-row">
            <div class="author-meta">
              <img loading="lazy" src="${leadArticle.author_photo_url || 'assets/images/img1.webp'}" alt="${leadArticle.author}" class="author-avatar">
              <span>${leadArticle.author}</span>
            </div>
            <span>•</span>
            <span>${ICONS.clock} ${readTimeStr}</span>
            <span>•</span>
            <span>${ICONS.calendar} ${new Date(leadArticle.published_at || leadArticle.created_at || Date.now()).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US')}</span>
          </div>
        </div>
      </article>
    `;

    const secondaryHtml = secondaryArticles.map(art => {
      const readTime = getEstimatedReadTime(art.content_html, art.deck);
      return `
        <article class="secondary-story-card">
          <a href="/article.html?slug=${art.slug}" class="sec-story-thumb">
            <img loading="lazy" src="${art.hero_img_url || 'assets/images/img2.webp'}" alt="${art.title}">
          </a>
          <div class="sec-story-content">
            <span class="sec-badge">${art.section_name || art.section}</span>
            <h3 class="sec-title">
              <a href="/article.html?slug=${art.slug}">${art.title}</a>
            </h3>
            <div class="sec-meta">
              <span>${art.author}</span> • <span>${ICONS.clock} ${toBn(readTime)} ${lang === 'bn' ? 'মিনিট' : 'min'}</span>
            </div>
          </div>
        </article>
      `;
    }).join('');

    heroMount.innerHTML = `
      <div class="hero-editorial-grid">
        ${leadHtml}
        <div class="hero-secondary-col">
          ${secondaryHtml}
        </div>
      </div>
    `;
  }

  function renderRevolutionaryQuote() {
    const quoteMount = document.getElementById('revolutionary-quote-mount');
    if (!quoteMount) return;

    const quotes = (window.THE_WAY_CONFIG && window.THE_WAY_CONFIG.revolutionaryQuotes) || [];
    if (quotes.length === 0) return;

    const lang = window.TheWayComponents ? window.TheWayComponents.getLanguage() : 'bn';
    const q = quotes[currentQuoteIndex % quotes.length];

    const quoteText = lang === 'bn' ? q.quote_bn : q.quote_en;

    quoteMount.innerHTML = `
      <div class="revolutionary-quote-banner">
        <span class="quote-badge-tag"><span style="color:var(--gold-bright);">${ICONS.star}</span> ${lang === 'bn' ? 'আজকের বৈপ্লবিক চিন্তা' : 'THOUGHT OF THE DAY'}</span>
        <div class="quote-text-main">“${quoteText}”</div>
        <div class="quote-author-row">
          <div class="quote-author-info">
            <strong>${q.author}</strong>
            <span>${q.source}</span>
          </div>
          <div class="quote-actions-btns">
            <button class="btn-quote-action" id="copy-quote-btn">${ICONS.copy} ${lang === 'bn' ? 'উদ্ধৃতি কপি' : 'Copy Quote'}</button>
            <button class="btn-quote-action" id="next-quote-btn">${ICONS.refresh} ${lang === 'bn' ? 'পরবর্তী চিন্তা' : 'Next Thought'}</button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('copy-quote-btn')?.addEventListener('click', () => {
      navigator.clipboard.writeText(`“${quoteText}” — ${q.author} (${q.source})`);
      alert(lang === 'bn' ? 'উদ্ধৃতি কপি হয়েছে!' : 'Quote copied to clipboard!');
    });

    document.getElementById('next-quote-btn')?.addEventListener('click', () => {
      currentQuoteIndex++;
      renderRevolutionaryQuote();
    });
  }

  function renderSectionGrids(articles) {
    const gridsMount = document.getElementById('editorial-sections-mount');
    if (!gridsMount) return;

    const lang = window.TheWayComponents ? window.TheWayComponents.getLanguage() : 'bn';
    const toBn = window.TheWayComponents ? window.TheWayComponents.toBengaliDigits : (n) => n;

    // Group articles by section
    const grouped = {};
    articles.forEach(art => {
      const sec = art.section || 'theory-philosophy';
      if (!grouped[sec]) grouped[sec] = [];
      grouped[sec].push(art);
    });

    const sections = (window.THE_WAY_CONFIG && window.THE_WAY_CONFIG.defaultSections) || [];
    const validSections = sections.filter(s => s.slug !== 'all');

    let html = '';
    validSections.forEach(sec => {
      const secArticles = grouped[sec.slug] || [];
      if (secArticles.length === 0) return;

      const secTitle = lang === 'bn' ? (sec.name || sec.name_en) : (sec.name_en || sec.name);
      const cardsHtml = secArticles.slice(0, 3).map(art => {
        const readTime = getEstimatedReadTime(art.content_html, art.deck);
        return `
          <article class="standard-article-card">
            <a href="/article.html?slug=${art.slug}" class="card-media-wrapper">
              <img loading="lazy" src="${art.hero_img_url || 'assets/images/img3.webp'}" alt="${art.title}">
            </a>
            <div class="card-body-content">
              <span class="card-tag-pill">${secTitle}</span>
              <h3 class="card-heading">
                <a href="/article.html?slug=${art.slug}">${art.title}</a>
              </h3>
              <p class="card-excerpt">${art.deck || ''}</p>
              <div class="card-footer-meta">
                <span>${ICONS.quill} ${art.author}</span>
                <span>${ICONS.clock} ${toBn(readTime)} ${lang === 'bn' ? 'মিনিট' : 'min'}</span>
              </div>
            </div>
          </article>
        `;
      }).join('');

      html += `
        <section class="editorial-section-block">
          <div class="section-header-row">
            <h2 class="section-title-large">${secTitle}</h2>
            <a href="/section.html?sec=${sec.slug}" class="section-view-all-link">
              ${lang === 'bn' ? 'আরও পড়ুন' : 'View All'} →
            </a>
          </div>
          <div class="articles-triplet-grid">
            ${cardsHtml}
          </div>
        </section>
      `;
    });

    gridsMount.innerHTML = html;
  }

  function renderBooksShowcase() {
    const booksMount = document.getElementById('books-showcase-mount');
    if (!booksMount || !window.THE_WAY_BOOKS) return;

    const lang = window.TheWayComponents ? window.TheWayComponents.getLanguage() : 'bn';
    const books = window.THE_WAY_BOOKS.getAllBooks().slice(0, 3);
    const toBn = window.TheWayComponents ? window.TheWayComponents.toBengaliDigits : (n) => n;

    const cardsHtml = books.map(book => {
      const extra = window.THE_WAY_BOOKS.getExtra ? window.THE_WAY_BOOKS.getExtra(book.id) : {};
      const catTitle = book.cat === 'marx' ? 'মার্কস–এঙ্গেলস' :
                       book.cat === 'lenin' ? 'লেনিন ও রুশ বিপ্লব' :
                       book.cat === 'fiction' ? 'উপন্যাস ও সাহিত্য' : 'ধ্রুপদী সাহিত্য';
      const catColor = book.cat === 'marx' ? 'var(--crimson-primary)' :
                       book.cat === 'lenin' ? '#274b8f' :
                       book.cat === 'fiction' ? '#7c4063' : '#b9862a';

      return `
        <article class="standard-article-card" style="border: 2px solid #201812; box-shadow: 4px 4px 0 #201812; background: #faf5e7; display: flex; flex-direction: column;">
          <div style="background: ${catColor}; padding: 0.85rem 1.2rem; color: #fff; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.05em;">${catTitle}</span>
            <span style="font-family: 'Oswald', sans-serif; font-size: 0.85rem; font-weight: 700; background: rgba(0,0,0,0.3); padding: 2px 8px; border-radius: 4px;">${toBn(book.year)}</span>
          </div>
          <div class="card-body-content" style="padding: 1.25rem; display: flex; flex-direction: column; flex: 1;">
            <span style="font-size: 0.75rem; font-weight: 700; color: #5d5140; margin-bottom: 0.25rem;">মূল ভাষা: ${book.lang}</span>
            <h3 class="card-heading" style="font-family: 'Anek Bangla', 'Noto Serif Bengali', serif; font-weight: 800; font-size: 1.25rem; margin-bottom: 0.5rem; line-height: 1.3;">
              <a href="/books.html" style="color: #201812; text-decoration: none;">${book.title}</a>
            </h3>
            <p class="card-excerpt" style="font-size: 0.85rem; line-height: 1.6; color: #5d5140; margin-bottom: 1rem; flex: 1;">${book.desc}</p>
            <div class="card-footer-meta" style="margin-top: auto; padding-top: 0.75rem; border-top: 1px dashed rgba(32,24,18,0.25); display: flex; align-items: center; justify-content: space-between;">
              <span style="font-weight: 700; font-size: 0.82rem; color: #201812;">${ICONS.quill} ${book.author}</span>
              <a href="/books.html" style="background: var(--crimson-primary); color: #fff; font-weight: 700; font-size: 0.78rem; padding: 4px 10px; border-radius: 4px; text-decoration: none;">পড়ুন ★</a>
            </div>
          </div>
        </article>
      `;
    }).join('');

    booksMount.innerHTML = `
      <div class="section-header-row">
        <div>
          <h2 class="section-title-large" style="display: flex; align-items: center; gap: 0.5rem;">
            <svg viewBox="0 0 100 100" style="width: 22px; height: 22px; color: var(--crimson-primary);" fill="currentColor">
              <path d="M50 2 61.8 36.2 98 36.6 69 58.3 79.4 93 50 72 20.6 93 31 58.3 2 36.6 38.2 36.2Z" />
            </svg>
            লাল পাঠাগার (Laal Pathagar) — মুক্ত ধ্রুপদী সংগ্রহশালা
          </h2>
          <p style="font-size: 0.92rem; color: var(--text-secondary); margin-top: 0.2rem;">কমিউনিস্ট ইশতেহার, দাস ক্যাপিটাল, ম্যাক্সিম গোর্কির মা ও বৈপ্লবিক সাহিত্যের ডিজিটাল মুক্ত ভাণ্ডার</p>
        </div>
        <a href="/books.html" class="section-view-all-link" style="color: var(--crimson-primary); font-weight: 700;">
          ${lang === 'bn' ? 'সকল বই দেখুন' : 'Explore All Books'} →
        </a>
      </div>
      <div class="articles-triplet-grid">
        ${cardsHtml}
      </div>
    `;
  }

  async function renderHomepagePeople() {
    const mount = document.getElementById('homepage-people-grid');
    if (!mount) return;

    let people = [];
    try {
      const res = await fetch('/api/network?action=people');
      if (res.ok) {
        const d = await res.json();
        people = d.profiles || [];
      }
    } catch(e) {}

    if (people.length === 0) {
      people = [
        { name: 'সম্পাদকীয় পর্ষদ', role: 'দ্য ওয়ে কেন্দ্রীয় ব্যুরো', bio: 'মার্ক্সবাদী দর্শন ও আন্তর্জাতিক সংহতি প্ল্যাটফর্ম।', country: 'আন্তর্জাতিক', country_flag: '🚩' },
        { name: 'অ্যাডমিন প্যানেল', role: 'প্রযুক্তি ও প্রকাশনা টিম', bio: 'মুক্ত প্রকাশনা, ডিজিটাল মহাফেজখানা ও যোগাযোগ নেটওয়ার্ক।', country: 'বাংলাদেশ', country_flag: '🇧🇩' },
        { name: 'পাঠচক্র সমন্বয় পরিষদ', role: 'অধ্যয়ন ও বিস্তার', bio: 'স্থানীয় ও বৈশ্বিক পাঠচক্র সঞ্চালনা ও তাত্ত্বিক কর্মশালা।', country: 'আন্তর্জাতিক', country_flag: '✊' }
      ];
    }

    mount.innerHTML = people.slice(0, 4).map(p => `
      <div class="profile-card">
        <div class="profile-card-avatar">
          <span>${(p.name || 'TW')[0]}</span>
        </div>
        <div class="profile-card-name">${p.name}</div>
        <div class="profile-card-location">
          <span>${p.country_flag || '🚩'}</span>
          <span>${p.country || 'আন্তর্জাতিক'}</span>
        </div>
        <div style="font-size:0.8rem; color:var(--gold-bright); font-weight:600; margin-bottom:0.4rem;">${p.role || 'Contributor'}</div>
        <p style="font-size:0.8rem; color:rgba(255,255,255,0.6); line-height:1.4; margin-bottom:0.8rem;">${p.bio || ''}</p>
        <div class="profile-card-actions">
          <a href="/directory.html" class="btn-follow" style="text-align:center; text-decoration:none;">প্রোফাইল দেখুন</a>
        </div>
      </div>
    `).join('');
  }

  async function renderHomepageGroups() {
    const mount = document.getElementById('homepage-groups-grid');
    if (!mount) return;

    let groups = [];
    try {
      const res = await fetch('/api/network?action=groups');
      if (res.ok) {
        const d = await res.json();
        groups = d.groups || [];
      }
    } catch(e) {}

    if (groups.length === 0) {
      groups = [
        { id: 'grp_1', name_bn: 'মার্ক্সবাদী রাজনৈতিক অর্থনীতি পাঠচক্র', category: 'Theory', members_count: 142, description: "দাস ক্যাপিটাল ও সাম্রাজ্যবাদ তত্ত্বের সাপ্তাহিক যৌথ পাঠ।" },
        { id: 'grp_2', name_bn: 'বাংলা সমাজতান্ত্রিক পাঠশালা', category: 'Philosophy', members_count: 320, description: 'ঐতিহাসিক বস্তুবাদ ও উপমহাদেশের সমাজতান্ত্রিক আন্দোলনের ইতিহাস।' },
        { id: 'grp_3', name_bn: 'শ্রমিক মুক্তি ও ট্রেড ইউনিয়ন সংহতি', category: 'Labor', members_count: 215, description: 'পোশাক শ্রমিক, কৃষক ও মেহনতি মানুষের অধিকার আন্দোলন।' }
      ];
    }

    mount.innerHTML = groups.slice(0, 3).map(g => `
      <div class="group-card">
        <div class="group-card-icon">📚</div>
        <div class="group-card-name">${g.name_bn || g.name}</div>
        <div class="group-card-desc">${g.description || ''}</div>
        <div class="group-card-stats">
          <span class="group-card-stat"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg> ${g.members_count || 1} জন সদস্য</span>
        </div>
        <div class="group-card-langs">
          <span class="lang-badge">${(g.lang || 'bn').toUpperCase()}</span>
          <span class="ideology-tag">${g.category || 'Marxism'}</span>
        </div>
        <a href="/groups.html" class="btn-join-group" style="text-align:center; text-decoration:none; display:block;">যোগ দিন</a>
      </div>
    `).join('');
  }

  function renderHomepageEvents() {
    const mount = document.getElementById('homepage-events-grid');
    if (!mount) return;

    const events = [
      { title: 'Capital Vol. I পাঠচক্র — পর্ব ১', date: '২৫ সেপ্টেম্বর ২০২৬', time: 'রাত ৮টা (IST)', type: 'পাঠচক্র', lang: 'বাংলা', mode: 'অনলাইন' },
      { title: 'State and Revolution Reading Group', date: '২৮ সেপ্টেম্বর ২০২৬', time: 'সন্ধ্যা ৬টা (UTC)', type: 'Study Circle', lang: 'English', mode: 'Online' },
      { title: 'Labour Rights Webinar: Gig Economy', date: '২ অক্টোবর ২০২৬', time: 'বিকেল ৪টা (UTC)', type: 'Webinar', lang: 'English', mode: 'Online' }
    ];

    mount.innerHTML = events.map(e => `
      <div class="event-card">
        <span class="event-date-badge">📅 ${e.date} · ${e.time}</span>
        <div class="event-card-title">${e.title}</div>
        <div class="event-card-meta">
          <span><span class="lang-badge">${e.lang}</span></span>
        </div>
        <div class="event-card-footer">
          <span class="event-type-badge">${e.type}</span>
          <span class="event-mode-badge">🌐 ${e.mode}</span>
        </div>
      </div>
    `).join('');
  }

  async function renderHomepageSolidarity() {
    const mount = document.getElementById('solidarity-grid');
    if (!mount) return;

    let campaigns = [];
    try {
      const res = await fetch('/api/network?action=solidarity');
      if (res.ok) {
        const d = await res.json();
        campaigns = d.requests || [];
      }
    } catch(e) {}

    if (campaigns.length === 0) {
      campaigns = [
        {
          id: 'sol_1',
          title: 'Hellenic Steel Strike Solidarity',
          organization: 'Hellenic Federation of Metalworkers',
          country: 'Greece',
          country_flag: '🇬🇷',
          pledges_count: 28,
          description: 'Workers striking for collective bargaining agreements, workplace safety guarantees, and wage indexation.'
        },
        {
          id: 'sol_2',
          title: 'আশুলিয়া পোশাক শ্রমিক আইনি প্রতিরক্ষা ও সহায়তা',
          organization: 'বাংলাদেশ গার্মেন্টস শ্রমিক সংগ্রাম পরিষদ',
          country: 'Bangladesh',
          country_flag: '🇧🇩',
          pledges_count: 45,
          description: 'ন্যূনতম মজুরি ২৫,০০০ টাকা এবং মিথ্যা মামলা প্রত্যাহারের দাবিতে আন্দোলনরত শ্রমিকদের পাশে সংহতি।'
        }
      ];
    }

    mount.innerHTML = campaigns.slice(0, 2).map(c => `
      <div class="sol-card" style="background: linear-gradient(145deg, rgba(20,8,8,0.9) 0%, rgba(15,5,5,0.95) 100%); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 1.25rem;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:0.5rem; margin-bottom:0.5rem;">
          <div>
            <span style="font-size:0.8rem; color:var(--crimson-primary); font-weight:700;">${c.country_flag || '🚩'} ${c.organization} · ${c.country}</span>
            <h3 style="font-size:1.15rem; font-weight:800; color:#fff; margin-top:0.2rem;">${c.title}</h3>
          </div>
          <span style="font-size:0.75rem; background:rgba(34,197,94,0.15); color:#4ade80; padding:0.2rem 0.6rem; border-radius:20px; font-weight:700;">✊ ${c.pledges_count || 0} জন সংহতি</span>
        </div>
        <p style="color:rgba(255,255,255,0.7); font-size:0.88rem; line-height:1.5; margin-bottom:1rem;">${c.description}</p>
        <a href="/feed.html?type=solidarity_request" class="btn-solid-crimson" style="padding:0.4rem 0.9rem; font-size:0.8rem; text-decoration:none; display:inline-block;">সংহতি জানান →</a>
      </div>
    `).join('');
  }

  async function initHomepage() {
    const articles = await loadArticles();
    renderHeroSection(articles);
    renderRevolutionaryQuote();
    renderSectionGrids(articles);
    renderBooksShowcase();
    renderHomepagePeople();
    renderHomepageGroups();
    renderHomepageEvents();
    renderHomepageSolidarity();
  }

  // Hook into language change
  window.onTheWayLanguageChange = function() {
    initHomepage();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHomepage);
  } else {
    initHomepage();
  }

})();