/* ---------------------------------------------------------------------------
   Vite-Plugin für den Portfolio-Hub.

   1. Liest beim Start jeden Ordner in projects/ (außer _vorlagen): project.json
      plus die Liste der Dateien darin. Das Ergebnis ist das Modul
      "virtual:portfolio", das src/data.js importiert.
   2. Während "npm run dev": beobachtet projects/ und lädt den Hub neu, sobald
      dort etwas dazukommt oder sich ändert. Nimmt außerdem Speicher-Aufträge
      aus dem Sortiermodus an und schreibt sie in die project.json-Dateien.
   3. Beim "npm run build": kopiert projects/ unverändert nach dist/projects.
   --------------------------------------------------------------------------- */
import { readdirSync, readFileSync, writeFileSync, statSync, existsSync, cpSync } from 'node:fs';
import { join, resolve, relative, sep, isAbsolute } from 'node:path';
import { imageSize } from 'image-size';

const IMG = /\.(jpe?g|png|webp|avif|gif|svg)$/i;
/* Bildmaße mitlesen: so reserviert jedes Bild im Layout sofort seinen Platz */
function sizeOf(path) {
  try { const { width, height } = imageSize(readFileSync(path)); return width && height ? [width, height] : null; } catch { return null; }
}

const ROOT = resolve(import.meta.dirname, '..');
const DIR = join(ROOT, 'projects');
const VIRTUAL = 'virtual:portfolio', RESOLVED = '\0' + VIRTUAL;
const hidden = n => n.startsWith('_') || n.startsWith('.');
const byName = (a, b) => a.localeCompare(b, 'en', { numeric: true, sensitivity: 'base' });

function readText(path) {
  try { return readFileSync(path, 'utf8').replace(/^﻿/, ''); } catch { return null; }   // BOM von Windows-Editoren entfernen
}

/* Ein Projektordner: Beschreibung, Dateien im Ordner, Unterordner mit ihren Dateien */
function scanProject(id) {
  const base = join(DIR, id);
  const raw = readText(join(base, 'project.json'));
  if (raw == null) return null;                                  // Ordner ohne project.json wird ignoriert
  let json;
  try { json = JSON.parse(raw); }
  catch (e) { return { id, error: `project.json ist kein gültiges JSON: ${e.message}` }; }

  const files = [], dirs = [];
  for (const name of readdirSync(base).sort(byName)) {
    if (hidden(name)) continue;
    const st = statSync(join(base, name));
    if (st.isDirectory()) {
      const inner = readdirSync(join(base, name)).filter(n => !hidden(n) && statSync(join(base, name, n)).isFile()).sort(byName);
      const text = ['text.md', 'text.txt'].find(t => inner.includes(t));
      const sizes = Object.fromEntries(inner.filter(n => IMG.test(n)).map(n => [n, sizeOf(join(base, name, n))]));
      dirs.push({ name, files: inner, sizes, text: text ? readText(join(base, name, text)) : null });
    } else files.push(name);
  }
  const intro = ['text.md', 'text.txt'].find(t => files.includes(t));
  const sizes = Object.fromEntries(files.filter(n => IMG.test(n)).map(n => [n, sizeOf(join(base, n))]));
  return { id, json, files, sizes, dirs, text: intro ? readText(join(base, intro)) : null };
}

function scanAll() {
  if (!existsSync(DIR)) return [];
  return readdirSync(DIR).filter(n => !hidden(n) && statSync(join(DIR, n)).isDirectory()).map(scanProject).filter(Boolean);
}

/* Sortiermodus: [{ id, type?, order?, curated? }] in die jeweilige project.json schreiben */
function applyUpdates(updates) {
  let written = 0;
  for (const u of updates) {
    if (typeof u.id !== 'string' || !/^[^\\/.][^\\/]*$/.test(u.id)) throw new Error(`ungültige id ${u.id}`);
    const file = join(DIR, u.id, 'project.json');
    const raw = readText(file); if (raw == null) throw new Error(`${u.id}/project.json fehlt`);
    const json = JSON.parse(raw), before = JSON.stringify(json);
    for (const k of ['type', 'order', 'curated']) if (u[k] !== undefined) json[k] = u[k];
    if (JSON.stringify(json) !== before) { writeFileSync(file, JSON.stringify(json, null, 2) + '\n'); written++; }
  }
  return written;
}

export function portfolio() {
  return {
    name: 'portfolio',
    resolveId: id => (id === VIRTUAL ? RESOLVED : null),
    load(id) {
      if (id !== RESOLVED) return null;
      return `export const projects = ${JSON.stringify(scanAll())};`;
    },

    configureServer(server) {
      // Änderungen in projects/ → Daten neu lesen, Hub neu laden (gebündelt, damit Speichern vieler Dateien nur einmal lädt)
      let timer = null;
      server.watcher.on('all', (_ev, file) => {
        const r = relative(DIR, file);
        if (!r || r.startsWith('..') || isAbsolute(r)) return;      // nur Dateien innerhalb von projects/
        clearTimeout(timer);
        timer = setTimeout(() => {
          const mod = server.moduleGraph.getModuleById(RESOLVED);
          if (mod) server.moduleGraph.invalidateModule(mod);
          server.ws.send({ type: 'full-reload' });
        }, 150);
      });

      // Speichern aus dem Sortiermodus. Gibt es nur lokal, nie auf der veröffentlichten Seite.
      server.middlewares.use('/__portfolio/save', (req, res) => {
        if (req.method !== 'POST') { res.statusCode = 405; return res.end(); }
        let body = '';
        req.on('data', c => body += c);
        req.on('end', () => {
          try {
            const n = applyUpdates(JSON.parse(body).updates || []);
            res.setHeader('content-type', 'application/json');
            res.end(JSON.stringify({ ok: true, written: n }));
          } catch (e) {
            res.statusCode = 400;
            res.end(JSON.stringify({ ok: false, error: e.message }));
          }
        });
      });
    },

    closeBundle() {
      if (!existsSync(DIR)) return;
      cpSync(DIR, join(ROOT, 'dist', 'projects'), {
        recursive: true,
        // _vorlagen und versteckte Dateien werden nicht veröffentlicht
        filter: p => { const r = relative(DIR, p); return !r || !r.split(sep).some(hidden); },
      });
    },
  };
}
