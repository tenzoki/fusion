# coder — Bundle B steps 10a, 15, 18a

**Plan:** `260827-1756_*_repair-the-twenty-open-defect-records.md`
**Status:** Complete

## Done

- 10a: `CLAUDE.md` `## Release process`, one sentence appended to the two-session paragraph: a `bin/` helper added in a session is absent from `$FUSION_PLUGIN_ROOT` until `fusion --update`, every `[ -x ]` call site takes its miss branch for the rest of that session; cites `shared/issues/260825-1329_*` by starred path. Record 10 left at `_p_` (closes at 10b).
- 15: `hooks/lib/__tests__/reference-resolution-lint.test.ts:479`, the `2026-08-26 (C4 Turn 3 task Z-2)` clause now states the two facts separately (`hooks/dist/` outside `surface()`; `hooks/lib` sources `recordsOnly`). File stays 990 lines. Issue `260826-1330` closed with `Resolved:`, renamed `_p_` -> `_c_` (plain `mv`; the file was untracked, so `git mv` refused).
- 18a: `rules/workbench-tracking.md` `## The four classes`, the `.guard-state/` paragraph enumerates the live set (`review-coverage.json`, `staging-drift.json`, `dispatch-map.json`, `events.jsonl`) and the leftovers with their retiring commits: `escalation.json` (2026-08-16, `9c79202`), `churn.json` (`a69d56e`), `state-drift.json` (`f45f76a`). No count word for the set. Record 18 left open (closes at 18b).

## Verification

`cd hooks && npx vitest run lib/__tests__/reference-resolution-lint.test.ts lib/__tests__/workbench-citation-lint.test.ts` — exit 1. The failing assertion is the `BASELINE` pin: received 1501/208 against pinned 1477/207.

Share measured by single-file revert against the dirty tree: reverting each of my three files, and all three together, leaves the gate at 1501/208, so this task contributes 0 paths and 0 anchors. Reverting the sibling `agents/playmaker.md` edit gives 1499/208 (+2 paths are that task's). A clean worktree at HEAD `3cbb779` reads 1499/208: the committed pin was already 22 paths and 1 anchor stale before this session's edits. The re-approval line is reserved for step 16 by this dispatch, so it is not touched here; whoever re-approves should account for +22/+1 at HEAD, +2 from playmaker, 0 from Bundle B.
