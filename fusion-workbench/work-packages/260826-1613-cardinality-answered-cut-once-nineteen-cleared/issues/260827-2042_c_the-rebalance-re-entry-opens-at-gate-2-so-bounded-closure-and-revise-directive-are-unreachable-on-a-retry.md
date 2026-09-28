The Rebalance re-entry opens at Gate 2, so Bounded Closure and Revise Directive are unreachable on a retry

---
`rules/orchestrator-rebalance.md:28` (`#### Rebalance bounding`) says every re-entry after a Revise Artifact or Revise Grounding opens the gate at Gate 2, whose options are Revise Artifact and Revise Grounding only; Gate 1 is put again only when the verdict names the Directive. A user whose second execution pass has also failed and who now wants Accept Bounded Closure (or a re-shape) has no option that reaches it until the Turn limit forces closure; in a session whose budget came back unresolved, nothing forces it. The same file's `:9` says the four moves "are all reachable", and `agents/orchestrator.md:885` says "All four moves stay reachable"; both are false on a re-entered gate.
---
**Filed by:** coderev, Kai Stalmann <ks@qantr.com>
**Cross-references:** `260827-1756_*_how-does-the-rebalance-gate-present-four-moves-under-a-three-option-cap.md` (option 2, whose `## Answer` says "every move stays reachable"); `rules/critical-stance.md` §4 (a case split is complete or the question is cut wrong); commit `799ea34`

## Evidence

`rules/orchestrator-rebalance.md:28`: "Every re-entry named below … returns to a session in which the user has already said the Directive stands, so when the gate fires again it opens at Gate 2 (Artifact or Grounding); Gate 1 is put again only when the trigger is a fresh verdict that questions the Directive itself." Gate 2 (`:15-18`) lists two options and no way back to Gate 1.

## Fix direction

Either Gate 2 carries a third option that returns to Gate 1 ("Neither: the Directive is in question"), which keeps it inside the three-option cap, or the re-entry rule opens at Gate 1 whenever the previous move was Revise Artifact (a failed retry is evidence about the Directive). The orchestrator's one-line stub at `:885` follows whichever is chosen.

## Acceptance

From a gate reached after one Revise Artifact retry, the user can select Accept Bounded Closure without waiting for the Turn limit; the sentence "all reachable" is true on every path the bounding section names.

Resolved: 260827-2105-coder-turn-2-rebalance-re-entry-and-stub-citation.md, Turn 2 of this Circle, uncommitted at the time of writing (the orchestrator commits). `rules/orchestrator-rebalance.md` `#### Rebalance bounding` now opens every re-entry at Gate 1: the Revise Artifact Turn, the `paused_at_task` resume, the re-run Phase-3 verdict and the Revise Directive re-entry each reach the gate afresh, so Accept Bounded Closure and Revise Directive stay on offer and Gate 2 is reached from Keep it only; the residual sentence now points at "the first sentence" of the paragraph. `agents/orchestrator.md` `### Rebalance Gate` says "every re-entry opens at Gate 1". Fix direction taken: the second (re-entry rule), not a third Gate-2 option.
