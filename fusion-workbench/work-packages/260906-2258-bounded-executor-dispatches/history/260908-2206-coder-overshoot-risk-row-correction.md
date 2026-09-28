# Coder — the overshoot risk row, corrected on both of its faults

**Status:** Complete
**Date:** 2026-09-08
**Agent:** coder
**Circle:** 260906-2258-bounded-executor-dispatches

## What this was

One line, one file: line 636 of
`260907-1450_*_plan-bounded-executor-dispatches.md`, the `## Risks & Mitigations` row
about the overshoot past a stopping time. It is the fifth site of the text correction a
previous pass reported and did not touch, its dispatch having named four
(`260908-2003-coder-four-passage-text-correction.md`). The authority is the user's ruling
on `260908-2051_*_is-a-completed-plan-amended-when-one-of-its-verification-lines-turns-out-unreachable.md`,
option 1: a completed plan's closed marker does not exempt its text from correction.

## The two faults, which are different

**The risk column repeated the minute illustration.** It named a unit length and two clock
minutes, which is exactly what the same plan's Step 5 forbids in the file that step writes,
and what the corrected Step 5 now states without numerals at line 218. The row is brought
into line with that correction: it states the residual in the same shape Step 5 does, so it
scales with whatever `orchestrator.dispatchMinutes` is configured to instead of asserting a
number no measurement in this tree supports.

**The mitigation column made a false claim about a shipped file.** It asserted that
`rules/bounded-dispatch.md` `## When you read the clock` "states the example rather than
softening it". That section states no example. It states the residual without numerals,
deliberately, because Step 5's acceptance criterion forbids a number of minutes in the file
and the executor honoured it (the Step 5 `[DONE]` note at line 208 says so in as many
words). The column now says what the file actually does and keeps the substance it was
carrying: the residual is accepted and stated plainly, not softened.

## Before

```
| **The overshoot past the stopping time is unbounded and unmeasured.** The clock is read between units, never inside one, so an agent entering a 30-minute unit at minute 19 returns at minute 49 | Accepted. No figure in this tree says how long a unit runs. `rules/bounded-dispatch.md` `## When you read the clock` states the example rather than softening it |
```

## After

```
| **The overshoot past the stopping time is unbounded and unmeasured.** The clock is read between units, never inside one, so an agent that reads it just short of its stopping time and then enters a unit longer than its whole bound returns well past that time | Accepted. No figure in this tree says how long a unit runs. `rules/bounded-dispatch.md` `## When you read the clock` states that residual without numerals, which is what Step 5's acceptance criterion requires, and states it plainly rather than softening it |
```

## Verification

1. `grep -n 'minute 19\|minute 49\|30-minute'` over the plan — exit 0, two hits, both of
   which report the contradiction rather than asserting the illustration. Line 208 is the
   Step 5 `[DONE]` note, which states that the illustration was **not** written and that the
   residual is stated without numerals instead. Line 709 is the reconciliation log, which
   lists Step 5's illustration as one of three passages the tree contradicts, filed as
   `260908-1619_*_plan-step-5-prescribes-a-minute-illustration-its-own-acceptance-criterion-forbids.md`.
   Neither is a further instance of the fault; each is a record of it.
2. `grep -n 'states the example'` over the plan — exit 1, no output.
3. `bin/fusion-citation-sweep --dry-run` — exit 0,
   `files=0 rewrites=0 residual=3087 record=0 circle-record=0 circle-dir=0 bare-record=0
   stamp-bare=0 mode=dry-run`. The plan appears in no residual row (`grep -c` of its
   basename over the run output returns 0). **It took two runs, and the first one caught
   this history file rather than the plan**: the run made after the log was first written
   read `files=1 rewrites=1 bare-record=1`, naming this file, because the sentence above
   cited the plan with its marker letter spelled out. Rewritten to the wildcard form, the
   next run read `rewrites=0` again. The residual figure of 3087 is unchanged across all
   three runs and belongs to the archived stores, not to this Circle.
4. `cd hooks && npm test` — exit 0, 55 test files and 947 tests passed, with
   `workbench-citation-lint.test.ts` (13 tests) and `plan-stopping-section-lint.test.ts`
   (11 tests) both green. The three intermittently failing harness-spawning tests filed as
   `260908-1719_*_three-harness-spawning-tests-fail-intermittently-so-the-suite-cannot-answer-the-circles-green-clause.md`
   passed on this run and needed no isolated re-run.

## Scope kept

No other row, no other line, no `[DONE]` marker, no `**Status:** Complete` line, no
filename or marker changed. No reconciliation-log entry added — that log is the
reconciler's. The specification was not touched; its copy of this residual was corrected by
the previous pass.

## Acceptance

The row states the residual without numerals and says what the rule file actually does. The
acceptance test of
`260908-1619_*_plan-step-5-prescribes-a-minute-illustration-its-own-acceptance-criterion-forbids.md`
is now satisfiable over this file: the only remaining minute literals in it are the two
records of the contradiction named above.
