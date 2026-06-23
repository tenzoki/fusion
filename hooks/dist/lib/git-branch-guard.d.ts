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
 *         git checkout <ref> with NO `--` separator, git worktree add …
 *   ALLOW (HEAD stays): git checkout … -- <paths> (file restore), all read-only
 *         git, git branch listing/create-without-switch, everything non-git.
 *
 * The load-bearing allow-case is fusion's own revert strategy
 * (`git checkout HEAD -- <files>`), which MUST stay allowed. The `--`
 * separator is the discriminator.
 *
 * Fail-closed: an ambiguous `git checkout` without a `--` separator → DENY.
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
 * Split a command string into the segments that each run as their own command.
 * Segments on `;`, `&&`, `||`, `|`. Also recursively inspects the *contents*
 * of `$(...)` and backtick subshells (their inner commands run too).
 *
 * This is a deliberately conservative lexer: it does not try to be a full
 * shell parser. It over-segments rather than under-segments, which is the
 * fail-closed direction.
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
export declare function classifyGitCommand(command: string, overrides: GitGuardOverrides): GitGuardVerdict;
/** Parse an env-var truthy flag ("1" or "true", case-insensitive). */
export declare function isEnvFlagSet(value: string | undefined): boolean;
/** Build the overrides struct from the process environment. */
export declare function overridesFromEnv(env: NodeJS.ProcessEnv): GitGuardOverrides;
/** Map a guard kind to the env var that overrides it (for diagnostics). */
export declare function overrideEnvFor(kind: GitGuardKind): string;
