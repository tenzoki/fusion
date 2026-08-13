# Should `planner` accept a `**Domain:**` dispatch parameter, which three shipped surfaces already promise and its prompt never parses?

---
**Domain:** code
**Status:** open
**Filed by:** planner
**Cross-references:** `circles/260813-0910-documentation-matches-shipped-plugin/planning/260813-1820_o_documentation-matches-shipped-plugin.md` step 6; `shared/analyses/260813-0828-documentation-staleness-survey.md` finding 8; `circles/260813-0910-documentation-matches-shipped-plugin/_t_circle.md` `## Grounding snapshot`

---

## Question

`agents/planner.md` declares two dispatch parameters, `**Executors:**` and `**Circle:**`, and contains **zero** occurrences of the string "Domain". Verified by reading: `grep -n 'Domain' agents/planner.md` returns nothing, in the work tree and in the installed copy at `~/.fusion`, which are byte-identical for that file.

Three shipped surfaces state the opposite:

- `CLAUDE.md:14` — "Three (`reconciler`, `taskplanner`, `planner`) are parameterised by domain".
- `CLAUDE.md:56-60` — the dispatch-parameter bullet, which assigns `**Domain:**` to `taskplanner` and `reconciler` and describes the planner as taking `**Executors:**`, while the surrounding sentence counts "four agents".
- `docs/philosophy.md:19` — "Three agents (`taskplanner`, `reconciler`, `planner`) take a **domain parameter**".

`.claude-plugin/plugin.json:3` carries the same count in the marketplace description: "3 parameterised by domain".

Meanwhile `agents/playmaker.md:36-38` carries a full `Parameter parsing` section for `**Domain:**` that none of those surfaces counts, and `agents/orchestrator.md:850` passes the parameter to it. So the documented membership is wrong in both directions at once: the planner is named and does not parse it, the playmaker parses it and is not named.

The question must be settled now because the documentation Circle is correcting exactly these surfaces, and the correction differs depending on the answer. It is filed as a decision rather than carried in the plan because it changes an agent's dispatch contract, which binds beyond this Circle.

**Observed in the field, not only in the source:** the dispatch that produced this plan opened with `**Domain:** code`. The parameter is being passed to the planner today and silently ignored.

## Options

1. **The prompt is right; correct the documentation.** The planner is not domain-parameterised. Fix `CLAUDE.md:14`, `CLAUDE.md:56-60`, `docs/philosophy.md:19` and the manifest description to name the agents that actually parse the line: `taskplanner`, `reconciler`, `playmaker`.
   - Pros: matches shipped behaviour today, needs no prompt change, and is entirely inside the documentation Circle's remit.
   - Cons: leaves callers passing a parameter that is ignored, with nothing telling them so.
2. **The documentation is right; add the parameter to the prompt.** Give `agents/planner.md` a `**Domain:**` line in its `## Parameter parsing` section and state what the planner does differently per domain.
   - Pros: honours what three surfaces and the manifest already promise, and what the orchestrator already sends.
   - Cons: requires designing the behaviour. Domain currently changes *ranking* (taskplanner, playmaker) and *verification emphasis* (reconciler); what it would change in a plan is undefined, and `**Executors:**` already carries the one planner-visible consequence of a strategic or knowledge domain.
3. **Correct the documentation now, and decide the design separately.** Take option 1 inside this Circle so no surface states a falsehood at its close, and keep this record open as the design question, to be answered on its own evidence.
   - Pros: the Circle's acceptance condition is met without pre-empting a contract change; nothing is silently dropped.
   - Cons: two passes over the same lines if option 2 later wins.

## Constraints

- The prompt is the ground truth for what the plugin does. A documentation surface may not claim behaviour that no prompt implements, whatever the design merit of the claim.
- Whatever is decided, the membership must be correct in all four places at once — `README-agents.md`'s new dispatch-parameter table, `CLAUDE.md`, `docs/philosophy.md` and the manifest description. Fixing three of four is the exact failure this Circle exists to end.
- `**Executors:**` already exists and is what the orchestrator passes for strategic and knowledge work. Any answer to option 2 has to say why a domain parameter would not duplicate it.

## Recommendation

Option 3. The documentation Circle corrects the surfaces to shipped behaviour, because a false statement about an agent's contract costs a reader immediately and the correction is cheap. The design question — whether a planner should rank or verify differently per domain, given that `**Executors:**` already carries the routing consequence — deserves its own evidence and is not something a documentation pass should settle by choosing the wording it prefers.

---
Answered:
Implemented:
Deferred:
Superseded by:
