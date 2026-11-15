(() => {
  'use strict';
  const baseProjects = window.PORTFOLIO_PROJECTS || [];
  const variants = window.PORTFOLIO_PREVIEWS || {};
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const projectTitleMarkup = value => escape(value)
    .replace(/USA Camp ·/g, 'USA Camp&nbsp;·')
    .replace(/12-period/g, '<span class="nowrap">12-period</span>');
  let language = 'en';
  try { if (localStorage.getItem('portfolio-language') === 'ko') language = 'ko'; } catch {}
  let category = 'all', activeProject = null, slideIndex = 0, activeGallery = 'slides', lastFocus = null, projects = [];
  const dialog = $('#project-dialog'), grid = $('#project-grid');
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? true;
  const revealSelectors = '.hero-art,.hero-copy,.section-heading,.work-tools,.project-card,.section-intro,.training-rows,.timeline article,.qualifications,.contact-section';
  let revealObserver = null;
  let listScrollY = 0, closingProject = false;
  let sectionObserver = null, timelineObserver = null;
  // Press run (R6): the card's cover morphs into the project page's gallery and back,
  // while the page itself feeds in and out like a sheet. Native View Transitions only;
  // without them (or under reduced motion) the page simply opens and closes.
  const supportsViewTransitions = typeof document.startViewTransition === 'function';
  function withViewTransition(callback, sharedCard = null, direction = '') {
    if (reduceMotion || !supportsViewTransitions) { callback(); return; }
    const cardCover = () => sharedCard?.querySelector?.('.artifact-main-frame') || null;
    const pageCover = () => $('#open-image');
    const name = (el, value) => { if (el) el.style.viewTransitionName = value; };
    try {
      document.documentElement.classList.add('vt-' + (direction || 'swap'));
      name(direction === 'close' ? pageCover() : cardCover(), 'project-cover');
      const transition = document.startViewTransition(() => {
        name(direction === 'close' ? pageCover() : cardCover(), '');
        callback();
        name(direction === 'close' ? cardCover() : pageCover(), 'project-cover');
      });
      const cleanup = () => {
        name(cardCover(), ''); name(pageCover(), '');
        document.documentElement.classList.remove('vt-open', 'vt-close', 'vt-swap');
      };
      transition.ready.catch(() => {});
      transition.finished.then(cleanup, cleanup);
      return transition;
    } catch { name(cardCover(), ''); name(pageCover(), ''); document.documentElement.classList.remove('vt-open', 'vt-close', 'vt-swap'); callback(); }
  }
  function prepareReveals(root = document) {
    if (reduceMotion || !('IntersectionObserver' in window)) return;
    const targets = [...root.querySelectorAll(revealSelectors)].filter(el => !el.classList.contains('is-revealed'));
    targets.forEach((el, index) => {
      const siblings = [...el.parentElement.children].filter(sibling => sibling.matches(revealSelectors));
      const siblingIndex = siblings.indexOf(el);
      el.style.setProperty('--reveal-delay', `${Math.min(3,Math.max(0, siblingIndex)) * 50}ms`);
      if (el.getBoundingClientRect().top < window.innerHeight) { el.classList.add('is-revealed'); return; }
      el.classList.add('will-reveal');
      revealObserver.observe(el);
    });
  }
  if (!reduceMotion && 'IntersectionObserver' in window) {
    revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-revealed');
        revealObserver.unobserve(entry.target);
      });
    }, {threshold: 0.12, rootMargin: '0px 0px -4% 0px'});

    timelineObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-drawn');
        timelineObserver.unobserve(entry.target);
      });
    }, {threshold:0.18});
    document.documentElement.classList.add('motion-ready');
  }
  if ('IntersectionObserver' in window) {
    sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        navLinksForSections().forEach(link => {
          if (link.hash === `#${id}`) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, {rootMargin:'-20% 0px -65% 0px', threshold:0});
  }
  function navLinksForSections() { return $$('#navigation a[href^="#"]'); }
  const t = (key, vars = {}) => {
    const value = window.PORTFOLIO_LOCALES[language].ui[key];
    if (value === undefined) throw Error('Missing translation: ' + key);
    return value.replace(/\{(\w+)\}/g, (_, name) => String(vars[name] ?? ''));
  };
  function localize(project) {
    if (language === 'en') return project;
    return {...project, ...project.ko,
      slides: project.slides.map((slide, i) => [slide[0], ...project.ko.slides[i]]),
      documents: project.documents.map((doc, i) => [doc[0], ...project.ko.documents[i]]),
      bookSlides: project.bookSlides?.map((slide, i) => [slide[0], ...project.ko.bookSlides[i]])};
  }
  function previewImage(src, sizes, eager = false) {
    const asset = variants[src];
    const loading = eager ? 'eager' : 'lazy';
    if (!asset) return `<img class="preview-image image-pending" src="${escape(src)}" alt="" loading="${loading}" decoding="async">`;
    const small = asset.outputs[0];
    const candidates = asset.outputs.map(v => `${v.path} ${v.width}w`);
    // Offer the full-size original too, so covers stay sharp on high-density screens.
    if (asset.width > Math.max(...asset.outputs.map(v => v.width))) candidates.push(`${src} ${asset.width}w`);
    const srcset = candidates.join(', ');
    return `<img class="preview-image image-pending" src="${escape(small.path)}" srcset="${escape(srcset)}" sizes="${escape(sizes)}" width="${asset.width}" height="${asset.height}" alt="" loading="${loading}" decoding="async">`;
  }
  function wirePreviewImages(root) {
    if (typeof root.querySelectorAll !== 'function') return;
    root.querySelectorAll('.image-pending').forEach(img => {
      const ready = () => img.classList.remove('image-pending');
      img.addEventListener('load', ready, {once:true});
      img.addEventListener('error', ready, {once:true});
      if (img.complete) ready();
    });
  }
  const matchedProjects = () => projects.filter(p => category === 'all' || p.categories.includes(category));
  function renderProjects() {
    const visible = matchedProjects();
    grid.innerHTML = visible.map((p, position) => {
      const featured = ['adult-communication', 'reading-for-meaning', 'epik-music'].includes(p.id);
      const previews = [p.cover, p.previewSecondary, p.previewTertiary].filter(Boolean);
      const previewButtons = previews.map((src, index) => {
        const sample = p.previewIndices[index];
        const caption = p.slides[sample][1];
        const name = index === 0 ? 'artifact-main' : index === 1 ? 'artifact-fixed' : 'artifact-fixed artifact-tertiary';
        const sizes = index === 0
          ? '(max-width: 900px) calc(100vw - 64px), (min-width: 1100px) 600px, 56vw'
          : featured ? '(max-width: 760px) 34vw, 180px' : '(min-width: 1100px) 150px, (max-width: 760px) 34vw, 18vw';
        const frame = `<span id="preview-${escape(p.id)}-${index}" class="preview-open ${name}" data-preview="${sample}" title="${escape(caption)}" aria-hidden="true">${previewImage(src, sizes)}</span>`;
        return index === 0 ? `<div class="artifact-main-frame">${frame}</div>` : frame;
      }).join('');
      return `<a id="explore-${escape(p.id)}" class="project-card project-${escape(p.number)} ${featured ? 'is-featured' : 'is-compact'}" href="#project/${escape(p.id)}" data-project="${escape(p.id)}" data-project-card="${escape(p.id)}" aria-controls="project-dialog" aria-label="${escape(t('exploreAria', {title:p.title}))}"><header class="project-heading"><span class="project-index" aria-hidden="true">${String(position + 1).padStart(2, '0')}</span><p class="project-meta">${escape(p.displayLabel)}</p><h3 class="project-title">${projectTitleMarkup(p.displayTitle)}</h3></header><div class="artifact-arrangement"><div class="project-cover"><div class="preview-papers">${previewButtons}</div></div></div><div class="project-copy"><dl class="wall-label"><div><dt>${escape(t('format'))}</dt><dd>${escape(p.format)}</dd></div><div><dt>${escape(t('audience'))}</dt><dd>${escape(p.audienceLabel)}</dd></div></dl><p>${escape(p.summary)}</p><div class="project-foot"><span class="project-action">${escape(t('explore'))} <span aria-hidden="true">→</span></span></div></div></a>`;
    }).join('');
    wirePreviewImages(grid);
    grid.setAttribute('aria-busy', 'false');
    $('#result-count').textContent = visible.length === 1 ? t('resultOne') : t('resultMany', {count:visible.length});
    $('#empty-state').hidden = visible.length > 0;
    $$('#category-filters button').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.filter === category));
      button.setAttribute('data-count', String(projects.filter(p => button.dataset.filter === 'all' || p.categories.includes(button.dataset.filter)).length));
    });
    if (revealObserver) prepareReveals(grid);
  }
  function setFilters(nextCategory = 'all') {
    category = nextCategory;
    withViewTransition(renderProjects);
  }
  const currentSlides = () => activeGallery === 'bookSlides' ? activeProject.bookSlides : activeProject.slides;
  function renderThumbnails() {
    const slides = currentSlides();
    $('#gallery-thumbnails').innerHTML = slides.map((slide, i) => `<button type="button" data-slide="${i}" aria-pressed="${i === slideIndex}" aria-label="${escape(t('sampleLabel', {number:i + 1, source:slide[2]}))}">${previewImage(slide[0], '72px', true)}</button>`).join('');
    wirePreviewImages($('#gallery-thumbnails'));
    $$('.gallery-tabs button').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.gallery === activeGallery)));
  }
  let slideLoadTimer = 0, slideLoadSequence = 0;
  // Booklet spreads (desktop, portrait galleries): the cover alone on the right,
  // then pages side by side (2–3, 4–5 …), like an open booklet.
  function isSpread() {
    if (!activeProject || typeof window.matchMedia !== 'function' || !window.matchMedia('(min-width: 1001px)').matches) return false;
    const first = variants[currentSlides()[0][0]];
    return !!first && first.height > first.width * 1.15;
  }
  const spreadStart = i => i === 0 ? 0 : (i % 2 ? i : i - 1);
  function stepSlide(direction) {
    const last = currentSlides().length - 1;
    if (!isSpread()) slideIndex = Math.max(0, Math.min(last, slideIndex + direction));
    else {
      const start = spreadStart(slideIndex);
      slideIndex = direction > 0 ? Math.min(last, start === 0 ? 1 : start + 2) : (start <= 1 ? 0 : start - 2);
    }
    renderSlide();
  }
  function renderSlide() {
    if (!activeProject) return;
    if (isSpread()) slideIndex = spreadStart(slideIndex);
    const slides = currentSlides();
    const [src, caption, source] = slides[slideIndex];
    const img = $('#gallery-image');
    const stage = $('#open-image');
    const sequence = ++slideLoadSequence;
    window.clearTimeout(slideLoadTimer);
    stage.classList.remove('is-loading');
    const changed = img.getAttribute('src') !== src;
    const preloadNext = () => {
      const next = slides[slideIndex + 1];
      if (next && typeof Image !== 'undefined') { const preload = new Image(); preload.src = next[0]; }
    };
    img.onload = () => {
      if (sequence !== slideLoadSequence) return;
      window.clearTimeout(slideLoadTimer);
      stage.classList.remove('is-loading');
      if (img.naturalWidth && img.naturalHeight) { img.width = img.naturalWidth; img.height = img.naturalHeight; }
      preloadNext();
    };
    img.onerror = () => { if (sequence === slideLoadSequence) { window.clearTimeout(slideLoadTimer); stage.classList.remove('is-loading'); } };
    img.src = src; img.alt = caption;
    if (img.complete && img.naturalWidth) preloadNext();
    else if (changed) slideLoadTimer = window.setTimeout(() => { if (sequence === slideLoadSequence && !img.complete) stage.classList.add('is-loading'); }, 300);
    if (changed) {
      img.classList.remove('slide-enter');
      void img.offsetWidth;
      img.classList.add('slide-enter');
    }
    // Second page of a spread (or a blank left page beside the cover).
    const spread = isSpread();
    const pair = spread && slideIndex > 0 && slides[slideIndex + 1] ? slides[slideIndex + 1] : null;
    let partner = typeof stage.querySelector === 'function' ? stage.querySelector('#gallery-image-b') : null;
    if (spread && typeof document.createElement === 'function') {
      if (!partner) { partner = document.createElement('img'); partner.id = 'gallery-image-b'; partner.decoding = 'async'; img.after(partner); }
      partner.classList.toggle('is-blank', !pair);
      partner.src = pair ? pair[0] : src; partner.alt = pair ? pair[1] : '';
      if (!pair) partner.setAttribute('aria-hidden', 'true'); else partner.removeAttribute('aria-hidden');
      if (changed) { partner.classList.remove('slide-enter'); void partner.offsetWidth; partner.classList.add('slide-enter'); }
    } else if (partner) partner.replaceWith();
    stage.classList?.toggle('is-spread', spread);
    stage.classList?.toggle('is-cover', spread && slideIndex === 0);
    const lastShown = pair ? slideIndex + 1 : slideIndex;
    const label = pair ? `${slideIndex + 1}–${slideIndex + 2}` : `${slideIndex + 1}`;
    $('#gallery-caption').textContent = pair ? `${caption} / ${pair[1]}` : caption;
    const count = $('#slide-count');
    count.textContent = `${label} / ${slides.length} · ${source}`;
    if (typeof count.insertAdjacentHTML === 'function') count.innerHTML = `<b class="count-now">${label}</b><span class="count-total"> / ${slides.length}</span><span class="count-source">${escape(source)}</span>`;
    $('#previous-slide').disabled = slideIndex === 0;
    $('#next-slide').disabled = lastShown >= slides.length - 1;
    $('#open-image').href = src;
    $$('.gallery-thumbnails button').forEach((button, i) => button.setAttribute('aria-pressed', String(i === slideIndex || i === lastShown)));
  }
  function renderDownloadState() {
    if (!activeProject) return;
    const state = window.PortfolioDownloads.getState(activeProject.original);
    const button = $('#download-original');
    if (!button) return;
    const unavailable = window.PORTFOLIO_ORIGINALS[activeProject.original].available === false;
    button.disabled = unavailable || !!state?.busy;
    button.setAttribute('aria-busy', String(!!state?.busy));
    $('#download-status').textContent = unavailable ? '' : state ? t(state.state, state) : '';
  }
  function renderProjectStory(p) {
    if (!p.caseStudy) return `<div class="project-brief"><h3>${escape(t('caseBrief'))}</h3><p>${escape(p.intro)}</p></div><section class="story-section"><h3>${escape(t('designChoices'))}</h3><ul>${p.decisions.map(choice => `<li>${escape(choice)}</li>`).join('')}</ul></section>`;
    const c = p.caseStudy;
    return `<section class="case-study" aria-label="${escape(t('caseStudy'))}">
      <h3>${escape(t('caseStudy'))}</h3>
      <ul class="case-facts">${c.facts.map(fact => `<li>${escape(fact)}</li>`).join('')}</ul>
      <div class="case-block"><h4>${escape(t('caseBrief'))}</h4><p>${escape(c.brief)}</p></div>
      <div class="case-block"><h4>${escape(t('caseSequence'))}</h4><ol class="case-days">${c.sequence.map(day => `<li><strong>${escape(day.day)}</strong><p>${escape(day.periods)}</p></li>`).join('')}</ol></div>
      <div class="case-block"><h4>${escape(t('caseDelivery'))}</h4><p>${escape(c.delivery)}</p></div>
      <div class="case-block case-credit"><h4>${escape(t('caseCredits'))}</h4><p>${escape(c.credits)}</p></div>
    </section>`;
  }
  function openProject(id, updateUrl = true, keepSlide = 0) {
    const p = projects.find(item => item.id === id); if (!p) return;
    const wasOpen = dialog.open;
    if (!wasOpen) { lastFocus = document.activeElement; listScrollY = window.scrollY; }
    if (!wasOpen || activeProject?.id !== id) activeGallery = 'slides'; activeProject = p; slideIndex = Math.max(0, Math.min(keepSlide, p.slides.length - 1));
    const file = window.PORTFOLIO_ORIGINALS[p.original];
    $('#project-position').textContent = t('projectPosition', {number:projects.indexOf(p) + 1, total:projects.length});
    const mainSample = p.slides[slideIndex];
    const dimensions = variants[mainSample[0]] || {width:1872, height:1053};
    $('#project-detail').innerHTML = `
      <header class="detail-head"><p class="eyebrow">${escape(p.label)}</p><h2 id="project-title">${escape(p.title)}</h2><p>${escape(p.summary)}</p></header>
      <div class="detail-body">
        <div class="detail-left">
        <div class="gallery" tabindex="0" role="group" aria-label="${escape(t('galleryLabel'))}">
          ${p.bookSlides ? `<div class="gallery-tabs" role="group" aria-label="${escape(t('galleryGroup'))}"><button type="button" data-gallery="slides" aria-pressed="${activeGallery === 'slides'}">${escape(t('trainingGallery'))} · 32</button><button type="button" data-gallery="bookSlides" aria-pressed="${activeGallery === 'bookSlides'}">${escape(t('bookGallery'))} · 6</button></div>` : ''}
          <a id="open-image" class="gallery-stage" target="_blank" rel="noopener noreferrer" href="${escape(mainSample[0])}" aria-label="${escape(t('openImage') + t('imageNewTab'))}"><img id="gallery-image" src="${escape(mainSample[0])}" alt="${escape(mainSample[1])}" width="${dimensions.width}" height="${dimensions.height}"><span class="image-enlarge" aria-hidden="true">↗</span></a>
          <div class="gallery-controls"><span id="slide-count"></span><div><button id="previous-slide" type="button" aria-label="${escape(t('previousSample'))}">←</button><button id="next-slide" type="button" aria-label="${escape(t('nextSample'))}">→</button></div></div>
          <p id="gallery-caption" class="gallery-caption" aria-live="polite"></p>
          <div id="gallery-thumbnails" class="gallery-thumbnails" role="group" aria-label="${escape(t('chooseSample'))}"></div>
        </div>
        <section class="project-materials"><h3>${escape(t('materials'))}</h3><p class="file-scope">${escape(p.materialsNote || (file.available !== false ? t('sourceAvailable') : p.documents.length ? t('editableUnavailable') : p.originalFormat === 'pdf' ? t('workbookUnavailable') : t('noFullFile')))}</p><div class="document-links">${p.documents.map((doc, i) => {const external=doc[0].startsWith('https://');return external ? `<a class="button ${i === 0 ? 'primary' : 'outline'}" href="${escape(doc[0])}" target="_blank" rel="noopener noreferrer"><span class="document-label">${escape(doc[1])}${doc[2] ? `<span class="document-format">${escape(doc[2])}</span>` : ''}</span><span class="document-action">${escape(doc[1])} <span aria-hidden="true">↗</span></span><span class="sr-only">${escape(t('newTab'))}</span></a>` : `<div class="document-card ${i === 0 ? 'primary' : 'outline'}"><span class="document-label">${escape(doc[1])}${doc[2] ? `<span class="document-format">${escape(doc[2])}</span>` : ''}</span><span class="document-actions"><a href="${escape(doc[0])}" target="_blank" rel="noopener noreferrer">${escape(t('viewInNewTab'))} <span aria-hidden="true">↗</span><span class="sr-only">${escape(t('newTab'))}</span></a><a href="${escape(doc[0])}" download>${escape(t('downloadFile'))} <span aria-hidden="true">↓</span></a></span></div>`}).join('')}</div><div class="original-material"${file.available === false ? ' hidden' : ''}><button id="download-original" class="text-link" type="button" data-original="${escape(p.original)}"${file.available === false ? ' hidden' : ''}>${escape(t(p.originalFormat === 'pdf' ? 'downloadOriginalPdf' : 'downloadOriginal'))} <span aria-hidden="true">↓</span></button><p class="download-meta"${file.available === false ? ' hidden' : ''}>${escape(t('largeDownload', {size:(file.bytes / 1000000).toFixed(1)}))}</p><p id="download-status" class="download-status" role="status" aria-live="polite"></p></div></section>
        </div>
        <section class="detail-role"><h3>${escape(t('myContribution'))}</h3><p><strong>${escape(p.role)}</strong></p><p>${escape(p.contribution)}</p></section>
        <div class="detail-story">${renderProjectStory(p)}${p.evidence ? `<section class="story-section evidence-section"><h3>${escape(t('evidence'))}</h3><p>${escape(p.evidence)}</p></section>` : ''}${p.note ? `<p class="detail-callout">${escape(p.note)}</p>` : ''}<section class="story-section detail-context"><h3>${escape(t('projectDetails'))}</h3>${p.caseStudy ? `<p>${escape(p.intro)}</p>` : ''}<div class="detail-facts"><div><strong>${escape(t('audience'))}</strong>${escape(p.audienceLabel)}</div><div><strong>${escape(t('context'))}</strong>${escape(p.context)}</div><div><strong>${escape(t('format'))}</strong>${escape(p.format)}</div></div></section>${p.source ? `<section class="story-section source-note"><h3>${escape(t('sourceScope'))}</h3><p>${escape(p.source)}</p></section>` : ''}</div>
      </div><nav class="detail-footer" aria-label="${escape(t('projectNavigation'))}"><button type="button" data-neighbor="previous">← ${escape(t('previousProject'))}</button><button type="button" data-neighbor="next">${escape(t('nextProject'))} →</button></nav>`;
    renderThumbnails(); renderSlide(); renderDownloadState();
    if (!wasOpen) {
      const sourceCard = typeof grid.querySelectorAll === 'function' ? [...grid.querySelectorAll('[data-project-card]')].find(card => card.dataset.projectCard === id) || null : null;
      withViewTransition(() => { dialog.showModal(); document.body.classList.add('modal-open'); }, sourceCard, 'open');
    }
    dialog.scrollTop = 0;
    $('#close-dialog').focus({preventScroll:true});
    if (updateUrl) {
      const state = {portfolioProject:p.id};
      if (wasOpen) history.replaceState(state, '', `#project/${p.id}`);
      else history.pushState(state, '', `#project/${p.id}`);
    }
  }
  function closeProject() {
    if (!dialog.open) return;
    if (history.state?.portfolioProject) history.back();
    else { history.replaceState(null, '', '#work'); dialog.close(); }
  }
  function setLanguage(next, persist = true) {
    const oldId = activeProject?.id, oldSlide = slideIndex, oldGallery = activeGallery, scroll = dialog.scrollTop;
    const projectOrder = [
      'adult-communication',
      'reading-for-meaning',
      'epik-music',
      'teacher-development',
      'usa-camp-workbook',
      'chuseok-thanksgiving-storybook',
      'advice-suggestions-lesson'
    ];
    language = next === 'ko' ? 'ko' : 'en';
    projects = baseProjects.map(localize).sort((a, b) => projectOrder.indexOf(a.id) - projectOrder.indexOf(b.id));
    document.documentElement.setAttribute('lang', language); document.title = t('siteTitle');
    $('meta[name="description"]').setAttribute('content', t('description'));
    const page = window.PORTFOLIO_LOCALES[language].page;
    $$('[data-i18n]').forEach(el => { el.innerHTML = page[el.dataset.i18n]; });
    for (const attribute of ['aria-label', 'alt', 'src']) $$(`[data-i18n-${attribute}]`).forEach(el => el.setAttribute(attribute, page[el.getAttribute('data-i18n-' + attribute)]));
    for (const id of ['language-toggle', 'dialog-language-toggle']) {
      const button = $('#' + id); button.textContent = t('languageButton');
      button.setAttribute('aria-label', t('languageLabel')); button.setAttribute('lang', language === 'en' ? 'ko' : 'en');
    }
    $('#copy-status').textContent = ''; $('#copy-status').classList.remove('is-copied'); renderProjects();
    if (oldId && dialog.open) { activeGallery = oldGallery; openProject(oldId, false, oldSlide); dialog.scrollTop = scroll; }
    if (persist) try { localStorage.setItem('portfolio-language', language); } catch {}
  }
  if (revealObserver) {
    prepareReveals();
    const timeline = $('.timeline');
    if (timeline) timelineObserver.observe(timeline);
  }
  if (sectionObserver) navLinksForSections().forEach(link => {
    const section = $(link.hash);
    if (section) sectionObserver.observe(section);
  });
  function closeMenu(returnFocus = false) {
    $('#navigation').classList.remove('open'); $('#menu-toggle').setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
    if (returnFocus) $('#menu-toggle').focus();
  }
  for (const id of ['language-toggle', 'dialog-language-toggle']) $('#' + id).addEventListener('click', () => {
    const button = $('#' + id);
    if (!reduceMotion) { button.classList.add('is-switching'); window.setTimeout(() => button.classList.remove('is-switching'), 240); }
    setLanguage(language === 'en' ? 'ko' : 'en'); button.focus();
  });
  $('#category-filters').addEventListener('click', event => { const button = event.target.closest('button[data-filter]'); if (button) setFilters(button.dataset.filter); });
  $('#empty-reset').addEventListener('click', () => setFilters());
  grid.addEventListener('click', event => {
    const opener = event.target.closest('[data-project]'); if (!opener) return;
    event.preventDefault();
    opener.focus({preventScroll:true});
    const sample = event.target.closest('[data-preview]')?.dataset.preview ?? 0;
    closeMenu(); openProject(opener.dataset.project, true, Number(sample));
  });
  $('#close-dialog').addEventListener('click', closeProject);
  $('#back-projects').addEventListener('click', closeProject);
  dialog.addEventListener('cancel', event => { event.preventDefault(); closeProject(); });
  dialog.addEventListener('click', event => {
    if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) closeProject(); return; }
    const tab = event.target.closest('[data-gallery]'); if (tab && activeProject?.bookSlides) { activeGallery = tab.dataset.gallery; slideIndex = 0; renderThumbnails(); renderSlide(); return; }
    const thumb = event.target.closest('[data-slide]'); if (thumb) { slideIndex = Number(thumb.dataset.slide); renderSlide(); return; }
    if (event.target.closest('#previous-slide')) { stepSlide(-1); return; }
    if (event.target.closest('#next-slide')) { stepSlide(1); return; }
    const download = event.target.closest('[data-original]');
    if (download) { const id = download.dataset.original; window.PortfolioDownloads.download(id, () => { if (activeProject?.original === id) renderDownloadState(); }, t('powerpointType')); return; }
    const neighbor = event.target.closest('[data-neighbor]');
    if (neighbor) { let list = matchedProjects(); if (!list.some(p => p.id === activeProject.id)) list = projects; const i = list.findIndex(p => p.id === activeProject.id); openProject(list[(i + (neighbor.dataset.neighbor === 'next' ? 1 : -1) + list.length) % list.length].id); }
  });
  let touchStartX = null;
  dialog.addEventListener('touchstart', event => { if (event.target.closest('.gallery-stage')) touchStartX = event.changedTouches[0]?.screenX ?? null; }, {passive:true});
  dialog.addEventListener('touchend', event => {
    if (touchStartX === null || !activeProject) return;
    const delta = (event.changedTouches[0]?.screenX ?? touchStartX) - touchStartX;
    touchStartX = null;
    if (Math.abs(delta) < 45) return;
    stepSlide(delta < 0 ? 1 : -1);
  }, {passive:true});
  dialog.addEventListener('keydown', event => {
    if (!event.target.closest('.gallery') || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault(); stepSlide(event.key === 'ArrowRight' ? 1 : -1);
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('modal-open'); activeProject = null;
    window.scrollTo({top:listScrollY, behavior:'instant'});
    if (lastFocus?.getAttribute('id')) { const current = $('#' + lastFocus.getAttribute('id')); if (current) current.focus({preventScroll:true}); }
    else if (lastFocus?.isConnected) lastFocus.focus({preventScroll:true});
  });
  const navLinks = $$('#navigation a');
  $('#menu-toggle').addEventListener('click', () => {
    const expanded = $('#menu-toggle').getAttribute('aria-expanded') === 'true';
    if (expanded) closeMenu(); else { $('#menu-toggle').setAttribute('aria-expanded', 'true'); $('#navigation').classList.add('open'); document.body.classList.add('menu-open'); navLinks[0]?.focus(); }
  });
  navLinks.forEach(link => link.addEventListener('click', () => closeMenu()));
  document.addEventListener('keydown', event => {
    if ($('#menu-toggle').getAttribute('aria-expanded') !== 'true') return;
    if (event.key === 'Escape') { event.preventDefault(); closeMenu(true); return; }
    if (event.key !== 'Tab') return;
    const controls = [...navLinks, $('#language-toggle'), $('#menu-toggle')];
    const first = controls[0], last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    else if (!controls.includes(document.activeElement)) { event.preventDefault(); first.focus(); }
  });
  document.addEventListener('pointerdown', event => { if (!event.target.closest?.('.site-header')) closeMenu(); });
  document.addEventListener('pointerdown', event => {
    const button = event.target.closest?.('.button');
    if (!button) return;
    const bounds = button.getBoundingClientRect();
    button.style.setProperty('--press-x', `${event.clientX - bounds.left}px`);
    button.style.setProperty('--press-y', `${event.clientY - bounds.top}px`);
    button.classList.add('is-pressed');
  });
  document.addEventListener('pointerup', () => $$('.button.is-pressed').forEach(button => button.classList.remove('is-pressed')));
  document.addEventListener('pointercancel', () => $$('.button.is-pressed').forEach(button => button.classList.remove('is-pressed')));
  // The email address is revealed only after an explicit visitor action.
  const contactAddress = () => [97,110,110,97,114,101,97,100,121,64,108,105,118,101,46,99,111,109].map(c => String.fromCharCode(c)).join('');
  let copyStatusTimer = 0;
  $('#contact-email').addEventListener('click', async () => {
    const address = contactAddress();
    $('#email-details').hidden = false;
    $('#contact-email').setAttribute('aria-expanded', 'true');
    $('#email-address').textContent = address;
    $('#email-link').href = `mailto:${address}`;
    const status = $('#copy-status'), button = $('#contact-email');
    window.clearTimeout(copyStatusTimer);
    status.classList.remove('is-copied', 'is-fallback');
    try {
      if (!navigator.clipboard?.writeText) throw Error('Clipboard unavailable');
      await navigator.clipboard.writeText(address);
      status.textContent = t('copied'); status.classList.add('is-copied');
      button.textContent = `${t('copied')} ✓`;
      button.classList.add('copied');
      copyStatusTimer = window.setTimeout(() => {
        status.classList.remove('is-copied');
        status.textContent = '';
        button.innerHTML = window.PORTFOLIO_LOCALES[language].page['contact.email'];
        button.classList.remove('copied');
      }, 2000);
    } catch { status.textContent = t('copyFallback', {address}); status.classList.add('is-fallback'); }
  });
  function syncRoute() {
    if (location.hash.startsWith('#project/')) {
      const id = location.hash.slice(9);
      if (!dialog.open || activeProject?.id !== id) openProject(id, false);
    } else if (dialog.open) {
      if (closingProject) return;
      closingProject = true;
      const done = () => { closingProject = false; };
      const card = activeProject && typeof grid.querySelectorAll === 'function' ? [...grid.querySelectorAll('[data-project-card]')].find(c => c.dataset.projectCard === activeProject.id) || null : null;
      const transition = withViewTransition(() => { dialog.close(); document.body.classList.remove('modal-open'); window.scrollTo({top:listScrollY, behavior:'instant'}); }, card, 'close');
      if (transition?.updateCallbackDone) transition.updateCallbackDone.then(done, done); else done();
    }
    else if (cameFromProject && lastFocus && Number.isFinite(listScrollY)) window.scrollTo({top:listScrollY, behavior:'instant'});
    cameFromProject = location.hash.startsWith('#project/');
  }
  let cameFromProject = location.hash.startsWith('#project/');
  window.addEventListener('hashchange', syncRoute); window.addEventListener('popstate', syncRoute);
  setLanguage(language, false);
  if (location.hash.startsWith('#project/') && !history.state?.portfolioProject) {
    const hash = location.hash, id = hash.slice(9);
    if (projects.some(p => p.id === id)) { history.replaceState(null, '', '#work'); history.pushState({portfolioProject:id}, '', hash); }
  }
  syncRoute();
})();
