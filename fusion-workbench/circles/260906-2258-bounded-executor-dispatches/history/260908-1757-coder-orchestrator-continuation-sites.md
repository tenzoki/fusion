# Coder — Step 10: the orchestrator's five continuation sites

**Status:** Complete
**Agent:** coder
**Date:** 2026-09-08
**Source:** `260907-1450_*_plan-bounded-executor-dispatches.md` `### 10`

## What was done

Nine edits to `agents/orchestrator.md`, and to no other file. The plan's prescribed
wording was followed at each site; where it was shortened, the shortening is noted below.

**Step 3a item 5 (edits 1 and 2, folded into one sub-bullet).** A new first sub-bullet
above `**Read the `Verification:` line.**`, asking whether the return is a bounded one
before the switch is read at all, sending it to `### Bounded dispatches`, and stating that
the two tests are orthogonal rather than exclusive. Edit 2 folded in as a clause of the
same sentence: the `did not finish` case is included in what is not read, because it runs
validation and would route a healthy partial return toward a bugfixer. **The switch itself
is untouched** — "Four cases, and there is no fifth" and all four literal strings
`executor-verification-report-lint.test.ts` slices for stand exactly as they were.

**Step 3b step 2b (edit 3).** Appended after the bugfixer dispatch sentence: a bounded
return from the bugfixer does not run step 2d — no `git checkout HEAD -- <files>`, no
`bugfix_failure`, no `revert` — with the reason (read as a reported failure it reverts
every file the task touched) and the continuation point (inside 2b, before 2c is read).
This is the one exclusion whose omission would destroy work, and it is in the prompt
rather than only in `rules/bounded-dispatch.md`.

**Step 3b step 2e (edit 4).** Appended the stipulation defining an attempt, a retry and a
continuation. Written as a definition this work makes, not as a restatement.

**Step 3b step 7 (edit 5).** One clause at the end of the first paragraph: the
`work_queue` entry is not written at a bounded return, because the step writes it when a
task completes.

**Phase 3 step 1 (edit 6).** One clause: a bounded reconciler return is continued at step
1, before step 2 reads anything; on the stall, step 3's defensive case takes over and the
verdict reads `review-needed`.

**Phase 4 step 2a (edit 7).** One clause on the findings paragraph: a bounded reviewer
return is continued at 2a, before 2b; on the stall, closure proceeds and the gap goes into
the `## Closure note` like any uncovered range.

**The `curator` paragraph (edit 8).** One clause: continued at the same dispatch point
with the same mode, no approval taken or re-taken on the user's behalf, the survey gate not
put twice, and an `apply` continuation carrying the same approved ids minus those the run
file records as `applied`, `skipped`, `stale` or `failed`.

**`## Error Handling` (edit 9).** Appended to the Response cell of the "Validation fails
after agent work" row: a bounded return is not a reported failure and does not reach the
revert.

No number of minutes was written anywhere; the five sites' reasoning was not restated;
Setup Step 2 and the `### Bounded dispatches` block from Step 9 were not touched; no tenth
edit was made.

## Measurements

`wc -c agents/orchestrator.md`: 153 349 before, 155 302 after. **Delta 1 953 against a cap
of 2 190 — 237 under.**

Per edit, measured as the byte delta of the changed line (or the whole added line, for the
new sub-bullet):

| Edit | Site | Budget | Spent | |
|---|---|---|---|---|
| 1+2 | Step 3a item 5 guard | 550 | 576 | over by 26 |
| 3 | Step 3b step 2b exclusion | 400 | 383 | under by 17 |
| 4 | Step 3b step 2e attempt clause | 250 | 210 | under by 40 |
| 5 | Step 3b step 7 `work_queue` clause | 160 | 107 | under by 53 |
| 6 | Phase 3 step 1 clause | 220 | 154 | under by 66 |
| 7 | Phase 4 step 2a clause | 220 | 146 | under by 74 |
| 8 | `curator` paragraph clause | 250 | 303 | over by 53 |
| 9 | Error-handling table row | 140 | 74 | under by 66 |
| **Sum** | | **2 190** | **1 953** | **237 under** |

Two items came in over their own budget while the step came in 237 under its cap. Both
carry the plan's prescribed content in full: edit 1+2 keeps the orthogonality sentence,
edit 8 keeps all four run-file states. Trimming either would have cost prescribed wording
to satisfy a per-item figure the step total already absorbs.

**`agents/` surface head-room after this step: 698 bytes.** Sum of `wc -c agents/*.md` is
417 145; less `AGENT_BASELINE` 399 843 gives 17 302 used against the 18 000 head-room.
Step 8 recorded 4 244; Step 9 spent 1 600 and this step 1 953.

## The fixture that moved

`hooks/lib/__tests__/fixtures/surface-growth.golden` was regenerated with the command its
own header carries (`UPDATE_SURFACE_GOLDEN=1 npx vitest run
lib/__tests__/surface-growth-bound.test.ts`). Its diff is exactly two lines,
`orchestrator.md 153349 → 155302` and `total 415192 → 417145`, and nothing else.

`reference-resolution-lint.test.ts` did **not** move and needed no re-approval: the new
text names one section heading (`### Bounded dispatches`) and no file path.

`AGENT_BASELINE`, `RULE_BASELINE`, `RELEASE_CAP` and `DRIFT_CEILING` show no diff.

## Verification

| Command | Result |
|---|---|
| `wc -c agents/orchestrator.md` (before / after) | 153 349 / 155 302, delta 1 953, at or under 2 190 |
| `cd hooks && npm test` | exit 0, 53 files / 924 tests passed |
| `npx vitest run lib/__tests__/executor-verification-report-lint.test.ts lib/__tests__/surface-growth-bound.test.ts` | exit 0, 25 tests passed |
| `grep -cE '\b20 minutes\b' agents/orchestrator.md` | 0 |
| `cat agents/*.md \| wc -c` | 417 145, head-room 698 |

The first `npm test` run failed on one assertion only — the golden-fixture comparison in
`surface-growth-bound.test.ts`, which the plan anticipated. The bound itself passed on that
run; after the regeneration the whole suite is green. None of the three intermittently
failing harness tests (`staging-drift`, `fusion-commit-lock`, `guard-state-shape`) failed
in either run.

## Acceptance criterion

Met. All five sites in the specification's C3 table carry a clause — Step 3a item 5,
Step 3b step 2b, Phase 3 step 1, Phase 4 step 2a, and the `curator` paragraph — and the
site whose omission would destroy work, Step 3b step 2d, carries its exclusion in the
prompt at step 2b and not only in the rule file. Two sites beyond the five (Step 3b step 2e
and step 7) and the error-handling summary row also carry theirs.
