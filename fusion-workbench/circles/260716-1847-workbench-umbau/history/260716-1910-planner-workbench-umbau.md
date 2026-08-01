# Planner-Sitzung: Umbau der workbench zum Circle-Container (Circle 1)

**Date:** 2026-07-16 19:10
**Agent:** planner
**Status:** Complete
**Input:** `fusion-workbench/planning/260716-1847[o]-spec-plane-integration-und-workbench-struktur.md` (C1, C2)

## Auftrag

Circle 1 des Plane-/Umbau-Vorhabens planen: C1 (ein Vorhaben liegt an einem Ort) und C2 (15 Agenten und 11 Skills schreiben in die neue Struktur). C3 und C4 (Plane) ausdrücklich außerhalb. Bindende Vorgaben: D2 = Circle-Verzeichnis plus gemeinsame Ablage, D4 = zwei Circles mit Umbau zuerst, D1 = Plane als Spiegel (nur als Randbedingung).

## Research Gate

Geprüft, nicht übernommen:

- `hooks/config.json:12-22` — keine Typ-Ordner unter den geschützten Pfaden. Der Spec-Befund trägt.
- Kopplung nachgemessen: `decisions` 94, `issues` 84, `circles` 82, `history` 69, `planning` 68, `analyses` 44, `codereview` 31, `ontoreview` 30, `consult` 30, `investigations` 25, `conceptreview` 8. Verteilung von 61 (`rules/fusion-workbench-conventions.md`) und 53 (`agents/orchestrator.md`) bis 1.
- `bin/fusion-rules` gelesen: das Helper-Muster, das der Plan wiederverwendet. Ein Aufruf im Setup-Schritt 2 je Agent, Auflösung im Skript.
- `hooks/package.json`: vitest vorhanden, `npm test` existiert. Kein neuer Testrahmen nötig.
- `install.sh:79-81`: kopiert `bin/` geschlossen. Ein neues Helper-Skript kostet in der Verteilung nichts.
- Diese workbench: `circles/` ist leer, das laufende Vorhaben liegt vollständig in den Typ-Ordnern.

## Entwurf

Kern: die Pfade werden aus den Prompts **entfernt**, nicht umgeschrieben. `bin/fusion-paths <agent>` tritt neben `bin/fusion-rules <agent>` in denselben Setup-Schritt und gibt `OUT_*`/`SCAN_*`-Werte aus. Ein vitest-Lint verbietet Typ-Ordner-Literale in `agents/` und `skills/`; erlaubt bleiben sie in `rules/fusion-workbench-conventions.md` und `bin/fusion-paths`.

Zielstruktur: `circles/<stamp>-<slug>/{[m]-circle.md,planning,issues,decisions,history,reviews,analyses}` plus `shared/` für alles ohne Vorhabens-Bezug. Die vier Wurzeldateien der Hooks bleiben unangetastet.

Ablageregel: **Herkunft, nicht Haltbarkeit.** Ein Artefakt liegt bei dem Circle, dessen Directive seine Entstehung veranlasste; ohne aktiven Circle in `shared/`. Übergreifende Geltung wird zitiert, nicht platziert.

Migration: dieselbe Regel löst sie. Für Altbestände ist die Circle-Zugehörigkeit nie aufgezeichnet worden, also ist "Herkunft unbekannt" = `shared/`. `/fusion:setup` bekommt einen idempotenten Migrationsschritt mit `git mv` und Nutzer-Bestätigung. Keine neue Skill.

## Ergebnis

- Plan: `fusion-workbench/planning/260716-1910[o]-plan-workbench-umbau-circle-container.md` — 11 Schritte, alle an `coder`, vier Phasen, drei Mermaid-Diagramme (Auflösungskette, Schritt-DAG, Layout als Baum).
- Entscheidung gefilt: `fusion-workbench/decisions/260716-1910[o]-circle-marker-am-verzeichnis-oder-an-der-circle-datei.md` — Marker an `[m]-circle.md` bei stabilem Verzeichnisnamen, empfohlen, am Gate zu bestätigen.
- Offen im Plan: Name der gemeinsamen Ablage (`shared/` vorgeschlagen), Kosten eines Wechsels nahe null vor Schritt 4.
