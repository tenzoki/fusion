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
export declare function clearHaltCommand(): string;
/**
 * Load escalation state from disk. Returns the empty state when the file is
 * missing, when there is no workbench, when the text does not parse, AND when
 * it parses to something that is not an escalation state — see `coerceState`
 * for why that last case is the one worth spelling out.
 */
export declare function loadEscalation(): EscalationState;
/** Save escalation state to disk atomically. No-op if no workbench is set up. */
export declare function saveEscalation(state: EscalationState): void;
/** Check if the guard is in halt mode. */
export declare function isHalted(state: EscalationState): boolean;
/**
 * Record a block event. Returns true if halt was triggered.
 *
 * Ported from escalation.go:150-171:
 * Increments consecutive block counter. If it reaches blocksBeforeHalt,
 * activates halt mode.
 */
export declare function recordBlock(state: EscalationState, blocksBeforeHalt: number, trigger: string, message: string, toolName?: string, filePath?: string): boolean;
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
export declare function raiseHalt(state: EscalationState, trigger: string, message: string, toolName?: string, filePath?: string): void;
/** Reset consecutive block counter (called on successful allow). */
export declare function resetBlockCounter(state: EscalationState): void;
/** Clear halt mode (human intervention). */
export declare function clearHalt(state: EscalationState): void;
