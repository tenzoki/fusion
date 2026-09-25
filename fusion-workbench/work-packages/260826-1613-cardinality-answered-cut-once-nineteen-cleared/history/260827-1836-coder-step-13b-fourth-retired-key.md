# Coder: plan step 13b, the fourth retired key in the orchestrator's Setup Step 2

**Date:** 260827-1836
**Agent:** coder
**Plan:** 260827-1756_*_repair-the-twenty-open-defect-records.md, step 13b
**Record:** 260825-1456_*_three-shipped-surfaces-say-the-retired-configuration-key-set-is-three-and-the-loader-holds-four.md

## What changed

- `agents/orchestrator.md:114`: the parenthesis naming the retired top-level keys gains `churn` (+9 bytes on `agents/`). Nothing else in the file.
- The record gains a `Resolved:` note declining the prose-to-loader pin (hook-test bound has one line free; `shared/decisions/260811-1522_a_*` is the same question, answered and unrealised) and is renamed `_p_` → `_c_`.
- Plan steps 13a and 13b marked `[DONE]`; 13a's JSON edits are the ontocoder's, landing in the same commit.
- `hooks/lib/__tests__/fixtures/surface-growth.golden` regenerated per its header (`UPDATE_SURFACE_GOLDEN=1`): `orchestrator.md 148245 → 148254`, `total 403955 → 403964`. The baseline did not move.

## Verification

`cd hooks && npx vitest run lib/__tests__/surface-growth-bound.test.ts lib/__tests__/workbench-citation-lint.test.ts` — exit 0 (22 tests).

**Status:** Complete
