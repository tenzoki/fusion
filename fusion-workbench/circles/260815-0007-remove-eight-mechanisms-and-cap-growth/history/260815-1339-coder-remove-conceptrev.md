# Step 7 — remove `conceptrev`, the design-diagram evaluator

**Date:** 2026-08-15
**Agent:** coder
**Status:** Complete
**Plan:** `circles/260815-0007-remove-eight-mechanisms-and-cap-growth/planning/260815-0029_*_plan-remove-eight-mechanisms-and-cap-growth.md` step 7
**HEAD at start:** `6350854`
**Verification:** `cd hooks && npm test` — exit 0, 45 files, 828 tests (830 before; two tests left with their subject)

## What was removed

`agents/conceptrev.md` is gone, and with it the two advisory dispatches at the spec and plan
gates, the two event types, the agent's `tools:` and routing-table registrations, its
`bin/fusion-rules` flag memberships, and its block in the emission golden. The gates
themselves stay; only the wait for a verdict goes.

The measurement behind the removal, from the Circle record: 29 runs in the largest consuming
project returned 18 clean and 11 acceptable, 7 runs in the control project returned acceptable
every time. Across 36 measured runs in two projects the verdict was never adverse, while a
human gate waited on each one.

## What survives, deliberately

**`rules/design-diagrams.md`.** The rule outlives the evaluator, as the plan says it must: the
diagram-type table, the authoring rules and the coherence self-check are guidance to the
producer and were guidance before an evaluator existed. `## How the evaluation works` was
deleted, the self-check's lede now says plainly that it is the only structural assessment the
graph gets before the human reads it, and the closing paragraph no longer promises an
evaluation. The five producers keep loading it; the file shrank 5 673 → 4 850 bytes.

**Every `conceptrev` review already on disk**, including this Circle's own plan review at
`circles/260815-0007-remove-eight-mechanisms-and-cap-growth/reviews/260815-0044-conceptrev-plan-remove-eight-mechanisms-and-cap-growth.md`.
Removing the agent does not unmake the reviews it wrote. `rules/fusion-workbench-conventions.md`
`## Filename Patterns` now reads `<sender>` as `coderev` or `ontorev` and carries one clause
saying older files may carry `conceptrev`, retired with its agent — so an agent meeting one in
`$SCAN_REVIEWS` reads a documented value rather than an unexplained one.

**The pre-v4 `conceptreview/` folder handling** in `skills/setup/SKILL.md:67`,
`skills/migrate/SKILL.md:52,85` and `path-literal-lint.test.ts`'s `TYPE_FOLDERS`. Those name a
retired *layout*, not the agent. `conceptrev` existed from v3.24.0 and the container
restructure landed at v4.0.0, so a workbench from that window can genuinely hold a
`conceptreview/` directory, and `/fusion:migrate` must still recognise and move it. Deleting
that handling would have been a silent migration regression.

## The five agent-count claims

`derivable-enumerations-lint.test.ts` `CLAIMS` asserts five, and all five moved:
`CLAUDE.md` 17 → 16 (`N specialized agents`), 17 → 16 (`The N agent prompts`), 16 → 15
(`the other N inherit`); `README.md:3` 17 → 16; `README-agents.md:196` 17 → 16
(`of the N prompts`). The plan's original file list named three; the correction pass added
`README.md` and `README-agents.md`, and both were needed.

## Two judgements the step's file list did not pre-authorise

Both are the case the plan's scope rule allows: the change makes a statement false and no gate
can see it.

1. **`CLAUDE.md:16`'s roster and its `conceptrev` sentence.** The digit is gate-forced; the
   name list beside it is not, but a bullet claiming 16 agents while naming 17 contradicts
   itself in one sentence. The name was removed with the digit, and the standalone sentence
   describing what `conceptrev` was went with it, rather than waiting five steps for gate G1
   to remove a description of an agent that no longer exists.
2. **`hooks/lib/__tests__/context-manifest.test.ts:161`** hard-coded `expect(AGENTS.length).toBe(17)`
   with the comment `// 15 original + editor + curator`. Correcting the literal to 16 would
   have reproduced the defect one agent later, so the assertion now derives the set from
   `readdirSync(agents/)` and diffs it against the fixture list. Same non-vacuity guarantee,
   no second statement of the tree's contents.

## Two findings filed rather than executed

Filed as `issues/260815-1339_o_step-7-named-a-review-coverage-sender-set-that-does-not-exist-and-orphaned-scan-investigations.md`:

- Step 7's fifth bullet asks for `conceptrev` to be removed from a **recognised sender set** in
  `hooks/lib/review-coverage.ts`. No such set exists — the absence of a sender filter *is*
  defect `shared/issues/260811-1145`. The bullet also says that defect is retired by this step;
  it is not. Existing `conceptrev` files still produce the permanent `UNUSABLE` row, this
  Circle's own review among them, so the issue was **left `_o_`** rather than closed on a fix
  that did not happen.
- `SCAN_INVESTIGATIONS` lost its last consumer here. `agents/conceptrev.md:42` was the only
  prompt naming it; the plan's open question claims `/fusion:archive` still does, and it does
  not — `skills/archive/SKILL.md:62` writes the name without the `$` the resolver's derivation
  grep reads, and `bin/fusion-paths archive` emits no such key. The arm in `bin/fusion-paths`
  was kept: an unnamed key costs nothing at run time, and retiring it is step 8's question.
  Step 8 must decide it from this measurement, not from the plan's premise.

## Files changed

Deleted (`git rm`): `agents/conceptrev.md`.

Edited: `agents/orchestrator.md`, `agents/analyst.md`, `agents/planner.md`, `agents/shaper.md`,
`agents/taskplanner.md`, `agents/reconciler.md`, `agents/investigator.md`; `bin/fusion-rules`;
`rules/design-diagrams.md`, `rules/fusion-workbench-conventions.md`,
`rules/workbench-path-resolution.md`; `skills/archive/SKILL.md`, `skills/cadence/SKILL.md`;
`hooks/lib/__tests__/fusion-paths.test.ts`, `context-manifest.test.ts`,
`path-literal-lint.test.ts`, `rules-emission-golden.test.ts`,
`fixtures/rules-emission.golden` (regenerated, `RULE_BASELINE` untouched); `README.md`,
`README-agents.md`, `docs/philosophy.md`, `CLAUDE.md`.

## Byte effect on the always-on core

`rules/fusion-workbench-conventions.md` 52 282 → 52 292 (+10: the retired-sender clause, net of
the three-review-kinds text it replaced). `rules/design-diagrams.md` 5 673 → 4 850 (−823, and
it is conditional, charged to the five producers only). The golden was regenerated by the
documented one command; `RULE_BASELINE` was not re-cut, so the shrink is recorded as growth
this role is credited with rather than absolved of.
