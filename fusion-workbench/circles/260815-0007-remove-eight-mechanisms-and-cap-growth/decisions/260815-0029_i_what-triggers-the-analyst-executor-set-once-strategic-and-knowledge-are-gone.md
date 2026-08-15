# What triggers the `analyst` executor set once `strategic` and `knowledge` are gone?

---
**Domain:** code
**Status:** answered
**Filed by:** planner
**Cross-references:** `circles/260815-0007-remove-eight-mechanisms-and-cap-growth/_t_circle.md` § Grounding snapshot item 6; `circles/260815-0007-remove-eight-mechanisms-and-cap-growth/planning/260815-0029_o_plan-remove-eight-mechanisms-and-cap-growth.md` step 9; `agents/orchestrator.md:434`; `agents/planner.md` `## Executor Agents`; `README-agents.md` `## Dispatch parameters`

---

## Question

`agents/orchestrator.md:434` passes the planner an extended executor set on exactly one
condition: *"When the detected domain (Setup Step 5) is `strategic` or `knowledge`, prefix the
dispatch prompt with `**Executors:** coder, ontocoder, analyst`."* Item 6 of this Circle removes
both of those domain values, so the condition can never be true again. The line has to change,
and how it changes decides whether the `analyst` executor survives at all.

The three-value routing rule in `agents/planner.md` (`## Executor Agents`) and the
`analyst` row of the Agent Routing Table in `agents/orchestrator.md:492` both hang on the same
answer. So does the `planner` / `**Executors:**` row of the roster in `README-agents.md`, whose
"Passed by" cell cites the removed condition verbatim.

This must be answered before the plan's step 9 is executed, because the three surfaces above are
edited in that step and the edit differs per option.

## Options

1. **Pass the extended set on every planner dispatch.** The orchestrator prefixes
   `**Executors:** coder, ontocoder, analyst` unconditionally, and the planner routes a step to
   `analyst` when, and only when, that step produces a strategic deliverable — a decision record,
   an architectural snapshot, a comparative, feasibility or risk analysis. The routing rule the
   planner already carries is unchanged; what goes is the orchestrator-side condition in front of
   it.
   - Pros: the question *"does this unit of work need a decision record or an architectural
     snapshot?"* is answerable only once the plan exists, which is to say by the planner and not
     by the orchestrator one phase ahead of it. Removing the guess is `rules/critical-stance.md`
     §4 applied exactly: the input the deciding mechanism needs is the plan, so the mechanism
     moves to where that input is. It also costs one prefix line and deletes a branch.
   - Cons: a project that will never produce a strategic deliverable now carries a third executor
     name in every planner dispatch. The cost is one line of prompt text and no behaviour, since
     an executor nothing routes to is never dispatched.
2. **Drop `analyst` from the executor set; the default `[coder, ontocoder]` becomes the only
   set.** `**Executors:**` keeps its parameter and its parsing, and `analyst` returns to being a
   dispatched-for-analysis agent rather than an executor of plan steps.
   - Pros: the smallest surface. The parameter stays for a future third executor, and nothing has
     to decide when to widen it.
   - Cons: it removes a capability in a Circle that is otherwise widening the analyst's remit —
     item 5 folds the investigator into it. A plan step whose product is a decision record then
     has no executor at all, and `agents/planner.md` already says what happens in that case: the
     step must be split into a precursor analysis the user runs by hand plus a code or data step.
     That is a worse queue, not a smaller one.
3. **Keep a condition, cut from something other than the domain.** For example: pass the extended
   set when the Circle's own `**Domain:**` field says so, or when the Directive names an analysis
   deliverable.
   - Pros: preserves the shape of today's line.
   - Cons: every candidate input is a restatement of the same undecidable question one field over.
     The Circle's `**Domain:**` frontmatter takes the same four values and loses two of them in
     the same step. Listed for completeness and not proposed.

## Constraints

- The `**Executors:**` parameter itself stays. Item 6 removes two domain *values*, not the
  parameter mechanism, and `agents/planner.md` parses `**Executors:**` and not `**Domain:**`.
- Whatever is chosen, the `planner` row in `README-agents.md` `## Dispatch parameters` is
  rewritten in the same change. Its "Passed by" cell currently cites a condition that will not
  exist, and that table is the roster's single authoring home.
- No option may leave `agents/orchestrator.md` naming `strategic` or `knowledge`; the step's
  acceptance is that neither string survives anywhere in the shipped tree.

## Recommendation

Option 1, with moderate confidence.

*Verified:* the condition and its three dependent surfaces were read at
`agents/orchestrator.md:434`, `:492`, `agents/planner.md` `## Executor Agents` and the
`README-agents.md` roster table. The domain values are removed by this Circle's own item 6.

*Inference:* that the orchestrator cannot decide at Phase 0b whether a plan will contain a
strategic-deliverable step, because the plan does not exist yet at that point. This follows from
the phase ordering rather than from a measurement.

*Not established:* how often a plan step actually routes to `analyst`. No count was taken, and
the analysis that drove this Circle counted domain *values* passed, not executor assignments. If
the true figure is zero, option 2 is the honest answer and option 1 is a line of prompt text
buying nothing. That count is cheap to take and worth taking before answering.

---
Answered: shared/history/260814-2306-orchestrator-session.md:153 — Option 1: the orchestrator passes **Executors:** coder, ontocoder, analyst on every planner dispatch and the planner routes a step to analyst when that step produces a strategic deliverable. The orchestrator-side condition is deleted. Answered by the user at the plan gate.
Implemented: <commit hash pending — the orchestrator commits this task; see `circles/260815-0007-remove-eight-mechanisms-and-cap-growth/history/260815-1440-coder-step9-domain-values.md`> — option 1 landed: `agents/orchestrator.md:396` now prefixes `**Executors:** coder, ontocoder, analyst` on every planner dispatch with no condition, the `analyst` row of the Agent Routing Table at `:453` dropped its executor-set condition, `agents/planner.md` `## Executor Agents` states that the orchestrator always passes all three and that the routing judgement is the plan's, and the `planner` / `**Executors:**` row of `README-agents.md` `## Dispatch parameters` was rewritten in the same change.
Deferred:
Superseded by:
