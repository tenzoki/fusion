/**
 * Bash file-mutation guard — deterministic classifier for the PreToolUse hook.
 *
 * The guard's protected-path check is reachable only from the four write tools
 * (`Write`, `Edit`, `MultiEdit`, `NotebookEdit`). A shell is a write tool too:
 * `mv rules/x.md /tmp/` moves a protected file with no tool the guard inspects.
 * This module is the missing half — it classifies a `Bash` command string
 * against the same `protectedPaths` list the write path uses.
 *
 * It is the sibling of `git-branch-guard.ts`, not a second parser: both consume
 * `shell-parse.ts`, this one in `"capture"` mode so a single-quoted operand
 * (`mv 'rules/x.md' /tmp/`) is read as the ordinary path it is.
 *
 * ## What counts as a mutation
 *
 * Recognition is TABLE-DRIVEN (`MUTATION_VERBS` below). One row per command,
 * naming which flags consume a value and which positional operands the command
 * WRITES. The written/read distinction is the point: `cp rules/x.md /tmp/y`
 * only READS the protected path and stays allowed, while `cp /tmp/y
 * rules/x.md` writes it and denies. Adding a verb later is a row and two tests,
 * not a new code path.
 *
 * WHICH WORD NAMES THE PROGRAM is not decided here. `command-word.ts` answers
 * that for both Bash classifiers: it skips a leading `VAR=value` assignment, a
 * shell grammar word (`if`, `while`, `{`, `!`, …) and any WRAPPER program that
 * runs another program, so `sudo rm rules/x.md`, `sudo env rm rules/x.md` and
 * `if rm rules/x.md; then …` all classify as the `rm` they are. Each wrapper's
 * own flags — and, for `timeout`, its duration operand — are consumed by the
 * wrapper's row, so the skip never assumes the second word is the verb.
 *
 * Output redirection (`>`, `>>`, `>|`, `N>`, glued or separated) is scanned
 * separately and position-independently, because a redirection binds to the
 * whole simple command wherever it appears — `>` makes ANY program a mutation.
 *
 * ## Ancestors count
 *
 * An operand that is not itself protected still denies when it is an ANCESTOR
 * DIRECTORY of a protected path: `rm -rf hooks` destroys `hooks/config.json`,
 * `mv hooks /tmp` relocates it out from under the guard. Each protected
 * pattern's glob-free leading segments are its literal prefix, and an operand
 * that is a proper directory prefix of one denies (`isAncestorOfProtected`).
 * The consequence is deliberate and was accepted at the plan's Q3 gate:
 * `rm -rf hooks`, `rm -rf fusion-workbench` and `mv hooks /tmp` deny, while
 * `rm -rf node_modules` and `rm -rf dist` do not. The check is uniform across
 * written operands rather than special-cased to destructive verbs, so a
 * destination directory is covered too — `cp /tmp/config.json hooks/` cannot
 * overwrite a protected file through a directory the classifier never inspects.
 * The project root itself is NOT treated as an ancestor: `cp x .` writes into
 * the root without destroying it, and denying it would catch ordinary work.
 *
 * ## Where a relative operand resolves from
 *
 * `cd fusion-workbench && rm -rf .guard-state` writes a protected path while
 * naming none, so the classifier carries a VIRTUAL WORKING DIRECTORY across a
 * compound command's segments (`walkVirtualCwd` below) and resolves every
 * relative operand against it. `cd`, `chdir`, `pushd` and `popd` move it; a
 * `cd` whose target is only known at run time makes it UNKNOWN, and a relative
 * operand under an unknown directory is unresolved and therefore denied, for
 * the same reason `mv $SRC rules/` is. Walking OUT of the project (`cd /tmp`,
 * `cd ../..`, `cd ~`) is tracked as faithfully as walking in, so a mutation out
 * there matches no relative pattern and stays allowed.
 *
 * The tracking is scoped: a `cd` inside a `(…)` subshell or a `$(…)` body is
 * discarded when it closes, exactly as bash discards it.
 *
 * ## Fail-closed, and its bound
 *
 * A shell can build a path at run time. When an operand of a RECOGNISED verb
 * cannot be resolved to a literal (it still carries `$`, a backtick, or a
 * leading `~`), the classifier DENIES rather than guessing — the same
 * discipline `classifyGitCommand` applies to a bare `git checkout`. An
 * UNRECOGNISED program is allowed however unparseable its arguments are, so
 * ordinary shell work is untouched.
 *
 * ## The accepted residual (documented, not hidden)
 *
 * An unrecognised program that writes a protected path still writes it
 * (`curl -o rules/x.md …`, a project's own build script). A path constructed at
 * run time is denied when it is an operand of a recognised verb and invisible
 * otherwise. This check raises the cost of the bypass from zero to deliberate;
 * it does not eliminate it, and no claim that `protectedPaths` is enforced
 * should be made without that qualification.
 *
 * The wrapper list is the same kind of bound, and it is stated where the list
 * lives (`command-word.ts`): a program that runs another program and is not a
 * row still hides the verb underneath it (`parallel rm rules/x.md`), and a
 * program that takes its command as a STRING bash re-parses (`eval`,
 * `bash -c`) is outside the mechanism entirely.
 *
 * Shell grammar the word-level resolver cannot name is the third bound. A
 * `case` arm and a function definition both put an ordinary-looking word in
 * command position (`build) rm rules/x.md;;`, `f() { rm rules/x.md; }`) that no
 * table can distinguish from a program, so the verb behind it is not reached.
 *
 * A whole-tree operand that is not a path is invisible for the same reason a
 * glob is matched literally: `rm -rf *` names no directory the ancestor check
 * can compare, so it is not caught. (`rm -rf .` IS caught once a `cd` has moved
 * the virtual working directory somewhere protected — see the ancestor note
 * above — and is not at the project root, where `rm` refuses it anyway.)
 *
 * Two sibling `$(…)` substitutions inside ONE outer segment share a virtual
 * working directory, because `shell-parse` reports a depth but not a subshell
 * identity: `$(cd /tmp) $(rm rules/x.md)` therefore resolves the second body
 * from `/tmp` and allows. It is contrived enough to be a residual rather than a
 * defect; anything an agent actually writes puts the two in separate segments,
 * where they are correctly independent.
 *
 * This module is PURE and EXPORTED so it is unit-testable without the hook
 * firing. It never touches the filesystem, the environment, or the process:
 * the protected list, the project-relative normaliser and the exemption
 * predicate all arrive through `MutationOptions`.
 */
