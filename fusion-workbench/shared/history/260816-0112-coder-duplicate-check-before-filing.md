# Duplicate check before filing, added to the filing convention

**Status:** Complete
**Agent:** coder
**Source record:** `260805-1548_*_beim-filen-prueft-niemand-ob-der-store-denselben-defekt-schon-traegt.md`

---

## What was done

One paragraph added to `rules/fusion-workbench-conventions.md`, in
`## Issue and Decision Filing — MANDATORY`, immediately ahead of the NEVER block. It
carries the three properties the source record specified:

- **Bounded budget** — one `ls` over the open (`_o_`) record names in the target store
  plus `shared/`, names only, never bodies. The reason is stated in the text: a costlier
  check gets skipped.
- **Defined hit outcome** — append `Also seen: YYMMDD-HHMM by <agent> — <one clause>` to
  the record found. No second file, no marker moves.
- **Explicit counter-direction** — "In doubt, write the new record", with the asymmetry
  named (a duplicate costs one merge, an unfiled defect costs the defect) and the closing
  sentence that this step never ends with nothing written.

The blocker the record named — the rule-text ratchet, decision `260805-1559_*_der-regeltext-ratchet-laesst-keine-erweiterung-zu-und-heute-war-die-erste-noetige.md` — is
implemented, so the addition is landable: the always-on set now measures growth and
reports rather than blocking, within a head-room bound.

## Budget

+490 bytes on `rules/fusion-workbench-conventions.md` (54 623 → 55 113). The record's own
estimate was ~450. This file is one of the five always-on rules, so the 490 is paid by
every agent on every dispatch.

Two candidate sentences were drafted and cut to reach that number: the limit of name
matching (same defect in similar words is caught, in different words missed; the
reconciler remains the catch) and a fuller statement that the hit record's state and
ownership stay untouched. Both are in the source record; neither is in the rule text.

## Golden

`hooks/lib/__tests__/fixtures/rules-emission.golden` regenerated per the test header
(`UPDATE_RULES_GOLDEN=1`, then a clean re-run). The diff is exactly one file size and the
sixteen agent totals that carry it. `surface-growth.golden` was not touched — it pins no
rule file, so this change is outside that surface by construction.

## Verification

`cd hooks && npm test` — 2 test files failed, 750 of 752 tests passed. One failure was the
deliberate regeneration failure and is gone after the clean re-run. The remaining failure
is `surface-growth-bound.test.ts`, `hook-tests` surface, and it is **not from this task**:
the working tree carried uncommitted edits from another session to
`hooks/lib/__tests__/reference-resolution-lint.test.ts` (814 → 825 lines) and
`hooks/lib/__tests__/turn-budget-lint.test.ts`. Both are pinned in
`surface-growth.golden`; neither was written here.
