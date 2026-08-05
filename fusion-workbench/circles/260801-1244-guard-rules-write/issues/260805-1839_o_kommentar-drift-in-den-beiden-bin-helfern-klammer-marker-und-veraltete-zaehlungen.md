Kommentar-Drift in den beiden bin-Helfern: Klammer-Marker und veraltete Zählungen
---
Drei Stellen, alle nur Kommentare, kein Verhalten betroffen (gemessen vom fusion-rules/fusion-paths-Workstream):

1. `bin/fusion-rules:33-35`: beschreibt die Decision-Übergänge in der alten Klammer-Schreibweise `[o]→[a]→[i]` — die Datei `rules/decision-record-examples.md:5` verwendet seit der Migration `_o_ → _a_ → _i_`.
2. `bin/fusion-paths:114`: zitiert einen Issue-Pfad in prä-v4-Klammer-Form `fusion-workbench/issues/260717-0031[o]-…` — die Datei liegt real unter `fusion-workbench/shared/issues/260717-0031_o_…` (per ls gemessen).
3. `bin/fusion-paths:169`: „checked over all 15 agents and all 13 skills, 2026-07-17" — heute sind es 16 Agenten und 16 Skills.
---
Schweregrad: Low. Sammel-Issue für drei mechanische Kommentar-Fixes. Die Klammer-Schreibweise ist dabei mehr als Kosmetik-Geschmack: sie ist exakt die Form, deren Glob-Falle die Konventionen ausdrücklich verbieten — sie soll nirgendwo mehr als Vorbild lesbar sein.
