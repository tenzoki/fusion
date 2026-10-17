# migrate: the stale-record refusal claims except only the legacy fence removal, but `rollback --end-fence` also ends a JSON-control fence over a stale record of this workbench

---
The `migrate.ts` row of `README-hooks.md` `## Files` says a stale record of this workbench "is refused by `run`, `resume` and `rollback` before any write, the fence removal of the --end-fence form below aside". The text below that phrase describes only the removal over a legacy tree. Over a JSON-control tree, `rollback --end-fence` does not refuse such a record. It sends `maintenance end`, writes `state.json` and exits 0. The `bin/fusion-migrate` header's `set-aside` entry uses the same narrow phrase ("the fence removal of --end-fence above aside"), and two lines later the same entry names the same exception differently ("the --end-fence form excepted").
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Severity:** Low
**Cross-references:** `261017-1708-plan-migrate-landed-cell-docs-entry-path-conditions.md`, `261017-1708-migrate-messages-name-end-fence-as-ending-a-fence-it-then-refuses-to-end.md`

**Evidence (read at `c239cdd6`, not reproduced).**
- `hooks/migrate.ts` `endLeftFence`: `idle` and `reset` are null unless `i.state === "legacy"`. The JSON branch then needs only `s.rollback` set, `i.state === "json-control"`, the standing fence equal to `s.rollback.begin_id` and the last rollback chunk not stored. It does not check `stale`, and it does not check for an intent. It calls `endRollbackFence`, which sends `maintenance end` and writes `state.json`.
- `hooks/migrate.ts` `stale`: a record with `s.rollback` set is stale under JSON control when its plan index is missing or at other bytes and rollback chunk 0's answer is neither stored nor pending. One way there is a git operation that keeps a JSON-controlled tree but drops or changes this migration's `archive/migrations/<id>/plan.json` while the ignored `.json-state/maintenance.json` stays. `status` prints `record=stale` there.
- `codec/README.md` `maintenance` table: `end` naming the standing fence `F` "removes `F`". The codec admits the request, so the environment bound ("where the codec answers and admits each request") does not exclude this cell.
- The plan's own cells table lists this cell. Row C7 gives "E4 if the last rollback chunk is not stored", and row C6 overlaps it under JSON control. But the plan's claim check says the refusal claim "holds for all three, with the --end-fence form excepted for C4", which leaves out C7.
- The Undo paragraph of `docs/upgrading-to-v13.md` and the `bin/fusion-migrate` row of `README-hooks.md` except the whole form ("the --end-fence form below aside", "the --end-fence form aside"), so both hold.

**Fix direction.** In both places, except the whole form as the other two passages do: "the --end-fence form aside". In the header's `set-aside` entry, also use one phrase for both exceptions. New words stay unbackticked, so `reference-resolution-lint` stays at its `BASELINE`. No code change.

**Acceptance.** No sentence that claims `run`, `resume` and `rollback` refuse a stale record of this workbench is falsified by the JSON-control branch of `rollback --end-fence`. The header's `set-aside` entry names its --end-fence exception with one phrase.
---
Resolved: 2026-10-17, plan `261017-1823-plan-migrate-docs-defer-conditions-to-status-and-messages.md` step 1. No sentence now claims that `run`, `resume` and `rollback` refuse a stale record: the header's `set-aside` entry, the `migrate.ts` row and the `bin/fusion-migrate` row of the hooks README and the Undo paragraph of the v13 upgrade note state what each command is for and what it never does, and defer which command refuses where to `status` and the message the helper prints. The JSON-control branch of `rollback --end-fence` therefore falsifies none of them, and the `set-aside` entry carries no exception phrase at all. The acceptance is met because the claim was removed, not reworded.
