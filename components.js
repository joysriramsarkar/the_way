/**
 * Root components.js — loader for assets/js/components.js
 */
(function() {
  if (typeof window !== 'undefined') {
    const s = document.createElement('script');
    s.src = 'assets/js/components.js';
    if (!window.TheWayComponents) {
      document.head.appendChild(s);
    }
  }
})();
