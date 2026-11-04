/* ---------------------------------------------------------------------------
   Daten: macht aus den Projektordnern (gelesen vom Plugin in scripts/) die
   Einträge des Hubs. Hier steht nichts von Hand – ein neuer Ordner reicht.
   --------------------------------------------------------------------------- */
import { projects } from 'virtual:portfolio';

const TYPE = { main: 'haupt', project: 'klein', sample: 'probe', about: 'about' };
export const TYPE_OF_KIND = { haupt: 'main', klein: 'project', probe: 'sample', about: 'about' };
const CODE = { haupt: 'M', klein: 'P', probe: 'S' };

export const IMG = /\.(jpe?g|png|webp|avif|gif|svg)$/i;
const COVER = /^cover\.(jpe?g|png|webp|avif)$/i;

/* Farbe: Slot-Name aus der Palette ("grise"), CSS-Variable ("--c-grise") oder Hex ("#2F3D52").
   Für Hintergründe zusätzlich "paper" (helles Papier) und "dark" (Grund des Portfolios). */
const NAMED = { paper: '#F2EFEA', white: '#FFFFFF', dark: 'var(--ground)' };
export const colorVar = c => !c ? null : NAMED[c] || (c.startsWith('#') ? c : c.startsWith('--') ? `var(${c})` : `var(--c-${c})`);

/* Pfad im Projektordner → URL. Leerzeichen und Umlaute in Ordnernamen sind erlaubt. */
const url = (id, ...parts) => ['projects', id, ...parts].map(encodeURIComponent).join('/');

/* "01 Sketches" → "Sketches", "02_first-model" → "first model" */
const cleanName = n => n.replace(/^\d+[\s._-]*/, '').replace(/[_]+/g, ' ').trim() || n;

/* Text aus text.md: Leerzeilen trennen Absätze, sonst nichts */
const paragraphs = t => !t ? [] : t.split(/\r?\n\s*\r?\n/).map(s => s.replace(/\s+/g, ' ').trim()).filter(Boolean);

