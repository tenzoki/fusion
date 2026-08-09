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
export const GRAMMAR_PREFIXES = new Set([
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
export const WRAPPER_PROGRAMS = {
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
export function row(table, name) {
    return Object.hasOwn(table, name) ? table[name] : undefined;
}
/** Index of the command word, skipping env assignments and grammar prefixes. */
export function findCommandWord(words) {
    for (let i = 0; i < words.length; i++) {
        const w = words[i];
        if (ENV_ASSIGNMENT_RE.test(w))
            continue;
        if (GRAMMAR_PREFIXES.has(w))
            continue;
        return i;
    }
    return -1;
}
/**
 * `/bin/rm` → `rm`. A local script named `rm` is treated as `rm` (fail-closed).
 *
 * ## The name is CASE-FOLDED, and the fold happens HERE
 *
 * On a case-insensitive filesystem — APFS in its default configuration, so
 * every stock macOS install — the shell resolves `GIT` to the same binary as
 * `git`. The git classifier compared the resolved word against the literal
 * `"git"`, so the spelling alone flipped its verdict: `git switch main` denied
 * while `GIT switch main`, `Git switch main` and `gIt worktree add ../w x` all
 * allowed, with `zsh -c 'GIT --version'` and `bash -c 'GIT --version'` both
 * printing the git version
 * (`issues/260809-1110_*_the-command-word-comparison-is-case-sensitive-while-the-protected-path-match-folds.md`).
 *
 * The protected-path half of the same hook had already taken this decision and
 * written down why (`matchesAnyFolded`, `guard.ts` CHECK 2, `lib/paths.ts`): a
 * glob compiles to a case-SENSITIVE regex, so `AGENTS/coder.md` missed
 * `agents/**` — the whole protected list, one letter. The argument transfers
 * unchanged to the command word; it was simply never carried across.
 *
 * FOLDING CANNOT WIDEN AN ALLOW, which is why it belongs at the resolution
 * point rather than at each comparison. Two tables read the name this returns,
 * and neither grants anything:
 *
 *   - the git row in `git-branch-guard.ts` — a DENY table. Folding can only
 *     make MORE segments match it, never fewer.
 *   - `WRAPPER_PROGRAMS` here — a SKIP table, whose only effect is to expose an
 *     inner command word to that same deny table (`sudo git switch main` →
 *     `git switch main`). Folding it can only expose more inner words. It
 *     cannot hide a denied one, because no name in `WRAPPER_PROGRAMS` is also a
 *     denied name — `git` is not a wrapper — so no fold turns a classified
 *     program into a skipped one.
 *
 * `reachesBuiltin` does not read this value; it reads the RAW word, because the
 * path is the whole question there. See that field.
 *
 * UNCONDITIONAL, on every platform, matching the user's decision for the path
 * side (`decisions/260803-1419_*_how-should-the-protected-path-check-treat-the-case-of-a-path.md`):
 * a boundary that differs by filesystem has to be re-stated in every document
 * that describes it and is discovered rather than known. The cost on a
 * case-sensitive volume is near nil in the other direction too — there `GIT`
 * resolves to nothing and the command the guard now denies would have failed
 * with "command not found" anyway.
 *
 * `toLowerCase` rather than `toLocaleLowerCase`, for the reason `lib/paths.ts`
 * `foldCase` gives: the Unicode default mapping is the same everywhere, while
 * the locale-sensitive one is not — under a Turkish locale `GIT` would lower to
 * a dotless `gıt` and stop matching. A security boundary must not move with
 * `LANG`.
 *
 * If a consumer ever needs the command word AS SPELLED, add a field to
 * `Invocation` for it rather than making this comparison case-sensitive again.
 */
export function programName(word) {
    const slash = word.lastIndexOf("/");
    const base = slash === -1 ? word : word.slice(slash + 1);
    return base.toLowerCase();
}
/**
 * Consume a wrapper's own flags, environment assignments and positionals,
 * returning the words of the command it runs. An empty result means the wrapper
 * ran nothing this resolver can see (`sudo -v`, a bare `env`).
 */
function skipWrapper(spec, args) {
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
export function resolveInvocation(words, literals) {
    let rest = words;
    // Set by the first hop and never cleared: a wrapper stands between the shell
    // and the command word, so the command word is not what the shell resolved.
    // See `Invocation.reachesBuiltin`.
    let viaWrapper = false;
    for (let hop = 0; hop <= words.length; hop++) {
        const cmdIdx = findCommandWord(rest);
        if (cmdIdx === -1)
            return null;
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
