# task_done fires at dispatch launch when the sub-agent runs in the background

---
**Filed by:** claude-code (direct session, Phase 1 follow-up of `refactor/260827-0335-bookkeeping-cost-repair-plan.md`), Kai Stalmann <ks@qantr.com>
**Cross-references:** `hooks/lib/orchestrator-events.ts` (the emitter) · `hooks/tracker.ts` (the PostToolUse caller) · `shared/issues/260827-0410_o_*` (the emission's missing integration coverage — the fix here lands inside the same future test budget)

---

## What was measured (2026-08-27, a consuming project's live session)

First live session on v10.8.0, bugfixer dispatched as a **backgrounded** agent, wall-clock 11m 1s. The machine-written pair:

- `task_start` 04:57:44, `task":"toolu_01Vt9e7HKNkaRtmNExEnX7gW"`, full identity — correct.
- `task_done` **04:57:44**, same second, same fields.

The dispatch tool call returns at launch for a backgrounded agent, so PostToolUse fires immediately and `task_done` records "dispatch accepted", not "task finished". For synchronous dispatches the pair still spans the real duration; nothing is wrong there. Identity, `session_id` and the tool-use id were all confirmed correct on both rows in the same measurement.

## What degrades

The monitor's running-task view and ETA pairing read the start→done span; in background mode every span is zero and a genuinely running task shows as already done. Nothing else reads the pair's duration today.

## The fix candidate, and the measurement it needs first

Claude Code exposes a `SubagentStop` hook event that fires when a sub-agent actually completes. `task_done` moves there (or is emitted there additionally and deduplicated on the `task` id), which makes the pair a real span in both dispatch modes. **Before building: measure the channel** — whether `SubagentStop` delivers in this client version, and whether its payload carries the tool-use id and `session_id` the row needs for pairing and scoping. The session-id analysis (`260825-2214-can-a-hook-obtain-the-session-identifier.md`) is the worked precedent for measuring a hook channel before trusting it; an emitter built on an unmeasured payload is the trap that analysis names.

Until then the row is honest about what it records — a reader can pair `task_start` with the agent-finished evidence in the session history — and no consumer miscounts: `fusion-events turns` reads neither row.

## Acceptance

In a session using backgrounded dispatches, `task_start` and `task_done` for one `task` id are separated by the dispatch's real wall-clock, and a synchronous dispatch keeps today's behaviour; no duplicate `task_done` per id.

## Resolution (260827, v10.8.1)

The channel was measured the same day (`260827-0740-subagentstop-payload-measurement.md`): SubagentStop fires in both modes, carries `agent_id`/`session_id` and no tool-use id, and the backgrounded launch's `tool_response` carries the same `agentId` — the bridge the pairing needed. Built accordingly: the tracker emits `task_done` only for `status: "completed"`; a launched dispatch parks `agentId → {task, agent, detail}` in `.guard-state/dispatch-map.json`, and `hooks/subagent-stop.ts` resolves it at the real stop. The sync-mode event order (SubagentStop before PostToolUse) is what makes duplicates impossible without a heuristic. Proven headlessly on all four cases: launch parks and emits nothing, unknown-agent stop stays silent, mapped stop emits the paired row and clears the entry, a completed sync dispatch keeps today's row.
