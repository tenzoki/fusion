/**
 * The real filesystem behind `FsLocator` — the adapter the rules-write
 * exemption's second gate asks about symlinks, path folding and hard links.
 *
 * It is a separate module for the same reason `rules-write-exemption.ts` is
 * pure: this is the ONLY part of the exemption that can lie, because it is the
 * only part that talks to something outside the process. Keeping it here, at
 * about forty lines with no policy in it, means the boundary's decision logic
 * stays unit-testable in-process and this file can be tested against a real
 * temporary directory with real symlinks and real hard links.
 *
 * ## Resolving a path that does not exist yet
 *
 * `realpath` fails on a path whose last component is missing, and a rule file
 * usually has to be CREATED — so a resolver that only answered for existing
 * paths would refuse every new rule. `locate` therefore resolves the deepest
 * ancestor that does exist and re-appends the remainder, which is safe to
 * append literally because a component that does not exist cannot redirect
 * anything.
 *
 * ## The DANGLING symlink, which is why `realpath` alone is not enough
 *
 * "Does not exist" and "realpath failed" are not the same condition, and
 * conflating them was a hole. `realpath` fails on a symlink whose target is
 * missing, so a resolver that walked up on every failure treated the LINK's own
 * name as an ordinary not-yet-created component and reported the lexical
 * location — the one thing the whole gate exists to avoid. Measured:
 * `rules/gs -> ../fusion-workbench/.guard-state`, planted before the guard had
 * ever written its state directory, resolved to `rules/gs/escalation.json` and
 * the grant was given.
 *
 * So existence is tested with `lstat`, which sees a dangling link, and such a
 * link is expanded by hand (`readlink`, JOINED to the link's own directory —
 * not `resolve`d against it, see below) and re-resolved. Link expansion is
 * bounded: a symlink cycle exhausts the budget and returns null, which refuses
 * the grant.
 *
 * ## `..` BELONGS TO THE KERNEL, and this file used to take it
 *
 * The single rule everything below follows: no `..` is ever collapsed by string
 * arithmetic here. `node:path.resolve` is `normalize` with a root prepended, so
 * it DELETES the component before a `..` lexically, while the kernel resolves
 * that component — possibly a symlink — first and takes the parent of what it
 * points at. Where the component is a link, the two answers name different
 * files, and this module exists precisely to tell the exemption which file a
 * write lands on.
 *
 * The collapse was in three places, all now joins (`joinUncollapsed`) with the
 * resulting path handed to `realpath`:
 *
 *   1. `absolute()` — the project-root join, so a RELATIVE path lost its `..`
 *      before `resolveLocation` saw anything. Measured on a temp tree with
 *      planted links: `locate(<absolute>)` agreed with `realpathSync.native` on
 *      every row with a kernel answer, `locate(<relative>)` disagreed on four,
 *      all of them `..` rows.
 *   2. `tryRealpath`'s JS fallback — Node's own `realpathSync` runs
 *      `path.resolve` on its argument before resolving, so it answered
 *      confidently where the native call threw. Declined when a `..` remains.
 *   3. `resolveLocation`'s link expansion — a relative link TARGET collapsed
 *      against an unresolved prefix. The only one of the three reachable
 *      without a `..` in the caller's spelling, because the `..` comes out of
 *      `readlink`; it reported a location inside `rules/` for a link pointing
 *      out of the project.
 *
 * The one surviving `resolve` is `resolve(parentReal, basename(...))` at the
 * bottom, and it is sound for the reason written there: `parentReal` is already
 * a realpath and `basename` is a single component, so there is no `..` to lose.
 *
 * ## Why `realpathSync.native`
 *
 * Node's JavaScript `realpathSync` resolves symlinks but preserves the CASE it
 * was given. On a case-insensitive filesystem (APFS by default, NTFS) that
 * makes `rules/UP/x` and `rules/up/x` two different answers for one location.
 * `realpathSync.native` delegates to the platform's own `realpath(3)`, which
 * folds case as the filesystem does. It is the stronger answer on macOS and
 * identical on Linux, so it is tried first; the JS implementation is the
 * fallback if the native call is unavailable or throws for its own reasons —
 * except on a path still carrying a `..`, where it is not a stand-in at all
 * (point 2 above).
 *
 * ## Every failure answers "no"
 *
 * A throw anywhere here returns null or false, and both mean "cannot prove this
 * is a rule path" — which leaves the path protected. See the `## Refusing the
 * grant is always the safe direction` section in `rules-write-exemption.ts`.
 */

