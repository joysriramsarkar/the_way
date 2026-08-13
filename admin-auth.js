/* ═══════════════════════════════════════════════════════════
   THE PRIVATIAN FAMILY — Admin Auth Frontend Guard
   Include this script at the TOP of every admin page.
   Redirects to login if session is invalid.
═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const TOKEN_KEY = 'privatian_token';
  const LOGIN_URL = '/admin-login.html';

  function getToken() { return localStorage.getItem(TOKEN_KEY); }

  function esc(s) {
    return String(s || '')
      .replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  async function checkSession() {
    const token = getToken();
    if (!token) return null;
    try {
      const r = await fetch('/api/auth/me', {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      if (!r.ok) return null;
      return await r.json();
    } catch(e) { return null; }
  }

  function redirectToLogin(msg) {
    if (msg) sessionStorage.setItem('login_message', msg);
    window.location.replace(LOGIN_URL);
  }

  function injectUserBar(user) {
    if (document.getElementById('admin-user-bar')) return;
    const bar = document.createElement('div');
    bar.id = 'admin-user-bar';
    bar.style.cssText = [
      'position:fixed','top:0','left:0','right:0','z-index:9999',
      'background:linear-gradient(135deg,#0a528e,#0d6eaa)',
      'color:#fff','font-family:"Source Sans 3",sans-serif',
      'font-size:13px','height:40px','display:flex','align-items:center',
      'padding:0 16px','box-shadow:0 2px 8px rgba(0,0,0,.25)',
      'gap:12px'
    ].join(';');
    bar.innerHTML =
      '<div style="display:flex;align-items:center;gap:8px;flex:1;">' +
        (user.picture ? '<img src="' + esc(user.picture) + '" alt="" referrerpolicy="no-referrer" style="width:26px;height:26px;border-radius:50%;border:2px solid rgba(255,255,255,.4);">' : '') +
        '<span style="opacity:.8">Signed in as</span>' +
        '<strong>' + esc(user.email) + '</strong>' +
        '<span style="background:rgba(255,255,255,.2);border-radius:10px;padding:1px 8px;font-size:11px;font-weight:600;">' + esc(user.role) + '</span>' +
      '</div>' +
      '<button id="admin-signout-btn" style="background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.3);color:#fff;border-radius:6px;padding:4px 12px;cursor:pointer;font-size:12px;font-weight:600;">Sign out</button>';

    document.body.insertBefore(bar, document.body.firstChild);

    // Push body content down
    document.body.style.paddingTop = '40px';

    document.getElementById('admin-signout-btn').addEventListener('click', async function () {
      localStorage.removeItem(TOKEN_KEY);
      await fetch('/api/auth/logout', { method: 'POST' }).catch(function(){});
      window.location.replace(LOGIN_URL);
    });
  }

  // ── Main guard ────────────────────────────────────────────
  document.documentElement.style.opacity = '0';
  document.documentElement.style.transition = 'opacity .15s';

  checkSession().then(function (user) {
    if (!user) {
      redirectToLogin('Session expired. Please sign in again.');
      return;
    }
    window.PRIVATIAN_USER  = user;
    window.PRIVATIAN_TOKEN = getToken();
    window.dispatchEvent(new CustomEvent('privatian:ready', { detail: user }));

    document.documentElement.style.opacity = '1';

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() { injectUserBar(user); });
    } else {
      injectUserBar(user);
    }
  });

})();
