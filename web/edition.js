/* edition.js — "Editorial edition" round (18 Nov 2026). Progressive
   enhancement only; the site works without it. Undo: remove the tag.
   Group 4: contact sheet, crop marks + spine, loupe, thumb index, folio,
   next-project sheet. */
(() => {
  'use strict';
  const root = document.documentElement;
  const dialog = document.querySelector('#project-dialog');
  const detail = document.querySelector('#project-detail');
  if (!dialog || !detail || !window.matchMedia) return;
  const ui = () => window.PORTFOLIO_LOCALES?.[root.lang === 'ko' ? 'ko' : 'en']?.ui || {};
  const desktop = window.matchMedia('(min-width: 1001px)');
  const wide = window.matchMedia('(min-width: 1100px)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const el = (tag, cls, html) => { const n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));

  /* ---------- Contact sheet: every page of the gallery at once ---------- */
  const sheet = el('div', 'ed-sheet');
  sheet.hidden = true; sheet.setAttribute('role', 'dialog'); sheet.setAttribute('aria-modal', 'true');
  sheet.innerHTML = '<div class="ed-sheet-bar"><h2 class="ed-sheet-title"></h2><button type="button" class="ed-sheet-close"><span aria-hidden="true">×</span></button></div><ol class="ed-sheet-grid"></ol>';
  dialog.append(sheet);
  let sheetOpener = null;
  const openSheet = opener => {
    const thumbs = [...detail.querySelectorAll('.gallery-thumbnails button')];
    if (!thumbs.length) return;
    sheetOpener = opener;
    const grid = sheet.querySelector('.ed-sheet-grid');
    const portrait = detail.querySelector('#open-image')?.classList.contains('is-spread') || (() => { const i = detail.querySelector('#gallery-image'); return i && i.naturalHeight > i.naturalWidth; })();
    sheet.classList.toggle('is-portrait', !!portrait);
    grid.innerHTML = thumbs.map((b, i) => {
      const img = b.querySelector('img');
      const src = img ? img.getAttribute('src') : '';
      const srcset = img?.getAttribute('srcset') || '';
      const current = b.getAttribute('aria-pressed') === 'true';
      return `<li style="--i:${i}"><button type="button" data-go="${i}" aria-label="${esc(b.getAttribute('aria-label') || String(i + 1))}"${current ? ' aria-current="page"' : ''}><img src="${esc(src)}"${srcset ? ` srcset="${esc(srcset)}" sizes="(max-width: 760px) 45vw, 260px"` : ''} alt="" loading="lazy" decoding="async"><span class="ed-sheet-num" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span></button></li>`;
    }).join('');
    sheet.querySelector('.ed-sheet-title').textContent = ui().sheetTitle || 'All pages';
    sheet.querySelector('.ed-sheet-close').setAttribute('aria-label', ui().sheetClose || 'Close');
    sheet.setAttribute('aria-label', ui().sheetOpen || 'All pages');
    sheet.hidden = false;
    (grid.querySelector('[aria-current]') || grid.querySelector('button'))?.focus({preventScroll: true});
    grid.querySelector('[aria-current]')?.scrollIntoView({block: 'center'});
  };
  const closeSheet = () => { if (sheet.hidden) return; sheet.hidden = true; sheetOpener?.focus({preventScroll: true}); };
  sheet.addEventListener('click', event => {
    if (event.target.closest('.ed-sheet-close')) return closeSheet();
    const go = event.target.closest('[data-go]');
    if (!go) return;
    detail.querySelectorAll('.gallery-thumbnails button')[+go.dataset.go]?.click();
    closeSheet();
    detail.querySelector('#open-image')?.focus({preventScroll: true});
  });
  dialog.addEventListener('keydown', event => {
    if (sheet.hidden) return;
    if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); closeSheet(); }
    if (event.key === 'Tab') {
      const f = [...sheet.querySelectorAll('button')]; const i = f.indexOf(document.activeElement);
      if (event.shiftKey ? i <= 0 : i === f.length - 1) { event.preventDefault(); f[event.shiftKey ? f.length - 1 : 0].focus(); }
    }
    if (/^Arrow/.test(event.key)) event.stopPropagation(); // don't turn gallery pages behind the sheet
  }, true);
  dialog.addEventListener('cancel', event => { if (!sheet.hidden) { event.preventDefault(); closeSheet(); } });
  dialog.addEventListener('close', () => { sheet.hidden = true; });

  /* ---------- Loupe: press and hold the page to magnify (desktop) ------- */
  const loupe = el('div', 'ed-loupe'); loupe.hidden = true; loupe.setAttribute('aria-hidden', 'true');
  dialog.append(loupe);
  let holdTimer = 0, loupeOn = false, loupeImg = null, swallowClick = false;
  const moveLoupe = event => {
    if (!loupeOn) return;
    const target = document.elementFromPoint(event.clientX, event.clientY);
    const img = target?.closest?.('#gallery-image, #gallery-image-b');
    if (img && !img.classList.contains('is-blank')) loupeImg = img;
    if (!loupeImg) return;
    const r = loupeImg.getBoundingClientRect(), zoom = 2.6, size = loupe.offsetWidth || 240;
    const x = Math.max(0, Math.min(r.width, event.clientX - r.left)), y = Math.max(0, Math.min(r.height, event.clientY - r.top));
    loupe.style.backgroundImage = `url("${(loupeImg.currentSrc || loupeImg.src).replace(/"/g, '%22')}")`;
    loupe.style.backgroundSize = `${r.width * zoom}px ${r.height * zoom}px`;
    loupe.style.backgroundPosition = `${size / 2 - x * zoom}px ${size / 2 - y * zoom}px`;
    loupe.style.translate = `${event.clientX - size / 2}px ${event.clientY - size / 2}px`;
  };
  const stopLoupe = () => { clearTimeout(holdTimer); if (loupeOn) { loupeOn = false; loupe.hidden = true; dialog.classList.remove('is-louping'); } };
  dialog.addEventListener('pointerdown', event => {
    if (!finePointer.matches || event.button !== 0) return;
    const img = event.target.closest?.('#gallery-image, #gallery-image-b');
    if (!img || img.classList.contains('is-blank')) return;
    loupeImg = img;
    holdTimer = setTimeout(() => { loupeOn = true; swallowClick = true; loupe.hidden = false; dialog.classList.add('is-louping'); moveLoupe(event); }, 220);
  });
  dialog.addEventListener('pointermove', moveLoupe);
  window.addEventListener('pointerup', () => { stopLoupe(); setTimeout(() => { swallowClick = false; }, 0); });
  window.addEventListener('blur', stopLoupe);
  dialog.addEventListener('dragstart', event => { if (event.target.closest?.('#open-image')) event.preventDefault(); });
  // A hold that showed the loupe must not also open the image in a new tab.
  dialog.addEventListener('click', event => { if (swallowClick && event.target.closest('#open-image')) { event.preventDefault(); event.stopImmediatePropagation(); swallowClick = false; } }, true);

  /* ---------- Thumb index: section tabs on the page edge (wide desktop) -- */
  const index = el('nav', 'ed-index'); index.hidden = true;
  dialog.append(index);
  let watcher = null;
  const buildIndex = () => {
    watcher?.disconnect();
    const sections = [];
    const gallery = detail.querySelector('.gallery');
    if (gallery) sections.push([gallery, (detail.querySelector('#project-title')?.textContent || '').trim()]);
    detail.querySelectorAll(':scope .detail-role, :scope .detail-story > *, :scope .project-materials').forEach(sec => {
      const h = sec.querySelector(':scope > h3, :scope > h4');
      const text = (h?.textContent || sec.getAttribute('aria-label') || '').trim();
      if (text) sections.push([sec, text]);
    });
    index.setAttribute('aria-label', ui().pageIndex || 'Sections');
    index.innerHTML = '<ol>' + sections.map(([, text], i) => `<li><a href="#" data-sec="${i}"><span class="ed-index-num">${String(i + 1).padStart(2, '0')}</span><span class="ed-index-label">${esc(text)}</span></a></li>`).join('') + '</ol>';
    index.hidden = !wide.matches || sections.length < 3;
    index.onclick = event => {
      const a = event.target.closest('[data-sec]'); if (!a) return;
      event.preventDefault();
      const target = sections[+a.dataset.sec][0];
      const top = target.getBoundingClientRect().top - dialog.getBoundingClientRect().top + dialog.scrollTop - (dialog.querySelector('.dialog-top')?.offsetHeight || 72) - 16;
      dialog.scrollTo({top, behavior: reduced.matches ? 'auto' : 'smooth'});
      const focusable = target.querySelector('h3, h4') || target;
      focusable.setAttribute('tabindex', '-1'); focusable.focus({preventScroll: true});
    };
    if ('IntersectionObserver' in window) {
      const links = [...index.querySelectorAll('a')];
      const seen = new Map();
      watcher = new IntersectionObserver(entries => {
        entries.forEach(e => seen.set(e.target, e.isIntersecting ? e.intersectionRect.height : 0));
        let best = -1, bestH = 0;
        sections.forEach(([sec], i) => { const h = seen.get(sec) || 0; if (h > bestH) { bestH = h; best = i; } });
        links.forEach((a, i) => { if (i === best) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current'); });
      }, {root: dialog, threshold: [0, .1, .25, .5, .75, 1]});
      sections.forEach(([sec]) => watcher.observe(sec));
    }
  };

  /* ---------- File cabinet: the project's sections as coloured cards ----
     Owner's request (18 Nov): instead of a long rail, the sections stand
     side by side like files in a cabinet (desktop) or drawers (phones).
     One is open at a time; the rest show their number and title. The
     existing section nodes are moved, not copied, so app.js stays the
     source of truth and a language switch rebuilds everything. */
  let cabinetSeq = 0;
  const buildCabinet = () => {
    const story = detail.querySelector('.detail-story');
    if (!story || story.querySelector('.ed-cabinet')) return;
    // Four files on every project (audit F8): My role, Brief, Design choices, Evidence.
    // Sections are moved, not rewritten; merged ones keep their own sub-heading.
    const L = ui();
    const buckets = [
      {title: '', nodes: []},
      {title: L.caseBrief || 'Project brief', nodes: []},
      {title: L.designChoices || 'Design choices', nodes: []},
      {title: L.evidence || 'Evidence', nodes: []}
    ];
    const put = (b, node) => { if (node) buckets[b].nodes.push(node); };
    const role = detail.querySelector('.detail-role');
    if (role) { buckets[0].title = (role.querySelector(':scope > h3')?.textContent || '').trim(); put(0, role); }
    const later = {details: null, source: null, callout: null, credit: null, evidence: null};
    [...story.children].forEach(child => {
      if (child.classList.contains('case-study')) {
        const blocks = [...child.querySelectorAll(':scope > .case-block')];
        put(1, blocks[0]); put(1, child.querySelector(':scope > .case-facts'));
        blocks.slice(1).forEach(b => { if (b.classList.contains('case-credit')) later.credit = b; else put(2, b); });
        return;
      }
      if (child.classList.contains('project-brief')) return put(1, child);
      if (child.classList.contains('detail-context')) { later.details = child; return; }
      if (child.classList.contains('evidence-section')) { later.evidence = child; return; }
      if (child.classList.contains('source-note')) { later.source = child; return; }
      if (child.classList.contains('detail-callout')) { later.callout = child; return; }
      if (child.classList.contains('story-section')) return put(2, child);
    });
    put(1, later.details);
    [later.evidence, later.callout, later.credit, later.source].forEach(n => put(3, n));
    const items = buckets.filter(b => b.nodes.length && b.title);
    if (items.length < 2) return;
    const tones = ['lime', 'ink', 'cream'];
    const id = ++cabinetSeq;
    const cab = el('div', 'ed-cabinet');
    cab.setAttribute('role', 'group');
    cab.setAttribute('aria-label', (detail.querySelector('#project-title')?.textContent || '').trim());
    items.forEach((item, i) => {
      const card = el('section', 'ed-file');
      card.dataset.tone = tones[i % 3];
      card.style.setProperty('--i', i);
      const head = el('button', 'ed-file-tab');
      head.type = 'button'; head.id = `ed-file-${id}-${i}`;
      head.setAttribute('aria-controls', `ed-body-${id}-${i}`);
      head.innerHTML = `<span class="ed-file-num" aria-hidden="true">${i + 1}</span><span class="ed-file-title">${esc(root.lang === 'ko' ? item.title.replace(/ /g, '\u2009') : item.title)}</span><span class="ed-file-plus" aria-hidden="true"></span>`;
      const body = el('div', 'ed-file-body');
      body.id = `ed-body-${id}-${i}`; body.setAttribute('role', 'region'); body.setAttribute('aria-labelledby', head.id);
      item.nodes.forEach(n => {
        n.querySelectorAll(':scope > h3, :scope > h4').forEach(h => h.classList.add(h.textContent.trim() === item.title ? 'ed-file-hidden-head' : 'ed-file-subhead'));
        body.append(n);
      });
      card.append(head, body);
      cab.append(card);
    });
    story.prepend(cab);
    // Audit M4: put the files after the cabinet in the page itself, so Tab and
    // screen-reader order match what is on screen (CSS order already shows it there).
    const mats = detail.querySelector('.detail-left > .project-materials');
    if (mats && story.parentElement) story.after(mats);
    [...story.children].forEach(c => { if (c !== cab && !c.children.length && !c.textContent.trim()) c.remove(); });
    story.querySelectorAll(':scope > .case-study').forEach(c => { if (!c.querySelector('.case-facts, .case-block')) c.remove(); });
    const open = idx => cab.querySelectorAll('.ed-file').forEach((card, i) => {
      const on = i === idx;
      card.classList.toggle('is-open', on);
      card.querySelector('.ed-file-tab').setAttribute('aria-expanded', String(on));
      card.querySelector('.ed-file-body').hidden = !on;
    });
    open(0);
    cab.addEventListener('click', event => {
      const tab = event.target.closest('.ed-file-tab'); if (!tab) return;
      const cards = [...cab.querySelectorAll('.ed-file')];
      const i = cards.indexOf(tab.closest('.ed-file'));
      if (cards[i].classList.contains('is-open') && !desktop.matches) { cards[i].classList.remove('is-open'); tab.setAttribute('aria-expanded', 'false'); cards[i].querySelector('.ed-file-body').hidden = true; return; }
      open(i);
      if (!desktop.matches) requestAnimationFrame(() => { const top = tab.getBoundingClientRect().top - dialog.getBoundingClientRect().top + dialog.scrollTop - (dialog.querySelector('.dialog-top')?.offsetHeight || 72) - 8; dialog.scrollTo({top, behavior: reduced.matches ? 'auto' : 'smooth'}); });
    });
    cab.addEventListener('keydown', event => {
      if (!/^Arrow(Left|Right|Up|Down)$/.test(event.key) || !event.target.closest('.ed-file-tab')) return;
      event.preventDefault(); event.stopPropagation();
      const tabs = [...cab.querySelectorAll('.ed-file-tab')]; const i = tabs.indexOf(event.target.closest('.ed-file-tab'));
      tabs[(i + (/Right|Down/.test(event.key) ? 1 : -1) + tabs.length) % tabs.length].focus();
    });
    // Deal the cards in once, when the cabinet comes into view.
    if (!reduced.matches && 'IntersectionObserver' in window) {
      cab.classList.add('is-waiting');
      const io = new IntersectionObserver(entries => { if (entries.some(e => e.isIntersecting)) { cab.classList.remove('is-waiting'); cab.classList.add('is-dealt'); io.disconnect(); } }, {root: dialog, threshold: .15});
      io.observe(cab);
    }
  };

  /* ---------- Folio: running foot, like the page line of a magazine ------ */
  const folio = el('p', 'ed-folio'); folio.setAttribute('aria-hidden', 'true'); folio.hidden = true;
  dialog.append(folio);
  const buildFolio = () => {
    // The project's own numeral from its band (word order differs between languages in "3 of 7").
    const currentId = history.state?.portfolioProject || (location.hash.startsWith('#project/') ? location.hash.slice(9) : '');
    const num = document.getElementById('explore-' + currentId)?.querySelector('.project-index')?.textContent.trim() || '';
    const title = (detail.querySelector('#project-title')?.textContent || '').trim();
    folio.innerHTML = `<span>Anna Ready · ${esc(ui().portfolio || 'Portfolio')}</span><span>${num ? esc(num) + ' · ' : ''}${esc(title)}</span>`;
    folio.hidden = !wide.matches;
  };

  /* ---------- Gallery decorations: crop marks, spine, "All pages" -------- */
  const decorateGallery = () => {
    const stage = detail.querySelector('#open-image');
    if (stage && !stage.querySelector('.ed-crop')) {
      stage.insertAdjacentHTML('beforeend', '<span class="ed-crop" aria-hidden="true"></span><span class="ed-spine" aria-hidden="true"></span>');
    }
    const controls = detail.querySelector('.gallery-controls');
    const thumbs = detail.querySelectorAll('.gallery-thumbnails button').length;
    if (controls && thumbs > 1 && !controls.querySelector('.ed-sheet-open')) {
      const b = el('button', 'ed-sheet-open');
      b.type = 'button';
      b.innerHTML = `<span class="ed-sheet-icon" aria-hidden="true"></span><span class="ed-sheet-label"></span>`;
      b.addEventListener('click', () => openSheet(b));
      controls.append(b);
    }
    const b = controls?.querySelector('.ed-sheet-open');
    const setText = (node, text) => { if (node && node.textContent !== text) node.textContent = text; };
    if (b) setText(b.querySelector('.ed-sheet-label'), `${ui().sheetOpen || 'All pages'} · ${thumbs}`);
    if (b) { b.querySelector('.ed-sheet-label').dataset.n = String(thumbs); b.setAttribute('aria-label', `${ui().sheetOpen || 'All pages'} · ${thumbs}`); }
    const gallery = detail.querySelector('.gallery');
    if (gallery && finePointer.matches && !gallery.querySelector('.ed-loupe-hint')) {
      const hint = el('p', 'ed-loupe-hint'); (gallery.querySelector('.gallery-controls') || gallery).append(hint);
    }
    const hint = gallery?.querySelector('.ed-loupe-hint');
    setText(hint, ui().loupeHint || '');
  };

  /* ---------- Next project: the next band's sheet rises at the foot ------ */
  const decorateNext = () => {
    // Previous and Next both show the neighbour's number, name and cover (audit F11);
    // no wrap-around: Previous is hidden on the first project, Next on the last (F12).
    const all = [...document.querySelectorAll('.project-collection > .project-card')];
    const currentId = history.state?.portfolioProject || (location.hash.startsWith('#project/') ? location.hash.slice(9) : '');
    let cards = all.filter(c => !c.hidden && getComputedStyle(c).display !== 'none');
    if (!cards.some(c => c.dataset.projectCard === currentId)) cards = all;
    const i = cards.findIndex(c => c.dataset.projectCard === currentId);
    if (i < 0) return;
    [['next', 1, ui().nextUp || 'Next'], ['previous', -1, ui().previousUp || 'Previous']].forEach(([dir, step, word]) => {
      const button = detail.querySelector(`[data-neighbor="${dir}"]`);
      if (!button) return;
      const other = cards[i + step];
      button.hidden = !other;
      button.closest('.detail-footer')?.classList.toggle('is-single', !cards[i + 1] || !cards[i - 1]);
      if (!other || button.querySelector('.ed-next')) return;
      const number = other.querySelector('.project-index')?.textContent.trim() || '';
      const title = other.querySelector('.project-title')?.textContent.trim() || '';
      const img = other.querySelector('.artifact-main-frame img');
      const src = img ? (img.currentSrc || img.src) : '';
      button.classList.add('ed-next-button');
      if (dir === 'previous') button.classList.add('ed-prev-button');
      [...button.childNodes].forEach(n => { if (n.nodeType === 3 && n.textContent.trim()) { const w = el('span', 'ed-next-old'); n.replaceWith(w); w.append(n); } });
      button.dataset.band = String((all.indexOf(other) % 7) % 4);
      const kicker = dir === 'next' ? `${esc(word)} · ${esc(number)}` : `← ${esc(word)} · ${esc(number)}`;
      button.insertAdjacentHTML('beforeend', `<span class="ed-next"><span class="ed-next-text"><span class="ed-next-kicker" aria-hidden="true">${kicker}</span><span class="ed-next-title">${esc(title)}</span></span>${src ? `<span class="ed-next-sheet" aria-hidden="true"><img src="${esc(src)}" alt="" loading="lazy" decoding="async"></span>` : ''}</span>`);
    });
  };

  const decorate = () => {
    if (!detail.querySelector('.gallery')) return;
    decorateGallery(); decorateNext(); buildCabinet(); buildFolio();
  };
  new MutationObserver(records => { if (records.some(r => [...r.addedNodes].some(n => n.nodeType === 1 && (n.classList?.contains('detail-body') || n.classList?.contains('detail-head'))))) requestAnimationFrame(decorate); }).observe(detail, {childList: true});
  // Thumbnails are re-rendered when the gallery tab changes.
  const thumbHost = () => detail.querySelector('#gallery-thumbnails');
  let pending = 0;
  new MutationObserver(() => {
    if (thumbHost()) decorateGallery();
    if (detail.querySelector('.detail-story') && !detail.querySelector('.ed-cabinet') && !pending) pending = requestAnimationFrame(() => { pending = 0; decorate(); });
  }).observe(detail, {childList: true, subtree: true});
  new MutationObserver(() => { if (dialog.open) requestAnimationFrame(decorate); }).observe(root, {attributes: true, attributeFilter: ['lang']});
  dialog.addEventListener('close', () => { index.hidden = true; folio.hidden = true; watcher?.disconnect(); stopLoupe(); });
  if (dialog.open) decorate();
})();

/* Card covers keep their own proportions before they load (CSS sets the height). */
(() => {
  const grid = document.querySelector('.project-collection');
  if (!grid) return;
  const fit = () => grid.querySelectorAll('.artifact-main-frame img[width][height]').forEach(img => {
    const w = +img.getAttribute('width'), h = +img.getAttribute('height');
    img.style.setProperty('--ar', `${w} / ${h}`); img.closest('.artifact-main-frame')?.style.setProperty('--arn', String(w / h));
  });
  fit(); new MutationObserver(fit).observe(grid, {childList: true});
})();

/* ---------- Background: parallax and the timeline line ------------------
   Position-driven (not a timed animation), so nothing can stop half-done;
   reduced motion turns it off and draws the line in full. */
(() => {
  const section = document.getElementById('background');
  if (!section || !window.matchMedia) return;
  const timeline = section.querySelector('.timeline');
  const still = window.matchMedia('(prefers-reduced-motion: reduce)');
  const items = [...section.querySelectorAll('[data-par]')];
  let frame = 0;
  const update = () => {
    frame = 0;
    const vh = innerHeight;
    if (timeline) {
      const r = timeline.getBoundingClientRect();
      const p = still.matches ? 1 : Math.max(0, Math.min(1, (vh * .6 - r.top) / r.height));
      timeline.style.setProperty('--tl-p', p.toFixed(3));
    }
    if (still.matches) { items.forEach(el => { el.style.translate = ''; }); return; }
    const narrow = innerWidth < 1001;
    items.forEach(el => {
      if (narrow && el.classList.contains('tl-year')) { el.style.translate = ''; return; }
      const r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      const offset = (r.top + r.height / 2 - vh / 2) * parseFloat(el.dataset.par || 0);
      el.style.translate = `0 ${offset.toFixed(1)}px`;
    });
  };
  const ask = () => { if (!frame) frame = requestAnimationFrame(update); };
  addEventListener('scroll', ask, {passive: true}); addEventListener('resize', ask);
  still.addEventListener?.('change', ask);
  update();
})();

/* ---------- Group 5 · Motion ------------------------------------------------ */
(() => {
  'use strict';
  if (!window.matchMedia) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* One ink bar under the main navigation: it slides to the link you point
     at and rests under the section you are reading (desktop). */
  const nav = document.querySelector('.site-header nav');
  const hover = window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 1001px)');
  if (nav && hover.matches) {
    const links = [...nav.querySelectorAll('a:not(.nav-contact)')];
    if (links.length) {
      const bar = document.createElement('span'); bar.className = 'ed-navbar'; bar.setAttribute('aria-hidden', 'true');
      nav.append(bar); nav.classList.add('has-bar');
      let resting = null;
      const place = a => {
        if (!a) { bar.style.opacity = '0'; return; }
        const n = nav.getBoundingClientRect(), r = a.getBoundingClientRect();
        bar.style.opacity = '1'; bar.style.translate = `${r.left - n.left}px 0`; bar.style.width = `${r.width}px`;
      };
      links.forEach(a => { a.addEventListener('pointerenter', () => place(a)); a.addEventListener('focus', () => place(a)); });
      nav.addEventListener('pointerleave', () => place(resting));
      nav.addEventListener('focusout', () => setTimeout(() => { if (!nav.contains(document.activeElement)) place(resting); }));
      if ('IntersectionObserver' in window) {
        const map = new Map(links.filter(a => /^#[\w-]+$/.test(a.getAttribute('href') || '')).map(a => [document.querySelector(a.getAttribute('href')), a]).filter(([t]) => t));
        const seen = new Map();
        const io = new IntersectionObserver(entries => {
          entries.forEach(e => seen.set(e.target, e.isIntersecting ? e.intersectionRatio : 0));
          let best = null, ratio = 0;
          map.forEach((a, t) => { const v = seen.get(t) || 0; if (v > ratio) { ratio = v; best = a; } });
          links.forEach(a => a === best ? a.setAttribute('aria-current', 'location') : a.removeAttribute('aria-current'));
          resting = best;
          if (!nav.matches(':hover') && !nav.contains(document.activeElement)) place(resting);
        }, {rootMargin: '-35% 0px -55% 0px', threshold: [0, .01, .5, 1]});
        map.forEach((a, t) => io.observe(t));
      }
      window.addEventListener('resize', () => place(resting));
      document.fonts?.ready.then(() => place(resting));
    }
  }

  /* 250+ / 15+ count up once when the hero first shows; the lime plate
     registers as the count lands. Screen readers get the final figure only. */
  const figures = [...document.querySelectorAll('.hero-proof strong')];
  if (figures.length && !reduced.matches && 'IntersectionObserver' in window) {
    const run = strong => {
      const final = strong.textContent; const m = final.match(/^(\D*)(\d+)(.*)$/);
      if (!m || strong.dataset.counted) return;
      strong.dataset.counted = '1';
      const target = +m[2], sr = document.createElement('span');
      sr.className = 'sr-only'; sr.textContent = final; strong.after(sr); strong.setAttribute('aria-hidden', 'true');
      strong.classList.add('ed-counting');
      const t0 = performance.now(), dur = 1100;
      const tick = now => {
        const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
        strong.textContent = m[1] + Math.round(target * e) + (k === 1 ? m[3] : '');
        if (k < 1) requestAnimationFrame(tick);
        else { strong.textContent = final; strong.removeAttribute('aria-hidden'); sr.replaceWith(); strong.classList.remove('ed-counting'); strong.classList.add('ed-counted'); }
      };
      requestAnimationFrame(tick);
    };
    const intro = document.documentElement.classList.contains('press-intro') ? 1400 : 500;
    const io = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) { io.unobserve(e.target); setTimeout(() => run(e.target), intro); } }), {threshold: .6});
    figures.forEach(f => io.observe(f));
  }
})();

