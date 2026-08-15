/**
 * Append-only event logger for the Compliance Guard.
 *
 * Writes JSONL to state/events.jsonl. Each line is a self-contained
 * JSON object with timestamp, event type, and context.
 *
 * No-op when no fusion workbench is set up at or above the current
 * working directory (i.e. the project never ran `/fusion:setup`).
 */

import { appendFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { findWorkbenchRoot } from "./workbench-root.js";

function getEventsPath(): { stateDir: string; eventsPath: string } | null {
  const root = findWorkbenchRoot();
  if (!root) return null;
  const stateDir = resolve(root, "fusion-workbench", ".guard-state");
  return { stateDir, eventsPath: resolve(stateDir, "events.jsonl") };
}

/**
 * `state_drift` is the one entry here that is also emitted by something other
 * than a hook. `agents/orchestrator.md` emits it into
 * `fusion-workbench/orchestrator-events.jsonl` when its own Drift check finds a
 * diverging row; `hooks/tracker.ts` emits it here, into
 * `.guard-state/events.jsonl`, when the same measurement fires without being
 * asked. One concept, one name, two logs — the monitor reads the guard log for
 * its warnings panel and the orchestrator log for its event list, so a drift is
 * visible in the panel whichever caller measured it.
 */
export type GuardEventType =
  | "guard_allow"
  | "guard_block"
  | "guard_halt"
  | "guard_advisory"
  | "guard_error"
  | "halt_cleared"
  | "state_drift"
  | "review_coverage"
  | "staging_drift"
  | "tracker_record";

export interface GuardEvent {
  ts: string;
  event: GuardEventType;
  tool?: string;
  file?: string;
  detail?: string;
}

/**
 * Append a single event to the JSONL log. No-op if no workbench is found.
 *
 * **There is no line or byte ceiling here, and none may be added.** Not as a
 * convenience, not as a "reasonable default", not as part of an unrelated
 * change. Every ceiling expressible in lines or bytes discards the OLDEST lines
 * first, and the oldest lines are the `guard_block`, `guard_halt` and
 * `halt_cleared` events — 0.6 % of the file at the measurement that settled
 * this, and the only lines recording the guard ever enforcing anything. A guard
 * that forgets it halted is a strange guard.
 *
 * What bounds the file instead is `/fusion:archive`, which rolls the live log
 * into the archive store under a dated name and starts a fresh empty one. The
 * log is classified as evidence, not telemetry, in
 * `rules/fusion-workbench-conventions.md` `### Which of them a tracked
 * workbench tracks`; the reasoning and the three rejected alternatives are in
 * decision
 * `shared/decisions/260811-1534_*_does-the-guard-event-log-get-an-upper-bound-and-what-happens-to-the-evidence-in-it.md`.
 *
 * A roll may move the file out from under this function between calls. That is
 * safe by construction: it opens, appends and closes on every call rather than
 * holding a descriptor, and `mkdirSync` + `appendFileSync` re-create both the
 * directory and the file.
 */
export function emitEvent(
  event: GuardEventType,
  tool?: string,
  file?: string,
  detail?: string,
): void {
  const paths = getEventsPath();
  if (!paths) return;

  mkdirSync(paths.stateDir, { recursive: true });

  const entry: GuardEvent = {
    ts: new Date().toISOString(),
    event,
    ...(tool && { tool }),
    ...(file && { file }),
    ...(detail && { detail }),
  };

  appendFileSync(paths.eventsPath, JSON.stringify(entry) + "\n", "utf-8");
}

