/* ═══════════════════════════════════════════════════════════
   THE PRIVATIAN FAMILY — ADMIN JS
   Sections CRUD · localStorage sync · Toast · Modal
═══════════════════════════════════════════════════════════ */

const STORAGE_KEY = 'privatian_sections';

// ── Default seed sections (mirrors main website nav) ───────
const DEFAULT_SECTIONS = [
  { id: 'all',                name: 'All',                 slug: '',                   locked: true,  deleted: false, createdAt: '2024-01-01T00:00:00Z' },
  { id: 'findings',           name: 'Findings',            slug: 'findings',            locked: false, deleted: false, createdAt: '2024-01-01T00:00:00Z' },
  { id: 'community-heritage', name: 'Community & Heritage', slug: 'community-heritage',  locked: false, deleted: false, createdAt: '2024-01-01T00:00:00Z' },
  { id: 'culture',            name: 'Culture',             slug: 'culture',             locked: false, deleted: false, createdAt: '2024-01-01T00:00:00Z' },
  { id: 'privacy-values',     name: 'Privacy & Values',    slug: 'privacy-values',      locked: false, deleted: false, createdAt: '2024-01-01T00:00:00Z' },
  { id: 'nation-world',       name: 'Nation & World',      slug: 'nation-world',        locked: false, deleted: false, createdAt: '2024-01-01T00:00:00Z' },
  { id: 'arts-legacy',        name: 'Arts & Legacy',       slug: 'arts-legacy',         locked: false, deleted: false, createdAt: '2024-01-01T00:00:00Z' },
  { id: 'work-economy',       name: 'Work & Economy',      slug: 'work-economy',        locked: false, deleted: false, createdAt: '2024-01-01T00:00:00Z' },
];

