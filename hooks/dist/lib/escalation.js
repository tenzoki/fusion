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
function getEscalationPaths() {
    const root = findWorkbenchRoot();
    if (!root)
        return null;
    const stateDir = resolve(root, "fusion-workbench", ".guard-state");
    return { stateDir, statePath: resolve(stateDir, "escalation.json") };
}
/** A fresh empty state. A function, so no caller can share the events array. */
function emptyState() {
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
function coerceState(value) {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
        return emptyState();
    }
    const raw = value;
    const blocks = raw.consecutiveBlocks;
    return {
        haltActive: Boolean(raw.haltActive),
        consecutiveBlocks: typeof blocks === "number" && Number.isFinite(blocks)
            ? Math.max(0, Math.floor(blocks))
            : 0,
        lastBlockTimestamp: typeof raw.lastBlockTimestamp === "string" ? raw.lastBlockTimestamp : null,
        recentEvents: Array.isArray(raw.recentEvents)
            ? raw.recentEvents
            : [],
    };
}
/**
 * Load escalation state from disk. Returns the empty state when the file is
 * missing, when there is no workbench, when the text does not parse, AND when
 * it parses to something that is not an escalation state — see `coerceState`
 * for why that last case is the one worth spelling out.
 */
export function loadEscalation() {
    const paths = getEscalationPaths();
    if (!paths)
        return emptyState();
    try {
        const content = readFileSync(paths.statePath, "utf-8");
        return coerceState(JSON.parse(content));
    }
    catch {
        return emptyState();
    }
}
/** Save escalation state to disk atomically. No-op if no workbench is set up. */
export function saveEscalation(state) {
    const paths = getEscalationPaths();
    if (!paths)
        return;
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
export function isHalted(state) {
    return state.haltActive;
}
/**
 * Record a block event. Returns true if halt was triggered.
 *
 * Ported from escalation.go:150-171:
 * Increments consecutive block counter. If it reaches blocksBeforeHalt,
 * activates halt mode.
 */
export function recordBlock(state, blocksBeforeHalt, trigger, message, toolName, filePath) {
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
export function raiseHalt(state, trigger, message, toolName, filePath) {
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
export function resetBlockCounter(state) {
    state.consecutiveBlocks = 0;
}
/** Clear halt mode (human intervention). */
export function clearHalt(state) {
    state.haltActive = false;
    state.consecutiveBlocks = 0;
    state.recentEvents.push({
        level: "clear",
        trigger: "halt_cleared",
        message: "Halt mode cleared by human intervention",
        timestamp: new Date().toISOString(),
    });
}
