# Golden fixture regenerated after the curator's rule-file corrections

**Agent:** coder
**Date:** 260814-1352
**Circle:** circles/260801-1244-curator
**Status:** Complete

## Task

The curator's apply pass (`circles/260801-1244-curator/history/260814-1332-curator-run.md` §9)
edited five project rule files. Three of them are emitted by `bin/fusion-rules`, so
`hooks/lib/__tests__/fixtures/rules-emission.golden` — which pins the path set, the emission
order, every file's byte size and every agent's total — no longer matched live measurement.
Regenerate the fixture through its own supported path and confirm the suite is green.

## What changed

One file: `hooks/lib/__tests__/fixtures/rules-emission.golden`, rewritten from live
measurement by the `UPDATE_RULES_GOLDEN=1` run. No hand-editing of any number. No rule file
was touched, and `RULE_BASELINE` in the test source was not moved — a regeneration records
growth and never absolves it (`## Re-baselining` in the test header).

Two sizes moved, across all eighteen agent blocks:

| File | Before | After | Delta | Set |
|---|---|---|---|---|
| `fusion-workbench-conventions.md` | 52 027 | 52 549 | +522 | universal core |
| `workbench-stash-and-lock.md` | 12 952 | 13 030 | +78 | role-specific (orchestrator) |

Totals follow: the core-only role 86 573 → 87 095, the orchestrator 111 474 → 112 074, and
the three intermediate roles by the same +522.

`rules/workbench-path-resolution.md` was also edited by the curator and correctly does not
appear in the diff: `bin/fusion-rules` emits it to no agent, so it is not part of the
measured emission.

The path set, the emission order and each agent's file list are unchanged. Every line in the
diff is a size or a total; no agent gained or lost a rule file.

## The growth bound

The universal-core growth bound armed earlier in this Circle (capability C10) passed, and it
was confirmed rather than assumed:

- The named test, `holds the always-on rule set — what every agent loads — inside its
  budget`, reports `✓` under `--reporter=verbose`. It is not vacuous: it first asserts the
  measured core is the full 5-file set, so a bound over an empty core cannot pass silently.
- Arithmetic on the two inputs read directly: core floor 86 573 (`RULE_BASELINE` summed over
  the five core files), budget 98 573 (floor + `GROWTH_BUDGET` 12 000), emitted 87 095.
  Growth 522, head-room remaining 11 478.

The role-specific budget report did not fire either — no `console.warn` block in any run, so
the orchestrator's +78 on `workbench-stash-and-lock.md` stays inside that role's head-room.

## Verification

```
cd hooks && UPDATE_RULES_GOLDEN=1 npx vitest run lib/__tests__/rules-emission-golden.test.ts
```
14 passed, 1 failed — the deliberate flag-guard failure that stops a regeneration run from
ever being green. Expected, and the reason the second run exists.

```
cd hooks && npx vitest run lib/__tests__/rules-emission-golden.test.ts --reporter=verbose
```
exit 0, 15/15 passed.

```
cd hooks && npm test
```
exit 0, 49 test files, 1030 tests, all passed, 72.76s.

`git status` over `hooks/` after the full run shows the fixture as the only modified file:
`npm test` runs `npm run build` first, and that rebuild left `hooks/dist` byte-identical.

---
**Correction appended 260824** (ontocoder, plan step 5 of `circles/260824-1853-close-every-open-defect/planning/260824-1905_*_plan-close-every-open-defect.md`). Two counts above are wrong and are restated without a number, the
form decision `260814-0845` chose for this class. "Across all eighteen agent blocks" is "across every
agent block": the fixture held seventeen when this was written and holds fifteen at 260824, one per
prompt under `agents/`. "Edited five project rule files. Three of them are emitted by
`bin/fusion-rules`" is "edited the project rule files the run's outcome table lists, of which
`bin/fusion-rules` emits some": the table lists five entries across three files, and the helper emits
two of the three, as the paragraph after the table already says. Filed as
`circles/260801-1244-curator/issues/260814-1419_*_the-golden-regeneration-history-states-eighteen-agent-blocks-and-five-rule-files-and-the-artefact-has-seventeen-and-three.md`.
