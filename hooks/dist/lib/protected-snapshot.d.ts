/**
 * Fingerprints of the protected paths — the measurement that replaced the
 * prediction.
 *
 * ## What changed, and why this module exists
 *
 * The guard used to answer "will this shell command write a protected path?"
 * from the command's TEXT. That question is undecidable: a path can be built at
 * run time, arrive on stdin, or pass through `eval`, an alias, a function or an
 * environment variable no classifier sees. Measured in a real consuming project,
 * four days of that guard produced seventeen blocks and zero real hits.
 *
 * This module answers a different question — "has a protected path CHANGED?" —
 * which is decided rather than approximated. `guard.ts` (PreToolUse) records a
 * fingerprint before the tool runs; `tracker.ts` (PostToolUse) takes a second
 * one and compares. The difference between the two is exactly what this one tool
 * call did, whatever route it took to the file.
 *
 * Binding decision, taken by the user on 2026-08-07 out of four options: detect
 * afterwards instead of predicting — let the command run, notice that a
 * protected path changed, put it back and halt.
 *
 * ## The fingerprint carries the CONTENT, and that is what makes the restore exact
 *
 * A digest answers "did this change?". Only the bytes answer "change it back to
 * WHAT?". While the fingerprint was a digest, the only restore target available
 * was `HEAD` — and `HEAD` is not the state the measurement measured. Five
 * branches followed from that gap: a path in git and clean, a path in git with
 * the human's work already staged, an untracked path, a path this very call
 * created, and a project that is no git repository at all. The second branch
 * silently discarded human work; the last three could not be restored.
 *
 * Carrying the content collapses all five into one: write back what was there.
 * Non-existence stays its own value, and on the way back it reads as "delete".
 * The `HEAD` restore was filed as a defect while this module was being written
 * and closed by carrying the content instead.
 *
 * ## Non-existence is a value, not a gap
 *
 * `ABSENT` is a fingerprint like any other. Without it, creating a protected
 * file and deleting one would both read as "no entry on one side" and the diff
 * would have to guess which. With it, all three changes — created, modified,
 * deleted — fall out of one comparison of two strings, and the case split below
 * is disjoint and complete by construction rather than by care.
 *
 * ## No size threshold, and no special case for binaries
 *
 * Measured in the worst place available: fusion's own repository, where the
 * shipped patterns match 53 files totalling 745 KB — and where the measurement
 * stands down anyway. A consuming project matches none of `agents/`, `skills/`,
 * `bin/monitor` or the plugin manifest; what it matches is its own `rules/` and
 * three small JSON files. A buffer that size needs no threshold, so there is
 * none.
 *
 * That is a design statement and not only a measurement. A threshold would be a
 * special case, and the fallback above it could only be `HEAD` — the branch this
 * change exists to remove, reintroduced with a number in front of it. For the
 * same reason content is read and written as BYTES, base64 on the way through
 * JSON: `bin/monitor` is then not a case of its own either.
 *
 * ## The BEFORE fingerprint is the condition of admissibility
 *
 * It is not a refinement, and it is not an optimisation. Without it the guard
 * would compare the working tree against `HEAD` and revert everything that
 * differs — including a rule file the human is editing in their own editor right
 * now. The guard would destroy human work on the next unrelated tool call.
 * Comparing two snapshots taken around ONE tool call is what makes the
 * measurement attributable, and attribution is what makes reverting permissible
 * at all.
 *
 * ## What this module does NOT do
 *
 * It owns the fingerprint FORMAT, in both directions — taking one, and putting
 * a path back to one. It decides nothing: no halt, no event, no judgement about
 * whether a change was exempt. Those are `tracker.ts`'s, so this module stays
 * measurable one case at a time.
 *
 * Both directions live here on purpose. The encoding is one fact, and a caller
 * that decoded the bytes for itself would be a second place that has to agree
 * about it.
 */
/**
 * The fingerprint of a path that does not exist.
 *
 * Base64 draws on `[A-Za-z0-9+/=]`, so a value carrying a `:` cannot collide
 * with the fingerprint of any real file — including the empty one, whose
 * fingerprint is the empty string and is therefore still distinct from this.
 */
