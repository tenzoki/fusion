/**
 * Churn heatmap tracker for the Compliance Guard.
 *
 * Ported from fusion/reactor/pkg/guard/churn_heatmap.go.
 * Tracks per-file change frequency and thrashing patterns.
 * State persists in state/churn.json across sessions.
 */
import { readFileSync, writeFileSync, renameSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { findWorkbenchRoot } from "./workbench-root.js";
/**
 * Churn state lives in `<project-root>/fusion-workbench/.guard-state/churn.json`,
 * where `<project-root>` is the directory above the `.fusion-setup` marker
 * found by walking up from the current working directory.
 *
 * If no marker is found (project never ran `/fusion:setup`), the path
 * resolver returns `null` and every state operation becomes a silent no-op
 * — preventing stray workbench creation when a Claude session's cwd
 * happens to be in a directory that isn't a fusion project.
 */
function getChurnPaths() {
    const root = findWorkbenchRoot();
    if (!root)
        return null;
    const stateDir = resolve(root, "fusion-workbench", ".guard-state");
    return { stateDir, churnPath: resolve(stateDir, "churn.json") };
}
const DEFAULT_THRESHOLDS = {
    changesPerSessionWarning: 5,
    changesPerSessionCritical: 10,
    totalChangesWarning: 8,
    totalChangesCritical: 15,
};
/** Load churn state from disk. Returns empty state if missing or no workbench. */
export function loadChurn() {
    const paths = getChurnPaths();
    const empty = {
        files: {},
        sessionStart: new Date().toISOString(),
    };
    if (!paths)
        return empty;
    try {
        const content = readFileSync(paths.churnPath, "utf-8");
        return JSON.parse(content);
    }
    catch {
        return empty;
    }
}
/** Save churn state to disk atomically. No-op if no workbench is set up. */
export function saveChurn(state) {
    const paths = getChurnPaths();
    if (!paths)
        return;
    mkdirSync(paths.stateDir, { recursive: true });
    const tmpPath = `${paths.churnPath}.tmp`;
    writeFileSync(tmpPath, JSON.stringify(state, null, 2), "utf-8");
    renameSync(tmpPath, paths.churnPath);
}
/**
 * Record a file change in the churn state.
 *
 * Ported from churn_heatmap.go:91-109.
 * Increments counters and updates thrashing score.
 */
/** Max session age in milliseconds (2 hours). */
const SESSION_MAX_AGE_MS = 2 * 60 * 60 * 1000;
export function recordChange(state, filePath) {
    const now = new Date().toISOString();
    // Auto-reset stale sessions so per-session thresholds stay meaningful
    const sessionAge = Date.now() - new Date(state.sessionStart).getTime();
    if (sessionAge > SESSION_MAX_AGE_MS) {
        resetSession(state);
    }
    let stats = state.files[filePath];
    if (!stats) {
        stats = {
            totalChanges: 0,
            changesThisSession: 0,
            lastChange: now,
            thrashingScore: 0,
        };
        state.files[filePath] = stats;
    }
    stats.totalChanges++;
    stats.changesThisSession++;
    stats.lastChange = now;
    updateThrashingScore(stats);
}
/**
 * Update thrashing score based on session changes and total.
 *
 * Ported from churn_heatmap.go:111-119.
 * Rapid-change penalty: (changesThisSession - 2) * 2 if > 2 changes.
 * Total penalty: totalChanges / 3.
 */
function updateThrashingScore(stats) {
    let rapidChangePenalty = 0;
    if (stats.changesThisSession > 2) {
        rapidChangePenalty = (stats.changesThisSession - 2) * 2;
    }
    const totalPenalty = Math.floor(stats.totalChanges / 3);
    stats.thrashingScore = rapidChangePenalty + totalPenalty;
}
/**
 * Analyze churn patterns and return warnings.
 *
 * Ported from churn_heatmap.go:122-184.
 * Checks per-session and total change counts against thresholds.
 */
export function analyzeChurn(state, thresholds) {
    const t = {
        ...DEFAULT_THRESHOLDS,
        ...thresholds,
    };
    const warnings = [];
    const criticalFiles = new Set();
    const warningFiles = new Set();
    for (const [filePath, stats] of Object.entries(state.files)) {
        // Session-level thresholds
        if (stats.changesThisSession >= t.changesPerSessionCritical) {
            criticalFiles.add(filePath);
        }
        else if (stats.changesThisSession >= t.changesPerSessionWarning) {
            warningFiles.add(filePath);
        }
        // Total-level thresholds
        if (stats.totalChanges >= t.totalChangesCritical) {
            criticalFiles.add(filePath);
        }
        else if (stats.totalChanges >= t.totalChangesWarning) {
            if (!criticalFiles.has(filePath)) {
                warningFiles.add(filePath);
            }
        }
    }
    if (criticalFiles.size > 0) {
        warnings.push({
            level: "critical",
            message: `High file churn detected: ${criticalFiles.size} file(s) showing thrashing pattern`,
            files: [...criticalFiles],
            recommendation: "Consider pausing to review approach. Frequent changes to same files may indicate unclear requirements or implementation drift.",
        });
    }
    if (warningFiles.size > 0) {
        warnings.push({
            level: "warning",
            message: `Elevated file churn: ${warningFiles.size} file(s) with multiple changes`,
            files: [...warningFiles],
            recommendation: "Monitor these files for continued churn. May indicate iterative refinement or potential scope creep.",
        });
    }
    return warnings;
}
/**
 * Get the top N files by thrashing score.
 *
 * Ported from churn_heatmap.go:221-239.
 */
export function getTopChurnFiles(state, n) {
    return Object.entries(state.files)
        .sort(([, a], [, b]) => b.thrashingScore - a.thrashingScore)
        .slice(0, n)
        .map(([path]) => path);
}
/**
 * Reset session-level counters.
 * Call at the start of a new session to keep totalChanges but reset per-session tracking.
 */
export function resetSession(state) {
    state.sessionStart = new Date().toISOString();
    for (const stats of Object.values(state.files)) {
        stats.changesThisSession = 0;
    }
}
