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
import { extractCommandSegments, stripDataRegions, tokenize, } from "./shell-parse.js";
export { extractCommandSegments, stripDataRegions } from "./shell-parse.js";
const DENY_REASON = "fusion policy: agents never switch git branches autonomously (prevents " +
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
const CHECKOUT_RESTORE_HINT = " If you meant to RESTORE a file (not switch branches), use `git restore " +
    "<file>` or `git checkout -- <file>` — both are always allowed. The bare " +
    "`git checkout <file>` form is allowed only when <file> exists on disk and " +
    "is not also a branch/ref name.";
/**
 * Locate the `git <subcommand> …` invocation inside a segment's tokens,
 * skipping over leading env-assignments (e.g. `FOO=bar git …`) and a `git`
 * binary path. Returns the index of the `git` token, or -1 if the segment is
 * not a git invocation.
 */
function findGitInvocation(tokens) {
    for (let i = 0; i < tokens.length; i++) {
        const t = tokens[i];
        // Leading VAR=value env-assignments are skipped.
        if (/^[A-Za-z_][A-Za-z0-9_]*=/.test(t))
            continue;
        // The git binary — bare `git` or a path ending in `/git`.
        if (t === "git" || t.endsWith("/git"))
            return i;
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
function classifySegment(segment, resolver) {
    const tokens = tokenize(segment);
    const gitIdx = findGitInvocation(tokens);
    if (gitIdx === -1)
        return null; // not a git command → allow
    // Args after `git`, dropping global options like `-C <dir>`, `-c k=v`,
    // `--git-dir=…`, `--work-tree=…` that can precede the subcommand.
    const rest = tokens.slice(gitIdx + 1);
    // `-C <dir>` global options in order — passed to the resolver so it resolves
    // paths/refs in the directory git itself would use.
    const cwdHints = [];
    // `--git-dir` / `--work-tree` redirect resolution in ways cwdHints can't
    // capture; when present we can't trust an on-disk allow → force fail-closed.
    let unresolvableGlobal = false;
    let subIdx = 0;
    while (subIdx < rest.length) {
        const t = rest[subIdx];
        if (t === "-C") {
            if (rest[subIdx + 1] !== undefined)
                cwdHints.push(rest[subIdx + 1]);
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
    if (!subcommand)
        return null; // bare `git` with no subcommand → allow
    const args = rest.slice(subIdx + 1);
    if (subcommand === "switch") {
        // Every form of `git switch` moves HEAD → deny.
        return { kind: "branch-switch", reason: DENY_REASON };
    }
    if (subcommand === "worktree") {
        // Only `git worktree add` creates a new HEAD-bearing checkout → deny.
        // List/remove/prune/lock/move/repair leave the current HEAD alone.
        if (args[0] === "add")
            return { kind: "worktree-add", reason: DENY_REASON };
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
function classifyCheckout(args, cwdHints, unresolvableGlobal, resolver) {
    if (args.includes("--"))
        return null; // pathspec form → ALLOW
    // No `--` separator. Any of these flags are unambiguous HEAD-movers.
    for (const a of args) {
        if (a === "-b" ||
            a === "-B" ||
            a === "--detach" ||
            a === "--orphan" ||
            a === "-") {
            return { kind: "branch-switch", reason: DENY_REASON };
        }
    }
    // `git checkout` with no args at all is a no-op status-ish call → allow.
    if (args.length === 0)
        return null;
    // Ambiguous bare form. Deny unless the resolver proves every positional is
    // an existing file that is NOT also a ref.
    const ambiguousDeny = {
        kind: "branch-switch",
        reason: DENY_REASON + CHECKOUT_RESTORE_HINT,
    };
    if (!resolver || unresolvableGlobal)
        return ambiguousDeny;
    const positionals = args.filter((a) => !a.startsWith("-"));
    if (positionals.length === 0)
        return ambiguousDeny;
    for (const p of positionals) {
        // A valid ref (branch/tag/commit/HEAD) → git would switch → DENY. This also
        // covers a branch that merely shares a name with a file (ref wins).
        if (resolver.isRef(p, cwdHints))
            return ambiguousDeny;
        // Not an existing path → not a file restore → DENY (fail-closed).
        if (!resolver.pathExists(p, cwdHints))
            return ambiguousDeny;
    }
    return null; // every positional is an existing non-ref path → file restore → ALLOW
}
const OVERRIDE_FOR = {
    "branch-switch": "FUSION_ALLOW_BRANCH_SWITCH",
    "worktree-add": "FUSION_ALLOW_WORKTREE",
};
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
export function classifyGitCommand(command, overrides, resolver) {
    if (!command || command.trim().length === 0) {
        return { deny: false };
    }
    // Strip inert shell data regions (single-quoted strings, quoted-delimiter
    // heredoc bodies) before segmenting, so prose that merely mentions
    // `git switch` / `git worktree add` in backticks is not misread as command
    // substitution. Code regions where bash DOES expand (double quotes, unquoted
    // heredocs) are preserved, keeping the guard fail-closed.
    const segments = extractCommandSegments(stripDataRegions(command));
    // The first segment an override let through, held back rather than returned
    // so the rest of the command is still classified against the OTHER class.
    let waived;
    for (const segment of segments) {
        const result = classifySegment(segment, resolver);
        if (result === null)
            continue;
        const { kind, reason } = result;
        const overrideActive = (kind === "branch-switch" && overrides.allowBranchSwitch) ||
            (kind === "worktree-add" && overrides.allowWorktree);
        if (overrideActive) {
            // The user deliberately allowed this class — for THIS segment. Keep
            // scanning; a later segment of the other class is still denied.
            if (waived === undefined)
                waived = { kind, segment };
            continue;
        }
        return {
            deny: true,
            reason,
            offendingSegment: segment,
            kind,
        };
    }
    if (waived !== undefined) {
        // Every deny-case in the command was individually authorised. Allow, and
        // flag for the hook to record an override-used note for visibility.
        return {
            deny: false,
            overrideUsed: true,
            overrideKind: waived.kind,
            overrideSegment: waived.segment,
        };
    }
    return { deny: false };
}
/** Parse an env-var truthy flag ("1" or "true", case-insensitive). */
export function isEnvFlagSet(value) {
    if (!value)
        return false;
    const v = value.trim().toLowerCase();
    return v === "1" || v === "true";
}
/** Build the overrides struct from the process environment. */
export function overridesFromEnv(env) {
    return {
        allowBranchSwitch: isEnvFlagSet(env.FUSION_ALLOW_BRANCH_SWITCH),
        allowWorktree: isEnvFlagSet(env.FUSION_ALLOW_WORKTREE),
    };
}
/** Map a guard kind to the env var that overrides it (for diagnostics). */
export function overrideEnvFor(kind) {
    return OVERRIDE_FOR[kind];
}
