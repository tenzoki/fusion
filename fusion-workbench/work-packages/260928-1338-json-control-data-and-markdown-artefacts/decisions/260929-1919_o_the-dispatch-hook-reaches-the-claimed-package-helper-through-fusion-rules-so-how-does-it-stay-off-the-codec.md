# The dispatch hook reaches `bin/fusion-claimed-package` through `bin/fusion-rules`: how does it stay off the codec once that helper reads JSON?

---
**Domain:** code
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260929-1810_*_plan-fj03a-the-record-client-the-format-gate-and-scope-and-order-on-json.md, 260929-1810_*_what-does-the-claude-side-declare-about-a-read-that-finishes-a-committed-intent.md, 260929-1810_*_where-do-the-claude-side-consumers-of-the-codec-live-and-how-do-they-reach-it.md, 260928-1338-json-control-data-and-markdown-artefacts.md

---

## Question

The recovery record is answered: a helper that was called explicitly may finish a committed intent, and the automatic hooks never call the codec, indirect subprocess calls included (Prior `docs/design/fusion-fj03a-prior-plan-response.md` `## C. Explicit recovery policy; automatic hooks do not invoke the codec` at Prior `b2a931b`). The FJ03a plan's survey read the hooks' imports and found no route. Step 2's executor followed the subprocesses as the review asks and found one, read at `60dbb324`:

| Leg | Where | What happens |
|---|---|---|
| 1 | `hooks/hooks.json`, the PreToolUse entry | runs `hooks/dist/guard.js`; the matcher includes `Task` and `Agent` |
| 2 | `hooks/guard.ts`, the `isDispatchTool` branch | `emitDispatchEvent("task_start", input)` |
| 3 | `hooks/lib/orchestrator-events.ts` | `measureDispatchBytes(root, agent)`, on `task_start` only |
| 4 | `hooks/lib/dispatch-bytes.ts`, `runRulesHelper` | `execFileSync` of `bin/fusion-rules <agent>` |
| 5 | `bin/fusion-rules` | where the project has `rules/context-manifest.yaml`, `resolve_topics` runs |
| 6 | `bin/fusion-rules`, `resolve_topics` | executes `bin/fusion-claimed-package` |

The orchestrator read legs 1 to 6 in the source after the executor's report. The executor ran the route on a scratch copy with the helper replaced by a logging stub: with a context manifest the stub was called once, its parent `bin/fusion-rules code-implementer`; with the manifest removed it was not called.

The route is live when the hook payload carries a session id, the dispatch names a `subagent_type`, the memo under `.guard-state/rule-sizes.json` misses, and the project has a context manifest. This repository has no such manifest; a consuming project may.

Step 3 of the plan puts `bin/fusion-claimed-package` on the codec. From then on a dispatch in such a project would make the PreToolUse hook send `inspect`, `list` and `show`, and a read may finish a committed intent. That is what the answered recovery record excludes. The choice must be made before step 3 runs, and step 2's test has to pin whichever route is chosen, so step 2 waits for it as well.

No other automatic hook entry reaches `bin/fusion-claimed-package`, `bin/fusion-paths`, `bin/fusion-rules` or `bin/fusion-work-order`, by the executor's survey of the six entries in `hooks/hooks.json`.

## Options

1. **The measurement asks `bin/fusion-rules` without topic resolution.** The hook's call carries a flag or an environment value that makes `bin/fusion-rules` skip `resolve_topics`, so the helper is never started from a hook.
   - Pros: the hook stays off the codec by construction, and the test of step 2 can pin it on the real route. The measurement stays where it is.
   - Cons: the measured bytes no longer include the units a topic would select, so the figure on the `task_start` row is a lower bound in a project with a context manifest. `bin/fusion-rules` and `hooks/lib/dispatch-bytes.ts` join the plan's file list.
2. **The measurement leaves the hook.** `task_start` no longer carries the byte figures, or they are computed by something a session calls explicitly.
   - Pros: no hook starts `bin/fusion-rules` at all, which also removes the route for any helper `bin/fusion-rules` calls later.
   - Cons: the monitor loses the per-dispatch byte figures or gets them late. It changes what a hook writes, which is a wider change than FJ03a planned.
3. **The recovery ruling is widened to admit this one route.** The dispatch hook may reach the codec through `bin/fusion-rules`, declared as such.
   - Pros: no code changes beyond the plan.
   - Cons: it reverses what the user and the Prior side ruled on 2026-09-29, and a program that runs unasked could then finish a committed intent. It needs the Prior side's agreement, since its review made the exclusion binding.

## Constraints

- The bundle does not move; the pin both hosts hold stays valid.
- The recovery record stands as answered unless it is superseded by a record of its own.
- Whatever is chosen is pinned by a test that follows subprocess routes, not imports alone.
- `agents/`, `skills/` and `rules/` stay untouched in FJ03a.
