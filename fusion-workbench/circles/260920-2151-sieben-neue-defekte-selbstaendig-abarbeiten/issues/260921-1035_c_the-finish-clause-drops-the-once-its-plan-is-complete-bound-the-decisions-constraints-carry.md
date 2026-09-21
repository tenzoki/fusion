The finish clause drops the "once its plan is complete" bound the decision's Constraints carry
---
`260921-0842_*_how-does-a-work-item-tell-the-orchestrator-to-work-it-without-asking.md` `## Constraints`: the field answers "the finish of that item once its plan is complete". `agents/orchestrator.md` `## Human Gate Rules` (line 379 at `8ef78ffc`) and `## Work items` (line 416) say "the claim and the finish of that item" with no bound, so under the field the finish is confirmed whether or not the plan's steps are done. The decision's own `Answered:` and `Implemented:` lines omit the qualifier as well, so the shipped text matches the ruling as recorded and not the constraint it was recorded under. `## Closing a work item` (line 426, "The user says when an item is done") and `### Step 5` (line 320, "Never decide on your own that the work is finished") still stand, so nothing finishes on its own; what is open is whether the one confirmation the field removes is bounded by plan completeness.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260921-0842_*_how-does-a-work-item-tell-the-orchestrator-to-work-it-without-asking.md, 260921-1035-reviewer-mode-autonomous-field-against-its-decision.md

Severity: Low. Scope: `agents/orchestrator.md` lines 379 and 416, or the decision record's `## Constraints`; the user rules which line is the one to keep.

Acceptance: either the two prompt sentences carry "once its plan is complete" (and say what happens to the finish when it is not: the gate asks as before), or the decision record gains a line saying the qualifier was dropped at the ruling and why. `cd hooks && npm test` green.

---
Resolved: `## Human Gate Rules` and `## Work items` both bound the finish with "once its plan is complete" (every step `[DONE]`); with a step still open, including one the field skipped, the finish asks as before. Fixed in the commit that carries this line; concept accepted by a consultant read.
