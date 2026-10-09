`/fusion:reconcile` hands an implemented decision to an orchestrator its own route does not have
---
Since `85ea803b` the state-auditor moves no decision to `implemented`; it reports each one under "Implemented on disk — needs the transition", and `agents/orchestrator.md` `## Reconciliation, and the one approval it opens` sends that transition. `skills/reconcile/SKILL.md` Report item 2 says "the orchestrator sends that transition, this body none", but `/fusion:reconcile` is run by the user, dispatches only `fusion:state-auditor` (`allowed-tools`), and has no orchestrator in its route. On that route the decision stays `answered` and is reported again on every later pass. Low: nothing is lost, and the report names the record and the commit.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>

**Evidence:** `skills/reconcile/SKILL.md` front matter `allowed-tools: [Bash, Read, Agent(fusion:state-auditor)]` and its `## Report` item 2; `agents/state-auditor.md` decision bullets ("move no state and append no `Implemented:` line"). Read, not run.

**Fix direction:** name the party on the skill route: the user, through the `transition` the report prints for each entry, or the skill body itself after the user's word. Either way, one sentence in the report item.

**Acceptance:** `skills/reconcile/SKILL.md` names who sends `--to implemented` when no orchestrator runs, and the surface-growth bound stays green.

Cross-references: 261009-1037-reviewer-g-a-pre-release-review-of-13-0-0.md

Also seen: 261009-1519 by reviewer — since `a563ff6a` every takeover leaves its consent decision at `answered` (`agents/orchestrator.md` **Take over** row), so on this route each one joins the repeated "needs the transition" list too.
