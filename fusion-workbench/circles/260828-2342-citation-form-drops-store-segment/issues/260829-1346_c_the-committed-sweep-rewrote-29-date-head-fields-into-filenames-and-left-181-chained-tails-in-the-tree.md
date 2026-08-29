# The committed sweep rewrote 29 `**Date:**` head fields into filenames and left 181 chained tails in the tree

---
**Filed by:** coderev, Kai Stalmann <ks@qantr.com>
**Severity:** High
**Affects:** `fusion-workbench/` at `e9f2ed0b` (the swept records, live and archived); the mechanism is `hooks/scripts/citation-sweep.mjs` `rewriteOf()` case `stamp-bare` (lines 125-129)
**Cross-references:** `260829-1333_*_the-citation-sweep-is-not-idempotent-a-truncated-citation-gains-a-marker-tail-on-rewrite.md` (the sibling: the truncated-citation shape of the same rewrite), `260829-1347_*_the-grammars-marker-slot-is-one-letter-while-24-indexed-artifacts-carry-a-word-there-and-the-stamp-bare-rewrite-checks-no-boundary.md` (the cause), `260829-1343_*_fifty-nine-marker-tails-the-sweep-produced-still-stand-in-terminal-records.md` (filed concurrently by the reconciler; its grep `\.md_[a-z]\b` counts the letter-tailed subset, 59, of the 175 below, which also counts the `.md_*` and `.md_*_` tails; class 1 and class 3 here are outside both greps)

---

## What is wrong

The sweep's `stamp-bare` rule rewrites a bare stamp into the basename of the one artifact that carries it, on nothing but a match count of one. Three kinds of token that are **not citations** met that rule and were rewritten into the committed tree at `f1099c5f`:

1. **29 `**Date:**` head fields** of legacy history records became self-citations. Measured with `git diff 66b486e0..e9f2ed0b -- fusion-workbench | grep -E '^\+\*\*Date:\*\*' | wc -l`. Example, line 3 of the archived history file `260801-1355_coder_shell-parse-extraction.md` (under the `260817-1907` sweep):

   ```
   -**Date:** 260801-1355
   +**Date:** 260801-1355_coder_shell-parse-extraction.md
   ```

   A date field now names a file, and the file it names is the record itself.

2. **175 truncated citations carry a residual marker tail after `.md`** (69 files), the shape the sibling issue describes as stripped by hand: `git grep -cE '\.md_[a-z*]_?([^a-z0-9]|$)' -- fusion-workbench`. Example, `archive/260828-0043-safe-cleanup-tier-1/shared/issues/260826-1305_c_*.md`: `260826-0136_*_the-absent-rather-than-empty-rule-has-no-expression-in-any-of-the-three-emit-templates.md_*`. The sibling issue records 239 stripped; these 175 were not.

3. **6 doubled tails on the legacy `_coder_` history shape**: `git grep -cE '\.md_[a-z]+_' -- fusion-workbench`. Example, `260731-2324-reconciliation.md` (shared history): `260731-2235_coder_cadence-skill-registration.md_coder_cadence-skill-regist…`. Here the original token was already the full filename; the grammar reads `_coder_` as no marker (single-letter slot), tokenises the stamp alone, and the sweep appended the basename a second time.

A second `--dry-run` at `e9f2ed0b` offers 208 further `stamp-bare` rewrites over 107 files (`files=107 rewrites=208 residual=3336 … stamp-bare=208`); classified by what follows the stamp: 136 plain, 45 with a single-letter marker tail, 27 with a pre-v4 bracket tail. Every one of the 29 `**Date:**` lines would be chained again on the next `--write`.

## Why it matters

The sweep's correctness question, per the dispatch, is whether the rewrite preserved meaning. For these three classes it did not: a date became a pointer, and 181 pointers became strings no reader resolves (`basenameMatcher` anchors on `.md$` for a token ending in `.md`, and `…md_*` ends in `_*`). `rules/circle-records.md` `### Worked transitions` forbids rewriting terminal records in place; the plan justified reaching them on the ground that "only the spelling of pointers" changes. A `**Date:**` field is not a pointer.

## Acceptance

- The 29 `**Date:**` lines read the bare stamp again (`git diff 66b486e0 -- <file>` shows the field unchanged).
- `git grep -cE '\.md_[a-z*]+_?([^a-z0-9]|$)' -- fusion-workbench` returns nothing.
- The repair is a script over the diff `66b486e0..e9f2ed0b`, not a hand pass: every damaged token is derivable from the `-`/`+` pair, and a hand pass is what left 175 of 239 standing.
- The sweep refuses the `stamp-bare` rewrite on a line whose first field is `**Date:**` (or on any token followed by `_`, `[` or a letter), per the cause issue.

---
Resolved: 260829-1420, coder (Turn 2 task R1). Repaired by `node hooks/scripts/citation-sweep.mjs --repair --write`, a repair mode keyed on the workbench index (not a hand pass), over the whole workbench including `archive/`: 42 head fields restored to their bare stamp (25 `**Date:**`, 3 `**Datum:**`, 6 `**Started:**`, 5 `**Stamp:**`, 1 `**Run:**`, 1 `**Session:**`, 1 `**Timestamp:**`; every restored line equals its line at `66b486e0`, checked one by one), 239 chained tails stripped after `.md`, 9 doubled word-marker basenames collapsed (290 tokens in 119 files). The figures differ from this record's 29 / 181 / 6 because the 29 counted `+**Date:**` diff lines (4 are the `2026-08-29` dates of records newly filed in the range) and read no other label, and because the tails were re-counted over the working tree, where the active Circle record and the planner history carried further ones. Cause closed in the grammar (`hooks/lib/citation-scan.ts`: `MARKER_SLOT`, the truncated `bare-record`, `STAMP_RE`'s trailing boundary, the `head-field` exemption) and the `stamp-bare` rewrite removed from the sweep. The two exhibits on lines 24 and 26 of this record keep the damaged spelling on purpose; they are the datum, and the only two such tokens left in the tree.
