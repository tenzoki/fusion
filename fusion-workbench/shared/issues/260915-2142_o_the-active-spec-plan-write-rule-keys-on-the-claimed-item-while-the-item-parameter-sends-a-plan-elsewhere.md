The `**Active spec/plan:**` write rule keys on the claimed item while the `**Item:**` parameter sends a plan elsewhere
---
The new write rule sets the field on **the claimed item**. The `**Item:**` dispatch parameter exists precisely to write a spec or plan into an item this checkout has **not** claimed. On that path the artifact lands in item X's container and no record ever names it, or — where the session also holds a claim on Y — the field is written onto Y, naming a plan that was never written for it.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260910-2011_*_a-work-item-has-no-field-for-the-plan-it-runs-on-so-the-closure-step-lost-its-source.md

**Evidence.**

- `agents/orchestrator.md:217` — "When the shaper or the planner returns and this session holds a claimed work item, set `**Active spec/plan:**` on **that item's** record". The destination of the field is derived from the claim, never from the dispatch.
- `agents/shaper.md:51` — "`**Item:** <directory-name>` names the work item this dispatch writes into … **It is how a dispatcher sends you into an item this checkout has not claimed.**" `agents/planner.md:51` says the same for a plan.
- `README-agents.md:57-58` lists both parameters as live, each cited to the prompt line it was read against.

So the destination of the **artifact** and the destination of the **field** are resolved from two different inputs, and they disagree on exactly the path the parameter exists for. The consequence lands at closure: `agents/orchestrator.md:438` resolves the plan in scope from the field, and a checkout that later claims X reads no field and falls back to "the plan path this session happens to be holding", which for a fresh session is nothing. The defect this field was added to fix returns for every item written into through `**Item:**`.

The write rule's own escape — "**With no claimed item there is nothing to write on** — hold the path for the session and go on" — covers the no-item case and reads the `**Item:**` case as that case, which it is not: there is an item, and it is named on the dispatch.

**Acceptance.** `agents/orchestrator.md` `### Shaping and planning` names the item the field is written onto as the one the dispatch wrote into — the `**Item:**` value where the dispatch carried one, the claimed item otherwise — or states that the `**Item:**` path deliberately writes no field and says what the closure step does there instead. Either way a reader can answer, from the prompt alone, which record names a plan dispatched with `**Item:**`.
