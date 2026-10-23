# Work the eleven follow-up issues the prior-bundle closing review filed

## Directive

The user, 261022: "ich möchte an der prior integration weiterarbeiten", and on being offered the choice, option 1: file a new work package for the eleven follow-up issues, claim it, and plan it.

The package `261008-1215-fusion-as-an-external-prior-module-bundle` closed `done`; its closing review (`261014-0830-reviewer-closing-pass-over-the-prior-module-bundle-package`) filed the issues that stand open in that package's issue store. This item works them. It is reached when each of those issues is closed, either fixed with a verification that passed or closed with a stated disposition the user accepted.

Correction, 261022: the record store lists twelve open issues there, not eleven; the count in the heading came from a miscount in chat. The scope is all twelve.

Mode, 261022, the user's words at the approval of plan `261022-1611-plan-prior-bundle-closing-review-follow-ups.md`: "Freígegeben, du kannst das im automode durchführen". Set as `mode` `autonomous` on that word; it was given at the plan approval rather than in the turn of the filing or the claim.

## Closure, 261022

Closed `done`, outcome `completed`, over commits `bad32587..59992f23` (19 commits). All twelve issues are closed; plan `261022-1611-plan-prior-bundle-closing-review-follow-ups.md` closed with its 17 steps done. Prior's answers to requests 72/73 (Prior `3c29dcf`) and 74 (Prior `b711b62`, 74(a) accepted) are recorded in `codec/fixtures/prior/REQUESTS.md`, so the plan's tag clause is met; re-pinning `d6fc9da0…` and Prior's replay against it wait for a later fusion request.

Closing review `261022-2142-reviewer-closing-review-of-the-prior-bundle-follow-ups.md`: verdict accept, `uncovered=0`, Not-opened none. It filed two Low issues in this container's issue store, left open for follow-up work beside the two filed during the steps (`261022-1712-…` catalog render test, `261022-1806-…` migrate run exit 9).

Stop conditions, not put to the user under `mode` `autonomous`; carried verbatim, none marked failing by the dispatcher, with the reviewer's mechanical results where it took one:
1. "The work is finished when each of the twelve issues in the table above stands `closed`, either fixed with its step's acceptance passed or closed with a disposition the user accepted." All twelve closed `fixed`.
2. "Also only if no byte of a frozen catalog asset moved: `cd catalog && shasum -a 256 -c schemas/FROZEN` passes at the last step's commit." Reviewer: exit 0.
3. "Also only if no growth-bound baseline or head-room constant changed: `git diff 11440a0a HEAD -- hooks/lib/__tests__/surface-growth-bound.test.ts hooks/lib/__tests__/rules-emission-golden.test.ts hooks/lib/__tests__/helpers/growth-bound.ts hooks/lib/__tests__/fixtures` prints nothing." Reviewer: only `surface-growth.golden` moved (regenerated with `UPDATE_SURFACE_GOLDEN=1`, which records movement); no baseline or head-room constant changed. Read literally the command does not print nothing, because the clause's path set includes the golden.
4. "Also only if `git status --porcelain -- codec/fixtures` shows nothing but `codec/fixtures/prior/REQUESTS.md` across the codec steps: no recorded exchange, seed or golden was re-recorded." Reviewer: only `prior/REQUESTS.md`, append-only.
5. "This package builds no bundle for delivery and hands none to Prior." None was built or handed over.
6. "A release tag on any commit holding step 4 waits for Prior's acceptance of request 74(a), recorded in `codec/fixtures/prior/REQUESTS.md`. This package does not tag, and its closure does not wait for that answer." Acceptance recorded at `59992f23`; no tag set.
7. "The `v13.1.0` tag and the bundle Prior accepted at answer 70 stay as they are." Unchanged.
8. "Step 16 runs only on the user's relay of Prior's answer to 72 and 73. Step 17 runs only after step 16 is recorded." Step 16 ran on the user's confirmation; step 17 after `a69220dc`.
