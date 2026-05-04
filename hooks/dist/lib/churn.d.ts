/**
 * Churn heatmap tracker for the Compliance Guard.
 *
 * Ported from fusion/reactor/pkg/guard/churn_heatmap.go.
 * Tracks per-file change frequency and thrashing patterns.
 * State persists in state/churn.json across sessions.
 */
/** Per-file churn statistics. */
export interface FileChurnStats {
    totalChanges: number;
    changesThisSession: number;
    lastChange: string;
    thrashingScore: number;
}
/** Top-level churn state persisted to disk. */
export interface ChurnState {
    files: Record<string, FileChurnStats>;
    sessionStart: string;
}
/** Warning level from churn analysis. */
export type ChurnWarningLevel = "info" | "warning" | "critical";
/** A churn warning with affected files and recommendation. */
export interface ChurnWarning {
    level: ChurnWarningLevel;
    message: string;
    files: string[];
    recommendation: string;
}
/** Thresholds for churn analysis, loaded from config. */
export interface ChurnThresholds {
    changesPerSessionWarning: number;
    changesPerSessionCritical: number;
    totalChangesWarning: number;
    totalChangesCritical: number;
}
/** Load churn state from disk. Returns empty state if missing. */
export declare function loadChurn(): ChurnState;
/** Save churn state to disk atomically. */
export declare function saveChurn(state: ChurnState): void;
export declare function recordChange(state: ChurnState, filePath: string): void;
/**
 * Analyze churn patterns and return warnings.
 *
 * Ported from churn_heatmap.go:122-184.
 * Checks per-session and total change counts against thresholds.
 */
export declare function analyzeChurn(state: ChurnState, thresholds?: Partial<ChurnThresholds>): ChurnWarning[];
/**
 * Get the top N files by thrashing score.
 *
 * Ported from churn_heatmap.go:221-239.
 */
export declare function getTopChurnFiles(state: ChurnState, n: number): string[];
/**
 * Reset session-level counters.
 * Call at the start of a new session to keep totalChanges but reset per-session tracking.
 */
export declare function resetSession(state: ChurnState): void;
/** Get the churn state file path (for external tools). */
export declare function getChurnPath(): string;
