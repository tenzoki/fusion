/**
 * The project-relative spelling of a written path — the coordinate space every
 * protected pattern is matched in.
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
 *   - an absolute path INSIDE the working directory → relative to it, so the
 *     relative globs in `guard.protectedPaths` can match it. This is what Claude
 *     Code sends in `tool_input.file_path`.
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
 * self-protection floor, which names a file the loader had just read from
 * exactly there. Resolving first is what lets a pattern that names an absolute
 * location be reached from a working directory that is not the project root.
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
 *   - An operand that resolves OUT of the working directory used to be a `..`
 *     string that no relative pattern could match, and is now an absolute path
 *     that no relative pattern can match either. It can match only an ABSOLUTE
 *     pattern, and the effective list holds exactly one — the floor
 *     (`config.ts`, `THE FLOOR`).
 *
 * So the set of paths that match grows by the project configuration file
 * reached from a subdirectory, and by nothing else. Measured as a cross-product
 * rather than left as this paragraph; see the session file for this step.
 *
 * There is one further consequence, and it is a fix rather than a cost:
 * `rm ../<project>/rules/x.md` names a protected rule file and used to allow,
 * because its text began with `..`. It now resolves back inside and denies.
 *
 * PURELY LEXICAL — `resolve` does not touch the filesystem and does not follow
 * symlinks. A path that reaches a different file through a link still reads as
 * this one, exactly as `collapseSegments` in `paths.ts` warns.
 */
/**
 * `filePath` as it should be matched against `guard.protectedPaths`, given the
 * working directory the guard is running in.
 *
 * Returns the empty string when the path IS the working directory, which is what
 * `relative` answers and what both call sites normalise to `"."`.
 */
export declare function projectRelative(filePath: string, cwd: string): string;
