# Session: planning the fix for the five severe guard defects

**Date:** 2026-08-09 12:29
**Agent:** planner (executors parameter: `coder`)
**Status:** Complete

## What was asked

Produce an implementation plan for the five severe defects filed against the fusion compliance guard on 2026-08-09, verifiable against the green baseline at HEAD `451a07e`.

## What was done

**Baseline verified rather than assumed.** Ran `npm test` in `hooks/`: 33 test files, 1030 tests, all passing, 77.4 s. The brief cited 85 s; the difference is machine noise, and the counts match.

**Read as grounding:** both analyses (`260809-1103` enforcement layer, `260809-1101` support layer), all five open defect records, the two closed predecessor records `260804-1333` and `260804-1344` whose fix has to be carried across, the two rule files as the specification, and the relevant source in `hooks/lib/protected-snapshot.ts`, `hooks/tracker.ts`, `hooks/lib/git-branch-guard.ts` and the integration harness.

**Plan written:** `shared/planning/260809-1229_o_plan-five-severe-guard-defects.md`. Seven steps, all routed to `coder`.

## Three findings that changed the plan's shape

1. **The brief's premise about the analysis's Target 3 does not hold.** Target 3 (a snapshot consumed exactly once) names defect `260809-1108`, the blocked-call leftover and part of the parallel-call residual. It does not name `260809-1107` and cannot close it: a single-use snapshot changes when the measurement runs, never whose change it attributes. Defect 2 needed its own step.

2. **Half of `260809-1108`'s own suggested direction was rejected.** The age bound on the snapshot's `ts` field would turn a legitimate long tool call into a silent skip — the test suite itself holds the window open for 77 seconds. That is a fail-open introduced by a fix, in a plan whose binding constraint forbids opening behaviour.

3. **A new Critical defect was found and filed.** `260809-1104`'s suggested fix inspects the final path component. `restore` also writes through a symlinked **parent** directory, which `O_NOFOLLOW` cannot reach by definition. Filed as `shared/issues/260809-1231_o_…` and folded into Step 1, because shipping the final-component fix alone would let `rules/protected-path-discipline.md` re-earn a completeness claim it would not hold. Labelled `inference:` — read from the source, not reproduced through the hooks.

## Files written

- `fusion-workbench/shared/planning/260809-1229_o_plan-five-severe-guard-defects.md`
- `fusion-workbench/shared/issues/260809-1231_o_the-restore-writes-through-a-symlinked-parent-directory-which-the-final-component-check-does-not-cover.md`
- this history entry

## Open at the end of the session

Four questions in the plan's Open Questions section, of which one needs a user decision before Step 5 can be considered complete in spirit: whether the revert itself should narrow for the four write tools, or only the message. The plan takes the message-only form, because narrowing the revert would open behaviour.

Nothing was implemented. No code, data or rule file was modified.
