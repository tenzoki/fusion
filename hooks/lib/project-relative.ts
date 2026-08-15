/**
 * The project-relative spelling of a written path — the coordinate space its
 * reader matches in.
 *
 * ## Who asks, and against which directory
 *
 * One caller today, and the directory it names is the point:
 *
 *   - `guard.ts` passes `process.cwd()`. Its answer is matched against the globs
 *     in `guard.categoryPaths`, which a project writes relative to where it
 *     starts its sessions, and CHECK 3's whole verdict is computed in that
 *     space.
 *
 * Two callers have gone and both are named here, because the argument below is
 * about the SPACE a caller matches in and a single surviving caller makes that
 * easy to forget. The protected-path deny passed cwd too, and its list is the
 * reason this module says "every pattern" anywhere it still does; it was removed
 * on 2026-08-12, and the two defects below were both measured on it. The churn
 * heatmap's `churnKey` passed the workbench ROOT rather than cwd, because a
 * counter has to mean the same file whatever directory the session started in
 * (`KEY_ANCHOR`, issue `260809-2023`); it was removed on 2026-08-15. Neither
 * defect below is repaired by either going, and the next caller names its own
 * directory for its own reason.
 *
 * ## Why this is its own module
 *
 * It used to be `normalizeToRelative` inside `guard.ts`, which imports the hook
 * entry point and runs `main()` the moment it is imported, so the one function
 * that decides which coordinate space a path is read in could only ever be
 * exercised through a subprocess. Every property below is a property of eight
 * lines of arithmetic; asking a spawned guard about them is both slow and
 * indirect, and the indirection is how the defect this module was extracted for
 * survived (`260804-1604`).
 *
 * The working directory arrives as an ARGUMENT, the same way `ProcessEnv`,
 * `FsLocator` and `ConfigSources` do elsewhere in this guard: a function that
 * reads `process.cwd()` for itself cannot be asked about two working directories
 * in one process, and "the guard runs one directory below the project root" is
 * precisely the case that has to be asked about.
 *
 * ## What it does, and the one thing that changed
 *
 * Three inputs, three answers:
 *
 *   - an absolute path INSIDE the named directory → relative to it, so a
 *     relative glob can match it. An absolute path is what Claude Code sends in
 *     `tool_input.file_path`, so this is the ordinary case for both callers.
 *   - a relative path → RESOLVED against the working directory first, then read
 *     the same way. An operand that stays inside comes back unchanged, so the
 *     ordinary case is untouched; an operand that walks OUT comes back as the
 *     absolute path it names.
 *   - anything landing outside the working directory → the absolute path.
 *
 * The middle case is the change, and it is the half of `260804-1604` that lives
 * outside the loader. A relative operand used to be returned verbatim, so
 * `../fusion-guard.json` was matched as the literal text `../fusion-guard.json`
 * against a list of patterns none of which can begin with `..`. It therefore
 * matched nothing, whatever the loader had put on the list — including the
 * self-protection floor, which named a file the loader had just read from
 * exactly there. Resolving first is what lets a pattern that names an absolute
 * location be reached from a working directory that is not the project root.
 *
 * The floor, and the list it stood on, went with the protected-path half. The
 * arithmetic did not, and the reason it is kept is that resolving a relative
 * operand is what makes a pattern naming an absolute location reachable from a
 * subdirectory at all — a property of the coordinate space, not of the list that
 * was matched in it.
 *
 * ## The direction this moves the guard, stated because it moves it
 *
 * Resolving can only ADD denials, and the argument is worth writing down rather
 * than trusting:
 *
 *   - An operand that resolves back inside the working directory returns the
 *     same string it always did — `relative(cwd, resolve(cwd, x))` is the
 *     lexical collapse of `x`, and both call sites already applied that collapse
 *     (`collapseSegments` on the write path, `path.normalize` in the mutation
 *     classifier). Nothing about the ordinary case moves.
 *   - An operand that resolves OUT of the named directory used to be a `..`
 *     string that no relative pattern could match, and is now an absolute path
 *     that no relative pattern can match either. It can match only an ABSOLUTE
 *     pattern. The effective protected list held exactly one, the self-protection
 *     floor, and both are gone; `guard.categoryPaths` is written by a project and
 *     holds no absolute pattern today, though nothing stops one.
 *
 * So the set of paths that match grew by the project configuration file reached
 * from a subdirectory, and by nothing else. Measured as a cross-product rather
 * than left as this paragraph; see the session file for that step. With the
 * floor gone the growth is empty in practice, and the argument is kept because
 * it is the reason the middle case may resolve at all: resolving can only add
 * matches, so it can only add denials, and the direction has to be argued rather
 * than assumed by whoever adds the next caller.
 *
 *
 * PURELY LEXICAL — `resolve` does not touch the filesystem and does not follow
 * symlinks. A path that reaches a different file through a link still reads as
 * this one, exactly as `collapseSegments` in `paths.ts` warns.
 */

import { relative, resolve } from "node:path";

/**
 * `filePath` in `cwd`'s coordinate space: relative to it when it lands inside,
 * absolute when it lands outside.
 *
 * `cwd` is whatever directory the CALLER matches in — the process's working
 * directory for `guard.categoryPaths` — and is an argument rather than a
 * `process.cwd()` read for exactly that reason.
 *
 * Returns the empty string when the path IS that directory, which is what
 * `relative` answers; `guard.ts` normalises it to `"."`.
 */
export function projectRelative(filePath: string, cwd: string): string {
  // Relative and absolute alike: `resolve` leaves an absolute path alone and
  // anchors a relative one to `cwd`, so the two branches below are about where
  // the path LANDS rather than about how it was spelled.
  const resolved = resolve(cwd, filePath);

  const answer =
    resolved.startsWith(cwd + "/") || resolved === cwd
      ? relative(cwd, resolved)
      : // Outside the working directory. Returned absolute rather than as the
        // caller spelled it, so that an absolute pattern — the floor is the only
        // one — has a single spelling to match against.
        resolved;

  return withTrailingSeparatorOf(filePath, answer);
}

/**
 * Put back the trailing separator `resolve` threw away.
 *
 * NOT cosmetic, and measured: `resolve("dir/")` is `"<cwd>/dir"`, and a
 * `dir/**` glob compiles to `^dir/.*$`, whose `.*` matches the empty string — so
 * `dir/` matches and the bare `dir` does not. Without this line a write naming a
 * directory went from a deny to an allow, which is the one direction a guard may
 * not move. Measured on the protected list, which is gone; `guard.categoryPaths`
 * is written in the same glob dialect by the same compiler, so the asymmetry is
 * unchanged and so is the direction of the mistake. `collapseSegments` in
 * `paths.ts` keeps the separator for exactly this reason and states the argument
 * in full.
 *
 * The one exception is a path that IS the working directory (`./`, `/proj/`),
 * where the relative answer is empty and a bare separator would read as the
 * filesystem root. Both call sites normalise the empty string to `"."`, which is
 * what the old function's absolute branch already produced for `/proj/`.
 */
function withTrailingSeparatorOf(spelled: string, answer: string): string {
  if (answer.length === 0) return answer;
  if (!spelled.endsWith("/") || answer.endsWith("/")) return answer;
  return answer + "/";
}
