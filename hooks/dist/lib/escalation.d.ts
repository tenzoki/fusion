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
