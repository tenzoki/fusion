/**
 * What a protected path was OBSERVED to hold, kept before the guard writes the
 * before-fingerprint back over it.
 *
 * ## Why anything is kept at all
 *
 * Two fingerprints taken around one tool call bound an INTERVAL, not an author.
 * A human editor saving during the call, a file watcher, a build and a second
 * Claude session are all indistinguishable here from the agent's own write —
 * measured, with the sequence written out, in `260809-1107`. Until this module
 * existed the observed bytes were simply overwritten, so the guard's answer to a
 * misattribution was destruction with nothing left to recover from.
 *
 * A revert that is recoverable is a different failure from one that is not. This
 * module is the whole of that difference: it does not decide who wrote, it does
 * not decide whether to revert, and it does not soften the halt. It keeps a copy
 * and hands back its name, so `tracker.ts` can put that name in the sentence the
 * model reads and in the `guard_block` event.
 *
 * ## The copies live where the measurement cannot see them
 *
 * `fusion-workbench/.guard-state/reverted/`. `.guard-state` is on
 * `protected-snapshot.ts`'s `WALK_SKIP`, so a preserved copy can never itself
 * enter the watched set — otherwise writing one would be a change to a protected
 * path on every project that declares `fusion-workbench/**`, and the guard would
 * report its own bookkeeping as a violation.
 *
 * That location is also the exposure, and it is stated rather than papered over:
 * an agent can delete `.guard-state/`, so these copies protect against accident,
 * not against an agent that means to lose them. The general form of that is the
 * open decision on the integrity of the escalation store
 * (`circles/260807-0923-guard-misst-statt-orakelt/decisions/260807-0945_o_integritaet-des-eskalationsspeichers.md`),
 * which this module does not attempt to answer. Accident is the case
 * `260809-1107` actually describes.
 *
 * ## The root arrives as a parameter
 *
 * Deliberately, and not because it was convenient: consolidation target C4 of
 * `shared/analyses/260809-1101-guard-support-layer.md` asks for one resolved root
 * threaded through the state modules instead of each one walking up for itself.
 * A new writer that called `findWorkbenchRoot()` internally would be one more
 * call site for that round to convert, and — worse — could answer a different
 * directory from the one the measurement is anchored at. Do not "simplify" it
 * back.
 *
 * ## Retention is a COUNT, not an age
 *
 * `events.jsonl` is already an unbounded writer with an open issue against it, and
 * a second one is not something a defect fix gets to add. The bound is the most
 * recent `RETAINED_COPIES` files, pruned on every write.
 *
 * A count rather than an age because an age bound expires the copy exactly when
 * it is still wanted: a long session that meets a wrong revert in its first hour
 * and notices in its fourth would find the evidence deleted by a mechanism whose
 * only purpose was to stop a directory growing. A count cannot expire something
 * the user still needs unless the guard has fired that many times since, and by
 * then the directory really does need pruning. Recorded as the open question the
 * plan raised (`260809-1229`, Open Questions, retention); the choice taken here is
 * the count.
 */

