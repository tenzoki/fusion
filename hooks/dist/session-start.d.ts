/**
 * SessionStart hook — the working-directory warning.
 *
 * ## What it answers
 *
 * "Did this session start at the project root, or below it?" Below it, fusion
 * still works, but not everywhere: several of its checks resolve against
 * `process.cwd()` rather than against the workbench root, so from a
 * subdirectory they inspect a directory that is not the project's. Two are
 * known and documented:
 *
 *   - the PreToolUse write-tool deny (`lib/project-relative.ts`), which matches
 *     `guard.protectedPaths` against the working directory. Measured from a
 *     subdirectory in
 *     `lib/__tests__/protected-snapshot-subdirectory.test.ts`: an `Edit` of a
 *     genuinely protected path is ALLOWED by the pre-check and only caught
 *     afterwards by the measurement.
 *   - `isFusionPluginCwd()` (`lib/self-detect.ts`) and its shell half
 *     `bin/fusion-plugin-cwd`, both of which test cwd with no upward walk, so
 *     `bin/fusion-rules`, `bin/fusion-paths` and `bin/fusion-source-root` read
 *     the installed plugin copy instead of the work tree when a session in
 *     fusion's own repository starts one directory down.
 *
 * Each of those could be taught to walk up on its own. That would be four
 * special cases with four chances to disagree. This warning fixes none of them
 * and is not meant to: it makes the one assumption they share **audible**, at
 * the single moment the session's working directory is chosen and still cheap
 * to change. The residual is tracked in
 * `circles/260801-1244-guard-rules-write/issues/260804-2100_*_from-a-subdirectory-cwd-the-protected-list-matches-nothing-while-fail-closed-still-denies.md`.
 *
 * ## The case split
 *
 * `findWorkbenchRoot()` walks up from cwd, so the root it returns is always cwd
 * itself or a strict ancestor of it. Three cases, disjoint and complete:
 *
 *   1. no root found      → not a fusion project. Nothing to warn about.
 *   2. root === cwd       → started at the root. Nothing to warn about.
 *   3. root is an ancestor → warn.
 *
 * No path comparison beyond string equality is needed, and that is a property
 * rather than an omission: the root is built by `resolve`/`dirname` from the
 * same `process.cwd()` string this file compares it against, so case 2 is
 * exactly string equality. Introducing a `realpath` here would compare a
 * resolved root against an unresolved cwd and reintroduce the very mismatch the
 * guard harness documents as the macOS symlink trap.
 *
 * ## Why a separate hook rather than the existing banner
 *
 * `hooks.json` already runs a static `printf` that emits the "Fusion loaded"
 * banner. Folding this check into it would mean reimplementing the upward walk
 * in shell inside a JSON string literal — a second definition of the one
 * question `findWorkbenchRoot()` already answers for every hook. Folding the
 * banner into THIS file would put the unconditional message behind a node
 * process, so a broken build would take the banner with it. They stay two
 * commands because they are two concerns: one is unconditional and static, the
 * other is conditional and computed.
 *
 * ## Why the message is English
 *
 * Every string fusion's hooks emit is English — this file's sibling banner, the
 * guard's deny reasons, the halt notice. Hook and CLI operator strings are one
 * of the surfaces `rules/fusion-workbench-conventions.md` `## Project language`
 * exempts from a project's declared languages; a hook fires before any agent has
 * read `CLAUDE.md`, and teaching a SessionStart hook to parse that file for one
 * string would be a new mechanism serving one caller. Localising one of fusion's
 * operator strings and not the other fifteen is the inconsistency, not the fix.
 *
 * ## Channel
 *
 * `systemMessage`, not plain stdout. Plain stdout from a SessionStart hook is
 * `additionalContext` — the model reads it and the user does not (`CLAUDE.md`,
 * Conventions). A warning only the model sees is not a warning.
 */
/**
 * The warning text for a session whose working directory is `cwd`, given the
 * workbench root `root` found above it (or `null` when there is none).
 *
 * Returns `null` in the two cases that are not a warning. Both directories are
 * named in full: the user has to be able to tell which is which without
 * re-deriving either.
 */
export declare function subdirectoryWarning(cwd: string, root: string | null): string | null;