export declare const ABSENT = "absent:no-such-file";
/** A protected path and the fingerprint it carried at one instant. */
export interface ProtectedSnapshot {
    /** ISO timestamp, for the reader of a stale snapshot file. */
    ts: string;
    /**
     * The working directory the paths are relative to. A comparison across two
     * different roots is meaningless, so `diffSnapshots` refuses one.
     */
    cwd: string;
    /** Project-relative path → base64 content, or `ABSENT`. */
    paths: Record<string, string>;
}
/** How a protected path differs between two snapshots. */
export interface ProtectedChange {
    /** Project-relative, as the protected patterns are written. */
    path: string;
    kind: "created" | "modified" | "deleted";
    /**
     * The fingerprint this path carried BEFORE the tool call — base64 content, or
     * `ABSENT`. It is the restore target, and `restore` reads it.
     *
     * Carried on the change rather than looked up again from the snapshot, so the
     * value restored is provably the value compared. A second lookup is a second
     * answer to one question, and the two can disagree.
     */
    before: string;
}
/**
 * Every existing file under `root` that the patterns protect.
 *
 * The walk starts at the project root and descends ONLY where a pattern points
 * (see `shouldDescend`), so an ordinary project reads its root directory and
 * then a handful of small trees — not `src/`, not `node_modules`, not `.git`.
 *
 * ## Symlinks are not followed, and that is a stated residual
 *
 * A symlinked directory is skipped rather than walked, because following one
 * invites a cycle and a walk that never returns. A symlinked FILE inside a
 * protected directory is hashed by its target's content, since `readFileSync`
 * follows it — so replacing what it points at IS measured, while a link planted
 * to reach OUTSIDE the protected tree is not watched at the far end. The
 * protection side has always been textual about symlinks (`lib/paths.ts`), so
 * this is the same boundary, not a new one.
 */
export declare function enumerateProtected(root: string, patterns: readonly string[]): string[];
/**
 * The fingerprint of one path: its bytes in base64, or `ABSENT`.
 *
 * Content, not mtime. An mtime moves when nothing changed (a checkout, a
 * `touch`, a copy) and stands still at one-second granularity when something
 * did — both directions are wrong here, and the wrong one costs a revert of
 * work nobody changed.
 *
 * Bytes, not text: a protected path can be a binary (`bin/monitor` is on the
 * shipped list), and a utf-8 round trip would corrupt it on the way back.
 *
 * A directory reads as `ABSENT`: the patterns select files, and a path that is
 * a directory is not a file whose content this guard can restore.
 */
export declare function fingerprint(root: string, rel: string): string;
/** Fingerprint every protected path under `root`. */
export declare function takeSnapshot(root: string, patterns: readonly string[]): ProtectedSnapshot;
/**
 * What changed between two snapshots of the same project.
 *
 * The comparison ranges over the UNION of both key sets, so a path that only
 * one side knows about is still compared — against `ABSENT`, which is what a
 * missing key means. That is what makes the three change kinds fall out of one
 * string comparison instead of three branches that can disagree.
 *
 * A pair taken in two different working directories yields NOTHING rather than
 * a list of phantom deletions. It should not happen — one process writes and the
 * next reads within the same tool call — but the honest answer to "these two
 * describe different projects" is that nothing was measured, not that everything
 * vanished.
 */
export declare function diffSnapshots(before: ProtectedSnapshot, after: ProtectedSnapshot): ProtectedChange[];
/**
 * Put one path back to the fingerprint it carried before the tool call.
 *
 * ## One case split, and it is the same one the fingerprint already makes
 *
 * `ABSENT` before means the path did not exist, so restoring it means deleting
 * it. Anything else is content, so restoring it means writing those bytes. The
 * two branches are disjoint by the definition of `ABSENT` and complete because a
 * fingerprint is one or the other — the split is not maintained here, it is
 * inherited.
 *
 * `kind` is deliberately NOT consulted. It is a label for the reader of a
 * message; `before` is the value that decides. Branching on both would be two
 * encodings of one fact, free to drift.
 *
 * The parent directory is created on the way, because a `rm -rf rules/` removes
 * it along with the file and the restore has to be able to put a whole subtree
 * back.
 *
 * ## Throws rather than reporting
 *
 * An I/O failure here — a path that is now a directory, a read-only filesystem —
 * is a real failure of the restore, and the caller has to say so to the user. It
 * throws so that a caller cannot mistake failure for success by ignoring a
 * return value. `tracker.ts` turns the exception into the sentence.
 */
export declare function restore(root: string, change: ProtectedChange): void;
/** Write the pre-call snapshot atomically. No-op without a workbench. */
export declare function saveSnapshot(snapshot: ProtectedSnapshot): void;
/**
 * The pre-call snapshot, or null when there is none to compare against.
 *
 * Null is the correct answer to "no before-picture", and `tracker.ts` must treat
 * it as "measure nothing". Falling back to `HEAD`, or to an empty snapshot,
 * would revert changes this tool call did not make — the exact failure the
 * before-fingerprint exists to prevent.
 */
export declare function loadSnapshot(): ProtectedSnapshot | null;
