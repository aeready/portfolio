// Project-card markup shared by the browser (app.js) and the build step
// (scripts/build-html.mjs pre-renders the same cards into index.html).
// Pure: everything it needs comes in through `ctx` ({t, variants}).
(() => {
  'use strict';
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const projectTitleMarkup = value => escape(value)
    .replace(/USA Camp ·/g, 'USA Camp&nbsp;·')
    .replace(/12-period/g, '<span class="nowrap">12-period</span>');
  const FEATURED = ['adult-communication', 'reading-for-meaning', 'epik-music'];
  const TONES = ['lime', 'ink', 'cream'];
  // Display order of the projects (data order in projects.js is not the page order).
  const ORDER = ['reading-for-meaning', 'epik-music', 'adult-communication', 'teacher-development', 'usa-camp-workbook', 'chuseok-thanksgiving-storybook', 'advice-suggestions-lesson'];
  function previewImage(variants, src, sizes, eager = false, pending = true) {
    const cls = pending ? 'preview-image image-pending' : 'preview-image';
    const asset = variants[src];
    const loading = eager ? 'eager' : 'lazy';
    if (!asset) return `<img class="${cls}" src="${escape(src)}" alt="" loading="${loading}" decoding="async">`;
    const small = asset.outputs[0];
    const candidates = asset.outputs.map(v => `${v.path} ${v.width}w`);
    // Offer the full-size original too, so covers stay sharp on high-density screens.
    if (asset.width > Math.max(...asset.outputs.map(v => v.width))) candidates.push(`${src} ${asset.width}w`);
    return `<img class="${cls}" src="${escape(small.path)}" srcset="${escape(candidates.join(', '))}" sizes="${escape(sizes)}" width="${asset.width}" height="${asset.height}" alt="" loading="${loading}" decoding="async">`;
  }
  // `bandExtras` is decoration for the USA Camp band (pictured by CSS, hidden from assistive tech).
  const bandExtras = p => p.id !== 'usa-camp-workbook' ? '' : '<span class="band-extra band-extra--1" aria-hidden="true"></span><span class="band-extra band-extra--2" aria-hidden="true"></span>';
  // One card. The title link is the only focusable/announced control; its ::after stretches over the card
  // (stretched-link pattern), so the whole card is clickable while the text stays selectable by assistive tech.
  function renderCard(p, position, {t, variants, pending = true}) {
    const featured = FEATURED.includes(p.id);
    const previews = [p.cover, p.previewSecondary, p.previewTertiary].filter(Boolean);
    const previewButtons = previews.map((src, index) => {
      const sample = p.previewIndices[index];
      const name = index === 0 ? 'artifact-main' : index === 1 ? 'artifact-fixed' : 'artifact-fixed artifact-tertiary';
      const sizes = index === 0
        ? '(max-width: 900px) calc(100vw - 64px), (min-width: 1100px) 600px, 56vw'
        : featured ? '(max-width: 760px) 34vw, 180px' : '(min-width: 1100px) 150px, (max-width: 760px) 34vw, 18vw';
      const frame = `<span id="preview-${escape(p.id)}-${index}" class="preview-open ${name}" data-preview="${sample}" aria-hidden="true">${previewImage(variants, src, sizes, false, pending)}</span>`;
      return index === 0 ? `<div class="artifact-main-frame">${frame}</div>` : frame;
    }).join('');
    return `<article id="explore-${escape(p.id)}" class="project-card ${featured ? 'is-featured' : 'is-compact'}" data-tone="${TONES[position % 3]}" data-project="${escape(p.id)}" data-project-card="${escape(p.id)}"><header class="project-heading"><span class="project-index" aria-hidden="true">${String(position + 1).padStart(2, '0')}</span><p class="project-meta">${escape(p.displayLabel)}</p><h3 class="project-title"><a id="project-link-${escape(p.id)}" href="#project/${escape(p.id)}" data-project="${escape(p.id)}" aria-controls="project-dialog" aria-haspopup="dialog">${projectTitleMarkup(p.displayTitle)}</a></h3></header><div class="artifact-arrangement"><div class="project-cover"><div class="preview-papers">${previewButtons}</div></div>${bandExtras(p)}</div><div class="project-copy"><dl class="wall-label"><div><dt>${escape(t('format'))}</dt><dd>${escape(p.format)}</dd></div><div><dt>${escape(t('audience'))}</dt><dd>${escape(p.audienceLabel)}</dd></div></dl><p>${escape(p.summary)}</p><div class="project-foot"><span class="project-action" aria-hidden="true">${escape(t('explore'))} <span>→</span></span></div></div></article>`;
  }
  window.PortfolioCards = {escape, projectTitleMarkup, previewImage, renderCard, FEATURED, TONES, ORDER};
})();
