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

export type GuardEventType =
  | "guard_allow"
  | "guard_block"
  | "guard_halt"
  | "guard_advisory"
  | "guard_error"
  | "halt_cleared"
  | "churn_warning"
  | "churn_critical"
  | "tracker_record";

export interface GuardEvent {
  ts: string;
  event: GuardEventType;
  tool?: string;
  file?: string;
  detail?: string;
}

/** Append a single event to the JSONL log. No-op if no workbench is found. */
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

