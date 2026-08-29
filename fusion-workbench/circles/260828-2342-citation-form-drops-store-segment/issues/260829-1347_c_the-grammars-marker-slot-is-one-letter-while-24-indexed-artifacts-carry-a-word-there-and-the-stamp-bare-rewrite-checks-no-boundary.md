# The grammar's marker slot is one letter while 24 indexed artifacts carry a word there, and the stamp-bare rewrite checks no boundary

---
**Filed by:** coderev, Kai Stalmann <ks@qantr.com>
**Severity:** Medium
**Affects:** `hooks/lib/citation-scan.ts` (`BARE_RE` line 134, `STAMP_RE` line 145, `basenameMatcher` line 295), `hooks/lib/__tests__/workbench-citation-lint.test.ts` (`STAMPED_RE`, the uniqueness walk), `hooks/scripts/citation-sweep.mjs` (`rewriteOf()` case `stamp-bare`, lines 125-129)
**Cross-references:** `260829-1346_*_the-committed-sweep-rewrote-29-date-head-fields-into-filenames-and-left-181-chained-tails-in-the-tree.md` (the damage), `260829-1333_*_the-citation-sweep-is-not-idempotent-a-truncated-citation-gains-a-marker-tail-on-rewrite.md` (the sibling)

---

## Three facts that together produce the damage

1. **The marker slot is one letter everywhere the grammar reads it.** `BARE_RE` requires `_[a-zA-Z*]_`; `basenameMatcher` maps `_*_` to `_[a-z]_`; the sweep's `storelessBase` and the uniqueness test's `STAMPED_RE` (`_[a-z]_|-`) do the same. But `workbenchIndex()` (line 430) indexes every file, and the tree holds **24** artifacts whose slot carries a word: `find fusion-workbench -name '*.md' | grep -E '/[0-9]{6}-[0-9]{4}_[a-z]{2,}_'` — 22 `_coder_`, 1 `_ontocoder_`, 1 `_planner_` (pre-Circle history files, e.g. `archive/…/history/260801-1355_coder_shell-parse-extraction.md`). A citation of one of them, `260801-1355_coder_shell-parse-extraction.md`, is not a `bare-record` (the slot fails `_[a-zA-Z*]_`) and not exempt; `STAMP_RE` claims the stamp alone as `stamp-bare`, resolves it by prefix to that very file, and the sweep appends the basename after the stamp: the six doubled tails in the sibling issue.

2. **The uniqueness claim does not cover the index the resolver uses.** `STAMPED_RE` in the uniqueness test skips the 24 files, so the rule text's "0 collisions over 2 235 marker-normalised basenames" is measured over a set the `stamp-name` prefix lookup (`e.base.startsWith(full)`, line 617) does not stop at. The measurement happens to hold today; nothing re-takes it for the 24.

3. **The `stamp-bare` rewrite has no token boundary.** `STAMP_RE`'s trailing lookahead is `(?![0-9])` only, so `260801-1355_coder_…`, `260809-1224_d`, `260826-0136_*_`, `260717-1918[o]-slug` and `**Date:** 260801-1355` all tokenise as a bare stamp; `rewriteOf()` then trusts `matches.length === 1`, which the header of `partition()` (lines 750-756) itself calls an accident of the minute. The rewriter acts on exactly the class the scanner's own comment says no mechanism can judge.

## What the sibling issue's acceptance cannot reach as stated

Its criterion is "a `--dry-run` over an already-swept tree reports `rewrites=0`". At `e9f2ed0b` the dry run offers 208, of which 136 are plain bare stamps in terminal records that the plan's step 10 deliberately left bare ("a bare stamp in a terminal record stays bare"). That rule lives in the hand pass and nowhere in the script, so `rewrites=0` is unreachable until either the script encodes it (skip files whose basename carries `_c_`, `_b_`, `_s_`, `_d_`, `_i_` and everything under `archive/`) or the `stamp-bare` rewrite is removed from the script altogether. The second is the smaller change and matches the scanner's own stance on the class.

## Acceptance

- `BARE_RE`, `basenameMatcher`, `storelessBase` and `STAMPED_RE` agree on one marker-slot grammar, either `_[a-z]+_` everywhere or the 24 files renamed by `/fusion:migrate` and the single-letter slot kept; the choice is a decision, not a fix, and this issue does not pre-empt it.
- `STAMP_RE` refuses a stamp followed by `_`, `[` or a letter (a token boundary the same way its lookbehind is one), or `rewriteOf()` returns `null` for `stamp-bare` unconditionally.
- `citation-sweep.test.ts` carries the `_coder_` shape, the `**Date:**` line and the three truncated shapes as fixtures that are left unrewritten.
- The uniqueness test walks the same set `workbenchIndex()` resolves against, or the rule text states the 24 as outside the claim.

---
Resolved: 260829-1420, coder (Turn 2 task R1). One slot grammar everywhere: `MARKER_SLOT` in `hooks/lib/citation-scan.ts` (`_x_` or `_coder_`/`_ontocoder_`/`_planner_`, enumerated from the tree) is read by `REC_RE`, `BARE_RE`, the sweep's repair pass and the uniqueness test's `STAMPED_RE`, and a new case in `workbench-citation-lint.test.ts` fails when the tree carries a marker word the grammar does not enumerate. `STAMP_RE` refuses a stamp followed by `_`, `[`, a letter or `-<name>`, and the `(?!\.md)` lookahead refuses the backtrack; a truncated citation is a `bare-record`. The `stamp-bare` rewrite is gone from `citation-sweep.mjs` (the second of this record's two options; the first could not reach `rewrites=0`). Fixtures for the `_coder_` shape, the `**Date:**` line and the three truncated shapes are in `citation-sweep.test.ts`. The `260809-1224_d` example in this record's point 3 is an exhibit and stays as written.

Reconciled: 260829-1805, reconciler. Closure verified at `3276b1e1` and re-verified at `a60d1fea`: `bin/fusion-citation-sweep` dry-run over the tree prints `rewrites=0`, `bin/fusion-citation-check` prints `store-prefixed=0`, `npm test` 805 green.
