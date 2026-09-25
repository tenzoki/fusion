# Coder — step 1: the filing/maintenance boundary in the conventions file

**Date:** 2026-08-13
**Status:** Complete
**Circle:** `260813-0858-playmaker-maintains-backlog-store`
**Plan:** `260813-1306_*_the-playmaker-maintains-the-backlog-store.md` (step 1, now `[DONE]`)

## What changed

`rules/fusion-workbench-conventions.md`, `## Backlog entries` only. Four edits:

1. The first bound was rewritten from *no agent files a backlog entry* to **no agent originates a backlog entry**, carrying the distinction in one quotable sentence: "Filing is originating an idea; maintenance is reshaping ideas the store already holds." The writer enumeration became user files / playmaker maintains / nobody else writes.
2. A new paragraph names the four confirm-gated operations as **four** — split, merge, close, defer — and separates them from the autonomous `_o_` ↔ `_p_` ranking rename. It states why the bound survives maintenance: none of the five adds an idea to the store, and the text a merge writes consolidates statements already filed.
3. A marker-writer table for `_o_`, `_p_`, `_c_`, `_d_`, each row naming the writer and the gate. The `_p_` row names the playmaker and nobody else. The `_d_` row carries the two transitions that deliberately do not exist — `_d_`→`_p_` (reviving reverses a disposition, and a reversal is not a ranking judgement; revival is `_d_`→`_o_`, by the user) and `_d_`→`_c_` by the shaper (its promotion path renames `_o_` or `_p_` and nothing else, `agents/shaper.md:87`).
4. `Binding decisions:` extended with the two records the plan names — `260812-2043_*_who-writes-the-recommended-marker-on-a-backlog-entry.md` and the Circle's own `260813-0858_*_does-a-non-interactive-playmaker-run-perform-the-confirm-gated-backlog-operations.md`.

Untouched, as the step requires: the definition paragraph, the marker-vocabulary paragraph, the minimum-content paragraph, and the second bound (the backlog is not the work queue).

## Cost

Section: 1 894 → 3 827 bytes (+1 933). File: 49 992 → 51 925 bytes. That is the whole of the file's delta — nothing outside the section moved. The always-on emission per agent dispatch rises by the same 1 933 bytes (`rules-emission-golden.test.ts` reports total 90 211 → 92 144 for `analyst`).

## Verification

`cd hooks && npx vitest run` — exit 1. 1 013 of 1 014 tests pass across 48 files. The single failure is `lib/__tests__/rules-emission-golden.test.ts` → *matches the checked-in golden, agent by agent*, reporting exactly the byte delta above. **The golden was deliberately not regenerated** — step 8 of the plan owns that regeneration, and regenerating here would have hidden what this step costs.

No other test moved. Nothing was committed.
