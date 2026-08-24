# coder — plan step 12: `agents/orchestrator.md`

**Status:** Complete
**Plan:** `circles/260824-1853-close-every-open-defect/planning/260824-1905_*_plan-close-every-open-defect.md`, step 12
**Files changed:** `agents/orchestrator.md`, `hooks/lib/__tests__/reference-resolution-lint.test.ts` (BASELINE re-approval, no net line), `hooks/lib/__tests__/fixtures/surface-growth.golden` (regenerated)

## What changed in the prompt

Twenty-four edits, one per triage row, plus the Coherence-verdict vocabulary step 11 changed in the reconciler:

- 125: `## How you ask the user anything` cites the two dialog decisions, in the `under $SCAN_DECISIONS` form the file already uses (the full-path form failed `path-literal-lint`).
- 55, 141: the resume paragraph re-enters at the dashboard refresh (step 4), names the check-in (step 1) as what resumes, and takes the guarded coverage read; a non-zero `uncovered` count over the interrupted Turn routes Continue through Step 3c.
- 69: `planner` left the domain-parameterised list. 161: the worked example dropped this repository's count. 29: Setup step 6 creates the history file on fresh/Restart only. 22: the `/fusion:monitor-reset` clause is gone. 218: the `**Claim:**` row calls `"$FUSION_PLUGIN_ROOT/bin/fusion-identity"` behind `[ -x ]` and cites `### Who filed it`.
- 21, 23: `Cargo.toml` in the coder row; the tiebreaker states the role-not-extension rule in the words the four prompts quote.
- 15: the dispatch fence covers temporary writes; a destructive verification runs against a scratch copy.
- 58, 59: the Turn-1 exemption in Phase 2 step 1; the two non-creating Phase 2 entries named.
- 47, 177: Step 3b step 5 compares `git diff --cached --name-only` against the staging list, unstages the surplus with `git restore --staged -- <path>`, and points the class question at D-rename-staging.
- 126: Step 3c states the answered position and cites `260815-2109`. Residual: `bin/fusion-review-coverage` line 58 still says "unfiled decision"; `bin/` is outside this step's file set (step 7's), so the record's note names it.
- 30, 31: `gate_response` row names the check-in's three values; "either way" became "whichever the user chose"; the opt-out is stated as not surviving an interruption.
- Verdicts: Phase 3 step 3 and its defensive enum read the four-value set plus `not evaluable`; the Rebalance gate is dispatched on anything but `coherent` and carries the recommendation; the two gate rows merged into one; the Rebalance intro no longer says "three bottom rows"; the `bounded_closure_proposed` row names `directive-partially-met`.
- 80, 81: step 2b skips clauses wholly inside angle brackets; the `gate_hit` row names `Circle stop conditions`.
- 138: Phase 4 step 5 offers re-sharpening when playmaker's briefing says so, and `## Human Gate Rules` has a row for it.
- 73: the record identifier left the report bullet. 93: the decision-filing bullet says a Circle record is cited as `_*_circle.md`.
- 164, 165: the `work_queue` row states its criterion narrowly; the `control:` block draws the control-state versus tally distinction and scopes "three surfaces" to the block.

## Budget

`agents/` head-room: 7 697 before, 3 903 after (baseline map untouched; golden regenerated).
`reference-resolution-lint` BASELINE: 1336/190 -> 1348/189 at the last measurement; step 12's own share is +1 path +1 anchor (`rules/fusion-workbench-conventions.md` `### Who filed it`); the rest is concurrent steps' `CLAUDE.md` and `skills/` edits, in flight in the same tree, so the pin moved three times between runs and whoever commits last re-approves it. Re-approval written on the `const` line: the hook-test surface had no line to spare.

## Records closed

The 24 rows of the dispatch, each `_o_` -> `_c_` by `mv`, with a `Resolved: fixed` note citing the line.

## Verification

`cd hooks && npx vitest run lib/__tests__/turn-budget-lint.test.ts lib/__tests__/executor-verification-report-lint.test.ts lib/__tests__/domain-cascade.test.ts lib/__tests__/surface-growth-bound.test.ts lib/__tests__/reference-resolution-lint.test.ts` — exit 0 at the final run. `npm test`: one failure not of this step, `committed-dist.test.ts` on the untracked `bin/fusion-session-domain` (step 7's helper, wants a `!bin/fusion-session-domain` line in `.gitignore`).
