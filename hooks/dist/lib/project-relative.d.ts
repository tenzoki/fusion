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
export declare function projectRelative(filePath: string, cwd: string): string;
