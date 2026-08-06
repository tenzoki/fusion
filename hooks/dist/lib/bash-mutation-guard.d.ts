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
 * An operator inside a double-quoted span is not one: bash redirects nothing
 * there, and `shell-parse`'s capture mode hands such a span over as an opaque
 * placeholder so a commit message about `rules/a.md -> rules/b.md` is prose.
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
 * The one exception is a verb that writes THROUGH its operand rather than
 * writing the operand — `git checkout <treeish> --`, `git restore --source=` and
 * `git clean -f`, which rewrite or delete every path underneath a pathspec. For
 * those three rows, and only at the directory the invocation actually runs in, a
 * pathspec that resolves to the project root denies; see
 * `VerbSpec.writesThrough`, which carries the argument and the cost.
 *
 * ## The match folds case
 *
 * Both protected-path comparisons — the glob match in `isProtected` and the
 * literal-prefix comparison in `ancestorOfProtected` — fold case. On a
 * case-insensitive filesystem (APFS in its default configuration, so every
 * stock macOS install) `rm AGENTS/coder.md` deletes `agents/coder.md` and
 * `rm -rf RULES` takes `rules/**` with it; both allowed until this landed,
 * needing no flag. The fold is UNCONDITIONAL rather than conditional on the
 * filesystem, so the boundary does not differ by platform — on a case-sensitive
 * one it over-blocks, which is the cost the user accepted. `matchesAnyFolded`
 * in `paths.ts` carries the argument and cites the decision record. The
 * EXEMPTION is deliberately NOT folded: folding a grant widens it.
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
 * AND IT IS CONDITIONAL ON THE SEPARATOR. The classifier has no filesystem, so
 * it cannot know whether a `cd` SUCCEEDED. After `&&` it does not need to: bash
 * will not run what follows unless the `cd` returned zero. After `;`, `||`,
 * `|`, `&` or a newline it runs the next segment from where it never left — so
 * `cd nonexistent; rm rules/x.md` deleted a protected rule with no flag, no
 * wrapper and one extra segment. The model therefore gives the directory up at
 * any joiner that is not `&&` once a directory builtin has run in the current
 * scope (`ShellState.moved`, `degradeUnprovenCd`, and `SegmentJoiner` in
 * `shell-parse.ts` — the field that widening added). The rule to state is
 * "every segment reachable without an `&&` from the builtin", not a list of
 * shapes: the Circle first costed it as five, which was a property of a corpus
 * harvested from this suite rather than of the change, and a cross-product
 * generator moved ten of thirty ordinary shapes
 * (`issues/260804-0840…`). The decision that took the trade is
 * `decisions/260803-2338_i_should-the-guard-degrade-its-directory-model-after-a-cd-it-cannot-prove-succeeded.md`.
 *
 * TWO PRECISIONS ON THE WORD `&&`, both learned after that decision shipped:
 *
 * 1. A NEWLINE AFTER `&&` IS PART OF THE OPERATOR. Bash's grammar is
 *    `and_or : and_or AND_AND newline_list pipeline`, so a multi-line chain is
 *    its single-line form. The lexer downgraded it for one commit and an
 *    ordinary `cd hooks &&\n npm run build &&\n rm -rf dist` denied, with a
 *    reason telling the caller to join with `&&` — which they had
 *    (`issues/260804-0838…`, fixed in `shell-parse.ts` `flush`).
 * 2. `&&` GUARANTEES THE AND-OR LIST TO ITS LEFT, NOT THE PREVIOUS SEGMENT,
 *    and does not reach into a pipeline. `A || B && C` is `(A || B) && C`, so
 *    reaching `C` says nothing about whether `B` ran; and a pipeline stage runs
 *    in a bash subshell that never moves the calling shell. The joiner was
 *    consulted for the segment that WRITES and never for the segment that
 *    MOVES, so `true || cd build && rm rules/x.md` and
 *    `echo hi | cd build && rm rules/x.md` were allowed and did delete the rule
 *    (`issues/260804-0836…`, `260804-0837…`, both pre-existing). The same
 *    question is now asked of the moving segment, from the same one-row-per-
 *    joiner table (`JoinerFacts`), and both deny
 *    (`decisions/260804-0947_…_should-the-joiner-be-consulted-for-the-segment-that-moves-as-well-as-the-one-that-writes.md`,
 *    option 4). WHAT IS STILL OPEN is the over-deny in the other direction: a
 *    conditional body, a loop body, a brace group and a pipeline stage degrade
 *    although the shell guarantees the `cd` (`issues/260804-0839…`), which
 *    needs the reachability model that record's option 2 describes and its own
 *    Circle. The family is not uniform — `until cd X; do W; done` runs its body
 *    when the `cd` FAILED, so that degrade is correct and has to survive.
 *
 * WHAT IT MODELS IS AN ALLOW-LIST. The tracking is exact for bash's default
 * logical `cd`, and bash has several modifiers that change the resolution rule
 * — `-P` and `set -o physical` (ask the kernel, so a symlink component is
 * resolved before `..` is taken), `pushd -n` and `popd -n` (edit the directory
 * stack without moving), a `CDPATH` assignment (search elsewhere for a
 * bare-word operand). Each of those is a token the classifier once discarded
 * before modelling what followed, and each was measured walking into the whole
 * protected list. So a modifier that is not on the short modelled list yields
 * `CWD_UNKNOWN` rather than a guess, and the fail-closed deny below does the
 * rest. `firstDirArg` and `applyDirEffect` state the invariant and how to check
 * it by reading.
 *
 * A MODIFIER IS NOT THE ONLY SHAPE. Two constructs were measured moving the
 * shell without being a flag on the builtin at all: `command cd rules` and
 * `builtin cd rules` reached the builtin through a wrapper the directory model
 * did not walk, and bare `pushd` / `pushd +N` ROTATE bash's stack where the
 * model pushed onto it (`issues/260803-2038…`, `issues/260803-2039…`). Both are
 * closed by the same allow-list stance rather than beside it: the resolver now
 * reports whether the segment named the builtin DIRECTLY
 * (`Invocation.reachesBuiltin`) and anything else takes the give-up, and the two
 * rotation forms take the give-up the flag forms already had.
 *
 * The wrapper half of that was first written as a MODEL — three wrappers marked
 * as builtin-capable and followed through — and the marking allowed eleven
 * commands the shell then executed against a protected file
 * (`issues/260803-2236…`). The lesson is not about wrappers. Giving up can only
 * deny; MODELLING is bidirectional, because an asserted move relocates every
 * later relative operand and can move it OFF the protected list as easily as
 * onto it. Any change here that adds modelling has to be costed in both
 * directions, and a directory the classifier cannot prove is not a directory it
 * may assert. What none of this licenses is a fresh completeness claim — the
 * honest statement is that the model is closed against flags, against the two
 * non-flag modes that were enumerated, and against the wrapper and stack routes
 * measured in Turns 5 and 6.
 *
 * ONE of those modifiers need not be in the command at all. `CDPATH` exported
 * in the user's own shell profile changes where a bare-word `cd` lands with
 * nothing in the command text to give it away, so it arrives as
 * `opts.env.CDPATH` instead — the only environment variable this classifier
 * reads, and the reason the environment is a parameter. See
 * `ambientCdpathIsSet`; the decision that chose degrading over documenting is
 * `decisions/260803-1803_*_should-the-guard-degrade-its-working-directory-model-when-cdpath-is-set-in-the-ambient-environment.md`.
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
 * THE BOUND IS DRAWN AROUND THE CAUSE, not around the program. The sentence
 * above is exactly true for an unresolvable TOKEN — one carrying `$`, a
 * backtick or a leading `~` — which is what "unparseable arguments" means and
 * what the idiom needs: `npm test > "$LOG"`, `cat report.md > ~/backup.md`,
 * `curl -o $OUT https://x` and `make $TARGET` all allow, and `echo x >
 * "rules/$F"` with them.
 *
 * It does NOT hold for a target the guard cannot place because it does not know
 * where the shell is standing. There the token is an ordinary literal relative
 * path and nothing about the program's arguments is unparseable; what is
 * unknown is the guard's own working-directory model, and a write it cannot
 * place may land anywhere on the protected list. `pushd -n docs && echo pwned >
 * agents/coder.md` overwrote an agent prompt through that gap with no flag, and
 * every directory give-up added another entrance to it
 * (`issues/260803-1835…`). Such a target now denies whatever the program is;
 * the reversal of `260801-1859`'s program-shaped half is argued in
 * `decisions/260804-0106_i_should-the-fail-closed-bound-be-drawn-around-the-program-or-around-the-cause.md`.
 *
 * A redirect target that RESOLVES was always checked whatever the program is
 * (`sort /tmp/a > rules/x.md` and `curl -s https://x > rules/x.md` deny).
 *
 * What this bound does NOT buy is consistency with the unrecognised-program
 * residual, and an earlier version of this comment claimed it did.
 * `curl -o rules/x.md` — a literal protected path, no `$`, no flag — is
 * ALLOWED, at this commit and at every commit before it, because `curl` is not
 * in `MUTATION_VERBS` and `-o` is not a redirection operator. The rule is
 * therefore looser on that visible case than on `pushd -n docs && echo hi >
 * notes.txt`, whose target is harmless. That is not the line this bound draws.
 *
 * The line it draws is whether the write is INSIDE the mechanism at all. A
 * `>` puts its target in the written set whatever the program is, so the guard
 * has already recognised the write and is holding the operand; the only thing
 * missing is a working directory it has itself admitted it lost. Declining to
 * model a program it never recognised is a bound. Recognising a write, losing
 * its directory, and then allowing it anyway is not a bound — it is the model
 * failing open on its own admission. See
 * `decisions/260804-0106…` `## The argument, corrected`.
 *
 * ## The accepted residual (documented, not hidden)
 *
 * An unrecognised program that writes a protected path still writes it
 * (`curl -o rules/x.md …`, a project's own build script). A path constructed at
 * run time is denied when it is an operand of a recognised verb, and otherwise
 * only when the guard has lost the working directory it hangs off — so
 * `echo x > "$F"` from a known directory is still invisible. This check raises
 * the cost of the bypass from zero to deliberate;
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
 * A `#` COMMENT is not stripped, in either direction: the lexer has no notion
 * of one, so `ls -la # writes > rules/x.md` is scanned as code and denies on
 * the redirect its comment only describes, while `rm rules/x.md # noop` is
 * denied for the right reason and `echo hi # && rm rules/x.md` is denied for
 * the wrong one. Stripping comments is a change to the lexer that blank mode
 * (pinned byte-for-byte against the legacy segmenter) cannot take, so it stays
 * a stated residual rather than half a fix. It errs toward DENY.
 *
 * Two sibling `$(…)` substitutions inside ONE outer segment share a virtual
 * working directory, because `shell-parse` reports a depth but not a subshell
 * identity: `$(cd /tmp) $(rm rules/x.md)` therefore resolves the second body
 * from `/tmp` and allows. It is contrived enough to be a residual rather than a
 * defect; anything an agent actually writes puts the two in separate segments,
 * where they are correctly independent.
 *
 * This module is PURE and EXPORTED so it is unit-testable without the hook
 * firing. It never touches the filesystem or the process, and it never READS
 * the environment: the protected list, the project-relative normaliser, the
 * exemption predicate and the environment itself all arrive through
 * `MutationOptions`. The environment is a parameter for the same reason it is
 * one in `rules-write-exemption.ts` — a test sets a variable for one case
 * without touching the process every other case runs in.
 */
import type { SegmentJoiner } from "./shell-parse.js";
export interface MutationVerdict {
    /** false = allow, true = deny the whole Bash call. */
    deny: boolean;
    /**
     * Does this command WRITE A FILE at all, as far as the classifier can see —
     * a table verb with written operands, or an output redirection? Reported
     * INDEPENDENTLY of `deny`, and that independence is the point: `rm
     * /tmp/scratch` mutates and does not deny, `ls -la` does neither.
     *
     * The caller needs the question answered separately because a HALTED guard
     * blocks writes rather than protected writes. On the write-tool path the halt
     * blocks every `Write`/`Edit`, wherever it points; the Bash path's mirror of
     * that is "every recognised mutation", which is this field. Deriving it from
     * `deny` would halt-block only the commands that were already denied, which
     * is no halt at all.
     *
     * Always present. An allowing verdict used to be exactly `{ deny: false }`;
     * it is now `{ deny: false, mutates: … }`, because a security field that is
     * absent when false is a field a caller forgets to read.
     *
     * True on every deny, including a fail-closed one: the classifier only
     * fail-closes on an operand of a recognised mutation.
     */
    mutates: boolean;
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
    /**
     * The resolved, project-relative paths `opts.exempt` let through, in the
     * order they were met, deduplicated. Present ONLY on an allowing verdict that
     * actually exempted something — absent when the predicate was not supplied,
     * when it accepted nothing, and on every deny.
     *
     * Absent on a deny because a deny means the whole call was blocked and
     * NOTHING was let through: an exemption note written for a command that never
     * ran would claim a write that did not happen. Same reason the git override
     * note in `guard.ts` is recorded after the mutation check rather than before.
     *
     * The caller uses this to record that a permission was exercised. It is
     * reporting, not a verdict: the exemption itself already happened inside
     * classification.
     */
    exempted?: string[];
}
export interface MutationOptions {
    /** The effective `guard.protectedPaths` globs. Empty list = nothing to guard. */
    protectedPaths: string[];
    /** Project-root-relative normalisation, injected so the module stays pure. */
    normalize: (raw: string) => string;
    /**
     * The environment the command will run in. Exactly ONE variable is read —
     * `CDPATH` — because a `CDPATH` exported in the user's shell profile changes
     * where a bare-word `cd` lands and appears nowhere in the command text (see
     * `ambientCdpathIsSet`).
     *
     * REQUIRED, unlike `exempt`, and the asymmetry is the point: an absent
     * `exempt` is the STRICTER answer (nothing is granted), while an absent
     * environment would be the LOOSER one (no `CDPATH` anywhere). A caller that
     * forgets a field whose omission weakens the guard is a caller that will
     * forget it, so the compiler asks instead. Pass `{}` to mean "no relevant
     * environment", which is what a unit test asserting the default usually
     * wants.
     */
    env: NodeJS.ProcessEnv;
    /**
     * C5a seam — a path this predicate accepts is exempt. Defaults to none.
     *
     * It is consulted per WRITTEN OPERAND, and not at all for an operand of a
     * verb the table marks `exemptible: false` (see `VerbSpec.exemptible`). So a
     * caller cannot grant a permission the table refuses to make grantable.
     *
     * TWO arguments, because this module destroys one of them on the way to the
     * other. `path` is the resolved, cwd-joined, normalised operand — the
     * spelling the protected list is matched on, and the only one that can be.
     * `spelled` is `joinCwd(base, operand)` BEFORE `normalize`, which collapses
     * `..` lexically: `rules/link/../agents/coder.md` becomes
     * `rules/agents/coder.md`, and the symlink whose target decides where the
     * write lands is no longer in the string at all. A caller whose grant depends
     * on the spelling (the rules-write exemption's gate 0) has to read the second
     * argument; a caller that does not may ignore it, and an existing
     * one-argument predicate stays assignable.
     *
     * WHAT `spelled` PRESERVES IS THE OPERAND, NOT THE BASE, and the difference
     * has been consequential. `base` is the virtual working directory, which
     * `resolveDir` normalises as it is built, so a `..` that arrived through a
     * `cd` is already gone by the time an operand is joined to it: for one Turn
     * `cd -P rules/link/.. && rm agents/coder.md` reached a gate that saw
     * `rules/agents/coder.md` and no `..` anywhere. The base is no longer a way
     * in, but not because `spelled` preserves it — because `applyDirEffect` now
     * yields `CWD_UNKNOWN` for any `cd` form it does not model, so an operand
     * hanging off such a base is unresolved and never becomes a `path` at all. A
     * caller reading `spelled` is therefore reading a faithful spelling of the
     * OPERAND against a base that is either exact or absent.
     */
    exempt?: (path: string, spelled: string) => boolean;
    /**
     * Why `exempt` said no — one sentence to carry into the deny reason, or null
     * when the caller has nothing worth adding. Consulted ONLY for an operand
     * that `exempt` was asked about and refused, and only on the deny path, so
     * whatever it costs is off the allow path entirely.
     *
     * It exists because a grant that refuses silently is indistinguishable from a
     * grant that was never given: with `FUSION_ALLOW_RULES_WRITE` set, a
     * hard-linked rule file denied with the byte-identical message it gets with
     * the flag unset, and the two documented responses to that were to conclude
     * the flag is broken or to keep rephrasing the command. This module stays
     * ignorant of what the caller's grant is about — it takes a string back and
     * puts it in the reason, exactly as it takes a boolean back and skips the
     * operand.
     */
    exemptRefusal?: (path: string, spelled: string) => string | null;
}
/** Which positional operands a verb writes. */
export type WrittenPositionals = 
/** Every positional (sources are removed or rewritten as well as the target). */
"all"
/** Only the last positional — the destination of a source→dest copy. */
 | "last"
/** None; the verb names its target another way (see `keyOperands`). */
 | "none";
/**
 * The positionals of one invocation, with the one fact a positional ROLE model
 * needs that `written: "all" | "last"` cannot express: where `--` fell.
 *
 * `endOfFlagsAt` is the index in `values` that the first `--` preceded, or
 * null when the invocation carried none. `git checkout -- rules/x.md` and
 * `git checkout rules/x.md` are the same operation, and
 * `git checkout HEAD -- rules/x.md` is a different one, so a model that cannot
 * see the separator cannot tell a tree-ish from a path.
 */
export interface Positionals {
    values: string[];
    endOfFlagsAt: number | null;
}
export interface VerbSpec {
    written: WrittenPositionals;
    /**
     * A verb whose operand ROLES are positional rather than flag-borne: given the
     * positionals (flags and their values already consumed) it returns the ones
     * the verb WRITES. Present it and `written` is not consulted.
     *
     * One row needs it. `git checkout` takes its source as a POSITIONAL tree-ish
     * where `git restore` takes it as `--source=`, so the discrimination that
     * `mutatesOnlyWhen` performs for `restore` — the default source is the revert
     * strategy, a named one is an overwrite — has nothing to hook onto here.
     */
    positionalModel?: (positionals: Positionals, literals: Map<string, string>) => string[];
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
     * Present when the verb only mutates under a FLAG: `sed -i` / `perl -i`
     * rewrite in place where the bare form reads, `git clean -f` deletes where
     * the bare form refuses, `git restore --source=<commit>` overwrites from an
     * arbitrary commit where the bare form is the revert strategy. Returns true
     * for a flag token that turns the verb into a mutation; without one the verb
     * writes nothing.
     */
    mutatesOnlyWhen?: (flag: string) => boolean;
    /** `key=value` operands that name a written file (`dd of=…`). */
    keyOperands?: readonly string[];
    /**
     * The verb writes every path BENEATH its operand rather than the named entry
     * itself — set on `git checkout <treeish> --`, `git restore --source=` and
     * `git clean -f`, and on nothing else.
     *
     * ## What it changes, and why it is a property of the VERB
     *
     * `ancestorOfProtected` excludes the project root deliberately: `cp x .` and
     * `mv build/out.js .` write INTO the root without destroying it, and denying
     * them would catch ordinary work for nothing. That exclusion is right for
     * every verb that writes the entry it names, and wrong for one that walks
     * into it: `git checkout HEAD~1 -- .` rewrote every tracked file in the
     * project, protected ones included, and allowed, because `.` is not itself
     * protected and the ancestor check declined to compare it
     * (`issues/260804-1345_…`). `git clean -fdx` deleted every untracked file the
     * same way (`issues/260804-1346_…`).
     *
     * So the distinction is write-the-directory versus write-THROUGH-it, which is
     * a fact about the verb rather than about the operand, and a reader can check
     * which rows have it by reading the table.
     *
     * ## The bound, which is narrower than the flag looks
     *
     * It is consulted ONLY at the base the invocation actually runs in — see
     * `gitEffectiveBase`. A git invocation is checked against a UNION of
     * directories (the shell's own, plus whatever `-C`/`--work-tree` name), and
     * the extra candidates exist to stop a directory flag arguing away a protected
     * path SPELLED IN THE COMMAND. `git -C build clean -fdx` cleans `build` and
     * nothing else; reading its operand at the shell's root as well and then
     * denying it there would be the classifier inventing a write git does not
     * perform. That row is pinned as an allow in both suites.
     */
    writesThrough?: boolean;
    /**
     * May `opts.exempt` waive a deny on this verb's written operands? Defaults
     * to true; `false` means the operands are checked against the protected list
     * with NO exemption available, however the caller configured one.
     *
     * There is one row it is false on, and the reason is not about `ln`
     * specifically. An exemption is a grant read off a PATH, and a path is only a
     * safe thing to read a grant off while it names one file. `ln` is the one
     * verb in this table whose whole purpose is to give a file a SECOND name — so
     * exempting it lets a grant that says "you may write rule files" be spent on
     * installing an alias inside the rule directory, which is the mechanism that
     * makes every later path-based grant unsound. The flag's stated permission is
     * writing rule files; creating an alias is not that, and no rule-curation
     * workflow needs it.
     *
     * The bound, stated because it is easy to over-read: this closes the DIRECT
     * spelling, not the class. `mv` and `cp -P` can relocate an existing symlink
     * into the rule directory, and they must stay exemptible because
     * `mv rules/x.md rules/retired/` is the flag's headline use. What keeps a
     * planted alias from being traversed is three things, none of which is this
     * row: gate 0 refuses an operand SPELLED with a `..`, gate 2 resolves what is
     * left against the real filesystem (`rules-write-exemption.ts`), and the
     * virtual working directory admits `CWD_UNKNOWN` rather than modelling a `cd`
     * it cannot compute (`applyDirEffect`). This row is a layer, not the layer.
     *
     * IT IS WRITTEN AS A LIST BECAUSE EACH SHORTER VERSION OF IT WAS FALSE.
     * For one Turn it said only "gate 2 resolves paths against the real
     * filesystem": `mv` and `cp -P` both planted, and `rules/<link>/../<anything>`
     * reached the whole protected list, because the lexical collapse deleted the
     * link from the string before gate 2 saw it. For the next Turn it said gate 0
     * "refuses any operand spelled with a `..`, which is the ONLY WAY to traverse
     * a planted link without naming it": `cd -P rules/<link>/..` traversed it
     * with no `..` in any operand, because the `cd`'s own `..` had been collapsed
     * into the base before the operand was joined to it.
     *
     * So no completeness claim is made here at all. What can be said is narrower
     * and checkable: each of the three refuses a class of spelling, and where the
     * spelling cannot be trusted the classifier denies instead of granting. A
     * symlink that a write follows outside any of those three is a residual of a
     * TEXTUAL protection check and is documented as one, in this module's
     * "accepted residual" section and in `rules/protected-path-discipline.md`.
     */
    exemptible?: boolean;
    /**
     * A SECOND DISPATCH HOP keyed on the verb's first operand, for a verb that
     * is really a family of commands with different operand roles. `git stash`
     * is eleven commands and only one of them names working-tree paths; reading
     * every positional of all eleven put `pop` in the written set as a path
     * (`issues/260801-1956_c_the-git-stash-row-reads-its-sub-subcommand-and-refs-as-written-paths.md`).
     * When present, `written`/`valueFlags` on THIS row are not consulted — the
     * matched sub-row answers instead.
     */
    subcommands?: SubcommandDispatch;
}
/** The second hop's table, plus the row that applies when no word selects one. */
export interface SubcommandDispatch {
    /** One row per named sub-subcommand. */
    table: Readonly<Record<string, VerbSpec>>;
    /**
     * The row for a call with NO sub-subcommand word — `git stash`,
     * `git stash -u` and `git stash -- <paths>` are all the implicit `push`.
     */
    implicit: VerbSpec;
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
export declare const MUTATION_GIT_SUBCOMMANDS: Readonly<Record<string, VerbSpec>>;
/**
 * Everything this module believes about a segment's LEADING joiner.
 *
 * THE POINT OF THE TABLE IS THAT THERE IS ONLY ONE OF IT. The directory model
 * asks two different questions about the same operator — may a `cd` taken
 * earlier be carried ACROSS this joiner, and does a `cd` written IN this
 * segment move the calling shell — and each was, or would have been, a separate
 * comparison against a joiner literal at its own call site. Two places holding
 * one fact about a joiner is the shape that produced `issues/260803-2237…` and
 * `260803-2039…`: a give-up stated in one place while another place quietly
 * kept believing something. So both answers live here, in one record per
 * joiner, and `joinerFacts` is the only reader.
 *
 * A READER CHECKS THAT BY GREPPING, and the check is one line:
 *
 *     grep -c '\.joiner' hooks/lib/bash-mutation-guard.ts   # => 1 (in code)
 *
 * The single occurrence is `joinerFacts(segment.joiner)` in
 * `classifyBashMutation`. Both give-ups below it read a FIELD off the record it
 * returns and neither compares a joiner to anything, so there is no second
 * place where a joiner means something. The suite pins it ("keeps one fact
 * about a joiner in one place"), so a third comparison cannot be added quietly
 * — which is the whole mitigation `decisions/260804-0947…` option 4 depends on.
 *
 * THE LOOKUP IS A SAFE-LIST, not an enumeration of the dangerous joiners. A
 * joiner absent from this table answers `false` to both questions, so a joiner
 * added to `SegmentJoiner` later is unguaranteed and non-moving until someone
 * argues otherwise and adds a row. That is the same inversion `firstDirArg`
 * made for flags, and the direction `260803-2338` chose for the write side.
 */
export interface JoinerFacts {
    /**
     * May the model carry a `cd` taken EARLIER in this scope across this joiner?
     *
     * Only `&&` guarantees the and-or list to its left returned zero, so only
     * after `&&` is a `cd` behind it known to have succeeded. `start` is the
     * other true row and it is not a guarantee about anything: nothing ran before
     * the first segment of a scope, so there is no `cd` in this scope for the
     * joiner to cast doubt on.
     */
    carriesCdForward: boolean;
    /**
     * Does a directory builtin written IN this segment move the CALLING shell?
     *
     * Two ways to answer no, and they are different shell mechanics with the same
     * consequence. `||` may skip the segment entirely — `A || B && C` is
     * `(A || B) && C`, so reaching `C` proves the list returned zero and says
     * nothing about whether `B` ran. `|` runs the segment in a bash subshell,
     * which cannot move its caller. (zsh runs the LAST pipeline element in the
     * calling shell, so there the move is real; the classifier serves both shells
     * and takes the pessimistic answer, as it does everywhere the two disagree.)
     *
     * `;`, a newline and `start` are true: the segment runs unconditionally, and
     * whether the `cd` SUCCEEDED is `carriesCdForward`'s question, not this one.
     * `&` is true as a LEADING joiner, because `A & cd B` backgrounds `A` and runs
     * the `cd` in the foreground shell.
     */
    movesCallingShell: boolean;
}
export declare const JOINER_FACTS: ReadonlyMap<SegmentJoiner, JoinerFacts>;
/**
 * The only reader of `JOINER_FACTS`, exported with it as the review surface —
 * the same reason `MUTATION_VERBS` and `WRAPPER_PROGRAMS` are exported. Passing
 * it a joiner the table does not carry is the checkable form of the safe-list
 * claim, and the suite does exactly that.
 */
export declare function joinerFacts(j: SegmentJoiner): JoinerFacts;
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
