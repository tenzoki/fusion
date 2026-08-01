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
 *
 * The shell-lexing primitives it runs on (`stripDataRegions`,
 * `extractCommandSegments`, `tokenize`) are generic and live in
 * `shell-parse.ts`, which a second classifier also consumes. The first two are
 * re-exported here under their original names because they are part of this
 * module's established surface.
 */

import {
  extractCommandSegments,
  stripDataRegions,
  tokenize,
} from "./shell-parse.js";

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

const DENY_REASON =
  "fusion policy: agents never switch git branches autonomously (prevents " +
  "branch-drift chaos). If this task genuinely needs a different branch, STOP " +
  "and ask the user. The user can deliberately allow it by setting " +
  "FUSION_ALLOW_BRANCH_SWITCH=1 (or FUSION_ALLOW_WORKTREE=1 for worktrees) in " +
  "the session env.";

/**
 * Extra hint appended when the denied op is an ambiguous `git checkout <target>`
 * (no `--` separator, no branch-creating flag). This is the form an agent
 * reaches for when it means to RESTORE a file — so name the allowed
 * alternatives explicitly rather than leaving it at the generic branch reason.
 */
const CHECKOUT_RESTORE_HINT =
  " If you meant to RESTORE a file (not switch branches), use `git restore " +
  "<file>` or `git checkout -- <file>` — both are always allowed. The bare " +
  "`git checkout <file>` form is allowed only when <file> exists on disk and " +
  "is not also a branch/ref name.";

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

/** A denied segment: the override class plus the actionable reason to surface. */
interface SegmentDeny {
  kind: GitGuardKind;
  reason: string;
}


/**
 * Locate the `git <subcommand> …` invocation inside a segment's tokens,
 * skipping over leading env-assignments (e.g. `FOO=bar git …`) and a `git`
 * binary path. Returns the index of the `git` token, or -1 if the segment is
 * not a git invocation.
 */
function findGitInvocation(tokens: string[]): number {
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    // Leading VAR=value env-assignments are skipped.
    if (/^[A-Za-z_][A-Za-z0-9_]*=/.test(t)) continue;
    // The git binary — bare `git` or a path ending in `/git`.
    if (t === "git" || t.endsWith("/git")) return i;
    // First non-env token is not git → not a git command.
    return -1;
  }
  return -1;
}

/**
 * Classify a single already-segmented command. Returns a SegmentDeny for a
 * denied operation, or null if the segment is allowed. `resolver` (when
 * present) resolves the ambiguous bare-`git checkout <target>` form.
 */
function classifySegment(
  segment: string,
  resolver?: CheckoutResolver,
): SegmentDeny | null {
  const tokens = tokenize(segment);
  const gitIdx = findGitInvocation(tokens);
  if (gitIdx === -1) return null; // not a git command → allow

  // Args after `git`, dropping global options like `-C <dir>`, `-c k=v`,
  // `--git-dir=…`, `--work-tree=…` that can precede the subcommand.
  const rest = tokens.slice(gitIdx + 1);

  // `-C <dir>` global options in order — passed to the resolver so it resolves
  // paths/refs in the directory git itself would use.
  const cwdHints: string[] = [];
  // `--git-dir` / `--work-tree` redirect resolution in ways cwdHints can't
  // capture; when present we can't trust an on-disk allow → force fail-closed.
  let unresolvableGlobal = false;

  let subIdx = 0;
  while (subIdx < rest.length) {
    const t = rest[subIdx];
    if (t === "-C") {
      if (rest[subIdx + 1] !== undefined) cwdHints.push(rest[subIdx + 1]);
      subIdx += 2; // skip flag + its argument
      continue;
    }
    if (t === "-c") {
      subIdx += 2; // skip flag + its config arg
      continue;
    }
    if (t.startsWith("--git-dir") || t.startsWith("--work-tree")) {
      unresolvableGlobal = true;
      // `--git-dir=x` (single token) or `--git-dir x` (two tokens).
      subIdx += t.includes("=") ? 1 : 2;
      continue;
    }
    if (t.startsWith("-")) {
      subIdx += 1; // some other global flag — skip it
      continue;
    }
    break; // first non-flag token is the subcommand
  }

  const subcommand = rest[subIdx];
  if (!subcommand) return null; // bare `git` with no subcommand → allow

  const args = rest.slice(subIdx + 1);

  if (subcommand === "switch") {
    // Every form of `git switch` moves HEAD → deny.
    return { kind: "branch-switch", reason: DENY_REASON };
  }

  if (subcommand === "worktree") {
    // Only `git worktree add` creates a new HEAD-bearing checkout → deny.
    // List/remove/prune/lock/move/repair leave the current HEAD alone.
    if (args[0] === "add") return { kind: "worktree-add", reason: DENY_REASON };
    return null;
  }

  if (subcommand === "checkout") {
    return classifyCheckout(args, cwdHints, unresolvableGlobal, resolver);
  }

  return null; // any other git subcommand (incl. `restore`) → allow
}

