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
