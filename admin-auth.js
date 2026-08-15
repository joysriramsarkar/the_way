/**
 * Root admin-auth.js — loader for assets/js/admin-auth.js
 */
(function() {
  if (typeof window !== 'undefined') {
    const s = document.createElement('script');
    s.src = 'assets/js/admin-auth.js';
    document.head.appendChild(s);
  }
})();
