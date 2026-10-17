# migrate: the header's `rollback --end-fence` entry says it "removes no other file of the workbench" without the "itself" its JSON branch needs

---
The 13.1.12 `bin/fusion-migrate` header says of `rollback --end-fence`: "It ends no other fence and removes no other file of the workbench, and it removes that one only where no rollback chunk of the record is stored." The `migrate.ts` row of `README-hooks.md` and the Undo paragraph of `docs/upgrading-to-v13.md` qualify the same claim with "itself", and the plan's invariant row I1 says "itself" is part of the claim because on the JSON branch the codec does the removal. The header's sentence covers both branches and has no "itself". On the JSON branch the codec's `maintenance end` removes its own `.json-state/write.lock` when it releases it, and when it takes the lock it sweeps takeover claims and temp files older than the stale bound that other writers left. So the sentence is false on that branch.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Severity:** Low
**Cross-references:** `261017-1823-plan-migrate-docs-defer-conditions-to-status-and-messages.md`

**Evidence (read at `d825345e`).**
- `bin/fusion-migrate` header, the `rollback --end-fence` entry: "by removing .json-state/maintenance.json itself. It ends no other fence and removes no other file of the workbench, and it removes that one only where …".
- `hooks/migrate.ts` `endLeftFence`, JSON branch: `endRollbackFence`, which sends `{op: "maintenance", action: "end", fence}`.
- `codec/src/store.ts` `hold`: on taking the lock it unlinks `write.lock.takeover.*` claims on other lock instances, and `.*.tmp` files older than `LOCK_STALE_MS`. `releaseLock` unlinks `write.lock`. `codec/README.md` `## The kernel and the journal`: every mutation takes the write lock and sweeps the transient entries of `.json-state/journal/` and `.json-state/ops/`.
- `README-hooks.md` `migrate.ts` row: "the one workbench file --end-fence removes itself". `docs/upgrading-to-v13.md` Undo: "That command removes no file itself but".

**Fix direction.** Add "itself" to the header sentence: "It ends no other fence and itself removes no other file of the workbench". No new path, anchor or stamp token, so `reference-resolution-lint` stays at its `BASELINE`. Comment line only. No code change.

**Acceptance.** The header's removal claim for `rollback --end-fence` carries the same "itself" qualifier as the README row and the Undo paragraph, and `bin/fusion-migrate` differs only in that comment line.
