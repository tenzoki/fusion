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
 * Output redirection (`>`, `>>`, `>|`, `N>`, glued or separated) is scanned
 * separately and position-independently, because a redirection binds to the
 * whole simple command wherever it appears — `>` makes ANY program a mutation.
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
 * One residual is a PARSER consequence and not a choice made here:
 * `shell-parse` lifts a `$(…)` / backtick body out into its own segment and
 * leaves a single space behind, so a substitution used as an OPERAND vanishes
 * rather than surviving as an unresolvable word. `rm $(echo rules/x.md)`
 * therefore reaches this classifier as a bare `rm` with no positionals and is
 * allowed, where `rm $VAR` denies. The substitution's own body is still
 * classified, so `$(rm rules/x.md)` denies; only the case where the verb is
 * outside and the path is inside slips through. Closing it means making the
 * lifted substitution leave an unresolvable token behind in capture mode,
 * which is a change to `shell-parse` and to the deny surface, so it is stated
 * here rather than patched around.
 *
 * This module is PURE and EXPORTED so it is unit-testable without the hook
 * firing. It never touches the filesystem, the environment, or the process:
 * the protected list, the project-relative normaliser and the exemption
 * predicate all arrive through `MutationOptions`.
 */

import { normalize as normalizePath } from "node:path";
import { matchesAny } from "./paths.js";
import { parseCommand, resolveWord, tokenize } from "./shell-parse.js";

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
  const spec = MUTATION_GIT_SUBCOMMANDS[sub];
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

/** The written operands named by the segment's verb, if it recognises one. */
function verbOperands(
  words: string[],
  literals: Map<string, string>,
): string[] {
  const cmdIdx = findCommandWord(words);
  if (cmdIdx === -1) return [];

  // Resolved against the literal table so `'rm' -rf x` is still `rm`.
  const resolved = resolveWord(words[cmdIdx], literals);
  // A command word that is itself an expansion (`$CMD foo`) names an
  // unrecognised program → allowed, per the documented residual.
  const raw = resolved.unresolved === true ? words[cmdIdx] : resolved.value;
  const name = programName(raw);
  const args = words.slice(cmdIdx + 1);

  if (name === "git") {
    const git = resolveGit(args);
    return git === null ? [] : writtenOperands(git.spec, git.args);
  }

  const spec = MUTATION_VERBS[name];
  return spec === undefined ? [] : writtenOperands(spec, args);
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

/** A written operand, resolved as far as the guard can take it. */
type Target =
  | { kind: "path"; path: string }
  | { kind: "unresolved" }
  | { kind: "empty" };

function resolveTarget(
  token: string,
  literals: Map<string, string>,
  opts: MutationOptions,
): Target {
  const resolved = resolveWord(token, literals);
  if (resolved.unresolved === true) return { kind: "unresolved" };
  if (resolved.value.length === 0) return { kind: "empty" };

  // Glob metacharacters are matched as LITERAL text rather than expanded, which
  // is fail-closed for the patterns that matter: `rules/**` compiles to
  // `^rules/.*$` and therefore matches the literal string `rules/*.md`.
  const path = normalizePath(opts.normalize(resolved.value));
  return { kind: "path", path };
}

/* ------------------------------------------------------------------ *
 * Classification
 * ------------------------------------------------------------------ */

type SegmentHit =
  | { kind: "protected"; path: string }
  | { kind: "unresolved"; token: string };

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
 * Classify one already-segmented command. Returns the offending target, or null
 * when the segment writes nothing protected.
 *
 * A resolved protected match is reported in preference to an unresolved
 * operand, so `mv $SRC rules/` denies naming the visible protected target
 * rather than the variable.
 */
function classifySegment(
  segment: string,
  literals: Map<string, string>,
  opts: MutationOptions,
  nextSegmentHead?: string,
): SegmentHit | null {
  const tokens = tokenize(segment);
  if (tokens.length === 0) return null;

  const { words, redirectTargets } = scanSegment(tokens, nextSegmentHead);
  const written = [...verbOperands(words, literals), ...redirectTargets];
  if (written.length === 0) return null;

  const targets = written.map((t) => resolveTarget(t, literals, opts));

  // Pass 1 — a target that resolves to a protected path.
  for (const target of targets) {
    if (target.kind !== "path") continue;
    if (!isProtected(target.path, opts)) continue;
    if (opts.exempt?.(target.path) === true) continue;
    return { kind: "protected", path: target.path };
  }

  // Pass 2 — fail-closed: a recognised mutation writing somewhere unknowable.
  for (let i = 0; i < targets.length; i++) {
    if (targets[i].kind === "unresolved") {
      return { kind: "unresolved", token: written[i] };
    }
  }

  return null;
}

/**
 * Classify a full (possibly compound) Bash command string against the guard's
 * protected paths. Segments the command; if ANY segment writes a protected
 * path, or is a recognised mutation with an unresolvable target, the whole call
 * is denied.
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

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    // A redirection operator left dangling by the `&` / `|` segment split
    // finds its target at the head of the next same-depth segment.
    const next = segments[i + 1];
    const nextHead =
      next !== undefined && next.depth === segment.depth
        ? tokenize(next.text)[0]
        : undefined;

    const hit = classifySegment(segment.text, literals, opts, nextHead);
    if (hit === null) continue;

    const offendingSegment = renderSegment(segment.text, literals);

    if (hit.kind === "protected") {
      return {
        deny: true,
        reason: protectedReason(offendingSegment, hit.path),
        offendingSegment,
        targetPath: hit.path,
      };
    }

    const token = renderWord(hit.token, literals);
    return {
      deny: true,
      reason: unresolvedReason(offendingSegment, token),
      offendingSegment,
      targetPath: token,
    };
  }

  return { deny: false };
}
