Three statements about the implemented transition still disagree after the dispatcher ruling
---
On `fj03d` at `88170d7e` the dispatcher sends a decision's transition to `implemented` after reading the executor's verification. Three passages do not yet fit that rule.
---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:** 261005-1350_*_the-rewritten-texts-name-the-party-of-a-transition-three-ways-and-an-implementer-moves-a-decision-to-a-terminal-state-before-its-verification-is-read.md, 261004-2212_*_plan-fj03d-rules-prompts-and-live-predicates-switched-with-this-workbench-in-one-window.md

Reported by the fix dispatch as found and not fixed:

1. The `Implemented:` note cites a commit hash. Both implementer prompts forbid the executor to commit, and the orchestrator commits after the executor returns, so the executor that appends the note does not have the hash. No text says who fills it in.
2. `agents/state-auditor.md` still sends `--to implemented --implementation-ref` on ground truth during a reconciliation. It is a second sender beside the dispatcher, outside the ruling's scope.
3. `rules/fusion-workbench-conventions.md` `### Decision files` opens with a one-actor sentence ("Append one to the narrative, then make the transition beside it"), which is right for the answered, deferred and superseded lines and wrong for the implemented one; only a parenthetical qualifies it.

Acceptance: the texts say who writes the commit hash into the `Implemented:` note (or the note cites something the executor holds); the state-auditor's transition is either named as the reconciliation's own route in the rule that states the dispatcher's, or removed on the user's ruling; the opening sentence of `### Decision files` does not contradict its `Implemented:` line. Dispatch-path bound green, no baseline moved.

---
Resolved: fj03d `85ea803b` — the executor's `Implemented:` note cites the files and headings it changed and no hash; the dispatcher commits and supplies the hash through `--implementation-ref`, stated once in `### Decision files`. On the user's ruling the state-auditor reports an implementation found on disk and moves nothing; the orchestrator's reconciliation section says it sends the transition. The opening sentence of `### Decision files` excepts the implemented line. Verified 2026-10-05 by the orchestrator in the fj03d worktree at `85ea803b`: hooks 1 134 of 1 139, the reds being the four legacy own-tree cases and the known monitor case; no file under `codec/` changed, bundle `c76bbce9…`.
