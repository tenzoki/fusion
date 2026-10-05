The migration's kept originals collide with the migrated records in the uniqueness lint and the citation checker
---
After a migration, `archive/migrations/<id>/originals/` holds every converted record under its original basename, beside the rewritten narrative in the live tree. The basename-uniqueness lint and the citation checker walk `archive/` with no exclusion, so each migrated record resolves twice.
---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:** 261004-2212_*_plan-fj03d-rules-prompts-and-live-predicates-switched-with-this-workbench-in-one-window.md, 261005-1042_*_do-the-migrations-originals-leave-the-uniqueness-scope-or-get-names-that-do-not-collide.md

Found by FJ03d step 11, the rehearsal on a migrated copy of this workbench, at `fj03d` `29dac3c5` merged with `12a3ebe8`.

Evidence, as the rehearsal reported it:

- `hooks/lib/__tests__/workbench-citation-lint.test.ts`, case "no two stamped artifacts share a marker-normalised basename, archive/ included": 123 collisions, the 104 stamped records plus 19 package narratives of the 147 converted records. It is the one unexpected red of the hook suite on the migrated copy (1 131 of 1 133; the other red is the known monitor case).
- `bin/fusion-citation-check` on the migrated copy: `conflict=2392`, `edited-violations=276`, `verdict=violations`, exit 0. 2 016 of the conflicts name an `originals/` path as the second match.
- No exemption for `archive/migrations` exists in `hooks/lib/citation-corpus.ts`, `hooks/lib/citation-grammar.ts` or `rules/fusion-workbench-conventions.md` on the side branch.
- The rehearsal tree is kept at `/private/tmp/claude-501/-Users-kai-Projects-productive-F04-FUSION-fusion/2c005d1b-478f-4a9d-8802-46d366b3d8e8/scratchpad/fj03d-rehearsal/reh`, evidence files beside it in `evidence/`. A temporary directory: it does not outlive a cleanup of `/private/tmp`.

Acceptance: on a migrated copy of this workbench the full hook suite is green apart from the known monitor case, and `bin/fusion-citation-check` reports no conflict whose second match is a migration original. Which of the two routes achieves that is the decision cited above. This blocks FJ03d step 11 and with it the window.

---
Resolved: fj03d `0906bb36` — `isMigrationOriginal()` in `hooks/lib/citation-corpus.ts` is the one exclusion; `workbenchIndex()` and the new `workbenchMarkdownFiles()` in `hooks/lib/citation-scan.ts` apply it, so the lint, the checker and the sweep no longer read `archive/migrations/<id>/originals/`. Shown red before the fix in three cases (lint, checker, sweep). On a copy of the migrated rehearsal tree the uniqueness case finds 0 collisions (123 before) and the checker names no original; hooks 1 134 of 1 135 there, the red being the known monitor case. Verified by the orchestrator in the worktree: hooks 1 130 of 1 135, the reds being the four legacy own-tree cases and the monitor case; no file under `codec/` changed, bundle `c76bbce9…`. The checker still prints `verdict=violations` on the migrated copy from other causes, filed as 261005-1107.
