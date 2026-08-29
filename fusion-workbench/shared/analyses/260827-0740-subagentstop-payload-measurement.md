# Can SubagentStop carry the backgrounded dispatch's task_done? — the payload, measured

---
**Filed by:** claude-code (direct session, follow-up to `260827-0716_*_task-done-fires-at-dispatch-launch-when-the-sub-agent-runs-in-the-background.md`), Kai Stalmann <ks@qantr.com>

---

## Method

A throwaway project outside every git tree, with project-level `.claude/settings.json` hooks that append each event's raw stdin payload to a probe log: `SubagentStop` (no matcher), and `PreToolUse`/`PostToolUse` matched on `Task|Agent`. Two headless `claude -p` runs against Claude Code 2.1.x on 2026-08-27: one synchronous dispatch ("reply PONG"), one explicitly backgrounded dispatch (`sleep 8`, then PONG). Findings read from the probe log, not from the model's testimony — the same discipline as the session-id measurement (`260825-2214-can-a-hook-obtain-the-session-identifier.md`).

## Findings

**(a) SubagentStop fires in both modes, and carries no tool_use_id.** Its payload: `session_id`, `cwd` (the project root, so the workbench walk works), `agent_id`, `agent_type` (`general-purpose` in the probe), `agent_transcript_path`, `last_assistant_message`, `stop_hook_active`, `background_tasks`, `session_crons`. No `tool_use_id`, no `tool_input`.

**(b) Event order differs by mode, and the difference is load-bearing.**
- Synchronous: PreToolUse → **SubagentStop** → PostToolUse. PostToolUse fires after the agent finished, with `tool_response.status: "completed"` and a real `duration_ms` (2,282 in the probe).
- Backgrounded: PreToolUse → PostToolUse (at launch: `duration_ms: 4`, `tool_response.status: "async_launched"`, `isAsync: true`) → **SubagentStop** at the actual completion.

**(c) The bridge exists: the launch response names the agent.** The backgrounded PostToolUse `tool_response` carries `agentId` — the same value SubagentStop later delivers as `agent_id` (`a9d4235baf3f26612` on both sides of the probe). `tool_use_id` and `agentId` meet in that one payload, so a launch-time mapping is enough to give the completion row the pairing id.

## What was built on it

`hooks/tracker.ts` emits `task_done` only for `status: "completed"`; a launched dispatch parks `agentId → {task, agent, detail}` in `.guard-state/dispatch-map.json` (24 h TTL against crashed sessions). `hooks/subagent-stop.ts` resolves the mapping at the real stop and emits the row; a sync SubagentStop precedes any mapping entry, finds nothing, and stays silent — the ordering in (b), not a dedup heuristic, is what prevents double rows. Mechanism: `hooks/lib/orchestrator-events.ts`.

## What was not measured

Whether `agent_type` carries the `fusion:` prefix for plugin agents (the probe dispatched `general-purpose`); the emitter therefore takes `agent` from the launch mapping's `tool_input.subagent_type`, which is measured, and reads `agent_type` not at all. And client versions other than the one probed — the hook fails open and the degradation is the pre-fix behaviour, a pair that records the launch.
