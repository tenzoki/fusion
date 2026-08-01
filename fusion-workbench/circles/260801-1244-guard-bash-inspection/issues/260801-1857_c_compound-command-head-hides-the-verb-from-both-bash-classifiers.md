A compound-command head (`if`, `while`, `until`, `elif`) hides the verb from BOTH Bash classifiers, and `exec` does the same

---

**Severity: High.** One extra word bypasses the whole mutation table, and the same word bypasses
the git branch policy.

`findCommandWord` (`hooks/lib/bash-mutation-guard.ts:498-506`) skips a fixed set of tokens before
it reads the command word:

```ts
const GRAMMAR_PREFIXES = new Set(["{", "(", "!", "then", "else", "do"]);
```

`then`, `else` and `do` are the *body* introducers. The *head* introducers — `if`, `elif`,
`while`, `until` — are absent, and in bash each of them takes a command list. So the verb sits
one token behind a word the classifier reads as the program name, finds unrecognised, and allows.

Verified against the shipped `hooks/dist/lib/bash-mutation-guard.js` with the shipped
`protectedPaths`:

```
allow | "if rm -rf rules/x.md; then echo ok; fi"
allow | "if rm -rf agents; then :; fi"
allow | "while rm rules/x.md; do :; done"
allow | "until rm rules/x.md; do :; done"
allow | "exec rm -rf rules"
DENY  | "rm -rf rules/x.md"                       <- the same command without the prefix
DENY  | "while :; do rm rules/x.md; done"         <- `do` IS in the set, so the body form is caught
```

The last two lines are the point: the mechanism is understood for the body position and simply
missing for the head position.

**It is not covered by any documented residual.** `rules/protected-path-discipline.md:177-201`
lists stdin operands, unrecognised programs, absent verbs, walking out and back by name, sibling
`$(…)` substitutions, the backslash-escaped `)`, literal glob and brace matching, and the
plugin-repo stand-down. A recognised verb behind a grammar keyword is none of those — the program
IS `rm`, and the classifier fails to name it.

---

**The same hole is in the git branch classifier, and it is pre-existing.**

`classifyGitCommand` locates the git invocation with its own scan and has no grammar-prefix skip
and no wrapper skip at all:

```
DENY  | "git switch main"
allow | "if git switch main; then :; fi"
allow | "while git switch main; do :; done"
allow | "exec git switch main"
allow | "sudo git switch main"
allow | "if git worktree add ../wt f; then :; fi"
```

`sudo git switch main` matters on its own: `WRAPPER_PROGRAMS`
(`hooks/lib/bash-mutation-guard.ts:279-296`) exists precisely because "a wrapper is a one-word
bypass of the whole table", and the git classifier never got that treatment.

This makes a claim in the changed source false. `hooks/guard.ts:11-13`:

> Branch policy — DENIES branch/worktree-moving git operations (git is reachable only via Bash,
> so this is a complete choke-point against autonomous branch drift).

It is not a complete choke-point. Commit `3806a49` corrected exactly this class of overclaim in
`rules/git-branch-discipline.md` (naming `eval` and `bash -c` as the bound); the correction did
not reach `guard.ts`'s own header, and the bound it states is narrower than the truth.

---

**Where the fix belongs.**

1. **`GRAMMAR_PREFIXES`** — add `if`, `elif`, `while`, `until`. Each is a reserved word in command
   position; none is a program, so the skip cannot mis-identify anything (the same argument the
   comment at `bash-mutation-guard.ts:308-313` already makes for the existing entries). Note
   `time` is already a `WRAPPER_PROGRAMS` row, which covers the one reserved word that is also a
   real program.
2. **`exec`** — a `WRAPPER_PROGRAMS` row with no flags of consequence (`-c`, `-l`, `-a NAME`;
   only `-a` takes a value).
3. **The git classifier** — decide whether it consumes the same two skips. It is a separate
   module with a separate suite, and the honest options are (a) share `findCommandWord` and
   `WRAPPER_PROGRAMS` between the two classifiers, or (b) leave it and narrow the claim at
   `guard.ts:11-13` and in `rules/git-branch-discipline.md` to say so. Option (a) is the clean
   integrated fix; option (b) is the one that must happen either way, because the claim is
   currently false whichever route is taken.

**Tests.** `hooks/lib/__tests__/bash-mutation-guard.test.ts` has a `describe("shell grammar around
the command word")` block; it covers `{`, `(`, `!`, `then`/`else`/`do` and the env-assignment
prefix, and no compound-command head. One `it()` per keyword, deny-side, plus the paired allow
(`if ls; then :; fi`) is the whole change.

**Found by** coderev on the `17730b8..e31c0f3` review, by enumerating bash reserved words against
`GRAMMAR_PREFIXES` and probing the compiled classifier.

---
Resolved: `GRAMMAR_PREFIXES` moved to the new `hooks/lib/command-word.ts` and widened
with the compound-command heads `if`, `elif`, `while`, `until` plus `coproc`; `exec`
added as a `WRAPPER_PROGRAMS` row. The asymmetry with the git classifier was closed
rather than documented — option (a) of the three: both classifiers now resolve the
command word through the one shared module, so `sudo git switch main`,
`if git switch main; then :; fi`, `do git switch main` and `exec git switch main` all
deny exactly as the bare form does. The set holds only the reserved words that are
followed by a COMMAND in the same position; the terminators (`fi`, `done`, `esac`, `}`)
and the name-introducers (`for`, `case`, `select`, `in`, `function`) are deliberately
out, with the reasoning recorded on the constant. `case` arms and function definitions
leave an ordinary-looking word in command position that no table can distinguish from a
program, and are now named as residuals in `rules/protected-path-discipline.md`,
`rules/git-branch-discipline.md`, `README-hooks.md` and the module docstrings. The
false claim at `hooks/guard.ts:11-13` is narrowed to a choke-point on the tool call, and
`hooks/lib/git-branch-guard.ts:5-7` carried the same overclaim and is narrowed with it.
Tests: `GRAMMAR_PREFIXES` is driven off the exported set in both directions, the wrapper
exhaustiveness test picks up `exec`, the git suite gains three deny blocks and a
does-not-manufacture-a-deny block, and nine conditional/loop forms joined the
must-never-deny corpus.