/**
 * Classify `git checkout` args.
 *   - `--` separator present → everything after it is paths → file restore
 *     (HEAD stays) → ALLOW. Covers `git checkout HEAD -- foo`,
 *     `git checkout -- foo`, `git checkout <ref> -- foo`.
 *   - branch-creating / detaching flags (-b/-B/--detach/--orphan/-) → DENY.
 *   - bare `git checkout <target…>` with no `--`: ambiguous. ALLOW only when a
 *     resolver is present, on-disk resolution is trustworthy, and EVERY
 *     positional arg exists as a path AND none is a valid ref (a real file
 *     restore). Otherwise DENY (fail-closed) — a real branch is a valid ref,
 *     so branch switches always land here.
 */
function classifyCheckout(
  args: string[],
  cwdHints: string[],
  unresolvableGlobal: boolean,
  resolver?: CheckoutResolver,
): SegmentDeny | null {
  if (args.includes("--")) return null; // pathspec form → ALLOW

  // No `--` separator. Any of these flags are unambiguous HEAD-movers.
  for (const a of args) {
    if (
      a === "-b" ||
      a === "-B" ||
      a === "--detach" ||
      a === "--orphan" ||
      a === "-"
    ) {
      return { kind: "branch-switch", reason: DENY_REASON };
    }
  }

  // `git checkout` with no args at all is a no-op status-ish call → allow.
  if (args.length === 0) return null;

  // Ambiguous bare form. Deny unless the resolver proves every positional is
  // an existing file that is NOT also a ref.
  const ambiguousDeny: SegmentDeny = {
    kind: "branch-switch",
    reason: DENY_REASON + CHECKOUT_RESTORE_HINT,
  };

  if (!resolver || unresolvableGlobal) return ambiguousDeny;

  const positionals = args.filter((a) => !a.startsWith("-"));
  if (positionals.length === 0) return ambiguousDeny;

  for (const p of positionals) {
    // A valid ref (branch/tag/commit/HEAD) → git would switch → DENY. This also
    // covers a branch that merely shares a name with a file (ref wins).
    if (resolver.isRef(p, cwdHints)) return ambiguousDeny;
    // Not an existing path → not a file restore → DENY (fail-closed).
    if (!resolver.pathExists(p, cwdHints)) return ambiguousDeny;
  }

  return null; // every positional is an existing non-ref path → file restore → ALLOW
}

const OVERRIDE_FOR: Record<GitGuardKind, "FUSION_ALLOW_BRANCH_SWITCH" | "FUSION_ALLOW_WORKTREE"> = {
  "branch-switch": "FUSION_ALLOW_BRANCH_SWITCH",
  "worktree-add": "FUSION_ALLOW_WORKTREE",
};

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
export function classifyGitCommand(
  command: string,
  overrides: GitGuardOverrides,
  resolver?: CheckoutResolver,
): GitGuardVerdict {
  if (!command || command.trim().length === 0) {
    return { deny: false };
  }

  // Strip inert shell data regions (single-quoted strings, quoted-delimiter
  // heredoc bodies) before segmenting, so prose that merely mentions
  // `git switch` / `git worktree add` in backticks is not misread as command
  // substitution. Code regions where bash DOES expand (double quotes, unquoted
  // heredocs) are preserved, keeping the guard fail-closed.
  const segments = extractCommandSegments(stripDataRegions(command));

  for (const segment of segments) {
    const result = classifySegment(segment, resolver);
    if (result === null) continue;

    const { kind, reason } = result;

    const overrideActive =
      (kind === "branch-switch" && overrides.allowBranchSwitch) ||
      (kind === "worktree-add" && overrides.allowWorktree);

    if (overrideActive) {
      // The user deliberately allowed this class. Allow, but flag for the
      // hook to record an override-used note for visibility.
      return {
        deny: false,
        overrideUsed: true,
        overrideKind: kind,
        overrideSegment: segment,
      };
    }

    return {
      deny: true,
      reason,
      offendingSegment: segment,
      kind,
    };
  }

  return { deny: false };
}

/** Parse an env-var truthy flag ("1" or "true", case-insensitive). */
export function isEnvFlagSet(value: string | undefined): boolean {
  if (!value) return false;
  const v = value.trim().toLowerCase();
  return v === "1" || v === "true";
}

/** Build the overrides struct from the process environment. */
export function overridesFromEnv(env: NodeJS.ProcessEnv): GitGuardOverrides {
  return {
    allowBranchSwitch: isEnvFlagSet(env.FUSION_ALLOW_BRANCH_SWITCH),
    allowWorktree: isEnvFlagSet(env.FUSION_ALLOW_WORKTREE),
  };
}

/** Map a guard kind to the env var that overrides it (for diagnostics). */
export function overrideEnvFor(kind: GitGuardKind): string {
  return OVERRIDE_FOR[kind];
}
