# Consolidation pass after five concurrent steps

**Status:** Complete
**Agent:** coder
**Circle:** 260819-1645-four-constraints-on-deep-change
**Plan:** `260819-2016_*_four-constraints-on-deep-change.md`
**HEAD at start:** `b6869aa`

## What this was

Steps 1-5 of the plan ran concurrently on disjoint file sets. None ran the full
suite, none regenerated a golden, none wrote a shared pinned constant. This pass
measured the settled tree once and wrote the two shared artifacts.

## 1. Re-approved the reference-resolution pin

The committed constant at `HEAD:hooks/lib/__tests__/reference-resolution-lint.test.ts`
was `{ paths: 1178, anchors: 155, records: 102 }`, read with `git show`. The settled
tree measures `{ paths: 1179, anchors: 155, records: 104 }`.

Step 4's report of the starting point (1178) was right. Step 5's report of it (1168)
was wrong; its received value (1179) was right.

Attribution, measured by copying each changed file in turn into a detached worktree
at `b6869aa` and rerunning the gate:

- `rules/circle-records.md` +1 / 0 / +2 — the whole movement.
- `agents/orchestrator.md` 0 / 0 / 0 — measured, not assumed.
- the whole changed `fusion-workbench/`, copied across on its own, 0 / 0 / 0.
- `hooks/lib/__tests__/*.ts` and `hooks/package.json` are not `surface()` files.

Step 4's three tokens were verified against the diff and against the measurement,
and all three are in `rules/circle-records.md`: `bin/fusion-rules` (class (a)),
`260819-1400-reconciliation-circles.md` and the binding decision
`260805-1548` (both class (c)). The per-file figures sum exactly to the observed
movement.

The constant was updated and the re-approval note written above it.

## 2. Regenerated `surface-growth.golden`

`cd hooks && UPDATE_SURFACE_GOLDEN=1 npx vitest run lib/__tests__/surface-growth-bound.test.ts`,
then a bare re-run. Four lines moved plus two totals:

- `agents/orchestrator.md` 150303 -> 150698 (+395), agents total 414534 -> 414929.
- `hook-tests/committed-dist.test.ts` new at 253 lines.
- `hook-tests/guard-bash-integration.test.ts` 346 -> 417 (+71).
- `hook-tests/reference-resolution-lint.test.ts` 1145 -> 1173 (+28) — item 1's note.
- hook-tests total 18498 -> 18850 (+352 = 253 + 71 + 28).

The skills surface did not move. No bound assertion is over: agents 2914 bytes of
head-room left, skills 9716 bytes, hook-tests 1525 lines.

## 3. Proved the NotebookEdit case

In a detached worktree at `b6869aa` with the modified test file copied in, removing
the `notebook_path` branch from `extractFilePath` in `hooks/guard.ts` turned exactly
one case red — the new NotebookEdit one — at `guard-bash-integration.test.ts:198`,
the `file` assertion. The `guard_allow` and `tool` assertions above it still passed,
which is the correct blast radius. The live tree was never edited.

## 4. Full suite

`cd hooks && npx vitest run` — exit 1, 677 passed / 1 failed, run twice with the
same single failure.

The failure is `rules-emission-golden.test.ts` `matches the checked-in golden, agent
by agent`: `circle-records.md` 14832 -> 18747 in the orchestrator emission, total
111875 -> 115790. That is step 4's edit and it needs its own golden regenerated.
`hooks/lib/__tests__/fixtures/rules-emission.golden` was outside this pass's file
set, so it was named and left alone rather than fixed silently. The always-on growth
bound in the same file passed — `circle-records.md` is a conditional emission and is
not in the always-on core.

## Files changed

- `hooks/lib/__tests__/reference-resolution-lint.test.ts`
- `hooks/lib/__tests__/fixtures/surface-growth.golden`
- this history log
