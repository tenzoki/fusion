The `git stash` row reads its sub-subcommand and its refs as written paths, so ordinary stash calls deny

---

**Severity: Medium.** A false-positive family introduced by `18e2e4f`, on a command fusion itself
leans on (`/fusion:circle-stash`). The reason the agent is given names a path that does not exist.

## What the row does

```ts
stash: { written: "all" },      // hooks/lib/bash-mutation-guard.ts:383
```

with the rationale at `:357-361`:

> "`stash push <paths>` REMOVES the named paths from the working tree. The row reads every
> positional, so the subcommand word of `git stash pop` and friends lands in the written set as the
> literal `pop` — a path that matches nothing, which is why one row covers the whole family without
> a sub-sub-command table."

"A path that matches nothing" holds only at the project root, and only for a sub-subcommand whose
name collides with no protected pattern. Neither condition is guaranteed.

## Measured, HEAD against `e31c0f3`

Protected list `["agents/**", "rules/**", "hooks/**"]` — fusion's own shape:

```
was allow, now DENY | cd hooks && git stash pop          -> writes `hooks/pop`
was allow, now DENY | cd $D && git stash pop             -> fail-closed on `pop`
was allow, now DENY | cd $D && git stash list            -> fail-closed on `list`
was allow, now DENY | git stash push -m "$MSG"           -> fail-closed on the MESSAGE
was allow, now DENY | git stash show "$REF"              -> fail-closed on a ref
was allow, now DENY | git stash apply "$STASH"           -> fail-closed on a ref
                DENY | git stash list > "$LOG"           -> the row makes the redirect fail-closed
```

Two distinct mechanisms, both from the same row:

1. **The sub-subcommand is joined to the virtual cwd.** `cd hooks && git stash pop` resolves `pop`
   to `hooks/pop`, which matches `hooks/**`. Every `git stash <anything>` run from inside a
   protected directory denies. An agent doing ordinary work in `hooks/` or `rules/` meets this on
   its first stash.
2. **Non-path arguments reach the fail-closed pass.** `-m` is not a value flag for the row, so
   `git stash push -m "$MSG"` treats the commit message as a written operand; a ref
   (`git stash show "$REF"`) is treated the same way. The deny reason tells the agent to "write the
   path out literally", which is not actionable for a message or a ref.

The redirect case is a knock-on: because the row reports a written operand for `git stash list`, the
`verbWritten.length === 0` gate at `:1081` no longer protects the redirect target, so
`git stash list > "$LOG"` denies where `npm test > "$LOG"` — the case `18e2e4f` set out to
allow — does not.

## What is actually mutating

Only `git stash push <pathspec>` (and its `git stash save` predecessor) names working-tree paths.
`pop`, `apply`, `list`, `show`, `drop`, `clear`, `branch`, `create`, `store` do not — and a bare
`git stash` with no subcommand stashes everything, naming nothing the ancestor check can compare
(the same residual as `git clean -fdx` with no operand, already stated at `:366-368`).

## Where the fix belongs

The row needs to know its own sub-subcommand, which is the thing the rationale was trying to avoid.
Two routes, either acceptable:

- give `resolveGit` a shallow second hop for `stash` — treat positionals as written only when the
  first one is `push` or `save`, and drop that word from the written set; or
- drop `stash` back out of the table and state it in the residual list, which is where it sat before
  `18e2e4f` and which `260801-1902_*_git-clean-restore-and-stash-mutate-protected-paths-and-are-in-neither-the-table-nor-the-residual-list.md` would also have accepted (that issue asked for "covered **or**
  documented", and the other two rows carry the value).

If the row stays, `-m` / `--message` belongs in its `valueFlags` regardless, next to `git clean`'s
`-e` for exactly the same reason: a message must not become a positional.

**Tests.** `cd hooks && git stash pop`, `git stash push -m "$MSG"`, `git stash show "$REF"` and
`git stash list > "$LOG"` belong in `ORDINARY_AGENT_COMMANDS`; `git stash push -- rules/x.md` and
`cd hooks && git stash push -- x.md` must stay denied. The current corpus pins `git stash`,
`git stash pop` and `git stash list` only at the project root, which is the one position where the
rationale holds.

**Found by** coderev on the `e31c0f3..HEAD` review, by running each new table row against the
virtual-cwd walk and the fail-closed pass rather than against the project root alone.

---
Resolved: `git stash` now models its own sub-subcommands through a second dispatch hop (`SubcommandDispatch` on `VerbSpec`, `GIT_STASH` in `bash-mutation-guard.ts`) — the sub-sub-command table the previous rationale was trying to avoid, taken because the thing it avoided reading turned out to be load-bearing. Only `push` names working-tree pathspecs; `pop`, `apply`, `list`, `show`, `drop`, `clear`, `branch`, `create`, `store` and `save` write nothing the classifier can name. `push` carries `-m` / `--message` / `--pathspec-from-file` as value flags, so a message never becomes a positional.

The model was measured against git 2.53.0, not assumed. `git stash -- rules/x.md` stashed that path and left a sibling file alone, so the bare form with a pathspec really is the implicit `push` and still denies — the `implicit` row exists for exactly that. `git stash foo` fails with "subcommand wasn't specified; 'push' can't be assumed due to unexpected token 'foo'", which is why an unrecognised literal word writes nothing rather than becoming a phantom path. Every non-push form was then run with a path operand (`git stash pop rules/x.md` and eight siblings): git refuses all of them and the file is untouched, so allowing them is correct rather than merely convenient. `git stash save rules/x.md` takes the path as its MESSAGE and stashes the whole tree — that reverts protected paths, but wholesale and without naming them, which is the pre-existing bare-`git stash` residual (the same shape as `git clean -fdx` with no operand) and not something this row ever caught deliberately.

All six measured false positives now allow: `cd hooks && git stash pop`, `cd $D && git stash pop`, `cd $D && git stash list`, `git stash push -m "$MSG"`, `git stash show "$REF"`, `git stash apply "$STASH"` — and `git stash list > "$LOG"`, which was the knock-on that re-opened the redirect case the sibling fix had closed. `git stash push rules/x.md`, `git stash push -u agents/`, `git stash -- rules/x.md` and `cd hooks && git stash push -- x.md` still deny.

Found while fixing, not in this issue: the obvious form of the fix opens a bypass. With the sub-subcommand read as a selector, `git stash $X rules/x.md` would allow, because `$X` matches no row — yet it may well expand to `push`. An unresolvable sub-subcommand is therefore fail-closed, while a literal unknown word (a typo git refuses) is not; the rest of the line is still read as the implicit form so the deny names `rules/x.md` rather than the variable, matching the pass ordering that makes `mv $SRC rules/` report `rules/`. A differential grid of 2,686 commands against the pre-fix build confirms every remaining verdict change is intended.
