# Trägt das Circle-Verzeichnis den Zustandsmarker, oder die Circle-Datei darin?

---
**Domain:** code
**Status:** implemented
**Filed by:** planner
**Cross-references:** `fusion-workbench/planning/260716-1910[o]-plan-workbench-umbau-circle-container.md`, `fusion-workbench/decisions/260716-1847[a]-workbench-struktur-circle-container-vs-typ-ordner.md` (D2), `fusion-workbench/decisions/260716-1847[a]-plane-rolle-source-of-truth.md` (D1)

---

## Question

D2 macht den Circle zum Verzeichnis. Damit stellt sich eine Frage, die es bei einer Datei nicht gab: der Zustandsmarker (`[a]`, `[t]`, `[c]`, `[b]`, `[s]`, `[d]`) saß bisher im Dateinamen, und ein Zustandswechsel war ein `mv` genau dieser Datei. Bei einem Verzeichnis ändert dasselbe `mv` den Pfad jedes Artefakts darin. Die Frage muss vor Schritt 4 des Umbau-Plans fallen, weil Skills, Prompts und der Resolver auf der Antwort aufsetzen.

## Options

1. **Marker an der Circle-Datei, Verzeichnis stabil** — `circles/260716-1847-workbench-umbau/[t]-circle.md`
   - Pros: Pfade zu Spec, Plan, Issues und Entscheidungen bleiben über den ganzen Lebenszyklus stabil; Verweise brechen nie. Der Circle bekommt einen unveränderlichen natürlichen Schlüssel, den die Plane-Anbindung aus D1 für Idempotenz braucht. Zustand bleibt mit einem Glob lesbar (`circles/*/[t]-circle.md`). `.active-circle` wird über Übergänge hinweg stabil und muss nicht mehr nachgezogen werden.
   - Cons: `ls circles/` zeigt den Zustand nicht mehr auf einen Blick. Der Marker sitzt an einer anderen Stelle als bei `issues/` und `decisions/`, wo er im Dateinamen des Artefakts selbst steht.
2. **Marker am Verzeichnis** — `circles/260716-1847[t]-workbench-umbau/`
   - Pros: `ls circles/` bleibt lesbar wie heute. Die Marker-Konvention bleibt formal einheitlich: der Marker sitzt am Namen des Dings, dessen Zustand er beschreibt.
   - Cons: Jeder Zustandswechsel bricht jeden Pfad in den Circle hinein — aus Sitzungsprotokollen, aus `portfolio.md`, aus Entscheidungen anderer Circles, aus Stash-Manifesten. Der natürliche Schlüssel des Circles mutiert, was die Zuordnung zu Plane-Objekten in Circle 2 unzuverlässig macht.

## Constraints

- Die Marker-Vokabulare selbst sind nicht verhandelbar (Spec `## Out of Scope`).
- Der Zustand muss billig lesbar bleiben: `/fusion:next` und `playmaker` filtern auf `[a]` und `[t]`.
- D1 (Plane als Spiegel) verlangt für C3 einen Schlüssel je Circle, der eine zweimalige Übertragung ohne Duplikate erlaubt.

## Recommendation

Option 1. Die Pfadstabilität ist der eigentliche Gewinn des Container-Modells; Option 2 gibt ihn beim ersten Zustandswechsel wieder her. Der Nachteil von Option 1 ist die Lesbarkeit von `ls circles/`, und dafür existieren mit `portfolio.md` und `/fusion:next` bereits zwei gebaute Antworten. Der scheinbare Bruch der Marker-Konvention ist keiner: der Marker beschreibt weiterhin den Zustand des Circle-Datensatzes, und der Datensatz ist `circle.md`, nicht das Verzeichnis, das ihn und seine Artefakte einfasst.

---
Answered: history/260716-1800-orchestrator-session.md — Option 1 (Marker an der Circle-Datei, Verzeichnis stabil). Der Nutzer hat am Plan-Gate 2026-07-16 bestätigt: `circles/<stamp>-<slug>/[t]-circle.md`. Die Pfadstabilität über den Lebenszyklus und der unveränderliche Schlüssel für die spätere Plane-Spiegelung (D1) wiegen schwerer als die Lesbarkeit von `ls circles/`, für die `portfolio.md` und `/fusion:next` bereits gebaut sind. Zusätzlich am selben Gate bestätigt: die gemeinsame Ablage heißt `shared/` wie vom Planner vorgeschlagen.
Implemented: 6d4a88d (conventions set the marker on `[m]-circle.md`, directory name stable) + d803c1e/1d97c86 (orchestrator + agents read circles via the enumeration form `circles/*/*-circle.md`) — shipped in v4.0.0. Verifiziert: dieser Circle trägt den Marker auf `[t]-circle.md`, `.active-circle` hält den stabilen Verzeichnisnamen.
Deferred:
Superseded by:
