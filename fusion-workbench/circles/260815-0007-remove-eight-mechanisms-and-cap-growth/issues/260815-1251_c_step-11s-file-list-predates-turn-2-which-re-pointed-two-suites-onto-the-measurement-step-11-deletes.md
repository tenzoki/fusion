# Step 11's file list predates Turn 2, which re-pointed two suites onto the measurement step 11 deletes

---

Step 11 of `planning/260815-0029_o_plan-remove-eight-mechanisms-and-cap-growth.md` deletes
`hooks/lib/state-drift.ts`, the tracker's state-drift call and `bin/monitor`'s `state_drift`
branch. Its file list was written on 2026-08-15 at planning time and corrected once at 08:47
(`d1ae1c0`). Between that correction and now, `a69d56e` re-pointed **two** test surfaces onto
exactly the measurement step 11 removes, and neither is in step 11's list. Following the step as
written lands a red commit, which the orchestrator's Step 3b reverts whole.

---

**Severity:** Medium — step 11 lands red as written, and the orchestrator's Step 3b reverts the whole task on red.
**Domain:** code
**Filed by:** `coderev`, reviewing `7c12d6a..5d29b6d` (`reviews/260815-1251-coderev-turn-2-build-churn-and-stash.md`)
**Owner:** `planner` for the plan edit; `coder` at step 11 for the test work it names
**Affects:** `circles/260815-0007-remove-eight-mechanisms-and-cap-growth/planning/260815-0029_o_plan-remove-eight-mechanisms-and-cap-growth.md:285-299`; `hooks/lib/__tests__/guard-state-shape.test.ts`; `hooks/lib/__tests__/monitor-warnings-panel.test.ts:730`; `hooks/lib/__tests__/hook-fail-open.test.ts:184-215`, `:325-374`
**Cross-references:** `issues/260815-0804_o_the-plan-still-carries-the-false-premise-step-2-disproved-and-steps-4-and-11-will-ship-red-on-it.md` — the same step, the other direction

**Verified 2026-08-15 at HEAD `5d29b6d`.** Suite green at that commit: 45 files, 830 tests.

## The two omissions

**1. `hooks/lib/__tests__/guard-state-shape.test.ts` — nine tests, all of them.**

`a69d56e` moved this file's fixture from `churn.json` to `state-drift.json` and its probe from the
churn load to the state-drift sentence. Its own header calls this "the second re-pointing" and
argues that `state-drift.json` "is the right successor rather than the nearest one … the throttle
record `measureStateDriftForModel` reads on EVERY guarded tool call".

- `guard-state-shape.test.ts:83` — `const THROTTLE_FILE = "fusion-workbench/.guard-state/state-drift.json";`
- `:112-119` — `withDrift()` seeds that file and calls `freezeCommitCount`
- `:131-133` — `expectTheDriftSentence()` asserts `DRIFT_SENTENCE_MARKERS` in the tracker's reply
- every one of the nine cases runs `ordinaryEdit()`, one `Edit` on `notes.txt`

After step 11, `measureStateDriftForModel` does not exist. `measureReviewCoverageForModel` returns
early because the payload is not a `.md` file under a `reviews/` store; `measureStagingDriftForModel`
returns early because HEAD has not moved. So `ordinaryEdit()` returns `""`, all six malformed rows
fail, the repair case fails, and the carried-forward case fails. The seeded `state-drift.json` is a
file nothing reads.

Step 11's file list reads
`hooks/lib/__tests__/{hook-fail-open,staging-drift,review-coverage,helpers/guard-harness}.ts`.
`guard-state-shape` appears in the plan **only** in step 4's list (plan line 190), which has landed.

**2. `hooks/lib/__tests__/monitor-warnings-panel.test.ts:730`.**

```
expect(level("state_drift")).toEqual({ levelClass: "warning", levelLabel: "Stale state" });
```

Step 11 removes `DRIFT_EVENT_TYPES` and the `state_drift` level branch from `bin/monitor`
(the step names lines 133 and 562). The test file is named in steps 2, 4 and 12 and not in step 11.

## The consequence step 11 does not name, and it is larger than the two file names

**After step 11 no tracker measurement fires on an ordinary write at an unremarkable path.** The
three surviving triggers are, from `hooks/tracker.ts`: every guarded call (state-drift, deleted
here), a review file landing, and HEAD having moved. Removing the first leaves none that an
ordinary `Edit` on `notes.txt` reaches.

That is what `hook-fail-open.test.ts`'s two tracker cases rest on, and `hook-fail-open.test.ts`
**is** in step 11's list — but the plan describes the step's test work as editing, and these two
cases lose their subject rather than their wording:

- `:184-215` "tracker replies with a valid envelope, exits 0, and still says why on stderr" — added
  by `a69d56e` with a comment stating in full why it now needs a drifted project.
- `:325-374` "delivers the tracker's report with its throttle record unwritable (260809-2045)" —
  re-pointed by `a69d56e` from `churn.json` onto `state-drift.json`.

Both exist to hold the property of `shared/issues/260809-2045`: a report may not withdraw a verdict.
`inference:` a replacement probe is available — `measureStagingDriftForModel` writes
`staging-drift.json` on the first sighting of a HEAD (`tracker.ts`, the `if (!moved)` arm) — but it
fires once per project rather than on every call, so it is a different construction, not an edit.
I did not build it, so this is reasoning rather than a checked claim.

Step 11's text is careful about what stops being measured: it enumerates state-drift rows 3, 4 and
5 and says plainly that after the step nothing notices a frozen Circle Turn log. It says nothing
about the tracker losing its only every-call measurement, which is what these three test files were
re-pointed onto seventeen hours earlier.

## Why this was not the step-4 executor's to see

`a69d56e`'s own message names the re-pointings and argues each one. The gap is between two steps
six apart: step 4 re-pointed the suites correctly for the tree it left, and step 11's file list
describes a tree that no longer exists. This is the same shape as
`260815-0804_o_the-plan-still-carries-the-false-premise-step-2-disproved-…`, arriving from the
other direction — there a landed step falsified an instruction, here a landed step falsified a
file list.

## What it would take

Three edits to step 11, all in the plan:

1. Add `hooks/lib/__tests__/guard-state-shape.test.ts` and
   `hooks/lib/__tests__/monitor-warnings-panel.test.ts` to the file list.
2. State that `guard-state-shape.test.ts` needs a **third** re-pointing or a deletion, and decide
   which. Its subject — a shape-valid state file swallowing the tracker's reply — survives the
   Circle; its only remaining trigger does not. The file's own header carries the criterion for
   choosing a successor and should be read before the choice is made.
3. State the same for `hook-fail-open.test.ts`'s two tracker cases, which are in the list but are
   described as edits.

## Related

- `planning/260815-0029_o_plan-remove-eight-mechanisms-and-cap-growth.md` step 11 (line 285-299),
  step 4 (line 188-204)
- `history/260815-1206-coder-step4-churn-removal.md` — the run that re-pointed them
- `260815-0804_o_the-plan-still-carries-the-false-premise-step-2-disproved-and-steps-4-and-11-will-ship-red-on-it.md`
- `shared/issues/260809-2045_c_the-churn-half-still-runs-before-the-reply-…` — the property the
  two `hook-fail-open` cases hold

---
Resolved: step 11's file list now names `guard-state-shape.test.ts` and `monitor-warnings-panel.test.ts` with the work each needs, and its prose carries a new paragraph on what the old enumeration missed: after the step no tracker measurement fires on an ordinary write, so the two tracker cases in `hook-fail-open.test.ts` lose their trigger rather than their wording and are not edits.
