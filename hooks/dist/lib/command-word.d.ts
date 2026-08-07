/**
 * Command-word resolution — which token of a segment names the program.
 *
 * Both Bash classifiers ask the same question before they ask their own:
 * `bash-mutation-guard.ts` needs the program name to look up a verb row, and
 * `git-branch-guard.ts` needs it to decide whether the segment is a git call at
 * all. They used to answer it separately, and the newer one answered it better:
 * the mutation classifier skipped shell grammar and saw through wrapper
 * programs, the git classifier skipped neither, so `sudo git switch main` and
 * `do git switch main` walked straight through a policy `git switch main` is
 * denied by. That asymmetry was accidental rather than decided
 * (`issues/260801-1857_c_compound-command-head-hides-the-verb-from-both-bash-classifiers.md`),
 * and this module removes it: one answer, consumed by both.
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
export declare const GRAMMAR_PREFIXES: ReadonlySet<string>;
/**
 * The reserved words that CLOSE a compound command: `fi`, `done`, `esac`, `}`.
 *
 * THIS IS A SECOND SET, NOT AN EXTENSION OF THE FIRST, and the separation is
 * the whole point. `GRAMMAR_PREFIXES` answers "which word is skipped when
 * looking for the command" — `findCommandWord` walks past every member of it.
 * This set answers a different question: which words END a construct, so a
 * reader of the shell's grammar can tell where a compound's body stops. Moving
 * these four into `GRAMMAR_PREFIXES` would make `findCommandWord` skip them and
 * change what counts as a command, which is a behaviour change in both
 * classifiers; keeping them apart costs one export and changes nothing.
 *
 * The two sets are DISJOINT by construction — an opener is followed by a
 * command in the same position and a terminator never is — and the suite pins
 * the disjointness so a word cannot drift into both.
 *
 * `case`/`esac` is the asymmetric row: `case` is deliberately absent from
 * `GRAMMAR_PREFIXES` (it introduces a WORD, not a command), while `esac` is
 * here because it still closes something. A consumer that tracks open heads
 * therefore sees an `esac` with no head to pop, which is the honest picture —
 * `case` is not modelled.
 *
 * `hooks/lib/shell-reach.ts` is the only reader today. It skips these words in
 * addition to `GRAMMAR_PREFIXES` when deciding whether a segment carries a
 * command at all, which is exactly the gap `findCommandWord` leaves and must
 * keep leaving.
 */
export declare const GRAMMAR_TERMINATORS: ReadonlySet<string>;
/** A leading `VAR=value` environment assignment before the command word. */
export declare const ENV_ASSIGNMENT_RE: RegExp;
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
export declare const WRAPPER_PROGRAMS: Readonly<Record<string, WrapperSpec>>;
/**
 * Own-property lookup in one of the tables. A plain `table[name]` would answer
 * with an inherited `Object.prototype` member for a program named `constructor`
 * or `toString`, which is nonsense rather than a row.
 */
export declare function row<T>(table: Readonly<Record<string, T>>, name: string): T | undefined;
/** Index of the command word, skipping env assignments and grammar prefixes. */
export declare function findCommandWord(words: string[]): number;
/** `/bin/rm` → `rm`. A local script named `rm` is treated as `rm` (fail-closed). */
export declare function programName(word: string): string;
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
     * Only the directory model in `bash-mutation-guard.ts` reads this, and it
     * treats false as "give up on the whole directory state", never as "the shell
     * stayed put". The verb classifier does not read it at all: every
     * `MUTATION_VERBS` row is an external program, which every wrapper here runs
     * perfectly well.
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
export declare function resolveInvocation(words: string[], literals: Map<string, string>): Invocation | null;
