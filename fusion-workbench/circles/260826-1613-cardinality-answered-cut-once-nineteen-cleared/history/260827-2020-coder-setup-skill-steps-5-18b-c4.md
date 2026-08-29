# coder — setup skill: plan steps 5 and 18b, C4 records 260826-1112_*_the-setup-skill-points-at-the-orchestrator-prompt-with-an-unrooted-path-the-body-forbids.md / 260826-1113_*_the-setup-skill-calls-the-id-fragment-the-pair-in-the-commit-that-removed-that-word-elsewhere.md

**Filed by:** coder, Kai Stalmann <kai@qantr.com>
**Status:** Complete

## What was done

All edits in `skills/setup/SKILL.md` (43 140 → 46 525 bytes, +3 385):

- Step 0j (new): `.gitignore` partition repair in a tracked workbench. `git check-ignore -q` per R2/R3 entry, negation appended; `.checkout-id` untracked and excluded; other class L entries reported; R1 untouched; asks nothing. Cites `rules/workbench-tracking.md` and both `260825-1030` decisions.
- Step 2: in this repository (`bin/fusion-plugin-cwd` exit 0), list `bin/` executables in the work tree and absent from the install; named in the Done report.
- Step 3: leftover offer probes `escalation.json`, `churn.json`, `state-drift.json`; one question; the three `legacy-halt-clearing.test.ts` phrases kept.
- Step 0i: "the pair" → "the identity fragment `<ID>`", rooted pointer, `session_id` instruction added.
- Step 5: `agents/orchestrator.md` citation rooted with `$FUSION_SRC`.
- Done report names Step 0j lines and the helper gap.

Records closed (`Resolved:` + `_c_`): shared `260825-1019_*_nothing-checks-that-a-tracked-workbenchs-gitignore-matches-the-four-class-partition.md`, `260827-0315_*_the-guard-state-rule-accounts-for-one-inert-leftover-and-the-directory-holds-three.md`, `260825-1329_*_every-session-runs-one-release-behind-on-a-bin-helper-the-same-repository-just-added.md`; C4 `260826-1112_*_the-setup-skill-points-at-the-orchestrator-prompt-with-an-unrooted-path-the-body-forbids.md`, `260826-1113_*_the-setup-skill-calls-the-id-fragment-the-pair-in-the-commit-that-removed-that-word-elsewhere.md`. Plan steps 5 and 18b marked `[DONE]`.

## Measurements

- reference-resolution pin, by single-file revert: paths 1504 → 1508 (+4), anchors 210 → 212 (+2). Baseline not touched; `surface-growth.golden` not regenerated.
- Verification: `cd hooks && npx vitest run lib/__tests__/legacy-halt-clearing.test.ts lib/__tests__/turn-budget-lint.test.ts lib/__tests__/path-literal-lint.test.ts lib/__tests__/workbench-citation-lint.test.ts` — exit 0 (54 tests).
