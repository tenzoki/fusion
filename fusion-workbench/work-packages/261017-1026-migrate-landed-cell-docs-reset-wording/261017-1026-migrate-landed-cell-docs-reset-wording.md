# /fusion:migrate: the helper header and the README-hooks row still describe the landed-fence cell as chunks that landed "before the reset"

## Directive

Filed on the user's word of 2026-10-17 in chat. Offered the option "Das Doku-Issue als kleines Paket im Automode erledigen", the user answered "1". The work is the low issue `261017-0849-migrate-landed-cell-docs-in-the-helper-header-and-readme-hooks-still-presuppose-a-git-reset.md`, filed by the closing review of `261017-0819-help-13-1-7-credit-and-idlefence-comment`: the `bin/fusion-migrate` header and the `migrate.ts` row of `README-hooks.md` still say the rollback chunks landed "before the reset", where `landedFence` checks no reset. Fix direction and acceptance are the issue's. Docs only: no condition, message or exit code moves. Released as fusion 13.1.9, since the manifest is bumped on every change; this time the marketplace entry reads the new version before anything is pushed.

The user asked for this item to run in mode autonomous, in the answer quoted above.

## Closure

Closed `done` on 2026-10-17, outcome class `completed`, by the orchestrator in session `3bd9f8b5-e804-461f-868f-a0c46a94a8f9`, the finish answered by mode autonomous. Commit range `80bea460..` the closing commit; released as fusion 13.1.9, tag `v13.1.9` on `f95c0b28`, marketplace entry `4ffa2a3`, the cache clone pulled. Order as run: the marketplace entry was edited before any push, fusion `main` and the tag were pushed before the marketplace commit was pushed, and the cache pull came last. The low issue the package was filed for is resolved and closed as fixed (`f95c0b28`). The closing review `261017-1049-reviewer-closing-pass-over-the-migrate-landed-cell-docs-reset-wording-package.md` ran before the tag over `0dbce04b..f95c0b28`, verdict accept, Not-opened none. Left open: the low issue `261017-1049-migrate-landed-cell-docs-drop-the-stale-condition-so-an-interrupted-rollback-meets-their-premise.md`, filed by that review against the wording this release introduced.

Stop conditions of the plan, not put to the user under mode autonomous, carried verbatim and none marked as failing:

- `bin/fusion-migrate` differs from `b2436db4` only in comment lines of the `rollback --end-fence` entry, and contains no `before the reset`.
- The `migrate.ts` row of `README-hooks.md` `## Files` contains no `before the reset`, and no other line of `README-hooks.md` changed.
- In each of the two texts a reset is named only as one possible way into the landed cell, and the quiet-cell sentence before it is unchanged.
- Every exit code, condition and message string in `hooks/migrate.ts` and `bin/fusion-migrate` is unchanged, and `migrate.test.ts` passes with no edit to it.
- The issue carries a `Resolved:` line, and the full hook suite ran after that write with no red beyond the two pre-existing `workbench-citation-lint` findings.
- Every growth bound is green with the golden regenerated, and no baseline, `SKILL_BASELINE` entry or head-room constant was edited.
- `reference-resolution-lint`'s `BASELINE` reads 2061/371/11, unedited, and the lint passes.
- The help paragraph reads "Coming from 13.1.8 or earlier" and "13.1.2 to 13.1.9 need no migration", still says "13.1.2 to 13.1.7 each change only", and carries a 13.1.9 sentence saying it changes nothing that runs.
- Before anything is pushed, `plugin.json`, both pin examples and the marketplace working clone's `marketplace.json` read 13.1.9.
- Before the tag `v13.1.9` is created, a closing review of the range since `v13.1.8` is filed in this package's reviews store, and its verdict is accept or every finding it rates above Low is answered.
- The tag `v13.1.9` is on the pushed fusion `main` commit, and the fusion push happened before the marketplace push.
- After both pushes, the marketplace cache clone has been pulled.
