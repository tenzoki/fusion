# Coder — Step 14: a lint against the dispatch bound returning to the prose

**Status:** Complete
**Agent:** coder
**Date:** 2026-09-08
**Checkout:** 5e8248d7
**Filed by:** Kai Stalmann <ks@qantr.com>
**Source:** `260907-1450_*_plan-bounded-executor-dispatches.md` `### 14`

## What was done

One new file, `hooks/lib/__tests__/dispatch-bound-lint.test.ts`, and no edit to any shipped
prompt, rule, helper or implementation file. It is the sibling of
`turn-budget-lint.test.ts` over the other value `bin/fusion-turn-budget` resolves, and it
is modelled on that file's structure: a `read` helper against `pluginRoot`, a `REMEDY`
string appended to every failure, a table of literal patterns with a `why` per entry, and a
final describe block that measures the detector on sentences rather than trusting an empty
result.

Seven cases, in three groups.

**The two prompt scans.** `agents/orchestrator.md` and `skills/setup/SKILL.md` must state
no dispatch-bound literal. Two patterns: `\b\d+\s*minutes?\b` on a line that also names
`Stop by`, `stopping time`, `dispatch_minutes` or `dispatchMinutes`; and
a second one matching either key name assigned a number. The optional quote or backtick
accepted before the separator is the one departure from the pattern the plan spells, and it is why
`"dispatchMinutes": 20` is reached at all.

**Anti-vacuity.** The orchestrator prompt must still contain `<dispatch-minutes>`, so
deleting the subject is not a route to green.

**The coupling case.** The `[ -x ]` guard on the helper call is asserted by the sibling and
is deliberately not re-asserted as a second copy: one helper prints both values out of one
guarded block. What that case cannot see is whether the block's second line is read at all,
so this file adds the assertion the sibling lacks — the prompt must name `dispatch_minutes`
— and names the guard beside it rather than owning it.

## The residual, pinned as an absence

`BOUND_CONTEXT` is the four names the plan specified. The prompt's own prose heading for
the value, "**The dispatch bound.**", is **not** among them, so a minute figure written on
such a line passes this gate. That was found by writing
`The dispatch bound is 35 minutes unless the project says otherwise.` into the
must-fire list and watching it not fire.

Rather than widen the pattern past the step's specification, the miss is asserted as an
absence in its own case, with a failure message that says widening is very likely an
improvement and that the case should be deleted when someone takes it. It is the phrase a
figure would most plausibly land beside, so it is a real gap and not a theoretical one.
**This is a finding for whoever revises the plan, not a defect in the file as specified.**

## Verification

| Command | Exit |
|---|---|
| `cd hooks && npm test -- dispatch-bound` | 0 |
| the same, against a scratch copy carrying `Compute a stopping time of 20 minutes from now.` | 1 |
| the same, against a scratch copy with `<dispatch-minutes>` replaced by `THE_BOUND` | 1 |
| `cd hooks && npm test` | 0, 55 files, 947 tests |

Both firing proofs ran against an `rsync` copy of the tree under the session scratchpad,
with `hooks/node_modules` symlinked; the copy was green before each mutation and was
deleted after. The live `agents/orchestrator.md` was never edited.

The full suite passed on the first attempt with all three harness-spawning tests
(`staging-drift`, `fusion-commit-lock`, `guard-state-shape`) green, so
`260908-1719_*_three-harness-spawning-tests-fail-intermittently-so-the-suite-cannot-answer-the-circles-green-clause.md`
did not have to be invoked.

## Fixture

`hooks/lib/__tests__/fixtures/surface-growth.golden` moved, as adding a test file requires:
one added line, `dispatch-bound-lint.test.ts 246`, and the block total from 22 287 to
22 533. Regenerated with the documented command
(`UPDATE_SURFACE_GOLDEN=1 npx vitest run lib/__tests__/surface-growth-bound.test.ts`) and
the diff read before the re-run. `AGENT_BASELINE`, `RULE_BASELINE`, `SKILL_BASELINE`,
`TEST_LINE_BASELINE`, `RELEASE_CAP` and `DRIFT_CEILING` show no diff; the test-line surface
stays well inside its 2 500-line head room.
