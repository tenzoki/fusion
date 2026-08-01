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
 * A leading WRAPPER program (`WRAPPER_PROGRAMS` below) is skipped rather than
 * read as the command, so `sudo rm rules/x.md` and `sudo env rm rules/x.md`
 * classify as the `rm` they are. Each wrapper's own flags — and, for `timeout`,
 * its duration operand — are consumed by the wrapper's row, so the skip never
 * assumes the second word is the verb.
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
 * The wrapper list is the same kind of bound. A program that runs another
 * program and is not a row still hides the verb underneath it — `parallel rm
 * rules/x.md` is the obvious one, and it is left out because its flag grammar
 * is large enough to be its own false-positive risk. Adding a wrapper is a row,
 * not a code path.
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

import { normalize as normalizePath } from "node:path";
import { matchesAny } from "./paths.js";
import {
  SUBSTITUTION_FILLER,
  parseCommand,
  resolveWord,
  tokenize,
} from "./shell-parse.js";

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
   * Present when the verb only mutates under an in-place flag (`sed -i`,
   * `perl -i`). Returns true for a flag token that turns it into a mutation.
   */
  inPlaceOnly?: (flag: string) => boolean;
  /** `key=value` operands that name a written file (`dd of=…`). */
  keyOperands?: readonly string[];
}

/**
 * `sed`'s in-place flag. GNU accepts an attached suffix (`-i.bak`) and clusters
 * short flags (`-ni`); BSD takes the suffix as a separate mandatory argument
 * (`-i ''`). Reading "an `i` among the short-flag letters" covers all of them
 * with no platform branch.
 */
function isSedInPlaceFlag(flag: string): boolean {
  if (flag.startsWith("--")) return /^--in-place(=|$)/.test(flag);
  return shortFlagLetters(flag).includes("i");
}

/** `perl -i` / `-i.bak` / `-pi`. `-I` (include path) is a different flag. */
function isPerlInPlaceFlag(flag: string): boolean {
  if (flag.startsWith("--")) return false;
  return shortFlagLetters(flag).includes("i");
}

/** The letter run of a short-flag token: `-i.bak` → `i`, `-ni` → `ni`. */
function shortFlagLetters(flag: string): string {
  const m = /^-([A-Za-z]*)/.exec(flag);
  return m === null ? "" : m[1];
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
 *   - A row is reached THROUGH a wrapper (`WRAPPER_PROGRAMS`). `sudo rm …`,
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
  ln: { written: "last", targetDir: "replaces" },
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
    inPlaceOnly: isSedInPlaceFlag,
  },
  perl: {
    written: "all",
    valueFlags: ["-e", "-f"],
    inPlaceOnly: isPerlInPlaceFlag,
  },
};

/**
 * A program that RUNS another program. Its own flags (and, for `timeout`, one
 * positional) are consumed, and whatever follows is classified as the real
 * command — otherwise `sudo rm rules/x.md` reads as the unrecognised program
 * `sudo` and is allowed, which is a one-word bypass of the whole table.
 *
 * THE FLAGS ARE THE WHOLE DIFFICULTY. A wrapper's value-taking flag swallows
 * the next token, so `sudo -u root rm x` must not read `root` as the command,
 * and `timeout 5 rm x` must not read `5` as it. Only the SHORT forms need
 * listing: `--user=root` and `--kill-after=5s` are single tokens and fall out
 * of the generic "a token starting with `-` is a flag" rule.
 *
 * `positionalArgs` is the wrapper's own non-flag arguments before the command
 * word — one for `timeout` (the duration), none for anything else. `nice -5`
 * needs no entry: it starts with `-` and is skipped as an ordinary flag.
 *
 * Skipping a wrapper cannot manufacture a false positive on its own. It only
 * ever exposes an inner command word to the SAME table; if the inner program is
 * not a verb the verdict is unchanged. `command -v rm` becomes a bare `rm` with
 * no operands, which writes nothing.
 */
export interface WrapperSpec {
  /** Short flags that consume the FOLLOWING token as their value. */
  valueFlags?: readonly string[];
  /** The wrapper's own positional arguments, before the wrapped command word. */
  positionalArgs?: number;
}

export const WRAPPER_PROGRAMS: Readonly<Record<string, WrapperSpec>> = {
  sudo: {
    valueFlags: ["-u", "-g", "-p", "-C", "-h", "-r", "-t", "-T", "-U", "-D"],
  },
  doas: { valueFlags: ["-u", "-C"] },
  env: { valueFlags: ["-u", "-C", "-S"] },
  command: {},
  nice: { valueFlags: ["-n"] },
  ionice: { valueFlags: ["-c", "-n", "-p"] },
  timeout: { valueFlags: ["-s", "-k"], positionalArgs: 1 },
  xargs: {
    valueFlags: ["-n", "-P", "-I", "-L", "-l", "-s", "-E", "-d", "-a"],
  },
  time: { valueFlags: ["-o", "-f"] },
  nohup: {},
  setsid: {},
  stdbuf: { valueFlags: ["-i", "-o", "-e"] },
};

