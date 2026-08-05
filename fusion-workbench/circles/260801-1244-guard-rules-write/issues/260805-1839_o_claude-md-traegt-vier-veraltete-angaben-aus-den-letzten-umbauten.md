CLAUDE.md trägt vier veraltete Angaben aus den letzten Umbauten
---
Dev-Doku, nicht ausgeliefert — gesammelt in einem Issue:

1. „`/fusion:setup` Step 0d checks for an active-session marker" — der Check ist heute Step 0c (`skills/setup/SKILL.md:104`); 0d sind die Stilwerk-Profile.
2. „See `rules/fusion-workbench-conventions.md` "State Markers — circles"" (Circles-Konventionszeile) — der Abschnitt lebt in `rules/circle-records.md:26`.
3. Symptomtabelle Monitor-TZ: verweist auf `fusion-workbench/issues/260518-0130_o_monitor-event-list-times-tz-offset.md` als „sibling still open" — die Datei existiert nirgends im Workbench (find leer), und der Monitor routet Event-Listen-Zeiten inzwischen durch `parseUTCTs` (`bin/monitor:455`, `formatLocalTime`); der Eintrag beschreibt einen behobenen Stand.
4. „The historical decision records under `fusion-workbench/decisions/260516-*-bus-*.md`" — find leer, Pfad zusätzlich in prä-Container-Form.
---
Schweregrad: Low. Punkte 1/2/4 vom Verweis- bzw. Prompt-Workstream (Analysten), Punkt 3 von coderev selbst gemessen (find leer; parseUTCTs-Routing in bin/monitor gelesen). Fix: vier Zeilen in CLAUDE.md; Kandidat für den nächsten `/fusion:revise-claude-md`-Lauf.
