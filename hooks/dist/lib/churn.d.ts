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
/**
 * Thresholds for churn analysis, loaded from config.
 *
 * SESSION-LEVEL ONLY, and that is the whole design. `totalChanges` is still
 * counted and still persisted — the orchestrator's Setup reads it — but it is
 * compared against nothing. It used to have a `totalChangesWarning` /
 * `totalChangesCritical` pair, and because the counter is monotonic for the life
 * of a project, the first file to cross the critical line made `analyzeChurn`
 * return a critical on EVERY subsequent write to ANY file, for ever. Measured in
 * this repository's own log: a 100% duty cycle sustained over 21 days, 3,064 of
 * 15,248 event lines, and a 30-row dashboard panel spending all thirty slots on
 * four latched rows while real blocks and halts were evicted (issue
 * `260809-1101`, decision `260809-2004`).
 *
 * The session level does not latch: `recordChange` resets it after
 * `SESSION_MAX_AGE_MS`, so a `churn_critical` now means "this file is being
 * rewritten right now", which is the question the level was for. A lifetime
 * alarm can come back if it is wanted, but as a rate or a window rather than as
 * a comparison against a number that only ever grows.
 */
export interface ChurnThresholds {
    changesPerSessionWarning: number;
    changesPerSessionCritical: number;
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
export declare function coerceChurnState(value: unknown): ChurnState;
/**
 * Load churn state from disk. Returns the empty state when the file is missing,
 * when there is no workbench, when the text does not parse, AND when it parses
 * to something that is not a churn state — see `coerceChurnState` for why that
 * last case is the one worth spelling out.
 */
export declare function loadChurn(): ChurnState;
/** Save churn state to disk atomically. No-op if no workbench is set up. */
export declare function saveChurn(state: ChurnState): void;
export declare function recordChange(state: ChurnState, filePath: string): void;
/**
 * Analyze churn patterns and return warnings.
 *
 * Ported from churn_heatmap.go:122-184, minus the total-level comparison the
 * port brought with it — see `ChurnThresholds` for why it went. Only
 * `changesThisSession` is compared here; `totalChanges` and `thrashingScore`
 * are carried for their readers and steer nothing.
 */
export declare function analyzeChurn(state: ChurnState, thresholds?: Partial<ChurnThresholds>): ChurnWarning[];
/**
 * Reset session-level counters.
 * Call at the start of a new session to keep totalChanges but reset per-session tracking.
 */
export declare function resetSession(state: ChurnState): void;