/**
 * Mutating `git` subcommands. Every other subcommand is a non-mutation here —
 * including `git checkout … -- <paths>`, fusion's own revert strategy, which
 * MUST stay allowed (`git-branch-guard.ts` owns the branch question).
 */
export const MUTATION_GIT_SUBCOMMANDS: Readonly<Record<string, VerbSpec>> = {
  mv: { written: "all" },
  rm: { written: "all" },
};

/**
 * Tokens that are shell GRAMMAR rather than a program, skipped when looking for
 * the command word so `{ rm rules/x.md; }` and `do rm rules/x.md` are still
 * classified. Skipping these cannot mis-identify an ordinary program: none of
 * them is one.
 */
const GRAMMAR_PREFIXES = new Set(["{", "(", "!", "then", "else", "do"]);

/** A leading `VAR=value` environment assignment before the command word. */
const ENV_ASSIGNMENT_RE = /^[A-Za-z_][A-Za-z0-9_]*=/;

/* ------------------------------------------------------------------ *
 * Deny reasons
 * ------------------------------------------------------------------ */

const NO_WORKAROUND =
  " Do not rephrase the command — the guard segments compound commands and " +
  "inspects subshells — and do not re-route through Edit or Write, which are " +
  "guarded on the same list. STOP and ask the user.";

function protectedReason(segment: string, path: string): string {
  return (
    `fusion policy: this Bash command writes a protected path. The segment ` +
    `\`${segment}\` writes \`${path}\`, which is under compliance guard ` +
    `protection.` +
    NO_WORKAROUND
  );
}

