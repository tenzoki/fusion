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
/**
 * Coerce an arbitrary parsed JSON value into a `CrossFileState`.
 *
 * The defect and the reasoning are the same as `coerceChurnState`'s, and that
 * function's header carries the full account: the load used to cast with `as`
 * inside a `try/catch` written for a missing or unparseable file, so a file that
 * parsed to a valid JSON value of the wrong shape threw on the next field
 * access, and the throw discarded the protected-path halt message the same tool
 * call had produced (issue `260809-1101`). A well-formed file round-trips
 * unchanged.
 *
 * `lastEditFile` is the one field where the coercion is load-bearing beyond not
 * throwing: `recordEdit` reads it to decide whether an edit is a return visit,
 * so a non-string value has to become `null` — "no previous edit" — rather than
 * being carried into that comparison. An entry under `files` whose value is not
 * an object is dropped, for the reason `coerceChurnState` gives.
 */
export declare function coerceCrossFileState(value: unknown): CrossFileState;
/**
 * Load cross-file state from disk. Returns the empty state when the file is
 * missing, when there is no workbench, when the text does not parse, AND when it
 * parses to something that is not a cross-file state.
 */
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
