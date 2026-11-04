# Portfolio Hub – Übergabe Design → Funktion

Stand: 4. November 2026. Die Designrunde ist abgeschlossen. Dieses Dokument ist der Einstieg für den nächsten Chat, in dem die Funktion gebaut wird.

**Referenzdatei:** `portfolio-hub-final.html` (ein HTML-Prototyp, alles in einer Datei, Palette Americana). Sie ist die verbindliche Designvorlage. Was dort zu sehen ist, gilt; was hier steht, erklärt es.

---

## 1. Konzept in drei Sätzen

Die Startseite ist ein grafisches, zoombares Inhaltsverzeichnis (der **Hub**). Projekte liegen dort als **Ordner** auf einem unendlichen Raster; ihre Größe zeigt ihr Gewicht, ein farbiger Reiter zeigt, ob sie kuratiert sind. Öffnet man einen Ordner, betritt man die **Projektkartei**, einen eigenen Raum mit der Gestaltung des Projekts selbst, nicht der des Portfolios.

Wichtigste Anforderung aus dem Projekt: **Neue Arbeiten müssen leicht hinzuzufügen sein.** Ein Projekt wird unabhängig dokumentiert und erst danach im Hub eingetragen.

## 2. Inhalt (aktueller Stand)

| Typ | Größe im Raster | Anzahl | Codes |
|---|---|---|---|
| Main project | 4 × 4 | 3 | M1–M3 |
| Project | 2 × 2 | 5 | P1–P5 |
| Work sample | 1 × 1 | 10 | S01–S10, liegen gebündelt in der „Work Samples"-Schublade |

Echte Projekte im Prototyp: Speech Wall (M1, kuratiert), Bridge Module (M2, kuratiert), Monitor Arm (M3), rekordbox → Serato (P1, kuratiert), Free Project: School (P2). P3–P5 und alle zehn Work Samples sind Platzhalter.

Dazu: eine „About"-Karte (4 × 2) und gestrichelte freie Plätze als Zeichen, wo Neues hinkommt.

**Sprache der Seite:** Englisch.

## 3. Navigation und Mechanik

### Brett und Zoom
- **Unendliches Brett.** Das Raster liegt auf der Bühne, nicht auf dem Inhalt, und läuft in jede Richtung weiter. 1 Feld = 100 Welt-Einheiten.
- **Übersicht rahmt den Inhalt.** Die Startansicht passt sich automatisch an die Ausdehnung aller Einträge an. Kommt ein Projekt bei Feld 20 dazu, wächst die Übersicht mit.
- **Drei feste Zoomstufen:** Übersicht → Ordner / Schublade → Karte (nur Work Samples). Nie tiefer.
- **Eingaben:** Klick oder Scrollen auf ein Element zoomt eine Stufe hinein. Esc, Klick ins Leere oder Scrollen zurück zoomt eine Stufe heraus. Ziehen verschiebt das Brett frei.
- **Zoom-Flug:** Mitte linear, Maßstab logarithmisch, 760 ms, `prefers-reduced-motion` wird respektiert.

### Semantischer Zoom (Detailstufen)
Details hängen von der **tatsächlichen Bildschirmbreite eines Elements** ab, nicht von der Zoomstufe:

| Breite des Elements auf dem Bildschirm | Sichtbar |
|---|---|
| < 110 px | nur Code und Farbe |
| ≥ 110 px | + Titel |
| ≥ 230 px | + Beschreibung |
| ≥ 420 px oder im Fokus | + Kapitel-Pillen und „Open file" |

