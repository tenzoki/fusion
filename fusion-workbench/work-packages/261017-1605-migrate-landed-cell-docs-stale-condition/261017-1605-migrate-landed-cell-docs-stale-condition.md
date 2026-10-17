# /fusion:migrate: the landed-cell docs drop the stale-record condition every landedFence caller applies

## Directive

Filed on the user's word of 2026-10-17 in chat. Offered the option "Das Issue als kleines Paket im Automode beheben (13.1.10)", the user answered "1". The work is the low issue `261017-1049-migrate-landed-cell-docs-drop-the-stale-condition-so-an-interrupted-rollback-meets-their-premise.md`, filed by the closing review of `261017-1026-migrate-landed-cell-docs-reset-wording`: the clauses 13.1.9 reworded in the `bin/fusion-migrate` header and the `migrate.ts` row of `README-hooks.md` no longer carry the condition that the record reads stale, which every caller of `landedFence` in `hooks/migrate.ts` applies, so an interrupted rollback over a legacy tree (record current) meets their premise while the helper names no chunk there. Fix direction and acceptance are the issue's. The new wording is checked against every caller of `landedFence` before it is written, so this fix does not open a third round. Docs only: no condition, message or exit code moves. Released as fusion 13.1.10, the marketplace entry edited before anything is pushed.

The user asked for this item to run in mode autonomous, in the answer quoted above.

## Closure

Closed `done` on 2026-10-17, outcome class `completed`, by the orchestrator in session `3bd9f8b5-e804-461f-868f-a0c46a94a8f9`, the finish answered by mode autonomous. Commit range `8f9567db..` the closing commit; released as fusion 13.1.10, tag `v13.1.10` on `2615df08`, marketplace entry `69ad2ac`, the cache clone pulled. Order as run: the marketplace entry was edited before any push, fusion `main` and the tag were pushed before the marketplace commit was pushed, and the cache pull came last. The low issue the package was filed for is resolved and closed as fixed (`2615df08`). The closing review `261017-1637-reviewer-closing-pass-over-the-migrate-landed-cell-docs-stale-condition-package.md` ran before the tag over `f95c0b28..2615df08`, verdict accept, Not-opened none. Left open, both filed by that review: `261017-1637-migrate-end-fence-landed-clause-promises-the-message-for-a-session-recorded-for-another-workbench-path.md` and `261017-1637-migrate-undo-note-names-end-fence-for-an-undo-cut-mid-chunk-where-an-intent-pending-makes-it-refuse.md`.

Stop conditions of the plan, not put to the user under mode autonomous, carried verbatim and none marked as failing:

- `bin/fusion-migrate` differs from `8273bd4e` only in comment lines of the `rollback --end-fence` entry.
- In the `bin/fusion-migrate` header, the `migrate.ts` row of `README-hooks.md` and the `**Undo.**` paragraph of `docs/upgrading-to-v13.md`, the landed clause names the stale record, the record's own rollback fence, landed chunks of that rollback, no pending intent and a legacy tree, and no other condition.
- None of the three texts contains "before the reset", and each names a reset only as one possible way into the cell.
- The quiet-cell sentence and the hand-deletion once-clause beside each landed clause are unchanged, and no other line of `README-hooks.md` changed.
- Every exit code, condition and message string in `hooks/migrate.ts` and `bin/fusion-migrate` is unchanged, and `migrate.test.ts` passes with no edit to it.
- The issue carries a `Resolved:` line, and the full hook suite ran after that write with no red beyond the two pre-existing `workbench-citation-lint` findings.
- Every growth bound is green with the golden regenerated, and no baseline, `SKILL_BASELINE` entry or head-room constant was edited.
- `reference-resolution-lint`'s `BASELINE` reads 2061/371/11, unedited, and the lint passes.
- The help paragraph reads "Coming from 13.1.9 or earlier" and "13.1.2 to 13.1.10 need no migration", still says "13.1.2 to 13.1.7 each change only", and carries a 13.1.10 sentence saying it changes nothing that runs.
- Before anything is pushed, `plugin.json`, both pin examples and the marketplace working clone's `marketplace.json` read 13.1.10.
- Before the tag `v13.1.10` is created, a closing review of the range since `v13.1.9` is filed in this package's reviews store, and its verdict is accept or every finding it rates above Low is answered.
- The tag `v13.1.10` is on the pushed fusion `main` commit, and the fusion push happened before the marketplace push.
- After both pushes, the marketplace cache clone has been pulled.
