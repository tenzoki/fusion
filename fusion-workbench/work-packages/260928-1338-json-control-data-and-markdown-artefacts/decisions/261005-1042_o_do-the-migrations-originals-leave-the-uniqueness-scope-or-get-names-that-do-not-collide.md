# Do the migration's originals leave the uniqueness scope, or get names that do not collide?

---
**Domain:** code
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:** 261005-1042_*_the-migrations-kept-originals-collide-with-the-migrated-records-in-the-uniqueness-lint-and-the-citation-checker.md, 261004-2212_*_plan-fj03d-rules-prompts-and-live-predicates-switched-with-this-workbench-in-one-window.md

---

## Question

The migration keeps each converted record's original under `archive/migrations/<id>/originals/` with its basename unchanged. The uniqueness lint and the citation checker read all of `archive/`, so every migrated record resolves to two files and the rehearsal's hook suite is red. The fix has two routes, and they change different things. It has to be chosen before FJ03d step 11 can be repeated.

## Options

1. **The originals leave the scope** — the citation corpus, the uniqueness lint and the checker exclude `archive/migrations/*/originals/`, and the conventions rule says so.
   - Pros: changes only `hooks/` readers and one rule sentence on the side branch; the migration's output, its receipt and its hashes stay as FJ04 proved and Prior qualified them.
   - Cons: one more path-keyed exclusion in the corpus predicate; a citation can no longer resolve to an original, so the originals are reachable only through the receipt.
2. **The originals get names that do not collide** — the migration writes them under a changed name (a suffix, or a content-addressed name the receipt maps).
   - Pros: no exclusion; "one basename, one file" holds over the whole tree without an exception.
   - Cons: changes what the migration writes, so FJ04's proof on copies and the receipt's hash checks have to be re-run; inference: `rollback` restores from these originals by path and would need the mapping too (not verified).

## Constraints

No byte of `codec/dist/fusion-record.js` moves (the plan's stop condition). Workbenches already migrated by FJ04's proofs exist only as copies, so neither option has to read an existing migrated workbench in the other form.

## Recommendation

Option 1. It leaves the migration as it was proven, and the originals are a rollback store, not records anybody cites.