// ── SVG icons ──────────────────────────────────────────────
const ICONS = {
  pencil: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="15" height="15"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  trash:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="15" height="15"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>`,
  restore:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="15" height="15"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.95"/></svg>`,
  xCircle:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="15" height="15"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
  lock:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="13" height="13"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
  plus:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="15" height="15"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  check:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" width="16" height="16"><polyline points="20 6 9 17 4 12"/></svg>`,
  warn:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" width="16" height="16"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  error:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" width="16" height="16"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
  xSmall: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  upload: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="15" height="15"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>`,
};

// ── Data layer ─────────────────────────────────────────────
function loadSections() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch(e) {}
  return null;
}

function saveSections(sections) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sections));
}

// ── Apply Changes — push active sections to main website ───
const APPLIED_KEY = 'privatian_applied_sections';

function applyChanges() {
  const active = sections.filter(s => !s.deleted && !s.locked);
  const payload = {
    sections: active.map(s => ({ id: s.id, name: s.name, slug: s.slug || '' })),
    appliedAt: new Date().toISOString(),
  };
  localStorage.setItem(APPLIED_KEY, JSON.stringify(payload));

  // Update button to show confirmation briefly
  const btn = document.getElementById('apply-changes-btn');
  if (btn) {
    const originalHTML = btn.innerHTML;
    btn.innerHTML = `${ICONS.check} Applied!`;
    btn.disabled = true;
    btn.style.background = 'var(--success)';
    btn.style.borderColor = 'var(--success)';
    setTimeout(() => {
      btn.innerHTML = originalHTML;
      btn.disabled = false;
      btn.style.background = '';
      btn.style.borderColor = '';
    }, 2200);
  }

  showToast('success', `Changes applied — reload the main site to see updated sections.`);
}

function initData() {
  let sections = loadSections();
  if (!sections) {
    sections = DEFAULT_SECTIONS.map(s => ({ ...s }));
    saveSections(sections);
  } else {
    // Migrate: fix missing slugs AND correct wrong slugs on built-in default sections
    let changed = false;
    sections.forEach(s => {
      const defaultMatch = DEFAULT_SECTIONS.find(d => d.id === s.id);
      if (s.slug === undefined) {
        // Slug missing — add it
        s.slug = s.locked ? '' : (defaultMatch ? defaultMatch.slug : genSlug(s.name));
        changed = true;
      } else if (defaultMatch && !s.locked && defaultMatch.slug && s.slug !== defaultMatch.slug) {
        // Built-in section has wrong slug (e.g. from old auto-generation) — correct it
        s.slug = defaultMatch.slug;
        changed = true;
      }
    });
    if (changed) saveSections(sections);
  }
  return sections;
}

function genId(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();
}

function genSlug(name) {
  return name.toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function validateSlug(slug) {
  return /^[a-z0-9-]+$/.test(slug);
}

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// ── State ──────────────────────────────────────────────────
let sections = [];
let currentTab = 'active';
let editingId  = null;   // for modal edit mode
let pendingDeleteId = null;  // for confirm modal
let undoTimer  = null;

// ── DOM refs ───────────────────────────────────────────────
const sectionsTable  = document.getElementById('sections-tbody');
const trashTable     = document.getElementById('trash-tbody');
const countActive    = document.getElementById('count-active');
const countTrash     = document.getElementById('count-trash');
const tabActiveBtn   = document.getElementById('tab-active');
const tabTrashBtn    = document.getElementById('tab-trash');
const panelActive    = document.getElementById('panel-active');
const panelTrash     = document.getElementById('panel-trash');
const activeEmpty    = document.getElementById('active-empty');
const trashEmpty     = document.getElementById('trash-empty');
const topbarActions  = document.getElementById('topbar-actions');
const toastContainer = document.getElementById('toast-container');

// Modal — add/edit
const modalOverlay   = document.getElementById('modal-overlay');
const modalTitle     = document.getElementById('modal-title');
const modalSaveBtn   = document.getElementById('modal-save-btn');
const modalCancelBtn = document.getElementById('modal-cancel-btn');
const modalCloseBtn  = document.getElementById('modal-close-btn');
const nameInput      = document.getElementById('section-name-input');
const modalError     = document.getElementById('modal-error');

// Modal — confirm delete
const confirmOverlay    = document.getElementById('confirm-overlay');
const confirmTitle      = document.getElementById('confirm-title');
const confirmSectionName= document.getElementById('confirm-section-name');
const confirmDeleteBtn  = document.getElementById('confirm-delete-btn');
const confirmCancelBtn  = document.getElementById('confirm-cancel-btn');

// ── Render ─────────────────────────────────────────────────
function render() {
  const active = sections.filter(s => !s.deleted);
  const trash  = sections.filter(s =>  s.deleted);

  countActive.textContent = active.length;
  countTrash.textContent  = trash.length;

  renderActive(active);
  renderTrash(trash);
}

function renderActive(active) {
  sectionsTable.innerHTML = '';

  if (active.length === 0) {
    activeEmpty.hidden = false;
    return;
  }
  activeEmpty.hidden = true;

  // Pin "All" first
  const sorted = [
    ...active.filter(s => s.locked),
    ...active.filter(s => !s.locked),
  ];

  sorted.forEach(s => {
    const tr = document.createElement('tr');
    if (s.locked) tr.classList.add('row--locked');

    tr.innerHTML = `
      <td>
        <div class="section-name-cell ${s.locked ? 'section-name-locked' : ''}">
          ${s.locked ? `<span class="lock-icon">${ICONS.lock}</span>` : ''}
          <span class="section-name-text">${escapeHtml(s.name)}</span>
        </div>
      </td>
      <td class="col-slug">
        ${s.locked
          ? '<span class="section-slug-cell--empty">—</span>'
          : (s.slug
              ? `<span class="section-slug-cell" title="/section/${escapeHtml(s.slug)}">${escapeHtml(s.slug)}</span>`
              : '<span class="section-slug-cell--empty">not set</span>'
            )
        }
      </td>
      <td class="articles-count articles-count--dash col-articles">—</td>
      <td class="created-date">${formatDate(s.createdAt)}</td>
      <td>
        ${s.locked
          ? `<span class="badge badge--locked">${ICONS.lock} Locked</span>`
          : `<span class="badge badge--active">Active</span>`}
      </td>
      <td>
        <div class="action-group">
          ${!s.locked ? `
            <button class="action-btn action-btn--edit" data-id="${s.id}" title="Edit section" aria-label="Edit ${escapeHtml(s.name)}">${ICONS.pencil}</button>
            <button class="action-btn action-btn--delete" data-id="${s.id}" title="Move to trash" aria-label="Delete ${escapeHtml(s.name)}">${ICONS.trash}</button>
          ` : ''}
        </div>
      </td>
    `;
    sectionsTable.appendChild(tr);
  });

  // Bind row actions
  sectionsTable.querySelectorAll('.action-btn--edit').forEach(btn => {
    btn.addEventListener('click', () => openEditModal(btn.dataset.id));
  });
  sectionsTable.querySelectorAll('.action-btn--delete').forEach(btn => {
    btn.addEventListener('click', () => deleteSection(btn.dataset.id));
  });
}

function renderTrash(trash) {
  trashTable.innerHTML = '';

  if (trash.length === 0) {
    trashEmpty.hidden = false;
    return;
  }
  trashEmpty.hidden = true;

  trash.forEach(s => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <div class="section-name-cell" style="color: var(--text-muted); text-decoration: line-through;">
          ${escapeHtml(s.name)}
        </div>
      </td>
      <td class="articles-count articles-count--dash col-articles">—</td>
      <td class="created-date">${formatDate(s.deletedAt)}</td>
      <td>
        <div class="action-group">
          <button class="action-btn action-btn--restore" data-id="${s.id}" title="Restore section" aria-label="Restore ${escapeHtml(s.name)}">${ICONS.restore}</button>
          <button class="action-btn action-btn--perm-delete" data-id="${s.id}" title="Delete permanently" aria-label="Permanently delete ${escapeHtml(s.name)}">${ICONS.xCircle}</button>
        </div>
      </td>
    `;
    trashTable.appendChild(tr);
  });

  trashTable.querySelectorAll('.action-btn--restore').forEach(btn => {
    btn.addEventListener('click', () => restoreSection(btn.dataset.id));
  });
  trashTable.querySelectorAll('.action-btn--perm-delete').forEach(btn => {
    btn.addEventListener('click', () => openConfirmDelete(btn.dataset.id));
  });
}

