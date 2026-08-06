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

import { normalize as normalizePath } from "node:path";
import { foldCase, matchesAnyFolded } from "./paths.js";
import {
  findCommandWord,
  programName,
  resolveInvocation,
  row,
} from "./command-word.js";
import {
  SUBSTITUTION_FILLER,
  parseCommand,
  resolveWord,
  tokenize,
} from "./shell-parse.js";
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

/* ------------------------------------------------------------------ *
 * The verb table
 * ------------------------------------------------------------------ */

/** Which positional operands a verb writes. */
export type WrittenPositionals =
  /** Every positional (sources are removed or rewritten as well as the target). */
  | "all"
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
  positionalModel?: (
    positionals: Positionals,
    literals: Map<string, string>,
  ) => string[];
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
 * `sed`'s in-place flag. GNU accepts an attached suffix (`-i.bak`) and clusters
 * short flags (`-ni`); BSD takes the suffix as a separate mandatory argument
 * (`-i ''`). Reading "an `i` among the short-flag letters" covers all of them
 * with no platform branch.
 */
function isSedInPlaceFlag(flag: string): boolean {
  if (flag.startsWith("--")) return /^--in-place(=|$)/.test(flag);
  return shortFlagLetters(flag, SED_FLAG_GRAMMAR).includes("i");
}

/**
 * `perl -i` / `-i.bak` / `-pi` / `-lpi`. `-I` (include path) is a different
 * flag, and telling the two apart is what `ShortFlagGrammar` is for.
 */
function isPerlInPlaceFlag(flag: string): boolean {
  if (flag.startsWith("--")) return false;
  return shortFlagLetters(flag, PERL_FLAG_GRAMMAR).includes("i");
}

/**
 * How a short-flag letter relates to the characters that follow it INSIDE THE
 * SAME TOKEN. There are two classes, and collapsing them into one is exactly
 * what lost `perl -lpi`
 * (`issues/260801-1955_c_value-letter-truncation-loses-the-in-place-flag-for-perl-lpi.md`).
 */
interface ShortFlagGrammar {
  /**
   * Letters that consume the REST OF THE TOKEN as their value, so nothing
   * later in it is a flag letter. `-Ilib` is `-I` with the directory `lib`,
   * not `-I -l -i -b`.
   */
  greedy: string;
  /**
   * Letters whose value is OPTIONAL and drawn from a RESTRICTED character set.
   * The consumer reports how many of the following characters belong to the
   * value; the letter run CONTINUES after them, because the first character
   * that cannot be part of the value is the next flag. `-lpi` is `-l -p -i`.
   */
  optional: Readonly<Record<string, (rest: string) => number>>;
}

/** An optional count glued to the letter: `perl -l7`, `perl -077`. */
function digitRun(rest: string): number {
  let n = 0;
  while (n < rest.length && rest[n] >= "0" && rest[n] <= "9") n++;
  return n;
}

/** `perl -V:configvar` — a value only when the next character is a colon. */
function colonSuffix(rest: string): number {
  return rest.startsWith(":") ? rest.length : 0;
}

/**
 * The two grammars, MEASURED against perl 5.34.1 and both seds rather than
 * inferred. The previous single-category version was checked only against the
 * flags it was written for (`-Ilib`, `-fscript.sed`) and not against the
 * clusters it changed, which is how it shipped allowing the everyday
 * `perl -lpi -e`. Each line below is the answer to a command that was actually
 * run — "does a trailing `i` in this cluster still rewrite the file?":
 *
 *   perl -lpi   MUTATES     `l` takes only digits, so `p` and `i` are flags
 *   perl -l7pi  MUTATES     the digit run is `l`'s value; `p` and `i` follow
 *   perl -0pi   MUTATES     same shape on the digit-led flag
 *   perl -Vpi   MUTATES     `V`'s value is a `:configvar` or nothing at all
 *   perl -Ipi   unchanged   `I` swallowed `pi` as an include directory
 *   perl -Cpi   unchanged   "Unknown Unicode option letter 'p'" — C's value
 *   perl -Dpi   unchanged   `D` takes a letter/number debug list
 *   perl -xpi   unchanged   "No Perl script found" — `x` took `pi` as a dir
 *   perl -mpi   unchanged   "Can't locate pi.pm" — `m`/`M` take a module name
 *   perl -Fpi / -epi / -Epi unchanged
 *
 * So `C`, `D` and `x` are greedy after all — a cluster like `perl -Ci` does
 * NOT edit in place, and denying it would be a false positive rather than the
 * restored protection it looks like.
 *
 * `sed`'s `l` is the one letter the two platforms disagree on, and the
 * disagreement is resolved toward DENY: BSD `-l` takes no value, so
 * `sed -li '' 's/a/b/' f` really does rewrite the file (measured: it does),
 * while GNU `-l` takes a mandatory N and swallows the `i` (measured: no
 * rewrite). Read as an optional-value letter the cluster denies — correct on
 * BSD, and on GNU a false positive on a command that edits nothing anyway.
 * That is the same no-platform-branch reasoning `-i` itself already carries.
 */
const SED_FLAG_GRAMMAR: ShortFlagGrammar = {
  // `-e script`, `-f file`. `-i[suffix]` is the letter being looked for and
  // its suffix is free text, so ending the run on it costs nothing.
  greedy: "efi",
  optional: { l: digitRun },
};

const PERL_FLAG_GRAMMAR: ShortFlagGrammar = {
  // `-C<list>`, `-D<list>`, `-e`/`-E <code>`, `-F<pattern>`, `-I<dir>`,
  // `-m`/`-M <module>`, `-x<dir>` — and `-i[suffix]`, as above.
  greedy: "CDeEFiImMx",
  optional: { l: digitRun, "0": digitRun, V: colonSuffix },
};

/**
 * The flag letters of a short-flag token, in order, with each letter's own
 * value SKIPPED rather than read as more letters.
 *
 *   -i.bak → `i`      -ni  → `ni`     -lpi  → `lpi`
 *   -Ilib  → `I`      -l7pi → `lpi`   -0pi  → `0pi`
 *
 * A greedy letter ends the run and is KEPT, so `-i.bak` still reports the `i`
 * that makes it in-place while `-Ilib` reports an `I` with no `i` after it.
 * That pair is the discriminator, and it is why one category will not do: no
 * single set of "value letters" gets both `perl -lpi` (deny) and `perl -Ilib`
 * (allow) right, because the two clusters need opposite answers about the
 * letter that follows.
 *
 * A leading DIGIT run is a value too, not the end of the token. The old
 * `/^-([A-Za-z]*)/` yielded the empty string for `-0pi` and never examined a
 * letter, so perl's `-0` form was invisible in both builds.
 */
