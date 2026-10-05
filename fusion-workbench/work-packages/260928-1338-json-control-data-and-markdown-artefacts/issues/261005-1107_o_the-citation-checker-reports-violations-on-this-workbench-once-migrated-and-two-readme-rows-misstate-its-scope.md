The citation checker reports violations on this workbench once migrated, and two README rows misstate its scope
---
On a migrated copy of this workbench, `bin/fusion-citation-check` at `fj03d` `0906bb36` exits 0 with `conflict=411`, `edited-violations=2`, `dangling=306`, `store-prefixed=405`, `verdict=violations`. The installed 12.2.1 checker reports `verdict=clean` on the same workbench before migration. None of the 411 conflicts names a migration original.
---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:** 261005-1042_*_the-migrations-kept-originals-collide-with-the-migrated-records-in-the-uniqueness-lint-and-the-citation-checker.md, 261004-2212_*_plan-fj03d-rules-prompts-and-live-predicates-switched-with-this-workbench-in-one-window.md

The conflicts, as the fix dispatch reported them:

- 165 bare package names that exist live and in an archive sweep (the guard-bash-inspection package of stamp 260801 1244 is one, live and under the safe-cleanup-scoped archive sweep).
- 237 truncated prefixes that match several records of one stamp: a stamp, the wildcarded marker and no slug.
- 9 more of the second kind in another spelling: a stamp and one underscore.

The two that hold `verdict=violations` are of the second kind: `hooks/review-coverage.ts:54` (a slug-less token of stamp 260810 0710, 2 matches) and line 210 of the spec `260922-1106_*_spec-prior-nomenclature-consumer-migration.md` (a slug-less token of stamp 260922 1059, 7 matches). The example tokens are named in words here on purpose: spelled out, each was itself counted as a conflict in this open record.

Not established: whether the difference from `verdict=clean` comes from the migration, from step 8's move of liveness onto the record index, or from the checker's edited-file window. The evidence is the checker's output on the scratch copy `scratchpad/fix-acc2/reh` of the session `2c005d1b-478f-4a9d-8802-46d366b3d8e8`, a temporary directory.

Second defect, same reader: `README-hooks.md` on `fj03d` says in the rows for `citation-check.ts` and `bin/fusion-citation-check` that the frozen stores are read "exactly like the live tree", which `0906bb36` made untrue for `archive/migrations/<id>/originals/`.

Acceptance: the cause of the changed verdict is named, and either the checker prints `verdict=clean` on a migrated copy of this workbench or the remaining conflicts are ruled acceptable and the upgrade document says what a migrated project will see; the two README rows state the exclusion. Step 15 of the plan runs this checker on the real workbench, so the answer is needed before the window.

Cause named 2026-10-05, analysis `261005-1220-why-the-citation-checkers-verdict-changes-on-the-migrated-workbench.md`: the migration contributes nothing. Since FJ03b step 3 (`bf3aea49`) the reporter counts an ambiguous token of a gated kind as a `conflict` that `verdict=` reads, on a JSON-controlled workbench only; 12.2.1 leaves the same hits under `undecidable=`. `dangling` and `store-prefixed` are equal before and after. The blocking citation lint still counts an ambiguous token as resolved, so reporter and lint no longer share one definition of a violation. Which way the remaining acceptance half goes (repair the edited rows, narrow the rule, or accept the verdict) is with the user.
