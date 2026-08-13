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

Reconciled: 260813-2258 — still open, and the marker is correct. Searched for an answer across this Circle's analyses (none exist), `shared/analyses/` (the staleness survey and the seam analysis, neither of which answers it), the plan (which states explicitly that it does not answer it), the session history `260813-1815-orchestrator-session.md`, and the fifteen commits of range `267a65c..HEAD`. Nothing answers the design question. What *did* move is the documentation half: `agents/planner.md` is untouched in the range and still parses no `**Domain:**`, while `CLAUDE.md:16` and `docs/philosophy.md:19` now read `taskplanner, reconciler, playmaker`, and `README-agents.md` `## Dispatch parameters` lists the planner's two real parameters. `.claude-plugin/plugin.json` was deliberately not edited: its claim is a bare count of three that survives the membership change. A fifth carrier, `agents/orchestrator.md`, is still wrong and is tracked as `issues/260813-2045_o_…`. Note: this record's `Cross-references:` names the plan under its old `_o_` filename; the file is now `planning/260813-1820_p_documentation-matches-shipped-plugin.md`.
