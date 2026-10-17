# /fusion:help credits 13.1.7 with a refusal 13.1.6 already had, and the idleFence comment still names a reset as the cell's cause

## Directive

Filed on the user's word of 2026-10-17 in chat. Offered the option "Beides als kleines Paket im Automode erledigen (13.1.8)", the user answered "1". The work is the low issue `261017-0000-help-13-1-7-note-credits-the-release-with-a-proposal-check-13-1-6-already-had.md`, filed by the closing review of `261016-2328-migrate-landed-fence-wording-and-unverified-proposal-branch`, plus that review's unfiled note: the `idleFence` doc comment in `hooks/migrate.ts` still says a rollback that landed chunks "then met a git reset", describing the cell by its usual cause where the code checks no reset. Fix direction and acceptance for the first are the issue's; for the second, the comment states what the code checks and names a reset only as one way into the cell. No behaviour changes: no condition, message or exit code in `hooks/migrate.ts` moves. Released as fusion 13.1.8.

The user asked for this item to run in mode autonomous, in the answer quoted above.

## Closure

Closed `done` on 2026-10-17, outcome class `completed`, by the orchestrator in session `3bd9f8b5-e804-461f-868f-a0c46a94a8f9`, the finish answered by mode autonomous. Commit range `059acf12..` the closing commit; released as fusion 13.1.8, tag `v13.1.8` on `0dbce04b`, marketplace entry `3d28b87`, the cache clone pulled. The low issue the package was filed for is resolved and closed as fixed (`0dbce04b`); the `idleFence` comment no longer names a reset as the cause. The closing review `261017-0849-reviewer-closing-pass-over-the-help-13-1-7-credit-and-idlefence-comment-package.md` ran before the tag over `ddab3bf1..0dbce04b`, verdict accept, Not-opened none. Order as run: `main` and the tag were pushed before the marketplace entry was edited and pushed, as at 13.1.7. Left open: the low issue `261017-0849-migrate-landed-cell-docs-in-the-helper-header-and-readme-hooks-still-presuppose-a-git-reset.md`, filed by that review.

Stop conditions of the plan, not put to the user under mode autonomous, carried verbatim and none marked as failing:

- `hooks/migrate.ts` differs from `c934c9ce` only inside the `idleFence` doc comment, and that comment contains neither `met a git reset` nor `then met`.
- `hooks/dist/migrate.js` is the build of the edited source, `committed-dist` is green, and both files sit in the same commit.
- Every exit code, condition and message string in `hooks/migrate.ts` is unchanged, and `migrate.test.ts` passes with no edit to it.
- The 13.1.7 sentence in `skills/help/SKILL.md` `### 4. Update` does not contain `cannot verify the file list`.
- The issue carries a `Resolved:` line, and the full hook suite ran after that write with no red beyond the two pre-existing `workbench-citation-lint` findings.
- Every growth bound is green with the golden regenerated, and no baseline, `SKILL_BASELINE` entry or head-room constant was edited.
- `reference-resolution-lint`'s `BASELINE` reads 2061/371/11, unedited, and the lint passes.
- The help paragraph reads "Coming from 13.1.7 or earlier" and "13.1.2 to 13.1.8 need no migration", and it carries a 13.1.8 sentence saying it changes nothing that runs.
- Before the tag `v13.1.8` is created, a closing review of the range since `v13.1.7` is filed in this package's reviews store, and its verdict is accept or every finding it rates above Low is answered.
- Before the push, `plugin.json`, both pin examples and `marketplace.json` read 13.1.8.
- The tag `v13.1.8` is on the pushed `main` commit, and the marketplace cache clone has been pulled.
