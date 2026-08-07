/**
 * Command-word resolution — which token of a segment names the program.
 *
 * `git-branch-guard.ts` asks it before it asks its own: which word decides
 * whether the segment is a git call at all. A retired mutation classifier asked
 * the same question for its verb table, and answered it better — it skipped
 * shell grammar and saw through wrapper programs where the git classifier
 * skipped neither, so `sudo git switch main` and `do git switch main` walked
 * straight through a policy `git switch main` is denied by. That asymmetry was
 * accidental rather than decided
 * (`issues/260801-1857_c_compound-command-head-hides-the-verb-from-both-bash-classifiers.md`),
 * and this module removed it by giving both one answer. One of the two consumers
 * is gone now; the answer stays here rather than folding back into the git
 * classifier, because the resolution and the git policy are different questions
 * and the suite tests them apart.
 *
 * It sits ABOVE `shell-parse.ts` deliberately. That module is the lexer — what
 * the words of a segment ARE. This one is the first interpretation of them —
 * which word is the command. Keeping them apart is what lets the lexer stay
 * free of policy tables.
 *
 * ## Three things stand between the segment and its verb
 *
 *   - a leading `VAR=value` ENVIRONMENT ASSIGNMENT (`FOO=1 rm x`);
 *   - a shell GRAMMAR word that is not a program (`if`, `while`, `{`, `!`, …);
 *   - a WRAPPER program that runs another program (`sudo`, `xargs`, `exec`, …),
 *     whose own flags have to be consumed so the wrapper's argument is not read
 *     as the command.
 *
 * Each is a ONE-WORD bypass of whatever table sits behind it, which is why they
 * are handled here rather than per classifier.
 *
 * This module is PURE and EXPORTED so it is unit-testable without the hook
 * firing. It never touches the filesystem, the environment, or the process.
 */

import { resolveWord } from "./shell-parse.js";

/**
 * Tokens that are shell GRAMMAR rather than a program, skipped when looking for
 * the command word so `{ rm rules/x.md; }` and `if rm rules/x.md; then …` are
 * still classified. Skipping these cannot mis-identify an ordinary program:
 * none of them is one, and the one reserved word that IS also a real program
 * (`time`) is a `WRAPPER_PROGRAMS` row instead.
 *
 * The set holds every reserved word that is followed by a COMMAND in the same
 * position — the compound-command heads (`if`, `elif`, `while`, `until`), the
 * body introducers (`then`, `else`, `do`), negation (`!`), the group opener
 * (`{`), the subshell opener (`(`, which `tokenize` normally strips before this
 * is reached), and `coproc`. It deliberately does NOT hold the terminators
 * (`fi`, `done`, `esac`, `}`) or the words that introduce a NAME rather than a
 * command (`for`, `case`, `select`, `in`, `function`): a terminator is never
 * followed by a command inside one segment, and skipping a name-introducer
 * would read the name as the program.
 *
 * Holding the heads and not the bodies was the bug this set was widened to fix:
 * `while :; do rm rules/x.md; done` denied because `do` was here, while
 * `if rm -rf rules; then :; fi` allowed because `if` was not.
 */
export const GRAMMAR_PREFIXES: ReadonlySet<string> = new Set([
  "{",
  "(",
  "!",
  "if",
  "elif",
  "then",
  "else",
  "while",
  "until",
  "do",
  "coproc",
]);

