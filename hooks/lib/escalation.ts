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

import { findWorkbenchRoot } from "./workbench-root.js";
import {
  isStateObject,
  loadGuardState,
  nonNegativeCount,
  saveGuardState,
} from "./guard-state-file.js";

/**
 * Escalation state lives in `<project-root>/fusion-workbench/.guard-state/escalation.json`,
 * resolved by the shared seam in `guard-state-file.ts` — which returns the
 * empty state and no-ops the write when no `.fusion-setup` marker is found
 * upward, so plain Claude sessions in non-fusion-set-up directories never
 * bootstrap stray workbenches.
 *
 * The seam's own header used to record that this module kept a private copy of
 * the load and the save "for now", pending the open work that is this merge.
 * That work is here, and it needs to READ the file at save time — so the second
 * reader would have been a second copy of exactly what the seam exists to end.
 */
const ESCALATION_FILE = "escalation.json";

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
  if (!isStateObject(value)) return emptyState();
  const raw = value;
  return {
    haltActive: Boolean(raw.haltActive),
    consecutiveBlocks: nonNegativeCount(raw.consecutiveBlocks),
    // NOT `optionalTimestamp`. That primitive additionally requires the string
    // to parse as a date, which `churn.ts` needs because it computes a session
    // age from its own timestamp. Nothing computes anything from this one — it
    // is displayed by `clear-halt.ts` and no more — so tightening it here would
    // be a behaviour change with no defect behind it.
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
 * `guardStatePath` in `guard-state-file.ts` finds by walking up from the
 * working directory.
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
 * What the file said when a state object was handed out, so a later save can
 * tell what ANOTHER writer added from what THIS caller added.
 *
 * `eventCount` indexes the caller's own `recentEvents`: everything from that
 * index on was pushed by this caller since the load. `haltActive` is the halt
 * the caller was shown, which is how a halt raised in the meantime is told
 * apart from the one a caller is deliberately clearing.
 */
interface LoadBaseline {
  haltActive: boolean;
  eventCount: number;
}

/**
 * Keyed on the state object itself, so no call site changes and nothing is
 * added to the serialised shape. A hand-built state that never came from
 * `loadEscalation` simply has no entry — see `saveEscalation` for what it then
 * assumes and why that direction is the safe one.
 */
const baselines = new WeakMap<EscalationState, LoadBaseline>();

/**
 * Load escalation state from disk. Returns the empty state when the file is
 * missing, when there is no workbench, when the text does not parse, AND when
 * it parses to something that is not an escalation state — see `coerceState`
 * for why that last case is the one worth spelling out.
 */
export function loadEscalation(): EscalationState {
  const state = loadGuardState(ESCALATION_FILE, coerceState);
  baselines.set(state, {
    haltActive: state.haltActive,
    eventCount: state.recentEvents.length,
  });
  return state;
}

/**
 * Save escalation state to disk atomically, WITHOUT discarding what another
 * process wrote since this state was loaded. No-op if no workbench is set up.
 *
 * ## The lost update this exists to prevent
 *
 * The rename makes each write atomic against a reader; it does nothing about a
 * lost update, because what is written is the whole state object the caller is
 * holding. `guard.ts` holds that object across the entire PreToolUse decision —
 * it loads before CHECK 1 and the allow path saves at the very end — and
 * `tracker.ts` loads, calls `raiseHalt` and saves inside that window whenever
 * the measurement finds a protected path changed. A blind write of the guard's
 * object then puts `haltActive: false` back over a halt that was correctly
 * raised, takes its `recentEvents` entry with it, and leaves the `guard_halt`
 * row in `events.jsonl` describing a halt no longer recorded (issue
 * `260809-1101_*_escalation-json-read-modify-write-can-lose-a-halt-raised-by-a-parallel-tool-call.md`).
 *
 * `speculation:` that interleaving is not measured. The read-modify-write shape
 * is plain in the code; whether Claude Code runs two guarded tool calls close
 * enough together for it to happen, and how often, is unknown — the hook
 * payload carries no per-call correlation key to measure it with. The fix is
 * cheap enough not to need the frequency, but nothing here should be read as
 * evidence that it has been observed.
 *
 * ## What the merge preserves, and what it deliberately does not
 *
 * PRESERVED — a halt that appeared on disk after this state was loaded. It is
 * adopted rather than overwritten, which makes `haltActive` monotonic within
 * one call, the direction `coerceState` already argues for. The test is
 * "newly raised", not "raised": a caller that loaded a halt and is now writing
 * `false` — `clear-halt.ts`, the human intervention — meant to clear it, and
 * an unconditional OR would resurrect a halt the user just cleared.
 *
 * PRESERVED — events another writer appended. Every mutation in this module is
 * an append, so the merge needs no event identity: the disk list is the trunk
 * and this caller's events since its own load are re-applied on top, in that
 * order. Without this the adopted halt would arrive with no entry explaining
 * it.
 *
 * NOT preserved — `consecutiveBlocks` and `lastBlockTimestamp`, which are
 * last-writer-wins. A lost increment costs counter accuracy: the threshold halt
 * arrives one block later than it might have. That is the same trade the
 * counters in `churn.ts` and `cross-file.ts` make with the same shape, and it
 * is left alone for the same reason — the boundary the guard actually enforces
 * is the outright halt above, not the count that approaches one.
 *
 * ## The window this shrinks rather than closes
 *
 * The re-read and the rename are two operations, so a halt raised BETWEEN them
 * is still lost. What changes is the size of the window: from the whole
 * PreToolUse decision — every check, every config read, every path match — down
 * to the two calls below. Only a lock closes it completely, and taking one
 * around every guarded tool call buys the remaining microseconds at the price of
 * serialising the guard and owning a stale-lock story (`bin/fusion-commit-lock`
 * has one, for a surface where contention is the normal case rather than the
 * rare one). That trade was declined here; a lock stays available if the window
 * is ever measured to matter.
 *
 * ## Two things the caller can rely on afterwards
 *
 * The caller's object is updated to what was written, so the state in hand and
 * the state on disk do not silently disagree, and a second save from the same
 * object appends only what was pushed after the first. Nothing re-decides the
 * tool call in flight: a guard that discovers an adopted halt here has already
 * allowed this call, and the halt takes effect on the next one, where CHECK 1
 * reads it.
 *
 * A state object with no recorded baseline — hand-built rather than loaded — is
 * read as "loaded from an empty file, not halted": all of its events are
 * treated as this caller's appends, and any halt on disk counts as newly
 * raised. Both defaults fail toward keeping what is already recorded.
 */
export function saveEscalation(state: EscalationState): void {
  const baseline = baselines.get(state) ?? { haltActive: false, eventCount: 0 };
  const onDisk = loadGuardState(ESCALATION_FILE, coerceState);

  const merged: EscalationState = {
    haltActive: state.haltActive || (onDisk.haltActive && !baseline.haltActive),
    consecutiveBlocks: state.consecutiveBlocks,
    lastBlockTimestamp: state.lastBlockTimestamp,
    recentEvents: [
      ...onDisk.recentEvents,
      ...state.recentEvents.slice(baseline.eventCount),
    ].slice(-MAX_RECENT_EVENTS),
  };

  saveGuardState(ESCALATION_FILE, merged);

  state.haltActive = merged.haltActive;
  state.recentEvents = merged.recentEvents;
  baselines.set(state, {
    haltActive: merged.haltActive,
    eventCount: merged.recentEvents.length,
  });
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

