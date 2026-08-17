`git clean`, `git restore` and `git stash` mutate protected paths and are in neither the table nor the residual list

---

**Severity: Medium.** Not a parser defect — a coverage decision that was never written down, so a
reader cannot tell the deliberate omissions from the forgotten ones.

`MUTATION_GIT_SUBCOMMANDS` (`hooks/lib/bash-mutation-guard.ts:303-306`) has two rows, `mv` and
`rm`, with the comment:

> Every other subcommand is a non-mutation here — including `git checkout … -- <paths>`, fusion's
> own revert strategy, which MUST stay allowed.

`git checkout -- <paths>` is a genuine, reasoned exception. The others are not addressed at all:

```
allow | "git restore --source=HEAD~1 rules/x.md"    <- overwrites a protected file from any commit
allow | "git clean -fdx rules"                       <- deletes every untracked file under rules/
allow | "git stash push rules/x.md"                  <- removes a protected file from the tree
allow | "git apply p.patch"                          <- writes whatever the patch says
DENY  | "git rm rules/x.md"
DENY  | "git mv rules/x.md /tmp/"
```

`git restore` is the modern synonym of `git checkout -- <paths>`, so allowing it is *consistent*
with the stated exception — but `--source=<commit>` makes it strictly more powerful than the
revert strategy it inherits its permission from. `git clean -fdx rules` and `git stash push` are
straightforward deletions with no revert-strategy argument behind them.

**The residual list does not mention any of this.** `rules/protected-path-discipline.md:177-201`
concedes stdin operands, unrecognised programs (naming `curl`, `python3 -c`, `eval`, `bash -c`,
`parallel`), verbs deliberately left out (`mkdir`, `chmod`, `chown`, `touch`, `tar`, `rsync`,
`patch`, `gzip`), walking out and back, sibling substitutions, the backslash-escaped paren, globs
and braces, and the plugin-repo stand-down. `git` is not an unrecognised program — it has its own
resolution path — and no line says which of its subcommands the check reaches. `README-hooks.md`
lists `git mv` and `git rm` in the verb table and is silent on the rest.

An agent reading the rule would reasonably conclude `git clean -fdx rules` is denied. It is not.

---

**Where the fix belongs.** Decide, then document, in that order.

1. **`git clean`** — the strongest candidate for a row. Its `-f`/`-d`/`-x` operands are paths, and
   the ancestor rule already covers the directory form, so `{ written: "all" }` reaches it. Note
   the flag grammar is small (`-e <pattern>` is the only value-taking flag that matters).
2. **`git restore`** — decide whether `--source=<commit>` should split it from the bare form. The
   bare form is the revert strategy and must stay allowed; the `--source` form is a different
   operation wearing the same name.
3. **`git stash push <paths>`** — bounded and rare; probably a residual rather than a row, but say
   so.
4. **`git apply` / `git am`** — a patch names its own targets, so a row would have to read the
   patch file. That is out of scope for a text classifier and belongs in the residual list with
   `patch`, which is already there.

Whatever is decided, `rules/protected-path-discipline.md` and `README-hooks.md` need one sentence
naming the git subcommands the check does **not** reach. The Circle's own standard
(commit `3806a49`, "correct five false claims") is that an unstated bound is a defect.

**Found by** coderev on the `17730b8..e31c0f3` review, by enumerating tree-mutating git
subcommands against `MUTATION_GIT_SUBCOMMANDS`.

---
Resolved: decided, then documented. `git clean`, `git restore` and `git stash` are now rows in `MUTATION_GIT_SUBCOMMANDS`; `git apply` / `git am` and a path-less `git clean -fdx` are stated residuals. `clean` and `restore` mutate only under a flag, which is what keeps the read and revert forms allowed — `git clean -n rules` is a dry run, `git restore rules/x.md` and `git restore --staged rules/x.md` are fusion's revert strategy, while `git clean -fdx rules` and `git restore --source=HEAD~1 rules/x.md` deny. `-e`/`--exclude` are value flags so `git clean -fdx -e rules/keep build` does not deny on the pattern it is told to spare. The `inPlaceOnly` seam was generalised to `mutatesOnlyWhen` (same shape, honest name) and is now asked of every flag token, since the flag that makes a verb a mutation can also be the one that takes a value.
