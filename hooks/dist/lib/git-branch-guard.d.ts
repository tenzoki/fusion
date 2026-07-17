/**
 * Git branch-switch guard — deterministic classifier for the PreToolUse hook.
 *
 * Prose rules alone do not stop LLM agents from switching git branches under
 * task pressure. The only effective lever is this classifier, which runs on
 * every agent `Bash` call (git is reachable only via Bash, so this is a
 * complete choke-point) and DENIES branch/worktree-moving git operations.
 *
 * Design (LOCKED):
 *   DENY  (HEAD moves): git switch …, git checkout -b/-B/--detach/--orphan/-,
 *         git checkout <branch/ref> with NO `--` separator, git worktree add …
 *   ALLOW (HEAD stays): git checkout … -- <paths> (file restore), git restore …,
 *         all read-only git, git branch listing/create-without-switch,
 *         everything non-git.
 *
 * The load-bearing allow-case is fusion's own revert strategy
 * (`git checkout HEAD -- <files>`), which MUST stay allowed. A `--`
 * separator is the primary, unambiguous discriminator: everything after it
 * is a pathspec, so HEAD cannot move.
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
 */
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
/**
 * Remove definite shell *data regions* from a command so that the substitution
 * recursion and operator segmentation which follow only ever classify
 * executable *code*. Bash performs NO expansion or command substitution in
 * these regions, so a git-looking string inside them is inert text, never a
 * command:
 *
 *   - single-quoted strings:             '… `git switch` …'
 *   - quoted-delimiter heredoc bodies:   <<'EOF' … EOF   and   <<"EOF" … EOF
 *
 * Regions where bash DOES expand `$(…)` / backticks are preserved verbatim so
 * a real hidden command still gets classified (this is what keeps the guard
 * fail-closed):
 *
 *   - double-quoted strings:             "… `git switch` …"   (bash substitutes)
 *   - unquoted-delimiter heredoc bodies: <<EOF … EOF          (bash expands body)
 *
 * Removed content is replaced with spaces; newlines are kept so surrounding
 * token boundaries survive. Parsing is fail-closed on ambiguity: an
 * unterminated quote, or a heredoc whose terminator never appears, leaves the
 * remainder AS-IS (treated as code) rather than silently dropping it — matching
 * this module's over-segment-not-under bias.
 *
 * Known conservative limitation: a single-quoted string nested inside a
 * double-quoted `$(…)` (e.g. `"$(echo 'x')"`) is not blanked, because the
 * double-quoted span is copied verbatim without re-entering quote tracking.
 * That errs toward DENY (data treated as code), never toward a missed switch.
 */
export declare function stripDataRegions(command: string): string;
/**
 * Split a command string into the segments that each run as their own command.
 * Segments on `;`, `&&`, `||`, `|`. Also recursively inspects the *contents*
 * of `$(...)` and backtick subshells (their inner commands run too).
 *
 * This is a deliberately conservative lexer: it does not try to be a full
 * shell parser. It over-segments rather than under-segments, which is the
 * fail-closed direction.
 *
 * NOTE: callers that start from a raw Bash command string should pass it
 * through `stripDataRegions()` first (as `classifyGitCommand` does) so that
 * inert data regions — single-quoted strings and quoted-delimiter heredoc
 * bodies — do not get mis-parsed as command substitution.
 */
export declare function extractCommandSegments(command: string): string[];
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
 * The two overrides are independent (least privilege).
 */
export declare function classifyGitCommand(command: string, overrides: GitGuardOverrides, resolver?: CheckoutResolver): GitGuardVerdict;
/** Parse an env-var truthy flag ("1" or "true", case-insensitive). */
export declare function isEnvFlagSet(value: string | undefined): boolean;
/** Build the overrides struct from the process environment. */
export declare function overridesFromEnv(env: NodeJS.ProcessEnv): GitGuardOverrides;
/** Map a guard kind to the env var that overrides it (for diagnostics). */
export declare function overrideEnvFor(kind: GitGuardKind): string;
