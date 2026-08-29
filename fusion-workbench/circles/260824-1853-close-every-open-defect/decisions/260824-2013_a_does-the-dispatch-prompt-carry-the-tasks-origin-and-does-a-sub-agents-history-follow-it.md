# Does the dispatch prompt carry the task's origin, and does a sub-agent's history follow it or the resolver's pointer?

---
**Domain:** code
**Filed by:** analyst
**Attribution backfilled 260825 (not written by the filing agent):** `analyst` filed this record; the person half of `**Filed by:**` is absent because the installed plugin at `$FUSION_PLUGIN_ROOT` carried no `bin/fusion-identity` at that time. See `shared/issues/260825-1329_*_every-session-runs-one-release-behind-on-a-bin-helper-the-same-repository-just-added.md`.
**Cross-references:** `shared/issues/260805-0629_*_dispatch-prompt-carries-no-origin-so-a-sub-agents-history-lands-by-pointer-alone.md`; `shared/issues/260823-0700_*_every-sub-agent-files-its-history-into-the-active-circle-because-the-resolver-cannot-make-the-origin-rules-judgement.md`; `rules/fusion-workbench-conventions.md` `## Origin Rule (Herkunftsregel)` and `## Issue and Decision Filing — MANDATORY`; `rules/agent-setup.md` `## What fusion-paths emits`; `rules/workbench-path-resolution.md`; plan `circles/260824-1853-close-every-open-defect/planning/260824-1905_*_plan-close-every-open-defect.md` step 1 (D-origin)

---

## Question

The Origin Rule leaves one judgement to the writing agent: did this work arise from the active Directive, or was it merely found nearby? `bin/fusion-paths` cannot make that judgement and by design does not try; it resolves `OUT_HISTORY` to the active Circle whenever one is active. The orchestrator's dispatch prompt names the task, the files, the acceptance criteria and the source record, and nothing about origin, so a dispatched agent holds no fact to apply the rule with. Measured consequence: three sub-agents in one sitting on 2026-08-23 filed release and repair work into the history store of a Circle about checkout portability, and the orchestrator moved all three by hand. The filing rule poses the Origin question for defects and decisions and not for session histories, which is the artifact misfiling most reliably. Two things need deciding together: whether the dispatch prompt states origin, and, if it does, what a sub-agent does with the statement.

## Options

1. **Advisory origin line, resolver unchanged** — the dispatch prompt gains an `**Origin:**` parameter line on the mechanism that already carries `**Domain:**` and `**Executors:**`; the agent still resolves through `bin/fusion-paths` and applies the Origin Rule's judgement to its own history write, the way the filing rule already asks it to for defects and decisions.
   - Pros: reuses the existing parameter mechanism; the party that knows why it dispatched supplies the fact; no store decision returns to a prompt.
   - Cons: the agent still has to act on the line, and a sibling sentence covering histories costs bytes on an always-on rule surface (the first record's option 1) or on `rules/agent-setup.md` (its option 2).
2. **Binding origin line** — when the line says the task is not Circle-work, the agent overrides the resolved `OUT_HISTORY` and writes to `shared/`.
   - Pros: the misfiling stops mechanically rather than by judgement.
   - Cons: puts a store decision back into a prompt after v4.0.0 deliberately took every one out; the resolver's single-resolution-point invariant is breached by the consumer.
3. **A sub-agent's history is Circle-work by definition** — the history records a dispatch the orchestrator made during this Circle's session, so it stays where the resolver puts it; only defects and decisions route by origin, which the filing rule already covers.
   - Pros: no prompt, rule or resolver changes; the three hand-moves on 2026-08-23 become unnecessary rather than automated.
   - Cons: a Circle's history store then holds work its Directive did not cause, which is the attribution the container layout exists to keep straight; the orchestrator's session note that produced the first record reported this as the wrong outcome.
4. **Leave it to the orchestrator to correct afterwards** — what happens today.
   - Pros: nothing changes.
   - Cons: works only while someone is watching; the second record names it the cheapest and the weakest.

## Constraints

- The resolver makes no judgements: inferring a dispatch's origin from its text is the undecidable-question shape this project has deleted twice (second record, `## What this is not`).
- Any new dispatch parameter reuses the `**<Keyword>:**` line mechanism and is added to the roster in `README-agents.md` `## Dispatch parameters`, which is authored once.
- Key sets are derived from the consumer's prompt, so an origin-aware write target is a prompt change, not a resolver change (`rules/workbench-path-resolution.md`).
- A sentence added to an always-on rule file counts against the 431-byte head-room measured for this Circle; one added to `rules/agent-setup.md` counts against the same set.

## Recommendation

None. The first record states both halves as choice points it does not settle; the second lists three candidates uncosted and calls the third the weakest without endorsing the other two.

---
Answered:
Implemented:
Deferred:
Superseded by:
Retired:

---
Answered: circles/260824-1853-close-every-open-defect/decisions/260824-2013_a_does-the-dispatch-prompt-carry-the-tasks-origin-and-does-a-sub-agents-history-follow-it.md — option 1, user 2026-08-29: the dispatch prompt gains an advisory `**Origin:**` line; the resolver stays the single resolution point and the agent applies the Origin Rule to its own history write.
