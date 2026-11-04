# CLAUDE.md – Portfolio Hub

## Status

| Region | Stand |
|---|---|
| 1 Stack (Vite 8, Vanilla JS) | ✅ |
| 2 Projektordner + Plugin | ✅ `scripts/portfolio-plugin.js` liest Ordner, Dateien, Bildmaße |
| 3 Anordnung + Sortiermodus | ✅ automatisch nach Typ/order; Sortieren per Ziehen bei `npm run dev` |
| 4 Kartei | ✅ zwei Arten: Standard-Layout oder Einbetten (HTML/PDF/URL); Streifen optional |
| 5 Deckblätter | ✅ `cover.jpg` automatisch; mit echten Fotos noch ungetestet |
| `npm run new` | ✅ |
| Hosting | 🟡 GitHub Pages vorbereitet (`deploy.yml`), erster Push + Pages-Einstellung offen |
| 6 Deep Links | ⬜ |
| 7 Mobil | ⬜ |
| 8 About / Kontakt mit Inhalt | ⬜ (Text ist Platzhalter) |
| 9 Barrierefreiheit | ⬜ |
| Bildoptimierung | ⬜ (Bilder werden unverändert ausgeliefert) |

Details und Verlauf: `PROGRESS.md`. Aufgaben im Einzelnen: `docs/next-steps.md`.

## Was das ist

Finns Portfolio. Startseite ist ein zoombares Inhaltsverzeichnis (Hub). Arbeiten liegen als Ordner auf einem unendlichen Raster, ein Ordner öffnet die eigene Projektseite („Kartei“) mit der Gestaltung des Projekts, nicht der des Portfolios. Seitensprache: Englisch.

**Wichtigste Anforderung:** Neue Arbeiten müssen ohne Code-Änderung hinzukommen. Ein Ordner in `projects/` reicht. Jede Änderung muss das erhalten.

## Verbindliche Designvorlage

`docs/portfolio-uebergabe.md` beschreibt das abgeschlossene Design. Der HTML-Prototyp (`portfolio-hub-final.html`) liegt im claude.ai-Project „Portfolio website“; `src/` ist eine getreue Übertragung davon und gilt jetzt als Stand. Was dort zu sehen ist, gilt.
`docs/reference/retro-70s-pantone.jpg` ist die Pantone-Karte, aus der die Namen der Farb-Slots stammen (`--c-terra`, `--c-avocat` …). Die Palette selbst ist verworfen, die Werte kommen aus Americana. Formen aus dem Skill `wall-formensprache`, aber nur die Formen, nicht deren Farben. Tokens in `src/style.css`. Nur dunkel, kein Hell-Modus.

Feste Regeln aus dem Design:
- Drei Zoomstufen: Übersicht → Ordner/Schublade → Karte (nur Work Samples). Nie tiefer.
- Semantischer Zoom nach Bildschirmbreite des Elements: <110 px Code, ≥110 Titel, ≥230 Beschreibung, ≥420 oder Fokus Kapitel + „Open file“.
- Zoom-Flug 760 ms, Mitte linear, Maßstab logarithmisch, `prefers-reduced-motion` beachten.
- Logo ist genau ein Rasterfeld der Übersicht hoch.
- Lineale: Zahlen nur bei ganzen Feldern.

Nicht wieder vorschlagen: grüne Schneidematte, Subway-Farben, rote Lineal-Flächen, Pillen-Reiter, weißer Kuratiert-Reiter, gespiegelte Leiste, Wirbelsäule als Zoomanzeige, andere Paletten.

## Technik

- Befehle: `npm run dev` / `build` / `preview` / `new <name>`. Bedienung für Finn: `README.md`.
- `scripts/portfolio-plugin.js`: virtuelles Modul `virtual:portfolio` mit `project.json` + Dateilisten + Bildmaßen jedes Ordners in `projects/` (ohne `_*`, `.*`). Im Dev: Watcher → Full-Reload, `POST /__portfolio/save` schreibt `type`/`order`/`curated`. Im Build: kopiert `projects/` nach `dist/projects`.
- `src/data.js`: Seitenart je Projekt (`page` > `index.html` > PDF > Layout), Kapitel, Raster-Anordnung.
- `src/room.js`: Layout als DOM im Raum (`src/layout.js`), sonst iframe. Bei HTML gleiche Herkunft → Kapitel aus `data-chapter`, Scroll, Esc. `strip:false` → Streifen absolut, `.peek` per Randzone `#roomHot`.
- `src/editor.js`: nur per `import.meta.env.DEV` dynamisch geladen, nicht im Build.
- 1 Feld = `U` = 100 Welt-Einheiten.
- Bildmaße kommen aus `image-size` (devDependency), damit lazy geladene Bilder Platz reservieren und Kapitelsprünge stimmen.

## Ordner

- Arbeitsordner: `C:\Users\finnr\Nextcloud\portfolio\website` (wird von Nextcloud synchronisiert).
- `node_modules/` und `dist/` gehören nicht in die Synchronisation: im Nextcloud-Client unter Einstellungen → Allgemein → „Ausgeschlossene Dateien bearbeiten“ eintragen.
- `npm install` auf Windows ausführen, nicht in einer Linux-Umgebung im selben Ordner (Vite 8 bringt plattformeigene Binaries mit).
- `_archive/` enthält das ursprüngliche ZIP, kann gelöscht werden.
- Repo: https://github.com/finnr3in/Finn-Rein-Portfolio (Branch `main`). `.git` ist in Nextcloud ausgeschlossen. Git-Befehle auf Windows ausführen.

## Arbeitsweise

Eine Region bauen, Finn zeigen, freigeben lassen, dann die nächste. Kleine prüfbare Schritte. Nach jedem Schritt `PROGRESS.md` aktualisieren.
