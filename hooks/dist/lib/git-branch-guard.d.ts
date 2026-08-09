/**
 * Git branch-switch guard — deterministic classifier for the PreToolUse hook.
 *
 * Prose rules alone do not stop LLM agents from switching git branches under
 * task pressure. The only effective lever is this classifier, which runs on
 * every agent `Bash` call and DENIES branch/worktree-moving git operations.
 *
 * git is reachable only via Bash, so every attempt an agent can make passes
 * through here — but this is a choke-point on the tool CALL, not a proof of
 * impossibility. The classifier reads the command TEXT, so a command that hides
 * the verb from its own text is not seen: `eval 'git switch main'`,
 * `bash -c '…'`, a `case` arm, and a branch switch inside a script the agent
 * invokes are all allowed today. `rules/git-branch-discipline.md` states the
 * same bound for the agents that read it.
 *
 * Design (LOCKED):
 *   DENY  (HEAD moves): git switch …, git checkout -b/-B/--detach/--orphan/-,
 *         git checkout <branch/ref> with NO `--` separator, git worktree add …
 *   ALLOW (HEAD stays): git checkout … -- <paths> (file restore), git restore …,
 *         all read-only git, git branch listing/create-without-switch,
 *         everything non-git.
 *
 * The load-bearing allow-case is fusion's own revert strategy
 * (`git checkout HEAD -- <files>`), which MUST stay allowed. A `--` separator
 * is the discriminator for that case: everything after it is a pathspec.
 * It is NOT unconditional, and reading it as unconditional is what let
 * `git checkout -b bar --` through — a branch-creating flag is resolved by git
 * before the separator is ever consulted. The separator settles the AMBIGUOUS
 * form only; see `classifyCheckout` for the ordering that follows from that.
 *
 * The bare, `--`-less form `git checkout <target>` is genuinely ambiguous —
 * git resolves it in favour of a branch/ref if one exists, otherwise treats
 * <target> as a path to restore. The classifier resolves that ambiguity with
 * a caller-supplied `CheckoutResolver` (filesystem + git-ref aware):
 *   - `git checkout foo.go` where foo.go EXISTS on disk AND is NOT a valid
 *     ref → file restore → ALLOW.
 *   - `git checkout feature/x` where feature/x IS a valid ref → branch switch
 *     → DENY (a branch that merely shares a name with a file is a ref → DENY,
 *     matching git's own ref-first resolution).
 *   - `git checkout nonexistent` → not a file → DENY.
 *
 * Fail-closed: when NO resolver is supplied (or a `--git-dir`/`--work-tree`
 * global makes on-disk resolution unreliable), the ambiguous form → DENY.
 * A real branch switch always fails-closed because a valid ref → DENY.
 *
 * This module is PURE and EXPORTED so it is unit-testable without the hook
 * firing. It takes the command string plus the two env-flag booleans and
 * returns a typed verdict.
 *
 * The shell-lexing primitives it runs on (`stripDataRegions`,
 * `extractCommandSegments`, `tokenize`) are generic and live in
 * `shell-parse.ts`, which a second classifier also consumes. The first two are
 * re-exported here under their original names because they are part of this
 * module's established surface.
 *
 * WHICH WORD IS THE COMMAND is likewise not decided here: `command-word.ts`
 * answers it for both classifiers. This module used to answer it alone, and
 * worse — it skipped a leading `VAR=value` assignment and nothing else, so a
 * compound-command head (`if git switch main; then …`), a body introducer
 * (`do git switch main`), a wrapper (`sudo git switch main`, `exec git switch
 * main`) and a backslash-escaped command word (`\git switch main`) each hid the
 * verb from a policy the bare form is denied by. The asymmetry with the
 * mutation classifier, which had all three skips, was accidental rather than
 * decided; sharing one resolver is what removes it
 * (`issues/260801-1857_c_compound-command-head-hides-the-verb-from-both-bash-classifiers.md`,
 * `issues/260801-1858_c_a-backslash-escaped-command-word-is-unrecognised-by-both-classifiers.md`).
 */
