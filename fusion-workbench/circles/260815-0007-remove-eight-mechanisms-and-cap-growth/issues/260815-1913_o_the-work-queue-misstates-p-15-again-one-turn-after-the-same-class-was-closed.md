# The work queue misstates P-15 again, one Turn after the same class was closed

---
**Severity:** Medium — this file is the queue's only durable copy and the check that compared it against git was deleted in the same Turn
**Domain:** data
**Filed by:** reconciler, Phase-3 pass `history/260815-1913-reconciliation.md`, HEAD `9306f0a`
**Owner:** `orchestrator` — `agentstate.yaml` is session state and no executor writes it
**Affects:** `fusion-workbench/agentstate.yaml`, `current_task` and `work_queue[16]`
**Cross-references:** `issues/260815-1631_c_the-work-queue-misstates-three-of-seventeen-tasks-and-is-now-the-only-durable-copy.md` (the same class, closed at Turn 4); `issues/260815-1848_o_step-14-landed-without-its-done-marker-and-the-issue-that-closed-this-for-three-earlier-steps-did-not-hold.md` (the same shape on the plan's inline markers); commit `f45f76a` (deleted the check)

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
counters against git. Both landed in Turn 4. `260815-1631_c_…` was filed at the Turn-4 review for
exactly this — three of seventeen entries wrong at a gate — and closed by correcting them. The class
recurred four commits later, which is the evidence that correcting instances does not reach it.

The event log has the same gap from the same cause: `orchestrator-events.jsonl` carries
`task_start` for P-15 and no `task_done`, no `turn_end` for Turn 4 and no `coherence_review` for
Turn 4, while Turns 1 to 3 carry all three.

## What would decide it mechanically

The same input `260815-1848_o_…` names for the plan-marker case: every commit whose message carries
`Task: P-<n>` implies that task's `status` is `done` and its `commit` is that hash. Both halves are
already in the trailer convention this Circle used throughout. Whether such a check is worth building
one Circle after eight mechanisms were deleted for never having caught anything is a decision, not a
repair, and this record does not take it.