// ── Actions ────────────────────────────────────────────────
function addSection(name, slug) {
  const trimmed = name.trim();
  const slugVal = slug.trim();
  const exists = sections.some(s => !s.deleted && s.name.toLowerCase() === trimmed.toLowerCase());
  if (exists) return 'A section with that name already exists.';
  const slugExists = slugVal && sections.some(s => !s.deleted && s.slug === slugVal);
  if (slugExists) return 'A section with that URL slug already exists.';
  sections.push({
    id: genId(trimmed),
    name: trimmed,
    slug: slugVal,
    locked: false,
    deleted: false,
    createdAt: new Date().toISOString(),
  });
  saveSections(sections);
  render();
  showToast('success', `Section "${trimmed}" created.`);
  return null;
}

function renameSection(id, name, slug) {
  const trimmed = name.trim();
  const slugVal = slug.trim();
  const exists = sections.some(s => s.id !== id && !s.deleted && s.name.toLowerCase() === trimmed.toLowerCase());
  if (exists) return 'A section with that name already exists.';
  const slugExists = slugVal && sections.some(s => s.id !== id && !s.deleted && s.slug === slugVal);
  if (slugExists) return 'A section with that URL slug already exists.';
  const s = sections.find(s => s.id === id);
  if (!s) return 'Section not found.';
  s.name = trimmed;
  s.slug = slugVal;
  saveSections(sections);
  render();
  showToast('success', `Renamed to "${trimmed}".`);
  return null;
}

function deleteSection(id) {
  const s = sections.find(s => s.id === id);
  if (!s || s.locked) return;
  const name = s.name;
  s.deleted = true;
  s.deletedAt = new Date().toISOString();
  saveSections(sections);
  render();

  // Show toast with undo
  showToast('warning', `"${name}" moved to Trash.`, 'Undo', () => {
    s.deleted = false;
    delete s.deletedAt;
    saveSections(sections);
    render();
    showToast('success', `"${name}" restored.`);
  });
}

