/**
 * Root script.js — loader for assets/js/script.js
 */
(function() {
  if (typeof window !== 'undefined') {
    const s = document.createElement('script');
    s.src = 'assets/js/script.js';
    document.head.appendChild(s);
  }
})();
