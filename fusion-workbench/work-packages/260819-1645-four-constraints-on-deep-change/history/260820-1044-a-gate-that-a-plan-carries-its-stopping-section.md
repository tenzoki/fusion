# A gate that a plan carries its stopping section

**Date:** 2026-08-20
**Agent:** coder
**Status:** Complete
**Task:** Circle Turn 2, task F3 — fix direction 1 of `260820-0917_*_the-first-plan-written-after-the-stopping-section-was-made-mandatory-does-not-carry-it.md`.
**HEAD at start:** `8e7cae7`

## What was built

`hooks/lib/__tests__/plan-stopping-section-lint.test.ts` (284 lines, new). A lint gate
asserting that every **live** plan in a planning store carries `## Where this Circle stops`
with a filled body. Three named failures — `absent`, `empty`, `placeholder` — each with its
own remedy in the message, citing `agents/planner.md:131` (the format), `:160` (the mandate)
and `agents/orchestrator.md:866` (the step the section feeds).

Reuses `fencedContentLines`, `workbenchRoot` and `WORKBENCH_PRESENT` from
`helpers/citation-scan.ts` rather than carrying a second fence tracker, so a plan that
*quotes* the planner's output format does not satisfy the gate by quotation. That helper was
being edited by a sibling coder in the same Turn; the dependency is an import only, and no
byte of it was changed here.

## The corpus, and the measurement that chose it

Measured at HEAD `8e7cae7`, over `circles/*/planning/` and `shared/planning/`:

- 24 files. 4 are shaper specs (`agents/shaper.md:183` — that format has no such section),
  20 are plans.
- Of the 20 plans, **1** carries the section and **19** do not.
- **All 20 are `_c_`.** The live corpus (`_o_`, `_p_`) is **empty**.

So a gate over all plans would open red at 19, whose remedy would be to invent stopping
conditions for finished work. The corpus is the live pair `_o_`/`_p_` from
`rules/fusion-workbench-conventions.md` `## State Markers — issues and planning`. That is
not the count talking: the mandate serves a step that runs *before* a Circle closes, so the
window in which the section must exist is exactly the window in which the plan is live.
Plans are created `_o_` (`agents/planner.md:94`) — 20 of 35 planning-store adds in this
repository's history were `_o_` — so the gate fires on the day a plan is written.

**The honest weakness:** at HEAD the corpus assertion passes over 0 files. It is a trap set,
not a measurement of the current tree. The mechanism is therefore pinned separately over
synthetic documents (10 further cases), so what the gate would do is asserted today.

## Decisions taken here

- **The placeholder is judged.** The mandate's second half ("never left as the angle-bracket
  placeholder") is still a question of presence, of a body rather than of a heading, and a
  heading over `<...>` is the invisible-at-approval failure the defect describes. A
  placeholder *plus* a real clause passes — that is substance, and substance is not judged.
- **Spec-vs-plan is decided on the spec side.** The 20 plans carry four H1 forms
  (`# Implementation Plan:`, `# Master Implementation Plan:`, and the `de`
  `# Umsetzungsplan:` / `# Ausstiegsplan:`), so a plan-side prefix would silently drop
  plans; the 4 specs are uniform (`# Spec:` H1, `spec-` filename topic), so exclusion runs
  from there.

## Demonstrated failing

Detached git worktree at HEAD in the scratchpad, never the live tree: two closed plans
renamed `_c_` → `_o_` / `_p_`, one of them then given a placeholder-only section. Exit 1,
both verdicts rendered with their remedies. Worktree removed; the live tree carries only the
new test file.

## Growth bound — measured, not moved

The hook-test surface stands at 20 172 lines against a floor of 17 875, so delta 2 297 of a
2 500 head-room: **203 lines remaining**, with two sibling coders still writing. The *bound*
passes. `surface-growth-bound.test.ts` fails on its golden-equality case only, because three
new test files arrived this Turn; no golden was regenerated and no `BASELINE` was touched, per
the dispatch. That is the consolidation pass's to settle.

## Verification

`cd hooks && npx vitest run lib/__tests__/plan-stopping-section-lint.test.ts` — exit 0,
11 tests passed.
