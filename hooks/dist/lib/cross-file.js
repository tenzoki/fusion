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
import { isStateObject, loadGuardState, nonNegativeCount, optionalTimestamp, saveGuardState, } from "./guard-state-file.js";
/**
 * Cross-file state lives in `<project-root>/fusion-workbench/.guard-state/cross-file.json`.
 * With no `.fusion-setup` marker found upward, every state operation becomes a
 * silent no-op so that plain Claude sessions in non-fusion-set-up directories
 * don't bootstrap stray workbenches. The resolution, the read and the atomic
 * write live in `guard-state-file.ts`; this module supplies only the shape.
 */
const STATE_FILE = "cross-file.json";
const DEFAULT_THRESHOLDS = {
    pingBackWarning: 3,
    pingBackCritical: 5,
};
/** A fresh empty state. A function, so no caller can share the files map. */
function emptyState() {
    return { files: {}, lastEditFile: null, lastEditTimestamp: null };
}
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
export function coerceCrossFileState(value) {
    if (!isStateObject(value))
        return emptyState();
    const rawFiles = isStateObject(value.files) ? value.files : {};
    const files = {};
    for (const [path, stats] of Object.entries(rawFiles)) {
        if (!isStateObject(stats))
            continue;
        files[path] = {
            pingBackCount: nonNegativeCount(stats.pingBackCount),
            totalEdits: nonNegativeCount(stats.totalEdits),
            lastEditTimestamp: optionalTimestamp(stats.lastEditTimestamp) ?? "",
        };
    }
    return {
        files,
        lastEditFile: typeof value.lastEditFile === "string" ? value.lastEditFile : null,
        lastEditTimestamp: optionalTimestamp(value.lastEditTimestamp),
    };
}
/**
 * Load cross-file state from disk. Returns the empty state when the file is
 * missing, when there is no workbench, when the text does not parse, AND when it
 * parses to something that is not a cross-file state.
 */
export function loadCrossFile() {
    return loadGuardState(STATE_FILE, coerceCrossFileState);
}
/** Save cross-file state atomically. No-op if no workbench is set up. */
export function saveCrossFile(state) {
    saveGuardState(STATE_FILE, state);
}
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
export function recordEdit(state, filePath) {
    const now = new Date().toISOString();
    const isReturnVisit = state.lastEditFile !== null &&
        state.lastEditFile !== filePath &&
        state.files[filePath] !== undefined;
    if (state.files[filePath] === undefined) {
        state.files[filePath] = {
            pingBackCount: 0,
            totalEdits: 0,
            lastEditTimestamp: now,
        };
    }
    const stats = state.files[filePath];
    stats.totalEdits += 1;
    stats.lastEditTimestamp = now;
    if (isReturnVisit) {
        stats.pingBackCount += 1;
    }
    state.lastEditFile = filePath;
    state.lastEditTimestamp = now;
    return stats;
}
/**
 * Analyze cross-file state and return warnings for files exceeding
 * ping-back thresholds. At most 2 warnings (one per level) returned.
 */
export function analyzeCrossFile(state, thresholds) {
    const t = { ...DEFAULT_THRESHOLDS, ...thresholds };
    const warnings = [];
    const criticalFiles = [];
    const warningFiles = [];
    for (const [filePath, stats] of Object.entries(state.files)) {
        if (stats.pingBackCount >= t.pingBackCritical) {
            criticalFiles.push(filePath);
        }
        else if (stats.pingBackCount >= t.pingBackWarning) {
            warningFiles.push(filePath);
        }
    }
    if (criticalFiles.length > 0) {
        warnings.push({
            level: "critical",
            message: `Cross-file ping-back: ${criticalFiles.length} file(s) repeatedly revisited`,
            files: criticalFiles,
            recommendation: "Agent is cycling between these files without converging. Pause and review whether the current approach can complete, or revise the plan.",
        });
    }
    if (warningFiles.length > 0) {
        warnings.push({
            level: "warning",
            message: `Cross-file ping-back rising: ${warningFiles.length} file(s) revisited`,
            files: warningFiles,
            recommendation: "Watch these files for continued revisits. May indicate paired correction loops (impl ↔ test) or scope creep.",
        });
    }
    return warnings;
}
/** Reset state. Useful as a "checkpoint" after a commit indicates progress. */
export function resetCrossFile() {
    const fresh = emptyState();
    saveCrossFile(fresh);
    return fresh;
}
/** Default thresholds (exported for tests and config defaults). */
export { DEFAULT_THRESHOLDS as CROSS_FILE_DEFAULT_THRESHOLDS };