function restoreSection(id) {
  const s = sections.find(s => s.id === id);
  if (!s) return;
  s.deleted = false;
  delete s.deletedAt;
  saveSections(sections);
  render();
  showToast('success', `"${s.name}" restored to Active.`);
}

function permanentlyDelete(id) {
  const idx = sections.findIndex(s => s.id === id);
  if (idx === -1) return;
  const name = sections[idx].name;
  sections.splice(idx, 1);
  saveSections(sections);
  render();
  showToast('error', `"${name}" permanently deleted.`);
}

// ── Modal — Add / Edit ──────────────────────────────────
const slugInput   = document.getElementById('section-slug-input');
const slugPreview = document.getElementById('slug-preview');
let slugManuallyEdited = false;

function updateSlugPreview() {
  if (!slugPreview) return;
  const slug = slugInput ? slugInput.value.trim() : '';
  if (!slug) {
    slugPreview.textContent = '';
    slugPreview.style.color = '';
    return;
  }
  const valid = validateSlug(slug);
  slugPreview.textContent = valid
    ? `URL will be: /section/${slug}`
    : 'Only lowercase letters, numbers and hyphens allowed';
  slugPreview.style.color = valid ? 'var(--text-muted)' : 'var(--danger)';
}

function openAddModal() {
  editingId = null;
  slugManuallyEdited = false;
  modalTitle.textContent = 'New Section';
  modalSaveBtn.textContent = 'Save Section';
  nameInput.value = '';
  if (slugInput) slugInput.value = '';
  if (slugPreview) slugPreview.textContent = '';
  hideModalError();
  modalOverlay.hidden = false;
  setTimeout(() => nameInput.focus(), 60);
}

function openEditModal(id) {
  const s = sections.find(s => s.id === id);
  if (!s) return;
  editingId = id;
  slugManuallyEdited = true; // don't auto-override slug when editing
  modalTitle.textContent = 'Edit Section';
  modalSaveBtn.textContent = 'Save Changes';
  nameInput.value = s.name;
  if (slugInput) slugInput.value = s.slug || '';
  updateSlugPreview();
  hideModalError();
  modalOverlay.hidden = false;
  setTimeout(() => { nameInput.focus(); nameInput.select(); }, 60);
}

function closeModal() {
  modalOverlay.hidden = true;
  editingId = null;
  slugManuallyEdited = false;
  hideModalError();
}

function showModalError(msg) {
  modalError.textContent = msg;
  modalError.hidden = false;
  nameInput.style.borderColor = 'var(--danger)';
}

function hideModalError() {
  modalError.hidden = true;
  modalError.textContent = '';
  nameInput.style.borderColor = '';
}

// Auto-generate slug from name (when not manually edited)
nameInput.addEventListener('input', () => {
  hideModalError();
  if (!slugManuallyEdited && slugInput) {
    slugInput.value = genSlug(nameInput.value);
    updateSlugPreview();
  }
});

if (slugInput) {
  slugInput.addEventListener('input', () => {
    slugManuallyEdited = true;
    updateSlugPreview();
  });
}

modalSaveBtn.addEventListener('click', () => {
  const nameVal = nameInput.value.trim();
  const slugVal = slugInput ? slugInput.value.trim() : '';
  if (!nameVal) { showModalError('Section name cannot be empty.'); return; }
  if (slugVal && !validateSlug(slugVal)) {
    showModalError('URL slug: only lowercase letters, numbers, and hyphens allowed.');
    return;
  }
  const err = editingId
    ? renameSection(editingId, nameVal, slugVal)
    : addSection(nameVal, slugVal);
  if (err) { showModalError(err); return; }
  closeModal();
});

nameInput.addEventListener('keydown', e => { if (e.key === 'Enter') modalSaveBtn.click(); });
modalCancelBtn.addEventListener('click', closeModal);
modalCloseBtn.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });

// ── Confirm Delete Modal ───────────────────────────────────
function openConfirmDelete(id) {
  const s = sections.find(s => s.id === id);
  if (!s) return;
  pendingDeleteId = id;
  confirmSectionName.textContent = `"${s.name}"`;
  confirmOverlay.hidden = false;
}

