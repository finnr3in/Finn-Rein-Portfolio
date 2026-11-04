# Nächste Schritte

Reihenfolge ist ein Vorschlag. Jeweils eine Region bauen, zeigen, freigeben lassen.

## Deep Links (Übergabe §7.6)
- Jede Zoomstufe und jede Kartei per URL. Vorschlag Hash-Routen, damit es auf jedem statischen Host ohne Server-Regeln läuft: `#/speech-wall` (Ordner), `#/work-samples/sample-03-shader-study` (Karte), `#/speech-wall/open` (Kartei), optional `#/speech-wall/open/system` (Kapitel).
- `zoomTo` und `openRoom` schreiben den Hash, `hashchange` liest ihn. Zurück-Taste des Browsers muss eine Stufe zurück gehen.

## Bilder optimieren
- Bilder werden heute unverändert ausgeliefert. Beim Build verkleinern (z. B. 2400 px lange Kante, WebP) und `srcset` setzen. Originale bleiben im Ordner.

## Echte Projekte
- Bridge Module als erstes echtes Projekt füllen, daran Layout/Vorlage prüfen.

## Mobil
- Übersicht ist auf dem Handy sehr klein. Optionen: Index-Liste als Startansicht unter ~700 px, oder senkrechtes Raster (Main untereinander). Mit Finn entscheiden.
- Kartei: Seitenstreifen auf dem Handy evtl. als obere Leiste.

## About und Kontakt
- `projects/about/index.html` mit echten Inhalten füllen.

## Barrierefreiheit
- Pfeiltasten-Navigation zwischen Ordnern, Fokus-Reihenfolge nach Raster.
- Kartei: Fokusfalle (Tab bleibt zwischen Seitenstreifen und iframe), Fokus zurück auf Ordner beim Schließen (vorhanden).
- Screenreader: Liste/Index als gleichwertiger Zugang, `aria-live` für Zoomstufe.

## Offene Inhaltsfragen (aus der Übergabe)
- Englische Titel bestätigen (Bridge Module, Monitor Arm, Free Project: School).
- Inhalte für P3–P5 und die Work Samples.
- Bleibt „Index“ als Begriff?
