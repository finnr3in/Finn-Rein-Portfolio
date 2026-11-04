#!/usr/bin/env node
/* ---------------------------------------------------------------------------
   Neues Projekt anlegen:   npm run new lamp-study
   Fragt nach Titel, Typ, Seitenart und Farbe und legt projects/<name>/ an.
   Jede Frage hat eine Vorgabe in [Klammern] – Enter übernimmt sie.
   --------------------------------------------------------------------------- */
import { createInterface } from 'node:readline/promises';
import { stdin, stdout, argv, exit } from 'node:process';
import { existsSync, mkdirSync, writeFileSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..'), DIR = join(ROOT, 'projects');
const PALETTE = ['grise', 'terra', 'orange', 'roi', 'avocat', 'olive', 'rose', 'beige', 'moutarde', 'violet', 'magenta'];
const rl = createInterface({ input: stdin });
const lines = rl[Symbol.asyncIterator]();          // Zeile für Zeile; funktioniert im Terminal und mit umgeleiteter Eingabe

async function ask(q, def, ok = () => true) {
  for (;;) {
    stdout.write(`${q}${def !== undefined ? ` [${def}]` : ''}: `);
    const { value, done } = await lines.next();
    if (done) { console.log('\nAbgebrochen.'); exit(1); }
    const a = value.trim() || def || '';
    if (ok(a)) return a;
    console.log('  → bitte nochmal');
  }
}
const pick = (q, options, def) => ask(`${q} (${options.join(' / ')})`, def, a => options.includes(a));
const slug = s => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/ß/g, 'ss')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const titleCase = s => s.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

console.log('\nNeues Projekt im Portfolio\n');
const name = slug(argv[2] || await ask('Ordnername (klein, ohne Leerzeichen)', undefined, a => !!slug(a)));
const dir = join(DIR, name);
if (existsSync(dir)) { console.log(`\nprojects/${name} gibt es schon.`); exit(1); }

const title = await ask('Titel', titleCase(name));
const tag = await ask('Ein Satz, worum es geht', '');
const type = await pick('Typ: main = 4×4, project = 2×2, sample = 1×1 in der Schublade', ['main', 'project', 'sample'], 'project');
console.log(`
Seitenart:
  layout  Standard-Layout. Du legst nur Bilder in Kapitelordner (Zeichnungen, Renderings, Fotos).
  html    Eigene Seite mit eigener Gestaltung (index.html).
  pdf     Fertige Dokumentation als PDF einbetten.`);
const page = await pick('Seitenart', ['layout', 'html', 'pdf'], 'layout');
const color = await ask(`Farbe auf dem Ordner (${PALETTE.join(', ')} oder #hex)`, 'olive',
  a => PALETTE.includes(a) || /^#[0-9a-f]{3}([0-9a-f]{3})?$/i.test(a));
const curated = (await ask('Kuratiert? (j/n)', 'n')).toLowerCase().startsWith('j');

// Ans Ende seiner Gruppe
let order = 0;
for (const d of readdirSync(DIR).filter(d => !d.startsWith('_'))) {
  try { const j = JSON.parse(readFileSync(join(DIR, d, 'project.json'), 'utf8')); if (j.type === type) order = Math.max(order, j.order || 0); } catch {}
}

const json = { title, type, curated, color, tag, order: order + 1 };
mkdirSync(dir);

if (page === 'layout') {
  json.background = await ask('Hintergrund der Seite (paper, white, dark, Palettenname oder #hex)', 'paper');
  json.columns = +(await pick('Bilder nebeneinander', ['1', '2', '3', '4'], '2'));
  mkdirSync(join(dir, '01 First chapter'));
} else if (page === 'html') {
  json.chapters = ['Problem', 'Process', 'Result'];
  const tpl = readFileSync(join(DIR, '_template', 'index.html'), 'utf8').replaceAll('Project Title', title);
  writeFileSync(join(dir, 'index.html'), tpl);
}
writeFileSync(join(dir, 'project.json'), JSON.stringify(json, null, 2) + '\n');
rl.close();

const where = `projects/${name}/`;
console.log(`\nAngelegt: ${where}\n`);
if (page === 'layout') console.log(`Nächste Schritte:
  - Pro Kapitel einen Unterordner, z. B. "01 Sketches", "02 Model". Die Zahl legt die Reihenfolge fest und wird nicht angezeigt.
  - Bilder hineinlegen. Sie erscheinen in Namensreihenfolge.
  - Optional text.md in einen Kapitelordner (Text zum Kapitel) oder direkt in ${where} (Einleitung).
    Leerzeilen trennen Absätze.
  - Optional cover.jpg direkt in ${where} als Bild auf dem Ordner im Hub.`);
if (page === 'html') console.log(`Nächste Schritte:
  - ${where}index.html frei gestalten. Jedes Kapitel bekommt data-chapter="Name".
  - Optional cover.jpg als Bild auf dem Ordner im Hub.`);
if (page === 'pdf') console.log(`Nächste Schritte:
  - Die PDF in ${where} legen (Name egal). Sie wird automatisch eingebettet.
  - Optional cover.jpg als Bild auf dem Ordner im Hub.
  - Kapitel mit Seitenzahl in project.json, z. B. "chapters": [{"name": "Model", "page": 5}]`);
console.log(`\nLäuft "npm run dev", erscheint das Projekt sofort im Hub.\n`);