Nicht fokussierte Elemente werden auf 30 % abgedunkelt, wenn etwas im Fokus ist. Sie bleiben sichtbar („man sieht immer, was einen erwartet").

### Lineale
- Fest an der oberen und linken Bildschirmkante, über dem Inhalt, ohne Hintergrund.
- Zeigen immer die Brett-Koordinate in Feldern und laufen beim Zoomen und Ziehen mit.
- Teilung passt sich an, **Zahlen nur bei ganzen Feldern.**
- Ecke oben links: Zoomfaktor relativ zur Übersicht (z. B. ×2.4).

### Leiste oben
- **Links:** Logo (Finn Rein, F/R-Zeichen), genau **ein Rasterfeld der Übersicht** hoch. Klick führt zur Übersicht.
- **Rechts:** Pfad als Pillen („Overview · Work Samples · Shader Study"), aktuelle Stufe gefüllt, jede Pille springt zurück. Danach die Pille **„Index"**.

### Index (Notausgang)
Seitliche Liste aller Arbeiten nach Gruppen. Kuratierte Einträge haben einen orangen Punkt. Ein Klick öffnet die Kartei direkt.

### Projektkartei
- Öffnet sich aus dem Ordner heraus (clip-path-Animation von der Ordnerfläche auf Vollbild).
- **Linker Seitenstreifen** in Orange, volle Fläche, ohne Teilung:
  - oben „← Hub" als dunkle gefüllte Pille,
  - darunter der Projektcode,
  - darunter die **Kapitel des Projekts** als reine Schrift ohne Kontur. Klick scrollt zum Kapitel. Das gelesene Kapitel trägt die dunkle Farbe der Hub-Pille.
- Rechts davon gilt die **eigene Gestaltung des Projekts** (eigene Schrift, Farben, Aufbau). Im Prototyp sind drei Beispiel-Themes simuliert (Terminal, Beton/Serif, Weiß/Rot).

## 4. Formensprache

Grundlage ist die Wall-Formensprache (Skill `wall-formensprache`), aber nur ihre **Formen**, nicht ihre Farben.

- **Ordner = LiftedCard, unten angehoben:** dunkle Unterbox, darauf der Körper, unten bleibt ein Streifen der Unterbox sichtbar. Radius 0,2 em (relativ zur Elementgröße). Keine Schatten, keine Verläufe.
- **Reiter wächst aus dem Ordner:** gleiche Farbe wie der Körper, oben gerundet mit dem Kartenradius, rechts eine konkave Hohlkehle in die Oberkante. Die Ordnerecke unter dem Reiter ist eckig.
  - normal = Kartenton, Schrift grau
  - **kuratiert = Orange**, dunkle Schrift, Zusatz „Curated"
- **Deckblatt:** füllt die volle Breite, oben bleibt ein schmaler Streifen Kartenton (Übergang zum Reiter). Oben gerundet mit dem Kartenradius, unten eckig.
- **Hover:** Ordner und Reiter werden gemeinsam leicht heller (Tonwechsel statt Anheben).
- **Pillen (Stadion-Form):** Kontur = normal, gefüllt = aktiv. Gilt für Pfad, Index, Kapitel-Chips, „Open file", Schublade-Kopf.
- **Schublade:** Fläche in Schieferblau mit Spaltenkopf-Pille „Work Samples · 10 · 1×1", Untertitel darunter.
- **Freie Plätze:** gestrichelt, treten zurück.

## 5. Design-Tokens (Palette Americana)

```css
--ground:#1B1B1D;   /* Grund */
--holder:#2C2D33;   /* Karte */
--rail:#0E0E10;     /* Unterbox der LiftedCard */
--grid:rgba(232,216,201,.07);
--grid-major:rgba(232,216,201,.17);
--signal:#F3701E;   /* Orange: Seitenstreifen der Kartei */
--blue:#4B607F;     /* Schieferblau: Schublade */
--label:#F3701E;    /* Orange: Beschriftung, Kuratiert-Reiter */
--ink:#E8D8C9;      /* Creme: Text */
--muted:#9C9488;    /* Sekundärtext, Linealzeichen */
/* Projektfarben (Slots) */
--c-grise:#4B607F; --c-terra:#F3701E; --c-orange:#E8D8C9; --c-roi:#2F3D52; --c-avocat:#C4581A;
--c-olive:#8FA0B8; --c-rose:#F59A5E; --c-beige:#B8A898; --c-moutarde:#D8C4B0; --c-violet:#3A4A63; --c-magenta:#E0601A;
```

- **Schrift:** `'Tw Cen MT', 'Jost', 'Century Gothic', Arial, sans-serif` (Jost als Web-Fallback von Google Fonts).
- **Deckblatt-Schrift** wird automatisch nach Helligkeit gewählt (Luminanz > 0,18 → dunkle Schrift, sonst Creme).
- Das Design ist bewusst **nur dunkel** (kein Hell-Modus).

## 6. Datenmodell im Prototyp

Jeder Eintrag ist ein Objekt in `ITEMS`:

```js
{ id:'speech-wall', kind:'haupt',        // haupt | klein | probe | drawer | slot | about
  x:0, y:0, w:4, h:4,                     // Position und Größe in Rasterfeldern
  code:'M1', cur:true,                    // kuratiert ja/nein
  title:'Speech Wall', tag:'…',           // Titel und Kurzbeschreibung
  cv:'--c-grise',                         // Projektfarbe (Slot)
  chapters:['Idea','System','Space','Status'],
  theme:'mono',                           // Gestaltung der Kartei (nur Prototyp)
  parent:'proben' }                       // nur bei Work Samples: liegt in der Schublade
```

Positionen sind im Prototyp **von Hand gesetzt**.

## 7. Aufgaben für die Funktionsrunde

Vorgeschlagene Reihenfolge, jeweils eine Region bauen, zeigen, freigeben lassen:

1. **Stack und Hosting festlegen.** Statische Seite (z. B. Vite oder reines HTML/JS, Hosting über GitHub Pages / Netlify / Vercel) oder Framework. Kriterium: Projekte ohne Build-Wissen hinzufügen können.
2. **Projektordner-Struktur.** Ein Ordner pro Projekt mit eigener Seite (eigenes HTML/CSS) und einer Beschreibungsdatei, z. B.:
   ```json
   { "title": "Bridge Module", "type": "main", "curated": true, "color": "--c-terra",
     "tag": "A bridge built from a single, repeating L-shaped block",
     "chapters": ["Module","Joinery","Prototypes","Bridge"], "cover": "cover.jpg" }
   ```
   Der Hub liest nur diese Dateien. Kapitel kommen aus der Beschreibungsdatei oder werden aus den Überschriften der Projektseite gelesen.
3. **Automatische Anordnung im Raster.** Statt Hand-Koordinaten: Einträge nach Typ und Größe packen (Main 4×4, Project 2×2, Samples in die Schublade), freie Plätze automatisch zeigen. Optional manuelle Übersteuerung von x/y.
4. **Kartei als echte eigene Seite.** Projektseite in eigenem Raum laden (z. B. iframe oder separate Route), Seitenstreifen und Kapitel-Navigation vom Hub darüberlegen, Kapitel-Anker aus der Projektseite auslesen.
5. **Echte Deckblätter.** Bilder statt Farbflächen, Projektfarbe bleibt als Fallback und für den Reiter.
6. **Deep Links.** Jede Kartei und jede Zoomstufe per URL erreichbar und teilbar.
7. **Mobil.** Die Übersicht ist auf dem Handy sehr klein. Vermutlich ein eigenes, senkrechtes Raster oder die Index-Liste als Startansicht.
8. **About und Kontakt** mit echten Inhalten.
9. **Barrierefreiheit prüfen:** Tastaturnavigation durch das Brett, Fokus in der Kartei, Screenreader-Texte.

## 8. Offene Punkte

- Englische Projekttitel bestätigen (Bridge Module, Monitor Arm, Free Project: School).
- Inhalte für P3–P5 und die zehn Work Samples.
- Ob „Index" als Begriff bleibt.

## 9. Verworfene Richtungen (nicht wieder vorschlagen)

- Grüne Schneidematte mit an den Inhalt gekoppeltem Brett (V1).
- Subway-Farben, rote Lineal-Flächen, Pillen-Reiter (V2).
- Weißer LiftedCard-Reiter für kuratiert (V3).
- Gespiegelte Leiste mit Baum links und Logo rechts.
- Wirbelsäule mit drei Punkten als Zoomanzeige.
- Paletten 70er-Pantone, Neon, Mood, Ember, Cathedral (Neon war zweite Wahl).
