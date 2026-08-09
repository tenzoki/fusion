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
 * ## Non-existence is a value, not a gap — and neither is being a link
 *
 * `ABSENT` is a fingerprint like any other. Without it, creating a protected
 * file and deleting one would both read as "no entry on one side" and the diff
 * would have to guess which. With it, all three changes — created, modified,
 * deleted — fall out of one comparison of two strings, and the case split below
 * is disjoint and complete by construction rather than by care.
 *
 * `LINK_PREFIX` is the same move made a second time. A path that is a symbolic
 * link used to be fingerprinted by whatever it POINTED AT — an object the
 * project never protected — so a regular file replaced by a link read as
 * deleted, or as unchanged when the target's bytes happened to match, and the
 * restore then wrote the protected content into that target. Giving the link a
 * value of its own kind keeps the whole mechanism answering one question about
 * one object: not "what is at the end of this path", but "what IS this path".
 * See `fingerprint` and `restore`, and issues `260809-1104` / `260809-1231`.
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
 * now. The guard would destroy human work on the next unrelated tool call. The
 * pair is what bounds the measurement to one tool call, and that bound is what
 * makes reverting permissible at all.
 *
 * What the pair bounds is the INTERVAL, not the author. Two fingerprints taken
 * around one tool call say that a protected path changed between them; they do
 * not say who changed it, and nothing in this module's inputs could. A human
 * editor saving during the call, a file watcher and a second Claude session are
 * all indistinguishable here from the agent's own write. That is a real cost and
 * it is measured: `260809-1107`. It is stated here rather than papered over,
 * because the older wording — "attributable", full stop — claimed more than the
 * mechanism can deliver, and a claim that strong is what lets a reader stop
 * looking for the case that breaks it.
 *
 * ## A before-picture is consumed exactly once
 *
 * The pair only bounds an interval if the picture the second half reads is the
 * one the first half of THAT call wrote. Two ways it was not, both measured in
 * `260809-1108`: a failing save left the previous snapshot in place, so a
 * comparison ran against a picture two or more calls old and reverted a state
 * no measurement had objected to; and nothing removed a snapshot after use, so a
 * second PostToolUse with no PreToolUse in front of it measured against a call
 * that had already ended. `saveSnapshot` therefore removes the stale file when
 * its own write fails, and `consumeSnapshot` unlinks the picture as it reads it.
 * After either, the correct answer to "what was here before?" is that nobody
 * knows — and `tracker.ts` measures nothing, which is the one safe reading.
 *
 * There is deliberately **no age bound** on a snapshot. A legitimate tool-call
 * window has no upper limit: this repository's own test suite holds one open for
 * well over a minute and a build holds it longer, so any "too old to trust"
 * threshold would turn a legitimate measurement into a silent skip — a fail-open
 * introduced by the fix for a fail-wrong. Single use gives the same guarantee
 * without a number in it.
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

