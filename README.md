# Portfolio Hub – Finn Rein

Zoombares, grafisches Inhaltsverzeichnis. Arbeiten liegen als Ordner auf einem unendlichen Raster; ein Ordner öffnet die Seite des Projekts.

## Befehle

```bash
npm install          # einmalig, und nach Änderungen an package.json
npm run dev          # lokale Vorschau mit Live-Reload und Sortiermodus: http://localhost:5173
npm run new <name>   # neues Projekt anlegen (fragt alles ab)
npm run build        # fertige Seite nach dist/ (macht GitHub automatisch)
```

Veröffentlichen: committen und pushen. GitHub baut die Seite und stellt sie online (`.github/workflows/deploy.yml`).

## Neue Arbeit hinzufügen

```bash
npm run new lamp-study
```

Das Skript fragt Titel, Typ (Größe im Raster), Seitenart und Farbe ab und legt `projects/lamp-study/` an. Läuft `npm run dev`, erscheint die Arbeit sofort im Hub.

### Die Seitenarten

**1. Standard-Layout** – für alles ohne eigene Gestaltung: Zeichnungen, Renderings, Fotos, kleinere Projekte.

```
projects/lamp-study/
  project.json
  cover.jpg            ← optional: Bild auf dem Ordner im Hub
  text.md              ← optional: Einleitung
  01 Sketches/         ← ein Unterordner = ein Kapitel. Die Zahl sortiert und wird nicht angezeigt.
    text.md            ← optional: Text zum Kapitel
    a.jpg  b.jpg …     ← Bilder in Namensreihenfolge
  02 Model/
    …
```

In `project.json`: `"background"` (`paper`, `white`, `dark`, ein Palettenname oder `#hex`) und `"columns"` (1–4 Bilder nebeneinander). Texte: Leerzeilen trennen Absätze. Klick auf ein Bild zeigt es groß.

**2. Eigene Seite einbetten** – wenn das Projekt seine eigene Dokumentation mitbringt.
- **HTML:** `index.html` in den Ordner legen (Vorlage: `projects/_template`). Kapitel für die Navigation: Elemente mit `data-chapter="Name"`.
- **PDF:** die PDF in den Ordner legen, fertig. Kapitel mit Seitenzahl optional: `"chapters": [{"name": "Model", "page": 5}]`.
- **Andere Datei oder Adresse:** `"page": "doku/start.html"` oder `"page": "https://…"`.

Erkannt wird automatisch: liegt eine `index.html` im Ordner → eingebettet; sonst eine PDF → eingebettet; sonst → Standard-Layout. `"page"` in `project.json` übersteuert das (`"page": "layout"` erzwingt das Layout).

**Seitenstreifen:** `"strip": false` blendet den orangen Streifen aus. Eine schmale orange Kante bleibt am linken Rand; dort hinfahren (oder antippen), und der Streifen kommt zurück.

### project.json

| Feld | Bedeutung |
|---|---|
| `title` | Titel |
| `type` | `main` (4×4), `project` (2×2), `sample` (1×1, in der Schublade), `about` |
| `tag` | ein Satz unter dem Titel |
| `curated` | `true` = oranger Reiter |
| `color` | Farbe des Ordners: `grise`, `terra`, `orange`, `roi`, `avocat`, `olive`, `rose`, `beige`, `moutarde`, `violet`, `magenta` oder `#hex` |
| `order` | Reihenfolge in der Gruppe (setzt der Sortiermodus) |
| `chapters` | Kapitelnamen für Ordner und Navigation (im Layout automatisch aus den Unterordnern) |
| `cover` | anderes Deckblatt als `cover.jpg` |
| `stripes` | Linienmuster statt Bild, z. B. `"90deg"` |
| `page`, `strip`, `background`, `columns` | siehe oben |
| `placeholder` | `true` = als Platzhalter beschriftet |

Ordner, deren Name mit `_` beginnt, werden ignoriert.

## Sortieren

Bei `npm run dev` gibt es oben die Pille **Edit**:
- Ordner auf einen anderen ziehen → nimmt dessen Platz ein. In einer anderen Gruppe ändert sich auch die Größe (z. B. Project → Main project).
- Auf einen freien Platz ziehen → ans Ende dieser Gruppe.
- Doppelklick → kuratiert an/aus.

Gespeichert wird sofort in die `project.json`-Dateien. Danach committen und pushen, wie bei jeder anderen Änderung. Auf der veröffentlichten Seite gibt es den Modus nicht.

## Aufbau

```
index.html                  Gerüst des Hubs
src/main.js                 Brett, Zoom, Lineale, Eingaben, Index
src/data.js                 macht aus den Projektordnern die Einträge, ordnet im Raster an
src/room.js                 Projektkartei: Layout oder eingebettete Seite, Seitenstreifen
src/layout.js               Standard-Layout
src/editor.js               Sortiermodus (nur lokal)
src/style.css               Design-Tokens (Palette Americana) und Formen
scripts/portfolio-plugin.js liest projects/, Live-Reload, Speichern, kopiert projects/ in den Build
scripts/new.mjs             npm run new
projects/<ordner>/          eine Arbeit pro Ordner
```
