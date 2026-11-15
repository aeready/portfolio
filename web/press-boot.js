/* Opening sequence gate (Manifesto R6). Runs before first paint so the page
   never flashes before the sheet. Once per browser session; never under
   reduced motion; never on a direct link to a project. */
(function () {
  try {
    var root = document.documentElement;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (location.hash.indexOf('#project/') === 0) return;
    if (sessionStorage.getItem('press-intro-seen')) return;
    sessionStorage.setItem('press-intro-seen', '1');
    root.classList.add('press-intro');
  } catch (e) { /* storage blocked: no sequence */ }
})();