function closeConfirmModal() {
  confirmOverlay.hidden = true;
  pendingDeleteId = null;
}

confirmDeleteBtn.addEventListener('click', () => {
  if (pendingDeleteId) permanentlyDelete(pendingDeleteId);
  closeConfirmModal();
});
confirmCancelBtn.addEventListener('click', closeConfirmModal);
confirmOverlay.addEventListener('click', e => { if (e.target === confirmOverlay) closeConfirmModal(); });

// ── Keyboard shortcuts ─────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (!modalOverlay.hidden) closeModal();
    if (!confirmOverlay.hidden) closeConfirmModal();
  }
});

// ── Tab switching ──────────────────────────────────────────
function switchTab(tab) {
  currentTab = tab;
  tabActiveBtn.classList.toggle('active', tab === 'active');
  tabTrashBtn.classList.toggle('active', tab === 'trash');
  panelActive.hidden = tab !== 'active';
  panelTrash.hidden  = tab !== 'trash';
}

tabActiveBtn.addEventListener('click', () => switchTab('active'));
tabTrashBtn.addEventListener('click',  () => switchTab('trash'));

// ── Page navigation ────────────────────────────────────────
const PAGE_CONFIG = {
  sections:  { title: 'Sections',  breadcrumb: 'Sections' },
  dashboard: { title: 'Dashboard', breadcrumb: 'Dashboard' },
  articles:  { title: 'Articles',  breadcrumb: 'Articles' },
  settings:  { title: 'Settings',  breadcrumb: 'Settings' },
};

function navigateTo(page) {
  document.querySelectorAll('.sidebar-nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.page === page);
  });
  document.querySelectorAll('.page').forEach(el => {
    el.classList.toggle('active', el.id === `page-${page}`);
  });

  const cfg = PAGE_CONFIG[page] || { title: page, breadcrumb: page };
  document.getElementById('page-title').textContent = cfg.title;
  document.getElementById('breadcrumb-current').textContent = cfg.breadcrumb;

  // Inject topbar action buttons
  topbarActions.innerHTML = '';
  if (page === 'sections') {
    // Apply Changes button
    const applyBtn = document.createElement('button');
    applyBtn.className = 'btn btn--apply';
    applyBtn.id = 'apply-changes-btn';
    applyBtn.innerHTML = `${ICONS.upload} Apply Changes`;
    applyBtn.addEventListener('click', applyChanges);
    topbarActions.appendChild(applyBtn);

    // Divider
    const sep = document.createElement('span');
    sep.className = 'topbar-sep';
    topbarActions.appendChild(sep);

    // New Section button
    const btn = document.createElement('button');
    btn.className = 'btn btn--primary';
    btn.id = 'add-section-btn';
    btn.innerHTML = `${ICONS.plus} New Section`;
    btn.addEventListener('click', openAddModal);
    topbarActions.appendChild(btn);
  }
}

document.querySelectorAll('.sidebar-nav-item').forEach(el => {
  el.addEventListener('click', e => {
    e.preventDefault();
    navigateTo(el.dataset.page);
  });
});

// ── Toast ──────────────────────────────────────────────────
function showToast(type, message, actionLabel, actionFn) {
  const iconMap = { success: ICONS.check, warning: ICONS.warn, error: ICONS.error };

  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${iconMap[type] || ''}</span>
    <span class="toast-message">${escapeHtml(message)}</span>
    ${actionLabel ? `<button class="toast-action" id="toast-undo">${actionLabel}</button>` : ''}
    <button class="toast-dismiss" aria-label="Dismiss">${ICONS.xSmall}</button>
  `;
  toastContainer.appendChild(toast);

  const dismiss = () => {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 210);
  };

  if (actionLabel && actionFn) {
    toast.querySelector('#toast-undo').addEventListener('click', () => {
      actionFn();
      dismiss();
    });
  }

  toast.querySelector('.toast-dismiss').addEventListener('click', dismiss);
  setTimeout(dismiss, 4500);
}

// ── Helpers ────────────────────────────────────────────────
function escapeHtml(str) {
  return String(str)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;');
}

// ── INIT ───────────────────────────────────────────────────
sections = initData();
navigateTo('sections');
render();
