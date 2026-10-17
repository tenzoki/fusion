migrate: the landed clause for `rollback --end-fence` promises its message to a session recorded for another workbench path, which `recorded` refuses first
---
The `bin/fusion-migrate` header and the `migrate.ts` row of `README-hooks.md` say that where five conditions hold, `rollback --end-fence` names the landed chunks. "The record is stale" includes `stale`'s first reason, a record kept for another workbench. `rollback` calls `recorded` before `endLeftFence`, and `recorded` refuses that session with "records X, not Y". So a cell meets all five conditions and gets a different message.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Severity:** Low
**Cross-references:** `261017-1637-reviewer-closing-pass-over-the-migrate-landed-cell-docs-stale-condition-package.md`, `261017-1610-plan-migrate-landed-cell-docs-stale-condition.md`, `261017-1049-migrate-landed-cell-docs-drop-the-stale-condition-so-an-interrupted-rollback-meets-their-premise.md`

**Evidence (at `2615df08`).**
- `bin/fusion-migrate` header, `rollback --end-fence` entry: "Where the record is stale, the fence is the one its rollback began, rollback chunks of it are stored, no intent is pending and the tree reads as legacy Markdown (a git reset is one way there), it names those chunks …".
- `README-hooks.md` `## Files`, the `migrate.ts` row: "where the record is stale, the fence is the one the record's own rollback began, chunks of that rollback landed, no intent is pending and the tree reads as legacy Markdown (a git reset is one way there), its refusal names them …". "its" is `rollback --end-fence`.
- `hooks/migrate.ts` `rollback`: `const s = recorded(wb, session); if (endFence) return endLeftFence(wb, session, s);`. `recorded` throws `${session} records ${s.workbench}, not ${wb}` when `s.workbench !== wb`.
- `hooks/migrate.ts` `stale`: its first line returns `the record is kept for ${s.workbench}` on the same inequality. `status` then prints `record=stale`.
- Reproduced in a scratch clone with `migrate.test.ts`'s "cell A reset with git" setup: the project directory renamed after the reset, then every call given `--session` at the moved session. `status` read `state=legacy`, a fence, `record=stale`. The fence was the record's `rollback.begin_id`, chunk 2's answer was stored, and `journal/` was empty. All five conditions held. `rollback --end-fence` exited 5 with "… records <old path>/fusion-workbench, not <new path>/fusion-workbench" and named no chunk. `set-aside` over the same session printed the landed message, so `docs/upgrading-to-v13.md` `**Undo.**`, which says "the helper says so" in the set-aside context, stays true.
- The same `recorded` check also stands in front of the README's idle-fence clause ("… `rollback --end-fence` removes that fence itself"), which is a sufficient-condition claim too. The header's idle sentence says "only when" and stays true. That README clause is ruling-owned (`261016-1436-how-is-a-rollback-fence-ended-that-a-git-reset-left-standing-over-a-legacy-tree.md`). It is named here so the fix can decide whether to touch it.

**Reach.** A session reaches this only through an explicit `--session` after the workbench's real path changed, because the default session directory is keyed by that path. The refusal it gets is accurate and writes nothing. Only the description is wrong.

**Fix direction.** Bound the landed clause to a session recorded for this workbench. In substance: "Where the record, kept for this workbench, is stale, …". Or name `recorded`'s refusal as the one that comes first. Keep the new words unbackticked so `reference-resolution-lint` stays at its `BASELINE`. No code change.

**Acceptance.** No cell that meets the stated premise of the header's or the README row's landed clause gets a message other than the landed one from `rollback --end-fence`. The moved-session cell above is either excluded by the wording or named. `reference-resolution-lint` passes with no edit to `BASELINE`.
