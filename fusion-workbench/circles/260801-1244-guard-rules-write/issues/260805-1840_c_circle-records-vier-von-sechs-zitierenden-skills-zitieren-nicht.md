circle-records.md behauptet, sechs Skills zitierten die Datei direkt — vier davon zitieren sie gar nicht, ein siebter zitiert sie und fehlt
---
Schweregrad: mittel. rules/circle-records.md:16-18: "/fusion:next, /fusion:direct, /fusion:cleanup, /fusion:archive, /fusion:circle-stash, /fusion:setup — cite it directly". Grep je Skill: next=2 Treffer, direct=3, cleanup=0, archive=0, circle-stash=0, setup=0. circle-stash zitiert stattdessen workbench-stash-and-lock.md. Nebenbefund: /fusion:migrate zitiert die Datei (SKILL.md:94), steht aber nicht in der Liste.
---
Emittiert an orchestrator, playmaker, shaper; ausgeliefert. Klasse 2/3, verifiziert. Analyse: 260805-1840-doku-gesamtpruefung-gegen-code.md
---
Resolved: 2026-08-06 — Skill-Zitierliste auf den gemessenen Bestand korrigiert: `/fusion:next`, `/fusion:direct`, `/fusion:migrate` zitieren; die vier Nicht-Zitierer sind gestrichen (`rules/circle-records.md:17`, per grep am HEAD erneut verifiziert). Commit fae818b, Circle 260805-2005-textschicht-gegen-code-nachziehen (Plan-Schritt 10, Batch A).
