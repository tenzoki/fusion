# Turn 10, T10-1 — the two pre-existing git routes into the protected list

**Agent:** coder
**Circle:** `260801-1244-guard-rules-write`
**Task:** T10-1, dispatched by the orchestrator — close `260804-1024_*_git-c-supplies-a-directory-the-model-skips-so-a-relative-operand-resolves-off-the-protected-list.md` (High, `git -C`) and `260804-1026_*_git-checkout-treeish-overwrites-a-protected-path-and-is-in-neither-the-verb-table-nor-the-residual-list.md` (Medium, `git checkout <treeish>`), both pre-existing and older than this Circle.
**Status:** Complete
**Suite:** `npm test` — 24 files, **1299 passed**, 0 failed (baseline at HEAD `cc012fc`: 1252).

---

## The three answers the report leads with

- **Nothing newly allows.** 0 newly-allowing evaluations out of 1,622,420, on a generated cross-product.
- **The revert-strategy promise is intact**, and the finding closed anyway.
- **The branch classifier did not move** — gold fixture reproduces byte for byte, and `git-branch-guard.ts` / `shell-parse.ts` were never opened.

## What changed

`hooks/lib/bash-mutation-guard.ts` only. Four things, all in or around `resolveGit`:

1. **`-C` and `--work-tree` are recorded** instead of stepped over, and composed into
   candidate base directories for the invocation's own operands (`GitInvocation`,
   `gitRedirectedBases`, `stepDir`). `--git-dir` is skipped and deliberately not recorded.
2. **An unrecognised global option is read both ways**, so it cannot hide the subcommand.
3. **`checkout` joins `MUTATION_GIT_SUBCOMMANDS`** with a positional-role model
   (`VerbSpec.positionalModel`, `gitCheckoutWrites`) that writes only under a non-`HEAD`
   tree-ish.
4. **`clean` gets the same kind of model** (`gitCleanWrites`): with no pathspec it writes
   `.`, which is what `-C rules` and `cd rules` then resolve.

`WrittenToken.target` became `targets: Target[]`, and the three passes in `classifyWords`
iterate it. That is the whole structural change, and it is what makes "no command newly
allows" a property rather than a hope: a candidate can only ADD a resolution.