export interface MutationVerdict {
    /** false = allow, true = deny the whole Bash call. */
    deny: boolean;
    /** Plain, actionable reason naming the segment and the path (deny only). */
    reason?: string;
    /** The offending segment (for events/diagnostics). Deny only. */
    offendingSegment?: string;
    /**
     * The path that triggered the deny — the resolved, project-relative path for
     * a protected match, or the raw unresolvable token for a fail-closed deny.
     * Deny only.
     */
    targetPath?: string;
}
export interface MutationOptions {
    /** The effective `guard.protectedPaths` globs. Empty list = nothing to guard. */
    protectedPaths: string[];
    /** Project-root-relative normalisation, injected so the module stays pure. */
    normalize: (raw: string) => string;
    /** C5a seam — a path this predicate accepts is exempt. Defaults to none. */
    exempt?: (path: string) => boolean;
}
/** Which positional operands a verb writes. */
export type WrittenPositionals = 
/** Every positional (sources are removed or rewritten as well as the target). */
"all"
/** Only the last positional — the destination of a source→dest copy. */
 | "last"
/** None; the verb names its target another way (see `keyOperands`). */
 | "none";
export interface VerbSpec {
    written: WrittenPositionals;
    /** Flags that consume the FOLLOWING token as their value (never a positional). */
    valueFlags?: readonly string[];
    /**
     * How a `-t DIR` / `--target-directory[=DIR]` destination combines with the
     * positionals. `"adds"` — the directory is written IN ADDITION to them (`mv`
     * still removes its sources). `"replaces"` — with `-t` every positional is a
     * source, so only the directory is written.
     */
    targetDir?: "adds" | "replaces";
    /**
     * Present when the verb only mutates under an in-place flag (`sed -i`,
     * `perl -i`). Returns true for a flag token that turns it into a mutation.
     */
    inPlaceOnly?: (flag: string) => boolean;
    /** `key=value` operands that name a written file (`dd of=…`). */
    keyOperands?: readonly string[];
}
/**
 * THE VERB TABLE. Exported because it is the review surface: a false positive
 * on ordinary shell work would come from a row here, and it is felt by every
 * agent on every shell call.
 *
 * Three families:
 *   relocate or destroy — mv, rm, cp, ln, install
 *   in-place rewrite    — sed -i, perl -i, truncate, tee, dd
 *   (redirection is scanned separately; see `scanSegment`)
 *
 * `sed` and `perl` take ALL positionals rather than modelling where the script
 * ends, because the two platforms disagree about `-i` and a sed script never
 * matches a protected-path glob. `sed -i '' 's/MUST/may/' rules/x.md` therefore
 * denies on `rules/x.md` and `sed -i '' 's/a/b/' notes.txt` allows, on both
 * platforms, with no platform branch in the code.
 *
 * Two things widen a row's reach beyond the literal command it names, and both
 * are reviewed with the table rather than apart from it:
 *
 *   - A row is reached THROUGH a wrapper (`WRAPPER_PROGRAMS` in
 *     `command-word.ts`) or a grammar word. `sudo rm …`, `if rm …; then`,
 *     `xargs rm …` and `sudo env rm …` are the `rm` row.
 *   - A written operand matches by ANCESTRY as well as by pattern
 *     (`ancestorOfProtected`). `rm -rf hooks` is the `rm` row hitting
 *     `hooks/config.json` without naming it.
 *
 * Neither is per-verb, so a new row inherits both. Adding a verb whose operands
 * are usually directories is therefore a wider change than adding one that
 * names files, and `mkdir`, `chmod`, `chown`, `touch`, `rsync`, `patch`, `tar`
 * and `gzip` are deliberately NOT rows.
 */