import { lstatSync, readlinkSync, realpathSync } from "node:fs";
import { basename, dirname, isAbsolute, resolve } from "node:path";
import type { FsLocator } from "./rules-write-exemption.js";

/** The same ceiling `realpath(3)` uses for a symlink chain (`ELOOP`). */
const MAX_LINK_HOPS = 40;

/** Does this path still carry a `..` segment for the kernel to interpret? */
function carriesDotDot(path: string): boolean {
  return path.split("/").includes("..");
}

/**
 * Join an absolute directory to a relative path WITHOUT collapsing anything.
 *
 * The whole point of this module is that `..` is the kernel's to interpret, so
 * every join here is textual and the resulting path is handed to `realpath`.
 * `node:path.resolve` would collapse `..` lexically against a prefix that may
 * itself contain symlinks, which is the defect this file had in three places.
 *
 * The trailing-separator test is for `dir === "/"`, where a bare concatenation
 * would emit a leading `//` — a form POSIX leaves implementation-defined.
 */
function joinUncollapsed(dir: string, path: string): string {
  return (dir.endsWith("/") ? dir : dir + "/") + path;
}

/** `realpath` with the native resolver preferred, or null if neither answers. */
function tryRealpath(absolutePath: string): string | null {
  try {
    return realpathSync.native(absolutePath);
  } catch {
    // Falls through: ENOENT is the ordinary case, and any other error is
    // answered by the JS implementation or by null.
  }
  // The JS fallback is NOT a faithful stand-in for the native call on a path
  // carrying a `..`: Node's `realpathSync` begins by running `path.resolve` on
  // its argument, which deletes the preceding component LEXICALLY, exactly as
  // `absolute` used to. Measured — `rules/loop -> loop`, `rules/dangle ->
  // nowhere`, both cycles or dead ends the kernel refuses outright:
  //
  //     realpathSync.native("<root>/rules/loop/../x.md")   throws ELOOP
  //     realpathSync       ("<root>/rules/loop/../x.md")   "<root>/rules/x.md"
  //     realpathSync.native("<root>/rules/dangle/../x.md") throws ENOENT
  //     realpathSync       ("<root>/rules/dangle/../x.md") "<root>/rules/x.md"
  //
  // Both answers are confident, both are inside the rule directory, and both
  // describe a path `open(2)` will refuse. So where the two resolvers can
  // disagree, the fallback is declined rather than trusted: the caller walks up
  // instead, which either reaches a real answer through the link or runs out of
  // hops and returns null. Declining costs nothing on any path the exemption
  // can produce — gate 1 admits no `..` this far down — and it keeps the one
  // resolver in this file that reads `..` lexically from being the one that
  // answers.
  if (carriesDotDot(absolutePath)) return null;
  try {
    return realpathSync(absolutePath);
  } catch {
    return null;
  }
}

/** Does this path exist as SOMETHING — including a link with no target? */
function isSymlink(absolutePath: string): boolean {
  try {
    return lstatSync(absolutePath).isSymbolicLink();
  } catch {
    return false;
  }
}

/**
 * The real location of `absolutePath`, resolving symlinks including dangling
 * ones, and tolerating a missing tail. Null when the answer cannot be reached
 * — an exhausted link budget, an unreadable link, or a path with no resolvable
 * ancestor at all.
 */
