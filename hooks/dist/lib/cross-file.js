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
import { readFileSync, writeFileSync, renameSync, mkdirSync, existsSync, } from "node:fs";
import { resolve } from "node:path";
const STATE_DIR = resolve(process.cwd(), "fusion-workbench", ".guard-state");
const STATE_PATH = resolve(STATE_DIR, "cross-file.json");
const DEFAULT_THRESHOLDS = {
    pingBackWarning: 3,
    pingBackCritical: 5,
};
const EMPTY_STATE = {
    files: {},
    lastEditFile: null,
    lastEditTimestamp: null,
};
/** Load cross-file state from disk. Returns empty state if missing. */
export function loadCrossFile() {
    try {
        if (!existsSync(STATE_PATH)) {
            return { files: {}, lastEditFile: null, lastEditTimestamp: null };
        }
        const content = readFileSync(STATE_PATH, "utf-8");
        return JSON.parse(content);
    }
    catch {
        return { files: {}, lastEditFile: null, lastEditTimestamp: null };
    }
}
/** Save cross-file state atomically (write tmp + rename). */
export function saveCrossFile(state) {
    mkdirSync(STATE_DIR, { recursive: true });
    const tmp = STATE_PATH + ".tmp";
    writeFileSync(tmp, JSON.stringify(state, null, 2), "utf-8");
    renameSync(tmp, STATE_PATH);
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
    const fresh = {
        files: {},
        lastEditFile: null,
        lastEditTimestamp: null,
    };
    saveCrossFile(fresh);
    return fresh;
}
/** Default thresholds (exported for tests and config defaults). */
export { DEFAULT_THRESHOLDS as CROSS_FILE_DEFAULT_THRESHOLDS };
