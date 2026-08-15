/**
 * scratch/update-admin-js.js
 * Appends Books Library and Movement Signups management to assets/js/admin.js
 */

const fs = require('fs');
const path = require('path');

const adminJsPath = path.join(__dirname, '..', 'assets', 'js', 'admin.js');
let content = fs.readFileSync(adminJsPath, 'utf8');

// 1. Update PAGE_CONFIG
if (!content.includes("books:       { title: 'Books & Literature Library'")) {
  content = content.replace(
    "articles:    { title: 'Articles',  breadcrumb: 'Articles' },",
    `articles:    { title: 'Articles',  breadcrumb: 'Articles' },
  books:       { title: 'Books & Literature Library', breadcrumb: 'Books & Library' },
  movement:    { title: 'Solidarity Movement Network & Signups', breadcrumb: 'Movement Signups' },`
  );
}

// 2. Update navigateTo(page)
if (!content.includes("if (page === 'books')")) {
  content = content.replace(
    "if (page === 'activity')    { loadActivityLogs(); }",
    `if (page === 'activity')    { loadActivityLogs(); }
  if (page === 'books')       { loadAdminBooks(); }
  if (page === 'movement')    { loadAdminMovementSignups(); }`
  );
}

// 3. Append Books & Movement Handlers
const additionalLogic = `
// ══════════════════════════════════════════════════════════════════
// BOOKS LIBRARY & UNABRIDGED CHAPTERS MANAGER
// ══════════════════════════════════════════════════════════════════

let _allAdminBooks = [];

async function loadAdminBooks() {
  const tbody = document.getElementById('admin-books-tbody');
  if (tbody) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:30px;color:var(--text-muted);">Syncing books from Supabase and cache...</td></tr>';
  }

  try {
    let books = [];
    try {
      const res = await fetch('/api/books?action=list');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) books = data;
      }
    } catch(e) {}

    if (books.length === 0 && window.THE_WAY_BOOKS) {
      books = window.THE_WAY_BOOKS.getAllBooks();
    }

    _allAdminBooks = books;
    renderAdminBooks(books);

    const countEl = document.getElementById('books-stat-count');
    if (countEl) countEl.textContent = books.length;

    let totalChapters = 0;
    books.forEach(b => totalChapters += (b.chapters ? b.chapters.length : (b.pages_count || 1)));
    const chEl = document.getElementById('books-stat-chapters');
    if (chEl) chEl.textContent = totalChapters || 36;
  } catch (err) {
    if (tbody) tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:red;padding:20px;">Failed to load books: ' + escapeHtml(err.message) + '</td></tr>';
  }
}

function renderAdminBooks(books) {
  const tbody = document.getElementById('admin-books-tbody');
  if (!tbody) return;

  if (books.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:30px;color:var(--text-muted);">No books found in library.</td></tr>';
    return;
  }

  tbody.innerHTML = books.map(book => {
    const authors = book.authors ? book.authors.map(a => a.name).join(' ও ') : (book.author_bn || 'অজ্ঞাত');
    const chCount = book.chapters ? book.chapters.length : (book.slug === 'maxim-gorky-mother-novel' ? 36 : 1);
    
    return \`
      <tr>
        <td style="padding:14px 18px;">
          <div style="font-weight:700;color:var(--text-primary);font-size:14px;">\${escapeHtml(book.title_bn)}</div>
          <div style="font-size:12px;color:var(--text-muted);margin-top:2px;">\${escapeHtml(book.subtitle_bn || book.title_en || '')}</div>
          <code style="font-size:11px;color:#c2182b;background:rgba(194,24,43,0.08);padding:2px 5px;border-radius:4px;display:inline-block;margin-top:4px;">slug: \${escapeHtml(book.slug)}</code>
        </td>
        <td style="padding:14px 18px;font-size:13px;">
          <div style="font-weight:600;">\${escapeHtml(authors)}</div>
          \${book.translator_bn ? \`<div style="font-size:11.5px;color:var(--text-muted);">অনুবাদ: \${escapeHtml(book.translator_bn)}</div>\` : ''}
        </td>
        <td style="padding:14px 18px;font-size:12.5px;">
          <span style="background:#f1f5f9;color:#334155;padding:3px 8px;border-radius:6px;font-weight:600;">\${escapeHtml(book.category_name_bn || book.category || 'Classics')}</span>
        </td>
        <td style="padding:14px 18px;font-size:13px;font-weight:600;">\${escapeHtml(book.year || '—')}</td>
        <td style="padding:14px 18px;font-size:13px;">
          <span style="font-weight:700;color:#059669;">\${chCount} Chapters</span>
          <div style="font-size:11px;color:var(--text-muted);">~\${book.reading_time_mins || 60} mins read</div>
        </td>
        <td style="padding:14px 18px;">
          <div style="display:flex;gap:6px;">
            <a href="book-reader.html?book=\${encodeURIComponent(book.slug)}" target="_blank" class="btn btn--ghost btn--sm" title="Read on Web Reader" style="padding:4px 10px;font-size:12px;color:#c2182b;border:1px solid rgba(194,24,43,0.2);">
              Open Reader
            </a>
            <button class="btn btn--secondary btn--sm" onclick="inspectBookDetails('\${escapeHtml(book.slug)}')" style="padding:4px 10px;font-size:12px;">
              Details
            </button>
          </div>
        </td>
      </tr>
    \`;
  }).join('');
}

function filterAdminBooks(q) {
  const query = String(q || '').toLowerCase().trim();
  if (!query) {
    renderAdminBooks(_allAdminBooks);
    return;
  }
  const filtered = _allAdminBooks.filter(b =>
    (b.title_bn || '').toLowerCase().includes(query) ||
    (b.title_en || '').toLowerCase().includes(query) ||
    (b.slug || '').toLowerCase().includes(query) ||
    (b.author_bn || '').toLowerCase().includes(query) ||
    (b.authors && b.authors.some(a => a.name.toLowerCase().includes(query)))
  );
  renderAdminBooks(filtered);
}

function inspectBookDetails(slug) {
  const book = _allAdminBooks.find(b => b.slug === slug);
  if (!book) return;

  _confirmModal({
    title: \`Book Details: \${book.title_bn}\`,
    body: \`
      <div style="font-size:13px;line-height:1.6;color:#334155;">
        <div><strong>Title:</strong> \${escapeHtml(book.title_bn)} (\${escapeHtml(book.title_en || '')})</div>
        <div><strong>Slug:</strong> <code>\${escapeHtml(book.slug)}</code></div>
        <div><strong>Year:</strong> \${escapeHtml(book.year || '—')}</div>
        <div><strong>Category:</strong> \${escapeHtml(book.category_name_bn || '—')}</div>
        <div style="margin-top:10px;padding:10px;background:#f8fafc;border-radius:6px;border:1px solid #e2e8f0;">
          <strong>Summary:</strong><br>\${escapeHtml(book.summary_bn || '—')}
        </div>
      </div>
    \`,
    confirmText: 'Open in Web Reader',
    confirmColor: '#c2182b',
    onConfirm: () => {
      window.open(\`book-reader.html?book=\${encodeURIComponent(book.slug)}\`, '_blank');
    }
  });
}

// ══════════════════════════════════════════════════════════════════
// SOLIDARITY & MOVEMENT NETWORK MANAGER ("সংগঠিত হোন")
// ══════════════════════════════════════════════════════════════════

let _allMovementSignups = [];
let _currentMovementStatusFilter = 'all';

async function loadAdminMovementSignups() {
  const tbody = document.getElementById('admin-movement-tbody');
  if (tbody) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:30px;color:var(--text-muted);">Loading members from database...</td></tr>';
  }

  try {
    const res = await fetch('/api/movement?action=list', {
      headers: _authHeaders()
    });
    const data = await res.json();
    const list = (data && Array.isArray(data.data)) ? data.data : [];
    _allMovementSignups = list;

    // Update counts
    const countAll = list.length;
    const countNew = list.filter(m => m.status === 'new').length;
    const countContacted = list.filter(m => m.status === 'contacted').length;
    const countActive = list.filter(m => m.status === 'active').length;

    const elAll = document.getElementById('mov-count-all');
    const elNew = document.getElementById('mov-count-new');
    const elContacted = document.getElementById('mov-count-contacted');
    const elActive = document.getElementById('mov-count-active');

    if (elAll) elAll.textContent = countAll;
    if (elNew) elNew.textContent = countNew;
    if (elContacted) elContacted.textContent = countContacted;
    if (elActive) elActive.textContent = countActive;

    renderAdminMovementSignups();
  } catch (err) {
    if (tbody) tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:red;padding:20px;">Error loading movement signups: ' + escapeHtml(err.message) + '</td></tr>';
  }
}

function filterMovementTab(status, btn) {
  _currentMovementStatusFilter = status;
  if (btn) {
    btn.closest('.tab-bar').querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }
  renderAdminMovementSignups();
}

function renderAdminMovementSignups() {
  const tbody = document.getElementById('admin-movement-tbody');
  if (!tbody) return;

  let list = _allMovementSignups;
  if (_currentMovementStatusFilter !== 'all') {
    list = list.filter(m => m.status === _currentMovementStatusFilter);
  }

  if (list.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:30px;color:var(--text-muted);">No members found in this status.</td></tr>';
    return;
  }

  tbody.innerHTML = list.map(member => {
    const statusBadges = {
      new: '<span style="background:#fef3c7;color:#b45309;padding:3px 8px;border-radius:12px;font-size:11px;font-weight:700;">New Signup</span>',
      contacted: '<span style="background:#e0f2fe;color:#0369a1;padding:3px 8px;border-radius:12px;font-size:11px;font-weight:700;">Contacted</span>',
      active: '<span style="background:#dcfce7;color:#15803d;padding:3px 8px;border-radius:12px;font-size:11px;font-weight:700;">Active Organizer</span>',
      archived: '<span style="background:#f1f5f9;color:#64748b;padding:3px 8px;border-radius:12px;font-size:11px;font-weight:700;">Archived</span>'
    };

    const dateStr = member.created_at ? new Date(member.created_at).toLocaleDateString('bn-BD', { year:'numeric', month:'short', day:'numeric' }) : '—';

    return \`
      <tr>
        <td style="padding:14px 18px;">
          <div style="font-weight:700;color:var(--text-primary);font-size:14px;">\${escapeHtml(member.name)}</div>
          <a href="mailto:\${escapeHtml(member.email)}" style="font-size:12.5px;color:#0284c7;text-decoration:none;">\${escapeHtml(member.email)}</a>
          \${member.phone ? \`<div style="font-size:11px;color:var(--text-muted);margin-top:2px;">📞 \${escapeHtml(member.phone)}</div>\` : ''}
        </td>
        <td style="padding:14px 18px;font-size:13px;font-weight:600;color:#1e293b;">
          \${escapeHtml(member.interest || 'General')}
        </td>
        <td style="padding:14px 18px;font-size:12.5px;color:var(--text-secondary);">
          \${escapeHtml(member.location || '—')}
        </td>
        <td style="padding:14px 18px;font-size:12.5px;color:var(--text-muted);">
          \${dateStr}
        </td>
        <td style="padding:14px 18px;">
          \${statusBadges[member.status] || statusBadges.new}
        </td>
        <td style="padding:14px 18px;">
          <div style="display:flex;gap:6px;">
            <select onchange="updateMovementStatus('\${member.id}', this.value)" style="padding:4px 8px;border:1px solid #cbd5e1;border-radius:6px;font-size:11.5px;font-weight:600;background:#fff;">
              <option value="new" \${member.status==='new'?'selected':''}>Set New</option>
              <option value="contacted" \${member.status==='contacted'?'selected':''}>Set Contacted</option>
              <option value="active" \${member.status==='active'?'selected':''}>Set Active</option>
              <option value="archived" \${member.status==='archived'?'selected':''}>Set Archived</option>
            </select>
            <button onclick="deleteMovementMember('\${member.id}')" class="btn btn--ghost btn--sm" title="Delete Member" style="padding:4px 8px;color:#dc2626;">
              ✕
            </button>
          </div>
        </td>
      </tr>
    \`;
  }).join('');
}

async function updateMovementStatus(id, newStatus) {
  try {
    const res = await fetch(\`/api/movement?action=update&id=\${id}\`, {
      method: 'PATCH',
      headers: _authHeaders(),
      body: JSON.stringify({ status: newStatus })
    });
    if (res.ok) {
      showToast('success', 'Member status updated successfully.');
      loadAdminMovementSignups();
    } else {
      showToast('error', 'Failed to update status.');
    }
  } catch(e) {
    showToast('error', e.message);
  }
}

async function deleteMovementMember(id) {
  _confirmModal({
    title: 'Delete Member',
    body: 'Are you sure you want to remove this solidarity signup from the network?',
    confirmText: 'Delete',
    confirmColor: '#dc2626',
    onConfirm: async () => {
      try {
        const res = await fetch(\`/api/movement?action=delete&id=\${id}\`, {
          method: 'DELETE',
          headers: _authHeaders()
        });
        if (res.ok) {
          showToast('success', 'Member deleted.');
          loadAdminMovementSignups();
        }
      } catch(e) {
        showToast('error', e.message);
      }
    }
  });
}
`;

if (!content.includes('BOOKS LIBRARY & UNABRIDGED CHAPTERS MANAGER')) {
  content += '\n\n' + additionalLogic;
}

fs.writeFileSync(adminJsPath, content, 'utf8');
console.log('✅ assets/js/admin.js updated with Books Library and Movement Signups!');