export { extractCommandSegments, stripDataRegions } from "./shell-parse.js";
export type GitGuardKind = "branch-switch" | "worktree-add";
export interface GitGuardVerdict {
    /** false = allow, true = deny the whole Bash call. */
    deny: boolean;
    /** Plain, actionable reason (only set when deny === true). */
    reason?: string;
    /**
     * The offending segment that triggered the deny (for events/diagnostics).
     * Only set when deny === true.
     */
    offendingSegment?: string;
    /** Which class of operation was denied. Only set when deny === true. */
    kind?: GitGuardKind;
    /**
     * True when a normally-denied command was ALLOWED because the user set the
     * matching env override. Used by the hook to record an override-used note.
     */
    overrideUsed?: boolean;
    /** Which override lifted the deny. Only set when overrideUsed === true. */
    overrideKind?: GitGuardKind;
    /** The segment that an override allowed through. Only set with overrideUsed. */
    overrideSegment?: string;
}
/**
 * Resolves whether a bare `git checkout <target>` argument is a file to
 * restore or a ref to switch to. Kept as an injected interface so this module
 * stays PURE and unit-testable — the real implementation (filesystem +
 * `git rev-parse`) lives at the hook boundary in guard.ts, tests pass a mock.
 *
 * `cwdHints` carries any `-C <dir>` global options seen before the subcommand,
 * in order, so the implementation can resolve paths and refs in the same
 * directory git itself would use.
 */
export interface CheckoutResolver {
    /** True if `target` names an existing path (file or dir), resolved under the effective cwd. */
    pathExists(target: string, cwdHints: string[]): boolean;
    /** True if `target` resolves to a valid git ref/object in the repo at the effective cwd. */
    isRef(target: string, cwdHints: string[]): boolean;
}
export interface GitGuardOverrides {
    /** FUSION_ALLOW_BRANCH_SWITCH — lifts the deny for git switch / git checkout <ref>/-b. */
    allowBranchSwitch: boolean;
    /** FUSION_ALLOW_WORKTREE — lifts the deny for git worktree add. */
    allowWorktree: boolean;
}
/**
 * Classify a full (possibly compound) Bash command string against the git
 * branch-switch policy. Segments the command; if ANY segment is a deny-case,
 * the whole call is denied (unless the matching env override lifts it).
 *
 * ## The two overrides are independent, and the scan has to stay that way
 *
 * An override waives ONE class. The scan therefore does not stop at the first
 * deny-case segment — it stops at the first UN-OVERRIDDEN one. Returning at the
 * first deny-case (which is what this did until
 * `issues/260801-1745_c_one-git-override-lifts-the-deny-for-the-other-git-class.md`)
 * left every later segment unclassified the moment one override was set, so
 * `FUSION_ALLOW_WORKTREE=1 git worktree add ../wt f && git switch main` allowed
 * a branch switch the user never authorised — the exact permission the second
 * variable exists to withhold.
 *
 * An overridden segment is remembered and the walk continues. A later
 * un-overridden deny WINS over it: the deny is the more restrictive verdict and
 * the one the user did not waive. Both classes overridden in one command allows,
 * and should — both permissions were granted explicitly.
 *
 * The verdict SHAPE is unchanged, and deliberately so. `overrideUsed` still
 * means "a normally-denied op was ALLOWED", so it is set only on the allow
 * return; a deny verdict never carries it, even when an earlier segment was
 * overridden, because on that call nothing was let through and `guard.ts` would
 * be recording an override-used note for a blocked command. When several
 * segments were overridden, `overrideSegment` names the FIRST — the honest
 * simple answer, and the one the note read before.
 */
export declare function classifyGitCommand(command: string, overrides: GitGuardOverrides, resolver?: CheckoutResolver): GitGuardVerdict;
/** Parse an env-var truthy flag ("1" or "true", case-insensitive). */
export declare function isEnvFlagSet(value: string | undefined): boolean;
/** Build the overrides struct from the process environment. */
export declare function overridesFromEnv(env: NodeJS.ProcessEnv): GitGuardOverrides;
/** Map a guard kind to the env var that overrides it (for diagnostics). */
export declare function overrideEnvFor(kind: GitGuardKind): string;
