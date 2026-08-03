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
 * The bound holds for a REDIRECTION TARGET too, which is the one place it used
 * to leak: `npm test > "$LOG"` and `cat report.md > ~/backup.md` are ordinary
 * per-session idioms, and denying them was stricter than the table's own
 * baseline, which allows `curl -o rules/x.md` — a literal protected path with
 * an unrecognised program. A redirect target that RESOLVES is still checked
 * whatever the program is (`sort /tmp/a > rules/x.md` denies); it is only the
 * fail-closed pass that stops at the table's edge.
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
 * firing. It never touches the filesystem, the environment, or the process:
 * the protected list, the project-relative normaliser and the exemption
 * predicate all arrive through `MutationOptions`.
 */

import { normalize as normalizePath } from "node:path";
import { matchesAny } from "./paths.js";
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
   * C5a seam — a path this predicate accepts is exempt. Defaults to none.
   *
   * It is consulted per WRITTEN OPERAND, and not at all for an operand of a
   * verb the table marks `exemptible: false` (see `VerbSpec.exemptible`). So a
   * caller cannot grant a permission the table refuses to make grantable.
   *
   * TWO arguments, because this module destroys one of them on the way to the
   * other. `path` is the resolved, cwd-joined, normalised operand — the
   * spelling the protected list is matched on, and the only one that can be.
   * `spelled` is that operand BEFORE `normalize`, which collapses `..`
   * lexically: `rules/link/../agents/coder.md` becomes `rules/agents/coder.md`,
   * and the symlink whose target decides where the write lands is no longer in
   * the string at all. A caller whose grant depends on the spelling (the
   * rules-write exemption's gate 0) has to read the second argument; a caller
   * that does not may ignore it, and an existing one-argument predicate stays
   * assignable.
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
   * `mv rules/x.md rules/retired/` is the flag's headline use. What makes the
   * planted alias harmless is the exemption predicate, in two steps: gate 0
   * refuses any operand SPELLED with a `..`, which is the only way to traverse
   * a planted link without naming it, and gate 2 resolves what is left against
   * the real filesystem (`rules-write-exemption.ts`). This row is the second
   * layer, not the first. Stated in two steps because for one Turn it was
   * stated in one — "gate 2 resolves paths against the real filesystem" — and
   * that was measurably false on its own: `mv` and `cp -P` both planted, and
   * `rules/<link>/../<anything>` reached the whole protected list through the
   * plant, because the collapse deleted the link from the string before gate 2
   * ever saw it.
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
 * to `patch`. A bare `git clean -fdx` with no path operand is the same kind of
 * residual — it names no directory the ancestor check can compare, exactly as
 * `rm -rf *` does not.
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

export const MUTATION_GIT_SUBCOMMANDS: Readonly<Record<string, VerbSpec>> = {
  mv: { written: "all" },
  rm: { written: "all" },
  clean: {
    written: "all",
    valueFlags: ["-e", "--exclude"],
    mutatesOnlyWhen: isGitCleanForceFlag,
  },
  restore: {
    written: "all",
    valueFlags: ["-s", "--source"],
    mutatesOnlyWhen: isGitRestoreSourceFlag,
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

/**
 * Locate a mutating `git` subcommand, skipping the global options that can
 * precede it (`-C <dir>`, `-c k=v`, `--git-dir[=…]`, `--work-tree[=…]`, any
 * other flag). Returns the spec plus the subcommand's own arguments.
 */
function resolveGit(args: string[]): { spec: VerbSpec; args: string[] } | null {
  let i = 0;
  while (i < args.length) {
    const t = args[i];
    if (t === "-C" || t === "-c") {
      i += 2;
      continue;
    }
    if (t.startsWith("--git-dir") || t.startsWith("--work-tree")) {
      i += t.includes("=") ? 1 : 2;
      continue;
    }
    if (t.startsWith("-")) {
      i += 1;
      continue;
    }
    break;
  }
  const sub = args[i];
  if (sub === undefined) return null;
  const spec = row(MUTATION_GIT_SUBCOMMANDS, sub);
  if (spec === undefined) return null;
  return { spec, args: args.slice(i + 1) };
}

/** Apply a verb's operand roles to its arguments, returning the WRITTEN tokens. */
function writtenOperands(spec: VerbSpec, args: string[]): string[] {
  if (spec.subcommands !== undefined) {
    const first = args[0];
    // No sub-subcommand WORD: `git stash`, `git stash -u`, `git stash -- <p>`.
    // A flag cannot select a row, and `--` introduces the implicit form's
    // pathspecs, so both fall through to `implicit` with their args intact.
    if (first === undefined || first.startsWith("-")) {
      return writtenOperands(spec.subcommands.implicit, args);
    }
    const nested = row(spec.subcommands.table, first);
    if (nested !== undefined) return writtenOperands(nested, args.slice(1));
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
    return [first, ...writtenOperands(spec.subcommands.implicit, args.slice(1))];
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

  for (let i = 0; i < args.length; i++) {
    const a = args[i];

    if (endOfFlags) {
      positionals.push(a);
      continue;
    }
    if (a === "--") {
      endOfFlags = true;
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
}

/** Nothing recognised: no operands, and exemptibility is moot. */
const WRITES_NOTHING: VerbWrites = { written: [], exemptible: true };

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
      written: writtenOperands(git.spec, git.args),
      exemptible: git.spec.exemptible !== false,
    };
  }

  const spec = row(MUTATION_VERBS, name);
  if (spec === undefined) return WRITES_NOTHING;
  return {
    written: writtenOperands(spec, args),
    exemptible: spec.exemptible !== false,
  };
}

/* ------------------------------------------------------------------ *
 * Path resolution and matching
 * ------------------------------------------------------------------ */

/** Is `path` under compliance guard protection? */
function isProtected(path: string, opts: MutationOptions): boolean {
  if (matchesAny(path, opts.protectedPaths)) return true;
  // The operand may name a DIRECTORY whose contents are protected:
  // `rm -rf fusion-workbench/.guard-state` must match
  // `fusion-workbench/.guard-state/**`, which needs the trailing separator.
  if (!path.endsWith("/") && matchesAny(path + "/", opts.protectedPaths)) {
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
 * The project root is excluded deliberately. `.` is an ancestor of everything,
 * and `cp x .` writes INTO the root rather than destroying it — denying that
 * would catch ordinary work for no gain, since `rm -rf .` is refused by `rm`
 * itself.
 */
function ancestorOfProtected(
  path: string,
  opts: MutationOptions,
): string | null {
  const base = withoutTrailingSlash(path);
  if (base.length === 0 || base === "." || base === "/") return null;

  for (const pattern of opts.protectedPaths) {
    const prefix = literalPrefix(pattern);
    if (prefix.length > 0 && prefix.startsWith(base + "/")) return pattern;
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
  | { kind: "unknown" };

const CWD_ROOT: Cwd = { kind: "known", dir: "" };
const CWD_OUTSIDE: Cwd = { kind: "outside" };
const CWD_UNKNOWN: Cwd = { kind: "unknown" };

/** Append a relative path to a virtual directory (`""` = the project root). */
function joinCwd(dir: string, value: string): string {
  if (dir.length === 0) return value;
  return dir.endsWith("/") ? dir + value : `${dir}/${value}`;
}

/** `.` and `""` both mean the project root; keep one spelling. */
function canonicalDir(dir: string): string {
  return dir === "." ? "" : dir;
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
  | { kind: "unresolved"; viaCwd: boolean }
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
    if (cwd.kind === "unknown") return { kind: "unresolved", viaCwd: true };
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

/** As much of a shell's directory state as a static classifier can carry. */
interface ShellState {
  cwd: Cwd;
  /** `$OLDPWD`, where `cd -` goes back to. Unknown until the first `cd`. */
  prev: Cwd;
  /** The `pushd` / `popd` directory stack, innermost last. */
  dirStack: Cwd[];
}

function freshState(): ShellState {
  // A Bash tool call starts at the project root with an empty directory stack
  // and no `$OLDPWD` it can rely on.
  return { cwd: CWD_ROOT, prev: CWD_UNKNOWN, dirStack: [] };
}

function cloneState(s: ShellState): ShellState {
  return { cwd: s.cwd, prev: s.prev, dirStack: [...s.dirStack] };
}

/** What the first non-flag argument of a directory builtin asks for. */
type DirArg =
  | { kind: "none" }
  | { kind: "previous" }
  | { kind: "opaque" }
  | { kind: "word"; token: string };

function firstDirArg(args: string[]): DirArg {
  for (const a of args) {
    if (a === "--") continue;
    if (a === "-") return { kind: "previous" };
    if (a.startsWith("+")) return { kind: "opaque" }; // `pushd +2` rotates
    if (a.length > 1 && a.startsWith("-")) continue; // `-L`, `-P`, `-e`, `-n`
    return { kind: "word", token: a };
  }
  return { kind: "none" };
}

/**
 * Apply a segment's directory builtin, if it has one, to the running state.
 *
 * Only the first non-flag operand is read: `cd a b` is an error in bash, and
 * every other form the guard cannot model resolves to `unknown` rather than to
 * a guess.
 */
function applyDirEffect(
  state: ShellState,
  words: string[],
  literals: Map<string, string>,
): void {
  const idx = findCommandWord(words);
  if (idx === -1) return;

  const resolved = resolveWord(words[idx], literals);
  const raw = resolved.unresolved === true ? words[idx] : resolved.value;
  // `(cd rules && ls)` glues the subshell opener to the builtin; `tokenize`
  // strips it, so nothing is peeled here. (It used to be peeled HERE, for the
  // directory builtins only, because subshell scoping was unreachable
  // otherwise and widening the verbs was a gate decision. The gate passed.)
  const name = programName(raw);
  if (!DIR_BUILTINS.has(name)) return;

  const args = words.slice(idx + 1);

  if (name === "popd") {
    // `popd +1` / `popd -n` rotate or suppress rather than pop.
    if (args.some((a) => a.startsWith("+") || (a.length > 1 && a.startsWith("-")))) {
      state.prev = state.cwd;
      state.cwd = CWD_UNKNOWN;
      return;
    }
    const back = state.dirStack.pop();
    // An empty stack makes `popd` an error, and bash stays where it is.
    if (back === undefined) return;
    state.prev = state.cwd;
    state.cwd = back;
    return;
  }

  if (name === "pushd") state.dirStack.push(state.cwd);

  const target = firstDirArg(args);
  const here = state.cwd;
  const back = state.prev;
  state.prev = here;

  switch (target.kind) {
    case "none":
      // `cd` alone goes `$HOME`; a bare `pushd` rotates the stack, which the
      // guard does not model.
      state.cwd = name === "pushd" ? CWD_UNKNOWN : CWD_OUTSIDE;
      return;
    case "previous":
      // `cd -` is an exact swap of `$PWD` and `$OLDPWD`.
      state.cwd = back;
      return;
    case "opaque":
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
      state.cwd = w.unresolved === true ? CWD_UNKNOWN : resolveDir(here, w.value);
      return;
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
  | { kind: "unresolved"; token: string; viaCwd: boolean };

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

/** A written operand, with the exempt eligibility of the verb that named it. */
interface WrittenToken {
  token: string;
  exemptible: boolean;
  target: Target;
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
  const tokens: { token: string; exemptible: boolean }[] = [
    ...verb.written.map((token) => ({ token, exemptible: verb.exemptible })),
    // A redirection is not the verb's operand — `>` makes any program a write,
    // and that write is as ordinary as an `Edit`, so it stays eligible.
    ...redirectTargets.map((token) => ({ token, exemptible: true })),
  ];
  if (tokens.length === 0) return { hit: null, mutates: false };

  const written: WrittenToken[] = tokens.map((t) => ({
    ...t,
    target: resolveTarget(t.token, literals, opts, cwd),
  }));

  // Pass 1 — a target that resolves to a protected path.
  for (const { target, exemptible } of written) {
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

  // Pass 2 — a target that is an ancestor directory of a protected path.
  for (const { target, exemptible } of written) {
    if (target.kind !== "path") continue;
    const pattern = ancestorOfProtected(target.path, opts);
    if (pattern === null) continue;
    if (exemptible && opts.exempt?.(target.path, target.spelled) === true) {
      exempted.push(target.path);
      continue;
    }
    return {
      hit: {
        kind: "ancestor",
        path: target.path,
        pattern,
        refusalNote: refusalNoteFor(target, exemptible, opts),
      },
      mutates: true,
    };
  }

  // Pass 3 — fail-closed: a recognised mutation writing somewhere unknowable,
  // either because the operand does not resolve or because the directory it
  // hangs off does not.
  //
  // RECOGNISED is the whole bound, and it is the segment's PROGRAM that has to
  // be recognised, not the target. A redirection makes any program a mutation
  // for a target the guard can read — `curl -s … > rules/x.md` denies on pass 1
  // — but it does not drag the fail-closed rule into programs outside the
  // table. It used to: `npm test > "$LOG"` denied, while the three documents
  // stating the bound all said an unrecognised program is allowed however
  // unparseable its arguments are
  // (`issues/260801-1859_c_redirection-carries-fail-closed-into-unrecognised-programs-and-three-docs-deny-it.md`).
  // Denying it was also stricter than the table's own baseline, which allows
  // `curl -o rules/x.md` outright — a LITERAL protected path with an
  // unrecognised program. A rule cannot be looser on the visible case than on
  // the invisible one.
  //
  // A project with an EMPTY protected list has opted out, and an unresolvable
  // operand there protects nothing — so this pass, the only one that can deny
  // without a pattern to point at, is skipped. Passes 1 and 2 need no such
  // guard: they match against the empty list and find nothing.
  if (verb.written.length > 0 && opts.protectedPaths.length > 0) {
    for (const { token, target } of written) {
      if (target.kind === "unresolved") {
        return {
          hit: { kind: "unresolved", token, viaCwd: target.viaCwd },
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
      applyDirEffect(state, words, literals);
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

  if (hit.kind === "ancestor") {
    return {
      deny: true,
      mutates,
      reason: ancestorReason(
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
    reason: hit.viaCwd
      ? unknownCwdReason(offendingSegment, token)
      : unresolvedReason(offendingSegment, token),
    offendingSegment,
    targetPath: token,
  };
}
