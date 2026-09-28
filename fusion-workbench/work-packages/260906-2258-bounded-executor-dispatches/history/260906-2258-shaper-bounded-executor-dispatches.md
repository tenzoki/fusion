# Shaper session: bounded executor dispatches

**Date:** 2026-09-06 22:58
**Agent:** shaper, anticipated-circle mode
**Filed by:** shaper, Kai Stalmann <ks@qantr.com>
**Draft source:** `260814-1733_*_bounded-executor-dispatches.md`
**Result:** Circle `260906-2258-bounded-executor-dispatches`, record `_a_circle.md`

## What the draft carried

The backlog entry held one idea, so it was promotable whole. Its own body already performed the narrowing this Circle needed: the bounded-dispatch half adopted on cost grounds, the re-injection half refuted by `260812-0303-simplify-speed-and-why-rules-do-not-hold.md`, and an explicit instruction that shaping means putting the narrower Directive to the user and getting agreement on it.

## Clarifications

One round, three questions, answered by the user before this run began and relayed with the dispatch.

1. **Scope.** Shorter runs only. The re-injection half stays out.
2. **Where the bound bites.** Inside the run: the executor gives back control at the boundary, half finished included, and is re-dispatched.
3. **What must be proven at closure.** The existing calculation counts as the evidence; only its assumptions are checked. The user rejected a before-and-after measurement because the event log carries no token field and no per-tool-call rows, so such a measurement would have required instrumentation first.

No second round was run. An anticipated Circle carries a provisional Directive by construction, and the two residual scope questions (which executors the bound covers, what unit it is expressed in) are named in the record for the spec at activation rather than guessed here.

## Verification performed in this run

Read over all 2951 lines of `orchestrator-events.jsonl`: the field roster contains no token field, and the event roster contains no per-tool-call event, so duration is the only measurable quantity per dispatch. Both confirm what the dispatch relayed. `.guard-state/events.jsonl` was opened as well; it carries `session_id` per row, and whether a sub-agent's tool calls reach it is not established by this run and is recorded as an open measurement for the plan.

## Backlog entry closed

`260814-1733_*_bounded-executor-dispatches.md` renamed from `_p_` to `_c_` with a `Promoted:` line appended, in the same command as the Circle creation.

## Not done

No spec, no plan, no activation. The record stays `_a_` and `.active-circle` was not touched.
