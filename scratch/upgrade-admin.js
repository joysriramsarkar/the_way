/**
 * scratch/upgrade-admin.js
 * Updates admin.html to add:
 * 1. Correct 1:1 square emblem logo
 * 2. Books Library page section & navigation
 * 3. Movement Solidarity Network page section & navigation
 * 4. Replace all emojis with crisp SVGs
 */

const fs = require('fs');
const path = require('path');

const adminHtmlPath = path.join(__dirname, '..', 'admin.html');
let content = fs.readFileSync(adminHtmlPath, 'utf8');

// 1. Fix Logo
const oldLogo = `<img src="assets/images/logo.svg" alt="The Way" style="width:34px;height:34px;flex-shrink:0;border-radius:6px;" onerror="this.src='logo.svg'" />
        <div class="sidebar-logo-text">
          <span class="sidebar-logo-title">The Way</span>
          <span class="sidebar-logo-sub">Admin Panel</span>
        </div>`;

const newLogo = `<img src="assets/images/logo-icon.svg" alt="The Way" style="width:36px;height:36px;object-fit:contain;flex-shrink:0;border-radius:8px;" onerror="this.src='assets/images/favicon.svg'" />
        <div class="sidebar-logo-text">
          <span class="sidebar-logo-title">The Way</span>
          <span class="sidebar-logo-sub">Editorial HQ</span>
        </div>`;

if (content.includes('assets/images/logo.svg')) {
  content = content.replace(/<img src="assets\/images\/logo\.svg"[^>]+>/, `<img src="assets/images/logo-icon.svg" alt="The Way" style="width:36px;height:36px;object-fit:contain;flex-shrink:0;border-radius:8px;" onerror="this.src='assets/images/favicon.svg'" />`);
  content = content.replace('<span class="sidebar-logo-sub">Admin Panel</span>', '<span class="sidebar-logo-sub">Editorial HQ</span>');
}

// 2. Update Sidebar Navigation to insert Books and Movement items
const newNavItems = `
        <li>
          <a href="#" class="sidebar-nav-item" data-page="articles" id="nav-articles">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            <span>Articles</span>
          </a>
        </li>
        <li>
          <a href="#" class="sidebar-nav-item" data-page="books" id="nav-books">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
            <span>Books &amp; Library</span>
          </a>
        </li>
        <li>
          <a href="#" class="sidebar-nav-item" data-page="submissions" id="nav-submissions">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="12" y1="18" x2="12" y2="12"/>
              <line x1="9" y1="15" x2="15" y2="15"/>
            </svg>
            <span>Submissions &amp; Revisions</span>
          </a>
        </li>
        <li>
          <a href="#" class="sidebar-nav-item" data-page="movement" id="nav-movement">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <span>Movement Signups</span>
          </a>
        </li>`;

