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
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, statSync, writeFileSync, } from "node:fs";
import { dirname, resolve } from "node:path";
import { foldCase, matchesAnyFolded } from "./paths.js";
import { findWorkbenchRoot } from "./workbench-root.js";
/**
 * The fingerprint of a path that does not exist.
 *
 * Base64 draws on `[A-Za-z0-9+/=]`, so a value carrying a `:` cannot collide
 * with the fingerprint of any real file — including the empty one, whose
 * fingerprint is the empty string and is therefore still distinct from this.
 */
export const ABSENT = "absent:no-such-file";
/**
 * Directory names never descended into, whatever the patterns say.
 *
 * `.git` and `node_modules` are cost: a project that declares a broad pattern
 * (`**`, or a `*` at the root) would otherwise walk them on every tool call, and
 * neither holds anything a protected pattern is written for.
 *
 * `.guard-state` is CORRECTNESS, and it is the same self-reference argument that
 * took it off `guard.protectedPaths` in this Circle's first step: the
 * measurement writes its own snapshot, its own events and its own escalation
 * counter into that directory, so watching it would make every single tool call
 * report its own bookkeeping as a violation. The entry is defensive — nothing on
 * the shipped list points there any more — and it exists because a project can
 * still declare `fusion-workbench/**` in its own `fusion-guard.json` and would
 * otherwise deadlock its guard with a configuration that looks reasonable.
 */
const WALK_SKIP = [".git", "node_modules", ".guard-state"];
/* ------------------------------------------------------------------ *
 * Enumeration
 * ------------------------------------------------------------------ */
/**
 * Is this directory worth descending into, given the patterns?
 *
 * Two ways to answer yes, and together they are the whole of it:
 *
 *   1. A pattern LIVES under here — `hooks/config.json` when we are looking at
 *      `hooks`. Tested by prefix on the folded text.
 *   2. A pattern ALREADY COVERS everything below — `rules/**` when we are
 *      looking at `rules` or at `rules/retired`. Tested by matching the
 *      directory with a trailing separator, which `^rules/.*$` accepts because
 *      its `.*` matches the empty string.
 *
 * The folded comparison is deliberate and matches the protection side exactly.
 * `matchesAnyFolded` is what decides whether a FILE is protected, so an
 * enumeration that folded differently would watch a set other than the one the
 * guard protects — and the gap would be invisible, because both halves would
 * look right on their own.
 */