/* ---------- Background: winding line + map pins (owner, 18 Nov, review 4) --
   Gives each job a data-job (matches the map pins' colours), draws a wavy
   line through the timeline (desktop shows it left to right, oldest first;
   it draws in as you scroll via --tl-p), and lights a job's pins while its
   card is hovered or focused. Undo: delete this block. */
(() => {
  const section = document.getElementById('background');
  const timeline = section?.querySelector('.timeline');
  if (!timeline || !document.createElementNS) return;
  const jobs = ['compass', 'gige', 'teacher'];
  const cards = [...timeline.querySelectorAll(':scope > article')];
  cards.forEach((card, i) => { if (jobs[i] && card.dataset.job !== jobs[i]) card.dataset.job = jobs[i]; });
  if (!timeline.querySelector('.tl-wave')) {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('class', 'tl-wave'); svg.setAttribute('viewBox', '0 0 300 40'); svg.setAttribute('preserveAspectRatio', 'none'); svg.setAttribute('aria-hidden', 'true');
    // Crosses the middle at x = 50, 150, 250: the centre of each column, where the badges sit.
    const d = 'M0 20C12 -2 38 -2 50 20S88 42 100 20S138 -2 150 20S188 42 200 20S238 -2 250 20S288 42 300 20';
    for (const cls of ['tl-wave-base', 'tl-wave-ink']) {
      const path = document.createElementNS(ns, 'path');
      path.setAttribute('class', cls); path.setAttribute('d', d); path.setAttribute('pathLength', '1'); path.setAttribute('vector-effect', 'non-scaling-stroke');
      svg.appendChild(path);
    }
    timeline.prepend(svg);
  }
  const map = section.querySelector('.work-map');
  if (!map) return;
  const light = job => { if (map.dataset.lit !== (job || '')) map.dataset.lit = job || ''; };
  cards.forEach(card => {
    card.addEventListener('mouseenter', () => light(card.dataset.job));
    card.addEventListener('mouseleave', () => light(''));
    card.addEventListener('focusin', () => light(card.dataset.job));
    card.addEventListener('focusout', () => light(''));
  });
})();