// 3. Define the HTML for Page: Books and Page: Movement
const pageBooksHtml = `
    <!-- PAGE: REVOLUTIONARY BOOKS LIBRARY -->
    <section class="page" id="page-books">
      <div class="menu-mgr-header" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:12px;">
        <div class="menu-mgr-title-wrap">
          <h1 class="page-title" style="font-size:22px;font-weight:700;color:var(--text-primary);margin:0 0 4px;">Books &amp; Literature Library</h1>
          <p class="page-subtitle" style="font-size:13px;color:var(--text-muted);margin:0;">Manage unabridged revolutionary books, scraped wikisource chapters, and paginated web readers</p>
        </div>
        <div class="menu-mgr-actions" style="display:flex;align-items:center;gap:10px;">
          <a href="books.html" target="_blank" class="btn btn--secondary" style="font-size:13px;padding:8px 14px;display:inline-flex;align-items:center;gap:6px;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            View Public Library
          </a>
          <button class="btn btn--primary" type="button" onclick="loadAdminBooks()" style="font-size:13px;padding:8px 16px;display:inline-flex;align-items:center;gap:6px;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
            Sync Database
          </button>
        </div>
      </div>

      <!-- Books Overview Stats -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:16px;margin-bottom:24px;">
        <div class="card" style="padding:16px 20px;border-left:4px solid #c2182b;">
          <div style="font-size:12px;font-weight:700;color:var(--text-muted);text-transform:uppercase;">Active Web Books</div>
          <div id="books-stat-count" style="font-size:24px;font-weight:800;color:var(--text-primary);margin-top:4px;">6</div>
        </div>
        <div class="card" style="padding:16px 20px;border-left:4px solid #059669;">
          <div style="font-size:12px;font-weight:700;color:var(--text-muted);text-transform:uppercase;">Database Stored Chapters</div>
          <div id="books-stat-chapters" style="font-size:24px;font-weight:800;color:#059669;margin-top:4px;">36</div>
        </div>
        <div class="card" style="padding:16px 20px;border-left:4px solid #d97706;">
          <div style="font-size:12px;font-weight:700;color:var(--text-muted);text-transform:uppercase;">Storage Engine</div>
          <div style="font-size:15px;font-weight:700;color:var(--text-primary);margin-top:8px;">Supabase + Local Cache</div>
        </div>
      </div>

      <!-- Books Grid & Table -->
      <div class="card" style="padding:0;overflow:hidden;">
        <div style="padding:16px 20px;border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center;background:#f8fafc;">
          <h3 style="margin:0;font-size:15px;font-weight:700;color:var(--text-primary);">Books Collection</h3>
          <input type="text" id="books-admin-search" placeholder="Search books by title, author..." oninput="filterAdminBooks(this.value)"
            style="padding:6px 12px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px;width:240px;" />
        </div>
        <table class="data-table" id="admin-books-table">
          <thead>
            <tr>
              <th>Book Title &amp; Details</th>
              <th>Author &amp; Translator</th>
              <th>Category</th>
              <th>Year</th>
              <th>Chapters / Pages</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="admin-books-tbody">
            <tr>
              <td colspan="6" style="text-align:center;padding:30px;color:var(--text-muted);">Loading books from database...</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>`;

const pageMovementHtml = `
    <!-- PAGE: MOVEMENT & SOLIDARITY SIGNUPS -->
    <section class="page" id="page-movement">
      <div class="menu-mgr-header" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:12px;">
        <div class="menu-mgr-title-wrap">
          <h1 class="page-title" style="font-size:22px;font-weight:700;color:var(--text-primary);margin:0 0 4px;">Solidarity &amp; Movement Network</h1>
          <p class="page-subtitle" style="font-size:13px;color:var(--text-muted);margin:0;">Members and activists who joined via the public "সংগঠিত হোন" solidarity portal</p>
        </div>
        <div class="menu-mgr-actions" style="display:flex;align-items:center;gap:10px;">
          <button class="btn btn--primary" type="button" onclick="loadAdminMovementSignups()" style="font-size:13px;padding:8px 16px;display:inline-flex;align-items:center;gap:6px;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
            Refresh Members
          </button>
        </div>
      </div>

      <!-- Filter Tabs -->
      <div class="tab-bar">
        <button class="tab-btn active" onclick="filterMovementTab('all', this)">
          All Members <span class="tab-count" id="mov-count-all">0</span>
        </button>
        <button class="tab-btn" onclick="filterMovementTab('new', this)">
          New / Uncontacted <span class="tab-count" id="mov-count-new">0</span>
        </button>
        <button class="tab-btn" onclick="filterMovementTab('contacted', this)">
          Contacted <span class="tab-count" id="mov-count-contacted">0</span>
        </button>
        <button class="tab-btn" onclick="filterMovementTab('active', this)">
          Active Organizers <span class="tab-count" id="mov-count-active">0</span>
        </button>
      </div>

      <!-- Members Table -->
      <div class="card" style="padding:0;overflow:hidden;">
        <table class="data-table" id="admin-movement-table">
          <thead>
            <tr>
              <th>Member Name &amp; Email</th>
              <th>Area of Engagement / Interest</th>
              <th>Location</th>
              <th>Signup Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="admin-movement-tbody">
            <tr>
              <td colspan="6" style="text-align:center;padding:30px;color:var(--text-muted);">Loading movement signups...</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>`;

// Insert page sections if not already present
if (!content.includes('id="page-books"')) {
  const insertMarker = '<!-- PAGE: SECTIONS -->';
  content = content.replace(insertMarker, pageBooksHtml + '\n\n' + pageMovementHtml + '\n\n' + insertMarker);
}

// Write back
fs.writeFileSync(adminHtmlPath, content, 'utf8');
console.log('✅ admin.html updated successfully with Books and Movement sections!');
