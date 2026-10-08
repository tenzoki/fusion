Dropping a package leaves its adopted plan in progress
---
Observed in the opt-in suite's case (f) at `b262406d`: the orchestrator dropped package A (outcome class `cancelled`, reason given) and left A's adopted plan at `in_progress`. A dropped package's live plan is a live record under a terminal container, the class the migration reports as `live-record-in-terminal-container`.
---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:** 261007-1836-plan-the-four-open-defects-fixed-before-v13-is-tested.md (step 9)

Evidence: transcript `f-orchestrator.json` and its scratch project under `/private/var/folders/6v/31t6lk3x7yb8wj8pt1gyz93h0000gn/T/fusion-agent-run-VbuGiR/`. The orchestrator named the open plan itself and proposed dropping B as well.

Acceptance: `agents/orchestrator.md` `## Closing a work package` (or the **Drop** row) says what happens to the bound plan when its package is dropped (closed or deferred with a reason), and a re-run of (f) shows the plan record terminal after the drop. Suggested owner: `code-implementer`.

Resolved: `agents/orchestrator.md` `## Work packages`, **Drop** row: the drop now also moves the bound plan (`active_documents`, role `plan`) `--to closed --reason`, citing the drop. Re-run of case (f) on 2026-10-08 passed: A `dropped`, plan `closed`, B `blocked` with an `unmet=` row. Transcript: `/private/var/folders/6v/31t6lk3x7yb8wj8pt1gyz93h0000gn/T/fusion-agent-run-ktKtze/f-orchestrator.json`. Uncommitted at the time of writing; the commit carries the change.
