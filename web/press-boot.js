/* Opening sequence gate (Manifesto R6). Runs before first paint so the page
   never flashes before the sheet. Once per browser session; never under
   reduced motion; never on a direct link to a project. */
(function () {
  try {
    var root = document.documentElement;
    root.classList.add('js');
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (location.hash.indexOf('#project/') === 0) return;
    if (sessionStorage.getItem('press-intro-seen')) return;
    sessionStorage.setItem('press-intro-seen', '1');
    root.classList.add('press-intro');
  } catch (e) { /* storage blocked: no sequence */ }
})();

/* Korean font on demand: English visitors never download it for layout. When Korean is already chosen
   (saved) we preload it at once; otherwise app.js calls warmKo() when the language button is approached. */
(function () {
  var done = false;
  window.warmKo = function () {
    if (done) return; done = true;
    try {
      var m = document.querySelector('meta[name="ko-fonts"]');
      (m ? m.content.split(',') : []).forEach(function (href) {
        var l = document.createElement('link');
        l.rel = 'preload'; l.as = 'font'; l.type = 'font/woff2'; l.crossOrigin = 'anonymous'; l.href = href;
        document.head.appendChild(l);
      });
    } catch (e) { /* font loads normally via @font-face when Korean text appears */ }
  };
  try { if (localStorage.getItem('portfolio-language') === 'ko') window.warmKo(); } catch (e) {}
})();
