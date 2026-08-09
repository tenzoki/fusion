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
import { resolveInvocation } from "./command-word.js";
import { extractCommandSegments, stripDataRegions, tokenize, } from "./shell-parse.js";
export { extractCommandSegments, stripDataRegions } from "./shell-parse.js";
/**
 * This classifier parses in BLANK mode, where a single-quoted region is erased
 * rather than captured, so there is never a literal table to consult. The empty
 * map is the whole of it — `resolveWord` only ever reads from it.
 */
const NO_LITERALS = new Map();
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
 * The three subcommands this classifier has a verdict for. A bare word that
 * matches none of them is either git's real subcommand (one this policy does
 * not speak about) or the value an unrecognised global option consumed — the
 * distinction `classifySegment`'s walk makes below.
 */
const BRANCH_SUBCOMMANDS = new Set(["switch", "worktree", "checkout"]);
/**
 * Classify a single already-segmented command. Returns a SegmentDeny for a
 * denied operation, or null if the segment is allowed. `resolver` (when
 * present) resolves the ambiguous bare-`git checkout <target>` form.
 *
 * The segment is a git call when its resolved command word is `git` — which
 * covers `FOO=bar git …`, `/usr/bin/git …`, `"git" …`, `\git …`,
 * `sudo git …`, `exec git …` and `if git …; then`, because
 * `resolveInvocation` has already stripped the assignment, the path, the
 * quoting, the escape, the wrapper and the grammar word respectively.
 *
 * IT ALSO COVERS `GIT …`, `Git …` and `/usr/bin/GIT …`, because the name
 * `resolveInvocation` returns is case-folded. The comparison below stays a
 * plain `!==` on purpose: the fold belongs at the one point the word is
 * resolved, not at each table that reads it, so every consumer gets the same
 * answer. Do not re-case it here. The full argument — including why folding
 * can only add denies — is at `programName` in `command-word.ts`
 * (`issues/260809-1110_*_the-command-word-comparison-is-case-sensitive-while-the-protected-path-match-folds.md`).
 *
 * ## An unrecognised global option consumes a value, and the walk RESUMES
 *
 * The walk below steps over git's global options to reach the subcommand. It
 * consumes the value of the four options it knows (`-C`, `-c`, `--git-dir`,
 * `--work-tree`) and treats every other `-`-prefixed token as valueless. An
 * option that DOES take a separated value therefore left its value standing in
 * subcommand position, where it matched none of the three rows, and the whole
 * call allowed: `git --namespace ns switch other` and
 * `git --attr-source HEAD switch t1` were both measured switching branches
 * against real git 2.49.0 while the guard allowed them
 * (`issues/260809-1106_*_the-unknown-global-option-fix-was-deleted-with-the-mutation-classifier-and-the-branch-guard-never-had-it.md`).
 *
 * `--namespace` is the instance git 2.49 happens to ship; it is not the defect.
 * Every option the table does not carry has this shape, including ones git has
 * not shipped yet, which is why this was not closed by adding a row.
 *
 * This is not a new remedy. The identical defect was found and closed in the
 * mutation classifier's `resolveGit` on 2026-08-04
 * (`issues/260804-1333_c_an-unrecognised-git-global-option-swallows-the-subcommand-and-the-invocation-reads-as-an-unrecognised-program.md`),
 * its first answer — reading two adjacent words as subcommand candidates — was
 * found insufficient the same day
 * (`issues/260804-1344_c_the-git-option-walk-stops-at-an-unknown-options-value-so-a-c-behind-it-is-invisible.md`),
 * and the walk-resumption below is that record's remedy. Both modules had the
 * same eight lines; the fix was applied to one of them, and when the mutation
 * classifier was retired in v6.0.0 the fix went with it. What survives that
 * pattern is a test naming the sibling records, which
 * `git-branch-guard.test.ts` now carries.
 *
 * So: a bare word is tested against `BRANCH_SUBCOMMANDS`. If it matches, that
 * is the invocation. If it does not and an unrecognised option stands in front
 * of it, it is that option's VALUE and the walk continues from the next index,
 * recording any `-C` and `--work-tree` it then meets. If it does not match and
 * no unrecognised option stands in front of it, it is git's real subcommand and
 * the walk stops — which is what keeps the walk out of the subcommand's OWN
 * arguments, where `-C` means something else entirely (`git commit -C HEAD~1`
 * reuses a message).
 *
 * ## What this preserves, and what it costs
 *
 * The resumed walk can only try MORE subcommand candidates and record MORE
 * directories than a walk that stopped, so the candidate set after the change
 * is a superset of the one before and the change can only ADD denies. That is
 * the same monotonicity `classifyCheckout` rests on, and it is why no
 * measurement is needed on the deny side. The ALLOW side is measured rather
 * than argued, by the bounded corpus in
 * `__tests__/helpers/git-corpus.ts` — no verdict that denied at the baseline
 * allows after it.
 *
 * The cost is a false deny of the shape
 * `git <unknown-option> <non-subcommand> <switch|worktree|checkout>`. The class
 * is open; the shape is not special to any one option. It is smaller here than
 * it was in its original home: this table has three rows against the mutation
 * classifier's many, so far fewer trailing words can match one.
 *
 * THE BOUND, stated because "the class is closed" is the claim that was wrong
 * last time. Closed: every well-formed invocation in which each unrecognised
 * global option takes at most ONE separated value. Not closed and not claimed:
 * an option taking two separated values, and a second bare word standing
 * between the value and the subcommand (`git --namespace foo bar -C d switch
 * main`), which resolves to nothing here. Neither is a fail-open in practice —
 * git itself reads that second bare word as the subcommand and refuses the
 * command — but neither is proven, and the suite asserts the bound rather than
 * leaving it in prose.
 */
