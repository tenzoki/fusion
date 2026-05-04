/**
 * Append-only event logger for the Compliance Guard.
 *
 * Writes JSONL to state/events.jsonl. Each line is a self-contained
 * JSON object with timestamp, event type, and context.
 */

import { appendFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Event log is project-local: stored in fusion-workbench/.guard-state/ under
 * the project root (process.cwd()), NOT in the plugin cache directory.
 */
const STATE_DIR = resolve(process.cwd(), "fusion-workbench", ".guard-state");
const EVENTS_PATH = resolve(STATE_DIR, "events.jsonl");

export type GuardEventType =
  | "guard_allow"
  | "guard_block"
  | "guard_halt"
  | "guard_advisory"
  | "guard_error"
  | "halt_cleared"
  | "churn_warning"
  | "churn_critical"
  | "cross_file_warning"
  | "cross_file_critical"
  | "tracker_record";

export interface GuardEvent {
  ts: string;
  event: GuardEventType;
  tool?: string;
  file?: string;
  detail?: string;
}

/** Append a single event to the JSONL log. */
export function emitEvent(
  event: GuardEventType,
  tool?: string,
  file?: string,
  detail?: string,
): void {
  mkdirSync(STATE_DIR, { recursive: true });

  const entry: GuardEvent = {
    ts: new Date().toISOString(),
    event,
    ...(tool && { tool }),
    ...(file && { file }),
    ...(detail && { detail }),
  };

  appendFileSync(EVENTS_PATH, JSON.stringify(entry) + "\n", "utf-8");
}

/** Get the events file path (for external tools). */
export function getEventsPath(): string {
  return EVENTS_PATH;
}