/* Welche Seitenart? "page" in project.json gewinnt. Sonst: index.html → einbetten, eine PDF → einbetten, sonst Layout. */
function pageOf(p) {
  const page = p.json.page;
  if (page === 'layout') return { mode: 'layout' };
  if (page) {
    if (/^https?:\/\//.test(page)) return { mode: 'url', src: page };
    return { mode: /\.pdf$/i.test(page) ? 'pdf' : 'html', src: url(p.id, ...page.split('/')) };
  }
  if (p.files.includes('index.html')) return { mode: 'html', src: url(p.id, 'index.html') };
  const pdf = p.files.find(f => /\.pdf$/i.test(f));
  if (pdf) return { mode: 'pdf', src: url(p.id, pdf) };
  return { mode: 'layout' };
}

/* Standard-Layout: jeder Unterordner ist ein Kapitel, Bilder darin in Namensreihenfolge.
   Bilder direkt im Projektordner (außer cover.*) stehen vor dem ersten Kapitel. */
function layoutOf(p, cover) {
  const loose = p.files.filter(f => IMG.test(f) && f !== cover);
  const sections = p.dirs.map(d => ({
    name: cleanName(d.name), dir: d.name,
    text: paragraphs(d.text),
    images: d.files.filter(f => IMG.test(f)).map(f => ({ src: url(p.id, d.name, f), size: d.sizes?.[f] })),
  }));
  return {
    intro: paragraphs(p.text),
    loose: loose.map(f => ({ src: url(p.id, f), size: p.sizes?.[f] })),
    sections,
    background: colorVar(p.json.background) || NAMED.paper,
    columns: Math.min(Math.max(+p.json.columns || 2, 1), 4),
  };
}

function readProjects() {
  const list = [];
  for (const p of projects) {
    if (p.error) { console.warn(`[portfolio] projects/${p.id}: ${p.error}`); continue; }
    const j = p.json, kind = TYPE[j.type];
    if (!kind) { console.warn(`[portfolio] projects/${p.id}: unbekannter type "${j.type}" – erlaubt sind main, project, sample, about`); continue; }
    const coverFile = j.cover || p.files.find(f => COVER.test(f)) || null;
    const page = pageOf(p);
    const layout = page.mode === 'layout' ? layoutOf(p, coverFile) : null;
    // Kapitel: aus project.json; im Layout sonst aus den Unterordnern
    const chapters = (j.chapters || (layout ? layout.sections.map(s => s.name) : []))
      .map(c => typeof c === 'string' ? { name: c } : c);
    list.push({
      id: p.id, kind,
      title: j.title || p.id,
      tag: j.tag || '',
      cur: !!j.curated,
      ph: !!j.placeholder,
      cv: colorVar(j.color) || 'var(--holder)',
      chapters,
      cover: coverFile ? url(p.id, ...coverFile.split('/')) : null,
      stripes: j.stripes || null,                    // Linienmuster auf der Farbfläche, solange es kein Coverbild gibt
      page, layout,
      strip: j.strip !== false,                       // false: Seitenstreifen versteckt, erscheint am linken Rand
      order: j.order ?? 999,
    });
  }
  return list;
}

/* Reihenfolge: zuerst "order" aus der project.json, dann Titel. Codes (M1, P1, S01 …) ergeben sich daraus. */
const byOrder = (a, b) => a.order - b.order || a.title.localeCompare(b.title);

/* ---------------------------------------------------------------------------
   Anordnung im Raster (1 Feld = 1 Einheit):
     Zeile 0:   Main projects (4×4) nebeneinander
     darunter:  Projects (2×2), umbrechend, danach ein freier Platz
     rechts:    Schublade mit den Work Samples (4 Spalten), darunter About
   --------------------------------------------------------------------------- */
export function buildItems() {
  const all = readProjects();
  const mains = all.filter(i => i.kind === 'haupt').sort(byOrder);
  const projs = all.filter(i => i.kind === 'klein').sort(byOrder);
  const samples = all.filter(i => i.kind === 'probe').sort(byOrder);
  const about = all.find(i => i.kind === 'about');

  const items = [];
  const W = Math.max(4 * mains.length, 8);          // Breite des linken Blocks in Feldern

  mains.forEach((it, i) => items.push({ ...it, code: CODE.haupt + (i + 1), x: 4 * i, y: 0, w: 4, h: 4 }));

  const top = mains.length ? 4 : 0, perRow = W / 2;
  projs.forEach((it, i) => items.push({ ...it, code: CODE.klein + (i + 1),
    x: 2 * (i % perRow), y: top + 2 * Math.floor(i / perRow), w: 2, h: 2 }));
  const n = projs.length;                            // freier Platz direkt hinter dem letzten Projekt
  items.push({ id: 'slot', kind: 'slot', title: 'Open slot', x: 2 * (n % perRow), y: top + 2 * Math.floor(n / perRow), w: 2, h: 2 });

  // Schublade: Kopfzeile + Reihen à 4 Samples. Der Rest der letzten Reihe (oder eine neue Reihe) bleibt frei.
  const rest = samples.length % 4, rows = Math.ceil(samples.length / 4) + (rest === 0 ? 1 : 0);
  const dh = Math.max(1 + rows, 4);
  items.push({ id: 'proben', kind: 'drawer', title: 'Work Samples', count: samples.length, x: W, y: 0, w: 4, h: dh });
  samples.forEach((it, i) => items.push({ ...it, parent: 'proben', code: CODE.probe + String(i + 1).padStart(2, '0'),
    x: W + (i % 4), y: 1 + Math.floor(i / 4), w: 1, h: 1 }));
  const used = samples.length;
  items.push({ id: 'pslot', kind: 'slot', parent: 'proben', title: 'Open slot',
    x: W + (used % 4), y: 1 + Math.floor(used / 4), w: 4 - (used % 4), h: 1 });

  if (about) items.push({ ...about, code: 'Info', x: W, y: dh, w: 4, h: 2 });
  return items;
}
