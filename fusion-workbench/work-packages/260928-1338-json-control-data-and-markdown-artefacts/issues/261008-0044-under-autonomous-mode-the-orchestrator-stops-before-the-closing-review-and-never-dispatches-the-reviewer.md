Under autonomous mode the orchestrator stops before the closing review and never dispatches the reviewer
---
Observed in the opt-in suite's cases (g) and (h) at `b262406d`: asked to close a package whose mode is `autonomous` and whose plan is complete, the orchestrator checked the work itself (ran `node --test`, read the file set), found it broken or missing, and stopped with a question instead of running `## Closing a work package` step 2 (dispatch the reviewer) and step 4 (finish, binding the review's evidence). `agents/orchestrator.md` `## Human approval rules` says the finish of a complete plan is answered by the field and that the review never blocks closure. In (g) the stop wrote no `gate_hit` row; in (h) it did.
---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:** 261007-1836-plan-the-four-open-defects-fixed-before-v13-is-tested.md (step 9), 261007-2348-agent-dispatch-and-skill-block-observation-at-495aca7d.md

Evidence: transcripts `g-orchestrator.json` and `h-orchestrator.json` and the scratch projects beside them under `/private/var/folders/6v/31t6lk3x7yb8wj8pt1gyz93h0000gn/T/fusion-agent-run-VbuGiR/` (an OS temp directory; copy before it is swept). The (g) scratch project's `fusion-workbench/orchestrator-events.jsonl` carries no `gate_hit` for the stop.

The outcome was safe (successor B stayed blocked in both cases); the defect is that the prompt's stated path did not run, so the path "review returns `revise`, finish binds that evidence" stays unobserved, and an approval stop went unlogged in (g).

Acceptance: either the prompt says when the orchestrator may stop a complete autonomous closure on its own finding (and that stop writes `gate_hit`), or a re-run of (g) shows the reviewer dispatched, a `revise` verdict recorded, and B not `ready`. Suggested owner: `code-implementer`.
