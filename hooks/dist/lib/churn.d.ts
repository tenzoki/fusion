/**
 * Churn heatmap tracker for the Compliance Guard.
 *
 * Ported from fusion/reactor/pkg/guard/churn_heatmap.go.
 * Tracks per-file change frequency and thrashing patterns.
 * State persists in state/churn.json across sessions.
 */
/**
 * What a key in `files` is relative to, and the stamp that says a state file has
 * been migrated to it.
 *
 * ## Why the anchor had to move
 *
 * A key used to be relative to `process.cwd()` — wherever the session happened
 * to start — and absolute when the written path fell outside it. So one file
 * accumulated one counter per working directory it was ever edited from, each
 * under-reporting, and the map filled with spellings no reader could resolve.
 * Measured in this repository on 2026-08-09: 590 entries in four incompatible
 * spellings, ZERO of them relative to the project root, which is the spelling
 * every consumer assumes (issue `260809-2023`).
 *
 * The workbench root is the anchor because `findWorkbenchRoot()` already
 * resolves it and `projectRelative` already answers "this path, relative to that
 * directory" for whoever asks. Reusing both was the point rather than the
 * convenience: at the time the protected-path measurement was the other caller,
 * and churn and the guard reading one path the same way was the argument
 * (decision `260810-0920`, part a). That measurement was removed on 2026-08-12
 * and the anchor is unaffected — the reason it was chosen was the ROOT, which is
 * the only directory a counter can be keyed by and mean the same thing across
 * sessions; agreeing with a second reader was a benefit, not the ground.
 *
 * A path landing OUTSIDE the root — a `/tmp` scratchpad, a second clone — is
 * not tracked at all rather than stored absolute. Storing it would reintroduce
 * the second spelling this anchor exists to end, and a file outside the project
 * is not evidence about churn in the project.
 */
export declare const KEY_ANCHOR = "workbench-root";
/**
 * Workbench dashboard/state files that the orchestrator continuously
 * rewrites by design. Counting them as churn produces pure noise — exclude
 * them from the metric.
 *
 * ## One metric, two readers
 *
 * Churn is the only metric that reads this list, and it reads it at both ends:
 * `hooks/tracker.ts` never records these keys on the write path, and
 * `rankThrashing` below never ranks them on the read path. Two readers of one
 * metric, not two metrics.
 *
 * The read path was added because the write-path exclusion cannot reach a score
 * that is already in the map. Before `25c5454` these files were keyed bare —
 * `orchestrator-live.md`, `agentstate.yaml` — by sessions started inside the
 * workbench, and in that spelling they matched nothing here. The key migration
 * lifted them to the spellings below, which stopped the write path counting
 * them and left the accumulated score standing: `orchestrator-live.md` ranked
 * 10th in this repository's map, inside the default `--limit 10` the
 * orchestrator reads at Setup (issue `260810-1632`).
 *
 * ## The list lives HERE, not in the hook that first used it
 *
 * `hooks/tracker.ts` is a hook entry point: it runs `main()` at module load, so
 * `churn.ts` cannot import from it, and a second copy of the list would be two
 * places for one rule to drift apart. The rule is about churn, so it lives in
 * the churn module and the hook imports it.
 *
 * ## This list is not a protection statement
 *
 * The `.guard-state/**` entry below is confirmed deliberately, not carried
 * along. `fusion-workbench/.guard-state/**` appeared twice in this codebase and
 * the two occurrences answered different questions; only one of them was
 * retired.
 *
 *   - In `hooks/config.json` it meant "an agent may not write here". That entry
 *     is GONE, and so is the list it was on — the protected-path half of the
 *     guard was removed on 2026-08-12. It had already had to go before that: the
 *     guard writes its own events and its own escalation counter into that
 *     directory, so a protected `.guard-state/` would have made every single
 *     tool call report the guard's own bookkeeping as a violation.
 *   - HERE it means "changes here are not evidence about the agent's editing
 *     behaviour". That is still true and is untouched by the removal: the
 *     escalation counter, the event log and the measurement throttles are all
 *     written into `.guard-state/` by the hooks themselves, and counting those
 *     would drown the churn heatmap in the guard's own traffic.
 *
 * Deleting this entry because the other one went would break the churn metric
 * for a reason that has nothing to do with churn.
 */
export declare const TRACKER_NOISE_FILES: string[];
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
    /**
     * `KEY_ANCHOR` once every key in `files` is relative to the workbench root.
     * Absent in a file written before the anchor moved, which is exactly what
     * `loadChurn` migrates — so the migration runs once per state file rather
     * than once per tool call.
     */
    keyAnchor?: string;
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
 * calls `respond()` with no argument and so discarded whatever sentence the
 * same tool call had already produced. Measured on the protected-path halt, and
 * the shape of the loss is what generalises rather than that halt: the action
 * still landed, and what was lost was the only message telling the agent what
 * had happened to which file and what a human does about it. An agent that is
 * acted upon and not told works around the effect, because from inside the
 * session it looks like nothing happened. Nothing repaired the file either —
 * `saveChurn` sits after the throw — so every later tool call in that project
 * took the same path (issue `260809-1101`). The protected-path half was removed
 * on 2026-08-12; every remaining reporter on this hook — the churn warning, the
 * three drift and coverage measurements — reaches the model through the same
 * `respond()` and is lost the same way.
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
 * The churn key for a path a write tool named, or null when the path is not
 * churn in this project.
 *
 * `rawFilePath` arrives as the tool payload spelled it: absolute, or relative to
 * the session's working directory. `resolve` lifts it into the session's
 * absolute space and `projectRelative` puts it into the root's. Those two steps
 * were shared with `narrowingTarget` in `tracker.ts`, which ran them for the
 * protected-path measurement so that one tool call read one path one way; that
 * measurement was removed on 2026-08-12 and this is now the only caller that
 * takes both steps.
 *
 * Null has three causes and they are one answer — there is no key to count
 * under: no workbench (nothing to anchor to), a path outside the root
 * (`projectRelative` hands it back absolute), and the root directory itself
 * (the empty relative path, which names no file).
 */
