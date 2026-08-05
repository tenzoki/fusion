Ausgelieferte Texte zitieren acht Workbench-Records, die nirgends existieren
---
Gemessen per `find fusion-workbench -name "*<stamp>*"` (inkl. `shared/` und `archive/`) — alle acht Treffer leer:

In `agents/playmaker.md` (ausgelieferter Agenten-Prompt):
- Z.12 und Z.198: `260511-1031_a_consultant-vs-playmaker-boundary.md` — Z.12 behauptet dazu „under `$SCAN_DECISIONS`", was in jedem konsumierenden Projekt falsch ist.
- Z.124: `260511-1031_a_mutual-grounding-conflict-resolution.md`
- Z.133: `260511-1031_a_bounded-closure-propagation.md`
- Z.199: `260511-1031_a_tasklist-md-scoping-under-circles.md`

In `rules/workbench-stash-and-lock.md` (ausgelieferter Regel-Shard):
- Z.79 und Z.98: `decisions/260519-1100_a_circle-stash-pop-design.md`
- Z.97: `analyses/260519-0438-circle-stash-pop-concept.md` — mit der falschen Ortsangabe „(pre-container; now under `shared/`)"
- Z.142: Issue `260516-0534_c_cross-agent-staging-race-on-unlocked-working-tree.md` — ebenfalls mit falscher Ortsangabe „now under `shared/issues/`"; `agents/orchestrator.md:356` verspricht zusätzlich, der Stash-Lock-Shard dokumentiere „the closed issue that this protocol answers".
---
Schweregrad: Medium. Dieselbe Klasse wie das geschlossene 260805-1145 (Forensik-Zeiger), deren Behandlung Entscheidung 260805-0709 bereits festgelegt hat: Beleg ohne Pfad nennen, wenn kein Leser ihn auflösen kann. Befund des Verweis-Workstreams (Analyst), von coderev nachgemessen (grep-Zitate + leere finds). Die „now under shared/"-Angaben sind darüber hinaus positiv falsch — die Records liegen auch dort nicht. Fix: die verbleibenden Fundstellen nach der 260805-0709-Regel umformulieren (Substanz des Belegs in den Text ziehen, toten Pfad streichen).
