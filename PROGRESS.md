# PROGRESS

## 2026-11-04 – Seitenarten, npm run new, Sortiermodus, GitHub Pages (Chat)

**Entschieden (Finn)**
- Zwei Seitenarten: Standard-Layout (Bilder in Kapitelordnern + Hintergrund) und Einbetten (eigene HTML oder PDF).
- Seitenstreifen optional; versteckt erscheint er am linken Rand.
- Sortieren im Raster (nach Gruppen), kein freies Platzieren.
- Hosting: GitHub Pages, Repo `finnr3in/Finn-Rein-Portfolio`.

**Gebaut**
- `scripts/portfolio-plugin.js` ersetzt `import.meta.glob` und das Kopier-Plugin.
- Standard-Layout (`src/layout.js`), Lightbox, Einbetten von PDF mit Seitensprung, `PDF ↗`-Knopf im Streifen.
- `"strip": false` mit Randzone.
- `npm run new` (`scripts/new.mjs`).
- Sortiermodus (`src/editor.js`): Ziehen ordnet um und ändert Typ, Doppelklick kuratiert.
- Work Samples und P3–P5 auf Standard-Layout umgestellt (je ein leerer Kapitelordner).
- `.github/workflows/deploy.yml`, `.gitattributes` (LF).

**Geprüft (Headless-Chromium)**
- Layout mit Testbildern: Kapitel aus Ordnern, Navigation, Sprung zum letzten Kapitel, Lightbox, Esc.
- PDF-Projekt mit `strip:false`: Streifen versteckt, erscheint am Rand. PDF-Anzeige selbst nicht prüfbar (Headless zeigt keine PDFs).
- Sortiermodus: Project auf Main gezogen → Typ und Reihenfolgen in allen project.json korrekt, Modus bleibt nach Reload an. Doppelklick kuratiert.
- Build: Sortiermodus nicht enthalten, `_template` nicht veröffentlicht.

**Offen**
- Leere Kapitelordner kommen nicht ins Git (Git speichert keine leeren Ordner). Lokal sichtbar, online unschädlich.

## 2026-11-04 – Umzug in den Arbeitsordner

- Projekt nach `C:\Users\finnr\Nextcloud\portfolio\website` entpackt (flach, ohne Unterordner `portfolio/`).
- `docs/portfolio-uebergabe.md` aus dem claude.ai-Project übernommen.
- Pantone-Bild nach `docs/reference/retro-70s-pantone.jpg`, ZIP nach `_archive/`.
- Noch nicht installiert: `npm install` steht auf Windows aus.

## 2026-11-04 – Gerüst und Projektordner (Chat)

**Entschieden**
- Stack: Vite + Vanilla JS. Grund: Prototyp lässt sich fast unverändert übernehmen, und `import.meta.glob` sammelt die Projektordner automatisch ein. Ohne Build müsste jedes Projekt zusätzlich in eine zentrale Liste.
- Hosting: noch offen. `base: './'` hält den Build auf jedem Host und in jedem Unterordner lauffähig.

**Gebaut**
- Prototyp in Module zerlegt (`src/`), Aussehen unverändert.
- 19 Projektordner aus den Inhalten des Prototyps (3 Main, 5 Projects davon 3 Platzhalter, 10 Samples, About). Die drei Beispiel-Themes (Terminal, Beton/Serif, Weiß/Rot) liegen jetzt als echte eigene Seiten in den Projektordnern.
- Vorlage `projects/_template`.
- Automatische Anordnung, ergibt für den heutigen Inhalt exakt das Raster des Prototyps.
- Kartei lädt die echte Projektseite, Kapitel-Navigation aus `data-chapter`, aktives Kapitel folgt dem Scrollen, Esc schließt auch innerhalb der Projektseite.

**Abweichungen vom Prototyp**
- `[hidden]{display:none!important}` ergänzt. Ohne das überschrieb `.room{display:flex}` das `hidden`-Attribut: die unsichtbare Kartei lag über dem Hub und blockierte alle Klicks. Im Prototyp fiel das in der Vorschau-Umgebung nicht auf.
- Legende: Eintrag „Reiter normal“ entfernt (war deutsch auf der englischen Seite).
- Ungenutztes CSS (Wirbelsäule/Knoten, verworfen) entfernt.

**Geprüft**
- Build ohne Warnungen, `_template` wird nicht veröffentlicht.
- Headless-Browser: Übersicht, Ordner, Kartei, Kapitelsprung, Esc, Schublade.
- Test: ein viertes Main-Projekt nur per Ordner angelegt → M4 erscheint, Schublade rückt nach rechts, Übersicht und Logo passen sich an. Danach wieder entfernt.

**Bekannt / offen**
- Ein Main-Projekt mit `cover` wurde noch nicht mit echtem Bild getestet.
- Fremde Projektseiten (andere Domain) würden laden, aber ohne Kapitel-Navigation aus der Seite (Fallback: Kapitel aus `project.json`).