export declare function churnKey(rawFilePath: string, cwd: string, root: string | null): string | null;
/**
 * Rewrite a state file's keys to the workbench-root anchor.
 *
 * Runs on load, once per state file — `loadChurn` skips it the moment the file
 * carries the `keyAnchor` stamp, which `saveChurn` then persists. It is
 * idempotent regardless: a second pass over a migrated map returns the same map,
 * and there is a test on exactly that, because the stamp is a cheap skip rather
 * than the thing that makes the migration safe to repeat.
 *
 * ## The rule, and why it is a rule rather than a count
 *
 * The counts in the record that filed this (535, then 588, then 590 within two
 * days) are a moving measurement of one project's file. Nothing below reads a
 * number:
 *
 *   - An **absolute** key inside the root becomes root-relative. Outside the
 *     root it is DROPPED — another clone, another machine, a `/tmp` scratchpad.
 *     There is no anchor under which such a key means anything here, and the
 *     write path no longer produces one (see `churnKey`).
 *   - A **relative** key was written against a working directory nothing
 *     recorded. Two directories can have been it in practice: the project root
 *     (already the new anchor) and the workbench, where fusion sessions
 *     routinely start. So the key is probed against both, root first, and the
 *     reading that names a file on disk wins.
 *   - A relative key that resolves under NEITHER is left as written. It names no
 *     file, so it cannot be re-anchored from the key alone, and it is excluded
 *     from the ranking by the same existence check that excludes every other
 *     absent file. Its history survives, which is what decision `260810-0920`
 *     part (c) asks for.
 *
 * The probe reads the filesystem as it stands at migration time. A file deleted
 * before the migration ran cannot be re-anchored — that is the cost of having no
 * record of the working directory, not a choice being made here.
 *
 * `exists` is a parameter so a test can drive the rule against a stated set of
 * files rather than a real tree.
 */
export declare function migrateChurnKeys(state: ChurnState, root: string, exists?: (path: string) => boolean): ChurnState;
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
/** One file's place in the thrashing ranking. */
export interface RankedFile {
    path: string;
    stats: FileChurnStats;
}
/** What `rankThrashing` answers: the ranking, and what it left out. */
export interface ChurnRanking {
    /** Highest thrashing score first, noise and absent files already excluded. */
    ranked: RankedFile[];
    /** Every key in the map, ranked or not. */
    entries: number;
    /** Keys whose file is not on disk. Kept in the map, kept out of the ranking. */
    absent: number;
    /**
     * Keys matching `TRACKER_NOISE_FILES` — the surfaces the write path refuses
     * to measure. Kept in the map, kept out of the ranking.
     *
     * Counted apart from `absent` because the two say different things to a
     * reader: `absent` is "this file is gone", `noise` is "this file is not
     * evidence". Collapsing them would report a live dashboard file as deleted.
     *
     * The two counts are disjoint by construction — noise is asked first, so a
     * key that is both noise and missing counts as noise. That order is the
     * meaningful one: "not evidence" is a statement about the key that holds
     * whether or not the file happens to be on disk, while "deleted" invites a
     * reader to care about a history the metric already declined to keep.
     */
    noise: number;
}
/**
 * The ranking a reader sees, with files that no longer exist left out.
 *
 * ## Why the existence check lives HERE
 *
 * The map never forgets: `recordChange` only adds and `resetSession` keeps
 * `totalChanges` on purpose, so a key outlives the deletion, rename or move of
 * its file. `thrashingScore` for such a key is its undecayed lifetime total,
 * which is why three of the top four entries the orchestrator read at Setup
 * named files that were not there (issue `260809-2023`).
 *
 * Decision `260810-0920` part (c) keeps every entry and moves the check to the
 * READ path. A deleted file's churn history is the interesting kind and is not
 * thrown away; what changes is only what the ranking shows. The cost is one
 * `stat` per entry per Setup instead of one per entry per tool call — the write
 * path runs orders of magnitude more often, and the symptom was never about the
 * write path. The file still grows without bound; that is the separate question
 * the decision does not settle.
 *
 * ## Why the noise check lives here too
 *
 * `TRACKER_NOISE_FILES` names the surfaces the write path declines to count,
 * because the orchestrator rewrites them continuously by design. That exclusion
 * only ever applied to writes happening now; the scores those keys accumulated
 * under the pre-`25c5454` spelling were already in the map when the migration
 * lifted them into the matching spelling, and the read path had no reason to
 * drop them. So the ranking the orchestrator reads at Setup could name a file
 * the tracker deliberately refuses to measure (issue `260810-1632`).
 *
 * The entries stay in the map, exactly as the absent ones do: decision
 * `260810-0920` part (c) chose to keep every key and filter on the read path.
 *
 * `limit` of 0 or less means the whole ranking. `exists` is a parameter for the
 * same reason it is on `migrateChurnKeys`: a test states its own file tree.
 */
export declare function rankThrashing(state: ChurnState, root: string, limit?: number, exists?: (path: string) => boolean): ChurnRanking;
