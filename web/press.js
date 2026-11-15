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
    dialog.dataset.band = String((index % 4) + 1);
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

  /* ---------- Registration cursor: the lime plate follows a beat late ----- */
  const finePointer = window.matchMedia?.('(hover: hover) and (pointer: fine)').matches;
  if (finePointer && !reduceMotion) {
    const plate = document.createElement('span');
    plate.className = 'press-plate-cursor';
    plate.setAttribute('aria-hidden', 'true');
    document.body.append(plate);
    const zones = '.hero, .project-collection, .section-ribbon, #work .section-heading';
    let x = -100, y = -100, px = -100, py = -100, frame = 0, active = false;
    const tick = () => {
      px += (x - px) * 0.18; py += (y - py) * 0.18;
      plate.style.transform = `translate3d(${px + 2.5}px, ${py + 2.5}px, 0)`;
      frame = Math.abs(x - px) + Math.abs(y - py) > 0.3 ? requestAnimationFrame(tick) : 0;
    };
    document.addEventListener('pointermove', event => {
      if (event.pointerType !== 'mouse') return;
      x = event.clientX; y = event.clientY;
      const target = event.target.closest?.(zones);
      const clickable = event.target.closest?.('a:not(.project-card), button, .project-action, input, summary');
      const on = !!target && !clickable && !document.body.classList.contains('modal-open');
      if (on !== active) { active = on; plate.classList.toggle('is-on', on); if (on) { px = x; py = y; } }
      plate.classList.toggle('is-card', !!event.target.closest?.('.project-card'));
      if (!frame) frame = requestAnimationFrame(tick);
    }, {passive: true});
    document.addEventListener('pointerleave', () => { active = false; plate.classList.remove('is-on'); });
  }
})();
