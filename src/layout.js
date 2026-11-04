/* ---------------------------------------------------------------------------
   Standard-Layout für Projekte ohne eigene Seite (Zeichnungen, Renderings,
   Fotos …). Aufbau: Kopf (Art, Titel, Satz), Einleitung aus text.md, lose
   Bilder, dann ein Abschnitt pro Unterordner mit Text und Bildern.
   Schrift und Formen des Portfolios, Hintergrund frei wählbar.
   --------------------------------------------------------------------------- */
import { esc, inkFor } from './util.js';

const KIND = { haupt: 'Main project', klein: 'Project', probe: 'Work sample', about: 'About' };
const DEV = import.meta.env.DEV;

const figs = (list, alt) => list.map(({ src, size }) =>
  `<figure class="lo-fig"><img class="lo-img" src="${src}" alt="${esc(alt)}"${size ? ` width="${size[0]}" height="${size[1]}"` : ''} loading="lazy" decoding="async"></figure>`).join('');

/* Nur bei npm run dev: zeigt, wohin Dateien gehören. Auf der veröffentlichten Seite unsichtbar. */
const hint = html => DEV ? `<p class="lo-hint">${html}</p>` : '';

export function layoutHTML(it) {
  const L = it.layout, fg = inkFor(L.background);
  const ps = t => t.map(p => `<p>${esc(p)}</p>`).join('');
  const sections = L.sections.map((s, i) => `
    <section class="lo-sec" data-chapter="${esc(s.name)}">
      <header class="lo-head"><p class="lo-num">${String(i + 1).padStart(2, '0')}</p><h2>${esc(s.name)}</h2></header>
      ${s.text.length ? `<div class="lo-text">${ps(s.text)}</div>` : ''}
      ${s.images.length ? `<div class="lo-grid">${figs(s.images, `${it.title} – ${s.name}`)}</div>`
        : hint(`Images go into <code>projects/${esc(it.id)}/${esc(s.dir)}/</code>`)}
    </section>`).join('');

  return `<div class="lo-page" style="--lo-bg:${L.background};--lo-fg:${fg};--lo-cols:${L.columns}">
    <div class="lo-wrap">
      <p class="lo-kicker">${it.ph ? 'Placeholder' : KIND[it.kind]} · ${esc(it.code)}</p>
      <h1 class="lo-title">${esc(it.title)}</h1>
      ${it.tag ? `<p class="lo-lede">${esc(it.tag)}</p>` : ''}
      ${L.intro.length ? `<div class="lo-text lo-intro">${ps(L.intro)}</div>` : ''}
      ${L.loose.length ? `<div class="lo-grid">${figs(L.loose, it.title)}</div>` : ''}
      ${sections || hint(`Create a subfolder in <code>projects/${esc(it.id)}/</code> per chapter, e.g. <code>01 Sketches</code>, and drop images into it.`)}
    </div>
  </div>`;
}
