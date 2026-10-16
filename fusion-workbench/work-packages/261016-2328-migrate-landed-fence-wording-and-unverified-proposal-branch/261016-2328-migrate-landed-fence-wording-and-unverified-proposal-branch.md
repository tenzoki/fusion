# /fusion:migrate: the landed-fence message asserts an unchecked reset, and the unverified-proposal branch is untested

## Directive

Filed on the user's word of 2026-10-16 in chat: "Paket für die beiden Low-Issues anlegen und planen, übernehmen und durchführen, alles im automode". The work is the fix of the two low issues the closing review of `261016-1951-migrate-rollback-cut-then-reset-circular-refusals` filed: `261016-2123-migrate-landed-fence-message-asserts-a-git-reset-it-never-checked.md` (the situation sentence says the tree was reset to Markdown and nothing was written or lost, which `landedFence` never checks; on a tree made stale by hand it is false, while the safety outcome stays right) and `261016-2123-migrate-proposal-unverified-branch-of-the-hand-deletion-is-untested-and-undocumented.md` (the branch that names no deletion when the proposal is missing or at other bytes has no test and no doc line). Fix direction and acceptance are the issues'. No fence may be removed by the helper, and the hand deletion stays named only when the proposal verifies and no control path stands.

The user asked for this item to run in mode autonomous, in the sentence quoted above.

## Closure

Closed `done` on 2026-10-17, outcome class `completed`, by the orchestrator in session `3bd9f8b5-e804-461f-868f-a0c46a94a8f9`, the finish answered by mode autonomous. Commit range `31d86627..` the closing commit; released as fusion 13.1.7, tag `v13.1.7` on `ddab3bf1`, marketplace entry `3060def`. Both issues the package was filed for are resolved and closed as fixed (`b1076e73`, `ddab3bf1`). Beyond the plan, the v13 `**Undo.**` note was reworded so it no longer states the reset as fact; the closing review judged that within the fix. The closing review `261017-0000-reviewer-closing-pass-over-the-migrate-landed-fence-wording-package.md` ran before the tag over `74992939..ddab3bf1`, verdict accept, Not-opened none; the commits after it are workbench records only. Left open: the low issue `261017-0000-help-13-1-7-note-credits-the-release-with-a-proposal-check-13-1-6-already-had.md`, and the reviewer's unfiled note that the `idleFence` doc comment in `hooks/migrate.ts` still says "then met a git reset".

Stop conditions of the plan, not put to the user under mode autonomous, carried verbatim and none marked as failing:

- Any assertion of step 1's rows A or B does not hold as written: the work stops after step 1, with the observation reported, and steps 2 to 6 are not done.
- On the stale tree made by hand (row A), `set-aside --consent` exits 5. Its stderr names rollback chunk 2, matches neither `the tree was reset` nor `so its plan index is gone`, does not contain `nothing was written or lost`, and does not name the hand deletion. `maintenance.json` is byte-identical.
- Row B: with one byte appended to the proposal, `set-aside --consent` exits 5 and names "the proposal … is missing or at other bytes", not the hand deletion, with `FENCE` byte-identical. With the byte removed, it names the hand deletion again.
- The case "cell A reset with git and cell C with a fence of another id" passes, with every assertion it had at `4055be29` unchanged.
- `ownFence`, `idleFence`, `stale`, `landedFence`'s body and the conditions of `landedWay` are unchanged in `hooks/migrate.ts`. Every exit code in the migrate tests is unchanged.
- `bin/fusion-migrate`'s header, the `migrate.ts` row of `README-hooks.md` and `docs/upgrading-to-v13.md` `**Undo.**` each carry one clause saying that no deletion is named when the proposal is missing or at other bytes.
- `wc -c skills/migrate/SKILL.md` prints 28997. Every growth bound is green, and no baseline or head-room constant was edited.
- `reference-resolution-lint`'s `BASELINE` reads 2061/371/11, unedited, and the lint passes.
- `hooks/dist/migrate.js` is the compile of `hooks/migrate.ts` as edited, staged in the same commit.
- Both issues carry a `Resolved:` line, and the full hook suite ran after those writes with no red beyond the two pre-existing `workbench-citation-lint` findings.
- Before the tag `v13.1.7` is created, a closing review of the range since `v13.1.6` is filed in this package's reviews store. Its verdict is accept, or every finding it rates above Low is answered.
- Before the push, `plugin.json`, both pin examples and `marketplace.json` read 13.1.7, and the help topic's first paragraph reads "Coming from 13.1.6 or earlier" and "13.1.2 to 13.1.7 need no migration".