import {
  lstatSync,
  mkdirSync,
  readdirSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { resolve } from "node:path";
import { ABSENT, LINK_PREFIX } from "./protected-snapshot.js";

/**
 * How many preserved copies survive a write. The oldest beyond it are removed.
 *
 * Exported so a test can assert the bound rather than restate the number, which
 * is how a documented retention and an implemented one drift apart.
 */
export const RETAINED_COPIES = 20;

/** Where the copies live, project-relative — the spelling used in messages. */
export const REVERTED_DIR = "fusion-workbench/.guard-state/reverted";

/**
 * Keep what `rel` was observed to hold, and answer with the project-relative
 * name of the copy — or null when there was nothing to keep.
 *
 * `observed` is a FINGERPRINT, in the same three-value domain
 * `protected-snapshot.ts` defines, and the case split here is that domain's and
 * not a second one invented alongside it:
 *
 *   - `ABSENT` — the path held nothing when it was measured. Null, and the
 *     caller says so. This is the deleted-then-restored case: the revert brings
 *     the content back, so nothing was destroyed and a copy of nothing would be
 *     a file that misleads whoever finds it.
 *   - a `LINK_PREFIX` value — the path was a symbolic link. The copy is that
 *     link, recreated, because "what was there" was a link and flattening it
 *     into a text file would record something that never existed.
 *   - base64 — the bytes, written as bytes. A protected path can be a binary,
 *     and a utf-8 round trip would corrupt the copy exactly where it matters.
 *
 * Throws on any I/O failure rather than returning a quiet null. A caller that
 * cannot tell "there was nothing to keep" from "keeping it failed" would report
 * a recoverable revert that is not one, and that sentence is the whole value the
 * copy adds.
 */
export function preserveObserved(
  root: string,
  rel: string,
  observed: string,
): string | null {
  if (observed === ABSENT) return null;

  const dir = resolve(root, REVERTED_DIR);
  mkdirSync(dir, { recursive: true });

  const name = freeName(dir, rel);
  const abs = resolve(dir, name);

  if (observed.startsWith(LINK_PREFIX)) {
    symlinkSync(observed.slice(LINK_PREFIX.length), abs);
  } else {
    writeFileSync(abs, Buffer.from(observed, "base64"));
  }

  prune(dir);
  return `${REVERTED_DIR}/${name}`;
}

/**
 * `<timestamp>-<flattened path>`, with a numeric suffix when that name is taken.
 *
 * The timestamp leads so the plain lexicographic sort in `prune` is also the
 * chronological one, and its colons are replaced: `:` is not a legal filename
 * character on Windows, and `2026-08-09T15-27-00.123Z` sorts identically to the
 * ISO spelling it came from.
 *
 * The path is flattened by replacing every character outside `[A-Za-z0-9._-]`,
 * which takes the separators with it. That is what makes the result a plain name
 * inside `dir` rather than a path: no `/` survives, so no `..` can be assembled
 * out of what a protected pattern happened to name.
 *
 * Flattening can collide — `a/b` and `a-b` both become `a_b` — so the suffix
 * loop is not decoration. Two paths that flatten alike, measured in the same
 * millisecond of the same call, would otherwise have the second copy overwrite
 * the first, which is the one thing this module exists to prevent.
 */
function freeName(dir: string, rel: string): string {
  const stamp = new Date().toISOString().replace(/:/g, "-");
  const base = `${stamp}-${rel.replace(/[^A-Za-z0-9._-]+/g, "_")}`;
  let name = base;
  for (let n = 2; taken(resolve(dir, name)); n++) name = `${base}-${n}`;
  return name;
}

/**
 * Is there already an entry at this name?
 *
 * `lstat`, not `existsSync`: a preserved copy may itself be a symbolic link, and
 * a dangling one answers false to `existsSync` while `symlinkSync` still refuses
 * the occupied name with `EEXIST`.
 */
function taken(abs: string): boolean {
  try {
    lstatSync(abs);
    return true;
  } catch {
    return false;
  }
}

/**
 * Delete everything but the most recent `RETAINED_COPIES` entries.
 *
 * Sorted by name, which is chronological by construction (see `freeName`). Within
 * one millisecond the order is the flattened path's, which is arbitrary but
 * bounded — the count still holds, and no ordering claim beyond it is made.
 *
 * `rmSync` with `force`, so an entry another process removed in between is not a
 * failure, and without following a link: unlinking the copy is the intent even
 * when the copy is a link pointing somewhere else entirely.
 */
function prune(dir: string): void {
  const names = readdirSync(dir).sort();
  for (const name of names.slice(0, Math.max(0, names.length - RETAINED_COPIES))) {
    rmSync(resolve(dir, name), { force: true });
  }
}
