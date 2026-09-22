# The grammar reads the bracket marker form, and the tree is swept once, archive included

---
**Domain:** code
**Status:** open
**Mode:** autonomous
**Cross-references:** 260921-1718_*_does-the-grammar-read-a-storeless-bracket-marked-citation-or-state-the-asymmetry-as-a-decision.md, 260921-2002_*_does-reading-the-bracket-marker-form-sweep-the-frozen-stores-or-does-the-sweep-first-learn-to-skip-them.md, 260831-0748_*_a-storeless-bracket-marked-citation-is-invisible-while-a-store-prefixed-one-is-reported.md, 260830-1842_*_may-the-grammar-resolve-a-bracket-marked-record-that-a-frozen-store-keeps-permanently.md
**Filed by:** user, Kai Stalmann <ks@qantr.com>

---

## Directive

The user ruled on 260922-1420, against the two records' own recommendation and with the reason stated: make a clean sweep once rather than carrying the class for weeks. `hooks/lib/citation-scan.ts` `BARE_RE` admits `[x]` in the marker position beside `_x_`, `MARKER_SLOT` untouched, so a storeless bracket citation is read exactly as a store-prefixed one already is: found under the wildcard it is `stale-marker`, found nowhere it is `dangling`. The header paragraph that refused this is rewritten to say the stance moved, because its reason was written for workbench filenames while the population that bites is citations inside source files, where no migration ever looks.

Then the tree is swept once, `archive/` included: measured at `f0f4c9c6`, 142 unfenced bracket tokens in 51 files, 125 resolving under the wildcard (37 of them archived) and 17 resolving to nothing. The 17 are repaired by hand, each with the annotation its case asks for. `rules/fusion-workbench-conventions.md` `## Terminal states are history` gains the clause the ruling rests on: that rule governs state, a step marker, a ticked criterion, a head field, and a citation respelled from `[x]-` to `_*_` changes no state, names the same target and is what the sweep already does for spelled underscore markers inside closed records.

Last, `/fusion:migrate` gains the sweep as a closing step, so a consuming project that runs `fusion --update` and then the migration cleans its own corpus in one command instead of discovering the class defect by defect.

A reader knows this is reached when `bin/fusion-citation-check` reads `verdict=clean` with the bracket form being read, `bin/fusion-citation-sweep --repair --dry-run` prints `files=0 repairs=0` over fusion's own tree, no bracket token resolves to nothing without an annotation, `cd hooks && npm test` exits 0, and the migration body names the sweep.
