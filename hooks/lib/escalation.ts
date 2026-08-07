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
import { findWorkbenchRoot } from "./workbench-root.js";

/**
 * Escalation state lives in `<project-root>/fusion-workbench/.guard-state/escalation.json`.
 * Returns null if no `.fusion-setup` marker is found upward — every state
 * operation becomes a no-op so plain Claude sessions in non-fusion-set-up
 * directories never bootstrap stray workbenches.
 */
function getEscalationPaths(): { stateDir: string; statePath: string } | null {
  const root = findWorkbenchRoot();
  if (!root) return null;
  const stateDir = resolve(root, "fusion-workbench", ".guard-state");
  return { stateDir, statePath: resolve(stateDir, "escalation.json") };
}

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

/** A fresh empty state. A function, so no caller can share the events array. */
function emptyState(): EscalationState {
  return {
    haltActive: false,
    consecutiveBlocks: 0,
    lastBlockTimestamp: null,
    recentEvents: [],
  };
}

const MAX_RECENT_EVENTS = 10;

/**
 * Coerce an arbitrary parsed JSON value into an EscalationState.
 *
 * ## Why this is not an `as` cast
 *
 * `JSON.parse(...) as EscalationState` used to be the whole of the load, and
 * the cast told the type checker not to care. The `try/catch` around it handles
 * a MISSING file and UNPARSEABLE text; it does not handle text that parses to a
 * perfectly valid JSON value of the wrong SHAPE. Every later access then threw
 * — `state.recentEvents.push(…)` on `undefined`, `state.haltActive` on `null` —
 * and `guard.ts`'s `main().catch` fails OPEN: it prints one stderr line and
 * emits `{}`, which Claude Code reads as ALLOW. Measured on the shipped guard,
 * one seeded file per row, attacking a plainly protected path:
 *
 *     {}                          Edit ALLOW   Bash rm ALLOW
 *     {…} without recentEvents    Edit ALLOW   Bash rm ALLOW
 *     {"recentEvents":{}}         Edit ALLOW   Bash rm ALLOW
 *     null                        Edit ALLOW   Bash rm ALLOW
 *     truncated JSON              deny         deny
 *     empty file                  deny         deny
 *
 * The two rows that behaved were the two the `catch` was written for; every row
 * that failed open was well-formed JSON. The failure was total — the whole
 * protected list, both surfaces, and an active halt was not consulted either.
 *
 * ## What this does instead
 *
 * Coerce rather than trust: require an object, default every field, force
 * `recentEvents` to an array. A well-formed file round-trips unchanged, so
 * there is NO behaviour change for the ordinary case; every malformed row above
 * reads as the empty state, which is the correct reading of "this file tells me
 * nothing". This deliberately does NOT change the fail-open policy in
 * `guard.ts` — whether an unreadable state file should deny rather than allow
 * is a separate question that wants a decision record, not a patch.
 *
 * ## The two coercions that lean restrictive, on purpose
 *
 * `haltActive` reads any truthy value as halted rather than testing `=== true`.
 * A halt is the RESTRICTIVE state and a user can always clear it with
 * `clear-halt.js`; silently un-halting a project because someone hand-edited
 * `"haltActive": "true"` is the worse of the two errors. `consecutiveBlocks` is
 * clamped to a non-negative integer for the same reason: a negative or
 * fractional count read verbatim would push the halt threshold further away.
 *
 * Elements of `recentEvents` are NOT validated. They are appended to, trimmed
 * and re-serialised, and only `clear-halt.ts` ever reads their fields — where a
 * garbage element prints `undefined` in a template string rather than throwing.
 * Validating them would buy nothing this function exists to buy.
 */
function coerceState(value: unknown): EscalationState {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return emptyState();
  }
  const raw = value as Record<string, unknown>;
  const blocks = raw.consecutiveBlocks;
  return {
    haltActive: Boolean(raw.haltActive),
    consecutiveBlocks:
      typeof blocks === "number" && Number.isFinite(blocks)
        ? Math.max(0, Math.floor(blocks))
        : 0,
    lastBlockTimestamp:
      typeof raw.lastBlockTimestamp === "string" ? raw.lastBlockTimestamp : null,
    recentEvents: Array.isArray(raw.recentEvents)
      ? (raw.recentEvents as EscalationEvent[])
      : [],
  };
}

