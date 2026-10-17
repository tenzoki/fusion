# migrate: three messages name `rollback --end-fence` as the way a fence is ended in cells where that command then refuses

---
`endFenceWay` says "`rollback --end-fence` ends it", and `preconditions` says it "ends it once no rollback chunk of that record landed". Both are printed in cells where `rollback --end-fence` refuses: a session that records another workbench path (`recorded` refuses it before the store is read), and, for `run`'s set-aside sibling, a sibling with an intent pending or a sibling the tree still carries. The docs of the 13.1.11 package bound their own sentences around these cells; the messages are code and stay as they are there.
---
**Filed by:** implementation-planner, Kai Stalmann <ks@qantr.com>
**Severity:** Low
**Cross-references:** `261017-1637-migrate-end-fence-landed-clause-promises-the-message-for-a-session-recorded-for-another-workbench-path.md`, `261017-1637-migrate-undo-note-names-end-fence-for-an-undo-cut-mid-chunk-where-an-intent-pending-makes-it-refuse.md`, `261016-1436-how-is-a-rollback-fence-ended-that-a-git-reset-left-standing-over-a-legacy-tree.md`

**Evidence (read at `0f2e098e`, not reproduced).**
- `hooks/migrate.ts` `setAside` reads the session with `readState`, never `recorded`. For a record kept for another workbench path, `stale` returns its first reason, and where the record's own fence stands idle over a legacy tree, `idleFence` holds and the refusal is `endFenceWay`: "… `rollback --end-fence` ends it". `rollback --end-fence` over that session calls `recorded` first and exits 5 with "<session> records <old path>, not <new path>".
- `hooks/migrate.ts` `run` calls `current` on the previous record without `recorded`. The same cell gives "The way out: first, … `rollback --end-fence` ends it; then … `set-aside --consent` …", and the first step refuses as above.
- `hooks/migrate.ts` `preconditions`, the sibling branch: where `landedFence` is null, the message is "the record set aside in <dir> began it: `rollback --end-fence --session <dir>` ends it once no rollback chunk of that record landed, then run again". `landedFence` is null also when an intent is pending, when the sibling is not stale, and when the sibling records another path. In each of these, `endLeftFence` (or `recorded` before it) refuses, though no rollback chunk landed.

**Reach.** A moved session needs an explicit `--session` after the workbench's real path changed. The intent cell needs an undo cut mid-chunk followed by a reset, with the record set aside. Each refusal that follows is accurate and writes nothing; only the way out each message names is wrong.

**Fix direction.** Name `rollback --end-fence` only where its own checks would pass on the record they name: put `recorded`'s comparison in front of `idleFence` in `setAside` and `current` (or name the moved session's refusal instead), and give the sibling branch of `preconditions` the same gate `endLeftFence` applies (stale, `idleFence`). Each message, condition and exit code that moves needs a test row in `migrate.test.ts`, and `bin/fusion-migrate`'s header and the two `README-hooks.md` rows follow the code.

**Acceptance.** No message of `hooks/migrate.ts` names `rollback --end-fence` as ending a fence in a cell where that command then refuses. The moved-session cell and the intent-pending sibling are each pinned by a test.
