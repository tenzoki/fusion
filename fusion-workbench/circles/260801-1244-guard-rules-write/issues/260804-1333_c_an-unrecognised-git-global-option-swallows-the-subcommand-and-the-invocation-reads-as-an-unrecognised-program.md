# An unrecognised git global option swallows the subcommand, and the invocation reads as an unrecognised program

---

**Severity:** High
**Domain:** code (security control)
**Filed by:** coder, Turn 10 task T10-1 — **found and closed in the same Turn**, filed for the tracker rather than for a later pass
**Affects:** `hooks/lib/bash-mutation-guard.ts` (`resolveGit`)
**Kind:** PRE-EXISTING, and older than this Circle. The flag walk has had this shape since it was written.
**Cross-references:**
`260804-1024_c_…` (the sibling gap in the same eight lines, and the reason this one was met at all),
`decisions/260804-1323_i_…` (`## Answer`, third bullet — the structural answer and its cost).

---

## What was wrong

`resolveGit` walked git's global options looking for the subcommand, consuming the value
of the four options it knew (`-C`, `-c`, `--git-dir`, `--work-tree`) and treating every
other `-`-prefixed token as valueless. A global option that DOES take a separated value
therefore left its value standing in subcommand position, where it matched no row — and
the whole invocation read as an unrecognised program and allowed.

Measured deleting, fresh repository, bash, git 2.49.0:

```
>>> git --namespace foo rm rules/x.md
    rm 'rules/x.md'
    [rules/x.md=GONE]
```

The control:

```
  DENY   git rm rules/x.md
```

`--namespace` is the instance git 2.49 happens to ship. It is not the defect. Every option
the table does not carry has this shape, including options git has not shipped yet, which
is why it was not closed by adding a row.

## How it was closed

Structurally, in `resolveGit`: when the word in subcommand position matches no row AND an
unrecognised option stands immediately in front of it, the NEXT word is tried as a
subcommand too. A second candidate can only add a match, so it can only add a deny.

The cost is stated as a rule with an open example set, in
`rules/protected-path-discipline.md` and `README-hooks.md`: a false deny of the shape
`git <unknown-option> <non-subcommand> <mutation-verb> <protected-path>`, of which
`git --no-pager diff rm rules/x.md` — where `rm` is a file — is an example. The bound: with
no unrecognised option in front, the walk stops at the first non-flag word exactly as it
did, so `git diff rm rules/x.md` and `git commit -m rm rules/x.md` are untouched.

---

Resolved: T10-1, `hooks/lib/bash-mutation-guard.ts` `resolveGit`. Pinned by
`bash-mutation-guard.test.ts` ("reads an option it cannot name BOTH ways" and "states the
cost of reading an option both ways as a rule, not a list") and end to end, with the
real-shell effect asserted in bash and zsh, by `guard-bash-integration.test.ts`
(`git --namespace foo rm rules/x.md`). Anti-vacuity: mutant 7 of the T10-1 battery
(candidate list narrowed back to one) fails 2 tests.
