codec/README.md says a complete rollback leaves an empty `originals/` tree, which a record-less migration never creates
---
After a record-less migration is rolled back, the directories left under `archive/migrations/<id>/` are `chunks/` and `parts/` only. The README says "exactly" these plus `originals/`.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>

**Severity:** Low. Scope: `codec/README.md` `## \`migration\``, the bullet "**No directory is removed.**" (Prior reads this file as part of the contract text).

**Evidence.**

- `codec/README.md`, that bullet: "A complete rollback leaves the frozen input plus exactly these empty directories: `archive/` and `archive/migrations/` where the input lacked them, and `archive/migrations/<id>/` with its `chunks/`, `parts/` and `originals/` trees."
- `hooks/lib/__tests__/migrate.test.ts`, the case "survey counts 0, run reaches json-control in one chunk …" (`7ab72901`), asserts that the directories under `archive` after rollback are exactly `archive`, `archive/migrations`, `archive/migrations/<id>`, `…/chunks` and `…/parts`. No `originals`.
- Reproduced in a scratch root with `bin/fusion-migrate run`, `rollback` and `run`. Each migration id leaves `chunks/` and `parts/` and nothing else.

`e14cf44d` edited the `plan` and `apply` paragraphs of this section for the record-less case and left this bullet as it was.

**Fix direction.** Make `originals/` conditional ("and `originals/` when the plan backed up a narrative"), or drop "exactly".

**Acceptance test.** The bullet matches the directory set the `migrate.test.ts` case asserts for a record-less run, and is still true for a run with pairs. `cd hooks && npm test` is green (the reference lint reads this file).

---
Resolved: `codec/README.md` `## \`migration\``, the "No directory is removed" bullet, now names `chunks/` and `parts/` and adds `originals/` only "where a chunk kept an original (never in a record-less run)". Measured in scratch roots with `bin/fusion-migrate run` then `rollback`: a terminal-only tree leaves `chunks/` and `parts/` only, and a tree with one live issue also leaves `originals/shared/issues/`.