/** A leading `VAR=value` environment assignment before the command word. */
export const ENV_ASSIGNMENT_RE = /^[A-Za-z_][A-Za-z0-9_]*=/;

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
 *
 * The list is a BOUND as much as a feature. A program that runs another program
 * and is not a row still hides the verb underneath it — `parallel rm rules/x.md`
 * is the obvious one, left out because its flag grammar is large enough to be
 * its own false-positive risk. `eval` and `bash -c` are left out for a
 * different reason: they take a STRING that bash re-parses, so consuming their
 * arguments as a command would be right for `eval "rm x"`, wrong for
 * `eval 'rm x'` and meaningless for `eval "$cmd"`. Half a rule reads as a whole
 * one, so they stay documented residuals instead. Adding a wrapper is a row,
 * not a code path.
 *
 * ## No row here says anything about a SHELL BUILTIN, and the empty space is
 * ## deliberate
 *
 * This table answers one question — which words are the wrapped command — and
 * the answer is the same for every consumer. It briefly answered a second one,
 * `runsBuiltins`: can this wrapper run a shell builtin in the CALLING shell, so
 * that the directory model may follow a `cd` through it? Three rows were marked
 * from a measurement, and the marking was a REGRESSION within the commit that
 * wrote it (`issues/260803-2236_…runsbuiltins-is-asserted-about-a-name…`):
 *
 *   - `command cd sub` moves the shell in bash and is INERT in zsh, whose
 *     `command` forces an external lookup — and zsh is what the Bash tool runs;
 *   - `time cd sub` moves the shell only as the bare reserved word. `\time`,
 *     `'time'`, `"time"` and `/usr/bin/time` all select the external program,
 *     which moves nothing — and those are exactly the spellings `resolveWord`
 *     and `programName` are built to erase, because for a VERB `\rm` really is
 *     `rm`.
 *
 * The fact is therefore not a property of the NAME this table is keyed on. It
 * is a property of the spelling and of which shell is running, and this module
 * can prove neither. Marking it wrong is not a safe over-deny: a modelled move
 * relocates every later relative operand, so it denies when it moves the operand
 * ONTO the protected list and ALLOWS when it moves it off.
 *
 * So the fact is gone, and `Invocation.reachesBuiltin` is now computed from what
 * this module CAN see — see that field. Adding a wrapper stays one row, and the
 * row cannot carry a claim about a shell.
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
  // `builtin cd rules` was in no table at all, so nothing in either classifier
  // saw through it and `builtin rm rules/x.md` read as the unrecognised program
  // `builtin`. Its own flag grammar is empty.
  builtin: {},
  // `exec` REPLACES the shell with the command that follows, so its words are
  // that command's words exactly as `sudo`'s are. `-a NAME` is its one
  // value-taking flag (`-c` and `-l` take none). A bare `exec > file` runs no
  // command at all and leaves nothing to resolve — the redirection scanner
  // still sees the target.
  exec: { valueFlags: ["-a"] },
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
 * Own-property lookup in one of the tables. A plain `table[name]` would answer
 * with an inherited `Object.prototype` member for a program named `constructor`
 * or `toString`, which is nonsense rather than a row.
 */
export function row<T>(
  table: Readonly<Record<string, T>>,
  name: string,
): T | undefined {
  return Object.hasOwn(table, name) ? table[name] : undefined;
}

/** Index of the command word, skipping env assignments and grammar prefixes. */
export function findCommandWord(words: string[]): number {
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    if (ENV_ASSIGNMENT_RE.test(w)) continue;
    if (GRAMMAR_PREFIXES.has(w)) continue;
    return i;
  }
  return -1;
}

/** `/bin/rm` → `rm`. A local script named `rm` is treated as `rm` (fail-closed). */
export function programName(word: string): string {
  const slash = word.lastIndexOf("/");
  return slash === -1 ? word : word.slice(slash + 1);
}

