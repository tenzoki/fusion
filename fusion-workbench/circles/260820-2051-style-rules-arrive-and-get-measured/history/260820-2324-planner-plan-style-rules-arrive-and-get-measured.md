# Planner: the implementation plan for the style-rules Circle

**Date:** 2026-08-20
**Agent:** planner (dispatched by the orchestrator)
**Circle:** `circles/260820-2051-style-rules-arrive-and-get-measured`
**Status:** Complete
**Executors passed:** coder, ontocoder, analyst

## What was produced

`circles/260820-2051-style-rules-arrive-and-get-measured/planning/260820-2324_*_plan-style-rules-arrive-and-get-measured.md`,
18 steps plus one review gate. Executor mix: 14 coder, 3 ontocoder, 1 analyst.

Two decision records were filed open, both stamped `260820-2324`, because each is a mechanism choice
that binds work beyond this plan:

- `circles/260820-2051-style-rules-arrive-and-get-measured/decisions/260820-2324_*_where-does-the-copied-asset-provenance-record-live.md`
- `circles/260820-2051-style-rules-arrive-and-get-measured/decisions/260820-2324_*_is-the-work-tree-the-refresh-source-when-setup-runs-in-the-plugins-own-repository.md`

## Inputs read

The spec's appended binding section first, then its body; the assessment's ten findings; the eight
decision records stamped `260820-2314`; the Circle record; the always-on rule set; `bin/fusion-rules`;
`skills/setup/SKILL.md`; the growth-bound helper and the surface bound test; the citation-scan helper and
the two lint gates that read live plans; `rules/workbench-tracking.md`; and
`shared/decisions/260810-1544_*_should-prompt-called-bin-helpers-get-one-guarded-call-convention-and-does-the-work-tree-preference-extend-to-them.md`.

## Measurements taken while planning

All at HEAD `c866d81`, and all reproduce the spec's figures exactly: `agents/` 415 584 bytes,
`skills/` 231 892 bytes, hook tests 20 259 lines, the five always-on rule files 92 869 bytes. The head-room
figures the plan works against are therefore 2 259, 8 547, 116 and 5 704. The commit at HEAD touched only
workbench files, which is why the spec's figures at `a5b73da` still hold.

## Decisions the plan took, beyond the eight it inherited

- The metric becomes `bin/fusion-prose-metric`, a pure bash and awk reporting program, on the precedent of
  `bin/fusion-staging-drift`. It costs nothing against the four bounds and needs one `CLAUDE.md` Layout row,
  which `derivable-enumerations-lint` holds in set equality.
- The corpus repair runs one file per commit, so each commit's token-stream evidence covers one
  before-and-after pair.
- The `coderev` pass required by binding correction 11 is written as a review gate rather than as a step,
  because `coderev` is not in the executor set the dispatch named and a review is the orchestrator's
  dispatch to make.

## What was found wrong or under-specified in the inputs

Four things, reported to the orchestrator in the same terms.

1. C2's fourth acceptance criterion claims a three-way identity that cannot be reached inside the Circle,
   for exactly the reason binding correction 5 gives for dropping C1's criterion 7. The plan reads it down
   to source and workbench copy.
2. Binding correction 5 changes what `CLAUDE.md` states about copied assets, and that statement is the one
   place part (c) of `260810-1544` is currently visible. The plan carries the correction in the same commit
   as the mechanism and files the question.
3. The assessment recommended an executor set including `curator`; the dispatch named coder, ontocoder and
   analyst. Rule prose and record corrections are routed to coder under the routing rules.
4. The plan's own new implementation of "fenced content" is a second definition beside the citation
   helper's. It is stated as a residual in the plan's risk table rather than filed, because the plan
   creates it rather than finding it.

## Verification run

`npx vitest run lib/__tests__/workbench-citation-lint.test.ts lib/__tests__/plan-stopping-section-lint.test.ts`
passed, 21 tests, so the plan's citations resolve and its stopping section is present.
The plan carries zero prose em-dashes over 6 237 words; the one `—` in the file sits inside an inline code
span, which the metric excludes.
