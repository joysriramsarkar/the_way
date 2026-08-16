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

    const cardsHtml = books.map(book => `
      <article class="standard-article-card" style="border-top: 3px solid var(--crimson-primary);">
        <div style="background:${book.cover_color}; height:140px; padding:1.2rem; color:#fff; display:flex; justify-content:space-between; align-items:flex-start; border-radius:var(--radius-sm) var(--radius-sm) 0 0;">
          <span style="background:rgba(0,0,0,0.4); padding:3px 8px; border-radius:var(--radius-full); font-size:0.75rem; font-weight:700;">${book.category_name_bn}</span>
          <span style="display:inline-flex; align-items:center; justify-content:center; width:36px; height:36px; background:rgba(255,255,255,0.18); border-radius:8px;">
            ${ICONS.book}
          </span>
        </div>
        <div class="card-body-content">
          <span class="card-tag-pill" style="color:var(--crimson-primary);">${book.year}</span>
          <h3 class="card-heading">
            <a href="/book-reader.html?book=${book.slug}">${book.title_bn}</a>
          </h3>
          <p class="card-excerpt">${book.summary_bn}</p>
          <div class="card-footer-meta" style="margin-top:auto; padding-top:0.8rem; border-top:1px dashed var(--border-color);">
            <span>${ICONS.quill} ${book.authors.map(a=>a.name).join(' ও ')}</span>
            <a href="/book-reader.html?book=${book.slug}" style="color:var(--crimson-primary); font-weight:700; text-decoration:none;">পড়ুন →</a>
          </div>
        </div>
      </article>
    `).join('');

    booksMount.innerHTML = `
      <div class="section-header-row">
        <div>
          <h2 class="section-title-large">${ICONS.book} বিপ্লবী ধ্রুপদী পাঠাগার (Marxist Classics)</h2>
          <p style="font-size:0.92rem; color:var(--text-secondary); margin-top:0.2rem;">কমিউনিস্ট ম্যানিফেস্টো, ম্যাক্সিম গোর্কির মা ও মার্ক্সীয় তত্ত্বের ডিজিটাল উন্মুক্ত রূপ</p>
        </div>
        <a href="/books.html" class="section-view-all-link" style="color:var(--crimson-primary);">
          ${lang === 'bn' ? 'সকল বই দেখুন' : 'Explore All Books'} →
        </a>
      </div>
      <div class="articles-triplet-grid">
        ${cardsHtml}
      </div>
    `;
  }

  async function initHomepage() {
    const articles = await loadArticles();
    renderHeroSection(articles);
    renderRevolutionaryQuote();
    renderSectionGrids(articles);
    renderBooksShowcase();
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