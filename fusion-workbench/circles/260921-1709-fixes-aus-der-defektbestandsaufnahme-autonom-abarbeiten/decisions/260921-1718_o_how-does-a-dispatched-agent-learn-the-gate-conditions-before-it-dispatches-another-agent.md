# How does a dispatched agent learn the gate conditions before it dispatches another agent?

---
**Domain:** code
**Filed by:** planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260913-1108_*_the-gate-determination-is-delegated-to-an-analyst-that-holds-no-more-of-the-gate-list-than-the-caller.md (the defect this answers), 260913-1108_*_the-positive-dispatch-rule-turns-on-an-undefined-word-and-leaves-both-exclusions-bound-to-the-orchestrator-alone.md (the sibling in the same paragraph), 260913-0909_*_may-the-orchestrator-reach-every-tool-and-may-an-agent-dispatch-another.md (the implemented ruling whose gate mechanic this replaces; its grant and its ban stand), 260921-1653-open-defect-survey-at-11-9-1.md (row 23), 260921-1709-fixes-aus-der-defektbestandsaufnahme-autonom-abarbeiten.md

---

## Question

`rules/fusion-workbench-conventions.md` `## Dispatching another agent` tells an agent that may be approaching a gate condition to halt, and has "an `analyst`" determine whether one is present. The gate conditions live only in `agents/orchestrator.md` `## Human Gate Rules`; `bin/fusion-rules` emits no agent prompt to anybody, so neither the agent nor the analyst it would dispatch holds the list, the actor of the dispatch is unnamed, and the analyst's own dispatch is bound by the same sentence, so nothing terminates the regress. The mechanism has to change to one whose inputs the dispatched agent has, and the choice binds every nested dispatch in every project, so it is a record.

## Options

1. **The agent reads the list itself, and the halt is a return.** Before an agent dispatches another agent, it reads `agents/orchestrator.md` `## Human Gate Rules` through `$FUSION_PLUGIN_ROOT` (the file is shipped and the variable is exported at every SessionStart). A row that applies to the dispatch it is about to make means it does not make it: it returns the question, with the row named, to whoever dispatched it, and that party carries it up to the orchestrator, where the user answers as before. No analyst is involved; no row is answered by anybody but the user.
   - Pros: the inputs exist at every agent (the shipped file and the variable), the actor is the agent itself, the regress ends because no determination is delegated, and the always-on text shrinks by the analyst sentence. It reuses the read-through-the-root shape `## Human Gate Rules` already uses for `rules/orchestrator-rebalance.md`.
   - Cons: a read of a 94 kB prompt for one table, on the rare path only; a stale install shows a stale table, the one-release-behind cost every `$FUSION_PLUGIN_ROOT` read carries.
2. **Enumerate the gate conditions in the always-on conventions.** The rows are copied into `## Dispatching another agent`.
   - Pros: no read at dispatch time.
   - Cons: two copies of the list, and the orchestrator's is the one that moves (it gained the mode paragraph on 2026-09-21); always-on bytes on all eleven paths for a case that arises rarely.
3. **Forbid a nested dispatch of any agent a gate row names.** `ontocoder` and any destructive or ontology-shaped task are the orchestrator's to dispatch; every other nested dispatch is free.
   - Pros: no read, no list at the agent.
   - Cons: the agent still has to know which rows name an agent or a task shape, which is the list again in a shorter form; and the rows about ambiguity and files outside the tree name no agent, so the split is not complete.

## Constraints

- No agent answers a gate; the user does, at the orchestrator's loop (`260913-0909_*`, unchanged).
- The rule stays one paragraph in the always-on corpus; the dispatch-path bound charges every byte to all eleven paths.
- The reader of `## Dispatching another agent` can answer, from that paragraph alone, who reads what and what a `no` and a `yes` each do.

## Recommendation

Option 1. It is the only one of the three whose inputs the dispatched agent already has, and the halt it prescribes is the ordinary return every dispatch already ends in. The stale-install residual is the same one every helper call carries and is documented once in `README-agents.md` `## Releasing`; it is not introduced here.

---
Working answer (plan 260921-1726): option 1 — the dispatching agent reads `agents/orchestrator.md` `## Human Gate Rules` through `$FUSION_PLUGIN_ROOT` before it dispatches and returns the question when a row applies or the table cannot be read, no analyst; implemented in the commit that carries this line. The gate paragraph of the `Answered:` line on `260913-0909_*_may-the-orchestrator-reach-every-tool-and-may-an-agent-dispatch-another.md` now disagrees with the rule text; the `Superseded by:` line and the `_i_` to `_s_` move it owes, scoped to the gate mechanic only (the grant and the ban stand), are applied when the user rules on this record, not now.