function classifySegment(segment, resolver) {
    const invocation = resolveInvocation(tokenize(segment), NO_LITERALS);
    if (invocation === null || invocation.name !== "git")
        return null;
    // Args after `git`, dropping global options like `-C <dir>`, `-c k=v`,
    // `--git-dir=…`, `--work-tree=…` that can precede the subcommand.
    const rest = invocation.args;
    // `-C <dir>` global options in order — passed to the resolver so it resolves
    // paths/refs in the directory git itself would use.
    const cwdHints = [];
    // `--git-dir` / `--work-tree` redirect resolution in ways cwdHints can't
    // capture; when present we can't trust an on-disk allow → force fail-closed.
    let unresolvableGlobal = false;
    /** Did an option this walk could not name stand immediately before `i`? */
    let unknownOption = false;
    let subcommand;
    let args = [];
    let i = 0;
    while (i < rest.length) {
        const t = rest[i];
        if (t.startsWith("-")) {
            // Cleared by every option the walk CAN name; set again below for one it
            // cannot, so the flag is still remembered when the next bare word arrives.
            unknownOption = false;
            if (t === "-C") {
                if (rest[i + 1] !== undefined)
                    cwdHints.push(rest[i + 1]);
                i += 2; // skip flag + its argument
                continue;
            }
            if (t === "-c") {
                i += 2; // skip flag + its config arg
                continue;
            }
            if (t.startsWith("--git-dir") || t.startsWith("--work-tree")) {
                unresolvableGlobal = true;
                // `--git-dir=x` (single token) or `--git-dir x` (two tokens).
                i += t.includes("=") ? 1 : 2;
                continue;
            }
            unknownOption = true;
            i += 1;
            continue;
        }
        // A bare word: git's subcommand, or the value an unrecognised option ate.
        if (BRANCH_SUBCOMMANDS.has(t)) {
            subcommand = t;
            args = rest.slice(i + 1);
            break;
        }
        // No unrecognised option in front of it, so this word IS git's subcommand
        // and it is not one this policy speaks about.
        if (!unknownOption)
            return null;
        unknownOption = false;
        i += 1;
    }
    if (subcommand === undefined)
        return null; // bare `git`, or no row matched
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
 *   - branch-creating / detaching flags (-b/-B/--detach/--orphan/-) → DENY,
 *     ahead of everything else. See the ordering note below.
 *   - `--` separator present → everything after it is paths → file restore
 *     (HEAD stays) → ALLOW. Covers `git checkout HEAD -- foo`,
 *     `git checkout -- foo`, `git checkout <ref> -- foo`.
 *   - bare `git checkout <target…>` with no `--`: ambiguous. ALLOW only when a
 *     resolver is present, on-disk resolution is trustworthy, and EVERY
 *     positional arg exists as a path AND none is a valid ref (a real file
 *     restore). Otherwise DENY (fail-closed) — a real branch is a valid ref,
 *     so branch switches always land here.
 *
 * ## Why the flag scan runs FIRST, and why the two are not alternatives
 *
 * The shared invariant, which `classifySegment`'s resumed walk states from the
 * other side: EVIDENCE THAT HEAD MOVES IS UNCONDITIONAL. No later token
 * withdraws it, and no earlier token may hide it.
 *
 * The separator check used to run first and returned ALLOW the moment a `--`
 * appeared anywhere in the argument list. That reading is right for
 * `git checkout <ref> -- <paths>` and wrong the instant a branch-creating flag
 * is also present, because git resolves the flag and never reaches the
 * ambiguity the separator settles. Two characters therefore lifted the
 * policy's primary case: `git checkout -b bar --` was ALLOWED and created a
 * branch against real git 2.49.0
 * (`issues/260809-1105_*_a-trailing-separator-lifts-the-branch-deny-so-git-checkout-b-name-runs.md`).
 *
 * The reorder can only ADD denies — it returns earlier on a subset of inputs
 * and changes nothing else — so the no-new-allow direction needs no
 * measurement. The direction that did need checking is the load-bearing allow:
 * `git checkout HEAD -- rules/x.md` has args `["HEAD", "--", "rules/x.md"]`,
 * none of which is one of the five flags, so it falls through to the separator
 * check exactly as before.
 *
 * THE COST, stated rather than left to be discovered: the scan reads every
 * argument, including the pathspecs behind the separator, so a file literally
 * named `-b`, `-B`, `--detach`, `--orphan` or `-` is now a false deny in
 * `git checkout <ref> -- -b`. Scanning only the arguments before the separator
 * would avoid it, and is not done, because "a flag anywhere is evidence" is the
 * invariant this function should be readable as — and because a pathspec with
 * one of those five names is a shape nobody writes on purpose, while the
 * fail-closed direction is the one the policy is for.
 */
function classifyCheckout(args, cwdHints, unresolvableGlobal, resolver) {
    // Unambiguous HEAD-movers, checked before the separator can speak for them.
    for (const a of args) {
        if (a === "-b" ||
            a === "-B" ||
            a === "--detach" ||
            a === "--orphan" ||
            a === "-") {
            return { kind: "branch-switch", reason: DENY_REASON };
        }
    }
    if (args.includes("--"))
        return null; // pathspec form → ALLOW
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
