# Planner session — the compliance guard becomes observation-only

**Date:** 2026-08-16
**Agent:** planner
**Status:** Complete
**Circle:** `260816-1741-guard-becomes-observation-only` (active)
**Dispatch parameters:** `**Executors:** coder, ontocoder, analyst`; `**Circle:** 260816-1741-guard-becomes-observation-only`

## What was asked

Write the first implementation plan for the active Circle. The specification is the Circle record itself; there is no separate spec file. The dispatch named the three decisions the Circle executes, the Circle's own answered Turn-budget decision, the growth bounds, the release process and the curator boundary, and asked the plan to decide whether the Circle ends at a release and whether a migration note is a step.

## What was read

- The Circle record in full, including the playmaker's appended activation proposal.
- Four decision records: the three in `shared/decisions/` that the Circle executes, and `260816-1742_*_where-does-the-orchestrators-turn-budget-live-once-the-guard-configuration-file-is-gone.md` in the Circle's own store. The dispatch was right that the Grounding's `### Open decision this Circle carries` is stale; the record is answered.
- The code: `hooks/guard.ts`, `hooks/lib/escalation.ts`, `hooks/lib/config.ts`, `hooks/lib/self-detect.ts`, `hooks/clear-halt.ts`, `hooks/tracker.ts`, `hooks/lib/events.ts`, `hooks/turn-budget.ts`, `hooks/hooks.json`, `bin/fusion-turn-budget`, `bin/fusion-plugin-cwd`, and the four configuration files.
- The test surface: every file the Grounding names, plus the four lint gates that would fail on a deletion (`derivable-enumerations-lint`, `reference-resolution-lint`, `turn-budget-lint`, `hooks-wiring`) and `helpers/growth-bound.ts` for the re-baselining rule.
- The shipped text: `README.md`, `README-hooks.md`, `README-agents.md`, `docs/philosophy.md`, `docs/working-model.md`, `docs/upgrading-to-v9.md`, `agents/orchestrator.md`, `skills/setup/SKILL.md`, `skills/help/SKILL.md`, `skills/archive/SKILL.md`.

## What was written

| Artifact | Path |
|---|---|
| Plan | `260816-1915_*_the-compliance-guard-becomes-observation-only.md` |
| Decision | `260816-1915_*_how-much-of-the-configuration-loader-survives-when-its-only-leaf-is-the-turn-budget.md` |
| Decision | `260816-1916_*_does-setup-offer-to-move-a-projects-turn-budget-out-of-the-retired-configuration-file.md` |
| Defect | `260816-1917_*_the-groundings-test-list-names-a-test-whose-subject-survives-the-removal.md` |
| Defect | `260816-1917_*_the-groundings-text-surface-list-omits-three-surfaces-that-state-the-halt-as-live.md` |
| Defect | `260816-1918_*_the-orchestrators-setup-names-planner-among-the-domain-parameterised-dispatches.md` |

## What the plan decides

**Fifteen steps in four phases**, ordered on one observation: after CHECK 3 goes, every other piece of the machinery loses its last caller, so the correct order is to stop deciding first and delete what nothing calls second. Twelve steps go to `coder`, two to `ontocoder`, none to `analyst`. The plan states why no step needs `analyst` rather than leaving the absence unexplained, because that judgement is the plan's to make.

**The Circle ends at the work tree, not at a release.** Step 14 bumps the version and the two pin examples in this repository; the tag, the marketplace bump, the push and the cache pull sit behind a user gate after the off-repository verification and after the review pass. The first reason is measured rather than argued: `260810-1618` records a release tagged while its own review pass was still running.

**The migration note is a step.** `docs/upgrading-to-v10.md`, on the `docs/upgrading-to-v9.md` precedent, because this release removes a file every consuming project has at its root.

**The growth baselines are re-armed for three surfaces and not for the fourth.** `surface-growth-bound.test.ts` moves because this is a cleanup, which is one of the two moments its own rule permits. `rules-emission-golden.test.ts` does not, because the always-on rule set is the curator's surface and this Circle does not cut it.

## What the plan found that the Grounding did not

The Grounding's code-site table was rebuilt from `grep` over HEAD rather than copied, and the rebuild found four sites the table does not name. `hooks/lib/project-relative.ts` (152 lines) loses its only caller with the path normalisation. Four of the five exports of `hooks/lib/paths.ts` lose their last caller with CHECK 3. `hooks/session-start.ts` justifies its warning by two resolutions this Circle deletes. Four `bin/` helper headers describe `bin/fusion-plugin-cwd` as the shell half of a TypeScript function that goes.

Two Grounding enumerations do not hold and are filed as defects rather than corrected in silence: `guard-state-shape.test.ts` is listed as a test whose subject is removed and its subject survives, and the text-surface list omits three shipped surfaces that state the halt as live.

## What is still open

Three items, none of which blocks writing the plan and two of which gate a single step each.

- How much of the configuration loader survives, filed as a decision. It gates step 7a. The plan implements the recommended answer, two layers and no `guard.enabled`.
- Whether `/fusion:setup` offers to move a project's Turn budget out of the retired file, filed as a decision. It gates step 8. The plan implements the recommended answer, announce only.
- The new file's name. The Turn-budget decision named `fusion.json` as an example rather than as the answer, so it is a one-word naming choice confirmed at the plan gate rather than a record of its own. The plan uses `fusion.json` throughout.