function shouldDescend(rel, patterns) {
    const folded = foldCase(rel) + "/";
    if (patterns.some((p) => foldCase(p).startsWith(folded)))
        return true;
    return matchesAnyFolded(rel + "/", patterns);
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
export function enumerateProtected(root, patterns) {
    const found = [];
    if (patterns.length === 0)
        return found;
    const walk = (rel) => {
        let entries;
        try {
            entries = readdirSync(rel === "" ? root : resolve(root, rel), {
                withFileTypes: true,
            });
        }
        catch {
            // Unreadable directory: nothing to fingerprint, and a permission error
            // must not take the guard's fail-open path on an ordinary tool call.
            return;
        }
        for (const entry of entries) {
            if (entry.isSymbolicLink())
                continue;
            const childRel = rel === "" ? entry.name : `${rel}/${entry.name}`;
            if (entry.isDirectory()) {
                if (WALK_SKIP.includes(entry.name))
                    continue;
                if (shouldDescend(childRel, patterns))
                    walk(childRel);
            }
            else if (entry.isFile()) {
                if (matchesAnyFolded(childRel, patterns))
                    found.push(childRel);
            }
        }
    };
    walk("");
    return found;
}
/**
 * The patterns that name one path outright — no `*`, no `?`.
 *
 * These are watched whether or not they exist, which is what makes CREATING one
 * measurable. A glob-covered path needs no such treatment: the second
 * enumeration finds a newly created file on its own, and the first snapshot
 * simply has no entry for it.
 *
 * Absolute entries are dropped. The self-protection floor appends
 * `fusion-guard.json` in both its bare and its absolute spelling, and only the
 * bare one lives in the coordinate space these project-relative paths are
 * written in; watching the absolute twin would fingerprint the same file under
 * two names and report every change to it twice.
 */
function literalPaths(patterns) {
    return patterns.filter((p) => !p.startsWith("/") && !/[*?]/.test(p));
}
/* ------------------------------------------------------------------ *
 * Fingerprinting
 * ------------------------------------------------------------------ */
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
export function fingerprint(root, rel) {
    const abs = resolve(root, rel);
    try {
        if (!statSync(abs).isFile())
            return ABSENT;
        return readFileSync(abs).toString("base64");
    }
    catch {
        return ABSENT;
    }
}
/** Fingerprint every protected path under `root`. */
export function takeSnapshot(root, patterns) {
    const watched = new Set([
        ...enumerateProtected(root, patterns),
        ...literalPaths(patterns),
    ]);
    const paths = {};
    for (const rel of watched)
        paths[rel] = fingerprint(root, rel);
    return { ts: new Date().toISOString(), cwd: root, paths };
}
/* ------------------------------------------------------------------ *
 * Comparison
 * ------------------------------------------------------------------ */
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
export function diffSnapshots(before, after) {
    if (before.cwd !== after.cwd)
        return [];
    const changes = [];
    for (const path of new Set([
        ...Object.keys(before.paths),
        ...Object.keys(after.paths),
    ])) {
        const was = before.paths[path] ?? ABSENT;
        const now = after.paths[path] ?? ABSENT;
        if (was === now)
            continue;
        changes.push({
            path,
            kind: was === ABSENT ? "created" : now === ABSENT ? "deleted" : "modified",
            before: was,
        });
    }
    return changes.sort((a, b) => a.path.localeCompare(b.path));
}
/* ------------------------------------------------------------------ *
 * Restoring
 * ------------------------------------------------------------------ */
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
export function restore(root, change) {
    const abs = resolve(root, change.path);
    if (change.before === ABSENT) {
        // `force` only suppresses "it was already gone", which is success here. A
        // path that is now a DIRECTORY still throws, and should.
        rmSync(abs, { force: true });
        return;
    }
    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, Buffer.from(change.before, "base64"));
}
/* ------------------------------------------------------------------ *
 * Persistence — the seam between the two hooks
 * ------------------------------------------------------------------ */
/**
 * `<project-root>/fusion-workbench/.guard-state/protected-snapshot.json`, or
 * null when no workbench is set up.
 *
 * The same no-workbench no-op every other state module takes: a plain Claude
 * session in a directory that never ran `/fusion:setup` must not bootstrap a
 * stray workbench, so the whole measurement stands down there.
 */
function snapshotPath() {
    const root = findWorkbenchRoot();
    if (!root)
        return null;
    return resolve(root, "fusion-workbench", ".guard-state", "protected-snapshot.json");
}
/** Write the pre-call snapshot atomically. No-op without a workbench. */
export function saveSnapshot(snapshot) {
    const path = snapshotPath();
    if (!path)
        return;
    try {
        mkdirSync(resolve(path, ".."), { recursive: true });
        const tmp = `${path}.tmp`;
        writeFileSync(tmp, JSON.stringify(snapshot), "utf-8");
        renameSync(tmp, path);
    }
    catch {
        // A snapshot that cannot be written means the next comparison has no
        // before-picture and skips. Silent here on purpose: `guard.ts` fails OPEN,
        // and a full disk must not turn every tool call into a guard error.
    }
}
/**
 * The pre-call snapshot, or null when there is none to compare against.
 *
 * Null is the correct answer to "no before-picture", and `tracker.ts` must treat
 * it as "measure nothing". Falling back to `HEAD`, or to an empty snapshot,
 * would revert changes this tool call did not make — the exact failure the
 * before-fingerprint exists to prevent.
 */
export function loadSnapshot() {
    const path = snapshotPath();
    if (!path || !existsSync(path))
        return null;
    try {
        const parsed = JSON.parse(readFileSync(path, "utf-8"));
        if (typeof parsed !== "object" ||
            parsed === null ||
            typeof parsed.cwd !== "string" ||
            typeof parsed.paths !== "object" ||
            parsed.paths === null) {
            return null;
        }
        return parsed;
    }
    catch {
        return null;
    }
}
