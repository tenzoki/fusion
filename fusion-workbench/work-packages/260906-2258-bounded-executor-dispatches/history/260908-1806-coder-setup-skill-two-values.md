# Coder — Step 11: mirror the Setup change in the setup skill

**Status:** Complete
**Agent:** coder
**Date:** 2026-09-08
**Checkout:** 5e8248d7
**Filed by:** Kai Stalmann <ks@qantr.com>
**Source:** `260907-1450_*_plan-bounded-executor-dispatches.md` `### 11`

## What was done

One edit to `skills/setup/SKILL.md`, and to no other shipped file.

The Turn-budget paragraph's lead sentence now names two values out of one block:
"**The Turn budget and the dispatch bound are resolved here too, both out of one block.**"
The run sentence holds *both* answers for the session. The pointer at
`agents/orchestrator.md` Setup Step 2 as the canonical implementation is unchanged, and
its branches are still not copied across: the paragraph names the budget's four
consequences and the dispatch bound's harmless one — no stopping time reaches any dispatch
prompt and every dispatch runs to its natural end as it does today — in one clause each,
under the same "do not restate them here" instruction the paragraph already carried. The
substitution refusal widened from "a budget that did not resolve" to "a value that did not
resolve", and the reporting sentence from "the value" to "both values".

No number of minutes is written anywhere in the file, and no other paragraph of the skill
was touched.

## Fixture

`hooks/lib/__tests__/fixtures/surface-growth.golden` moved, as the plan anticipated: the
`skills` surface pins per-file sizes and `setup/SKILL.md` grew 52406 → 52623 bytes (total
259495 → 259712). Regenerated with the command its own header carries,
`UPDATE_SURFACE_GOLDEN=1 npx vitest run lib/__tests__/surface-growth-bound.test.ts`, whose
run is failing by construction so a regeneration is never green; the diff was read and
contains that one file and the total. **No baseline moved** — `git diff --stat` over
`hooks/lib/__tests__/helpers/growth-bound.ts` and `surface-growth-bound.test.ts` is empty,
so `AGENT_BASELINE`, `RULE_BASELINE`, `SKILL_BASELINE`, `RELEASE_CAP` and `DRIFT_CEILING`
are untouched.

## Verification

- `wc -c skills/setup/SKILL.md` — 52406 before, 52623 after (+217).
- `cd hooks && npm test -- turn-budget` — exit 0 (15 tests, all passing).
- `cd hooks && npm test` — exit 0 (53 files, 924 tests). The first run failed only on the
  surface-growth golden above; after regeneration the suite is green. None of the three
  intermittently-failing harness tests (`staging-drift`, `fusion-commit-lock`,
  `guard-state-shape`) failed in either run.

The green run includes a second agent's concurrent step-12 changes to
`hooks/lib/events-query.ts`, `hooks/events-query.ts` and `bin/fusion-events`, which landed
in the tree while the suite ran; nothing there was edited or repaired here.
