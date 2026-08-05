# coder — Step 7 remainder: the three-file documentation pass (narrow scope)

**Date:** 260805-2233
**Status:** Complete
**Task:** T2 — plan `260804-1633` Step 7, reduced to what was still open: obligation 10
(close `260804-1427`), the one-pass consistency re-read against the landed Step 6
template, and the plan's five verification greps.
**Plan:** `planning/260804-1633_p_plan-c5b-remediation-and-ship.md` § Step 7
**Not committed** — the orchestrator commits after validation.

## What was found open, measured by grep before editing

- `fusion-guard.json` was described in `rules/protected-path-discipline.md` only —
  `README-hooks.md` and `CLAUDE.md` had no mention (obligation 4's README/CLAUDE halves).
- The `guard.enabled` project-layer exception was stated in **neither** of obligation
  12's two files.
- The `260803-1314` option-2 boundary (declared entry outranks the flag) was stated in
  neither shipped document (obligation 13).
- `CLAUDE.md` denied any env override exists, twice (Conventions bullet and the
  symptom-table row) — the pattern obligation 2 corrected in the other two files.
- Greps C (model stays exact) and E (whole-object replacement) were already clean.

## Changes

### `rules/protected-path-discipline.md`

1. Project-layer paragraph under `## The rule` rewritten: merge is per **leaf** key
   (declared taken exactly, omitted inherits), plus the two things outside a project
   list's reach — the `guard.enabled` exception with its `guard_advisory` diagnostic,
   and the floor (bare + absolute spellings, holds whatever the effective list says).
   The measured-reach clause ("the guard's own state directory is an ordinary entry and
   goes with the rest") kept — obligations 10 + 12.
2. Overrides section: "Two things still deny with the flag set" → **three**; added the
   declared-entry precedence with the `rules/**`-declared-withdraws-the-flag cost —
   obligation 13.
3. Human Gate step 3 now names the project's own `fusion-guard.json` as the per-project
   lever (plugin `hooks/config.json` as the default underneath).

### `README-hooks.md`

4. New section "Per-project configuration: `fusion-guard.json`" between the tuning
   material and the shell-writes section: what/where/git-tracked-why, the leaf merge
   (declared wins, `[]` stays empty, built-in default is the empty list, bad type =
   dropped + diagnostic = omitted), the `guard.enabled` exception (with the note that
   the earlier plugin-`config.json` rows stay true as written — obligation 12's
   constraint), the floor with the residual at its **measured** reach
   (`fusion-workbench/.guard-state/**` and the escalation machinery; git-diff bound;
   active-halt bound), and the flag precedence — obligations 4, 10, 12, 13.
5. Pointer sentence at the end of "### 2. Review the configuration".
6. Tuning table: "Off entirely" row scoped to plugin `hooks/config.json`;
   "Advisory-only" row now carries the floor-survives caveat.
7. Stand-down paragraph: "two ways the grant is narrower" → three (declared entry
   subtracted) — consistency with Step 4's landed behaviour.

### `CLAUDE.md`

8. Conventions bullet (two Bash-policy rules): "that no env override waives it" →
   states the one narrow override and its bound.
9. Symptom-table row: "There is **no** env override for this policy" → the corrected
   scoped form (flag named, declared-entry precedence, everything else no override).
10. Layout table: new row `fusion-guard.json` + `templates/fusion-guard.json` (seeding,
    byte-identity pin, leaf merge, `enabled` exception, floor).

### Issue closed

11. `issues/260804-1427_c_the-accepted-floor-residual-…` — Resolved footer appended
    (the "leave it" arm per obligation 10; floor stays one entry), renamed `_o_` → `_c_`.

### Plan updated

12. Step 7 gained a dated remainder-execution block. **Not marked [DONE]:** obligation 5
    (release-checklist line in `CLAUDE.md`) is present nowhere in the file, was not
    among the four early-discharged obligations, and was outside this dispatch's scope.

## Verification

- All five greps meet the plan's stated expectations (run before and after):
  A no surviving sentence denies `FUSION_ALLOW_RULES_WRITE` exists; B `fusion-guard`
  hits in all three files; C "the model stays exact" 0 hits; D the `guard.enabled`
  exception in both files; E no whole-object-replacement sentence.
- `npx vitest run` over `provenance-header-lint`, `path-literal-lint`,
  `marker-format-lint`, `glob-nomatch-lint`: 4 files, 69 tests, all passed.
- Every new sentence checked against the landed template (`templates/fusion-guard.json`,
  byte-identical root copy confirmed via `cmp`; git-tracked confirmed via
  `check-ignore`) and the loader (`hooks/lib/config.ts:132,687-692` for the bare +
  absolute floor pair).

## Handed to the orchestrator

- **Obligation 5 is the one item between Step 7 and [DONE]** — one sentence in
  `CLAUDE.md`'s release checklist; deliberately not written here (out of scope).
- Decision record `260802-1912_a_` still carries the narrower residual bound; the
  shipped docs now carry the measured one. Whether the record gets a correcting
  appendix is a Circle-owner call ("not both, and not neither" is satisfied by the
  documentation leg).
- Not worked, per scope: the 260805-18xx/19xx Gesamtreview text-drift findings — they
  belong to Circle `260805-2005-textschicht-gegen-code-nachziehen`.
