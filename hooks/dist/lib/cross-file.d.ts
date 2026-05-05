/**
 * Cross-file ping-back tracker for the Compliance Guard.
 *
 * Detects circular / paired-touch edit patterns: a file is edited, then
 * a different file is edited, then the original file is edited again.
 * Each "return visit" with an intervening different-file edit is a
 * ping-back. Sustained ping-back across files indicates the agent is
 * cycling without converging (e.g. impl ↔ test loops).
 *
 * Distinct from per-file churn (churn.ts), which counts raw edit
 * frequency per file. Cross-file detects a different failure mode:
 * many files each modestly edited, but rotated.
 *
 * State persists in fusion-workbench/.guard-state/cross-file.json.
 */
/** Per-file ping-back statistics. */
export interface FileCrossFileStats {
    pingBackCount: number;
    totalEdits: number;
    lastEditTimestamp: string;
}
/** Top-level cross-file state persisted to disk. */
export interface CrossFileState {
    files: Record<string, FileCrossFileStats>;
    lastEditFile: string | null;
    lastEditTimestamp: string | null;
}
/** Warning level. */
export type CrossFileWarningLevel = "info" | "warning" | "critical";
/** A cross-file warning. */
export interface CrossFileWarning {
    level: CrossFileWarningLevel;
    message: string;
    files: string[];
    recommendation: string;
}
/** Configurable thresholds. */
export interface CrossFileThresholds {
    pingBackWarning: number;
    pingBackCritical: number;
}
declare const DEFAULT_THRESHOLDS: CrossFileThresholds;
/** Load cross-file state from disk. Returns empty state if missing or no workbench. */
export declare function loadCrossFile(): CrossFileState;
/** Save cross-file state atomically. No-op if no workbench is set up. */
export declare function saveCrossFile(state: CrossFileState): void;
/**
 * Record an edit to a file. Increments the file's ping-back count if
 * the most recent edit was to a DIFFERENT file AND this file has been
 * edited before. Returns the file's updated stats.
 *
 * Pattern examples:
 *   A          → A.pingBack 0 (first edit)
 *   A, A, A    → A.pingBack 0 (consecutive same-file)
 *   A, B, A    → A.pingBack 1 (return after B)
 *   A, B, A, B → A.pingBack 1, B.pingBack 1
 *   A, B, A, B, A, B, A → A 3, B 2 (4-cycle ping-pong)
 */
export declare function recordEdit(state: CrossFileState, filePath: string): FileCrossFileStats;
/**
 * Analyze cross-file state and return warnings for files exceeding
 * ping-back thresholds. At most 2 warnings (one per level) returned.
 */
export declare function analyzeCrossFile(state: CrossFileState, thresholds?: Partial<CrossFileThresholds>): CrossFileWarning[];
/** Reset state. Useful as a "checkpoint" after a commit indicates progress. */
export declare function resetCrossFile(): CrossFileState;
/** Default thresholds (exported for tests and config defaults). */
export { DEFAULT_THRESHOLDS as CROSS_FILE_DEFAULT_THRESHOLDS };
