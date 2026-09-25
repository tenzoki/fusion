# The grammar reads the bracket marker form, and the tree is swept once, archive included

---
**Domain:** code
**Status:** done
**Claim:** 5e8248d7 — Kai Stalmann <ks@qantr.com>, 260922-1601
**Mode:** autonomous
**Active spec/plan:** 260922-1628_*_the-grammar-reads-the-bracket-marker-and-the-tree-is-swept-once.md (the plan)
**Cross-references:** 260921-1718_*_does-the-grammar-read-a-storeless-bracket-marked-citation-or-state-the-asymmetry-as-a-decision.md, 260921-2002_*_does-reading-the-bracket-marker-form-sweep-the-frozen-stores-or-does-the-sweep-first-learn-to-skip-them.md, 260831-0748_*_a-storeless-bracket-marked-citation-is-invisible-while-a-store-prefixed-one-is-reported.md, 260830-1842_*_may-the-grammar-resolve-a-bracket-marked-record-that-a-frozen-store-keeps-permanently.md
**Filed by:** user, Kai Stalmann <ks@qantr.com>

---

## Directive

The user ruled on 260922-1420, against the two records' own recommendation and with the reason stated: make a clean sweep once rather than carrying the class for weeks. `hooks/lib/citation-scan.ts` `BARE_RE` admits `[x]` in the marker position beside `_x_`, `MARKER_SLOT` untouched, so a storeless bracket citation is read exactly as a store-prefixed one already is: found under the wildcard it is `stale-marker`, found nowhere it is `dangling`. The header paragraph that refused this is rewritten to say the stance moved, because its reason was written for workbench filenames while the population that bites is citations inside source files, where no migration ever looks.

Then the tree is swept once, `archive/` included: measured at `f0f4c9c6`, 142 unfenced bracket tokens in 51 files, 125 resolving under the wildcard (37 of them archived) and 17 resolving to nothing. The 17 are repaired by hand, each with the annotation its case asks for. `rules/fusion-workbench-conventions.md` `## Terminal states are history` gains the clause the ruling rests on: that rule governs state, a step marker, a ticked criterion, a head field, and a citation respelled from `[x]-` to `_*_` changes no state, names the same target and is what the sweep already does for spelled underscore markers inside closed records.

Last, `/fusion:migrate` gains the sweep as a closing step, so a consuming project that runs `fusion --update` and then the migration cleans its own corpus in one command instead of discovering the class defect by defect.

A reader knows this is reached when `bin/fusion-citation-check` reads `verdict=clean` with the bracket form being read, `bin/fusion-citation-sweep --repair --dry-run` prints `files=0 repairs=0` over fusion's own tree, no bracket token resolves to nothing without an annotation, `cd hooks && npm test` exits 0, and the migration body names the sweep.

---
Closed 260922-1733 as done, over `7294e06f..454f8a39`. The grammar reads the pre-v4 bracket marker, 28 exhibits are fenced in 17 records, one sweep rewrote 111 tokens in 45 files with `archive/` included, and `/fusion:migrate` closes by offering the sweep so a consuming project cleans its corpus in one command. Every gate is green: 987 tests, `verdict=clean`, `files=0 rewrites=0` both ways.

The measured figures matched the plan exactly (139 tokens in 59 files, 126 resolving, 13 dangling); two things the plan did not carry were found while building and are the reason it worked: the sweep's own candidate rule knew only the underscore marker, so the grammar alone would have been a no-op, and a respelling must absorb the marker's trailing hyphen or all 126 rewrites would have named records that do not exist. The grammar and the sweep landed in two adjacent commits rather than one, because the sweep refuses to write against a tree whose corpus holds an uncommitted file; `78328863` is red on three gates by construction and `23576fe6` clears them.

Under `**Mode:** autonomous` the plan's stopping clauses were not put and none was judged; the log carries one `gate_response` per clause. The closing review over `49ab50e4..e41e333f` found no release blocker and filed three issues and one decision; the two that touch a release landed here (`35c775a9`, `454f8a39`), the first of them the one defect that would have made this whole package useless to a consuming project. Left for the user: `260922-1719_*` (the fencing turned single list items into quotations in nine records) and `260922-1720_*` (whether the sweep declines a rewrite whose result resolves to more than one record).
