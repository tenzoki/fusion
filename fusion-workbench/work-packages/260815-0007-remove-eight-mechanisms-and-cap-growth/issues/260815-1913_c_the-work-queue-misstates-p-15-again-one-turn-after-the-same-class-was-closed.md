# The work queue misstates P-15 again, one Turn after the same class was closed

---
**Severity:** Medium — this file is the queue's only durable copy and the check that compared it against git was deleted in the same Turn
**Domain:** data
**Filed by:** reconciler, Phase-3 pass `260815-1913-reconciliation.md`, HEAD `9306f0a`
**Owner:** `orchestrator` — `agentstate.yaml` is session state and no executor writes it
**Affects:** `fusion-workbench/agentstate.yaml`, `current_task` and `work_queue[16]`
**Cross-references:** `260815-1631_*_the-work-queue-misstates-three-of-seventeen-tasks-and-is-now-the-only-durable-copy.md` (the same class, closed at Turn 4); `260815-1848_*_step-14-landed-without-its-done-marker-and-the-issue-that-closed-this-for-three-earlier-steps-did-not-hold.md` (the same shape on the plan's inline markers); commit `f45f76a` (deleted the check)

---

At HEAD `9306f0a` the state file reads:

```yaml
# Updated: 260815-1640

current_task:
  id: "P-15"
  status: "running"

work_queue:
  - {id: "P-15", summary: "Prepare the release", agent: "coder", status: "running"}
```

P-15 landed as `9306f0a` at 18:59:43, and the commit carries `Task: P-15` in its trailer. Three
commits after the `Updated:` stamp are in the range: `e8052e7`, `9cde86c` and `9306f0a`. Sixteen of
the seventeen entries are correct; the seventeenth is the one that finished last.

---

## Why it matters more than a stale field usually would

`dd312eb` deleted the persisted task list, which made `work_queue` in this file the queue's only
durable copy, and `f45f76a` deleted `hooks/lib/state-drift.ts`, whose first row compared this file's
counters against git. Both landed in Turn 4. `260815-1631_*_…` was filed at the Turn-4 review for
exactly this — three of seventeen entries wrong at a gate — and closed by correcting them. The class
recurred four commits later, which is the evidence that correcting instances does not reach it.

The event log has the same gap from the same cause: `orchestrator-events.jsonl` carries
`task_start` for P-15 and no `task_done`, no `turn_end` for Turn 4 and no `coherence_review` for
Turn 4, while Turns 1 to 3 carry all three.

## What would decide it mechanically

The same input `260815-1848_*_…` names for the plan-marker case: every commit whose message carries
`Task: P-<n>` implies that task's `status` is `done` and its `commit` is that hash. Both halves are
already in the trailer convention this Circle used throughout. Whether such a check is worth building
one Circle after eight mechanisms were deleted for never having caught anything is a decision, not a
repair, and this record does not take it.

---

**Reconciliation 260819-1453 (reconciler, Domain `code`, Circle-store pass) — CLOSED on the instance. The class survives on a named carrier, which is the only reason this may close.**

```
ls fusion-workbench/agentstate.yaml
  → No such file or directory
```

The record's subject is two fields in one session-state file — `current_task` and `work_queue[16]` — that were wrong at HEAD `9306f0a`. That file no longer exists: the orchestrator deletes it on clean exit, and every session writes a fresh one. There is nothing left to be wrong, and nothing a later pass could correct. The stale `P-15` entry cannot reproduce because its carrier is ephemeral by design.

**Why this is not the closure pattern this Circle keeps recording as a failure.** The pattern — an obligation recorded only in the document about to be closed, so closing it retires the obligation — is exactly what this record's own last paragraph guards against, and it named its successor before it needed one. The class question, *should a `Task: P-<n>` commit trailer mechanically imply that task's `status` is `done`*, is carried by `260815-1848_*_step-14-landed-without-its-done-marker-and-the-issue-that-closed-this-for-three-earlier-steps-did-not-hold.md`, which states the same input in the same words for the plan-marker case and stays `_o_` at this pass. Measured: `grep -rln 'Task: P-' hooks --include='*.ts'` returns nothing, so no such check exists anywhere in the tree.

The two supporting facts the record cites also stand and are worth carrying forward with the class: `dd312eb` made `work_queue` the queue's only durable copy, and `f45f76a` deleted the check that compared this file against git. Nothing has replaced either.

---
Resolved: the instance is gone with its carrier. `fusion-workbench/agentstate.yaml` does not exist at HEAD `e435f03` — the orchestrator deletes it on clean exit — so the stale `current_task` and `work_queue[16]` entries this record measured at `9306f0a` cannot reproduce. The class question it raises is not closed with it: it is carried by `260815-1848_*_step-14-landed-without-its-done-marker…`, which is open at this pass and states the same mechanical input.
