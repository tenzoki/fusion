The gate clause names no answer for the plan-review row, so the `<decision>` half of its `gate_response` is unspecified
---
`agents/orchestrator.md` `### Shaping and planning, when the task needs them` item 5 (line 233 at `8ef78ffc`) sends the reader to `## Human Gate Rules` for "the answer the field gives". The clause there (line 379) says of that row only "*Planner produced a plan* (the claimed item's field)". The stop-conditions row in the same clause spells its answer ("closure proceeds unasked"); the plan row does not. The `gate_response` row of `### Structured Event Log` (line 571) requires a literal `<decision>` in the detail, the plan gate's options are Approve/Modify/Cancel, and the event row's vocabulary is proceed/skip/defer/modify, so the reader picks both the answer and its spelling.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260921-0842_*_how-does-a-work-item-tell-the-orchestrator-to-work-it-without-asking.md, 260921-1035-reviewer-mode-autonomous-field-against-its-decision.md

Severity: Low. Scope: `agents/orchestrator.md` line 379; the same paragraph as `260921-1035_*_the-gate-clause-says-the-four-excluded-rows-stop-as-written-and-then-file-skip-and-go-on-with-no-event-named.md`, one edit can close both.

Acceptance: the plan row of the clause names its answer (`Approve`) and the detail the `gate_response` carries for it. `cd hooks && npm test` green.

---
Resolved: The plan row now answers `Approve` with detail `Approve — answered by **Mode:** autonomous on <container>`; the claim and finish answer `proceed —`; the stop-conditions row points at the per-clause shape of `## Closing a work item` step 3. Fixed in the commit that carries this line; concept accepted by a consultant read.