/* ---------- Background: motion for the map and the left-to-right timeline --
   Cards rise in as the wavy line reaches them (oldest first); pins drop in
   the order I worked there. Position-driven, so it never stops half-done;
   reduced motion: everything shown at once (CSS). */
(() => {
  const section = document.getElementById('background');
  const timeline = section?.querySelector('.timeline');
  const map = section?.querySelector('.work-map');
  if (!timeline || !window.matchMedia || !window.requestAnimationFrame) return;
  section.classList.add('tl-motion');
  const order = ['teacher', 'gige', 'compass'];
  const keys = ['pyeongchang', 'gangneung', 'seongnam', 'seoul'];
  if (map) {
    [...map.querySelectorAll('.map-pin')].forEach(pin => {
      const label = pin.nextElementSibling;
      const i = keys.indexOf(label?.dataset?.key);
      pin.style.setProperty('--i', String(i < 0 ? 4 : i));
    });
    map.querySelector('.map-home')?.style.setProperty('--i', '4');
  }
  let frame = 0;
  const update = () => {
    frame = 0;
    const vh = innerHeight;
    const r = timeline.getBoundingClientRect();
    const p = Math.max(0, Math.min(1, (vh * .85 - r.top) / Math.max(1, r.height * .6)));
    if (innerWidth > 1000 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) timeline.style.setProperty('--tl-p', p.toFixed(3));
    timeline.querySelectorAll(':scope > article').forEach(card => {
      const on = p > (order.indexOf(card.dataset.job) * 2 + 1) / 6 - .12;
      if (card.classList.contains('tl-on') !== on && on) card.classList.add('tl-on');
    });
    if (map && !map.classList.contains('map-on') && map.getBoundingClientRect().top < vh * .8) map.classList.add('map-on');
  };
  const ask = () => { if (!frame) frame = requestAnimationFrame(update); };
  addEventListener('scroll', ask, {passive: true}); addEventListener('resize', ask);
  update();
})();

