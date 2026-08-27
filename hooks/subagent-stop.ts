/**
 * SubagentStop hook — the backgrounded dispatch's real completion.
 *
 * A backgrounded sub-agent dispatch returns at launch, so the PostToolUse
 * task_done would record "dispatch accepted" and not "task finished" — the
 * first live v10.8.0 session measured an 11-minute bugfixer as a same-second
 * pair (issue `shared/issues/260827-0716_*_task-done-fires-at-dispatch-launch-when-the-sub-agent-runs-in-the-background.md`).
 * This hook fires when the sub-agent actually stops. Its payload was measured
 * before it was trusted (`shared/analyses/260827-0740-subagentstop-payload-measurement.md`,
 * following the session-id precedent): it carries `agent_id`, `agent_type`
 * and `session_id`, and NO tool_use_id — the pairing back to the task_start
 * row travels through the `.guard-state/dispatch-map.json` entry the tracker
 * parked at launch. A sync dispatch's SubagentStop fires BEFORE PostToolUse
 * and finds no entry, so it emits nothing and PostToolUse keeps that row;
 * the ordering, not a heuristic, is what prevents duplicates.
 * `lib/orchestrator-events.ts` carries the whole mechanism.
 *
 * Protocol: reads JSON from stdin, writes nothing to stdout — this event has
 * no verdict to give and no model channel to fill. Fail open, like the other
 * hooks: a lost completion row is a defined degradation (the pair falls back
 * to launch-time semantics), a SubagentStop that takes the session down is
 * not.
 */

import { emitSubagentStop } from "./lib/orchestrator-events.js";
import { failOpen } from "./lib/fail-open.js";

async function main(): Promise<void> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) chunks.push(chunk as Buffer);
  const raw = Buffer.concat(chunks).toString("utf-8").trim();
  if (!raw) return;

  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    return; // Unparseable payload — nothing is known, so nothing is written.
  }
  if (typeof payload !== "object" || payload === null) return;
  emitSubagentStop(payload as Parameters<typeof emitSubagentStop>[0]);
}

main().catch((err) => {
  failOpen("subagent-stop", err, () => {});
});
