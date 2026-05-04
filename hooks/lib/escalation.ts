/**
 * Escalation state manager for the Compliance Guard.
 *
 * Ported from fusion/reactor/pkg/guard/escalation.go.
 * Manages halt state and consecutive block tracking via JSON file.
 *
 * Escalation levels:
 *   block — single tool call blocked
 *   halt  — ALL tool calls blocked until human clears
 *   clear — halt cleared by human intervention
 *
 * 3 consecutive blocks auto-escalate to halt (configurable).
 */

import { readFileSync, writeFileSync, renameSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

/**
 * State is project-local: stored in fusion-workbench/.guard-state/ under the
 * project root (process.cwd()), NOT in the plugin cache directory.
 * This ensures each project has its own halt state, block counters, etc.
 */
const STATE_DIR = resolve(process.cwd(), "fusion-workbench", ".guard-state");
const STATE_PATH = resolve(STATE_DIR, "escalation.json");

export interface EscalationEvent {
  level: "block" | "halt" | "clear";
  trigger: string;
  message: string;
  timestamp: string;
  toolName?: string;
  filePath?: string;
}

export interface EscalationState {
  haltActive: boolean;
  consecutiveBlocks: number;
  lastBlockTimestamp: string | null;
  recentEvents: EscalationEvent[];
}

const EMPTY_STATE: EscalationState = {
  haltActive: false,
  consecutiveBlocks: 0,
  lastBlockTimestamp: null,
  recentEvents: [],
};

const MAX_RECENT_EVENTS = 10;

/** Load escalation state from disk. Returns empty state if missing. */
export function loadEscalation(): EscalationState {
  try {
    const content = readFileSync(STATE_PATH, "utf-8");
    return JSON.parse(content) as EscalationState;
  } catch {
    return { ...EMPTY_STATE, recentEvents: [] };
  }
}

/** Save escalation state to disk atomically. */
export function saveEscalation(state: EscalationState): void {
  mkdirSync(STATE_DIR, { recursive: true });

  // Trim recent events to max
  if (state.recentEvents.length > MAX_RECENT_EVENTS) {
    state.recentEvents = state.recentEvents.slice(-MAX_RECENT_EVENTS);
  }

  // Atomic write: write to temp then rename
  const tmpPath = `${STATE_PATH}.tmp`;
  writeFileSync(tmpPath, JSON.stringify(state, null, 2), "utf-8");
  renameSync(tmpPath, STATE_PATH);
}

/** Check if the guard is in halt mode. */
export function isHalted(state: EscalationState): boolean {
  return state.haltActive;
}

/**
 * Record a block event. Returns true if halt was triggered.
 *
 * Ported from escalation.go:150-171:
 * Increments consecutive block counter. If it reaches blocksBeforeHalt,
 * activates halt mode.
 */
export function recordBlock(
  state: EscalationState,
  blocksBeforeHalt: number,
  trigger: string,
  message: string,
  toolName?: string,
  filePath?: string,
): boolean {
  const now = new Date().toISOString();

  state.consecutiveBlocks++;
  state.lastBlockTimestamp = now;

  state.recentEvents.push({
    level: "block",
    trigger,
    message,
    timestamp: now,
    toolName,
    filePath,
  });

  const shouldHalt = state.consecutiveBlocks >= blocksBeforeHalt;

  if (shouldHalt) {
    state.haltActive = true;
    state.recentEvents.push({
      level: "halt",
      trigger: "consecutive_blocks",
      message: `${state.consecutiveBlocks} consecutive tool calls blocked — halt activated`,
      timestamp: now,
    });
  }

  return shouldHalt;
}

/** Reset consecutive block counter (called on successful allow). */
export function resetBlockCounter(state: EscalationState): void {
  state.consecutiveBlocks = 0;
}

/** Clear halt mode (human intervention). */
export function clearHalt(state: EscalationState): void {
  state.haltActive = false;
  state.consecutiveBlocks = 0;
  state.recentEvents.push({
    level: "clear",
    trigger: "halt_cleared",
    message: "Halt mode cleared by human intervention",
    timestamp: new Date().toISOString(),
  });
}

/** Get the state file path (for external tools). */
export function getStatePath(): string {
  return STATE_PATH;
}
