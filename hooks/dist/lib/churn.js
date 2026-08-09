/**
 * Churn heatmap tracker for the Compliance Guard.
 *
 * Ported from fusion/reactor/pkg/guard/churn_heatmap.go.
 * Tracks per-file change frequency and thrashing patterns.
 * State persists in state/churn.json across sessions.
 */
import { isStateObject, loadGuardState, nonNegativeCount, optionalTimestamp, saveGuardState, } from "./guard-state-file.js";
/**
 * Churn state lives in `<project-root>/fusion-workbench/.guard-state/churn.json`,
 * where `<project-root>` is the directory above the `.fusion-setup` marker
 * found by walking up from the current working directory.
 *
 * If no marker is found (project never ran `/fusion:setup`), every state
 * operation becomes a silent no-op — preventing stray workbench creation when a
 * Claude session's cwd happens to be in a directory that isn't a fusion project.
 * The resolution, the read and the atomic write all live in
 * `guard-state-file.ts`; this module supplies only the shape.
 */
const CHURN_FILE = "churn.json";
const DEFAULT_THRESHOLDS = {
    changesPerSessionWarning: 5,
    changesPerSessionCritical: 10,
};
/** A fresh empty state. A function, so no caller can share the files map. */
function emptyState() {
    return { files: {}, sessionStart: new Date().toISOString() };
}
/**
 * Coerce an arbitrary parsed JSON value into a `ChurnState`.
 *
 * ## Why this is not an `as` cast
 *
 * `JSON.parse(content) as ChurnState` used to be the whole of the load, inside a
 * `try/catch` that handles a MISSING file and UNPARSEABLE text and nothing else.
 * A file that parses to a valid JSON value of the wrong SHAPE — `{}` is enough —
 * passed that catch and threw on the next field access: `state.files[filePath]`
 * on `undefined`. The throw escaped to `tracker.ts`'s top-level handler, which
 * calls `respond()` with no argument and so discarded the protected-path halt
 * sentence the same tool call had already produced. The revert and the halt
 * still landed; what was lost was the only message telling the agent which file
 * changed and how a human clears it, which is precisely the silent-revert
 * failure `rules/protected-path-discipline.md` was written against. Nothing
 * repaired the file either — `saveChurn` sits after the throw — so every later
 * tool call in that project took the same path (issue `260809-1101`).
 *
 * This is the same defect `260802-2334` closed for `escalation.json`, and the
 * fix is the same one: coerce rather than trust. A well-formed file round-trips
 * unchanged, so there is no behaviour change for the ordinary case.
 *
 * ## The two coercions worth stating
 *
 * `sessionStart` must be a string Date can read, because `recordChange` derives
 * a session age from it and `NaN` compares false against every threshold — an
 * unreadable value would silently retire the two-hour session reset rather than
 * failing. An entry under `files` whose value is not an object is DROPPED rather
 * than zero-filled: a zero-filled entry would claim the guard had observed a
 * file it knows nothing about, and the next real change re-creates it correctly.
 */
export function coerceChurnState(value) {
    if (!isStateObject(value))
        return emptyState();
    const rawFiles = isStateObject(value.files) ? value.files : {};
    const files = {};
    for (const [path, stats] of Object.entries(rawFiles)) {
        if (!isStateObject(stats))
            continue;
        files[path] = {
            totalChanges: nonNegativeCount(stats.totalChanges),
            changesThisSession: nonNegativeCount(stats.changesThisSession),
            // Read by no code, only by a human or an agent reading the file. An empty
            // string reads as "unknown"; inventing a time would read as a fact.
            lastChange: optionalTimestamp(stats.lastChange) ?? "",
            thrashingScore: nonNegativeCount(stats.thrashingScore),
        };
    }
    return {
        files,
        sessionStart: optionalTimestamp(value.sessionStart) ?? new Date().toISOString(),
    };
}
/**
 * Load churn state from disk. Returns the empty state when the file is missing,
 * when there is no workbench, when the text does not parse, AND when it parses
 * to something that is not a churn state — see `coerceChurnState` for why that
 * last case is the one worth spelling out.
 */
export function loadChurn() {
    return loadGuardState(CHURN_FILE, coerceChurnState);
}
/** Save churn state to disk atomically. No-op if no workbench is set up. */
export function saveChurn(state) {
    saveGuardState(CHURN_FILE, state);
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
 * Ported from churn_heatmap.go:122-184, minus the total-level comparison the
 * port brought with it — see `ChurnThresholds` for why it went. Only
 * `changesThisSession` is compared here; `totalChanges` and `thrashingScore`
 * are carried for their readers and steer nothing.
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
        if (stats.changesThisSession >= t.changesPerSessionCritical) {
            criticalFiles.add(filePath);
        }
        else if (stats.changesThisSession >= t.changesPerSessionWarning) {
            warningFiles.add(filePath);
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
 * Reset session-level counters.
 * Call at the start of a new session to keep totalChanges but reset per-session tracking.
 */
export function resetSession(state) {
    state.sessionStart = new Date().toISOString();
    for (const stats of Object.values(state.files)) {
        stats.changesThisSession = 0;
    }
}
