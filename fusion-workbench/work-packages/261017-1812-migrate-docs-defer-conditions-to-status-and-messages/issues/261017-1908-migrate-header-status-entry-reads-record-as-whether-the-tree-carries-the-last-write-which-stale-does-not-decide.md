# migrate: the header's `status` entry reads `record=` as "whether the tree carries the record's last write", but `stale` decides only one direction of that

---
The `bin/fusion-migrate` header's `status` entry was not changed in 13.1.12. It says: "where the recorded run stands, and with record= whether the tree carries the record's last write." That makes `record=current` mean the tree carries the last write. `stale` does not decide that. Its own comment says "It does not say the tree matches the record: a reset of an uncommitted migration leaves the plan files and reads current." The 13.1.12 texts now state only the direction `stale` decides. The README rows and the Undo paragraph say `record=stale` "means the session's record and the tree disagree", and the plan's row S says "never the converse". The header's `status` entry is now the one text that still states the converse, and it sits in the same header as the rewritten entries.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Severity:** Low
**Cross-references:** `261017-1823-plan-migrate-docs-defer-conditions-to-status-and-messages.md`, `261017-1823-migrate-ts-header-session-section-restates-the-refusal-claims-the-docs-no-longer-carry.md`

**Evidence (read at `d825345e`).**
- `bin/fusion-migrate` header, the `status` entry: "and with record= whether the tree carries the record's last write".
- `hooks/migrate.ts` `stale`, the doc comment: "It does not say the tree matches the record … Only positive contradictions count, … and a rolled-back record is never stale."
- `hooks/migrate.ts` `status`: `record=${stale(...) === null ? "current" : "stale"}`.
- `README-hooks.md` `migrate.ts` and `bin/fusion-migrate` rows, `docs/upgrading-to-v13.md` Undo: "`record=stale` … means the session's record and the tree disagree".
- Related, and not part of this issue: the `set-aside` refusal message in `setAside` says "this tree carries it (record=current)". That is a message string, so changing it is a code change.

**Fix direction.** Word the entry in the direction `stale` decides, for example: "where the recorded run stands, and with record=stale that the session's record and the tree disagree." Keep the new words unbackticked so `reference-resolution-lint` stays at its `BASELINE`. Comment line only.

**Acceptance.** No text in the `bin/fusion-migrate` header says that `record=current` means the tree carries the record's last write, and the `status` entry uses the same wording for `record=stale` as the README rows and the Undo paragraph.

---
Resolved: 2026-10-23 by code-implementer (plan 261017-2030-plan-migrate-code-issues-end-fence-suggestion-foreign-session-later-chunk.md, step 7). The `status` entry of the `bin/fusion-migrate` header now reads "where the recorded run stands, and with record=stale that the session's record and the tree disagree.", so no header text reads `record=current` as the tree carrying the last write. Comment lines only.