function ancestorReason(
  segment: string,
  path: string,
  pattern: string,
): string {
  return (
    `fusion policy: this Bash command writes a directory that CONTAINS a ` +
    `protected path. The segment \`${segment}\` writes \`${path}\`, which ` +
    `contains \`${pattern}\` — under compliance guard protection. Removing or ` +
    `moving the directory would take the protected path with it.` +
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

/** Index of the command word, skipping env assignments and grammar prefixes. */
function findCommandWord(words: string[]): number {
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    if (ENV_ASSIGNMENT_RE.test(w)) continue;
    if (GRAMMAR_PREFIXES.has(w)) continue;
    return i;
  }
  return -1;
}

/**
 * Own-property lookup in one of the tables. A plain `table[name]` would answer
 * with an inherited `Object.prototype` member for a program named `constructor`
 * or `toString`, which is nonsense rather than a row.
 */
function row<T>(table: Readonly<Record<string, T>>, name: string): T | undefined {
  return Object.hasOwn(table, name) ? table[name] : undefined;
}

/** `/bin/rm` → `rm`. A local script named `rm` is treated as `rm` (fail-closed). */
function programName(word: string): string {
  const slash = word.lastIndexOf("/");
  return slash === -1 ? word : word.slice(slash + 1);
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
  let inPlace = false;
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
    if (a.length > 1 && a.startsWith("-")) {
      if (spec.inPlaceOnly?.(a) === true) inPlace = true;
      continue;
    }
    positionals.push(a);
  }

  // A verb that only mutates in place is not a mutation without its flag.
  if (spec.inPlaceOnly !== undefined && !inPlace) return [];

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

/**
 * Consume a wrapper's own flags, environment assignments and positionals,
 * returning the words of the command it runs. An empty result means the wrapper
 * ran nothing this classifier can see (`sudo -v`, a bare `env`).
 */
function skipWrapper(spec: WrapperSpec, args: string[]): string[] {
  let i = 0;
  while (i < args.length) {
    const a = args[i];
    // `env FOO=1 rm x`, `sudo FOO=1 rm x` — an assignment is not the command.
    if (ENV_ASSIGNMENT_RE.test(a)) {
      i++;
      continue;
    }
    if (a === "--") {
      i++;
      break;
    }
    if (a.length > 1 && a.startsWith("-")) {
      i += spec.valueFlags?.includes(a) === true ? 2 : 1;
      continue;
    }
    break;
  }
  return args.slice(i + (spec.positionalArgs ?? 0));
}

/**
 * The written operands named by the segment's verb, if it recognises one.
 *
 * Wrappers are skipped in a loop rather than once, so `sudo env rm rules/x.md`
 * reaches the same `rm` a bare invocation would. The loop terminates because a
 * hop always drops at least the wrapper's own command word, so `rest` strictly
 * shrinks; the bound is the word count and exists only so a future edit cannot
 * turn this into an unbounded loop. A FIXED cap would be worse than none:
 * `sudo sudo … rm rules/x.md` is a real command, and a chain one longer than
 * the cap would walk straight through the classifier.
 */
function verbOperands(
  words: string[],
  literals: Map<string, string>,
): string[] {
  let rest = words;

  for (let hop = 0; hop <= words.length; hop++) {
    const cmdIdx = findCommandWord(rest);
    if (cmdIdx === -1) return [];

    // Resolved against the literal table so `'rm' -rf x` is still `rm`.
    const resolved = resolveWord(rest[cmdIdx], literals);
    // A command word that is itself an expansion (`$CMD foo`) names an
    // unrecognised program → allowed, per the documented residual.
    const raw = resolved.unresolved === true ? rest[cmdIdx] : resolved.value;
    const name = programName(raw);
    const args = rest.slice(cmdIdx + 1);

    const wrapper = row(WRAPPER_PROGRAMS, name);
    if (wrapper !== undefined) {
      rest = skipWrapper(wrapper, args);
      continue;
    }

    if (name === "git") {
      const git = resolveGit(args);
      return git === null ? [] : writtenOperands(git.spec, git.args);
    }

    const spec = row(MUTATION_VERBS, name);
    return spec === undefined ? [] : writtenOperands(spec, args);
  }

  return [];
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
  | { kind: "path"; path: string }
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
  const path = normalizePath(opts.normalize(joined));
  return { kind: "path", path };
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
  // `(cd rules && ls)` glues the subshell opener to the builtin. The
  // spaced form `( cd rules …` is already handled by GRAMMAR_PREFIXES.
  const name = programName(raw.replace(/^\(+/, ""));
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
 * around its own `cd` and discard it. Single-quoted text is already an opaque
 * placeholder and contributes nothing. Double-quoted text is not, so
 * `echo "(x)"` counts a balanced pair it should not; that opens and closes a
 * scope around one innocuous segment and changes no verdict.
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
  | { kind: "protected"; path: string }
  | { kind: "ancestor"; path: string; pattern: string }
  | { kind: "unresolved"; token: string; viaCwd: boolean };

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

/**
 * Classify one already-segmented command's words. Returns the offending target,
 * or null when the segment writes nothing protected.
 *
 * The three passes are ordered by how well the verdict explains itself: a
 * direct protected match first, then a directory containing one, then the
 * fail-closed case. So `mv $SRC rules/` denies naming the visible protected
 * target rather than the variable, and `rm -rf hooks $X` names `hooks`.
 */
function classifyWords(
  words: string[],
  redirectTargets: string[],
  literals: Map<string, string>,
  opts: MutationOptions,
  cwd: Cwd,
): SegmentHit | null {
  const written = [...verbOperands(words, literals), ...redirectTargets];
  if (written.length === 0) return null;

  const targets = written.map((t) => resolveTarget(t, literals, opts, cwd));

  // Pass 1 — a target that resolves to a protected path.
  for (const target of targets) {
    if (target.kind !== "path") continue;
    if (!isProtected(target.path, opts)) continue;
    if (opts.exempt?.(target.path) === true) continue;
    return { kind: "protected", path: target.path };
  }

  // Pass 2 — a target that is an ancestor directory of a protected path.
  for (const target of targets) {
    if (target.kind !== "path") continue;
    const pattern = ancestorOfProtected(target.path, opts);
    if (pattern === null) continue;
    if (opts.exempt?.(target.path) === true) continue;
    return { kind: "ancestor", path: target.path, pattern };
  }

  // Pass 3 — fail-closed: a recognised mutation writing somewhere unknowable,
  // either because the operand does not resolve or because the directory it
  // hangs off does not.
  for (let i = 0; i < targets.length; i++) {
    const target = targets[i];
    if (target.kind === "unresolved") {
      return { kind: "unresolved", token: written[i], viaCwd: target.viaCwd };
    }
  }

  return null;
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
  if (!command || command.trim().length === 0) return { deny: false };
  // Nothing to protect: never deny, not even fail-closed. A project with an
  // empty list has opted out, and an unresolvable operand protects nothing.
  if (opts.protectedPaths.length === 0) return { deny: false };

  const { segments, literals } = parseCommand(command, { quoted: "capture" });

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
      const hit = classifyWords(words, redirectTargets, literals, opts, state.cwd);
      if (hit !== null) return denyVerdict(segment.text, literals, hit);
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

  return { deny: false };
}

/** Render a segment hit as the denying verdict it is. */
function denyVerdict(
  segmentText: string,
  literals: Map<string, string>,
  hit: SegmentHit,
): MutationVerdict {
  const offendingSegment = renderSegment(segmentText, literals);

  if (hit.kind === "protected") {
    return {
      deny: true,
      reason: protectedReason(offendingSegment, hit.path),
      offendingSegment,
      targetPath: hit.path,
    };
  }

  if (hit.kind === "ancestor") {
    return {
      deny: true,
      reason: ancestorReason(offendingSegment, hit.path, hit.pattern),
      offendingSegment,
      targetPath: hit.path,
    };
  }

  const token = renderWord(hit.token, literals);
  return {
    deny: true,
    reason: hit.viaCwd
      ? unknownCwdReason(offendingSegment, token)
      : unresolvedReason(offendingSegment, token),
    offendingSegment,
    targetPath: token,
  };
}