Documentation: `rules/protected-path-discipline.md` (the git table, a new "git carries its
own working directory" section, the corrected `:518` promise line, two residual entries),
`README-hooks.md` (the same facts in its own register).

## The design question, and why the answer is a fourth option

`260804-1024_*_git-c-supplies-a-directory-the-model-skips-so-a-relative-operand-resolves-off-the-protected-list.md` offered three directions. Both of the real ones were built and measured
against `HEAD` over the same corpus — 811,210 distinct commands × 2 environments:

| Variant | newly deny | newly ALLOW |
|---|---|---|
| 1 — give up on any `-C` | 312,470 | 0 |
| 2 — model it, substituting | 129,440 | **21,420** |
| 4 — union (shipped) | 138,860 | 0 |

Direction 2 is disqualified by constraint 1, and concretely: it turns
`git -C /repo mv rules/x.md docs/`, `git -C /tmp rm agents/coder.md` and
`git --work-tree=/tmp rm rules/x.md` into allows. The first of those is the suite's own
row at `bash-mutation-guard.test.ts:196`, which the task asked me to read before changing
anything — it pins a deny, the deny is still right, and it did not need inverting. I added
a comment to it saying what it now pins that it did not before.

Direction 1 costs 173,610 commands that the union allows, and they are ordinary work:
`git -C build rm out.js`, `git -C build clean -fdx`, `git -C /tmp rm junk`.

The union's rule: *an operand is checked against every directory the guard can attribute
to the invocation; a directory fact may only ever add reach, never remove it.* Argued and
costed in `260804-1323_*_…`.

## Finding 2 — the promise

The task was explicit that this might not be a patch. It was, and without touching the
promise: `git checkout` takes its source as a positional tree-ish where `git restore`
takes it as `--source=`, so the discrimination `restore` has always made can be restated
for checkout's spelling. `HEAD` (and no tree-ish at all) writes nothing; any other
tree-ish writes its paths. That makes the two spellings of one operation agree, which is
the finding's own complaint, so it is not the kind of special case this Circle has been
burned by — it removes a special case rather than adding one.

The costs are two, both stated as rules with open example sets: only the literal `HEAD` is
proven inert, and without `--` the first positional is the tree-ish.

No decision was made silently: the reasoning is in `260804-1323_*_…`,
`## The second question`.

## Three things found while in there

- **`git --namespace foo rm rules/x.md` deleted a protected rule** and allowed. Same eight
  lines, same class. Closed structurally (not by adding a row for `--namespace`, which
  would leave the class) and filed as `260804-1333_*_…` for the tracker.
- **`GIT_WORK_TREE=rules git clean -fdx` deletes `rules/x.md`** and still allows. NOT
  closed — it is a different mechanism (the classifier reads no variable but `CDPATH`,
  which is an argued exception), and closing it properly needs `command-word.ts`, which the
  branch classifier shares and T10-1's scope excludes. Filed as `260804-1332_*_…` (High)
  and added to both residual lists.
- **`git clean -fdx` with no pathspec was a wrong residual.** It was listed as naming "no
  directory the ancestor check can compare"; measured, `clean` deletes from the current
  directory down, so `cd rules && git clean -fdx` really does destroy untracked files under
  a protected directory. Now modelled.

Also measured and recorded as INERT, so a later reader does not add it on plausibility:
`git -c core.worktree=rules clean -fdx` does not relocate at git 2.49.0.

## Method

- **Measurement, not inference.** Every git semantic claim here was run in a throwaway
  repository first: `-C` composition, `--work-tree` composition onto `-C`, `--git-dir`'s
  non-effect, `clean`'s cwd scope, `checkout`'s `--` grammar, `-Crules` (rejected by git,
  so not modelled), `--namespace`, `--config-env`, `GIT_WORK_TREE`, `core.worktree`.
- **Generated cross-product, not a harvest**: 26 global-option spellings × 20 subcommands ×
  13 operands × 5 command heads × 6 `cd` prefixes × 4 tails, plus a non-git control axis,
  under two environments. Differential against `HEAD` row by row, for three variants.
- **Real guard subprocess and real shell, separately.** Verdict in one fresh project,
  effect in a second, per row, per shell — so no assertion shares a tree. bash and zsh.
  No deny read `[HALTED]` (asserted, not assumed).
- **Anti-vacuity by mutation**, eight mutants against a copy of the module:

  | # | mutation | unit tests failing |
  |---|---|---|
  | 1 | `-C` value not recorded | 5 |
  | 2 | `--work-tree` value not recorded | 3 |
  | 3 | shell cwd dropped from the candidate set | 2 |
  | 4 | checkout treats every tree-ish as inert | 4 |
  | 5 | checkout treats `HEAD` as a write too | 6 |
  | 6 | clean names nothing without a pathspec | 2 |
  | 7 | unknown option read one way only | 2 |
  | 8 | `-C` chain takes only the last hop | 1 |

  Module restored and verified byte-identical afterwards.

## Not done, and whose it is

- No commit — the orchestrator commits after validation. `260804-1323_*_…`
  carries an `Implemented:` line with the hash left pending for it.
- `hooks/dist/` restored to HEAD (`git checkout HEAD -- hooks/dist`), including the
  partial rebuild a previous agent's test run had left in the tree. `npm test` runs `tsc`,
  so a rebuild happens on every run; Plan Step 10 owns the real one.
- Out of scope and untouched: `git-branch-guard.ts`, `shell-parse.ts`, `command-word.ts`,
  issues `260804-1025_*_the-decision-procedure-tells-an-agent-the-model-stays-exact-for-the-two-commands-that-delete-a-rule-file.md` / `1220` / `1221` / `1222` / `1223`, plan steps 6 to 10.
