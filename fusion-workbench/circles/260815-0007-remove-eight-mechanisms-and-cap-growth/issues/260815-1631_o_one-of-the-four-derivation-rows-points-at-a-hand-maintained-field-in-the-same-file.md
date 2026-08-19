One of the four derivation rows points at a hand-maintained field in the same file, which is the property the removal was for

---

The derivation table at `agents/orchestrator.md:1013-1018` promises, for each removed counter, a
replacement read from "a record that cannot silently freeze". Three of the four rows deliver that.
The fourth points at `work_queue` in `agentstate.yaml` — a hand-maintained field, in the same file,
written at the same boundaries, with the same failure mode. It is currently frozen wrong.

---

## The table as written

`agents/orchestrator.md:1011` states the criterion:

> `turn`, `max_turns`, `tasks_total`, `tasks_done`, `tasks_skipped`, `tasks_errored` and `commits`
> were hand-maintained numbers, written at boundaries a session can pass without writing them, and
> every one of them is **derivable at read time** from a record that cannot silently freeze

| Row | Reads from | Can it freeze? |
|---|---|---|
| `progress.commits` | `git rev-list --count <anchor>..HEAD` | no — git |
| `progress.turn` | `turn_start` events in `orchestrator-events.jsonl` | no — append-only log |
| `progress.max_turns` | `bin/fusion-turn-budget` | no — computed from config |
| `progress.tasks_total` / `_done` / `_skipped` / `_errored` | **the `status` field of the `work_queue` entries in this same file** | **yes** |

`work_queue` is written by the orchestrator by hand, at "Task completes" and "Task errors" in the
write-point table (`:1032-1034`) — the same class of boundary, in the same file, that the seven
counters were removed for being written at. Substituting it for four counters replaces four
freezable numbers with one freezable list. The row is not wrong about where the numbers now come
from; it is wrong that the source satisfies the criterion the sentence above it states.

## It is not hypothetical

The live file has P-7 and P-8 at `status: "running"` though both landed in Turn 3 (`a17cc8c`,
`7260bbc`) — see `260815-1631_o_the-work-queue-misstates-three-of-seventeen-tasks-and-is-now-the-only-durable-copy.md`.
Derived through this row, `tasks_done` reads 10; the event log holds 12 `task_done` events for
this session's plan tasks. The freeze the removal set out to end is reachable through the
replacement it named, and the un-freezable record that would have answered correctly is the one the
row above it already uses.

## Two further gaps in the same row

- `work_queue`'s status vocabulary (`:1002`) includes `deferred`, which no removed counter covered
  and which the row does not mention. A deferred task is counted in `tasks_total` and in nothing
  else.
- The `## State Tracking` list at `:948-949` still declares `tasks_skipped` and `tasks_errored` as
  in-memory counters. That is a different surface and is **not** a defect — but a reader arriving at
  `:948` before `:1017` sees two live counters with the names the table calls removed, and nothing
  at `:948` says which is which.

## What is not being claimed

There may be no un-freezable record for per-task status: the event log carries `task_done` with a
commit hash and could answer `tasks_done` the way it answers `turn`, but `queued` and `deferred`
have no event. Whether the row should point at the event log, or the criterion should be stated
narrowly for this row, is a design question this record does not pre-empt. The defect is that the
sentence and the row disagree.


---

**Reconciliation 260819-1453 (reconciler, Domain `code`, Circle-store pass) — STAYS `_o_`. Re-measured at HEAD `e435f03` (v10.3.0). Unchanged.**

`agents/orchestrator.md:1053` still states the criterion — *"it holds no counts … every one of them is **derivable at read time** from a record that cannot silently freeze"* — and `:1059` still derives `progress.tasks_total`/`_done`/`_skipped`/`_errored` from *"the `status` field of the `work_queue` entries in this same file"*. That substitutes four freezable counters for one freezable hand-maintained list in the same file, under a criterion that exists to forbid exactly that.

The live instance is absent only because `agentstate.yaml` is deleted at clean exit; the row is prompt text and is written afresh every session. Three of the four derivation rows point outside the file (git, the event log); this one does not.
