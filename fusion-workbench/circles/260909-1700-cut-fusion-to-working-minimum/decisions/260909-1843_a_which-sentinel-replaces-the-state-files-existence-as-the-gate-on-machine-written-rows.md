# Which sentinel replaces the state file's existence as the gate on machine-written rows?

---
**Domain:** code
**Filed by:** planner, Kai Stalmann <kai@qantr.com>
**Cross-references:** `260909-1615_*_spec-cut-fusion-to-a-working-minimum.md` `### C1: The session has no procedure` delegates this choice to the planner and names the two candidates. `260909-1454_*_a-dispatch-outside-a-recorded-session-writes-no-event-row-and-nothing-reports-it.md` is the measured failure of the current sentinel. `260909-1843_*_implementation-cut-fusion-to-a-working-minimum.md` step B2 realises the answer.

---

## Question

`orchestratorSessionInFlight(root)` in `hooks/lib/orchestrator-events.ts` is one `existsSync` on
`fusion-workbench/agentstate.yaml`, and it gates five machine-written surfaces: the `task_start`
and `task_done` pair, the async dispatch pairing, the `SubagentStop` row, the session-marker
heartbeat, and the `commit` row `bin/fusion-commit-lock` writes. C1 removes the file. Deleting it
with no replacement stops every machine-written row, which makes C4's only trace, C8's per-dispatch
row and C9's presence reader unsatisfiable at once.

## Options

1. **The session marker `fusion-workbench/.session-marker`.** Its mtime is already refreshed by
   the PostToolUse hook.
   - Pros: a file, so the predicate stays one `existsSync`; already carries a liveness signal.
   - Cons: it is *created* by `bin/fusion-session-mark write`, called from `/fusion:setup` Step 0c,
     which is a skill body and therefore model work. It fails the spec's own requirement that the
     sentinel not be a file an agent can decline to write, and it fails it in exactly the way the
     current sentinel already failed measurably.
2. **The session identifier the hook payload carries.** `hooks/session-id.ts` exports
   `FUSION_SESSION_ID` at SessionStart, and the payload carries `session_id` on every tool event
   (measured; that file's header records it).
   - Pros: written by the harness, not by fusion and not by a model, so no agent can decline it or
     skip it under task pressure. Present on the first tool call of a session, before any model
     step. Its absence is a condition the guard can report through the `guard_advisory` channel it
     already has.
   - Cons: it does not distinguish an orchestrator session from a plain Claude session in the same
     project, so a plain session's dispatches also write rows.
3. **A new hook-written sentinel file.** SessionStart writes a marker; the predicate reads it.
   - Pros: keeps the orchestrator/plain distinction.
   - Cons: a third state file in a capability whose point is that there is one trace; and the
     distinction it preserves is one the design after C1 no longer has, since no session is an
     "orchestrator session" once the procedure is gone.

## Constraints

- The sentinel must be machine-written and not declinable by a model (spec C1).
- Its absence must be a reported condition, not a silently empty log (spec C1).
- It must be readable inside a PreToolUse hook with no subprocess, since C8 puts three byte counts
  on the same row and the hook's per-call cost is an acceptance criterion.
- `agentstate.yaml` may not be read by it: the file is removed by the same capability.

## Recommendation

Option 2, and the cost stated plainly. Option 1 fails the spec's requirement outright — the marker
is model-created and only its refresh is mechanical, so adopting it would carry the measured defect
of `260909-1454` into the design that depends on the sentinel more heavily than today's does.
Option 3 buys a distinction that C1 abolishes.

Option 2's cost is that the log stops being orchestrator-scoped and becomes project-scoped: every
dispatch in a workbench-bearing project writes a row. That is not a regression but the fix filed as
`260909-1454`, which is a complaint that a dispatch outside a recorded session writes nothing. Rows
already carry `session_id`, so a reader that wants one session's rows scopes on it, and
`bin/fusion-events` already reads by identity on each line rather than by position. The rename of
`orchestrator-events.jsonl` is deliberately **not** proposed: the file name is load-bearing in
`rules/workbench-tracking.md`, in the union merge driver and in every consumer, and a name is a
cheaper inaccuracy than a migration.

---
Answered: 260909-1843_*_which-sentinel-replaces-the-state-files-existence-as-the-gate-on-machine-written-rows.md `## Question` — option 2, the session identifier carried on the hook payload, with the log becoming project-scoped and the file keeping its name. Ruled by planner under the delegation in the spec's C1 ("the choice is the planner's"); unrealised until step B2 of `260909-1843_*_implementation-cut-fusion-to-a-working-minimum.md` commits.
