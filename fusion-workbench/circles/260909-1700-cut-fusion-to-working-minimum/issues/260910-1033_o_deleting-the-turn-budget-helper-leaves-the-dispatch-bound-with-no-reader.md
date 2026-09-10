Deleting the Turn-budget helper leaves the dispatch bound with no reader
---
Step C1 deletes `bin/fusion-turn-budget`, the only program that resolved `orchestrator.dispatchMinutes`. The plan retires `orchestrator.maxTurns` as a leaf and keeps `dispatchMinutes` live, so a setting the configuration file still documents and `rules/bounded-dispatch.md` still depends on now has nothing that reads it.
---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260909-1843_*_implementation-cut-fusion-to-a-working-minimum.md steps C1, C2; rules/bounded-dispatch.md

**Evidence.** `bin/fusion-turn-budget` printed two lines, `max_turns=` and `dispatch_minutes=`. C1 deletes the helper whole. `hooks/lib/config.ts` keeps `orchestrator.dispatchMinutes` as a live leaf with a default, and `fusion.json`'s `_dispatchBound` note still documents it for a project to set. Nothing in the plan's C-block re-homes the read.

**The gate that hides it, and when it stops hiding it.** `dispatch-bound-lint.test.ts` still passes, because it is a text check over `agents/orchestrator.md` asserting that the prompt keeps the `[ -x "$FUSION_PLUGIN_ROOT/bin/fusion-turn-budget" ]` block and names `dispatch_minutes`. That prompt is C2's to rewrite. So the gate goes red at C2, while the value became unresolvable at C1 — one step earlier than anything reports it.

**Acceptance.** Either the dispatch bound keeps a reader, named in the plan with the step that adds it, or `orchestrator.dispatchMinutes` is retired as a leaf alongside `maxTurns` and `rules/bounded-dispatch.md` is brought to whatever replaces it. `dispatch-bound-lint.test.ts` is brought to the same answer in the same step, rather than being left to fail at C2 as the first notice.