/* ---------- Background: live layer (owner: "more futuristic and dynamic") --
   - The wavy line is rebuilt in real pixels (so dashes behave) and a lime
     light travels along it, oldest job to newest, on a loop.
   - Map: radar rings pulse out of each pin; the route keeps flowing.
   - Cards tilt toward the mouse.
   Reduced motion: the CSS turns all of it off. Undo: delete this block. */
(() => {
  const section = document.getElementById('background');
  const timeline = section?.querySelector('.timeline');
  const wave = timeline?.querySelector('.tl-wave');
  if (!wave || !window.matchMedia) return;
  const ns = 'http://www.w3.org/2000/svg';
  ['tl-wave-comet-ink', 'tl-wave-comet'].forEach(cls => {
    if (wave.querySelector('.' + cls)) return;
    const path = document.createElementNS(ns, 'path');
    path.setAttribute('class', cls); path.setAttribute('pathLength', '1');
    wave.appendChild(path);
  });
  const build = () => {
    const w = Math.round(timeline.clientWidth);
    if (!w) return;
    const cards = [...timeline.querySelectorAll(':scope > article')];
    const centres = cards.map(c => c.offsetLeft + c.offsetWidth / 2).sort((a, b) => a - b);
    const xs = [0, ...centres, w], h = 48, mid = 24, amp = 20;
    let d = `M0 ${mid}`;
    for (let i = 1; i < xs.length; i++) {
      const a = xs[i - 1], b = xs[i], dx = b - a, y = mid + (i % 2 ? -amp : amp) * 1.3;
      d += `C${(a + dx * .25).toFixed(1)} ${y} ${(b - dx * .25).toFixed(1)} ${y} ${b} ${mid}`;
    }
    wave.setAttribute('viewBox', `0 0 ${w} ${h}`); wave.setAttribute('preserveAspectRatio', 'none');
    wave.querySelectorAll('path').forEach(p => { p.setAttribute('d', d); p.removeAttribute('vector-effect'); });
  };
  build();
  addEventListener('resize', () => requestAnimationFrame(build));
  if (document.fonts?.ready) document.fonts.ready.then(build);

  const map = section.querySelector('.work-map svg');
  if (map && !map.querySelector('.map-ring')) {
    const pins = [...map.querySelectorAll('.map-pin')];
    pins.forEach((pin, i) => {
      const m = /translate\(([-\d.]+)[ ,]+([-\d.]+)\)/.exec(pin.getAttribute('transform') || '');
      if (!m) return;
      for (let k = 0; k < 2; k++) {
        const ring = document.createElementNS(ns, 'circle');
        ring.setAttribute('class', 'map-ring'); ring.setAttribute('cx', m[1]); ring.setAttribute('cy', m[2]); ring.setAttribute('r', '10');
        ring.dataset.job = pin.dataset.job;
        ring.style.setProperty('--d', `${(i * .45 + k * 1.2).toFixed(2)}s`);
        pin.parentNode.insertBefore(ring, map.querySelector('.map-route').nextSibling);
      }
    });
  }

  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  const still = window.matchMedia('(prefers-reduced-motion: reduce)');
  timeline.querySelectorAll(':scope > article').forEach(card => {
    card.addEventListener('pointermove', e => {
      if (!fine.matches || still.matches || innerWidth < 1001) return;
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      card.style.setProperty('--tx', (x * 8).toFixed(2) + 'deg'); card.style.setProperty('--ty', (-y * 8).toFixed(2) + 'deg');
    });
    card.addEventListener('pointerleave', () => { card.style.removeProperty('--tx'); card.style.removeProperty('--ty'); });
  });
})();

