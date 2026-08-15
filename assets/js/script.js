/**
 * THE WAY (দ্য ওয়ে) — Homepage Dynamic Controller
 * International Socialist Editorial & Movement Portal
 */

(function() {
  'use strict';

  let currentQuoteIndex = 0;

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
          <img src="${leadArticle.hero_img_url || 'assets/images/img1.png'}" alt="${leadArticle.hero_img_alt || leadArticle.title}">
          <span class="lead-section-badge">${leadArticle.section_name || leadArticle.section}</span>
        </a>
        <div class="lead-story-body">
          <h1 class="lead-story-title">
            <a href="/article.html?slug=${leadArticle.slug}">${leadArticle.title}</a>
          </h1>
          <p class="lead-story-deck">${leadArticle.deck || ''}</p>
          <div class="story-meta-row">
            <div class="author-meta">
              <img src="${leadArticle.author_photo_url || 'assets/images/img1.png'}" alt="${leadArticle.author}" class="author-avatar">
              <span>${leadArticle.author}</span>
            </div>
            <span>•</span>
            <span>⏱️ ${readTimeStr}</span>
            <span>•</span>
            <span>📅 ${new Date(leadArticle.published_at || leadArticle.created_at || Date.now()).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US')}</span>
          </div>
        </div>
      </article>
    `;

    const secondaryHtml = secondaryArticles.map(art => {
      const readTime = getEstimatedReadTime(art.content_html, art.deck);
      return `
        <article class="secondary-story-card">
          <a href="/article.html?slug=${art.slug}" class="sec-story-thumb">
            <img src="${art.hero_img_url || 'assets/images/img2.png'}" alt="${art.title}">
          </a>
          <div class="sec-story-content">
            <span class="sec-badge">${art.section_name || art.section}</span>
            <h3 class="sec-title">
              <a href="/article.html?slug=${art.slug}">${art.title}</a>
            </h3>
            <div class="sec-meta">
              <span>${art.author}</span> • <span>⏱️ ${toBn(readTime)} ${lang === 'bn' ? 'মিনিট' : 'min'}</span>
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
        <span class="quote-badge-tag">★ ${lang === 'bn' ? 'আজকের বৈপ্লবিক চিন্তা' : 'THOUGHT OF THE DAY'}</span>
        <div class="quote-text-main">“${quoteText}”</div>
        <div class="quote-author-row">
          <div class="quote-author-info">
            <strong>${q.author}</strong>
            <span>${q.source}</span>
          </div>
          <div class="quote-actions-btns">
            <button class="btn-quote-action" id="copy-quote-btn">📋 ${lang === 'bn' ? 'উদ্ধৃতি কপি' : 'Copy Quote'}</button>
            <button class="btn-quote-action" id="next-quote-btn">🔄 ${lang === 'bn' ? 'পরবর্তী চিন্তা' : 'Next Thought'}</button>
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
              <img src="${art.hero_img_url || 'assets/images/img3.png'}" alt="${art.title}">
            </a>
            <div class="card-body-content">
              <span class="card-tag-pill">${secTitle}</span>
              <h3 class="card-heading">
                <a href="/article.html?slug=${art.slug}">${art.title}</a>
              </h3>
              <p class="card-excerpt">${art.deck || ''}</p>
              <div class="card-footer-meta">
                <span>✍️ ${art.author}</span>
                <span>⏱️ ${toBn(readTime)} ${lang === 'bn' ? 'মিনিট' : 'min'}</span>
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

  async function initHomepage() {
    const articles = await loadArticles();
    renderHeroSection(articles);
    renderRevolutionaryQuote();
    renderSectionGrids(articles);
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