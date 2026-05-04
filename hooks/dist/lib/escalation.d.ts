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
/** Load escalation state from disk. Returns empty state if missing. */
export declare function loadEscalation(): EscalationState;
/** Save escalation state to disk atomically. */
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
/** Reset consecutive block counter (called on successful allow). */
export declare function resetBlockCounter(state: EscalationState): void;
/** Clear halt mode (human intervention). */
export declare function clearHalt(state: EscalationState): void;
/** Get the state file path (for external tools). */
export declare function getStatePath(): string;
