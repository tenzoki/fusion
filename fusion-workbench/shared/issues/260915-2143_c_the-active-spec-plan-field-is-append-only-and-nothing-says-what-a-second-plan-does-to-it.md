The `**Active spec/plan:**` field is append-only and nothing says what a second plan does to it
---
The write rule appends "beside any value already there" and no pass maintains the field afterwards, by design. The grammar and the read rule both assume at most two values, one spec and one plan. An item that gets a second plan — a re-plan after a Modify at the plan gate, or a plan in a later session — accumulates a third value with no rule saying which one is in force.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260915-2028_*_a-fifth-status-value-for-work-items.md, 260910-2011_*_a-work-item-has-no-field-for-the-plan-it-runs-on-so-the-closure-step-lost-its-source.md

**Evidence.**

- `agents/orchestrator.md:217` — "set `**Active spec/plan:**` … **beside any value already there** — a spec and the plan drawn from it both stand". Append, with no clause for replacement, and "no later pass maintains it".
- `rules/fusion-workbench-conventions.md:228` — "comma-separated where a spec and the plan drawn from it both stand; a short qualifying clause beside a basename is allowed, and is what lets one field say which of the two is which." The grammar contemplates exactly the pair.
- `agents/orchestrator.md:438` — the closure step disambiguates only that pair: "where it names a spec and a plan both, the one carrying `## Where this work stops`". Two plans both carry one, and the step has no tie-break.

`agents/orchestrator.md` `**Plan**` step 5 offers **Modify** (re-invoke the planner) at the plan gate, so a second plan artifact on one claimed item is a path the prompt itself describes, not a hypothetical.

**Acceptance.** The write rule says what happens to a value the new artifact supersedes — replaced, or kept with the qualifying clause marking which is in force — and the closure step's disambiguation covers more than one plan basename, or the grammar states that the field holds at most one plan and the write is a replace.

---
Resolved: the plan half of `**Active spec/plan:**` is a replace. `agents/orchestrator.md`, the adoption paragraph, now says the field holds at most one spec and at most one plan: a spec is written beside the plan already there and a plan beside the spec, but a plan the session adopts replaces the plan value already there, and the replaced basename goes into `**Cross-references:**` in the same write so the trail survives; the closure step reads the one plan and needs no tie-break. `rules/fusion-workbench-conventions.md` `## Backlog entries — work items` states the same bound in one clause. The alternative the acceptance offered, keep both and qualify which is in force, is not taken because the closure step would still need a tie-break. Plan `260921-1726_*_the-33-open-defects-of-the-11-9-1-survey-worked-autonomously-as-one-package.md` step 12, fixed in the commit that carries this line.
