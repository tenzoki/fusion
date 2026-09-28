Migrate's UNKNOWN check greps file text and stops on notes that merely mention an old store
---
`/fusion:migrate` Step 2 classifies every entry at the workbench root and under `shared/` through one `case`. Its fallback arm (`skills/migrate/SKILL.md:73`) runs `grep -rqE 'circles/|planning/|consult/'` over the entry's *content* and counts a hit as `UNKNOWN`, which stops the pass before the question (`:96`, `:106`). The test reads text rather than layout. So a note that only mentions an old path in prose stops the migration, while a genuinely misplaced legacy store directory is caught only if some file inside it happens to spell the path. The remedy the skill names ("this workflow's classification gains a row", `:106`) cannot apply to project-owned entries, whose names only the consuming project knows. Found in a consultation on a consuming project's v12 migration.
---
**Filed by:** consultant, Kai Stalmann <ks@qantr.com>

**Evidence (consuming project axibra, plugin 12.0.0, reported by the user 2026-09-28):**

The survey stopped with `UNKNOWN=3` on three entries, none of them a store:

- `.pause-snapshots/`: one tracked resume note whose shell commands spell old store paths.
- `shared/boilerplates/`: 14 tracked files, one of which names `circles/` three times inside `ls` commands quoted as evidence.
- `tasklist.md` at the workbench root: old store names in running prose.

The pass renames directories and never opens a file (`skills/migrate/SKILL.md:16`, `:166`), so none of the three could be affected by the migration either way. The stop was pure friction, and the user had to rule on a class the pass had no use for.

**Where the fix should go (inference, for `code-implementer`, not a plan):** decide `UNKNOWN` by structure. An unclassified entry is `UNKNOWN` only if it is itself, or directly contains, a directory named `circles`, `planning` or `consult`. Otherwise it is `UNCLASSIFIED` and left, as `:73`'s else-arm already does for entries with no hit. A content grep, if kept at all, becomes an informational line, not a stop.

**Acceptance test:** a fixture workbench whose root carries a tracked `tasklist.md` and a `shared/<x>/notes.md` both mentioning `circles/` in prose surveys with `UNKNOWN=0` and reaches the question. A fixture carrying `shared/<x>/planning/` surveys with `UNKNOWN=1`. `npm test` stays green.

**Resolved:** 2026-09-28, code-implementer. Step 2's fallback arm now decides `UNKNOWN` by layout: `find "$e" -maxdepth 1 -type d` for a `circles`, `planning` or `consult` directory (the entry itself or a direct child); no file text is read, so prose mentions are `UNCLASSIFIED`. The counter table, the class paragraph and the `UNKNOWN>0` remedy (move the misplaced store by hand, run again) follow. Pinned by `hooks/lib/__tests__/store-name-migration.test.ts` "decides UNKNOWN by layout", which fails against HEAD's skill; golden regenerated, `npm test` green.
