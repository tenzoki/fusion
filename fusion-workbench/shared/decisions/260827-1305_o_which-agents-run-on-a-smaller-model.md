# Which agents run on a smaller model?

---
**Domain:** code
**Filed by:** claude-code (conditioning-load work; the last open lever of the 260827 optimisation round), Kai Stalmann <ks@qantr.com>
**Cross-references:** `shared/analyses/260827-1305-does-agent-frontmatter-model-reach-the-dispatch.md` (the mechanism, measured: `model:` frontmatter is honoured, verified from transcripts) · `agents/reconciler.md` (the first candidate) · `refactor/260827-0335-bookkeeping-cost-repair-plan.md` (the audit that raised the lever)

---

## Question

All 14 sub-agents inherit the session's model. The mechanism for per-agent tiering exists and is measured; the cost lever is the largest one left that no byte-cut touches. Which roles, if any, move — and on what evidence?

## Candidates, ordered by how mechanical the role's judgement is

1. **reconciler** — verifies claimed record states against ground truth with grep/read/git; since 10.13.0 its inventory is live-scope only. The most checklist-shaped role.
2. **taskplanner** — orders records into a queue by declared priority axes.
3. **coderev** — since 10.14.0 one dispatch per Circle; a quality drop here costs the most, so it moves last if at all.

## The measurement this needs (why this record is filed open)

Not another probe: live evidence. After a few sessions on ≥ v10.15.0, run one reconciliation with the candidate on `model: haiku` (a one-line frontmatter change in a work tree, `claude --plugin-dir .`) against the same workbench state as a same-day run on the session model, and compare the two reconciliation history files: discrepancies found, discrepancies missed, wrong claims. The transcript names the model actually used (`subagents/*.jsonl`); the dispatch result and the agent's own say-so do not. Two clean candidate runs are the bar for moving a role; one miss a session model catches is the bar for moving it back.

## Constraints

- Verification is transcript-based, per the analysis; a tiering change ships only with its transcript evidence cited.
- The two-session shape applies: a frontmatter change is live only after `fusion --update` and a restart.
- Nothing here touches the orchestrator, shaper, curator or editor: judgement-heavy, user-facing, or gate-holding roles are out of scope for the first round by construction.