export declare const MUTATION_VERBS: Readonly<Record<string, VerbSpec>>;
/**
 * Mutating `git` subcommands. Every other subcommand is a non-mutation here —
 * including `git checkout … -- <paths>`, fusion's own revert strategy, which
 * MUST stay allowed (`git-branch-guard.ts` owns the branch question).
 */
export declare const MUTATION_GIT_SUBCOMMANDS: Readonly<Record<string, VerbSpec>>;
/**
 * Classify a full (possibly compound) Bash command string against the guard's
 * protected paths. Segments the command; if ANY segment writes a protected
 * path, or is a recognised mutation with an unresolvable target, the whole call
 * is denied.
 *
 * ## The virtual-cwd walk
 *
 * Segments arrive in SOURCE ORDER with a nesting depth, which is what makes a
 * left-to-right walk carrying a working directory possible at all. Two kinds of
 * scope discard a `cd` when they close, matching bash:
 *
 *   - a `$(…)` or backtick body, which `shell-parse` reports as depth ≥ 1 and
 *     which always follows the outer segment it was lifted out of, so it
 *     INHERITS the directory in force there;
 *   - a `(…)` subshell, which `shell-parse` does not model — it is depth 0 with
 *     the parentheses left in the text — so the parens are counted here.
 *
 * Both push the state aside on entry and restore it on exit, so
 * `(cd rules && ls) && rm x.md` deletes `x.md` from the project root and
 * `cd rules && rm x.md` deletes it from `rules/`.
 */
export declare function classifyBashMutation(command: string, opts: MutationOptions): MutationVerdict;