/* ---------- Audit round (17 Nov): tab titles, focus, tool names, thumbnails,
   missing projects. Undo: delete this block. */
(() => {
  const root = document.documentElement;
  const ui = () => window.PORTFOLIO_LOCALES?.[root.lang === 'ko' ? 'ko' : 'en']?.ui || {};
  const dialog = document.getElementById('project-dialog');
  const detail = document.getElementById('project-detail');
  const baseTitle = document.title;

  // B2: the browser tab names the open project. F3: focus lands on the title, not Close.
  const onProject = () => {
    if (!dialog?.open) return;
    const title = (detail?.querySelector('#project-title')?.textContent || '').trim();
    const want = title ? `${title} — Anna Ready` : baseTitle;
    if (document.title !== want) document.title = want;
  };
  if (dialog && detail) {
    new MutationObserver(onProject).observe(detail, {childList: true});
    new MutationObserver(() => {
      if (!dialog.open) { document.title = baseTitle; return; }
      onProject();
      setTimeout(() => {
        const h = detail.querySelector('#project-title');
        if (!h || dialog.querySelector('.zoom-view:not([hidden])')) return;
        const a = document.activeElement;
        if (a && a !== dialog && a !== document.body && !a.closest('.dialog-top')) return;
        h.setAttribute('tabindex', '-1'); h.focus({preventScroll: true});
      }, 120);
    }).observe(dialog, {attributes: true, attributeFilter: ['open']});
    // Direct links open the page before this script runs: focus the title once loaded.
    const focusTitle = () => { if (!dialog.open) return; onProject(); const h = detail.querySelector('#project-title'); const a = document.activeElement; if (h && (!a || a === document.body || a === dialog || a.closest('.dialog-top'))) { h.setAttribute('tabindex', '-1'); h.focus({preventScroll: true}); } };
    if (document.readyState === 'complete') setTimeout(focusTitle, 150); else window.addEventListener('load', () => setTimeout(focusTitle, 150));
  }

  // B5: hide a tool's caption when it only repeats the name (e.g. "Canva" / "Canva").
  const tidySkills = () => document.querySelectorAll('.software-skills li').forEach(li => {
    const name = (li.querySelector('span[data-i18n^="skills."]:not(.skill-alt):not(.skill-desc)')?.textContent || '').trim().toLowerCase();
    const alt = li.querySelector('.skill-alt'); if (!alt) return;
    const a = alt.textContent.trim().toLowerCase();
    const dup = !!a && name.startsWith(a);
    if (alt.hidden !== dup) alt.hidden = dup;
  });
  tidySkills();
  new MutationObserver(tidySkills).observe(root, {attributes: true, attributeFilter: ['lang']});
  setTimeout(tidySkills, 300);

  // S10: the thumbnail strip is one Tab stop; arrow keys move along it.
  const rove = () => {
    const strip = detail?.querySelector('#gallery-thumbnails'); if (!strip) return;
    const btns = [...strip.querySelectorAll('button')]; if (!btns.length) return;
    const cur = btns.find(b => b.getAttribute('aria-current') === 'true' || b.getAttribute('aria-pressed') === 'true' || b.classList.contains('active')) || btns[0];
    btns.forEach(b => { const t = b === cur ? '0' : '-1'; if (b.getAttribute('tabindex') !== t) b.setAttribute('tabindex', t); });
    if (!strip.dataset.roving) {
      strip.dataset.roving = '1';
      strip.addEventListener('keydown', e => {
        if (!/^Arrow(Left|Right)$/.test(e.key)) return;
        const list = [...strip.querySelectorAll('button')]; const i = list.indexOf(document.activeElement); if (i < 0) return;
        e.preventDefault(); e.stopPropagation();
        const n = list[Math.max(0, Math.min(list.length - 1, i + (e.key === 'ArrowRight' ? 1 : -1)))];
        n.click(); requestAnimationFrame(() => { (strip.querySelectorAll('button')[list.indexOf(n)] || n).focus(); });
      });
    }
  };
  if (detail) new MutationObserver(rove).observe(detail, {childList: true, subtree: true, attributes: true, attributeFilter: ['aria-current', 'aria-pressed', 'class']});

  // S9: a link to a project that doesn't exist says so instead of failing silently.
  const missing = () => {
    if (!location.hash.startsWith('#project/')) return;
    const id = decodeURIComponent(location.hash.slice(9));
    if ((window.PORTFOLIO_PROJECTS || []).some(p => p.id === id)) return;
    const note = document.createElement('p');
    note.className = 'ed-missing'; note.setAttribute('role', 'status');
    note.textContent = ui().projectMissing || 'That project isn’t here.';
    document.body.append(note);
    setTimeout(() => note.classList.add('is-out'), 5200);
    setTimeout(() => note.remove(), 6000);
    const work = document.getElementById('work');
    if (work) setTimeout(() => work.scrollIntoView({block: 'start'}), 50);
  };
  if (document.readyState === 'complete') missing(); else window.addEventListener('load', missing);
})();
