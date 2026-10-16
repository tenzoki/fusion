# Closing review: migrate, the landed-fence wording and the unverified-proposal branch (13.1.7, before the tag)

**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Reviewed-range:** `74992939..ddab3bf1`
**Not-opened:** none
**Domain:** code
**Work-item:** 261016-2328-migrate-landed-fence-wording-and-unverified-proposal-branch
**Cross-references:** `261016-2331-plan-migrate-landed-fence-wording-and-unverified-proposal-branch.md`, `261016-2123-migrate-landed-fence-message-asserts-a-git-reset-it-never-checked.md`, `261016-2123-migrate-proposal-unverified-branch-of-the-hand-deletion-is-untested-and-undocumented.md`, `261016-2123-reviewer-closing-pass-over-the-migrate-rollback-cut-then-reset-package.md`, `261016-1958-is-a-rollback-fence-ended-when-the-rollback-landed-chunks-and-a-git-reset-then-took-the-tree-back-to-markdown.md`, `261017-0000-help-13-1-7-note-credits-the-release-with-a-proposal-check-13-1-6-already-had.md`

## Summary

Verdict: **accept**. Nothing blocks the tag. The guard is unchanged from 13.1.6. The helper names the hand deletion of `.json-state/maintenance.json` only when the proposal verifies at its hash and no control path stands. It removes nothing, and the fence stays byte-identical in every probe. The new message claims only what the code checked, on the reset tree and on a tree made stale by hand. `hooks/dist/migrate.js` is the compile of the source.

One Low finding. The help topic's 13.1.7 note presents the unverified-proposal refusal as new, although 13.1.6 already had it.

## Totals

| Severity | Count | Findings |
|---|---|---|
| Critical | 0 | |
| High | 0 | |
| Medium | 0 | |
| Low | 1 | L1 |

## Scope

The range holds six commits. Two carry code: `b1076e73` (plan steps 1 to 3) and `ddab3bf1` (step 5 release surfaces, step 4 `Resolved:` lines). `befab73f`, `553d31d4`, `4055be29` and `31d86627` are workbench records; I read the package narrative, the plan and both resolved issues among them. Every file in `git diff --stat 74992939..ddab3bf1` was opened. Step 6, the marketplace entry, is outside this repository and still reads `13.1.6` in `marketplace.json`; the plan schedules it after this review and before the push.

## What was verified

**Guard unchanged.** Read from `git diff 74992939..ddab3bf1 -- hooks/migrate.ts`:
- `ownFence`, `idleFence`, `stale`, `intentStands` and the body of `landedFence` have no change. Only `landedFence`'s doc comment moved.
- `landedWay`: only `head` changed, from "no command of this helper ends that fence, and nothing was written or lost" to "no command of this helper ends that fence". The hash check (`sha(raw) !== s.proposal.sha256`), the `lstat` safe direction and the three branch texts are byte-identical.
- `preconditions` and `endLeftFence` now bind `stale(...)` to `shows` and test `shows !== null`. The old code tested `sib !== null && stale(...) !== null` and `i.state === "legacy" && stale(...) !== null`. Both are the same predicate.
- `current` and `setAside` pass the `shows` they already held. In `current`'s landed branch the first sentence drops `: ${shows}`, so the finding appears once.
- No exit code changed.

**Dist.** In a scratch clone at `ddab3bf1`, with the live `package-lock.json` copied in and `npm ci`, `npm run build` left `git status` clean. The committed `hooks/dist/migrate.js` is the build output.

**Tests.** In the same clone:
- `npm test -- lib/__tests__/migrate.test.ts lib/__tests__/committed-dist.test.ts lib/__tests__/surface-growth-bound.test.ts lib/__tests__/store-name-migration.test.ts`: 4 files, 67 tests passed.
- Full `npm test`: 1182 passed, 14 skipped, 1 failed. The one failure is `workbench-citation-lint` with exactly the two known findings, in the two `261010-1045-*` issue files. No environment-dependent failure appeared, because the lock was present.
- The two host cases of the diff only gained lines. Every assertion they had at `74992939` stands.

