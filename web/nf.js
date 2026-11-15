/* 404: the plates drift out of register with the pointer (desktop only). */
(() => {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const plates = document.querySelector('.nf-plates');
  if (!plates) return;
  document.addEventListener('pointermove', e => {
    plates.style.setProperty('--mx', ((e.clientX / innerWidth) * 2 - 1).toFixed(3));
    plates.style.setProperty('--my', ((e.clientY / innerHeight) * 2 - 1).toFixed(3));
  }, {passive: true});
})();
