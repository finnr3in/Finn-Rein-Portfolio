export const U = 100;                                      // 1 Rasterfeld = 100 Welt-Einheiten
export const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const cssVar = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
export const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* Deckblatt-Schrift nach Helligkeit: helle Töne tragen dunkle Schrift, dunkle Töne Creme. */
function luminance(color) {
  const probe = document.createElement('span');
  probe.style.color = color; document.body.appendChild(probe);
  const m = getComputedStyle(probe).color.match(/[\d.]+/g); probe.remove();
  if (!m) return 0;
  const f = c => (c /= 255) <= .03928 ? c / 12.92 : Math.pow((c + .055) / 1.055, 2.4);
  return .2126 * f(+m[0]) + .7152 * f(+m[1]) + .0722 * f(+m[2]);
}
export const inkFor = color => luminance(color) > .18 ? 'var(--ground)' : 'var(--ink)';
