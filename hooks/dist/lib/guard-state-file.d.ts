/**
 * The read-coerce-write seam every `fusion-workbench/.guard-state/` JSON file
 * shares.
 *
 * ## Why this module exists
 *
 * Three state modules — `escalation.ts`, `churn.ts`, `cross-file.ts` — each
 * carried their own copy of the same twelve lines: resolve the state directory
 * from `findWorkbenchRoot()`, read a JSON file, hand the parsed value to the
 * caller, and write it back through a `.tmp` and a rename. Copies drift, and
 * this set drifted in the way that matters. `escalation.ts` was taught to COERCE
 * the parsed value after a shape-valid `escalation.json` failed the whole guard
 * open (issue `260802-2334`); the other two kept casting with `as` and threw on
 * the next field access, which discarded the protected-path halt message on the
 * same tool call (issue `260809-1101`). One defect, fixed once, in one of three
 * places.
 *
 * So the seam is a parameter rather than a pattern to reproduce:
 * `loadGuardState` takes the coercion, and a state module that wants to persist
 * something has nowhere to put an `as` cast.
 *
 * ## Absence, unreadable text and the wrong shape are one answer
 *
 * The coercion is called with `undefined` when there is no workbench, when the
 * file is missing and when its text does not parse — the same function that
 * answers "this value is not a state". All four inputs mean the file tells the
 * guard nothing, and the honest reading of nothing is the empty state. Keeping
 * them in one branch is what stops a fifth case from being discovered later in a
 * `catch` that was written for two of them.
 *
 * The coercion runs OUTSIDE the `try`. A throw inside it is a defect in the
 * coercion, not a malformed file, and swallowing it here would hide exactly the
 * class of failure this module exists to end.
 *
 * ## What is NOT routed through here, and why
 *
 * `escalation.ts` keeps its own load and save for now. Its coercion is the one
 * that already exists and its behaviour is pinned by open work elsewhere in this
 * queue; moving it is a behaviour-preserving edit that belongs in its own commit
 * rather than riding along with a defect fix. `protected-snapshot.ts` does not
 * fit this seam as written: its load answers `null` rather than an empty state
 * (no before-picture must never be read as an empty one), its save removes the
 * stale file when its own write fails, and its read unlinks the file as it goes.
 * Those are three deliberate differences, each with a measured issue behind it,
 * not incidental variation. Both remain as recommendation C2 in
 * `fusion-workbench/shared/analyses/260809-1101-guard-support-layer.md`.
 */
/** Where one state file lives, or null when no workbench is set up. */
export interface GuardStatePaths {
    stateDir: string;
    filePath: string;
}
/**
 * Resolve `<project-root>/fusion-workbench/.guard-state/<fileName>`.
 *
 * Returns null when no `.fusion-setup` marker is found by walking up from the
 * working directory, which makes every state operation a silent no-op. That is
 * what keeps a plain Claude session in a non-fusion directory from bootstrapping
 * a stray workbench.
 */
export declare function guardStatePath(fileName: string): GuardStatePaths | null;
/**
 * Turn an arbitrary parsed JSON value — or `undefined`, for a file that is
 * absent, unreadable or unparseable — into a state of the caller's own type.
 * It must be total: every input has an answer, and none of them throws.
 */
export type StateCoercion<T> = (value: unknown) => T;
/** Read one state file and coerce whatever it holds into a usable state. */
export declare function loadGuardState<T>(fileName: string, coerce: StateCoercion<T>): T;
/**
 * Write one state file atomically. No-op when no workbench is set up.
 *
 * A write that fails throws, exactly as the three hand-written copies did. Both
 * hooks fail open on an exception, and whether they should instead report the
 * failure is a separate question with its own queued task; this module is not
 * the place to answer it by accident.
 */
export declare function saveGuardState(fileName: string, state: unknown): void;
/**
 * Is this value a JSON object a state can be read out of?
 *
 * Arrays and `null` are excluded because indexing them yields `undefined` for
 * every field a state names, which is the shape defect wearing a disguise.
 */
export declare function isStateObject(value: unknown): value is Record<string, unknown>;
/**
 * A counter, read as a non-negative integer.
 *
 * Anything that is not a finite number reads as 0, and a negative or fractional
 * one is clamped. A well-formed counter round-trips unchanged, so this changes
 * no behaviour for a file the guard itself wrote. The direction is the same one
 * `escalation.ts` argues for its own block counter: a count read verbatim from a
 * hand-edited file must not be able to push a threshold out of reach.
 */
export declare function nonNegativeCount(value: unknown): number;
/**
 * A timestamp string, or null when the value cannot be read as one.
 *
 * The parse check is not decoration. `churn.ts` computes a session age from its
 * `sessionStart`, and an unparseable string yields `NaN`, which compares false
 * against every threshold — so the two-hour session reset would silently never
 * fire again. A string that Date cannot read is no more a timestamp than a
 * number is.
 */
export declare function optionalTimestamp(value: unknown): string | null;
