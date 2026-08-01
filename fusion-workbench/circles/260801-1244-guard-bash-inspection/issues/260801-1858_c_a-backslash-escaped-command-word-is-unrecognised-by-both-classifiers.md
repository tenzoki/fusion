A backslash-escaped command word (`\rm`, `\git`) is unrecognised by both Bash classifiers

---

**Severity: High.** One character bypasses the whole mutation table, and the same character
bypasses the git branch policy. `\rm` is idiomatic shell — it is how a user suppresses an alias —
so it is a form an agent can reach for without thinking of it as evasion.

`stripData` (`hooks/lib/shell-parse.ts:209-230`) emits every backslash escape pair verbatim in
code position, which is correct for the lexer's own purposes. Nothing downstream ever removes it:
`resolveWord` (`shell-parse.ts:703-743`) strips double quotes and expands capture placeholders but
leaves a backslash alone, and `programName` (`bash-mutation-guard.ts:518-521`) only takes a
basename. So the command word arrives as the literal string `\rm`, which is in no table.

Verified against the shipped `hooks/dist/` with the shipped `protectedPaths`:

```
allow | "\\rm -rf rules"
allow | "\\rm -rf agents"
allow | "\\mv rules/x.md /tmp/"
allow | "\\sed -i \"\" s/a/b/ rules/x.md"
allow | "r\\m -rf rules"
DENY  | "rm -rf rules"          <- the same command unescaped
DENY  | "/bin/rm rules/x.md"    <- basename stripping DOES work
```

And in the git classifier:

```
allow | "\\git switch main"
DENY  | "git switch main"
```

**It is not covered by any documented residual.** `rules/protected-path-discipline.md:192-194`
concedes exactly one backslash case:

> **No backslash escape is processed inside a word.** A backslash-escaped closing parenthesis in a
> filename (`rm x\)`) loses the paren. It can only shorten a word, so it costs no allow and buys
> no false deny.

That reasoning is about an **operand**, and it is sound there. It does not transfer to the
**command word**, where an unprocessed escape does not shorten a path — it renames the program out
of the table. The module docstring's summary of the same residual
(`bash-mutation-guard.ts` header) inherits the same gap.

---

**Where the fix belongs.**

`resolveWord` is "the single authority on what a word denotes"
(`bash-mutation-guard.ts:786-787`), so the escape belongs there and not in either classifier. In
code position bash removes a backslash and takes the next character literally; the one exception
already handled upstream is `\` + newline, spliced out in `stripData`.

The narrow, safe change is to unescape in `resolveWord`'s code parts — `part.text.replace(/\\(.)/g,
"$1")` after the `$`/backtick check, alongside the existing double-quote strip. That makes `\rm`
resolve to `rm` and `rm x\)` resolve to `x)`, which is *better* than the current shortening, not
worse. Two things to settle before writing it:

1. **Ordering against the unresolved check.** `\$FOO` is a literal `$FOO`, not an expansion. If
   unescaping runs after the `includes("$")` test, `rm \$FOO` stays a fail-closed deny — over-
   blocking, and the safe direction. If it runs before, the test must not then see the `$` it just
   un-escaped. Pick one deliberately and pin it.
2. **Blank mode must not change.** `stripDataRegions` is byte-pinned to the historical git
   behaviour by `shell-parse.test.ts`'s equivalence property; a change in `resolveWord` does not
   touch it, but the git classifier calls `tokenize` directly and would need the same treatment to
   close `\git switch main`.

**Tests.** Deny cases for `\rm`, `\mv`, `\cp`, `\sed -i`, `r\m` and `\git switch main`; allow cases
for `\ls rules/` and an escaped-space filename (`rm my\ file.txt` must not become two operands, or
must at least not deny).

**Found by** coderev on the `17730b8..e31c0f3` review, by probing the compiled classifier with
alias-suppression forms.

---
Resolved: `resolveWord` (`hooks/lib/shell-parse.ts`) now removes a backslash escape from
each CODE part, so `\rm`, `\git` and `r\m` resolve to the programs they run and both
classifiers see them. The two ordering questions the issue asked to settle first are
settled and pinned: (1) the unescape runs AFTER the `$`/backtick test, so `rm \$FOO`
stays a fail-closed deny — over-blocking, the safe direction — and the alternative order
would have turned a deny into an allow; (2) blank mode is untouched, because the change
is in `resolveWord` and not in `stripDataRegions`, and the git classifier picks the fix
up by consuming the shared command-word resolver instead of matching on the raw token.
One thing the issue did not anticipate: the escape was a bypass in OPERAND position too,
not only in the command word — `rm hooks/config\.json` was allowed, because a glob-free
protected pattern stops matching once the word carries an extra character. The pre-
existing residual's "it can only shorten a word" reasoning was wrong in that direction
as well. The one escape still lost is a backslash-escaped `)`, which `tokenize` peels
with the `(…)` subshell parentheses before `resolveWord` ever sees it; that residual is
restated with its real mechanism in `rules/protected-path-discipline.md` and
`README-hooks.md`.
