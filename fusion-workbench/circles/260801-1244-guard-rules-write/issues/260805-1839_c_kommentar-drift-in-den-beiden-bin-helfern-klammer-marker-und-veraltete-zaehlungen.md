Kommentar-Drift in den beiden bin-Helfern: Klammer-Marker und veraltete Zählungen
---
Drei Stellen, alle nur Kommentare, kein Verhalten betroffen (gemessen vom fusion-rules/fusion-paths-Workstream):

1. `bin/fusion-rules:33-35`: beschreibt die Decision-Übergänge in der alten Klammer-Schreibweise `[o]→[a]→[i]` — die Datei `rules/decision-record-examples.md:5` verwendet seit der Migration `_o_ → _a_ → _i_`.
2. `bin/fusion-paths:114`: zitiert einen Issue-Pfad in prä-v4-Klammer-Form `260717-0031[o]-…` — die Datei liegt real unter `260717-0031_*_…` (per ls gemessen).
3. `bin/fusion-paths:169`: „checked over all 15 agents and all 13 skills, 2026-07-17" — heute sind es 16 Agenten und 16 Skills.
---
Schweregrad: Low. Sammel-Issue für drei mechanische Kommentar-Fixes. Die Klammer-Schreibweise ist dabei mehr als Kosmetik-Geschmack: sie ist exakt die Form, deren Glob-Falle die Konventionen ausdrücklich verbieten — sie soll nirgendwo mehr als Vorbild lesbar sein.
---
Resolved: 2026-08-06 — `bin/fusion-rules`-Header in Unterstrich-Form (`_o_→_a_→_i_`); `bin/fusion-paths`-Zählungen auf 16 Agenten / 16 Skills (Kollisionsfreiheit am 2026-08-06 erneut verifiziert, `bin/fusion-paths:187`), Zwei-Orte-Aussage durch die fünf `DEFINITION_SITES` ersetzt, Prä-v4-Issue-Zitat auf `shared/issues/…`-Wildcard (:117). Commit 9a96466, Circle 260805-2005-textschicht-gegen-code-nachziehen (Plan-Schritt 12, Batch C).