/**
 * Consume a wrapper's own flags, environment assignments and positionals,
 * returning the words of the command it runs. An empty result means the wrapper
 * ran nothing this resolver can see (`sudo -v`, a bare `env`).
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

/** The program a segment runs, and the arguments it runs it with. */
export interface Invocation {
  /** Basename of the resolved command word: `/bin/rm` and `\rm` are both `rm`. */
  name: string;
  /** Everything after the command word, wrapper words already consumed. */
  args: string[];
  /**
   * If `name` is a SHELL BUILTIN, can this module prove the calling shell ran
   * it as one? True on exactly two conditions, both readable from the segment
   * text alone:
   *
   *   1. **No wrapper hop.** The segment names the program directly. A wrapper
   *      in front of a builtin is a claim about the wrapper AND about the shell
   *      — `command cd` moves bash and not zsh — and no such claim can be read
   *      off the text (`issues/260803-2236_…`). So every hop answers false,
   *      including `command` and `builtin`, whose whole purpose is to run one.
   *   2. **No path separator in the command word.** `programName` maps
   *      `/usr/bin/rm` to `rm` because for a VERB the two really are the same
   *      program. For a builtin the erasure is backwards: a path names an
   *      external file, and `/usr/bin/cd` is a real binary on macOS that changes
   *      its own process's directory and exits, leaving the shell where it was.
   *      Measured inert in bash 3.2 and zsh 5.9.
   *
   * QUOTING AND BACKSLASH ARE NOT A THIRD CONDITION, and the asymmetry with
   * `time` is the whole reason the second condition is worded over the SLASH.
   * `\cd`, `'cd'` and `"cd"` were measured moving the shell in both shells:
   * quoting suppresses alias expansion and reserved-word recognition, and `cd`
   * is neither — it is a builtin, and a builtin is still found. `time` IS a
   * reserved word, which is why quoting demotes it to `/usr/bin/time`; it needs
   * no clause here because condition 1 already answers false for it.
   *
   * NOTHING READS THIS TODAY. Its one reader was the virtual-cwd model in the
   * retired mutation classifier, which treated false as "give up on the whole
   * directory state" and never as "the shell stayed put". The field stays
   * because it is a measured property of each wrapper — whether it can run a
   * shell builtin at all — and re-measuring it later is expensive; a future
   * reader must keep the give-up reading, since asserting a `cd` you cannot
   * prove relocates every later relative operand.
   */
  reachesBuiltin: boolean;
}

/**
 * Resolve a segment's words to the program they run, or null when they run
 * nothing this resolver can name (an empty segment, a bare wrapper).
 *
 * Wrappers are skipped in a LOOP rather than once, so `sudo env rm rules/x.md`
 * reaches the same `rm` a bare invocation would. The loop terminates because a
 * hop always drops at least the wrapper's own command word, so `rest` strictly
 * shrinks; the bound is the word count and exists only so a future edit cannot
 * turn this into an unbounded loop. A FIXED cap would be worse than none:
 * `sudo sudo … rm rules/x.md` is a real command, and a chain one longer than
 * the cap would walk straight through the classifier.
 *
 * The command word is resolved through `resolveWord`, which is what makes
 * `'rm' -rf x` (quoted), `"git" switch main` (double-quoted) and `\rm -rf x`
 * (backslash-escaped, the alias-suppression idiom) name the programs they
 * actually are. A command word that is itself an EXPANSION (`$CMD foo`) cannot
 * be named, and is returned raw so it matches no table row — the documented
 * residual, and the same verdict as any unrecognised program.
 */
export function resolveInvocation(
  words: string[],
  literals: Map<string, string>,
): Invocation | null {
  let rest = words;
  // Set by the first hop and never cleared: a wrapper stands between the shell
  // and the command word, so the command word is not what the shell resolved.
  // See `Invocation.reachesBuiltin`.
  let viaWrapper = false;

  for (let hop = 0; hop <= words.length; hop++) {
    const cmdIdx = findCommandWord(rest);
    if (cmdIdx === -1) return null;

    const resolved = resolveWord(rest[cmdIdx], literals);
    const raw = resolved.unresolved === true ? rest[cmdIdx] : resolved.value;
    const name = programName(raw);
    const args = rest.slice(cmdIdx + 1);

    const wrapper = row(WRAPPER_PROGRAMS, name);
    if (wrapper === undefined) {
      // `raw`, not `name`: `programName` has already thrown the path away, and
      // the path is the whole question. See `Invocation.reachesBuiltin`.
      return { name, args, reachesBuiltin: !viaWrapper && !raw.includes("/") };
    }

    viaWrapper = true;
    rest = skipWrapper(wrapper, args);
  }

  return null;
}
