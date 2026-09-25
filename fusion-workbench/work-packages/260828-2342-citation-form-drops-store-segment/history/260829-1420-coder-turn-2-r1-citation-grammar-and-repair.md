# Coder: Turn 2 task R1, the citation grammar's slot and boundary, and the repair of the committed sweep

**Filed by:** coder, Kai Stalmann <ks@qantr.com>
**Checkout:** 5e8248d7
**Circle:** 260828-2342-citation-form-drops-store-segment
**Started:** 260829-1420
**Status:** Complete

## What was done

One integral fix over the four issues `260829-1346_*`, `260829-1347_*`, `260829-1333_*`, `260829-1343_*` and the review `260829-1345-coderev-circle-closure-storeless-citation-form.md`.

Grammar (`hooks/lib/citation-scan.ts`):
- `MARKER_WORDS` = coder, ontocoder, planner, enumerated from the tree (24 files); `MARKER_SLOT` is the one spelling of the slot and `REC_RE`, `BARE_RE`, the sweep's repair pass and the uniqueness test's `STAMPED_RE` read it.
- `BARE_RE` reads any token with a `_` right after the stamp: a truncated citation (`<stamp>_*_`, `<stamp>_o_`, `<stamp>_d`, `<stamp>_…`) is one `bare-record`, resolved by prefix. Stale-marker detection covers the `_o` cut inside the slot.
- `STAMP_RE` refuses a stamp followed by `_`, `[`, a letter or `-<name>`, and refuses the backtrack onto `.md`. A stamp followed by `-…` stays a bare stamp (an elided illustration).
- `head-field` exemption: a bare stamp that is the whole value of a `**Field:**` line is a date, not a pointer. Narrow to `stamp-bare`, so `**Active spec/plan:** <basename>` stays a citation.
- A token cut at `$`, `<` or `{` is a placeholder (a `_c_circle.md` shell illustration `mv "<stamp>_*_$f.md" …` surfaced as dangling under the widened grammar).

Sweep (`hooks/scripts/citation-sweep.mjs`):
- The `stamp-bare` rewrite is removed. It acted on the class `partition()` refuses to judge and produced every corrupted token. With it, `rewrites=0` was unreachable.
- `--repair` mode: three classes keyed on the index (`date-field`, `chained-tail`, `doubled`), fenced and blockquoted lines skipped, a tail that is another file's full name restored to that name.
- Residual list now names only judged bare stamps, in file order.

Tests: `citation-sweep.test.ts` rewritten (word-marked fixture, `**Date:**`/`**Started:**` head fields, the three truncated shapes, an ellipsis cut, a glob, a second dry run as the idempotency check, a `--repair` case with every tail shape plus fenced/blockquoted exhibits). `workbench-citation-lint.test.ts`: `STAMPED_RE` from `MARKER_SLOT`, plus a case that fails when the tree carries a marker word the grammar does not enumerate. `reference-resolution-lint.test.ts`: `stampBare` 12 -> 11, shares stated on the line. `surface-growth.golden` regenerated (hook-tests 19607 -> 19713 lines; the bound held, suite green).

## Repair of the committed damage

`node hooks/scripts/citation-sweep.mjs --repair --write`: files=119 repairs=290, date-field=42 chained-tail=239 doubled=9.
- date-field: 42 (live 36, archive 6); labels 25 `**Date:**`, 3 `**Datum:**`, 6 `**Started:**`, 5 `**Stamp:**`, 1 `**Run:**`, 1 `**Session:**`, 1 `**Timestamp:**`. Every restored line equals its line at `66b486e0` (checked one by one, 0 mismatches). The issue's 29 = 25 `**Date:**` + 4 `2026-08-29` dates of records filed in the range; the other 17 labels were outside its grep.
- chained-tail: 239 (live 221, archive 18). The issue's 175 was the committed tree's `.md_[a-z*]_?` subset; the working tree (active Circle record, planner history, the plan) and the `[o]-slug`, `.md.md`, `_…` and `_a:63` shapes add the rest. The reconciler's 59 is the `.md_[a-z]\b|.md.md` subset.
- doubled: 9 (live 7, archive 2); the issue's 6 counted the `_coder_<slug>.md` form and not the three `_coder_…` ellipsis forms on `260731-2324-reconciliation.md:73`.
- Two exhibits in `260829-1346_*` (lines 24, 26) were restored to the damaged spelling after the pass: they are the datum. `--repair --dry-run` reports exactly those 2.

Then `node hooks/scripts/citation-sweep.mjs --write`: files=48 rewrites=119 bare-record=119 (live 102, archive 17), the literal markers on truncated citations the first sweep could not see, starred to `_*_`.

## Acceptance

- `node hooks/scripts/citation-sweep.mjs --dry-run`: `files=0 rewrites=0 residual=2754 … stamp-bare=0`.
- `bin/fusion-citation-check`: `store-prefixed=0`, `dangling=244` (204 dangling + 40 stale-marker), 0 rows in live-marker records, 56 in terminal records, 188 in markerless history/analysis/review files. Pre-existing dead pointers (deleted or never-filed records, task nicknames written as `<stamp>-<word>`) plus truncated citations the widened grammar now sees where the old grammar counted a bare stamp. Was 260 at `e9f2ed0b`.
- `git grep -E '\.md_[a-z*]+_?([^a-z0-9]|$)'` over `fusion-workbench`: only placeholder exhibits (`<basename>.md_o`, `<stamp>_o_`) and the two real exhibits in `260829-1346_*`.
- `cd hooks && npm test`: exit 0, 797 passed.

## Sighting, not fixed

`260805-2005-textschicht-gegen-code-nachziehen:104`: the committed sweep starred both markers of a shell illustration, `mv "…_o_$f.md" "…_c_$f.md"` -> `_*_` twice, which deletes the example's meaning (a rename from open to closed). Outside the three repaired classes; left for the orchestrator.

## Issues closed

`260829-1346_o_*` -> `_c_`, `260829-1347_o_*` -> `_c_`, `260829-1333_o_*` -> `_c_`, `260829-1343_o_*` -> `_c_` (Resolved lines appended). `260829-1348_o_*` untouched.
