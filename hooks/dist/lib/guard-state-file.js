/**
 * The read-coerce-write seam every `fusion-workbench/.guard-state/` JSON file
 * shares.
 *
 * ## Why this module exists
 *
 * Three state modules — `escalation.ts` and the since-removed `churn.ts` and
 * `cross-file.ts` — each carried their own copy of the same twelve lines:
 * resolve the state directory from `findWorkbenchRoot()`, read a JSON file, hand
 * the parsed value to the caller, and write it back through a `.tmp` and a
 * rename. Copies drift, and this set drifted in the way that matters.
 * `escalation.ts` was taught to COERCE the parsed value after a shape-valid
 * `escalation.json` failed the whole guard open (issue `260802-2334`); the other
 * two kept casting with `as` and threw on the next field access, which discarded
 * the message the same tool call had already produced (issue `260809-1101`).
 * Measured on the protected-path halt sentence, which is gone with its half of
 * the guard; the defect class is not, and is not specific to what the message
 * said. A throw in a state load takes out whatever the hook was about to tell
 * the model, and the tracker still tells it what it has to say — the coverage
 * and staging measurements leave through the same reply. One defect, fixed
 * once, in one place. The ping-back tracker left with decision `260809-2004`,
 * the churn heatmap on 2026-08-15, and the session-state drift measurement with
 * the counters it measured on the same day.
 *
 * It happened a second time. Three measurement modules — the since-removed
 * `state-drift.ts`, plus `review-coverage.ts` and `staging-drift.ts` — landed
 * in one afternoon, each with
 * its own twelve-line throttle store written BESIDE this file rather than
 * through it, and they had already diverged: all three wrote with a bare
 * `writeFileSync` where this one writes through a `.tmp` and a rename, and all
 * three read with an `as` cast where this one takes a coercion. Decision
 * `260811-1146` moved them onto the seam and widened it by one optional `root`,
 * which is the only thing they needed and did not have. Two modules use it
 * today — `review-coverage.ts` and `staging-drift.ts`. `churn.ts` and
 * `state-drift.ts` were the third and fourth, both removed on 2026-08-15, and
 * `escalation.ts` the fifth, removed on 2026-08-16 with the halt it counted
 * toward.
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
 * ## What `escalation.ts` added on top, rather than beside — history
 *
 * Read as history: the module was deleted on 2026-08-16 with the halt and the
 * consecutive-block counter. It was the one module this seam deliberately left
 * alone at first, because its behaviour was pinned by open work. That work
 * landed — its save re-read the file to merge in a halt another process had
 * raised since its load — and a save that reads is exactly the shape this
 * module already owns, so it joined rather than growing a second reader next
 * door. Its merge never generalised and was never wanted here: it existed
 * because a lost update there cost a raised halt, where every file left on this
 * seam records a signature the next measurement recomputes anyway. Nothing was
 * taken out of this module when it went, which is the point of the seam being a
 * parameter.
 *
 * ## What is NOT routed through here, and why
 *
 * Nothing, now. The one file that did not fit this seam was
 * `protected-snapshot.ts`, whose load answered `null` rather than an empty state
 * (no before-picture must never be read as an empty one), whose save removed the
 * stale file when its own write failed, and whose read unlinked the file as it
 * went — three deliberate differences, each with a measured issue behind it. It
 * was recommendation C2 in
 * `fusion-workbench/shared/analyses/260809-1101-guard-support-layer.md`, and it
 * was deleted with the protected-path half of the guard on 2026-08-12, so the
 * recommendation is moot rather than done.
 *
 * The files that DO route through here are the two measurement throttle
 * records, and they are the whole of it: `escalation.json` was the third until
 * 2026-08-16 and is written by nothing at this version.
 */
