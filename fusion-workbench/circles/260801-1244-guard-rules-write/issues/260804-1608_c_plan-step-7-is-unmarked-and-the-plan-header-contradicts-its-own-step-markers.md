# Plan Step 7 carries no `[DONE]` marker and the plan header contradicts its own step markers

---

**Severity:** Low
**Domain:** code (process tracking)
**Filed by:** analyst, independent assessment A1 of C5b
**Affects:** `circles/260801-1244-guard-rules-write/planning/260802-1856_o_plan-guard-rules-write.md` — the `**Status:**` header line and the Step 7 heading
**Cross-references:**
`rules/fusion-workbench-conventions.md` `## Inline State Tracking` (the mandatory marking),
`circles/260801-1244-guard-rules-write/analyses/260804-1600-c5b-independent-assessment.md`,
`circles/260801-1244-guard-rules-write/history/260804-1502-ontocoder-step7-guard-config-template.md`

---

## What is wrong

Two inconsistencies in one file, both about the same three commits.

**Step 7 is unmarked.** Its heading reads `### Step 7 — The template and this repository's own
configuration file`, with no `[DONE]` and no completion block, although `557340d` landed both
files and the ontocoder's session history reports the step Complete. Steps 6 and 8 on either
side of it both carry `[DONE]` headings and detailed completion blocks. The ontocoder's
history ends "No commit made — the orchestrator commits after validation", so the marking was
left to the orchestrator and did not happen.

**The header contradicts the step markers.** The `**Status:**` line still reads:

> Steps 1 to 5 complete and committed … Steps 6, 7, 8 and 10 unstarted.

while Steps 6 and 8 in the same file carry `[DONE]` blocks dated 260804.

## Why it matters despite being small

`rules/fusion-workbench-conventions.md` makes the inline marking mandatory specifically so
that state survives an interruption and the next reconciler does not have to re-derive it from
git. This Circle has run two reconciliation passes that each spent effort re-verifying step
state at HEAD, and the second one had to correct three assertions the first had left standing.
A third pass now starts from a header that is wrong about three of ten steps.

## Suggested direction

Mark Step 7 `[DONE]` with a completion block in the shape Steps 6 and 8 use, citing commit
`557340d` and `history/260804-1502-ontocoder-step7-guard-config-template.md`. Rewrite the `**Status:**` line
to name Steps 9 and 10 as the remaining work, plus whatever the three High issues from
analysis `260804-1600` add. Reconciler work, not coder work.

---
Resolved: planner, 260804-1633. Step 7 of `planning/260802-1856_o_plan-guard-rules-write.md` now carries a `[DONE]` heading and a completion block in the shape Steps 6 and 8 use, citing commit `557340d` and `history/260804-1502-ontocoder-step7-guard-config-template.md`, and noting that two of the template's six keys have since been found false (`260804-1605_o_`). The `**Status:**` line now reads Steps 1 to 8 complete and marks Steps 9 and 10 as superseded by `planning/260804-1633_o_plan-c5b-remediation-and-ship.md`, so a third reconciliation pass no longer starts from a header that is wrong about three of ten steps.
