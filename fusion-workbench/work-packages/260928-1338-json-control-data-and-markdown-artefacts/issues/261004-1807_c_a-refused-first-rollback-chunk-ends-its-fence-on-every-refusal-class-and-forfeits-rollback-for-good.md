A refused first rollback chunk ends its fence on every refusal class and forfeits rollback for good
---
`rollback()` in `hooks/migrate.ts` calls `endRefusedFence` whenever the first rollback chunk after activation exits `EXIT.refused`, whatever the refusal's class and reason. The stored `begin`/`end` pair it leaves is a later operation to the codec's audit (`laterOperations`, `audit` in `codec/src/migration.ts`), so every later rollback of that migration refuses. That cost is right for an audit refusal, where ordinary work was already stored. It is wrong for a refusal that a retry or a file restore would clear, and the texts state the cost too narrowly.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** 261004-1516_*_a-refused-rollback-after-activation-leaves-its-fence-standing-and-no-helper-ends-it.md, 261004-1807-reviewer-fj04-closing-pass-over-the-legacy-migration.md

**Evidence** (at `9232314a`).
- `send()` maps every codec refusal to `EXIT.refused` (`hooks/migrate.ts`, `send`). The catch in `rollback()` tests only `e.code !== EXIT.refused || i.state !== "json-control"`.
- Refusals of the first post-activation chunk that a retry or a restore would clear: `conflict/lock-timeout` (`codec/src/store.ts`, the write lock not released in time; `codec/src/kernel.ts`, no consistent read); `migration-incomplete/receipt-unverified` (`receiptHolds`: a receipt file deleted or edited by hand, restorable from git); `conflict/after-state-changed` raised by the activated-tree comparison (`migrationRollback`, `inventoryDigest(actual) !== held.value.after`) for a narrative edit with no codec operation.
- Inference, from `exemptSet` and `audit`: once the helper's own `begin`/`end` pair is stored, each later attempt finds two maintenance answers outside the exempt set and refuses `after-state-changed`, however the store was repaired.
- The texts: issue 261004-1516's `Resolved:` note says "the only case newly lost is a hand-reverted change with no codec operation"; `bin/fusion-migrate`'s header and the `endRefusedFence` stderr say only that later rollbacks refuse. `REQUESTS.md` line 2396 says "Work since activation had already decided that", which holds for the audit case alone.

**Acceptance.** The helper ends the fence only for a refusal that no retry or restore can clear: the audit's, or another class the implementer names and justifies. On any other refusal it leaves the fence, exits 8, and names the one command that ends it, as the issue's second acceptance arm already allowed. A `migrate.test.ts` case shows a refusal of the remediable kind (an edited narrative, for example) leaving the rollback possible after the restore. Wherever the cost is stated, the statement names every refusal class that triggers it.

**Resolved (2026-10-04).** The host ends the fence only when stored work since the plan forbids rollback (`workSincePlan`); otherwise the fence stays, exit 8, and stderr names `rollback` after the cause is reverted or the new `rollback --end-fence` (`4b24d595`). Tests for work-since, an edited narrative and a deleted receipt. Resolved by the commits named, closed by the commit that renames this record to `_c_`.