**Scratch probes.** A second clone at `ddab3bf1` (absolute `cd`, `pwd` checked) had its two host cases instrumented to log every `fusion-migrate` call and extended with extra probes. No probe ran in the live repo.
- Stale by hand (rollback cut at chunk 2, no commit, no reset, plan index deleted): `rollback`, `resume`, `run`, `rollback --end-fence` and `set-aside --consent` each exit 5. None contains "the tree was reset", "plan index is gone" or "nothing was written or lost". Each names "24 of the 41 control paths … stand, so the fence must stay" and no deletion. The fence is byte-identical and the session directory stays after each call.
- Reset tree, K=0, proposal verified: all five commands, and `run` under the 13.1.4 aside `--session`, name the hand deletion with its three conditions. The fence is byte-identical.
- Reset tree, K=1: no deletion named.
- Reset tree, proposal at other bytes, and proposal deleted (an extra probe beyond row B): `set-aside`, `rollback`, `resume`, `run` and `rollback --end-fence` each exit 5 with "the proposal … is missing or at other bytes … no hand deletion is named". The fence is byte-identical.
- After restoring the proposal, the deletion is named again. The test's own `rmSync(join(wb, FENCE))` afterwards would throw if the helper had removed the fence.

The new situation sentence, as observed on the reset tree:

> a rollback of this record landed rollback chunk 2, and the fence … it began stands over a tree that reads as legacy Markdown, where neither the plan index archive/migrations/migration-20261016-v12/plan.json nor rollback chunk 0's answer is in the tree (a git reset after that rollback is one way here); no command of this helper ends that fence. Deleting `.json-state/maintenance.json` by hand ends it once …

Each factual clause maps to a check: the landed chunks to `ownFence`'s `landed`, the fence to `begin_id`, "legacy Markdown" to `i.state`, and the "where" clause to `stale`. The reset appears only as a possible cause. The tree made stale by hand gets the same sentence, which is accurate there.

**Docs.** `bin/fusion-migrate` header `rollback --end-fence`, the `migrate.ts` row of `README-hooks.md` `## Files` and `docs/upgrading-to-v13.md` `**Undo.**` each gained the clause on the missing proposal or one at other bytes, matching the probes. The `**Undo.**` edit also rewords "before git reset the tree" to "the tree then reads as legacy Markdown (a git reset is one way there)". That goes past step 3's "No other wording changes", but it follows the fix's own direction and is not a defect.

**Plan `## Where this work stops`.**
- Row A, row B and their paired positive: hold, as tested and probed.
- The reset case keeps its assertions: holds.
- Guard functions unchanged and exit codes unchanged: hold.
- Three doc clauses: hold.
- `skills/migrate/SKILL.md` is 28997 bytes: holds.
- Growth bounds are green and the golden was regenerated: `help/SKILL.md` 16203 to 16353, `migrate.test.ts` 488 to 503 (15 lines, within the 16 + 4 the plan allows). No baseline or head-room constant changed.
- `reference-resolution-lint` `BASELINE` 2061/371/11: unedited, and the lint passed in the full run.
- Dist is the compile and sits in the same commit as the source (`b1076e73`): holds.
- Both issues carry a `Resolved:` line in anchor form with no commit hash, and the suite shows no third citation finding: holds.
- `plugin.json`, both pin examples and the help paragraph read 13.1.7, "Coming from 13.1.6 or earlier" and "13.1.2 to 13.1.7": hold.
- `marketplace.json` reads 13.1.7: **not yet**. That is step 6, still `open` in the plan record, and due before the push.
- The closing review is filed: this file.

## Findings

### L1 (Low): the help topic's 13.1.7 note credits the release with the proposal check 13.1.6 already shipped

`skills/help/SKILL.md` `### 4. Update`: "13.1.7: the message for an undo that landed part of its work states only what it checked, and names no deletion while it cannot verify the file list." The second half reads as new behaviour. The `catch` branch of `landedWay` that refuses to name the deletion is unchanged from 13.1.6. 13.1.7 only tested and documented it. A 13.1.6 user may infer that 13.1.6 was unsafe there, and it was not.

Scope: the help topic only, with no code effect. Fix: credit 13.1.7 with the wording alone, or say the refusal is now documented. Filed as `261017-0000-help-13-1-7-note-credits-the-release-with-a-proposal-check-13-1-6-already-had.md`.

## Cross-cutting observations

- The `idleFence` doc comment in `hooks/migrate.ts` still says "A rollback that landed chunks and then met a git reset fails it too, and `landedFence` names that cell". It is internal and reaches no user, and the plan did not include it. It is the last place the code describes the cell by its usual cause, kept here as a note only.
- Row B covers "other bytes" only. A deleted proposal goes through the same `catch` and behaved the same in my probe, so no test is owed.

## Recommended sequencing

- Release blocker: none. Run step 6 (marketplace 13.1.7) before the push, as planned.
- Cleanup: L1, at the next help edit or in this release before the tag. Its acceptance asks for no code change.
