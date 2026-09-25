planner.md decision-marker handling still says "stop and ask" without routing through the new F2 Tool Discipline channel
---
Bundle 4 added a `## Tool Discipline` section to `planner.md` making every user-facing question conditional on invocation mode (top-level → `AskUserQuestion`; dispatched → return the question to the orchestrator). One earlier line was not updated to reference the channel: the `_o_` decision-marker instruction still reads "stop and ask" unconditionally. A dispatched planner has no `AskUserQuestion`, so the literal instruction is unreachable in that mode. It degrades safely (the dominant path is "surface it in the plan's Open Questions section"), but it is exactly the residual the F2 rewrite set out to remove.
---
Location: `agents/planner.md:55`, in `## Scope` decision-marker handling:

> "A decision marker `_o_` (open question) signals a user-input gate the planner cannot resolve — surface it in the plan's "Open Questions" section, or stop and ask if the question blocks all planning."

Scope: `planner` only (shared-package analogy: none — the other three F2 prompts have no equivalent stray). Introduced pre-F2; the Bundle-4 edit (commit b5be37e) updated the two `## Input: Specs vs Raw Requests` ask-sites and added Tool Discipline but left this line untouched.

Why it survived: the analyst prompt carries a catch-all in its Tool Discipline closer — "every 'if unclear, ask' in this prompt routes through it" (`analyst.md:25`) — which sweeps up any stray. The planner's closer instead reads "Only the channel changes; the rule that you ask about *technical* decisions ... is unchanged" (`planner.md:64`), which has no equivalent catch-all, so line 55's "stop and ask" is not explicitly reconciled.

Impact: Low. The "stop and ask" alternative maps cleanly onto the dispatched contract's "return the blocking question to the orchestrator and stop," and the non-blocking path ("surface in Open Questions") is unaffected. No tool is named, so no prompt claims a tool it cannot receive. This is a wording-consistency nit, not a behavioral defect — but it is the one place in Bundle 4 where an "ask" instruction is not cross-referenced to the F2 channel.

Fix direction (pick one, both clean):
1. Route the line explicitly: "... or, if the question blocks all planning, stop and raise it through the channel in `## Tool Discipline`."
2. Add the analyst-style catch-all to the planner's Tool Discipline closer: "... Only the channel changes; every 'ask'/'stop and ask' in this prompt routes through it." (Fixes any future stray too — preferred, one edit, mirrors the analyst.)

Route: coder (prompt surface in this self-development repo).
---
Resolved: Applied fix direction 1 at `agents/planner.md:55`. Reworded the `_o_` decision-marker instruction to route the blocking-question path through the `## Tool Discipline` channel — "surface it in the plan's 'Open Questions' section, or, if the question blocks all planning, raise it through the channel in `## Tool Discipline` (interactive `AskUserQuestion` when run top-level, a returned question to the orchestrator when dispatched) and stop." The non-blocking "surface in Open Questions" primary path is unchanged; the "stop and ask" alternative now cross-references the F2 channel instead of naming an unconditional interactive ask.