import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { findWorkbenchRoot } from "./workbench-root.js";
/**
 * Resolve `<project-root>/fusion-workbench/.guard-state/<fileName>`.
 *
 * Returns null when no `.fusion-setup` marker is found by walking up from the
 * working directory, which makes every state operation a silent no-op. That is
 * what keeps a plain Claude session in a non-fusion directory from bootstrapping
 * a stray workbench.
 *
 * ## The optional root, kept without a current subject
 *
 * **Every caller in the tree passes a root.** The default exists for a caller
 * that runs inside the hooks with no root of its own and lets this walk up from
 * the working directory instead — that walk is the no-workbench no-op above.
 * `escalation.ts` was that caller and was the only one; it went on 2026-08-16.
 * The parameter stays optional the way `isFusionPluginRoot` in
 * `lib/self-detect.ts` stays exported: the form is cheap to keep and expensive
 * to re-derive, and the next state module written inside a hook needs it. What
 * must not be read into it is a live caller — there is none, and a change that
 * makes `root` required breaks no code in this tree.
 *
 * The measurement modules are the other case, and the only case now. Each is
 * handed a workbench root
 * by its caller (the tracker resolves it once per tool call; the `bin/` CLIs
 * resolve it once at startup) and each is deliberately anchored there rather
 * than at cwd — a hook's `process.cwd()` is whatever directory the session
 * happens to sit in. Passing that root through is what let them use this seam
 * at all; before it existed they forked three copies of it instead, which is
 * the failure this module's header already describes.
 *
 * A caller that passes a root gets no null: it has already answered the
 * question the walk asks. The walk runs only when no root is given.
 */
export function guardStatePath(fileName, root) {
    const base = root ?? findWorkbenchRoot();
    if (!base)
        return null;
    const stateDir = resolve(base, "fusion-workbench", ".guard-state");
    return { stateDir, filePath: resolve(stateDir, fileName) };
}
/**
 * Read one state file and coerce whatever it holds into a usable state.
 *
 * `root` is optional for the reason `guardStatePath` gives: omit it and the
 * workbench is found by walking up from the working directory; pass it and that
 * root is used verbatim.
 */
export function loadGuardState(fileName, coerce, root) {
    const paths = guardStatePath(fileName, root);
    if (!paths)
        return coerce(undefined);
    let parsed;
    try {
        parsed = JSON.parse(readFileSync(paths.filePath, "utf-8"));
    }
    catch {
        return coerce(undefined);
    }
    return coerce(parsed);
}
/**
 * Write one state file atomically. No-op when no workbench is set up.
 *
 * A write that fails throws, exactly as the three hand-written copies did. Both
 * hooks fail open on an exception, and whether they should instead report the
 * failure is a separate question with its own queued task; this module is not
 * the place to answer it by accident.
 */
export function saveGuardState(fileName, state, root) {
    const paths = guardStatePath(fileName, root);
    if (!paths)
        return;
    mkdirSync(paths.stateDir, { recursive: true });
    const tmp = `${paths.filePath}.tmp`;
    writeFileSync(tmp, JSON.stringify(state, null, 2), "utf-8");
    renameSync(tmp, paths.filePath);
}
/* ------------------------------------------------------------------ *
 * Coercion primitives
 * ------------------------------------------------------------------ */
/**
 * Is this value a JSON object a state can be read out of?
 *
 * Arrays and `null` are excluded because indexing them yields `undefined` for
 * every field a state names, which is the shape defect wearing a disguise.
 */
export function isStateObject(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
/**
 * A counter, read as a non-negative integer.
 *
 * Anything that is not a finite number reads as 0, and a negative or fractional
 * one is clamped. A well-formed counter round-trips unchanged, so this changes
 * no behaviour for a file the guard itself wrote. The direction is the same one
 * `escalation.ts` argues for its own block counter: a count read verbatim from a
 * hand-edited file must not be able to push a threshold out of reach.
 */
export function nonNegativeCount(value) {
    return typeof value === "number" && Number.isFinite(value)
        ? Math.max(0, Math.floor(value))
        : 0;
}
