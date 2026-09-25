# Ontocoder: P-5, corrections inside workbench records and 28 closures

**Agent:** ontocoder
**Date:** 260824-2030
**Circle:** 260824-1853-close-every-open-defect
**Task:** plan step 5 of `260824-1905_*_plan-close-every-open-defect.md`
**HEAD at start:** `32e286a`
**Status:** Complete

## What changed

Every record in the step's 28 rows was read in full, then the file each row names got an appended
`**Correction appended 260824**` block (a `Revised by:` line on the one closed record, row 83) and
the record was closed with `Resolved: fixed — …; <path:line>` (row 63 as `referred`) and moved
`_o_` to `_c_` by `mv`, full paths.

Five corrections were made in place rather than by appended note alone, each with a dated note
beside it saying so: the five `**Not-opened:**` entries in the C0 review (112, the field's only
reader is the next dispatch), the two summary counts in the curator Turn-3 review (134, the plan's
ending), the `## Turns` section and the two heading citations of `rules/critical-stance.md`
section 4 (133, 195), the `## Measured` anchor in the corpus decision (207), and two clauses of the
C3 plan's `## Where this Circle stops` (216, 220). The `**Status:**` line of the 260815-2147-orchestrator-session.md session
history is `Complete` (87). The empty `## Per-Turn Log` stub in the 260814-2306-orchestrator-session.md session history is
removed (172).

Two literal citations noted outside step 4's list were starred:
`260801-1020_*_provenance-header-on-rule-files.md:62` and
`260807-0158_*_how-is-a-unique-record-filename-obtained.md:176`.

The 28 renames broke eight hard-marker citations in four live files, which the mover owes
(`260816-0119_*_can-anything-carry-the-rename-to-citation-obligation-when-a-record-marker-moves.md`);
all eight were starred: the style spec `260820-2249_*_` (`:285`, `:500`, `:503`, `:508`), the prose
register decision `260816-0740_*_` (`:7`), and the two `_o_` records `260816-1330_*_the-repunctuation-replaced-…`
(`:6`, `:13`) and `260816-1330_*_two-of-the-twenty-nine-…` (`:15`).

## Verification

`cd hooks && npx vitest run lib/__tests__/workbench-citation-lint.test.ts` — exit 1, before and after
this step. Before: 8 dangling tokens, none in this step's files. After: 8 dangling tokens, none
caused by this step and none in a file this step may edit: `260801-1244-rule-provenance-header:34`
(a Circle record), five in `260820-2249_*_spec-style-rules-…` citing `260812-0253` and `260807-2154`
records other steps closed, `260819-0822_*_…:66` citing `260816-0133_*_the-setup-and-migrate-probes-are-byte-identical-in-three-copies-with-no-gate-against-the-next-drift.md` (closed by the
parallel step during this run), and `260822-0119_*_…:9` citing `260821-0147_*_the-english-em-dash-entry-lost-its-inline-demonstration-and-the-german-one-still-breaks-its-own-rule.md`. The
acceptance line "citation lint green" is therefore not met by this step's edits alone.

No file outside `fusion-workbench/` was written by this step; the shipped-tree modifications in
`git status` belong to the parallel coder in `hooks/`.

## Files changed

26 target files with appended or amended text, 28 records closed and renamed, 4 files with starred
citations, 2 decision records with one starred token each. The full list is in the step report.
