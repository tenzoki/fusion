Ausgelieferte Texte zitieren acht Workbench-Records, die nirgends existieren
---
Gemessen per `find fusion-workbench -name "*<stamp>*"` (inkl. `shared/` und `archive/`) — alle acht Treffer leer:

In `agents/playmaker.md` (ausgelieferter Agenten-Prompt):
- Z.12 und Z.198: `260511-1031_*_consultant-vs-playmaker-boundary.md` — Z.12 behauptet dazu „under `$SCAN_DECISIONS`", was in jedem konsumierenden Projekt falsch ist.
- Z.124: `260511-1031_*_mutual-grounding-conflict-resolution.md`
- Z.133: `260511-1031_*_bounded-closure-propagation.md`
- Z.199: `260511-1031_*_tasklist-md-scoping-under-circles.md`

In `rules/workbench-stash-and-lock.md` (ausgelieferter Regel-Shard):
- Z.79 und Z.98: `260519-1100_*_circle-stash-pop-design.md`
- Z.97: `260519-0438-circle-stash-pop-concept.md` — mit der falschen Ortsangabe „(pre-container; now under `shared/`)"
- Z.142: Issue `260516-0534_*_cross-agent-staging-race-on-unlocked-working-tree.md` — ebenfalls mit falscher Ortsangabe „now under `shared/issues/`"; `agents/orchestrator.md:356` verspricht zusätzlich, der Stash-Lock-Shard dokumentiere „the closed issue that this protocol answers".
---
Schweregrad: Medium. Dieselbe Klasse wie das geschlossene 260805-1145_*_der-forensik-zeiger-im-ausgelieferten-regeltext-zeigt-auf-eine-datei-die-der-installer-nie-mitnimmt.md (Forensik-Zeiger), deren Behandlung Entscheidung 260805-0709_*_wohin-gehoert-die-forensik-aus-protected-path-discipline.md bereits festgelegt hat: Beleg ohne Pfad nennen, wenn kein Leser ihn auflösen kann. Befund des Verweis-Workstreams (Analyst), von coderev nachgemessen (grep-Zitate + leere finds). Die „now under shared/"-Angaben sind darüber hinaus positiv falsch — die Records liegen auch dort nicht. Fix: die verbleibenden Fundstellen nach der 260805-0709_*_wohin-gehoert-die-forensik-aus-protected-path-discipline.md-Regel umformulieren (Substanz des Belegs in den Text ziehen, toten Pfad streichen).
---
Resolved: 2026-08-06 — alle acht Fundstellen nach der `260805-0709_*_wohin-gehoert-die-forensik-aus-protected-path-discipline.md`-Regel behandelt (Beleg-Substanz in den Text, toter Pfad gestrichen): die `rules/workbench-stash-and-lock.md`-Hälfte in Commit fae818b (Plan-Schritt 10, Batch A), playmakers fünf `260511-1031`-Zitate in Commit a1b7872 (Plan-Schritt 14, im Kalibrierlauf des Referenz-Lints). Grep am HEAD: `260511-1031`, `260519-1100`, `260519-0438`, `260516-0534` ohne Treffer in agents/ und rules/; der Referenz-Lint hält die Klasse künftig ab. Circle 260805-2005-textschicht-gegen-code-nachziehen.
