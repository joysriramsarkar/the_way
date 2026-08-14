# Article Editor — 7-Feature Implementation Plan

## Requirements Analysis

### 1. Undo / Redo
**How:** `document.execCommand('undo')` / `document.execCommand('redo')` — browser's native undo stack for `contenteditable` already works. Add toolbar buttons + Ctrl+Z / Ctrl+Y keyboard shortcuts.
**Buttons:** Undo (↩) and Redo (↪) at start of format bar.

---

### 2. Image Resize (S / M / L / Full + Reset)
**How:** When user clicks any `<img>` inside `#ed-rt`, a floating **image toolbar** appears above it with:
- **S** → 35% width
- **M** → 55% width
- **L** → 75% width  
- **Full** → 100% width (default — matches article.html's full-bleed style)
- **Center / Float-L / Float-R** alignment
- **Delete** button

The toolbar is a fixed `<div>` that positions itself relative to the clicked image using `getBoundingClientRect()`.

**Default size**: Full width (100%), matching `article-hero-img` style in article.css.

---

### 3. Image Delete
Part of the same **image floating toolbar** (#2). A red trash button removes the `<figure>` or `<img>` element.

---

### 4. Sections from DB (not hardcoded)
**How:** On editor mount, fetch `GET /api/sections?status=all` with `Authorization` header. This returns `[{ name, slug, ... }]`. Populate the dropdown dynamically.
**Fallback:** If fetch fails, show 3 basic defaults (Findings, Culture, Heritage).
**API endpoint:** `/api/sections?status=all`

---

### 5. Auto-save by keystroke (debounced, not timer-based)
**Strategy (two-tier):**
- **localStorage save**: every input event, debounced **300ms** → instant persistence, no network
- **Server save**: debounced **3 seconds** after last keystroke → silently saves to DB
- **Status indicator**: Shows "Unsaved changes" while typing → "Saving…" when server call starts → "Saved" when done (no clock time)

---

### 6. Draft persists if tab closed before save
Uses **localStorage as a write-ahead log**:
- **Key**: `pf_draft_{articleId}` or `pf_draft_new` for new articles
- On every input (300ms debounce): save full payload + `content_html` + `_ts` (timestamp) to localStorage
- On page load: compare localStorage `_ts` vs server `updated_at`. If localStorage is newer → show a **restore banner** at top:
  > "You have unsaved changes from [time ago]. [Restore] [Discard]"
- After server save: update localStorage `_ts` to match (or clear it)
- This ensures **zero data loss** even if browser crashes

---

### 7. Author Photo Upload
**UI:** Replace the static SVG avatar in bio card with a clickable avatar zone:
- Default: the current SVG placeholder
- Click → file picker → preview immediately + upload to server
- Shows circular image if uploaded

**Backend:** Add `author_photo_url` field to `articles` table:
```sql
ALTER TABLE articles ADD COLUMN IF NOT EXISTS author_photo_url TEXT DEFAULT '';
```
Include in `buildPayload()` and `fill()`.

**Upload endpoint:** Reuse `/api/articles?action=upload` (same image upload used for content images).

---

## Files to Modify

### `admin-article-editor.html` — All UI changes
- Add Undo/Redo buttons to format bar
- Add image floating toolbar (resize + delete)
- Dynamic sections from DB
- Two-tier auto-save (localStorage + server debounce)
- Restore banner for unsaved localStorage drafts
- Author photo upload in bio card

### `api/articles.js` — Backend
- Add `author_photo_url` to `save` action payload
- Add `author_photo_url` to `get` action response select
- (Upload action: already planned but needs implementing if not done)

### Supabase SQL (user needs to run once)
```sql
ALTER TABLE articles ADD COLUMN IF NOT EXISTS author_photo_url TEXT DEFAULT '';
```

---

## Detailed UI Layout

```
┌─────────────────────────────────────────── ADMIN TOOLBAR ──────────────────────────────────────────┐
│ ← Articles | slug: _____________ |  ● Draft  |  ● Unsaved changes  | [Save Draft] [Publish]       │
└────────────────────────────────────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────── FORMAT BAR (sticky) ───────────────────────────────────┐
│ [↩][↪] | Paragraph▼ | [B][I][U][S] | [A●][🖍] | [🔗][unlink] | [🖼] [—] | [✕clear]             │
└────────────────────────────────────────────────────────────────────────────────────────────────────┘

[RESTORE BANNER — only if localStorage has unsaved changes]
"↩ Unsaved changes from 5 minutes ago.  [Restore]  [Discard]"

  [Section Dropdown ▼]

  Headline...
  
  Subtitle/deck...
  
  By [Author] · [Date] · N min read
  ─────────────────────────────────
  
  [Article rich text body — type here, format with toolbar]
  
  [When image clicked:]
  ┌──────────────────────────────────┐
  │ [S] [M] [L] [Full] | [←][·][→] | [🗑]│
  └──────────────────────────────────┘
  <selected image has blue border>
  
  ─────────────────────────────────
  [Author Bio Card]
  [Click to upload photo]  Author Name
                           Role · Title
                           Short bio...
```

---

## Implementation Order
1. Supabase SQL for `author_photo_url` (user action needed)
2. Update `api/articles.js` — add `author_photo_url` to save/get
3. Rewrite `admin-article-editor.html` with all 7 features