function shortFlagLetters(flag: string, grammar: ShortFlagGrammar): string {
  if (!flag.startsWith("-") || flag.startsWith("--")) return "";
  let out = "";
  let i = 1;
  while (i < flag.length) {
    const ch = flag[i];
    const consume = row(grammar.optional, ch);
    if (consume !== undefined) {
      out += ch;
      i += 1 + consume(flag.slice(i + 1));
      continue;
    }
    // The rest of the token belongs to this letter, so no later character in
    // it is a flag.
    if (grammar.greedy.includes(ch)) return out + ch;
    // Anything that is neither a flag letter nor part of a value ends the run.
    if (!/^[A-Za-z]$/.test(ch)) return out;
    out += ch;
    i += 1;
  }
  return out;
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
export const MUTATION_VERBS: Readonly<Record<string, VerbSpec>> = {
  mv: { written: "all", targetDir: "adds" },
  rm: { written: "all" },
  cp: { written: "last", targetDir: "replaces" },
  // NOT exemptible — the alias verb; see `VerbSpec.exemptible`.
  ln: { written: "last", targetDir: "replaces", exemptible: false },
  install: {
    written: "last",
    targetDir: "replaces",
    valueFlags: ["-m", "-o", "-g"],
  },
  tee: { written: "all" },
  truncate: { written: "all", valueFlags: ["-s", "-r"] },
  dd: { written: "none", keyOperands: ["of"] },
  sed: {
    written: "all",
    valueFlags: ["-e", "-f", "-l"],
    mutatesOnlyWhen: isSedInPlaceFlag,
  },
  perl: {
    written: "all",
    valueFlags: ["-e", "-f"],
    mutatesOnlyWhen: isPerlInPlaceFlag,
  },
};

/** `git clean` refuses to delete anything without `-f` / `--force`. */
function isGitCleanForceFlag(flag: string): boolean {
  if (flag.startsWith("--")) return flag === "--force";
  return /^-[A-Za-z]*f/.test(flag);
}

/**
 * `git restore --source=<commit>` reads the file from an arbitrary commit
 * rather than from the index, which makes it a different operation wearing the
 * revert strategy's name.
 */
function isGitRestoreSourceFlag(flag: string): boolean {
  return flag === "-s" || flag === "--source" || flag.startsWith("--source=");
}

/**
 * Mutating `git` subcommands — the tree-writing half of git, since the branch
 * question belongs to `git-branch-guard.ts`.
 *
 * The three added rows were in neither the table nor the residual list, which
 * is the state a reader cannot tell a deliberate omission from a forgotten one
 * in
 * (`issues/260801-1902_c_git-clean-restore-and-stash-mutate-protected-paths-and-are-in-neither-the-table-nor-the-residual-list.md`).
 *
 * `mv` and `rm` are the unconditional rows. The other three write the working
 * tree only under a flag, and the flag is what separates them from the form
 * fusion depends on:
 *
 *   - `clean` mutates with `-f`, refuses without it, so `git clean -n rules`
 *     (a dry run, a read) allows and `git clean -fdx rules` denies. `-e` takes
 *     the exclude PATTERN as its value and must not become a positional, or
 *     `git clean -fdx -e rules/keep .` would deny on the pattern it is told to
 *     spare.
 *   - `restore` bare is `git checkout -- <paths>` under its modern name —
 *     fusion's own revert strategy, which MUST stay allowed, as must
 *     `git restore --staged <paths>`, which writes only the index. With
 *     `--source=<commit>` it overwrites the working tree from anywhere in
 *     history, which the revert strategy's permission does not cover.
 *   - `stash` is a FAMILY, and it gets the sub-subcommand table it looked like
 *     it could do without (`GIT_STASH`). Only `push` names working-tree paths.
 *     Reading every positional of every form instead put the sub-subcommand
 *     word itself in the written set, on the theory that `pop` is "a path that
 *     matches nothing" — true only at the project root, and only for a word
 *     that collides with no pattern. From inside a protected directory
 *     `cd hooks && git stash pop` resolved `pop` to `hooks/pop` and denied,
 *     and a message or a ref (`git stash push -m "$MSG"`,
 *     `git stash show "$REF"`) reached the fail-closed pass as an unresolvable
 *     write
 *     (`issues/260801-1956_c_the-git-stash-row-reads-its-sub-subcommand-and-refs-as-written-paths.md`).
 *
 * What is deliberately NOT here: `git apply` and `git am`, whose targets are
 * named inside the patch file rather than on the command line. Reading a patch
 * is out of scope for a text classifier, so they sit in the residual list next
 * to `patch`.
 *
 * A bare `git clean -fdx` used to sit there too, and it took TWO corrections to
 * get it out. The first reading was that it "names no directory the ancestor
 * check can compare, exactly as `rm -rf *` does not". That was wrong about git
 * rather than about the check: with no pathspec, `clean` deletes from the
 * CURRENT DIRECTORY down, not from the repository root. Measured at git 2.49.0 —
 * `cd rules && git clean -fdx` removed `rules/junk.txt` and left the root's and
 * `build`'s alone. So the operand it does not spell is `.`, which the ancestor
 * check compares perfectly well once the model supplies it (`gitCleanWrites`).
 *
 * The correction then claimed the residual was gone while a plain `git clean
 * -fdx` AT THE PROJECT ROOT still deleted every untracked file in the tree and
 * allowed, because the ancestor check excludes the root (`260804-1346`). That
 * half is closed by `VerbSpec.writesThrough`, which is where the cost of closing
 * it is stated. `rm -rf *` stays a residual: a glob is matched as literal text
 * and names no directory at all.
 */
/**
 * `git stash push [-m <msg>] [--] [<pathspec>…]` — the only stash form that
 * names working-tree paths. `-m`/`--message` must take its value the way
 * `git clean`'s `-e` does, or a commit message becomes a positional and every
 * `git stash push -m "$MSG"` denies fail-closed on the message.
 * `--pathspec-from-file <file>` READS that file; it is a value flag for the
 * same reason and its contents are a residual, as `git apply`'s patch is.
 */
const GIT_STASH_PUSH: VerbSpec = {
  written: "all",
  valueFlags: ["-m", "--message", "--pathspec-from-file"],
};

/** A stash form whose operands are a ref, a message or a branch — never a path. */
const NAMES_NO_PATH: VerbSpec = { written: "none" };

/**
 * The stash family, measured against git 2.53.0 rather than assumed:
 *
 *   git stash -- rules/x.md   stashed rules/x.md and left other.txt alone,
 *                             so the bare form with a pathspec IS `push`
 *   git stash foo             "fatal: subcommand wasn't specified; 'push'
 *                             can't be assumed due to unexpected token 'foo'"
 *
 * That second line is why an unrecognised bare word writes nothing: git
 * refuses the command outright rather than treating the word as a pathspec.
 * Every non-`push` form was run with a path operand and git refused all of
 * them — `git stash pop rules/x.md` and friends leave the file untouched.
 *
 * `save` takes a MESSAGE, not pathspecs: `git stash save rules/x.md` stashes
 * the whole tree under the message `rules/x.md`. It and a bare `git stash` DO
 * revert protected paths, wholesale — but they name nothing the ancestor check
 * can compare, which is the same residual as `git clean -fdx` with no operand
 * and the reason `git stash` itself has always been allowed.
 *
 * A sub-subcommand that is NOT a literal (`git stash $X …`) could be `push`,
 * so it is fail-closed rather than assumed benign.
 */
const GIT_STASH: SubcommandDispatch = {
  implicit: GIT_STASH_PUSH,
  table: {
    push: GIT_STASH_PUSH,
    save: NAMES_NO_PATH,
    pop: NAMES_NO_PATH,
    apply: NAMES_NO_PATH,
    list: NAMES_NO_PATH,
    show: NAMES_NO_PATH,
    drop: NAMES_NO_PATH,
    clear: NAMES_NO_PATH,
    branch: NAMES_NO_PATH,
    create: NAMES_NO_PATH,
    store: NAMES_NO_PATH,
  },
};

/**
 * `git clean`'s written paths — its pathspecs, or the directory it is standing
 * in when it has none.
 *
 * The implicit `.` is the whole reason this row has a model. `git -C rules
 * clean -fdx` and `cd rules && git clean -fdx` both delete every untracked file
 * under a protected directory while naming no operand at all, and until the
 * `.` is supplied there is nothing for the ancestor check to compare.
 *
 * At the project root that `.` resolves to the root, which `ancestorOfProtected`
 * excludes — and for a whole Turn this docstring read that as the everyday
 * `git clean -fdx` being safely unaffected. It is not: the command deletes every
 * untracked file in the tree, protected directories included, which is exactly
 * the rule file an agent has just written under `FUSION_ALLOW_RULES_WRITE` and
 * not yet committed (`260804-1346`). The row carries `writesThrough` for it, so
 * the exclusion is lifted here and nowhere else, and a plain `git clean -fdx` at
 * the project root now denies. The cost is stated on `VerbSpec.writesThrough`.
 *
 * `mutatesOnlyWhen` has already answered before this runs, so a dry run never
 * reaches it and `git clean -n` still names nothing.
 */
function gitCleanWrites(positionals: Positionals): string[] {
  return positionals.values.length > 0 ? positionals.values : ["."];
}

/**
 * The one tree-ish `git checkout` may name and still write nothing an agent
 * could not have obtained by leaving the file alone.
 *
 * `git checkout HEAD -- rules/x.md` restores the file to its COMMITTED state.
 * That is fusion's own revert strategy — the orchestrator undoes an agent's
 * out-of-scope edit with it, and `rules/protected-path-discipline.md` promises
 * in every consuming project's agent context that it is allowed. Any OTHER
 * tree-ish writes content from somewhere else over the same path:
 * `git checkout HEAD~5 -- rules/x.md` and `git checkout otherbranch --
 * rules/x.md` are content writes, and their modern spelling
 * (`git restore --source=HEAD~1 rules/x.md`) has always denied.
 *
 * ONLY THE LITERAL SPELLING IS PROVEN INERT, and the set of spellings that
 * denote the same commit is open: `@`, `HEAD~0`, `HEAD^0`, `refs/heads/<the
 * current branch>` and the branch's own name all deny. That is the safe
 * direction — a spelling this test does not recognise is treated as a named
 * source — and the way through a wrong deny is the documented form.
 */
const GIT_CHECKOUT_INERT_TREEISH = "HEAD";

/**
 * `git checkout`'s written paths.
 *
 * The grammar this reads, measured against git 2.49.0 rather than assumed:
 *
 *   git checkout <treeish> -- <paths>   writes <paths> from <treeish>
 *   git checkout -- <paths>             writes <paths> from the INDEX
 *   git checkout <paths>                the same, when no <paths> is a rev
 *   git checkout <treeish> <paths>      writes <paths>, when the first IS a rev
 *   git checkout <branch>               moves HEAD — the branch policy's
 *                                       business (`git-branch-guard.ts`), and
 *                                       it writes no named path
 *
 * Restoring from the index is `git restore rules/x.md` under another name and
 * has always been allowed, so a form that names NO tree-ish writes nothing
 * here. A form that names one writes its paths — unless the tree-ish is the
 * literal `HEAD`, which is the revert strategy above.
 *
 * WITHOUT `--` THE FIRST POSITIONAL IS READ AS THE TREE-ISH, because git reads
 * it that way whenever it resolves as a rev and this classifier cannot ask.
 * The cost is a false deny rather than a false allow:
 * `git checkout rules/a.md rules/b.md` denies on the second path although both
 * are paths. The way through is the documented spelling,
 * `git checkout HEAD -- rules/a.md rules/b.md`, which allows.
 */
function gitCheckoutWrites(
  positionals: Positionals,
  literals: Map<string, string>,
): string[] {
  const { values, endOfFlagsAt } = positionals;

  // With `--`, the tree-ish is whatever stands before it: `git checkout --
  // <paths>` names none, and `git checkout <treeish> -- <paths>` names one.
  // Without it, a lone positional is a branch or a path and either way writes
  // nothing this classifier should name.
  const treeishCount = endOfFlagsAt ?? Math.min(values.length, 1);
  if (treeishCount === 0) return [];
  if (values.length <= treeishCount) return [];

  const treeish = values[treeishCount - 1];
  const resolved = resolveWord(treeish, literals);
  // An unresolvable tree-ish (`git checkout $REF -- rules/x.md`) may be any
  // commit, so it is not the one spelling that is inert.
  if (resolved.unresolved !== true && resolved.value === GIT_CHECKOUT_INERT_TREEISH) {
    return [];
  }
  return values.slice(treeishCount);
}

export const MUTATION_GIT_SUBCOMMANDS: Readonly<Record<string, VerbSpec>> = {
  mv: { written: "all" },
  rm: { written: "all" },
  clean: {
    written: "all",
    positionalModel: gitCleanWrites,
    valueFlags: ["-e", "--exclude"],
    mutatesOnlyWhen: isGitCleanForceFlag,
    writesThrough: true,
  },
  restore: {
    written: "all",
    valueFlags: ["-s", "--source"],
    mutatesOnlyWhen: isGitRestoreSourceFlag,
    writesThrough: true,
  },
  // The same operation as `restore --source=`, in the spelling that predates
  // it. `-b`/`-B`/`--orphan` name a NEW BRANCH and `--conflict`/
  // `--pathspec-from-file` take values, so none of their arguments may be read
  // as a positional — `git checkout -b feature rules/x.md` would otherwise read
  // `feature` as the tree-ish and deny on a command that creates a branch.
  // A `--pathspec-from-file` list is a residual for the same reason `git
  // apply`'s patch is: the paths are in the file, not on the command line.
  checkout: {
    written: "all",
    positionalModel: gitCheckoutWrites,
    valueFlags: ["-b", "-B", "--orphan", "--conflict", "--pathspec-from-file"],
    writesThrough: true,
  },
  stash: { written: "none", subcommands: GIT_STASH },
};

/* ------------------------------------------------------------------ *
 * Deny reasons
 * ------------------------------------------------------------------ */

const NO_WORKAROUND =
  " Do not rephrase the command — the guard segments compound commands and " +
  "inspects subshells — and do not re-route through Edit or Write, which are " +
  "guarded on the same list. STOP and ask the user.";

/**
 * A caller's explanation of why its exemption refused this operand, placed
 * BEFORE `NO_WORKAROUND` so the reader meets the cause before the instruction.
 * Empty when there is no exemption in play, which is every deny in a project
 * that sets no override.
 */
function refusal(note: string | null): string {
  return note === null ? "" : ` ${note}`;
}

function protectedReason(
  segment: string,
  path: string,
  refusalNote: string | null,
): string {
  return (
    `fusion policy: this Bash command writes a protected path. The segment ` +
    `\`${segment}\` writes \`${path}\`, which is under compliance guard ` +
    `protection.` +
    refusal(refusalNote) +
    NO_WORKAROUND
  );
}

function ancestorReason(
  segment: string,
  path: string,
  pattern: string,
  refusalNote: string | null,
): string {
  return (
    `fusion policy: this Bash command writes a directory that CONTAINS a ` +
    `protected path. The segment \`${segment}\` writes \`${path}\`, which ` +
    `contains \`${pattern}\` — under compliance guard protection. Removing or ` +
    `moving the directory would take the protected path with it.` +
    refusal(refusalNote) +
    NO_WORKAROUND
  );
}

/**
 * The ancestor deny for a verb that walks INTO the directory instead of writing
 * it. `ancestorReason` says "removing or moving the directory would take the
 * protected path with it", which is what `rm -rf hooks` does and is not what
 * `git checkout HEAD~1 -- .` does — that one leaves every directory exactly
 * where it is and replaces the contents. An agent told the wrong mechanism
 * reaches for the wrong way through.
 *
 * The way through is named because the deny is otherwise unactionable: this is
 * the one row where the operand is a whole subtree and the alternative is
 * spelling the files out. See `VerbSpec.writesThrough`.
 */
function writesThroughReason(
  segment: string,
  path: string,
  pattern: string,
  refusalNote: string | null,
): string {
  return (
    `fusion policy: this Bash command writes THROUGH a directory that holds ` +
    `protected paths. The segment \`${segment}\` rewrites or deletes every ` +
    `path under \`${path}\`, which holds \`${pattern}\` — under compliance ` +
    `guard protection. Naming a directory does not bound what is written ` +
    `inside it, so name the files themselves instead.` +
    refusal(refusalNote) +
    NO_WORKAROUND
  );
}

function unresolvedReason(segment: string, token: string): string {
  return (
    `fusion policy: this Bash command mutates a file whose target cannot be ` +
    `resolved before it runs. The segment \`${segment}\` writes \`${token}\`, ` +
    `which the guard cannot prove is outside the protected paths, so it is ` +
    `denied (fail-closed). If the target is genuinely unprotected, write the ` +
    `path out literally instead of building it at run time.` +
    NO_WORKAROUND
  );
}

/**
 * The operand is a perfectly ordinary relative path; it is the DIRECTORY it
 * hangs off that the guard lost track of. Saying so is the difference between
 * an agent rewriting the path (which cannot help) and dropping the `cd` (which
 * does).
 */
function unknownCwdReason(segment: string, token: string): string {
  return (
    `fusion policy: this Bash command mutates a relative path from a working ` +
    `directory the guard cannot determine. An earlier \`cd\` in this command ` +
    `moved somewhere only known at run time, so the segment \`${segment}\` ` +
    `writes \`${token}\` at an unknowable location and it is denied ` +
    `(fail-closed). Name the target as an absolute path, or drop the \`cd\` ` +
    `and write the path from the project root.` +
    NO_WORKAROUND
  );
}

/**
 * The same fail-closed deny, for the cause that is visible in the command and
 * still unfindable: a `cd` the shell never promised to have made.
 *
 * `unknownCwdReason` would say "an earlier `cd` moved somewhere only known at
 * run time", and in `cd build; rm out.js` that reads as a bug — the `cd`'s
 * operand is a literal, and rewriting it changes nothing. The unknown is not
 * WHERE the `cd` went but WHETHER the shell went there: after `;`, `||`, `|`,
 * `&` or a newline bash runs the next segment from where it never left, so a
 * `cd` to a directory that does not exist leaves the write at the project root
 * — which is how `cd nonexistent; rm rules/x.md` deleted a protected rule.
 *
 * So this reason names the separator, and names `&&` as the way through, since
 * that is the one form the guard can follow exactly and it is also the form
 * that makes the command correct in the shell.
 */
function unprovenCdReason(segment: string, token: string): string {
  return (
    `fusion policy: this Bash command mutates a relative path after a \`cd\` ` +
    `the shell does not guarantee succeeded. Only \`&&\` guarantees it — after ` +
    `\`;\`, \`||\`, \`|\`, \`&\` or a newline bash runs the rest of the command ` +
    `from wherever it never left, so the segment \`${segment}\` writes ` +
    `\`${token}\` at one of two places and the guard cannot tell which ` +
    `(fail-closed). Join the \`cd\` to what follows it with \`&&\` — which is ` +
    `also what makes the command correct in the shell — or name the target as ` +
    `an absolute path.` +
    NO_WORKAROUND
  );
}

/**
 * The same fail-closed deny, for a cause that is in the command and is not a
 * `cd`.
 *
 * `git -C $D rm build/out.js` and `git --work-tree=$W clean -fdx` lose the
 * working directory to a git OPTION. `unknownCwdReason` would tell the reader to
 * drop the `cd`, and there is none to drop; for the `clean` row it would also
 * name `.` as the thing being written, which is the model's implicit pathspec
 * and appears nowhere in the command either. So this reason names neither: it
 * names the two flags that can cause it and the two things that clear it.
 *
 * Constraint from `issues/260804-1347_…`: the reason must not send an agent
 * looking for a construct the command does not contain. The suite asserts the
 * absence of the `cd` string, not only the presence of the flags.
 */
function gitDirectoryReason(segment: string): string {
  return (
    `fusion policy: this \`git\` invocation names its own working directory ` +
    `with a \`-C\` or \`--work-tree\` whose value the guard cannot resolve ` +
    `before the command runs, so it cannot place the paths the segment ` +
    `\`${segment}\` writes and the command is denied (fail-closed). Write the ` +
    `directory out literally, or name the written path as an absolute path.` +
    NO_WORKAROUND
  );
}

/**
 * The same fail-closed deny, for the one cause that is NOWHERE IN THE COMMAND.
 *
 * `unknownCwdReason` tells the reader an earlier `cd` moved somewhere unknown,
 * which is true here too and useless: with `CDPATH` set in the profile the
 * `cd` looks entirely ordinary, every operand in the command is a literal, and
 * a reader following that advice rewrites a command that was never the problem.
 * So this one names the variable, and names the two things that actually clear
 * it. Constraint from
 * `decisions/260803-1803_*_should-the-guard-degrade-its-working-directory-model-when-cdpath-is-set-in-the-ambient-environment.md`:
 * the deny reason has to name `CDPATH` as the cause.
 */
function ambientCdpathReason(segment: string, token: string): string {
  return (
    `fusion policy: CDPATH is set in this shell's environment, so the guard ` +
    `cannot determine the working directory. Bash searches CDPATH for a ` +
    `BARE-WORD \`cd\` operand and lands on the first entry that has it, which ` +
    `need not be the current directory — so an earlier \`cd\` in this command ` +
    `may have moved anywhere on that list, and the segment \`${segment}\` ` +
    `writes \`${token}\` at an unknowable location (fail-closed). Two things ` +
    `clear it: anchor the \`cd\` operand (\`./x\`, \`../x\` or an absolute ` +
    `path — CDPATH is not consulted for any of those), or unset CDPATH in the ` +
    `environment. Rewriting the operand that is named here will not, because ` +
    `it is the directory it hangs off that is unknown.` +
    NO_WORKAROUND
  );
}

/* ------------------------------------------------------------------ *
 * Redirection scanning
 * ------------------------------------------------------------------ */

/**
 * Output redirection operators: `>>`, `>|`, `>`. Input (`<`) is irrelevant, and
 * `&>` / `>&` never survive segmentation — `shell-parse` treats `&` as a
 * segment separator, so `2>&1` arrives as a dangling `2>` at the end of one
 * segment and a bare `1` at the head of the next.
 */
const REDIRECT_RE = />>|>\|?/;

/** A redirection target that names no file: `2>&1`'s leftovers, `>&2`, `> -`. */
function isSkippedRedirectTarget(target: string): boolean {
  return target.length === 0 || target === "-" || /^\d+$/.test(target);
}

/** A segment's ordinary words with its output-redirection targets lifted out. */
interface SegmentWords {
  /** Command word, flags and positionals — redirections removed. */
  words: string[];
  /** Raw target tokens of output redirections, skip-forms already dropped. */
  redirectTargets: string[];
}

/**
 * Split a segment's tokens into ordinary words and redirection targets.
 *
 * Redirections are lifted OUT of the word list so a target is never also
 * counted as a positional of the verb (`rm a > b` must not read `b` as
 * something `rm` deletes).
 *
 * Two forms are SKIPPED rather than denied: a bare file-descriptor number as
 * the target, and a target of `-`.
 *
 * ## The dangling operator, and why `2>&1` must not deny
 *
 * `shell-parse` replaces `&` and `|` with segment boundaries, so an operator
 * whose target sat behind one is left dangling at the end of its segment and
 * the target becomes the HEAD of the next segment:
 *
 *   `echo hi 2>&1 >/tmp/log`  →  `echo hi 2>` + `1 >/tmp/log`
 *   `echo err >&2`            →  `echo err >` + `2`
 *   `echo hi >| rules/x.md`   →  `echo hi >`  + `rules/x.md`
 *
 * A scanner that denied "an operator with no target" would deny `2>&1`, which
 * agents run constantly — a false positive on nearly every shell call. A
 * scanner that ignored the dangling operator outright would miss `>|` and
 * `>&file`. So the dangling operator adopts `nextSegmentHead` (the first token
 * of the following SAME-DEPTH segment) as its target, where the two fd forms
 * fall out as skips on their own: their head is the bare number `1` / `2`.
 * With no following same-depth segment there is nothing to adopt and the
 * operator is skipped.
 */
function scanSegment(tokens: string[], nextSegmentHead?: string): SegmentWords {
  const words: string[] = [];
  const redirectTargets: string[] = [];

  const pushTarget = (target: string): void => {
    if (!isSkippedRedirectTarget(target)) redirectTargets.push(target);
  };

  for (let i = 0; i < tokens.length; i++) {
    let rest = tokens[i];

    while (rest.length > 0) {
      const m = REDIRECT_RE.exec(rest);
      if (m === null) {
        words.push(rest);
        break;
      }

      // Text before the operator is an ordinary word fragment, minus any file
      // descriptor number glued to the operator (`2>`, `1>>`).
      const before = rest.slice(0, m.index).replace(/\d+$/, "");
      if (before.length > 0) words.push(before);

      const after = rest.slice(m.index + m[0].length);
      if (after.length === 0) {
        // Separated form: the target is the next token — or, when the operator
        // dangles at the end of the segment, the head of the next one.
        const hasOwn = i + 1 < tokens.length;
        const next = hasOwn ? tokens[i + 1] : nextSegmentHead;
        if (next !== undefined) {
          pushTarget(next);
          if (hasOwn) i++; // consumed: a target is not an operand word
        }
        break;
      }

      // Glued form (`>file`). The target runs to the next operator, if any.
      const m2 = REDIRECT_RE.exec(after);
      if (m2 === null) {
        pushTarget(after);
        break;
      }
      pushTarget(after.slice(0, m2.index));
      rest = after.slice(m2.index);
    }
  }

  return { words, redirectTargets };
}

/* ------------------------------------------------------------------ *
 * Verb recognition and operand roles
 * ------------------------------------------------------------------ */

/** `-t DIR`, `--target-directory DIR`, `--target-directory=DIR`. */
function isTargetDirFlag(token: string): boolean {
  return (
    token === "-t" ||
    token === "--target-directory" ||
    token.startsWith("--target-directory=")
  );
}

/** A `git` invocation, resolved past git's own global options. */
interface GitInvocation {
  spec: VerbSpec;
  /** The subcommand's own arguments. */
  args: string[];
  /**
   * The `-C <dir>` values in source order. Cumulative and each relative to the
   * last, measured against git 2.49.0: `git -C rules -C ../agents rm coder.md`
   * deleted `agents/coder.md`.
   */
  chdirs: string[];
  /**
   * The last `--work-tree` value, relative to the `-C` directory. Also measured:
   * `git -C sub --work-tree=../rules clean -fdx` deleted `rules/x.md`.
   */
  workTree?: string;
}

/**
 * Locate a mutating `git` subcommand past the global options that can precede
 * it, and RECORD the ones that say where git runs.
 *
 * The recording is the whole point. This walk used to step over `-C <dir>` and
 * `--work-tree=<dir>` and keep neither, so the subcommand's relative operands
 * were then resolved against the shell's directory instead of git's:
 * `git -C rules rm x.md` deleted a protected rule and allowed, and
 * `git --work-tree=rules clean -fdx` deleted it too
 * (`issues/260804-1024_…`). Both were measured deleting, in bash and zsh.
 *
 * `--git-dir` is skipped and NOT recorded, and the asymmetry is the measured
 * one: it names where the repository METADATA lives and moves no pathspec.
 * With `--work-tree` absent, `git --git-dir=.git rm rules/x.md` resolves
 * `rules/x.md` from the shell's directory exactly as a bare `git rm` does.
 *
 * ## An unrecognised option consumes a value, and the walk RESUMES past it
 *
 * A global option this walk does not know consumes a value used to hide the
 * subcommand behind it: `git --namespace foo rm rules/x.md` deleted a protected
 * rule, because `foo` landed in subcommand position, matched no row, and the
 * invocation read as an unrecognised program. That is not a `--namespace` bug —
 * it is the shape of every option the table does not carry, including ones git
 * has not shipped yet.
 *
 * The first answer to it read two adjacent words as subcommand candidates, and
 * that closed the measured instance rather than the class: the walk still
 * STOPPED at the unknown option's value, so every global option standing behind
 * that value was invisible. `git --namespace foo -C rules rm x.md` deleted a
 * rule file and allowed, because the `-C rules` in the middle — the fact that
 * makes the write land on the protected list — was three words past where the
 * walk gave up (`issues/260804-1344_…`, measured deleting in bash and zsh).
 *
 * So the walk resumes instead. A bare word is tested against the subcommand
 * table; if it matches, that is the invocation. If it does not and an
 * unrecognised option stands in front of it, it is that option's VALUE, and the
 * walk continues from the next index — recording any `-C` and `--work-tree` it
 * then meets. If it does not match and no unrecognised option stands in front
 * of it, it is git's real subcommand and it is not a mutating row, so the
 * invocation writes nothing.
 *
 * ## What this preserves, and what it costs
 *
 * The property `613d6fd` rests on survives, and survives structurally rather
 * than by luck: a resumed walk can only find MORE directories and try MORE
 * subcommand candidates than a walk that stopped, so it can only add a deny.
 * The old candidate set is a subset of the new one — the two adjacent indices
 * are still both tested, because a flag word can never match a row name.
 *
 * The cost is unchanged in kind: a false deny of the shape `git <unknown-opt>
 * <non-subcommand> <mutation-verb> <protected>` — `git --no-pager diff rm
 * rules/x.md`, where `rm` is a file. The class is open; the shape is not
 * special to `diff`.
 *
 * THE BOUND, stated because "the class is closed" is the claim that was wrong
 * last time. What is closed is every well-formed invocation in which each
 * unrecognised global option takes at most ONE separated value. An option
 * taking two would still hide what follows it — and so would a second bare word
 * standing between the value and the subcommand (`git --namespace foo bar -C
 * rules rm x.md`), which resolves to nothing here. Neither is a fail-open in
 * practice, because git itself reads that second bare word as the subcommand
 * and refuses the command, but neither is proven closed and neither is claimed
 * to be.
 */
function resolveGit(args: string[]): GitInvocation | null {
  const chdirs: string[] = [];
  let workTree: string | undefined;
  /** Did an option this walk could not name stand immediately before `i`? */
  let unknownOption = false;
  let i = 0;

  while (i < args.length) {
    const t = args[i];

    if (t.startsWith("-")) {
      // Cleared by every option the walk CAN name; set again below for one it
      // cannot, so the flag is still remembered when the next bare word arrives.
      unknownOption = false;
      if (t === "-C") {
        if (i + 1 < args.length) chdirs.push(args[i + 1]);
        i += 2;
        continue;
      }
      if (t === "-c") {
        i += 2;
        continue;
      }
      if (t.startsWith("--git-dir")) {
        i += t.includes("=") ? 1 : 2;
        continue;
      }
      if (t.startsWith("--work-tree")) {
        const eq = t.indexOf("=");
        if (eq !== -1) {
          workTree = t.slice(eq + 1);
          i += 1;
        } else {
          if (i + 1 < args.length) workTree = args[i + 1];
          i += 2;
        }
        continue;
      }
      unknownOption = true;
      i += 1;
      continue;
    }

    // A bare word: git's subcommand, or the value an unrecognised option ate.
    const spec = row(MUTATION_GIT_SUBCOMMANDS, t);
    if (spec !== undefined) {
      return { spec, args: args.slice(i + 1), chdirs, workTree };
    }
    // No unrecognised option in front of it, so this word IS the subcommand and
    // it is not one this classifier writes for. Stopping here is what keeps the
    // walk out of the subcommand's OWN arguments, where a `-C` means something
    // else entirely (`git commit -C HEAD~1` reuses a message).
    if (!unknownOption) return null;
    unknownOption = false;
    i += 1;
  }
  return null;
}

/** Apply a verb's operand roles to its arguments, returning the WRITTEN tokens. */
function writtenOperands(
  spec: VerbSpec,
  args: string[],
  literals: Map<string, string>,
): string[] {
  if (spec.subcommands !== undefined) {
    const first = args[0];
    // No sub-subcommand WORD: `git stash`, `git stash -u`, `git stash -- <p>`.
    // A flag cannot select a row, and `--` introduces the implicit form's
    // pathspecs, so both fall through to `implicit` with their args intact.
    if (first === undefined || first.startsWith("-")) {
      return writtenOperands(spec.subcommands.implicit, args, literals);
    }
    const nested = row(spec.subcommands.table, first);
    if (nested !== undefined) return writtenOperands(nested, args.slice(1), literals);
    // An unrecognised BARE WORD is not a sub-subcommand, and git will not read
    // it as a pathspec either — it refuses the whole command ("'push' can't be
    // assumed due to unexpected token"). Nothing is written, so treating the
    // word as a path would deny on a typo, which is the bug this table fixes.
    if (/^[A-Za-z][A-Za-z-]*$/.test(first)) return [];
    // A sub-subcommand built AT RUN TIME is a different matter: `git stash $X
    // rules/x.md` may well be `push`, and reading it as "not push" would be
    // guessing in the direction that loses the deny. Fail closed on the word,
    // and read the rest as the implicit form so a visible protected pathspec
    // still names the deny rather than the variable.
    return [first, ...writtenOperands(spec.subcommands.implicit, args.slice(1), literals)];
  }

  if (spec.keyOperands !== undefined) {
    const out: string[] = [];
    for (const a of args) {
      const eq = a.indexOf("=");
      if (eq <= 0) continue;
      if (spec.keyOperands.includes(a.slice(0, eq))) out.push(a.slice(eq + 1));
    }
    return out;
  }

  const positionals: string[] = [];
  let targetDir: string | undefined;
  let mutates = false;
  let endOfFlags = false;
  /** How many positionals the first `--` preceded; null while none was seen. */
  let endOfFlagsAt: number | null = null;

  for (let i = 0; i < args.length; i++) {
    const a = args[i];

    if (endOfFlags) {
      positionals.push(a);
      continue;
    }
    if (a === "--") {
      endOfFlags = true;
      endOfFlagsAt = positionals.length;
      continue;
    }
    // Asked FIRST, and of every flag token, because the flag that turns a verb
    // into a mutation can also be the flag that takes a value: `git restore
    // --source HEAD~1 rules/x.md` is a mutation whose `--source` is consumed by
    // the branch below and would otherwise never be seen.
    if (a.length > 1 && a.startsWith("-") && spec.mutatesOnlyWhen?.(a) === true) {
      mutates = true;
    }
    if (spec.targetDir !== undefined && isTargetDirFlag(a)) {
      const eq = a.indexOf("=");
      if (eq !== -1) targetDir = a.slice(eq + 1);
      else if (i + 1 < args.length) targetDir = args[++i];
      continue;
    }
    if (spec.valueFlags !== undefined && spec.valueFlags.includes(a)) {
      i++; // the flag's value is not a positional
      continue;
    }
    if (a.length > 1 && a.startsWith("-")) continue;
    positionals.push(a);
  }

  // A verb that only mutates under a flag is not a mutation without it.
  if (spec.mutatesOnlyWhen !== undefined && !mutates) return [];

  // A positional ROLE model answers instead of `written`. It runs after the
  // flag walk so it sees the same positionals every other row does, and after
  // `mutatesOnlyWhen` so the two are composable rather than exclusive.
  if (spec.positionalModel !== undefined) {
    const modelled = spec.positionalModel({ values: positionals, endOfFlagsAt }, literals);
    return targetDir === undefined ? modelled : [...modelled, targetDir];
  }

  let written: string[];
  if (spec.written === "all") written = positionals;
  else if (spec.written === "last")
    written = positionals.length > 0 ? [positionals[positionals.length - 1]] : [];
  else written = [];

  if (targetDir !== undefined) {
    written =
      spec.targetDir === "adds" ? [...written, targetDir] : [targetDir];
  }

  return written;
}

/** A verb's written operands, plus whether a caller's exemption may waive them. */
interface VerbWrites {
  written: string[];
  exemptible: boolean;
  /**
   * Directories the INVOCATION redirects its own operands to, as raw tokens —
   * `git -C rules rm x.md` writes `rules/x.md` and not `x.md`. Empty for every
   * verb but `git`, and composed into candidate working directories by
   * `gitRedirectedBases` at the point where the segment's own directory is
   * known. See `GitInvocation`.
   */
  chdirs: string[];
  workTree?: string;
  /** The verb writes every path BENEATH its operands. See `VerbSpec.writesThrough`. */
  writesThrough: boolean;
}

/** Nothing recognised: no operands, and exemptibility is moot. */
const WRITES_NOTHING: VerbWrites = {
  written: [],
  exemptible: true,
  chdirs: [],
  writesThrough: false,
};

/**
 * The written operands named by the segment's verb, if it recognises one.
 *
 * The command word — behind any env assignments, shell grammar and wrapper
 * programs — is resolved by `command-word.ts`, which the git classifier shares.
 * An unrecognised program (including a command word that is itself an
 * expansion) names no row and therefore writes nothing this classifier can see.
 */
function verbOperands(
  words: string[],
  literals: Map<string, string>,
): VerbWrites {
  const invocation = resolveInvocation(words, literals);
  if (invocation === null) return WRITES_NOTHING;
  const { name, args } = invocation;

  if (name === "git") {
    const git = resolveGit(args);
    if (git === null) return WRITES_NOTHING;
    return {
      written: writtenOperands(git.spec, git.args, literals),
      exemptible: git.spec.exemptible !== false,
      chdirs: git.chdirs,
      workTree: git.workTree,
      writesThrough: git.spec.writesThrough === true,
    };
  }

  const spec = row(MUTATION_VERBS, name);
  if (spec === undefined) return WRITES_NOTHING;
  return {
    written: writtenOperands(spec, args, literals),
    exemptible: spec.exemptible !== false,
    chdirs: [],
    writesThrough: spec.writesThrough === true,
  };
}

/* ------------------------------------------------------------------ *
 * Path resolution and matching
 * ------------------------------------------------------------------ */

/**
 * Is `path` under compliance guard protection?
 *
 * `matchesAnyFolded` — the match is case-insensitive, the same way the write
 * tools' CHECK 2 is. `rm AGENTS/coder.md` deleted `agents/coder.md` on any
 * case-insensitive filesystem while `rm agents/coder.md` denied. Both surfaces
 * fold or neither does: a fold on the write tools alone would teach an agent
 * that the way past a deny is to reach for Bash, which is the failure
 * `rules/protected-path-discipline.md` exists to prevent.
 */
function isProtected(path: string, opts: MutationOptions): boolean {
  if (matchesAnyFolded(path, opts.protectedPaths)) return true;
  // The operand may name a DIRECTORY whose contents are protected:
  // `rm -rf fusion-workbench/.guard-state` must match
  // `fusion-workbench/.guard-state/**`, which needs the trailing separator.
  if (!path.endsWith("/") && matchesAnyFolded(path + "/", opts.protectedPaths)) {
    return true;
  }
  return false;
}

/**
 * A pattern's glob-free leading path segments. `agents/**` → `agents`;
 * `hooks/config.json` → itself; a pattern whose FIRST segment is a glob yields
 * the empty string, because nothing about where it lives is known statically.
 *
 * Truncation is on a SEGMENT boundary, not at the first metacharacter, so
 * `rules/*.md` yields `rules` rather than `rules/`.
 */
function literalPrefix(pattern: string): string {
  const kept: string[] = [];
  for (const part of pattern.split("/")) {
    if (/[*?[]/.test(part)) break;
    kept.push(part);
  }
  return kept.join("/");
}

/** Drop a trailing separator so `hooks/` and `hooks` compare alike. */
function withoutTrailingSlash(path: string): string {
  return path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;
}

/**
 * Does this operand name a directory that CONTAINS a protected path? Returns
 * the protected pattern it contains, so the deny reason can name it.
 *
 * `rm -rf hooks` destroys `hooks/config.json` and `mv hooks /tmp` moves it
 * beyond the guard's reach, yet neither operand matches a protected pattern.
 * Comparison is against each pattern's literal prefix and on a path-segment
 * boundary, so `rules-draft` is not read as an ancestor of `rules/**`.
 *
 * CASE-INSENSITIVE, like `isProtected` above: this is a raw string comparison
 * rather than a glob match, so it needs the fold applied by hand or `rm -rf
 * RULES` walks past a check that `rm -rf rules` fails. The pattern is returned
 * UNFOLDED, so the deny reason names the pattern as `hooks/config.json` writes
 * it.
 *
 * The project root is excluded deliberately. `.` is an ancestor of everything,
 * and `cp x .` writes INTO the root rather than destroying it — denying that
 * would catch ordinary work for no gain, since `rm -rf .` is refused by `rm`
 * itself.
 *
 * `writesThrough` is the one caller that lifts that exclusion, and it lifts it
 * for the verbs whose whole operation is to walk into the directory rather than
 * to write it: see `VerbSpec.writesThrough`. `git checkout HEAD~1 -- .` and
 * `git clean -fdx` are not `cp x .`; they rewrite or delete every path
 * underneath the root, which is the whole protected list. The rule the deny
 * follows from is stated there and in `rules/protected-path-discipline.md`: a
 * `writesThrough` verb whose pathspec resolves to the project root denies, and
 * the way through is the literal file list.
 *
 * `/` stays excluded either way, and the reason narrowed when `260804-1604`
 * closed. It used to be that no protected pattern in the list is absolute, so
 * there was nothing at `/` for the comparison to find. The self-protection floor
 * is now absolute — it is the one pattern that names a location rather than a
 * shape — so `/` IS an ancestor of a protected pattern and the exclusion is a
 * choice rather than a vacuity. It stands: `rm -rf /` is refused by `rm` itself
 * the same way `rm -rf .` is, a git pathspec is repository-relative and git
 * refuses an absolute one outright, and a deny at `/` would name a pattern
 * rather than a mistake. Every ancestor BELOW `/` is matched, so `rm -rf ..`
 * from a subdirectory of the project denies on the configuration file it would
 * take with it.
 */
function ancestorOfProtected(
  path: string,
  opts: MutationOptions,
  writesThrough = false,
): string | null {
  const base = foldCase(withoutTrailingSlash(path));
  if (base === "/") return null;
  const isRoot = base.length === 0 || base === ".";
  if (isRoot && !writesThrough) return null;

  for (const pattern of opts.protectedPaths) {
    const prefix = foldCase(literalPrefix(pattern));
    if (prefix.length === 0) continue;
    // At the root every pattern with a literal prefix is underneath; anywhere
    // else the comparison is on a path-segment boundary, so `rules-draft` is
    // not read as an ancestor of `rules/**`.
    if (isRoot || prefix.startsWith(base + "/")) return pattern;
  }
  return null;
}

/* ------------------------------------------------------------------ *
 * The virtual working directory
 * ------------------------------------------------------------------ */

/**
 * Where a segment's relative operands hang off.
 *
 *   `known`   — a directory the guard can name. `dir` is `""` for the project
 *               root, and otherwise a path in the same coordinate space the
 *               operands arrive in: project-relative while the shell is inside
 *               the tree, `..`-prefixed or absolute once it walks out.
 *   `outside` — a directory the guard cannot name but knows is not the project
 *               tree: `$HOME`, reached by a bare `cd`, `cd ~` or `cd ~/x`. A
 *               relative operand there can match no relative protected pattern,
 *               so it resolves to nothing rather than denying.
 *   `unknown` — a directory the guard cannot determine at all: `cd $D`,
 *               `cd "$(git rev-parse --show-toplevel)"`, `pushd +1`. A relative
 *               operand there is UNRESOLVED, and a recognised verb writing it
 *               denies, exactly as `mv $SRC rules/` does.
 *
 * The `outside` / `unknown` split is the one judgement call here. `~` is
 * SYNTAX the classifier can see, denoting a directory that is the project root
 * only if the project IS the home directory — so treating it as "somewhere
 * else" costs nothing real and keeps `cd && rm -rf junk` working. `$D` is a
 * VALUE the classifier cannot see, and it can expand to the project root;
 * guessing would reopen the hole this whole module exists to close.
 *
 * `$HOME` is deliberately NOT read as `~`, even though bash expands both from
 * the same variable. The classifier resolves no variable, ever — `resolveWord`
 * is the single authority on what a word denotes, and carving out one name
 * would make it two. The cost is that `cd $HOME && rm -rf tmp` denies where
 * `cd ~ && rm -rf tmp` allows; the deny reason names the working directory as
 * the cause and an absolute path is the way through.
 */
type Cwd =
  | { kind: "known"; dir: string }
  | { kind: "outside" }
  | { kind: "unknown"; cause?: CwdUnknownCause };

/**
 * Why the working directory is unknown, when saying so changes what the reader
 * should DO about it.
 *
 * Both members earn their place by being invisible in the place a reader would
 * look. Most ways to lose the directory are written in the command (`cd $D`,
 * `cd -P x`, `pushd -n x`), so `unknownCwdReason` can tell the reader to drop
 * the `cd` and they can see the `cd` it means. An AMBIENT `CDPATH` is in the
 * user's shell profile, and a reason naming only the working directory would
 * send them looking through a command that contains no cause.
 *
 * The second member is not invisible but it is INVISIBLE AS A CAUSE: in
 * `cd build; rm out.js` the `cd` is right there and looks perfectly
 * resolvable, and a reason saying "an earlier `cd` moved somewhere only known
 * at run time" would be read as a bug. What is unknown is not the `cd`'s
 * destination but whether the shell went there, and the fix is the separator
 * rather than the path.
 *
 * The third arrived after the vocabulary was written and had to be added rather
 * than inherited. `git -C $D rm build/out.js` loses the directory to a git
 * OPTION, and the fallback reason told the agent to "drop the `cd`" in a command
 * that contains no `cd` at all (`issues/260804-1347_…`) — a remedy that cannot
 * be applied, which is the worst form of the failure this whole rule set exists
 * to prevent, since three of them put the guard into halt mode with the agent
 * having followed the instruction each time.
 */
type CwdUnknownCause = "ambient-cdpath" | "unproven-cd" | "git-directory";

const CWD_ROOT: Cwd = { kind: "known", dir: "" };
const CWD_OUTSIDE: Cwd = { kind: "outside" };
const CWD_UNKNOWN: Cwd = { kind: "unknown" };
/** Unknown BECAUSE a bare-word `cd` was searched down an ambient `CDPATH`. */
const CWD_UNKNOWN_AMBIENT_CDPATH: Cwd = {
  kind: "unknown",
  cause: "ambient-cdpath",
};
/** Unknown BECAUSE a `cd` the shell never guaranteed was followed anyway. */
const CWD_UNKNOWN_UNPROVEN_CD: Cwd = {
  kind: "unknown",
  cause: "unproven-cd",
};
/** Unknown BECAUSE a `git -C` / `--work-tree` value does not resolve. */
const CWD_UNKNOWN_GIT_DIRECTORY: Cwd = {
  kind: "unknown",
  cause: "git-directory",
};

/** Append a relative path to a virtual directory (`""` = the project root). */
function joinCwd(dir: string, value: string): string {
  if (dir.length === 0) return value;
  return dir.endsWith("/") ? dir + value : `${dir}/${value}`;
}

/** `.` and `""` both mean the project root; keep one spelling. */
function canonicalDir(dir: string): string {
  return dir === "." ? "" : dir;
}

/**
 * Where one directory-valued OPTION token lands, given where its invocation
 * currently stands. The `cd` reading of the same token, minus the two things
 * that are properties of the builtin rather than of the path: `CDPATH`, which
 * only `cd` searches, and `cd -P`, which git has no equivalent of.
 */
function stepDir(base: Cwd, token: string, literals: Map<string, string>): Cwd {
  // A leading `~` in CODE position is home expansion, and home is outside any
  // relative protected pattern — the same reading `applyDirEffect` gives it.
  if (token.startsWith("~")) return CWD_OUTSIDE;
  const w = resolveWord(token, literals);
  // Named as its own cause. The generic give-up would reach `unknownCwdReason`,
  // which tells the reader to drop a `cd` this command does not contain.
  if (w.unresolved === true) return CWD_UNKNOWN_GIT_DIRECTORY;
  return resolveDir(base, w.value);
}

/**
 * The directory a `git` invocation ACTUALLY runs in — `-C` values folded left to
 * right, `--work-tree` composed onto the result, and the shell's own directory
 * when it names neither.
 *
 * The same walk `gitRedirectedBases` performs, minus its de-duplication. That
 * function's job is to name the EXTRA candidate directories, so it drops one
 * that coincides with the shell's; "which base is the effective one" is a
 * different question and still has an answer when the two coincide. Only
 * `VerbSpec.writesThrough` consults it, and only to keep a modelled write off a
 * directory git never visits.
 */
function gitEffectiveBase(
  cwd: Cwd,
  writes: VerbWrites,
  literals: Map<string, string>,
): Cwd {
  let base = cwd;
  for (const token of writes.chdirs) base = stepDir(base, token, literals);
  if (writes.workTree !== undefined) {
    base = stepDir(base, writes.workTree, literals);
  }
  return base;
}

/**
 * The directories a `git` invocation redirects its OWN operands to, beyond the
 * one the shell is standing in.
 *
 * `-C` values compose left to right and `--work-tree` composes onto the result,
 * which is git's documented order and the measured one
 * (`git -C sub --work-tree=../rules clean -fdx` deleted `rules/x.md`).
 *
 * ## Why the shell's own directory stays in the candidate set
 *
 * A returned base is ADDED to the segment's working directory, never
 * substituted for it, and that is a deliberate refusal to use a flag to argue a
 * spelled-out protected path away. `git -C /repo mv rules/x.md docs/` names
 * `rules/x.md` in the command; modelling `-C` alone would resolve it to
 * `/repo/rules/x.md`, find it outside the project, and allow — turning a deny
 * this guard has always had into an allow, on the strength of a directory the
 * guard cannot see the contents of. The union is the same stance the module
 * takes on `mv $SRC rules/`: a visible protected operand names the deny.
 *
 * The structural consequence is the property the whole change rests on. A
 * candidate can only ADD a resolution, so it can only add a deny; no command
 * that was allowed before is allowed less, and none that was denied becomes
 * allowed.
 */
function gitRedirectedBases(
  cwd: Cwd,
  writes: VerbWrites,
  literals: Map<string, string>,
): Cwd[] {
  if (writes.chdirs.length === 0 && writes.workTree === undefined) return [];

  let base = cwd;
  for (const token of writes.chdirs) base = stepDir(base, token, literals);

  const bases: Cwd[] = [base];
  if (writes.workTree !== undefined) {
    bases.push(stepDir(base, writes.workTree, literals));
  }
  return bases.filter((b) => !sameCwd(b, cwd));
}

/** Do two directory states name the same place, for de-duplication only? */
function sameCwd(a: Cwd, b: Cwd): boolean {
  if (a.kind !== b.kind) return false;
  if (a.kind === "known" && b.kind === "known") return a.dir === b.dir;
  return a.kind !== "unknown" || a.cause === (b as { cause?: CwdUnknownCause }).cause;
}

/** Where `cd <value>` lands, given where the shell currently stands. */
function resolveDir(base: Cwd, value: string): Cwd {
  if (value.length === 0) return base; // `cd ''` succeeds and stays put
  if (value.startsWith("/")) {
    return { kind: "known", dir: canonicalDir(normalizePath(value)) };
  }
  // A relative hop from a directory we could not name is still unnameable —
  // and still unnameable in the same WAY, so `cd ~ && cd x` stays outside.
  if (base.kind !== "known") return base;
  return {
    kind: "known",
    dir: canonicalDir(normalizePath(joinCwd(base.dir, value))),
  };
}

/** A written operand, resolved as far as the guard can take it. */
type Target =
  /**
   * `path` is normalised — the spelling the protected list is matched on.
   * `spelled` is the same operand before that normalisation, kept because the
   * normalisation collapses `..` lexically and a caller's exemption may have to
   * refuse exactly the spellings it erases. See `MutationOptions.exempt`.
   */
  | { kind: "path"; path: string; spelled: string }
  /**
   * `cause` is carried from the `Cwd` that could not be named, and only when
   * `viaCwd` — the operand itself is fine, so the deny has to explain the
   * directory. See `CwdUnknownCause`.
   */
  | { kind: "unresolved"; viaCwd: boolean; cause?: CwdUnknownCause }
  | { kind: "outside" }
  | { kind: "empty" };

function resolveTarget(
  token: string,
  literals: Map<string, string>,
  opts: MutationOptions,
  cwd: Cwd,
): Target {
  const resolved = resolveWord(token, literals);
  if (resolved.unresolved === true) return { kind: "unresolved", viaCwd: false };
  if (resolved.value.length === 0) return { kind: "empty" };

  const value = resolved.value;
  const absolute = value.startsWith("/");
  if (!absolute) {
    // A relative operand says nothing on its own — it is a path only once the
    // guard knows where the shell is standing.
    if (cwd.kind === "unknown") {
      return { kind: "unresolved", viaCwd: true, cause: cwd.cause };
    }
    if (cwd.kind === "outside") return { kind: "outside" };
  }

  const base = cwd.kind === "known" ? cwd.dir : "";
  const joined = absolute ? value : joinCwd(base, value);

  // Glob metacharacters are matched as LITERAL text rather than expanded, which
  // is fail-closed for the patterns that matter: `rules/**` compiles to
  // `^rules/.*$` and therefore matches the literal string `rules/*.md`.
  // `joined` is kept as the SPELLING. `opts.normalize` is the project-relative
  // normaliser, and it resolves an absolute operand through `resolve` +
  // `relative` — which collapses `..` just as surely as `normalizePath` does. So
  // the spelling has to be taken before it, or `rm /proj/rules/link/../x` would
  // reach a caller's exemption with the escape already erased while
  // `rm rules/link/../x` did not.
  const path = normalizePath(opts.normalize(joined));
  return { kind: "path", path, spelled: joined };
}

/**
 * The directory-changing builtins. `chdir` is not a bash builtin at all, but it
 * costs one set entry and no program by that name does anything else.
 */
const DIR_BUILTINS = new Set(["cd", "chdir", "pushd", "popd"]);

/**
 * The `pushd` / `popd` directory stack — either exactly as deep as the shell's,
 * or absent.
 *
 * IT IS A SUM TYPE FOR ONE REASON: an array has a LENGTH, and a length is a
 * second fact that can be wrong on its own. `unmodelled()` used to zero the
 * stack by mapping every entry to `CWD_UNKNOWN`, which is honest about the
 * entries and silent about the depth — and `.map()` preserves length. After
 * `pushd -n DIR` the shell is one entry deeper than an array so zeroed, the
 * disagreement hides for as long as the working directory is also unknown, and
 * an absolute `cd` re-proves the directory and hands the surviving mismatch back
 * to the next `popd` as a confidently-named directory the shell never went to.
 * That was measured deleting `rules/x.md`
 * (`issues/260803-2237_…unmodelled-zeroes-the-stack-values-but-not-its-depth…`).
 *
 * With the depth inside the `known` arm there is no zeroed-but-still-N-deep
 * value to construct: giving up REPLACES the stack rather than rewriting its
 * contents, and `popd` on an `unknown` stack cannot read "empty, so bash stayed
 * put" out of an array that is not there. The compiler enforces what the
 * previous wording could only ask a reader to check.
 */
type DirStack =
  /** `entries` is exactly what the shell's `dirs` holds, innermost last. */
  | { kind: "known"; entries: Cwd[] }
  /** Contents AND depth unknowable. Never returns to `known`. */
  | { kind: "unknown" };

const STACK_UNKNOWN: DirStack = { kind: "unknown" };

/**
 * As much of a shell's directory state as a static classifier can carry.
 *
 * Every field here is something the classifier ASSERTS, and each has been an
 * entrance for the same defect: a modifier in the command changes what bash
 * does with one of them, the classifier discards the modifier, and the
 * assertion is then wrong in the direction that allows a write. `cwd` was the
 * first entrance found, `dirStack` and `prev` were measured through
 * `pushd -n` / `popd -n` while this was being fixed. So the rule below is
 * stated over the WHOLE record, not over `cwd`: see `unmodelled`.
 *
 * THE PROPERTY THAT MAKES THE RULE CHECKABLE is that every field has an
 * "I don't know" value covering the WHOLE field rather than its contents.
 * `cwd` and `prev` are `Cwd`, whose `unknown` arm carries no directory;
 * `dirStack` is `DirStack`, whose `unknown` arm carries no entries and no
 * depth; `physical`, `cdpath` and `moved` are monotone booleans, set and never
 * cleared, where `true` is itself the don't-know (it can only make a later
 * `cwd` less certain). A future field must arrive with the same property, or
 * `unmodelled` silently stops being a give-up for it — which is exactly how
 * `dirStack` kept a depth through a give-up stated over values.
 */
interface ShellState {
  cwd: Cwd;
  /** `$OLDPWD`, where `cd -` goes back to. Unknown until the first `cd`. */
  prev: Cwd;
  /** The `pushd` / `popd` directory stack. See `DirStack`. */
  dirStack: DirStack;
  /**
   * Has bash been put into PHYSICAL directory resolution (`set -P`,
   * `set -o physical`)? Then every later `cd` resolves each component through
   * the kernel — symlinks and all — which is a filesystem question this module
   * does not ask. Sticky, and never cleared: `set +P` restores logical mode,
   * but by then the shell is standing somewhere this classifier already lost
   * track of, so clearing it would buy a known cwd it cannot actually name.
   */
  physical: boolean;
  /**
   * Has a `CDPATH` been assigned in the command? Then a later BARE-WORD `cd`
   * operand may resolve against a `CDPATH` entry instead of against the current
   * directory, and the lexical join below names the wrong place.
   *
   * Sticky, which over-denies the COMMAND-PREFIX form: `CDPATH=.. cd a; cd b`
   * only puts `CDPATH` in `cd a`'s environment, and `cd b` is unaffected in
   * real bash. Distinguishing the prefix form from `export CDPATH=..` would
   * buy back a shape nothing writes, and the error is in the denying
   * direction.
   *
   * COMMAND-TEXT ONLY. An AMBIENT `CDPATH` — exported in the user's own shell
   * profile — is not this field and never sets it: it is constant for the whole
   * command, so it is a parameter to `applyDirEffect` rather than state, and it
   * denies with its own reason (`ambientCdpathReason`) because it is the one
   * cause a reader cannot find by re-reading the command. See
   * `ambientCdpathIsSet` and
   * `decisions/260803-1803_*_should-the-guard-degrade-its-working-directory-model-when-cdpath-is-set-in-the-ambient-environment.md`,
   * answered in favour of degrading.
   */
  cdpath: boolean;
  /**
   * Has a directory builtin run in this scope?
   *
   * The odd one out: every other field is something the model ASSERTS, and this
   * one records where those assertions came FROM. The classifier has no
   * filesystem, so it cannot know whether a `cd` succeeded — and until this
   * field existed it assumed success across every separator. After `&&` the
   * assumption is free, because a failed `cd` returns non-zero and the rest of
   * the chain never runs. After `;`, `||`, `|`, `&` or a newline the shell runs
   * the next segment FROM WHERE IT NEVER LEFT, and `cd nonexistent; rm
   * rules/x.md` deleted a protected rule with no flag, no wrapper and one extra
   * segment (`issues/260803-2238…`,
   * `decisions/260803-2338_i_should-the-guard-degrade-its-directory-model-after-a-cd-it-cannot-prove-succeeded.md`).
   *
   * THE ASSUMPTION IS NOT ACTUALLY FREE, and this comment overstated it. `&&`
   * guarantees the and-or list to its LEFT returned zero, not that the segment
   * before it ran, and it does not reach into a pipeline. This field is still
   * set the moment a directory builtin is SEEN, whatever brought its segment
   * into reach — so `true || cd build && rm rules/x.md` and `echo hi | cd build
   * && rm rules/x.md` allowed and did delete the rule (`issues/260804-0836…`,
   * `260804-0837…`).
   *
   * WHAT ANSWERS THAT IS NOT THIS FIELD but the SECOND give-up in the segment
   * walk, which asks the joiner about the segment that moved rather than about
   * the one that writes. Both give-ups read the same `JoinerFacts` row, so the
   * two questions are one table and not two models
   * (`decisions/260804-0947_…_should-the-joiner-be-consulted-for-the-segment-that-moves-as-well-as-the-one-that-writes.md`,
   * option 4). Setting the field on sight stays correct: it records that the
   * model's directory now RESTS on a `cd`, and both give-ups key off exactly
   * that.
   *
   * Monotone, like `physical` and `cdpath`, and `true` is the don't-know for the
   * same reason: it can only make a later `cwd` less certain, never more. It is
   * per SCOPE rather than per command because a `cd` inside `(…)` or `$(…)` is
   * discarded when the scope closes — `cloneState` carries it so the restore
   * that discards the `cd` discards the doubt with it.
   *
   * `false` in a fresh state is a claim, not an absence: the shell really is at
   * the project root, and nothing had to succeed for that to be true.
   */
  moved: boolean;
}

function freshState(): ShellState {
  // A Bash tool call starts at the project root with an empty directory stack,
  // no `$OLDPWD` it can rely on, and bash's default logical `cd`.
  return {
    cwd: CWD_ROOT,
    prev: CWD_UNKNOWN,
    dirStack: { kind: "known", entries: [] },
    physical: false,
    cdpath: false,
    moved: false,
  };
}

function cloneState(s: ShellState): ShellState {
  return {
    cwd: s.cwd,
    prev: s.prev,
    // The entries array is mutated in place by `pushd` / `popd`, so a shallow
    // copy of the record would let a subshell's pushes escape into its parent.
    dirStack:
      s.dirStack.kind === "known"
        ? { kind: "known", entries: [...s.dirStack.entries] }
        : s.dirStack,
    physical: s.physical,
    cdpath: s.cdpath,
    moved: s.moved,
  };
}

/**
 * Give up on the whole directory model — the one honest answer to a form this
 * classifier does not model.
 *
 * It is stated over EVERY field because the forms that reach it do not all move
 * the working directory. `pushd -n DIR` pushes onto the stack and stays put;
 * `popd -n` removes a stack entry and stays put. Both were measured allowing a
 * protected write through a LATER `popd` or `cd -` that landed somewhere the
 * classifier had computed from an entry bash no longer had. Zeroing `cwd` alone
 * would have left both open.
 *
 * And every field means every field, DEPTH INCLUDED. This function used to zero
 * the stack with `state.dirStack.map(() => CWD_UNKNOWN)`, which is a statement
 * about the entries and not about how many there are — `.map()` preserves
 * length. `pushd -n DIR` leaves the shell one entry deeper than a stack so
 * zeroed, and an absolute `cd` afterwards re-proves the working directory and
 * makes the surviving off-by-one load-bearing again (`issues/260803-2237…`).
 * Replacing the stack with `STACK_UNKNOWN` is what makes the give-up total; the
 * `DirStack` sum type is what makes the old shape impossible to write back.
 *
 * `CWD_UNKNOWN` is not a new state and this is not a new mechanism: a relative
 * operand of a recognised verb under an unknown directory is unresolved and
 * denies fail-closed, with a reason that names the working directory as the
 * cause. `cd $D && rm notes.txt` has denied by exactly this route since the
 * module was written.
 */
function unmodelled(state: ShellState): void {
  state.cwd = CWD_UNKNOWN;
  state.prev = CWD_UNKNOWN;
  state.dirStack = STACK_UNKNOWN;
}

/**
 * The same give-up, for the one cause that is not in any single segment: a
 * modelled `cd` the shell does not guarantee ran.
 *
 * Called at a segment boundary rather than from `applyDirEffect`, because what
 * makes the assumption unsafe is the SEPARATOR and not the `cd`. `cd build &&
 * rm out.js` is exact — bash will not reach the `rm` unless the `cd` succeeded.
 * `cd build; rm out.js` is not, and neither is `cd hooks && npm run build;
 * rm -rf dist`, where the `cd` is `&&`-joined and the `rm` is still reached
 * however the chain in front of it ended.
 *
 * It differs from `unmodelled` in one respect: the CAUSE. `unproven-cd` gets
 * its own deny reason because the advice `unknownCwdReason` gives — drop the
 * `cd`, or name the target absolutely — is only half of it here, and the other
 * half (write `&&` instead of `;`) is the one an agent will actually want. A
 * directory that was ALREADY unknown keeps its own cause untouched: the
 * separator took nothing from it, and its remedy is the one that works.
 */
function degradeUnprovenCd(state: ShellState): void {
  const before = state.cwd;
  unmodelled(state);
  // Only a directory the model still CLAIMED is lost here. One that was already
  // unknown is left exactly as it was, cause and all: whatever made it unknown
  // is the stronger fact and its remedy is the right one. `pushd -P x; rm y`
  // should still be told about the `-P`, and a bare-word `cd` under an ambient
  // `CDPATH` about the variable — neither is fixed by writing `&&`.
  state.cwd = before.kind === "unknown" ? before : CWD_UNKNOWN_UNPROVEN_CD;
}

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

export const JOINER_FACTS: ReadonlyMap<SegmentJoiner, JoinerFacts> = new Map([
  ["start", { carriesCdForward: true, movesCallingShell: true }],
  ["&&", { carriesCdForward: true, movesCallingShell: true }],
  [";", { carriesCdForward: false, movesCallingShell: true }],
  ["newline", { carriesCdForward: false, movesCallingShell: true }],
  ["&", { carriesCdForward: false, movesCallingShell: true }],
  ["||", { carriesCdForward: false, movesCallingShell: false }],
  ["|", { carriesCdForward: false, movesCallingShell: false }],
] as const);

/** The unknown joiner, and the reason the lookup is a safe-list. */
const JOINER_UNKNOWN: JoinerFacts = {
  carriesCdForward: false,
  movesCallingShell: false,
};

/**
 * The only reader of `JOINER_FACTS`, exported with it as the review surface —
 * the same reason `MUTATION_VERBS` and `WRAPPER_PROGRAMS` are exported. Passing
 * it a joiner the table does not carry is the checkable form of the safe-list
 * claim, and the suite does exactly that.
 */
export function joinerFacts(j: SegmentJoiner): JoinerFacts {
  return JOINER_FACTS.get(j) ?? JOINER_UNKNOWN;
}

/** What the first non-flag argument of a directory builtin asks for. */
type DirArg =
  | { kind: "none" }
  | { kind: "previous" }
  | { kind: "opaque" }
  /** A flag whose effect on the directory model this classifier does not know. */
  | { kind: "unmodelled" }
  | { kind: "word"; token: string };

/**
 * Flags on a directory builtin whose effect on the model is nothing.
 *
 * `-L` is bash's DEFAULT: resolve `..` against `$PWD` textually, which is
 * exactly what `resolveDir` does. Spelling it out changes nothing, so it is
 * skipped. `--` ends option processing.
 *
 * The list is deliberately this short. It is an ALLOW-LIST, and everything
 * outside it is `unmodelled` — see `firstDirArg`.
 */
const MODELLED_DIR_FLAGS: ReadonlySet<string> = new Set(["-L", "--"]);

/**
 * The first operand of a directory builtin, or the reason there is not one.
 *
 * THIS IS AN ALLOW-LIST, and the inversion is the point. It used to skip any
 * token that looked like a flag and then model whatever followed with bash's
 * default logical semantics. That is right for a default `cd` and wrong the
 * moment a modifier changes the resolution rule, and three such modifiers were
 * measured walking through it into the whole protected list:
 *
 *   - `cd -P` / `pushd -P` — physical resolution, so `rules/link/..` is the
 *     parent OF THE LINK'S TARGET rather than of `rules/`;
 *   - `pushd -n DIR` — pushes onto the stack and does NOT change directory;
 *   - `popd -n` — removes a stack entry and does NOT change directory.
 *
 * Enumerating those three would have been the fourth narrowing of one defect
 * class in one Circle. What is written instead is the stance: a flag this
 * classifier has not been taught yields `unmodelled`, and `unmodelled` denies
 * fail-closed.
 *
 * WHAT THAT DOES NOT SAY is that every unmodelled bash construct arrives as a
 * flag. It was said, and it was false twice over: `command cd rules` never
 * reaches this function, and bare `pushd` reaches it, is correctly told there is
 * no operand, and was then pushed onto the model's stack anyway. Both are closed
 * at their own call sites in `applyDirEffect`. The claim this function supports
 * is the one about FLAGS, and it stops there.
 *
 * The cost is stated rather than estimated, because it is real: `cd -P build
 * && rm out.js` and `cd -P docs && rm ../notes.txt` allowed before and deny
 * now. Neither shape is idiomatic in an agent-issued command, the deny names
 * the working directory as the cause, and an absolute path is the way through.
 */
function firstDirArg(args: string[]): DirArg {
  for (const a of args) {
    if (a === "-") return { kind: "previous" };
    if (a.startsWith("+")) return { kind: "opaque" }; // `pushd +2` rotates
    if (a.length > 1 && a.startsWith("-")) {
      if (MODELLED_DIR_FLAGS.has(a)) continue;
      return { kind: "unmodelled" }; // `-P`, `-n`, `-e`, `-@`, anything later
    }
    return { kind: "word", token: a };
  }
  return { kind: "none" };
}

/** `popd +1` / `popd -n` rotate or suppress rather than pop. */
function isFlagToken(a: string): boolean {
  return a.startsWith("+") || (a.length > 1 && a.startsWith("-"));
}

/**
 * Does a `set` segment turn on bash's physical directory resolution?
 *
 * `set` is not a directory builtin and does not appear in `DIR_BUILTINS`, but
 * `set -P` changes how every LATER `cd` resolves, and `set -P; cd rules/link/..`
 * was measured reaching the whole protected list.
 *
 * The enumeration here is complete over bash's option set rather than over the
 * flags this module happened to think of, which is why it is an enumeration at
 * all: `physical` is the ONLY `set -o` option that changes where a `cd` lands.
 * Every other one (`errexit`, `pipefail`, `noglob`, …) is invisible to the
 * directory model, so `set -euo pipefail` costs nothing.
 *
 * An argument that does not resolve to a literal is read AS IF it were `-P`,
 * because `set $FLAGS` can expand to one. The exception is everything after a
 * `--`, which bash treats as positional parameters and never as options — that
 * is what keeps the `set -- "$@"` idiom from degrading the model.
 */
function setsPhysicalMode(
  args: string[],
  literals: Map<string, string>,
): boolean {
  for (let i = 0; i < args.length; i++) {
    const w = resolveWord(args[i], literals);
    if (w.unresolved === true) return true;
    const a = w.value;
    if (a === "--") return false;
    if (a === "-o" || a === "+o") {
      const next = resolveWord(args[i + 1] ?? "", literals);
      if (next.unresolved === true) return true;
      if (a === "-o" && next.value === "physical") return true;
      i++; // the option NAME is not a flag cluster
      continue;
    }
    // A short-flag cluster sets every letter in it: `set -eP` is `set -e -P`.
    // `+P` turns physical mode OFF and is not this question.
    if (a.length > 1 && a.startsWith("-") && a.slice(1).includes("P")) return true;
  }
  return false;
}

/** `CDPATH=` as an assignment token, however its value is quoted. */
const CDPATH_ASSIGNMENT_RE = /^CDPATH=/;

/**
 * Builtins that take `NAME=value` assignments as ordinary arguments, so a
 * `CDPATH` assignment can stand after the command word instead of before it.
 */
const ASSIGNMENT_BUILTINS = new Set([
  "export",
  "declare",
  "typeset",
  "local",
  "readonly",
]);

/**
 * Does this segment assign `CDPATH`?
 *
 * Three spellings reach the same place, and `findCommandWord` hides the first
 * two by design — it skips a leading `VAR=value` assignment so `FOO=1 rm x`
 * classifies as the `rm` it is:
 *
 *   - a command PREFIX, `CDPATH=.. cd agents`;
 *   - a bare assignment segment, `CDPATH=..` with no command at all
 *     (`findCommandWord` returns -1, which is why this is asked before the
 *     early return);
 *   - `export CDPATH=..`, where the assignment is an argument.
 *
 * The token is matched RAW rather than through `resolveWord`, because the
 * question is which variable is being assigned, and that half of the token is
 * never inside the quotes: `CDPATH=".."` tokenizes with the value replaced by a
 * placeholder and the name still spelled out.
 */
function assignsCdpath(
  words: string[],
  cmdIdx: number,
  literals: Map<string, string>,
): boolean {
  const leading = cmdIdx === -1 ? words : words.slice(0, cmdIdx);
  if (leading.some((w) => CDPATH_ASSIGNMENT_RE.test(w))) return true;
  if (cmdIdx === -1) return false;

  const resolved = resolveWord(words[cmdIdx], literals);
  const raw = resolved.unresolved === true ? words[cmdIdx] : resolved.value;
  if (!ASSIGNMENT_BUILTINS.has(programName(raw))) return false;
  return words.slice(cmdIdx + 1).some((w) => CDPATH_ASSIGNMENT_RE.test(w));
}

/**
 * Is `CDPATH` consulted for this `cd` operand?
 *
 * Bash searches `CDPATH` only for a BARE-WORD operand. Verified against real
 * bash rather than inferred: with `CDPATH=..` set, `cd agents` lands outside
 * the current directory while `cd ./agents`, `cd ../junk/agents`, `cd .` and
 * `cd ..` all resolve locally. So the classifier's lexical join stays correct
 * for an explicitly-anchored operand, and only the bare-word case degrades.
 * (An absolute operand never reaches here — `resolveDir` takes it first.)
 */
function cdpathIsSearched(value: string): boolean {
  if (value.startsWith("/") || value.startsWith("./") || value.startsWith("../")) {
    return false;
  }
  return value !== "." && value !== "..";
}

/**
 * Is a `CDPATH` set in the environment THIS PROCESS was given?
 *
 * Read the question literally, because the answer is narrower than the feature
 * it serves. `env` is `opts.env`, which `guard.ts` fills with `process.env` —
 * the PreToolUse hook's own environment. Claude Code spawns the hook directly
 * (node, non-interactive, non-login), so that is a frozen snapshot of Claude
 * Code's launch environment and nothing on that path ever reads a shell profile.
 *
 * The environment the check is ABOUT is a different one: the Bash tool's shell,
 * which is initialised from the user's profile per invocation, so `export
 * CDPATH=…` in a `.zshrc` puts every bare-word `cd` on a search list with
 * nothing in the command to give it away. Measured, from a directory holding no
 * `only/`: `CDPATH=/decoy` turns `cd only` into `/decoy/only` in both bash 3.2
 * and zsh. Measured too that the tool shell really does source the profile.
 *
 * THE TWO AGREE ONLY WHEN CLAUDE CODE WAS ITSELF STARTED FROM A SHELL THAT HAD
 * SOURCED THE PROFILE, which is the common case and was verified in the session
 * this was written in. They diverge in two configurations, and in both the
 * degrade silently does not fire for a `CDPATH` that is genuinely in force
 * (`issues/260803-2040_…the-ambient-cdpath-check-reads-the-hooks-environment…`):
 *
 *   - Claude Code launched other than from an interactive shell — a GUI
 *     launcher, an IDE extension host, a `launchd`/systemd unit. The launch
 *     environment carries no profile exports; the tool shell still sources them.
 *   - The profile edited mid-session. The tool shell picks the new value up on
 *     its next command; this process's environment was fixed at start.
 *
 * That bound is not fixable from here. The only faithful source is the
 * command's own shell, and asking it costs a subprocess per Bash call inside a
 * classifier that is textual by design — option 2 in the decision record, and
 * rejected there on exactly that ground. So it is stated, here and in
 * `rules/protected-path-discipline.md`, rather than closed.
 *
 * BLANK COUNTS AS UNSET. `export CDPATH=` in a profile has asked for nothing,
 * and neither has `CDPATH=" "`; measured, both leave `cd only` failing rather
 * than diverting. So does `CDPATH=:` — a colon-separated list of empty entries,
 * and an empty entry means the current directory — but that one is treated as
 * SET here, because reading the entries is the beginning of deciding whether
 * they could divert, which is the option the decision record rejected. It
 * over-denies a spelling nobody writes.
 *
 * What is deliberately NOT asked is whether the `CDPATH` entries could really
 * divert this operand: that means a filesystem probe per entry inside a
 * classifier that is textual by design (option 2 in the decision record,
 * rejected on that ground). The consequence is measured and worth stating:
 * `CDPATH=.` and a leading `.` shield the operand only when the local
 * subdirectory EXISTS — with `CDPATH=.:/decoy`, `cd rules` stays local when
 * `./rules` is there and lands in `/decoy/rules` when it is not. So even the
 * "safe" common profile diverts sometimes, and the classifier cannot tell which
 * time it is looking at without asking the filesystem.
 */
function ambientCdpathIsSet(env: NodeJS.ProcessEnv): boolean {
  return (env.CDPATH ?? "").trim().length > 0;
}

/**
 * Apply a segment's directory builtin, if it has one, to the running state.
 *
 * Only the first non-flag operand is read: `cd a b` is an error in bash, and
 * every other form the guard cannot model resolves to `unknown` rather than to
 * a guess.
 *
 * ## The invariant, and why it is no longer a recipe
 *
 * **Every write to `state` here leaves the WHOLE RECORD either PROVEN or
 * UNKNOWN.** Not `cwd` — the record.
 *
 * This has been written twice as an AUDIT RECIPE — first "grep for
 * `state.cwd =` and check each right-hand side", then "grep for `state\.[a-z]`
 * and sort the hits into five shapes" — and both were wrong within days, in the
 * same way. A recipe enumerates WRITES TO FIELDS. The invariant is a property of
 * the STATE. The first recipe could not see a `dirStack.push` and missed a push
 * bash does not make (`issues/260803-2039…`); the second saw the push, said
 * correctly that the property to check on it was DEPTH, and then named
 * `unmodelled` as the answer for the forms that fail it — while `unmodelled`
 * preserved depth (`issues/260803-2237…`). A recipe with a gap reads exactly
 * like a recipe without one, which is what makes the third attempt worse than no
 * attempt.
 *
 * So the invariant is carried by the TYPES instead, and there is nothing here to
 * run. Each field of `ShellState` has an "I don't know" value that covers the
 * whole field rather than its contents, so a give-up is a total assignment and
 * cannot leave a residue:
 *
 *   - `cwd`, `prev` — `Cwd`, a sum type whose `unknown` arm carries no
 *     directory. Every write is one of its three constructors, and the
 *     `switch` below binds `never` in its `default`, so the compiler proves the
 *     enumeration over `DirArg` is exhaustive and a new arm cannot be added
 *     without landing in it.
 *   - `dirStack` — `DirStack`, a sum type whose `unknown` arm carries no entries
 *     AND NO DEPTH. This is the field the second recipe got wrong, and the
 *     reason it is a sum type rather than an array. Pushes and pops live inside
 *     the `known` arm and are therefore unreachable once the stack is given up.
 *   - `physical`, `cdpath` — monotone booleans, set and never cleared, where
 *     `true` IS the don't-know: it can only make a later `cwd` less certain.
 *
 * A reviewer checks this by reading four type declarations, not by running a
 * command over a function that grows. A future field is checked the same way,
 * and the question to ask of it is the one both recipes danced around: what is
 * this field's whole-field unknown, and does `unmodelled` assign it?
 *
 * ### What the types cannot certify — two things, and they are the live ones
 *
 * **That the function is REACHED.** A construct that moves the shell without
 * running a recognised directory builtin writes nothing here and leaves a
 * previously-proven `cwd` standing — which is how `command cd rules` got past a
 * model whose every write was honest (`issues/260803-2038…`). A wrapper and a
 * path spelling now reach the give-up above; `eval "cd rules"`, a shell function
 * named `cd`, an alias and a `source`d script remain out of reach of a textual
 * classifier and are residuals rather than checks.
 *
 * **That a PROVEN directory is where the shell is standing.** The types make a
 * give-up total; they say nothing about whether `resolveDir`'s answer is right.
 * A `cd` that FAILS used to sit here — the model followed it while the shell
 * stayed put (`issues/260803-2238…`) — and is now closed OUTSIDE this function,
 * at the segment boundary, because the thing that makes the answer unsafe is the
 * joiner rather than the `cd` (`degradeUnprovenCd`). What is left is that any
 * future modelling of a construct measured in one shell can be wrong in the
 * other. Modelling is the bidirectional half of this module and the only half
 * that can newly ALLOW — see the give-up above.
 *
 * Two supports below the recipe, both checkable by reading: the only way to
 * reach the modelling code is `firstDirArg`, an ALLOW-LIST whose unrecognised
 * flag returns `unmodelled` before anything is modelled; and the three MODES
 * that change bash's resolution rule without being flags on the builtin
 * (`set -P`, a `CDPATH` assignment, an AMBIENT `CDPATH`) are settled before the
 * builtin is applied and consulted on the way out. The first two are read from
 * the command at the top of this function; the third is not in the command at
 * all and arrives as `ambientCdpath`, computed once per command from `opts.env`.
 *
 * `ambientCdpath` is a PARAMETER rather than a `ShellState` field because it is
 * constant for the whole command: an exported variable is inherited by every
 * subshell, so unlike `physical` and `cdpath` there is no scope that could
 * clear it and nothing for `cloneState` to carry.
 */
function applyDirEffect(
  state: ShellState,
  words: string[],
  literals: Map<string, string>,
  ambientCdpath: boolean,
): void {
  // Read BEFORE the builtin: `CDPATH=.. cd agents` is one segment, and the
  // assignment has to be in force by the time the `cd` in it is modelled. This
  // question is about the segment's RAW prefix — a leading assignment, with or
  // without a command behind it — so it is the one place `findCommandWord` is
  // still the right helper.
  if (assignsCdpath(words, findCommandWord(words), literals)) state.cdpath = true;

  // The SHARED resolver, the same one the verb classifier uses. It walks
  // `WRAPPER_PROGRAMS`, which this call site used to skip: `command cd rules &&
  // rm x.md` and `builtin cd rules && rm x.md` were measured allowing while real
  // bash deleted the file, because one module carried two command-word
  // resolutions and the directory model had the weaker one
  // (`issues/260803-2038_…command-cd-and-builtin-cd…`). It also resolves
  // `(cd rules && ls)` — `tokenize` has already stripped the subshell opener —
  // and `\cd` / `'cd'`, which is why nothing is peeled or unquoted here.
  const invocation = resolveInvocation(words, literals);
  if (invocation === null) return;
  const { name, args } = invocation;

  // Everything below models a BUILTIN. Nothing else in a segment moves the
  // shell, so an unrecognised program leaves the state exactly as it was.
  if (name !== "set" && !DIR_BUILTINS.has(name)) return;

  // A directory builtin can FAIL, and this classifier has no way to find out.
  // Everything the model says about the directory from here on is conditional
  // on it having succeeded, so the condition is recorded and the segment loop
  // gives up the moment the shell stops guaranteeing it (`degradeUnprovenCd`).
  // `set` is excluded: it changes a mode rather than a directory, there is
  // nothing for it to fail at, and marking it would degrade `set -P; rm x`
  // for no reason.
  if (DIR_BUILTINS.has(name)) state.moved = true;

  // The segment did not name the builtin directly — a wrapper stands in front of
  // it (`command cd`, `sudo cd`, `time cd`) or it is spelled as a path
  // (`/usr/bin/cd`). In every such form, whether the CALLING shell ran a builtin
  // depends on the shell and on the spelling, and this classifier can read
  // neither off the text. `Invocation.reachesBuiltin` has the measurements.
  //
  // So it gives up rather than modelling either answer. Modelling "the shell
  // moved" was tried, for the three wrappers a measurement said could run a
  // builtin, and it ALLOWED eleven commands the shell executed against a
  // protected file (`issues/260803-2236…`) — because an asserted move relocates
  // every later relative operand and can move it off the protected list.
  // Modelling "the shell stayed put" is the faithful answer for `sudo cd` and
  // `env cd`, and it is right only while the wrapper table says what it says
  // today. Giving up is the one answer that is wrong in no direction: it can
  // only deny.
  //
  // The cost is a deny on `<wrapper> cd DIR && <relative write>`, a shape that
  // buys nothing — reaching a directory builtin through a wrapper does not make
  // it do anything a bare `cd` does not — and the way through is to drop the
  // wrapper or name the path absolutely.
  if (!invocation.reachesBuiltin) {
    unmodelled(state);
    return;
  }

  if (name === "set") {
    if (setsPhysicalMode(args, literals)) state.physical = true;
    return;
  }

  if (name === "popd") {
    // A flag makes `popd` edit the STACK without popping the way this model
    // pops, so the stack stops describing anything.
    if (args.some(isFlagToken)) {
      unmodelled(state);
      return;
    }
    // A stack whose DEPTH was given up on cannot answer "is it empty?", and
    // reading the model's own emptiness as bash's was the escape: after
    // `pushd -n ..` bash holds an entry the model does not, so `popd` moves the
    // shell while the model stands still on a directory an absolute `cd` had
    // just re-proven (`issues/260803-2237…`). Unknown depth means unknown
    // destination, whatever the working directory currently is.
    if (state.dirStack.kind !== "known") {
      state.prev = state.cwd;
      state.cwd = CWD_UNKNOWN;
      return;
    }
    const back = state.dirStack.entries.pop();
    // An empty stack makes `popd` an error, and bash stays where it is. Reached
    // only when the depth is KNOWN to be zero.
    if (back === undefined) return;
    state.prev = state.cwd;
    state.cwd = state.physical ? CWD_UNKNOWN : back;
    return;
  }

  const target = firstDirArg(args);

  // An unmodelled flag can edit the stack without changing directory
  // (`pushd -n DIR`), so nothing the state asserts survives it.
  if (target.kind === "unmodelled") {
    unmodelled(state);
    return;
  }

  // A `pushd` that names no directory does not PUSH. Measured against bash 3.2
  // and zsh, reading `dirs` after each step: bare `pushd` SWAPS the top two
  // stack entries and `pushd +N` / `pushd -N` ROTATE, and all three leave the
  // stack's DEPTH exactly where it was. Pushing anyway left the model one entry
  // deep and one shifted, so the next `popd` recovered a confidently-named
  // directory bash does not go to — measured deleting `rules/x.md` through a
  // six-segment sequence (`issues/260803-2039_…bare-pushd…`).
  //
  // Rotation is a form this classifier does not model, so it says so, in the
  // mechanism that already exists for exactly that. `cd` with no operand is
  // untouched: it is a real move to `$HOME`, not a stack edit, and keeps its
  // `CWD_OUTSIDE` on the `none` arm below.
  if (name === "pushd" && (target.kind === "none" || target.kind === "opaque")) {
    unmodelled(state);
    return;
  }

  // Ordered before the mode check on purpose: whatever mode bash is in, `pushd`
  // pushes the directory it is LEAVING, and that one is still whatever this
  // model already knew. Reachable only on the two arms where bash really pushes
  // — a named operand, and `pushd -` (measured: it pushes and then goes to
  // `$OLDPWD`, exactly as the `previous` arm models) — which is what makes the
  // model's stack DEPTH track bash's.
  // A push onto a stack whose depth is unknown leaves the depth unknown, so the
  // `known` guard is the whole handling of that arm rather than a special case.
  if (name === "pushd" && state.dirStack.kind === "known") {
    state.dirStack.entries.push(state.cwd);
  }

  const here = state.cwd;
  const back = state.prev;
  state.prev = here;

  // Physical mode asks the kernel where each component leads — including an
  // absolute one, whose symlinks it also resolves — so no operand survives it.
  if (state.physical) {
    state.cwd = CWD_UNKNOWN;
    return;
  }

  switch (target.kind) {
    case "none":
      // `cd` alone goes `$HOME`, which is outside any relative pattern and
      // consults no `CDPATH`. A bare `pushd` never reaches here — it took the
      // rotation give-up above.
      state.cwd = CWD_OUTSIDE;
      return;
    case "previous":
      // `cd -` is an exact swap of `$PWD` and `$OLDPWD`, and consults no
      // `CDPATH`. `pushd -` does the same and pushes what it left, which the
      // guarded push above has already recorded.
      state.cwd = back;
      return;
    case "opaque":
      // Only `cd +2` / `chdir +2` reach here now — a directory whose name
      // begins with `+`, which the operand reader will not distinguish from a
      // rotation, so it is unknown rather than guessed. `pushd +2` took the
      // give-up above.
      state.cwd = CWD_UNKNOWN;
      return;
    case "word": {
      // A leading `~` in CODE position is home expansion. A quoted `'~'` never
      // reaches here as a bare tilde — it arrives as a placeholder.
      if (target.token.startsWith("~")) {
        state.cwd = CWD_OUTSIDE;
        return;
      }
      const w = resolveWord(target.token, literals);
      if (w.unresolved === true) {
        state.cwd = CWD_UNKNOWN;
        return;
      }
      // A `CDPATH` is in force, from the environment or from an assignment in
      // this command, and the operand is a bare word bash would search for.
      // The two are ordered so the INVISIBLE cause wins the reason: with both
      // in play the user still has to be told about the one they cannot see.
      if (cdpathIsSearched(w.value)) {
        if (ambientCdpath) {
          state.cwd = CWD_UNKNOWN_AMBIENT_CDPATH;
          return;
        }
        if (state.cdpath) {
          state.cwd = CWD_UNKNOWN;
          return;
        }
      }
      state.cwd = resolveDir(here, w.value);
      return;
    }
    default: {
      // Exhaustiveness, checked by the compiler: a new `DirArg` kind that is
      // not handled above fails to build rather than falling through to a
      // modelled directory.
      const never: never = target;
      return never;
    }
  }
}

/**
 * Count the REAL subshell parentheses in a segment.
 *
 * `shell-parse` lifts `$(…)` bodies out and leaves `SUBSTITUTION_FILLER` where
 * they stood; the filler carries a balanced paren pair that is not grammar, so
 * it is removed first — otherwise `cd $(pwd)` would open and close a scope
 * around its own `cd` and discard it. Quoted text is an opaque placeholder and
 * contributes nothing, EXCEPT a double-quoted span carrying a `$`, a backtick
 * or an escape, which capture mode leaves as code: `echo "(\$x)"` counts a
 * balanced pair it should not, which opens and closes a scope around one
 * innocuous segment and changes no verdict.
 */
function parenCounts(text: string): { opens: number; closes: number } {
  const cleaned = text.split(SUBSTITUTION_FILLER).join(" ");
  let opens = 0;
  let closes = 0;
  for (const ch of cleaned) {
    if (ch === "(") opens++;
    else if (ch === ")") closes++;
  }
  return { opens, closes };
}

/* ------------------------------------------------------------------ *
 * Classification
 * ------------------------------------------------------------------ */

type SegmentHit =
  | { kind: "protected"; path: string; refusalNote: string | null }
  | { kind: "ancestor"; path: string; pattern: string; refusalNote: string | null }
  /** The ancestor hit of a `writesThrough` verb — same pass, different mechanism. */
  | { kind: "through"; path: string; pattern: string; refusalNote: string | null }
  | {
      kind: "unresolved";
      token: string;
      viaCwd: boolean;
      cause?: CwdUnknownCause;
    };

/**
 * `opts.exemptRefusal` for an operand the exemption was asked about and
 * refused, or null when there is no exemption, no explanation, or nothing to
 * ask (a non-exemptible verb was never offered the operand in the first place).
 *
 * Pass 3 has no equivalent: an operand that does not resolve names no path a
 * predicate could have been asked about.
 */
function refusalNoteFor(
  target: Extract<Target, { kind: "path" }>,
  exemptible: boolean,
  opts: MutationOptions,
): string | null {
  if (!exemptible || opts.exempt === undefined) return null;
  return opts.exemptRefusal?.(target.path, target.spelled) ?? null;
}

/**
 * Render a parsed word back to something a human reads. Capture mode replaces
 * each single-quoted region with an opaque placeholder, so a segment's raw text
 * carries control characters that must never reach a deny reason or an event
 * log. Rendering through `resolveWord` uses only `shell-parse`'s public
 * contract — this module never needs to know the placeholder's shape.
 */
function renderWord(word: string, literals: Map<string, string>): string {
  const resolved = resolveWord(word, literals);
  if (resolved.unresolved === true) return word;
  return /\s/.test(resolved.value) ? `'${resolved.value}'` : resolved.value;
}

/** Render a whole segment for display (deny path only). */
function renderSegment(segment: string, literals: Map<string, string>): string {
  return tokenize(segment)
    .map((w) => renderWord(w, literals))
    .join(" ");
}

/** What one segment's classification found. */
interface SegmentVerdict {
  /** The offending target, or null when the segment writes nothing protected. */
  hit: SegmentHit | null;
  /** Does the segment write a file at all? See `MutationVerdict.mutates`. */
  mutates: boolean;
}

/**
 * A written operand, with the exempt eligibility of the verb that named it.
 *
 * `targets` is a LIST because one operand can hang off more than one directory
 * the guard has to answer for: `git -C rules rm x.md` writes `rules/x.md` from
 * git's directory, and the same command spelled `git -C /repo rm rules/x.md`
 * names a protected path from the shell's. Every candidate is checked and any
 * one of them denies — see `gitRedirectedBases`. For every operand of every
 * other verb, and for every redirection, the list holds exactly one entry.
 */
interface WrittenToken {
  token: string;
  exemptible: boolean;
  /** See `VerbSpec.writesThrough`; false for every redirection target. */
  writesThrough: boolean;
  targets: ResolvedAt[];
}

/**
 * One operand resolved against one candidate directory, and whether that
 * directory is the one the invocation actually runs in.
 *
 * `effective` exists for `VerbSpec.writesThrough` alone. Every other check is
 * indifferent to which candidate produced a target — a protected path is
 * protected wherever it was reached from — but a write THROUGH the project root
 * is a claim about where the command runs, and the extra candidates a `-C` adds
 * are not that. See `gitEffectiveBase`.
 */
interface ResolvedAt {
  target: Target;
  effective: boolean;
}

/** A directory an operand is resolved against, tagged as in `ResolvedAt`. */
interface CandidateBase {
  cwd: Cwd;
  effective: boolean;
}

/**
 * Classify one already-segmented command's words.
 *
 * The three passes are ordered by how well the verdict explains itself: a
 * direct protected match first, then a directory containing one, then the
 * fail-closed case. So `mv $SRC rules/` denies naming the visible protected
 * target rather than the variable, and `rm -rf hooks $X` names `hooks`.
 *
 * `exempted` is an accumulator owned by the caller and appended to in passes 1
 * and 2 — every path `opts.exempt` accepted, across every segment of the
 * command. Pass 3 never touches it: an operand that does not resolve names no
 * path a predicate could accept.
 *
 * Exempt eligibility is per OPERAND, not per command, because one segment can
 * carry both kinds: a redirection is an ordinary write and always eligible,
 * while an operand of a non-exemptible verb is not, whatever else the segment
 * does.
 */
function classifyWords(
  words: string[],
  redirectTargets: string[],
  literals: Map<string, string>,
  opts: MutationOptions,
  cwd: Cwd,
  exempted: string[],
): SegmentVerdict {
  const verb = verbOperands(words, literals);
  // A redirection is performed by the SHELL, so it hangs off the shell's
  // directory whatever `-C` told git: in `git -C rules rm out.js > x.md` the
  // `x.md` is written where the shell stands.
  const effectiveBase = gitEffectiveBase(cwd, verb, literals);
  const verbBases: CandidateBase[] = [
    cwd,
    ...gitRedirectedBases(cwd, verb, literals),
  ].map((base) => ({ cwd: base, effective: sameCwd(base, effectiveBase) }));
  const tokens: {
    token: string;
    exemptible: boolean;
    writesThrough: boolean;
    bases: CandidateBase[];
  }[] = [
    ...verb.written.map((token) => ({
      token,
      exemptible: verb.exemptible,
      writesThrough: verb.writesThrough,
      bases: verbBases,
    })),
    // A redirection is not the verb's operand — `>` makes any program a write,
    // and that write is as ordinary as an `Edit`, so it stays eligible. It also
    // writes the file it names and nothing beneath it, whatever verb it rides
    // on: `git clean -fdx > .` is a truncation of one path, not a walk.
    ...redirectTargets.map((token) => ({
      token,
      exemptible: true,
      writesThrough: false,
      bases: [{ cwd, effective: true }],
    })),
  ];
  if (tokens.length === 0) return { hit: null, mutates: false };

  const written: WrittenToken[] = tokens.map(
    ({ token, exemptible, writesThrough, bases }) => ({
      token,
      exemptible,
      writesThrough,
      targets: bases.map(({ cwd: base, effective }) => ({
        target: resolveTarget(token, literals, opts, base),
        effective,
      })),
    }),
  );

  // Pass 1 — a target that resolves to a protected path.
  for (const { targets, exemptible } of written) {
    for (const { target } of targets) {
      if (target.kind !== "path") continue;
      if (!isProtected(target.path, opts)) continue;
      if (exemptible && opts.exempt?.(target.path, target.spelled) === true) {
        exempted.push(target.path);
        continue;
      }
      return {
        hit: {
          kind: "protected",
          path: target.path,
          refusalNote: refusalNoteFor(target, exemptible, opts),
        },
        mutates: true,
      };
    }
  }

  // Pass 2 — a target that is an ancestor directory of a protected path.
  for (const { targets, exemptible, writesThrough } of written) {
    for (const { target, effective } of targets) {
      if (target.kind !== "path") continue;
      // The project root counts as an ancestor for a verb that writes THROUGH
      // its operand, and only at the directory the invocation really runs in.
      const through = writesThrough && effective;
      const pattern = ancestorOfProtected(target.path, opts, through);
      if (pattern === null) continue;
      if (exemptible && opts.exempt?.(target.path, target.spelled) === true) {
        exempted.push(target.path);
        continue;
      }
      return {
        hit: {
          kind: through ? "through" : "ancestor",
          path: target.path,
          pattern,
          refusalNote: refusalNoteFor(target, exemptible, opts),
        },
        mutates: true,
      };
    }
  }

  // Pass 3 — fail-closed: a write the guard cannot place, either because the
  // OPERAND does not resolve or because the DIRECTORY it hangs off does not.
  //
  // THE BOUND IS THE CAUSE, NOT THE PROGRAM. That is a reversal of half of
  // `issues/260801-1859…`, argued and costed in
  // `decisions/260804-0106_i_should-the-fail-closed-bound-be-drawn-around-the-program-or-around-the-cause.md`.
  // What `260801-1859` protected is the idiom "run the thing, put the output
  // somewhere I control": `npm test > "$LOG"`, `cat report.md > ~/backup.md`,
  // `curl -o $OUT https://x`. In every one of those the token itself is
  // unknowable — a `$`, a backtick, a leading `~` — and the guard's own
  // documented sentence is that an unrecognised program is allowed HOWEVER
  // UNPARSEABLE ITS ARGUMENTS ARE. Those rows are `viaCwd: false`, and they
  // still allow.
  //
  // A redirect target that fails to resolve because the WORKING DIRECTORY is
  // unknown is not that case and never was. The token is an ordinary literal
  // relative path; nothing about the program's arguments is unparseable. What
  // is unknown is where the shell is standing, which is the guard's own
  // admission and not the caller's doing — and `pushd -n docs && echo pwned >
  // agents/coder.md` overwrote an agent prompt through exactly that gap, with
  // no flag (`issues/260803-1835…`). Every give-up on a directory fed it, so
  // the entrance set grew with each one while the reach stayed the whole
  // protected list.
  //
  // Passes 1 and 2 are unaffected either way: a redirect target that RESOLVES
  // has always been checked whatever the program is (`sort /tmp/a >
  // rules/x.md` denies).
  //
  // `curl -o rules/x.md` does NOT deny on pass 1 — `curl` is not a table verb
  // and `-o` is not a redirection operator, so nothing puts that operand in
  // the written set. An earlier comment here asserted the opposite and used it
  // to claim the rule is no looser on the visible case than on the invisible
  // one; it is looser, and the claim was checkable in one command
  // (`issues/260804-0841…`). What separates the two is not visibility but
  // whether the guard already holds the operand: a `>` target it recognised
  // and then could not place is the model failing open on its own admission,
  // where an unrecognised program is a write the mechanism never saw.
  //
  // A project with an EMPTY protected list has opted out, and an unresolvable
  // operand there protects nothing — so this pass, the only one that can deny
  // without a pattern to point at, is skipped. Passes 1 and 2 need no such
  // guard: they match against the empty list and find nothing.
  if (opts.protectedPaths.length > 0) {
    const recognisedVerb = verb.written.length > 0;
    for (const { token, targets } of written) {
      for (const { target } of targets) {
        if (target.kind !== "unresolved") continue;
        // The surviving half of `260801-1859`: an unresolvable TOKEN outside the
        // verb table is an ordinary argument of an ordinary program, and is
        // allowed.
        if (!recognisedVerb && !target.viaCwd) continue;
        return {
          hit: {
            kind: "unresolved",
            token,
            viaCwd: target.viaCwd,
            cause: target.cause,
          },
          mutates: true,
        };
      }
    }
  }

  return { hit: null, mutates: true };
}

/** A directory state put aside while a nested scope runs, and what closes it. */
interface SavedScope {
  /** Segment depth the scope was opened at. */
  depth: number;
  /** `depth` — a `$(…)` body; `paren` — a `(…)` subshell. */
  kind: "depth" | "paren";
  state: ShellState;
}

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
export function classifyBashMutation(
  command: string,
  opts: MutationOptions,
): MutationVerdict {
  if (!command || command.trim().length === 0) {
    return { deny: false, mutates: false };
  }

  const { segments, literals } = parseCommand(command, { quoted: "capture" });

  // Read ONCE, before the walk: an exported variable is the same for every
  // segment and every subshell, so this is a property of the command's
  // environment rather than of the state the walk carries.
  const ambientCdpath = ambientCdpathIsSet(opts.env);

  // Every path `opts.exempt` accepts, across every segment. Reported on the
  // allowing verdict so the caller can record that the permission was
  // exercised; dropped on a deny, where nothing was let through.
  const exempted: string[] = [];

  // Sticky across segments: a command mutates if ANY of its segments does, and
  // it is computed even when `protectedPaths` is empty, because a halted guard
  // blocks writes whether or not the project protects anything.
  let mutates = false;

  let state = freshState();
  const saved: SavedScope[] = [];
  let openDepth = 0;

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    const depth = segment.depth;

    // Left a `$(…)` body (or several): every `cd` inside it is discarded.
    while (saved.length > 0 && saved[saved.length - 1].depth > depth) {
      state = saved.pop()!.state;
    }
    // Entered one: it inherits the enclosing directory and returns it intact.
    if (depth > openDepth) {
      saved.push({ depth, kind: "depth", state: cloneState(state) });
    }
    openDepth = depth;

    // Both directory give-ups this loop makes read the SAME record, so the
    // module holds one fact about a joiner rather than two. See `JoinerFacts`.
    const joiner = joinerFacts(segment.joiner);

    // The model may assume a `cd` SUCCEEDED only where the shell guarantees it.
    // `&&` guarantees it; every other joiner reaches this segment however the
    // chain in front of it ended, so a directory the model followed may be one
    // the shell never entered. Placed AFTER the scope restore above, so a `cd`
    // that was already discarded with its subshell casts no doubt forward:
    // `$(cd nope); rm rules/x.md` still resolves from the project root.
    if (!joiner.carriesCdForward && state.moved) {
      degradeUnprovenCd(state);
    }

    const { opens, closes } = parenCounts(segment.text);
    for (let k = 0; k < opens; k++) {
      saved.push({ depth, kind: "paren", state: cloneState(state) });
    }

    const tokens = tokenize(segment.text);
    if (tokens.length > 0) {
      // A redirection operator left dangling by the `&` / `|` segment split
      // finds its target at the head of the next same-depth segment.
      const next = segments[i + 1];
      const nextHead =
        next !== undefined && next.depth === depth
          ? tokenize(next.text)[0]
          : undefined;

      const { words, redirectTargets } = scanSegment(tokens, nextHead);
      const verdict = classifyWords(
        words,
        redirectTargets,
        literals,
        opts,
        state.cwd,
        exempted,
      );
      if (verdict.mutates) mutates = true;
      if (verdict.hit !== null) {
        return denyVerdict(segment.text, literals, verdict.hit);
      }
      applyDirEffect(state, words, literals, ambientCdpath);

      // …and the same question asked of the segment that MOVES. A `cd` here
      // moves the model; it moves the CALLING SHELL only if this segment ran
      // there, which `||` and `|` do not promise. Without this, `true || cd
      // build && rm rules/x.md` and `echo hi | cd build && rm rules/x.md`
      // relocated every later relative operand into a directory bash never
      // entered, and deleted a protected rule with no flag and no wrapper
      // (`issues/260804-0836…`, `260804-0837…`, one fact seen twice;
      // `decisions/260804-0947…` option 4).
      //
      // It is stated over `state.moved` rather than over "a builtin new in this
      // segment", so it also catches the model RE-PROVING a directory it had
      // just given up: in `cd rules && true || cd /tmp && rm x.md` bash skips
      // the second `cd` and deletes `rules/x.md`, while an absolute `cd /tmp`
      // put the model back on solid ground it had no right to.
      //
      // Placed after `applyDirEffect` (the move has to have happened before it
      // can be doubted) and before the paren restore below (a `cd` bash itself
      // discards takes this doubt with it), for the same reason the write-side
      // give-up sits after the scope restore.
      if (!joiner.movesCallingShell && state.moved) {
        degradeUnprovenCd(state);
      }
    }

    for (let k = 0; k < closes; k++) {
      const top = saved[saved.length - 1];
      // Only a paren opened at this depth can be closed here; a stray `)` (a
      // `case` arm, say) closes nothing.
      if (top === undefined || top.kind !== "paren" || top.depth !== depth) break;
      state = saved.pop()!.state;
    }
  }

  // `exempted` is still present ONLY when something was actually exempted, so
  // an ordinary allow carries no list a caller could branch on by accident.
  // `mutates` is always present — it is a question every caller must ask, not a
  // report of something that happened. `mv rules/x.md rules/retired/` meets the
  // same directory twice (as `mv`'s source and as its destination), and two
  // segments can name one path, so first-occurrence order with duplicates
  // removed is what a reader of the advisory wants.
  if (exempted.length === 0) return { deny: false, mutates };
  return { deny: false, mutates, exempted: [...new Set(exempted)] };
}

/** Render a segment hit as the denying verdict it is. */
function denyVerdict(
  segmentText: string,
  literals: Map<string, string>,
  hit: SegmentHit,
): MutationVerdict {
  const offendingSegment = renderSegment(segmentText, literals);
  // Every hit comes from a segment that writes something, so a deny always
  // mutates. Stated once, here, rather than three times below.
  const mutates = true;

  if (hit.kind === "protected") {
    return {
      deny: true,
      mutates,
      reason: protectedReason(offendingSegment, hit.path, hit.refusalNote),
      offendingSegment,
      targetPath: hit.path,
    };
  }

  if (hit.kind === "ancestor" || hit.kind === "through") {
    return {
      deny: true,
      mutates,
      reason: (hit.kind === "through" ? writesThroughReason : ancestorReason)(
        offendingSegment,
        hit.path,
        hit.pattern,
        hit.refusalNote,
      ),
      offendingSegment,
      targetPath: hit.path,
    };
  }

  const token = renderWord(hit.token, literals);
  return {
    deny: true,
    mutates,
    reason: !hit.viaCwd
      ? unresolvedReason(offendingSegment, token)
      : hit.cause === "ambient-cdpath"
        ? ambientCdpathReason(offendingSegment, token)
        : hit.cause === "unproven-cd"
          ? unprovenCdReason(offendingSegment, token)
          : hit.cause === "git-directory"
            ? gitDirectoryReason(offendingSegment)
            : unknownCwdReason(offendingSegment, token),
    offendingSegment,
    targetPath: token,
  };
}
