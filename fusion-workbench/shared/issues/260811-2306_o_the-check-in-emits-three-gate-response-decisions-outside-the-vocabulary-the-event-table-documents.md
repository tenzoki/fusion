# The check-in emits three `gate_response` decisions outside the vocabulary the event table documents

---

**Severity:** Low — the event log gains values its own schema table does not list
**Domain:** code
**Filed by:** coderev (review of `e3da397..a6b4928`, Turn 5)
**Affects:** `agents/orchestrator.md:1301` (the `gate_response` row), `agents/orchestrator.md:631`

---

## What is wrong

Two small mismatches at the new gate, both in `500f51f`.

**1. The decision vocabulary.** `agents/orchestrator.md:1301` documents the event:

> `| gate_response | User responded to gate | Decision (proceed/skip/defer/modify) |`

Those four are the standard gate's options (`:955`). The Unresolved-budget check-in emits `gate_response` with one of **Continue / Stop here / Continue without check-ins** (`:627`–`:629`), none of which is in that list. The Rebalance gate avoided this by emitting its own `rebalance_*` events instead; the check-in reuses `gate_response` and widens its detail field without saying so in the table.

Nothing machine-reads the decision value today — `bin/monitor:1046` maps only the event *type* — so this is a documentation defect and not a broken consumer. It is worth closing because the event table is where a future consumer would go to learn the value set.

**2. "either way" for a three-option gate.** `:631` reads:

> Emit `gate_response` with the choice **either way**.

There are three choices. The phrase is inherited from a binary gate.

## Fix direction

Extend the `:1301` detail cell to name the check-in's three values alongside the standard four, or state that the value set is per-gate and the table lists only the standard gate's. Replace "either way" at `:631` with "whichever the user chose".

## Acceptance criteria

- Every value the prompt instructs an agent to write into a `gate_response` is reachable from the event-type table.

---
**Reconciliation 260817-1836** (reconciler, domain `code`). Re-verified reproducible at HEAD `2552586`: `agents/orchestrator.md:1200` still documents `gate_response` as proceed/skip/defer/modify, while the check-in at `:650-651` emits Continue, Stop here, and Continue without check-ins. Marker stays open. Log: `shared/history/260817-1836-reconciliation.md`.