import {
  closeSync,
  constants,
  existsSync,
  lstatSync,
  mkdirSync,
  openSync,
  readFileSync,
  readdirSync,
  readlinkSync,
  realpathSync,
  renameSync,
  rmSync,
  statSync,
  symlinkSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { dirname, resolve } from "node:path";
import { foldCase, matchesAnyFolded } from "./paths.js";
import { isFusionPluginRoot } from "./self-detect.js";
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
 * The prefix of the fingerprint of a path that IS a symbolic link. What follows
 * it is the link's target, verbatim as `readlink` reports it.
 *
 * A third value rather than a special case: the domain is `ABSENT`, a
 * `symlink:` value, or base64 content, and it is disjoint by the same argument
 * `ABSENT` already rests on — both sentinels carry a `:`, base64 cannot. So a
 * regular file replaced by a link reads as `modified` out of the one string
 * comparison in `diffSnapshots`, with no branch added there.
 */
export const LINK_PREFIX = "symlink:";

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
const WALK_SKIP: readonly string[] = [".git", "node_modules", ".guard-state"];

/** A protected path and the fingerprint it carried at one instant. */
export interface ProtectedSnapshot {
  /**
   * ISO timestamp of the moment the fingerprints were taken. Written, and read
   * by no code in this repository.
   *
   * It is kept for the human who opens the file while debugging, and its own
   * documentation used to name a reader that never existed: "for the reader of a
   * stale snapshot file". The obvious reader would reject a snapshot older than
   * some bound — and that reader must not be written, because a legitimate tool
   * call has no maximum duration and the bound would silently skip the
   * measurement for every long one. Staleness is answered by single use instead;
   * see the module header.
   */
  ts: string;
  /**
   * The working directory the paths are relative to. A comparison across two
   * different roots is meaningless, so `diffSnapshots` refuses one.
   */
  cwd: string;
  /** Project-relative path → base64 content, `ABSENT`, or a `LINK_PREFIX` value. */
  paths: Record<string, string>;
}

/** How a protected path differs between two snapshots. */
export interface ProtectedChange {
  /** Project-relative, as the protected patterns are written. */
  path: string;
  kind: "created" | "modified" | "deleted";
  /**
   * The fingerprint this path carried BEFORE the tool call — base64 content,
   * `ABSENT`, or a `LINK_PREFIX` value. It is the restore target, and `restore`
   * reads it.
   *
   * Carried on the change rather than looked up again from the snapshot, so the
   * value restored is provably the value compared. A second lookup is a second
   * answer to one question, and the two can disagree.
   */
  before: string;
}

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
function shouldDescend(rel: string, patterns: readonly string[]): boolean {
  const folded = foldCase(rel) + "/";
  if (patterns.some((p) => foldCase(p).startsWith(folded))) return true;
  return matchesAnyFolded(rel + "/", patterns);
}

/**
 * Every existing file under `root` that the patterns protect.
 *
 * The walk starts at the project root and descends ONLY where a pattern points
 * (see `shouldDescend`), so an ordinary project reads its root directory and
 * then a handful of small trees — not `src/`, not `node_modules`, not `.git`.
 *
 * ## A symbolic link is a state of the path, not a way out of the set
 *
 * A symlinked FILE is enumerated like any other path, and its fingerprint is
 * the link itself (see `fingerprint`), not what it points at. That is the half
 * that changed: while a link was skipped here, one `ln -s` over a glob-covered
 * file took the path out of the watched set permanently, and the next tool call
 * could rewrite it with nothing measured at all (`260809-1104`, consequence 3 —
 * the one the issue names as mattering most).
 *
 * A symlinked DIRECTORY is still skipped rather than walked, and the reason is
 * unchanged: following one invites a cycle and a walk that never returns. What
 * sits at the far end of such a link is therefore not watched. That is a
 * residual and not a hole in the set the patterns name, because the link
 * standing in the tree is itself now a measured path wherever the patterns
 * select it as a file.
 *
 * A DANGLING link — one whose target does not exist — counts as a file here.
 * `linksToDirectory` answers false for it, so it stays in the set and its
 * fingerprint records what it points at. Dropping it would hand back the same
 * disappearance through a link that happens to be broken.
 */
export function enumerateProtected(
  root: string,
  patterns: readonly string[],
): string[] {
  const found: string[] = [];
  if (patterns.length === 0) return found;

  const walk = (rel: string): void => {
    let entries;
    try {
      entries = readdirSync(rel === "" ? root : resolve(root, rel), {
        withFileTypes: true,
      });
    } catch {
      // Unreadable directory: nothing to fingerprint, and a permission error
      // must not take the guard's fail-open path on an ordinary tool call.
      return;
    }
    for (const entry of entries) {
      const childRel = rel === "" ? entry.name : `${rel}/${entry.name}`;
      if (entry.isSymbolicLink()) {
        // The dirent comes from `lstat`, so `isDirectory()` and `isFile()` are
        // both false on a link and the one extra `stat` below is what separates
        // the two cases.
        if (linksToDirectory(resolve(root, childRel))) continue;
        if (matchesAnyFolded(childRel, patterns)) found.push(childRel);
        continue;
      }
      if (entry.isDirectory()) {
        if (WALK_SKIP.includes(entry.name)) continue;
        if (shouldDescend(childRel, patterns)) walk(childRel);
      } else if (entry.isFile()) {
        if (matchesAnyFolded(childRel, patterns)) found.push(childRel);
      }
    }
  };

  walk("");
  return found;
}

/**
 * Does this symbolic link point at a directory?
 *
 * The one place the walk deliberately FOLLOWS a link, and it reads nothing —
 * `stat` answers the cycle question and stops. A broken link answers false, so
 * it is treated as a file and stays watched; see `enumerateProtected`'s header.
 */
function linksToDirectory(abs: string): boolean {
  try {
    return statSync(abs).isDirectory();
  } catch {
    return false;
  }
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
function literalPaths(patterns: readonly string[]): string[] {
  return patterns.filter((p) => !p.startsWith("/") && !/[*?]/.test(p));
}

/* ------------------------------------------------------------------ *
 * Fingerprinting
 * ------------------------------------------------------------------ */

/**
 * The fingerprint of one path: its bytes in base64, its link target, or
 * `ABSENT`.
 *
 * ## `lstat`, so the answer is about the PATH and not about its target
 *
 * This used to be `statSync` + `readFileSync`, and both resolve a link. The
 * fingerprint of a protected path standing over a symlink was therefore the
 * fingerprint of an object the project never protected — and the restore, which
 * followed the link too, wrote the protected file's previous bytes into that
 * object. Measured in `260809-1104`: one `ln -s` overwrote an arbitrary file
 * outside the protected tree, and the guard reported it as a successful
 * restore.
 *
 * `lstat` asks about the path itself, and a link gets a value of its own kind.
 * That is what makes a regular file turning into a link read as `modified`
 * rather than as `deleted`, and it is what stops the target's content from
 * standing in for the path's.
 *
 * `readFileSync` on the line below still resolves every component in FRONT of
 * the last one, so a symlinked parent directory is not answered here. It is
 * answered where it does damage — see `restore`, which refuses to write through
 * one (`260809-1231`).
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
export function fingerprint(root: string, rel: string): string {
  const abs = resolve(root, rel);
  try {
    const stat = lstatSync(abs);
    if (stat.isSymbolicLink()) return LINK_PREFIX + readlinkSync(abs);
    if (!stat.isFile()) return ABSENT;
    return readFileSync(abs).toString("base64");
  } catch {
    return ABSENT;
  }
}

/** Fingerprint every protected path under `root`. */
export function takeSnapshot(
  root: string,
  patterns: readonly string[],
): ProtectedSnapshot {
  const watched = new Set<string>([
    ...enumerateProtected(root, patterns),
    ...literalPaths(patterns),
  ]);

  const paths: Record<string, string> = {};
  for (const rel of watched) paths[rel] = fingerprint(root, rel);

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
export function diffSnapshots(
  before: ProtectedSnapshot,
  after: ProtectedSnapshot,
): ProtectedChange[] {
  if (before.cwd !== after.cwd) return [];

  const changes: ProtectedChange[] = [];
  for (const path of new Set([
    ...Object.keys(before.paths),
    ...Object.keys(after.paths),
  ])) {
    const was = before.paths[path] ?? ABSENT;
    const now = after.paths[path] ?? ABSENT;
    if (was === now) continue;
    changes.push({
      path,
      kind:
        was === ABSENT ? "created" : now === ABSENT ? "deleted" : "modified",
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
 * it. A `LINK_PREFIX` value means it was a symbolic link, so restoring it means
 * recreating that link. Anything else is content, so restoring it means writing
 * those bytes. The three branches are disjoint by the definition of the two
 * sentinels and complete because a fingerprint is one of the three — the split
 * is not maintained here, it is inherited.
 *
 * Recreating the link rather than flattening it into a regular file is not a
 * courtesy. The invariant is "put the path back to what it was", and a project
 * whose rule file legitimately IS a symlink would otherwise have that link
 * silently replaced with a copy by the mechanism that exists to prevent exactly
 * that kind of loss.
 *
 * `kind` is deliberately NOT consulted. It is a label for the reader of a
 * message; `before` is the value that decides. Branching on both would be two
 * encodings of one fact, free to drift.
 *
 * The parent directory is created on the way, because a `rm -rf rules/` removes
 * it along with the file and the restore has to be able to put a whole subtree
 * back.
 *
 * ## The write never follows a link, at any component
 *
 * Two doors, one question — *is the object about to be written the object that
 * was measured?* — and both have to be shut, because either one alone turns the
 * guard's own remediation into an arbitrary-write primitive.
 *
 *   - The FINAL component (`260809-1104`): a link standing at the protected
 *     path is unlinked before the write, and the write opens with `O_NOFOLLOW`
 *     so a link planted in the gap between the two fails loudly with `ELOOP`
 *     instead of landing on a stranger's file. `O_NOFOLLOW` is absent on
 *     Windows, where the `?? 0` degrades the open to today's behaviour rather
 *     than to `NaN`.
 *   - The PARENT chain (`260809-1231`): `mkdirSync(…, {recursive: true})`
 *     succeeds on an existing symlinked directory and `writeFileSync` then
 *     resolves it, so `O_NOFOLLOW` on the last component reaches none of this.
 *     `assertPathResolvesInPlace` compares the parent's realpath against the
 *     lexical one and REFUSES when they diverge. Refusing cannot open
 *     behaviour: the change stays measured, the halt still fires, and the model
 *     is told the change is still on disk. Writing anyway is the only outcome
 *     that could not be taken back.
 *
 * The parent check guards the delete branch too. Unlinking a stranger's file is
 * the same primitive pointed the other way.
 *
 * ## Throws rather than reporting
 *
 * An I/O failure here — a path that is now a directory, a read-only filesystem,
 * a parent that resolves somewhere else — is a real failure of the restore, and
 * the caller has to say so to the user. It throws so that a caller cannot
 * mistake failure for success by ignoring a return value. `tracker.ts` turns
 * the exception into the sentence.
 */
export function restore(root: string, change: ProtectedChange): void {
  const abs = resolve(root, change.path);

  if (change.before === ABSENT) {
    assertPathResolvesInPlace(root, change.path);
    // `force` only suppresses "it was already gone", which is success here. A
    // path that is now a DIRECTORY still throws, and should.
    rmSync(abs, { force: true });
    return;
  }

  // Before the check, because a `rm -rf rules/` took the parent with it and an
  // absent parent has no realpath to compare. `mkdirSync` cannot itself create
  // a path through a link that was not already there.
  mkdirSync(dirname(abs), { recursive: true });
  assertPathResolvesInPlace(root, change.path);

  // Whatever stands here now, it is not what the guard is putting back. A link
  // in particular must go before the write, or the write lands on its target.
  removeIfSymlink(abs);

  if (change.before.startsWith(LINK_PREFIX)) {
    rmSync(abs, { force: true });
    symlinkSync(change.before.slice(LINK_PREFIX.length), abs);
    return;
  }

  writeNoFollow(abs, Buffer.from(change.before, "base64"));
}

/**
 * Throw unless every component in front of the last one resolves to itself.
 *
 * A divergence means some directory on the way is a symbolic link, so the
 * object at the end of the path is not the object the patterns name and not the
 * object the before-fingerprint describes.
 *
 * Both sides resolve the ROOT, because macOS resolves `/tmp` to `/private/tmp`
 * and the suite already carries cases named for that trap. Only the root: the
 * relative part is joined lexically on the expected side, which is precisely
 * what makes a link in it detectable.
 *
 * The comparison folds case for the same reason `matchesAnyFolded` does. On a
 * case-insensitive volume `realpath` reports the on-disk spelling while the
 * lexical side carries the spelling the pattern was written in, and an
 * unfolded comparison would refuse a perfectly ordinary restore over a letter.
 * Folding costs nothing here: two paths that differ only in case name the same
 * directory on such a volume, and on a case-sensitive one no link is hidden by
 * it that a different name would not already reveal.
 */
function assertPathResolvesInPlace(root: string, rel: string): void {
  let expected: string;
  let actual: string;
  try {
    expected = resolve(realpathSync(root), dirname(rel));
    actual = realpathSync(dirname(resolve(root, rel)));
  } catch (err) {
    throw new Error(
      `the parent directory of ${rel} could not be resolved, so the restore was refused: ${
        err instanceof Error ? err.message : String(err)
      }`,
    );
  }
  if (foldCase(actual) !== foldCase(expected)) {
    throw new Error(
      `${rel} resolves through a symbolic link — its parent directory is ${actual}, not ${expected}. ` +
        `Writing there would put the content somewhere the guard never measured, so the restore was refused.`,
    );
  }
}

/** Unlink whatever is at `abs` if — and only if — it is a symbolic link. */
function removeIfSymlink(abs: string): void {
  let stat;
  try {
    stat = lstatSync(abs);
  } catch {
    return; // Nothing there. The write below creates it.
  }
  if (stat.isSymbolicLink()) unlinkSync(abs);
}

/**
 * `writeFileSync` that refuses a symbolic link at the final component.
 *
 * `removeIfSymlink` already took one away; this closes the window between that
 * call and this one. `O_NOFOLLOW` makes `open` fail with `ELOOP` rather than
 * writing the target, and the exception travels the same route every other I/O
 * failure here does.
 */
function writeNoFollow(abs: string, bytes: Buffer): void {
  const flags =
    constants.O_WRONLY |
    constants.O_CREAT |
    constants.O_TRUNC |
    (constants.O_NOFOLLOW ?? 0);
  const fd = openSync(abs, flags, 0o666);
  try {
    writeFileSync(fd, bytes);
  } finally {
    closeSync(fd);
  }
}

/* ------------------------------------------------------------------ *
 * Where the measurement anchors
 * ------------------------------------------------------------------ */

/**
 * The directory the protected patterns are matched against — or null when there
 * is no measurement to take.
 *
 * ## Why this is the workbench root and not `process.cwd()`
 *
 * `guard.protectedPaths` is written in project-relative shapes: `rules/**`,
 * `hooks/config.json`, `bin/monitor`. The project they are relative to is the
 * one `findWorkbenchRoot` walks up to — that is where the workbench lives, where
 * `fusion-guard.json` is read from, and where every other state module already
 * writes. Anchoring the patterns at `process.cwd()` instead made the guard
 * answer a different question from the configuration that feeds it, and the
 * disagreement was not theoretical:
 *
 *   - From `<project>/sub`, `rules/**` enumerated NOTHING. A shell command that
 *     rewrote the project's own `rules/x.md` left it rewritten — no revert, no
 *     halt, no event, nothing said to the model.
 *   - From that same `<project>/sub`, a `sub/rules/y.md` — a path the project's
 *     list never named under any spelling — WAS enumerated, reverted and halted
 *     on.
 *
 * So the guard protected a directory that need not exist while leaving the one
 * that does unwatched. Both halves were measured through the real hooks before
 * this root moved; both are pinned in
 * `lib/__tests__/protected-snapshot-subdirectory.test.ts`.
 *
 * ## Null has two causes and they are deliberately one answer
 *
 * **No workbench.** The same no-op every other state module takes: a plain
 * Claude session in a directory that never ran `/fusion:setup` must not
 * bootstrap a stray workbench.
 *
 * **The workbench root IS the fusion plugin's own repository.** The measurement
 * is a write-guard concern and stands down here exactly as the write tools do:
 * `agents/**` and `rules/**` are the work in this one repository,
 * not the thing being protected, and reverting them would destroy it.
 *
 * That second test is `isFusionPluginRoot(root)` and NOT `isFusionPluginCwd()`,
 * and the difference is the whole reason this function exists. `isFusionPluginCwd`
 * reads cwd with no upward walk, so a fusion developer whose session started in
 * `fusion-workbench/` — the ordinary case — is not detected there. Moving the
 * measurement root up while leaving the stand-down at cwd would have started
 * reverting that developer's own edits: a new defect in exchange for the closed
 * one. The two roots move together or not at all.
 */
export function measurementRoot(): string | null {
  const root = findWorkbenchRoot();
  if (root === null) return null;
  if (isFusionPluginRoot(root)) return null;
  return root;
}

/* ------------------------------------------------------------------ *
 * Persistence — the seam between the two hooks
 * ------------------------------------------------------------------ */

/**
 * `<project-root>/fusion-workbench/.guard-state/protected-snapshot.json`, or
 * null when no workbench is set up.
 *
 * Deliberately `findWorkbenchRoot` and not `measurementRoot`: this is where the
 * file LIVES, which is a workbench question, while `measurementRoot` also
 * answers whether a measurement happens at all. Where both are non-null they are
 * the same directory by construction, so the snapshot is always stored under the
 * root its own paths are relative to.
 */
function snapshotPath(): string | null {
  const root = findWorkbenchRoot();
  if (!root) return null;
  return resolve(root, "fusion-workbench", ".guard-state", "protected-snapshot.json");
}

/**
 * Write the pre-call snapshot atomically. No-op without a workbench.
 *
 * ## A failed write removes the previous snapshot
 *
 * The write that can fail is the one to `${path}.tmp`, and it leaves the
 * existing `protected-snapshot.json` completely untouched. So the comment that
 * used to stand in the `catch` — "the next comparison has no before-picture and
 * skips" — described the opposite of what happened: `loadSnapshot` found the
 * PREVIOUS call's picture and handed it over, and the comparison then reverted
 * every protected path that had changed since, to a state no measurement had
 * ever objected to (`260809-1108`).
 *
 * Removing the stale file is what makes that sentence true. The failure stays
 * silent otherwise, for the reason it always was: `guard.ts` fails OPEN, and a
 * full disk must not turn every tool call into a guard error.
 */
export function saveSnapshot(snapshot: ProtectedSnapshot): void {
  const path = snapshotPath();
  if (!path) return;
  try {
    mkdirSync(resolve(path, ".."), { recursive: true });
    const tmp = `${path}.tmp`;
    writeFileSync(tmp, JSON.stringify(snapshot), "utf-8");
    renameSync(tmp, path);
  } catch {
    try {
      // `force` so "there was none" counts as success — the common case when
      // the very first save of a session fails.
      rmSync(path, { force: true });
    } catch {
      // The stale file could not be removed either, so the next comparison may
      // still read it. Nothing better is available from inside a hook that must
      // not fail the tool call, and the alternative — throwing — would trade a
      // wrong revert for no guard at all.
    }
  }
}

/**
 * Read the pre-call snapshot and remove it, so no second measurement can use it.
 *
 * This is what `tracker.ts` calls. `loadSnapshot` below is the plain read and
 * has no production caller: a picture that is read without being consumed is
 * exactly the state `260809-1108` describes, where a PostToolUse with no
 * PreToolUse in front of it measured against a call that had already ended.
 *
 * The unlink happens AFTER the object is in memory, so a later failure in the
 * same call still works from the picture it already holds. It also runs when the
 * load returned null: a snapshot that cannot be parsed is not a picture anyone
 * can use, and leaving it would keep answering the same nothing on every
 * subsequent call.
 */
export function consumeSnapshot(): ProtectedSnapshot | null {
  const path = snapshotPath();
  if (!path) return null;
  const snapshot = loadSnapshot();
  try {
    rmSync(path, { force: true });
  } catch {
    // See `saveSnapshot`: a hook cannot fail the tool call over its own
    // bookkeeping. The snapshot that stays behind is the known residual, not a
    // new one.
  }
  return snapshot;
}

/**
 * The pre-call snapshot, or null when there is none to compare against.
 *
 * Null is the correct answer to "no before-picture", and `tracker.ts` must treat
 * it as "measure nothing". Falling back to `HEAD`, or to an empty snapshot,
 * would revert changes this tool call did not make — the exact failure the
 * before-fingerprint exists to prevent.
 *
 * The plain read, leaving the file where it is. `consumeSnapshot` is what the
 * measurement uses; this one is the half of it that answers "what does the file
 * say", separated so the reading and the removing are each one thing.
 */
export function loadSnapshot(): ProtectedSnapshot | null {
  const path = snapshotPath();
  if (!path || !existsSync(path)) return null;
  try {
    const parsed = JSON.parse(readFileSync(path, "utf-8")) as unknown;
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      typeof (parsed as ProtectedSnapshot).cwd !== "string" ||
      typeof (parsed as ProtectedSnapshot).paths !== "object" ||
      (parsed as ProtectedSnapshot).paths === null
    ) {
      return null;
    }
    return parsed as ProtectedSnapshot;
  } catch {
    return null;
  }
}
