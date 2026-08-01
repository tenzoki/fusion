# coder — the two High review findings closed: one shared command-word resolver

**Date:** 2026-08-01 19:22
**Circle:** `circles/260801-1244-guard-bash-inspection`
**Review:** `reviews/260801-1905-coderev-guard-bash-inspection.md`
**Issues:**
`issues/260801-1857_c_compound-command-head-hides-the-verb-from-both-bash-classifiers.md`,
`issues/260801-1858_c_a-backslash-escaped-command-word-is-unrecognised-by-both-classifiers.md`
**Status:** Complete

Both findings are the same defect in two spellings: a word in command position that the
classifier reads as the program name when it is not. `if`, `sudo` and `\` each cost one
token and bought the whole table. They are closed together because the fix is one thing —
a single answer to "which word names the program", consumed by both Bash classifiers.

## The shape of the fix

New module `hooks/lib/command-word.ts`. It owns `GRAMMAR_PREFIXES`, `WRAPPER_PROGRAMS`,
`ENV_ASSIGNMENT_RE`, `findCommandWord`, `programName`, the wrapper skip and the wrapper
walk, and exports one entry point:

```ts
resolveInvocation(words, literals): { name, args } | null
```

It sits **above** `shell-parse.ts` on purpose. That module is the lexer — what the words
of a segment *are*. This one is the first interpretation of them — which word is the
command. Keeping them apart is what lets the lexer stay free of policy tables.

`bash-mutation-guard.ts` lost ~90 lines to the move and `verbOperands` is now six lines.
`git-branch-guard.ts` lost `findGitInvocation` entirely: a segment is a git call when its
resolved command word is `git`.

## What went into `GRAMMAR_PREFIXES`, and what did not

Added: `if`, `elif`, `while`, `until` (the compound-command heads the review named) and
`coproc`.

The rule the set now states explicitly: **a reserved word belongs here when it is
followed by a COMMAND in the same position.** That is the four heads, the three body
introducers already present (`then`, `else`, `do`), `!`, `{`, `(` and `coproc`. On the
same reasoning these were considered and left out:

- **Terminators** — `fi`, `done`, `esac`, `}`. Nothing follows them inside one segment; a
  command after one is behind a `;` or a newline, which segments. `done > rules/x.md` was
  already caught, because redirection is scanned position-independently.
- **Name-introducers** — `for`, `case`, `select`, `in`, `function`. Each is followed by a
  NAME, not a command. Skipping `for` would read the loop variable as the program.
- **`time`** — the one reserved word that is also a real program. Already a wrapper row,
  which is where it belongs.

`exec` went in as a `WRAPPER_PROGRAMS` row (`-a` is its one value-taking flag). It
replaces the shell with the words that follow, which is `sudo`'s grammar exactly.

**`eval` and `bash -c` stayed out, deliberately.** Their argument is a STRING bash
re-parses, not an argument list, so a wrapper row would be right for `eval "rm x"`, wrong
for `eval 'rm x'` and meaningless for `eval "$cmd"`. Half a rule reads as a whole one.
They stay documented residuals, and the reasoning is now written on the table rather than
left implicit.

## The git-classifier asymmetry: removed, not documented

The issue offered (a) share the resolution or (b) leave it and narrow the claim. Taken:
**(a), and (b) as well**, because the claim was false either way.

The git classifier is five months older and had none of the three skips. Sharing closes,
in one change, four separate bypasses of the branch policy — the compound head, the body
introducer, the wrapper and the escaped command word:

```
before  ->  after
allow   ->  DENY   if git switch main; then :; fi
allow   ->  DENY   while git switch main; do :; done
allow   ->  DENY   do git switch main
allow   ->  DENY   sudo git switch main
allow   ->  DENY   exec git switch main
allow   ->  DENY   \git switch main
allow   ->  DENY   "git" switch main
allow   ->  DENY   if git worktree add ../wt f; then :; fi
```

No verdict in the pinned 84-case git suite changed; the suite pinned none of these forms.
The 99 cases it now holds are the same 84 plus the new block.

## The backslash: two ordering decisions, both pinned

`resolveWord` removes a backslash escape from each CODE part (never from a captured
single-quoted literal, where bash suppresses the escape).

1. **Against the unresolved check** — the unescape runs AFTER the `$`/backtick test. So
   `rm \$FOO` stays a fail-closed deny rather than resolving to a file literally named
   `$FOO`. Over-blocking is the safe direction; the other order turns a deny into an
   allow. Pinned by a test and stated in the code.
2. **Blank mode** — untouched. The change is in `resolveWord`, not `stripDataRegions`, so
   the byte-pinned equivalence property is unaffected. The git classifier picks the fix up
   by consuming the shared resolver instead of matching on the raw token.

**One thing the issue did not anticipate: the escape was a bypass in OPERAND position
too.** `rm hooks/config\.json` was allowed. The residual's reasoning — "an escape can only
shorten a word, so it costs no allow" — has the direction backwards: an escape KEPT in the
word LENGTHENS it, and a protected pattern with no glob in it stops matching. Glob
patterns (`rules/**`) hid this, because `.*` matches the stray backslash too.

The one escape still lost is `\)`, and for a reason that is not `resolveWord`'s:
`tokenize` peels a `(…)` subshell's parentheses first. The residual is restated with its
real mechanism rather than left as written.

## New residuals, named rather than half-fixed

`case` arms and function definitions leave an ordinary-looking word in command position
(`build) rm rules/x.md;;`, `f() { rm rules/x.md; }`) that no table can distinguish from a
program name — `tokenize` has already peeled the `)` that would have identified it. Both
classifiers are blind to the verb behind them. Fixing that needs the lexer to report the
strip, which is a different change with its own false-positive surface; naming it is worth
more today than a partial job, and the review's own point stands: an agent that meets a
bypass and knows it is a bypass behaves differently from one that does not.

## Documentation corrected

`hooks/guard.ts:11-13` claimed "a complete choke-point against autonomous branch drift".
It is a choke-point on the tool CALL. Narrowed, and `hooks/lib/git-branch-guard.ts:5-7`
carried the same overclaim in the same words — the review found the first, the second was
found by grepping for the claim rather than for the file.
`rules/git-branch-discipline.md` needed no correction to its bound (commit `3806a49` got
it right) but did need the new forms: what the guard sees through, and `case` arms in the
residual sentence. `rules/protected-path-discipline.md` and `README-hooks.md` gained the
grammar-word and escape handling, `exec` in the wrapper list, the two new residuals, and
the corrected backslash bullet.

## Tests

677 pass, up from 656. `npx tsc --noEmit` clean.

- `GRAMMAR_PREFIXES` is driven off the exported set in both directions, so a token added
  later without a case fails there rather than shipping unexercised — the shape the
  wrapper exhaustiveness test already used.
- The wrapper exhaustiveness test picked up `exec` by construction.
- Deny blocks for every form in both issues, in both classifiers; allow blocks for the
  same forms over non-mutating verbs, so the widening cannot be passing for the wrong
  reason.
- **The 72-command must-never-deny corpus passes in full and is now 81.** The nine added
  are the conditional and loop forms the widening put at risk — `if [ -f x ]; then …`,
  `while read -r f; do …; done`, `until curl …; do …; done`, `if cd hooks && npm test`,
  `exec npm test`. Ordinary agent work is full of these; checking was not optional.

## Files

- `hooks/lib/command-word.ts` (new)
- `hooks/lib/shell-parse.ts` — `resolveWord` unescape
- `hooks/lib/bash-mutation-guard.ts` — moved out, rewired
- `hooks/lib/git-branch-guard.ts` — rewired, docstring narrowed
- `hooks/guard.ts` — docstring narrowed
- `hooks/lib/__tests__/bash-mutation-guard.test.ts`, `hooks/lib/__tests__/git-branch-guard.test.ts`
- `rules/git-branch-discipline.md`, `rules/protected-path-discipline.md`, `README-hooks.md`
- `hooks/dist/**` rebuilt by `npm test`, including two NEW files
  (`hooks/dist/lib/command-word.js`, `.d.ts`) that a `git add -u` would miss.
