# A dispatch outside a recorded session writes no event row, and nothing reports it

---
Four recording surfaces are gated on `fusion-workbench/agentstate.yaml` existing. A clean
session close deletes that file, so work continuing in the same conversation runs with all four
silent and no signal that they are. The condition is already computed in the dispatch hook and
discarded there.

---
**Filed by:** consultant, Kai Stalmann <ks@qantr.com>
**Carried upstream from:** `foreign:unite-co-creator:260909-1227_*_work-continuing-after-a-clean-session-close-runs-unrecorded-and-nothing-says-so.md`, where the condition was measured: a session closed at 09:00, then four executor dispatches, five records and six commits landed over the next three and a half hours with nothing recorded.

## The defect

`agents/orchestrator.md:856` deletes `agentstate.yaml` at a clean exit, and `skills/cleanup/SKILL.md:135`
does the same in the pipeline. That is correct: absence means nothing to resume. What follows is
not covered. The orchestrator's Phase 0 writes the file at the top of a session; no step says
*you are now outside one*, and in a long conversation the next unit of work looks like a
continuation of the last.

While the file is absent, each of these returns early and writes nothing:

| Surface | Gate |
|---|---|
| `task_start` / `task_done` per dispatch | `hooks/lib/orchestrator-events.ts:322` |
| session-marker heartbeat, which `/fusion:setup` Step 0c reads | `hooks/lib/orchestrator-events.ts:108` |
| `commit` row per commit | `bin/fusion-commit-lock:299` |
| `bin/fusion-review-coverage` range start | `bin/fusion-review-coverage:8-9`, `session.git_head_at_start` |

None of the four is wrong on its own: the log is a session log, and the helpers' own headers say
so. What is missing is that no surface reports the state. The coverage helper's `why=` line is
the only trace, it is advisory, and in the measured case it was read past.

## The site the condition is already at

`orchestratorSessionInFlight()` (`hooks/lib/orchestrator-events.ts:87`) is called from the
PreToolUse dispatch branch (`hooks/guard.ts:162-165`) on every sub-agent dispatch. A dispatch
implies a session in flight, so a false answer there is exactly this defect, and the hook holds
it before discarding it. It decides on a file's existence, not on any tool argument's text.

The branch writes no advisory today by construction, and deliberately: the comment at
`hooks/guard.ts:158-161` records that a dispatch is not a guarded call, so it sees no advisory
and writes no guard state. Reporting here is a change to that contract, not a gap in it, and it
is what needs deciding before it is built.

## Acceptance

Either a mechanism reports the condition at the first dispatch after a session close, or
`agents/orchestrator.md` names the boundary explicitly and the miss is accepted as a
prompt-level obligation with its rate stated. A third measured instance of commits landing
outside a recorded session reopens this whichever way it went.
