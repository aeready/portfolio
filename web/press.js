/* annaready.kr — press run behaviours (Manifesto R6).
   Progressive enhancement only: every element works without this file. */
(() => {
  'use strict';
  const root = document.documentElement;
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? true;

  /* ---------- Opening sequence: tap or key skips; removed when done ------ */
  const sheet = document.querySelector('.press-intro-sheet');
  if (sheet) {
    const finish = () => { root.classList.remove('press-intro'); sheet.remove(); };
    if (!root.classList.contains('press-intro')) sheet.remove();
    else {
      const skip = () => { sheet.classList.add('is-skipped'); };
      sheet.addEventListener('pointerdown', skip, {once: true});
      window.addEventListener('keydown', skip, {once: true});
      sheet.addEventListener('animationend', event => { if (event.target === sheet) finish(); });
      window.setTimeout(finish, 2200); // safety net
    }
  }

  /* ---------- Project pages: carry the band's colour, number and riso piece */
  const dialog = document.querySelector('#project-dialog');
  const detail = document.querySelector('#project-detail');
  const grid = document.querySelector('#project-grid');
  let currentId = null, goContact = false;
  const projectId = () => history.state?.portfolioProject || (location.hash.startsWith('#project/') ? location.hash.slice(9) : null);
  const cardFor = id => id ? document.getElementById('explore-' + id) : null;
  function decorate() {
    if (!dialog?.open) return;
    currentId = projectId() || currentId;
    const card = cardFor(currentId);
    const head = detail?.querySelector('.detail-head');
    if (!card || !head) return;
    const cards = [...grid.querySelectorAll('.project-card')];
    const index = cards.indexOf(card);
    dialog.dataset.band = ['2', '3', '1'][index % 3]; // lime, aubergine, cream: same cycle as the bands
    dialog.style.setProperty('--orn', getComputedStyle(card).getPropertyValue('--orn'));
    if (!head.querySelector('.detail-number')) {
      const number = document.createElement('span');
      number.className = 'detail-number'; number.setAttribute('aria-hidden', 'true');
      number.textContent = card.querySelector('.project-index')?.textContent || '';
      head.prepend(number);
    }
  }
  if (dialog && detail && grid) {
    new MutationObserver(decorate).observe(detail, {childList: true});
    new MutationObserver(() => { if (dialog.open) decorate(); }).observe(dialog, {attributes: true, attributeFilter: ['open']});
    // Direct links open the page before the bands exist: decorate again once they do (audit B1).
    new MutationObserver(() => { if (dialog.open) decorate(); }).observe(grid, {childList: true});
    window.addEventListener('load', () => { if (dialog.open) decorate(); });

    /* Contact from a project page: close the page, then land on Contact. */
    dialog.querySelector('.dialog-contact')?.addEventListener('click', event => {
      event.preventDefault();
      goContact = true;
      document.querySelector('#close-dialog')?.click();
    });

    /* Back on the main page: re-print the band you came from. */
    dialog.addEventListener('close', () => {
      const id = currentId; currentId = null;
      if (goContact) {
        goContact = false;
        window.setTimeout(() => {
          document.querySelector('#contact')?.scrollIntoView({behavior: 'instant', block: 'start'});
          document.querySelector('#contact-email')?.focus({preventScroll: true});
        }, reduceMotion ? 0 : 640);
        return;
      }
      if (reduceMotion) return;
      window.setTimeout(() => {
        const card = cardFor(id);
        if (!card) return;
        card.querySelectorAll('.return-stamp, .return-sweep').forEach(el => el.remove());
        const numeral = card.querySelector('.project-index');
        const box = card.getBoundingClientRect(), n = numeral?.getBoundingClientRect();
        const stamp = document.createElement('span'), sweep = document.createElement('span');
        stamp.className = 'return-stamp'; sweep.className = 'return-sweep';
        stamp.setAttribute('aria-hidden', 'true'); sweep.setAttribute('aria-hidden', 'true');
        if (n) {
          stamp.style.left = `${n.left - box.left}px`; stamp.style.top = `${n.top - box.top}px`;
          sweep.style.top = `${n.top - box.top + n.height * .62}px`;
        }
        card.append(sweep, stamp);
        card.classList.remove('is-returning'); void card.offsetWidth; card.classList.add('is-returning');
        window.setTimeout(() => { card.classList.remove('is-returning'); stamp.remove(); sweep.remove(); }, 1700);
      }, 560);
    });
  }

  /* ---------- Header height for the phone menu sheet ---------------------- */
  const header = document.querySelector('.site-header');
  const setHeader = () => header && root.style.setProperty('--header-h', `${Math.round(header.getBoundingClientRect().height)}px`);
  setHeader(); window.addEventListener('resize', setHeader, {passive: true});

  /* ---------- Phone filters: a single "Filter: …" control ------------------ */
  const tools = document.querySelector('.work-tools');
  const filters = document.querySelector('#category-filters');
  if (tools && filters) {
    const ui = () => window.PORTFOLIO_LOCALES?.[root.lang === 'ko' ? 'ko' : 'en']?.ui || {};
    const toggle = document.createElement('button');
    toggle.type = 'button'; toggle.className = 'filter-toggle';
    toggle.setAttribute('aria-expanded', 'false'); toggle.setAttribute('aria-controls', 'category-filters');
    tools.prepend(toggle); tools.classList.add('has-toggle');
    const label = () => {
      const active = filters.querySelector('[aria-pressed="true"]');
      const span = (cls, text) => { const s = document.createElement('span'); s.className = cls; s.textContent = text; return s; };
      toggle.replaceChildren(span('ft-label', ui().filterBy || 'Filter'), span('ft-value', `${active?.textContent.trim() || ''} ${active?.dataset.count || ''}`.trim()), span('ft-caret', '▾'));
      toggle.lastChild.setAttribute('aria-hidden', 'true');
    };
    const setOpen = open => { tools.classList.toggle('is-open', open); toggle.setAttribute('aria-expanded', String(open)); };
    toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
    filters.addEventListener('click', event => { if (event.target.closest('button[data-filter]')) { setOpen(false); toggle.focus({preventScroll: true}); } });
    new MutationObserver(label).observe(filters, {subtree: true, attributes: true, attributeFilter: ['aria-pressed', 'data-count'], childList: true, characterData: true});
    new MutationObserver(label).observe(root, {attributes: true, attributeFilter: ['lang']});
    label();
  }

  /* ---------- Gallery: the halftone shadow follows the current print ------- */
  const fitShadow = img => {
    const stage = img?.parentElement;
    if (!stage || !img.isConnected) return;
    const b = stage.getBoundingClientRect();
    const pages = [...stage.querySelectorAll('img, .gallery-end:not([hidden])')].filter(i => !i.classList.contains('is-blank') && getComputedStyle(i).visibility !== 'hidden').map(i => i.getBoundingClientRect()).filter(r => r.width);
    if (!pages.length) return;
    const a = {left: Math.min(...pages.map(r => r.left)), top: Math.min(...pages.map(r => r.top)), width: Math.max(...pages.map(r => r.right)) - Math.min(...pages.map(r => r.left)), height: Math.max(...pages.map(r => r.bottom)) - Math.min(...pages.map(r => r.top))};
    stage.style.setProperty('--sx', `${a.left - b.left}px`); stage.style.setProperty('--sy', `${a.top - b.top}px`);
    stage.style.setProperty('--sw', `${a.width}px`); stage.style.setProperty('--sh', `${a.height}px`);
  };
  const sizeWatch = 'ResizeObserver' in window ? new ResizeObserver(entries => entries.forEach(e => fitShadow(e.target))) : null;
  document.addEventListener('load', event => {
    const img = event.target;
    if (img?.id !== 'gallery-image' && img?.id !== 'gallery-image-b') return;
    sizeWatch?.observe(img);
    requestAnimationFrame(() => requestAnimationFrame(() => fitShadow(document.getElementById('gallery-image'))));
  }, true);

  /* ---------- Gallery height fitted to the project's tallest slide -------- */
  const fitStage = () => {
    const stage = document.querySelector('#project-dialog .gallery-stage');
    const ratios = [...document.querySelectorAll('#project-dialog .gallery-thumbnails img')].map(i =>
      i.naturalWidth ? i.naturalHeight / i.naturalWidth : (+i.getAttribute('height') || 0) / (+i.getAttribute('width') || 1)).filter(r => r > 0);
    if (!stage || !ratios.length) return;
    const tallest = Math.max(...ratios);
    const cap = window.innerWidth > 1000 ? window.innerHeight - 330 : window.innerHeight * .52; // desktop: page + strip fit one screen
    const spread = window.innerWidth > 1000 && tallest > 1.15;
    const h = Math.min(cap, 760, stage.getBoundingClientRect().width * tallest / (spread ? 2 : 1));
    if (h > 0) stage.style.setProperty('--stage-h', `${Math.round(h)}px`);
  };
  const galleryHost = document.querySelector('#project-detail');
  if (galleryHost) {
    new MutationObserver(() => requestAnimationFrame(fitStage)).observe(galleryHost, {childList: true, subtree: true});
    new MutationObserver(() => { const go = () => fitShadow(document.getElementById('gallery-image')); requestAnimationFrame(go); clearTimeout(window.__fitT); window.__fitT = setTimeout(go, 650); }).observe(galleryHost, {subtree: true, attributes: true, attributeFilter: ['class', 'src']});
  }
  window.addEventListener('resize', fitStage, {passive: true});
  document.addEventListener('load', e => { if (e.target?.closest?.('#project-dialog .gallery-thumbnails')) fitStage(); }, true);

  /* ---------- Phones: tap the page to view it full screen and zoom -------- */
  const dlg = document.querySelector('#project-dialog');
  if (dlg && window.matchMedia) {
    const phone = window.matchMedia('(max-width: 760px)');
    const ui = () => window.PORTFOLIO_LOCALES?.[root.lang === 'ko' ? 'ko' : 'en']?.ui || {};
    const view = document.createElement('div');
    view.className = 'zoom-view'; view.hidden = true;
    view.setAttribute('role', 'dialog'); view.setAttribute('aria-modal', 'true');
    view.innerHTML = '<div class="zv-bar"><span class="zv-hint"></span><button type="button" class="zv-close">×</button></div><div class="zv-scroll"><img alt=""></div><div class="zv-nav"><button type="button" class="zv-prev">←</button><span class="zv-count"></span><button type="button" class="zv-next">→</button></div>';
    dlg.append(view);
    const big = view.querySelector('img');
    const sync = () => {
      const src = document.getElementById('gallery-image');
      if (!src) return;
      big.src = src.currentSrc || src.src; big.alt = src.alt;
      view.querySelector('.zv-count').textContent = ((document.getElementById('slide-count')?.textContent || '').match(/^\s*[\d–]+\s*\/\s*\d+/) || [''])[0];
      view.querySelector('.zv-prev').disabled = !!document.getElementById('previous-slide')?.disabled;
      view.querySelector('.zv-next').disabled = !!document.getElementById('next-slide')?.disabled;
      view.querySelector('.zv-hint').textContent = ui().zoomHint || '';
      view.querySelector('.zv-close').setAttribute('aria-label', ui().zoomClose || 'Close');
      view.querySelector('.zv-prev').setAttribute('aria-label', ui().previousSample || 'Previous');
      view.querySelector('.zv-next').setAttribute('aria-label', ui().nextSample || 'Next');
      view.classList.remove('is-zoomed');
    };
    let opener = null;
    const close = () => { view.hidden = true; opener?.focus({preventScroll: true}); };
    dlg.addEventListener('click', event => {
      const stage = event.target.closest('#open-image');
      if (!stage) return; // click opens the large view on every screen (audit F5)
      event.preventDefault(); opener = stage; sync(); view.hidden = false; view.querySelector('.zv-close').focus();
    }, true);
    view.querySelector('.zv-close').addEventListener('click', close);
    view.querySelector('.zv-prev').addEventListener('click', () => { document.getElementById('previous-slide')?.click(); requestAnimationFrame(sync); });
    view.querySelector('.zv-next').addEventListener('click', () => { document.getElementById('next-slide')?.click(); requestAnimationFrame(sync); });
    big.addEventListener('click', event => {
      const scroller = view.querySelector('.zv-scroll');
      const fx = event.offsetX / big.clientWidth, fy = event.offsetY / big.clientHeight;
      view.classList.toggle('is-zoomed');
      requestAnimationFrame(() => { scroller.scrollLeft = fx * big.clientWidth - scroller.clientWidth / 2; scroller.scrollTop = fy * big.clientHeight - scroller.clientHeight / 2; });
    });
    dlg.addEventListener('keydown', event => {
      if (view.hidden) return;
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(); }
      if (event.key === 'Tab') { const f = [...view.querySelectorAll('button:not(:disabled)')]; const i = f.indexOf(document.activeElement); if (event.shiftKey ? i <= 0 : i === f.length - 1) { event.preventDefault(); f[event.shiftKey ? f.length - 1 : 0].focus(); } }
    }, true);
    dlg.addEventListener('cancel', event => { if (!view.hidden) { event.preventDefault(); close(); } });
    dlg.addEventListener('close', () => { view.hidden = true; });
  }

  /* ---------- Motion v2: print each element once when it arrives ---------- */
  if (!reduceMotion && 'IntersectionObserver' in window) {
    const selector = '.project-card, #work .section-heading, .work-tools, .section-ribbon, .background-intro, .timeline article, .qualifications, .contact-section > div, .contact-links';
    const io = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in'); io.unobserve(entry.target);
    }), {threshold: 0.12, rootMargin: '0px 0px -6% 0px'});
    const arm = scope => (scope.matches?.(selector) ? [scope] : [...scope.querySelectorAll(selector)]).forEach(el => {
      if (el.classList.contains('rv')) return;
      el.classList.add('rv');
      io.observe(el);
    });
    root.classList.add('rv-on');
    // Keyboard users never land on an element that is still waiting to print.
    document.addEventListener('focusin', e => e.target.closest?.('.rv:not(.is-in)')?.classList.add('is-in'));
    arm(document);
    const grid2 = document.querySelector('#project-grid');
    if (grid2) new MutationObserver(records => records.forEach(r => r.addedNodes.forEach(n => n.nodeType === 1 && arm(n)))).observe(grid2, {childList: true});
    // Safety: anything still waiting after 4 s (e.g. a print-preview) is shown.
    window.setTimeout(() => document.querySelectorAll('.rv:not(.is-in)').forEach(el => { if (el.getBoundingClientRect().top < innerHeight) el.classList.add('is-in'); }), 4000);
    window.addEventListener('beforeprint', () => document.querySelectorAll('.rv').forEach(el => el.classList.add('is-in')));
  }

  /* ---------- In-page links land where they say ------------------------
     Lazy images load during a smooth scroll and push the target down, so
     the jump falls short. After the scroll settles, correct it once. */
  document.addEventListener('click', event => {
    const link = event.target.closest?.('a[href^="#"]');
    const hash = link?.getAttribute('href');
    if (!hash || hash === '#' || hash.startsWith('#project/')) return;
    const target = document.querySelector(hash);
    if (!target) return;
    let settled = 0;
    const land = () => {
      const pad = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
      const off = target.getBoundingClientRect().top - pad;
      if (hash === '#home' ? window.scrollY > 2 : Math.abs(off) > 4) {
        if (hash === '#home') window.scrollTo({top: 0, behavior: 'instant'});
        else window.scrollTo({top: window.scrollY + off, behavior: 'instant'});
      }
    };
    const onEnd = () => { if (settled++) return; window.removeEventListener('scrollend', onEnd); land(); window.setTimeout(land, 250); };
    window.addEventListener('scrollend', onEnd);
    window.setTimeout(onEnd, 1600);
  });

  /* ---------- Spot varnish follows the pointer across covers (desktop) ---- */
  if (window.matchMedia?.('(hover: hover) and (pointer: fine)').matches && !reduceMotion) {
    document.addEventListener('pointermove', event => {
      const frame = event.target.closest?.('.project-card .artifact-main-frame, #project-dialog .gallery-stage, .hero-art');
      if (!frame) return;
      const r = frame.getBoundingClientRect();
      const t = (event.clientX - r.left) / r.width;              // 0 at left, 1 at right
      frame.style.setProperty('--gx', `${130 - t * 160}%`);      // light travels with the pointer
    }, {passive: true});
  }

  /* Registration cursor removed 18 Nov 2026 (owner's request). */
})();