/**
 * The command that clears a halt, spelled with BOTH directories in it.
 *
 * ## Why the `cd` is part of the command
 *
 * The halt is project-scoped — it is recorded in
 * `<project-root>/fusion-workbench/.guard-state/escalation.json`, which
 * `getEscalationPaths` above finds by walking up from the working directory.
 * The clearing script is plugin-scoped, and every halt message used to name
 * only the plugin half. A user read `node <plugin-root>/…/clear-halt.js`,
 * ran it from their home directory, and was told `Guard is not halted. No
 * action needed.` while the halt stood untouched in the project (issue
 * 260805-1134). Nothing in the message had said the working directory
 * decides, so the correct command at the wrong place looked like success.
 *
 * `clear-halt.ts` now refuses that case outright. This function is the other
 * half: the message a user actually reads names the project directory too, so
 * the mistake is harder to make than it is to diagnose.
 *
 * ## Why it lives here
 *
 * Two hooks raise a halt — `guard.ts` on the third consecutive block and
 * `tracker.ts` on a measured protected-path change — and both have to say how
 * to clear it. One authoring site, next to the state the command acts on, so a
 * third caller cannot start telling users something different.
 *
 * Both directories degrade to a placeholder rather than being omitted:
 * `CLAUDE_PLUGIN_ROOT` is exported by the SessionStart hook and is normally
 * set, and a halt is only ever readable when a workbench exists, so neither
 * fallback is the expected path. A placeholder that is visibly a blank keeps
 * the shape of the command intact where a dropped clause would quietly teach
 * the wrong invocation.
 */
export function clearHaltCommand(): string {
  const pluginRoot = process.env.CLAUDE_PLUGIN_ROOT ?? "<plugin-root>";
  const projectRoot = findWorkbenchRoot() ?? "<project-root>";
  return `cd ${projectRoot} && node ${pluginRoot}/hooks/dist/clear-halt.js`;
}

/**
 * Load escalation state from disk. Returns the empty state when the file is
 * missing, when there is no workbench, when the text does not parse, AND when
 * it parses to something that is not an escalation state — see `coerceState`
 * for why that last case is the one worth spelling out.
 */
export function loadEscalation(): EscalationState {
  const paths = getEscalationPaths();
  if (!paths) return emptyState();
  try {
    const content = readFileSync(paths.statePath, "utf-8");
    return coerceState(JSON.parse(content));
  } catch {
    return emptyState();
  }
}

/** Save escalation state to disk atomically. No-op if no workbench is set up. */
export function saveEscalation(state: EscalationState): void {
  const paths = getEscalationPaths();
  if (!paths) return;

  mkdirSync(paths.stateDir, { recursive: true });

  // Trim recent events to max
  if (state.recentEvents.length > MAX_RECENT_EVENTS) {
    state.recentEvents = state.recentEvents.slice(-MAX_RECENT_EVENTS);
  }

  // Atomic write: write to temp then rename
  const tmpPath = `${paths.statePath}.tmp`;
  writeFileSync(tmpPath, JSON.stringify(state, null, 2), "utf-8");
  renameSync(tmpPath, paths.statePath);
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

/**
 * Raise the halt immediately, without counting toward the threshold.
 *
 * ## Why this is not `recordBlock`
 *
 * `recordBlock` models a REFUSED tool call: nothing happened, and three of them
 * in a row are the evidence that an agent is pushing against the guard rather
 * than working. The measurement in `tracker.ts` reports the opposite situation —
 * a protected path was ACTUALLY WRITTEN and had to be put back. There
 * is no "two more of these and we will do something about it": the boundary is
 * already crossed, and the write happened before anyone could refuse it.
 *
 * So the transition is its own, and it lives here rather than inline at the
 * caller because every other mutation of `haltActive` and `recentEvents` does.
 * A second place that knows the shape of this state is a second place that can
 * drift from it.
 *
 * `consecutiveBlocks` is deliberately NOT touched. It counts refusals, this was
 * not one, and inflating it would make the next ordinary block halt early for a
 * reason its own message could not explain.
 */
export function raiseHalt(
  state: EscalationState,
  trigger: string,
  message: string,
  toolName?: string,
  filePath?: string,
): void {
  state.haltActive = true;
  state.recentEvents.push({
    level: "halt",
    trigger,
    message,
    timestamp: new Date().toISOString(),
    toolName,
    filePath,
  });
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

