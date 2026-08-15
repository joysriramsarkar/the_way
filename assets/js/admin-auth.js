/* ═══════════════════════════════════════════════════════════
   THE WAY (দ্য ওয়ে) — Admin Auth Frontend Guard
   Instant zero-delay local JWT verification + background live DB checks.
═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const TOKEN_KEY = 'theway_token';
  const LOGIN_URL = '/admin-login.html';

  function getToken() { return localStorage.getItem(TOKEN_KEY) || ''; }

  function esc(s) {
    return String(s || '')
      .replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function parseJwt(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch(e) {
      return null;
    }
  }

  function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    document.cookie = 'theway_session=; Max-Age=0; path=/';
  }

  function redirectToLogin(msg) {
    clearSession();
    if (msg) sessionStorage.setItem('login_message', msg);
    window.location.replace(LOGIN_URL);
  }

  function injectSidebarUser(user) {
    function inject() {
      const sidebarFooter = document.querySelector('.sidebar-footer');
      if (!sidebarFooter) return;

      let profile = document.getElementById('sidebar-user-profile');
      if (!profile) {
        profile = document.createElement('div');
        profile.id = 'sidebar-user-profile';
        profile.className = 'sidebar-user-profile';
        sidebarFooter.insertBefore(profile, sidebarFooter.firstChild);
      }

      const initials = (user.name || user.email || 'U').split(' ').map(function(w){return w[0];}).slice(0,2).join('').toUpperCase();
      const avatarHtml = user.picture
        ? '<img class="sidebar-user-avatar" src="' + esc(user.picture) + '" alt="' + esc(user.name) + '" onerror="this.outerHTML=\'<span class=\\\'sidebar-user-avatar-initials\\\'>' + esc(initials) + '</span>\'" />'
        : '<span class="sidebar-user-avatar-initials">' + esc(initials) + '</span>';

      profile.innerHTML =
        avatarHtml +
        '<div class="sidebar-user-info">' +
          '<div class="sidebar-user-name" title="' + esc(user.name) + '">' + esc(user.name || user.email) + '</div>' +
          '<div class="sidebar-user-role-badge ' + (user.role === 'Admin' ? 'role-admin' : 'role-staff') + '">' + esc(user.role || 'Staff') + '</div>' +
        '</div>';
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', inject);
    } else {
      inject();
    }
  }

  const token = getToken();
  if (!token) {
    redirectToLogin();
    return;
  }

  const payload = parseJwt(token);
  if (!payload || !payload.exp || (payload.exp * 1000) < Date.now()) {
    redirectToLogin('Your session has expired. Please sign in again.');
    return;
  }

  window.__ADMIN_USER = {
    email:   payload.email,
    name:    payload.name || payload.email.split('@')[0],
    picture: payload.picture || '',
    role:    payload.role || 'Staff'
  };

  injectSidebarUser(window.__ADMIN_USER);

  // Background non-blocking verification
  fetch('/api/auth?action=me', {
    headers: { 'Authorization': 'Bearer ' + token }
  })
  .then(function(res) {
    if (res.status === 401) {
      redirectToLogin('Session invalid or revoked. Please sign in again.');
      return;
    }
    if (!res.ok) return;
    return res.json();
  })
  .then(function(data) {
    if (!data || !data.user) return;
    if (data.user.role && data.user.role !== window.__ADMIN_USER.role) {
      redirectToLogin('Your permissions were updated. Please sign in again.');
      return;
    }
    window.__ADMIN_USER.role = data.user.role || window.__ADMIN_USER.role;
    window.__ADMIN_USER.name = data.user.name || window.__ADMIN_USER.name;
    window.__ADMIN_USER.picture = data.user.picture || window.__ADMIN_USER.picture;
    injectSidebarUser(window.__ADMIN_USER);
  })
  .catch(function(err) {
    console.warn('[TheWay Auth] Background verify notice:', err.message);
  });

  window.adminLogout = function () {
    clearSession();
    fetch('/api/auth?action=logout', { credentials: 'omit' }).catch(function(){});
    window.location.replace(LOGIN_URL);
  };

})();