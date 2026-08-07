`bin/fusion-paths ontocoder` liefert kein `OUT_DECISION`, obwohl Pläne dem Agenten Entscheidungssätze zuweisen
---
`bin/fusion-paths` leitet die Schlüsselmenge eines Konsumenten daraus ab, welche Schlüssel dessen eigener Prompt nennt. `agents/ontocoder.md` nennt nur `$OUT_ISSUE` (Zeile 45) und `$OUT_HISTORY` (Zeile 86), nicht `$OUT_DECISION`. Der Aufruf `bin/fusion-paths ontocoder` gibt daher `OUT_HISTORY`, `OUT_ISSUE`, die vier `SCAN_*` und `TASKLIST` aus, aber keinen Schreibpfad für Entscheidungssätze — auch keinen Fehler, weil der Resolver nur meckert, wenn ein Prompt einen Schlüssel nennt, den er nicht bewerten kann (Exit 4), nicht umgekehrt.
---
Aufgefallen bei Schritt 1 des Plans `circles/260807-0923-guard-misst-statt-orakelt/planning/260807-0931_o_plan-guard-misst-statt-orakelt.md`. Dort ist ontocoder der Ausführer, und der Schritt verlangt ausdrücklich einen Entscheidungssatz "in `$OUT_DECISION`". Der Auftrag an den Agenten wiederholte diese Formulierung wörtlich.

Der Agent hat den Satz in diesem Fall nach `circles/260807-0923-guard-misst-statt-orakelt/decisions/` geschrieben — abgeleitet aus der Circle-Hälfte von `SCAN_DECISIONS` und aus der Herkunftsregel, die den Satz dem aktiven Circle zuweist. Das ist mit hoher Wahrscheinlichkeit der richtige Ort, aber es ist eine Ableitung des Agenten und nicht die Antwort des Resolvers. Genau diese Ableitung soll die Pfadauflösung ersetzen: `rules/fusion-workbench-conventions.md` `## Path Resolution` nennt `bin/fusion-paths` den einzigen Auflösungspunkt und verbietet, dass ein Prompt eine konkurrierende Ortsangabe trägt.

Die verpflichtende Ablageregel derselben Datei (`## Issue and Decision Filing — MANDATORY`) richtet sich an jeden Agenten, nicht nur an die, deren Prompt `$OUT_DECISION` erwähnt. Ein ontocoder, der beim Bearbeiten von Daten eine offene Frage findet, steht damit heute vor demselben Problem, unabhängig von diesem Plan.

Zwei denkbare Auflösungen, beide nicht in diesem Circle zu entscheiden:
1. `agents/ontocoder.md` nennt `$OUT_DECISION` an der Stelle, an der es heute `$OUT_ISSUE` nennt; der Resolver gibt den Schlüssel dann von selbst aus.
2. Entscheidungssätze werden ontocoder gar nicht zugewiesen, und der Plan-Schritt wechselt den Ausführer.

Die Lücke ist nicht auf ontocoder beschränkt. Gemessen mit `grep -l OUT_DECISION agents/*.md`: den Schlüssel nennen sechs Prompts (`analyst`, `investigator`, `reconciler`, `consultant`, `shaper`, `orchestrator`). Die übrigen zehn nennen ihn nicht — darunter `coder`, `ontocoder`, `planner`, `bugfixer`, `coderev` und `ontorev`, also gerade die Agenten, die beim Umsetzen und Prüfen auf offene Fragen stoßen. Für sie alle gilt die verpflichtende Ablageregel, und für keinen von ihnen gibt der Resolver einen Zielpfad aus.