function resolveLocation(absolutePath: string, hops: number): string | null {
  if (hops > MAX_LINK_HOPS) return null;

  // Fully resolvable: the kernel has already done the work, case folding
  // included.
  const real = tryRealpath(absolutePath);
  if (real !== null) return real;

  // Not resolvable, but present as a link — so its target is missing, not its
  // name. Expand by hand and try again from where it points.
  if (isSymlink(absolutePath)) {
    let target: string;
    try {
      target = readlinkSync(absolutePath);
    } catch {
      return null;
    }
    // JOINED, NOT RESOLVED. A relative link target is interpreted against the
    // directory holding the link, and that directory is the path we were GIVEN,
    // which may run through symlinks of its own — `dirname` does not resolve
    // them. `resolve` here collapsed the target's own `..` against that
    // unresolved prefix, and the answer was wrong in the direction that grants:
    //
    //   rules/shared -> <elsewhere>/shared-rules        (a shared rule repo)
    //   <elsewhere>/shared-rules/gone -> ../sibling/x   (dangling, so this branch)
    //
    //   was:  locate("rules/shared/gone") = <root>/rules/sibling/x   INSIDE rules/
    //   is:   locate("rules/shared/gone") = <elsewhere>/sibling/x    outside it
    //
    // The old answer told gate 2 the write landed on a rule file when it landed
    // outside the project, with no `..` anywhere in the caller's spelling for
    // gate 0 or gate 1 to catch — the `..` came from the link's own target.
    // Joining textually and recursing hands the whole thing to `realpath`,
    // which resolves the prefix before it takes the parent.
    const next = isAbsolute(target)
      ? target
      : joinUncollapsed(dirname(absolutePath), target);
    return resolveLocation(next, hops + 1);
  }

  // Genuinely absent: resolve the parent and re-append this name. A component
  // that does not exist cannot redirect anything, so appending it is safe.
  const parent = dirname(absolutePath);
  // `dirname` is a fixed point at the filesystem root, so this terminates.
  if (parent === absolutePath) return null;
  const parentReal = resolveLocation(parent, hops);
  if (parentReal === null) return null;
  return resolve(parentReal, basename(absolutePath));
}

/**
 * An `FsLocator` rooted at `root` — the project root, which every relative path
 * the guard handles is expressed against.
 *
 * The join is `joinUncollapsed` rather than `resolve(root, path)` — instance 1
 * in the module docstring's list, and the one that made a RELATIVE spelling and
 * its own absolute form two different answers.
 *
 * ## Why dropping `resolve` here is not the change to every path it looks like
 *
 * `resolve` was doing three jobs rather than one — it also collapsed `.` and
 * repeated separators — so removing it reads like a change to every input. It is
 * not, and the difference is measured rather than argued. Both methods below are
 * reached only from `resolvesInsideRuleDir`, which is handed `canonicalise(path)`
 * after gate 1 has already required it to match `rules/**` or `.claude/rules/**`,
 * plus the two literal `RULE_DIR_ROOTS`. `posix.normalize` can leave a `..` only
 * at the HEAD of a relative path, and a head-`..` path matches neither pattern —
 * so no `..`, no `.`, no doubled separator and no trailing separator reaches here
 * from the exemption at all. On that reachable set the join and `resolve(root, p)`
 * produce byte-identical strings (measured: 9 inputs x 4 roots, 0 differences).
 *
 * That is worth stating precisely because it bounds this fix rather than selling
 * it: for the exemption as it stands today instances 1 and 2 change nothing, and
 * only instance 3 — the link target, whose `..` no gate above can see — is
 * reachable. 1 and 2 are fixed anyway because `FsLocator` is a documented
 * interface whose next caller is not obliged to be this one, and because a file
 * that collapses `..` in two of three places is one an auditor has to re-derive
 * from scratch every time.
 */
export function realFsLocator(root: string): FsLocator {
  const absolute = (path: string): string =>
    isAbsolute(path) ? path : joinUncollapsed(root, path);

  return {
    locate(path: string): string | null {
      return resolveLocation(absolute(path), 0);
    },

    hasHardLinks(path: string): boolean {
      try {
        const stat = lstatSync(absolute(path));
        // `lstat` does not follow the link, so `isFile()` is false for a
        // symlink — gate 2's resolution owns those. A directory's link count
        // is structural (`.` plus each child's `..`) and says nothing about
        // aliasing, so only a regular file is asked.
        return stat.isFile() && stat.nlink > 1;
      } catch {
        // Absent, or unreadable. Absent is the ordinary case for a file about
        // to be created, and an absent file has no second name.
        return false;
      }
    },
  };
}
