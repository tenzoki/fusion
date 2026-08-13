# Coder — step 8: regenerate the emission golden and price the Circle

**Status:** Complete
**Circle:** `circles/260813-0858-playmaker-maintains-backlog-store`
**Plan:** `planning/260813-1306_p_the-playmaker-maintains-the-backlog-store.md`, step 8
**Executor:** `fusion:coder`

## What changed

One file: `hooks/lib/__tests__/fixtures/rules-emission.golden`, regenerated from live
measurement. Nothing else. `RULE_BASELINE` was not moved, and
`hooks/lib/__tests__/rules-emission-golden.test.ts` carries no diff at all — this Circle is
growth, and the baseline moves only after a cleanup. Moving it would have silenced the
budget report by redefining the budget in the same edit that made the report fire louder.

## The two runs

```
cd hooks && UPDATE_RULES_GOLDEN=1 npx vitest run lib/__tests__/rules-emission-golden.test.ts
```

failed on purpose, as designed: 8 passed, 1 failed, the failing case being *was not run with
the update flag left switched on*. The second run without the flag is the real measurement,
and it is green (9/9, exit 0).

## The byte movement, measured rather than carried forward

Both figures were re-derived here from the regenerated golden and cross-checked against
`wc -c` on the two files. They agree with what steps 1 and 3 reported, which is the point of
the step: the number is now a measurement, not a claim copied forward.

| Rule file | Before | After | Delta | Agents receiving it |
|---|---|---|---|---|
| `rules/fusion-workbench-conventions.md` | 49 992 | 51 925 | +1 933 | all 16 |
| `rules/circle-records.md` | 11 228 | 11 958 | +730 | 3 (orchestrator, playmaker, shaper) |

Fleet cost of this Circle: `1 933 × 16 + 730 × 3` = **33 118 bytes** per full-fleet dispatch
round.

## The diff shows movement in those two files and nothing else

The diff is arithmetically closed, which is stronger evidence than reading it line by line:
35 insertions and 35 deletions, accounted for exactly as 16 agents × 2 lines (the
`fusion-workbench-conventions.md` size line plus that agent's `total`) = 32, plus 3
`circle-records.md` size lines. There is no line left over for a third file to have moved.
Read directly, the five untouched sizes hold at their previous values in every block:
`agent-setup.md` 3 513, `decision-record-examples.md` 4 291, `user-facing-output.md` 16 784,
`critical-stance.md` 9 958, `design-diagrams.md` 5 673, `workbench-stash-and-lock.md` 12 957.

## Per-agent totals, and why "two groups" is two deltas but five totals

The sixteen agents split **two ways by delta**, which is the split the emission rule predicts:
an agent receives `circle-records.md` or it does not.

- **+1 933 — 13 agents** that receive only the conventions file.
- **+2 663 — 3 agents** that receive both (`+1 933 +730`).

The *totals* do not collapse to two numbers, because `design-diagrams.md` and
`workbench-stash-and-lock.md` differentiate roles without themselves moving. Five roles, the
same five the budget report derives by measurement:

| Role | Agents | Before | After | Delta |
|---|---|---|---|---|
| core only | bugfixer, coder, coderev, consultant, editor, ontocoder, ontorev, reconciler (8) | 84 538 | 86 471 | +1 933 |
| + `design-diagrams.md` | analyst, conceptrev, investigator, planner, taskplanner (5) | 90 211 | 92 144 | +1 933 |
| + `circle-records.md` | playmaker | 95 766 | 98 429 | +2 663 |
| + `circle-records.md` + `design-diagrams.md` | shaper | 101 439 | 104 102 | +2 663 |
| + `circle-records.md` + `workbench-stash-and-lock.md` | orchestrator | 108 723 | 111 386 | +2 663 |

**The split matches the emission rule.** `bin/fusion-rules:216` sets `IS_CIRCLE_AGENT=1` for
exactly `orchestrator|playmaker|shaper`, and `:439` emits `circle-records.md` under that flag
alone. Those are precisely the three blocks in which the golden's `circle-records.md` line
moved. The budget report's role membership is independent corroboration rather than a second
reading of the same source: roles there are derived from measured emission, never from a
name list, and it printed the same three agents.

## The budget report fired, and is quoted in full in the step report

Expected, and correct. It has fired for every role since 2026-08-12, when
`protected-path-discipline.md` was removed and its oversized baseline entry stopped masking
9 402 bytes of real growth in the remaining core files. This Circle adds 1 933 to that
existing overage on every role and 730 more on three. Nobody's prose was cut to quiet it;
the report is information for the user about when a cleanup is due, and it fails nothing.

Two gates that could have fired and did not, both checked rather than assumed:

- **`DRIFT_CEILING` (145 144), the one number that still blocks.** The high-water mark is the
  orchestrator at 111 386, leaving 33 758 bytes of head-room.
- **The justification duty at `RELEASE_CAP` (105 354).** It measures role **floors**, not
  emitted totals, and the highest floor is the orchestrator's 82 206. No new justification is
  owed. Worth recording for whoever reads this next: the shaper's emitted total is now
  104 102, within 1 252 bytes of the release cap, so the next comparable growth in the shared
  core will carry a role's *emitted* total past a number that has historical meaning even
  though no assertion reads it that way.

## Verification

`cd hooks && npx vitest run` — exit 0, **1 019 tests across 49 files**, matching the expected
totals exactly. Before this Circle the suite stood at 1 014 across 48; the difference is step
7's new `playmaker-backlog-mandate-lint.test.ts`, one file carrying five cases, which
reconciles both counts (1 019 − 5 = 1 014, 49 − 1 = 48).

Not committed, per the dispatch. Step 9, the version bump, is a separate dispatch.
