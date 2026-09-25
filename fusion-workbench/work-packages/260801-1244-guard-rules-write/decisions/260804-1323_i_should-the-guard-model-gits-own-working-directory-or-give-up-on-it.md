# Should the guard model git's own working directory, or give up on it?

---
**Domain:** code (security control)
**Status:** implemented
**Filed by:** coder, Turn 10 task T10-1
**Cross-references:**
`260804-1024_*_…` (the defect this answers, and the three candidate directions),
`260804-1026_*_…` (its sibling, answered in `## The second question` below),
`260804-1224-coderev-turn9-joiner-for-the-moving-segment.md:218` (the remaining ledger that ordered the two),
`260803-2338_*_…` and `260804-0947_*_…` (the give-up stance this question tests against),
`260804-0106_*_…` (the fail-closed bound the give-up option leans on),
`hooks/lib/__tests__/bash-mutation-guard.test.ts:196` (the one `-C` row in the suite, which pins the opposite direction).

---

## Question

`resolveGit` walks git's global options to find the subcommand, and to do that it
steps over `-C <dir>`, `--git-dir` and `--work-tree` — keeping none of them. The
subcommand's relative operands are then resolved against the SHELL's working directory
instead of git's, so `git -C rules rm x.md` resolves to `x.md`, matches nothing, and
allows. Measured deleting `rules/x.md` in bash and zsh at git 2.49.0.

This is the eighth instance of the class the Circle has spent nine Turns on — the
classifier asserting a working directory the shell is not standing in — and the first that
**fails open by confident resolution** rather than by giving up. Every `cd` form the module
cannot model degrades to `CWD_UNKNOWN` and denies; `git -C` does not degrade at all.

The choice has to be made now because the boundary sentence this Circle wants —
"an agent cannot write a protected path through a shell without a human decision" — is
false while it is open, and because `git checkout` (`260804-1026_*_git-checkout-treeish-overwrites-a-protected-path-and-is-in-neither-the-verb-table-nor-the-residual-list.md`) lives in the same
function and cannot be closed without touching this walk.

## Options

1. **Give up.** Any `-C` / `--work-tree` makes the whole invocation's directory unknown,
   so every relative operand denies fail-closed. Consistent with `applyDirEffect` and with
   the stance the last four Turns converged on.
   - Pros: asserts nothing new; one line; structurally cannot allow.
   - Cons: measured below — it denies 2.25× as many commands as option 3, and the extra
     denies are ordinary work.
2. **Model it.** Record the `-C` value as the invocation's base directory and resolve the
   subcommand's operands against it; give up when it is not literal.
   - Pros: precise, and the deny reason names the real path (`rules/x.md`) rather than an
     unknowable directory.
   - Cons: measured below — it **newly allows**, which no Turn of this Circle has done.
3. **Document it as a residual.** Cheapest; leaves a no-flag route to `agents/**` and
   `rules/**` in the accepted column.

A fourth appeared once options 1 and 2 were measured against each other, and it is what
shipped:

4. **Union — model it, and keep the shell's directory as a second candidate.** An operand
   is checked against every directory the guard can attribute to the invocation: the
   shell's own, and each directory a global option redirects git to. Deny if any candidate
   lands protected; fail closed if any candidate is unnameable.

## Constraints

1. **No command may newly allow.** Every Turn of this Circle has held it.
2. Both directions measured, in bash and zsh, through the real guard subprocess, one fresh
   project per case, with the real-shell effect asserted and no deny reading `[HALTED]`.
3. Cost stated as a rule with examples labelled an open set — never a closed list.
4. Measured on a generated cross-product, not a harvest of the suite.
5. The git BRANCH classifier must not move, and is pinned by a gold fixture.

## Measured

One generated cross-product: 26 global-option spellings × 20 subcommands × 13 operands ×
5 command heads × 6 `cd` prefixes × 4 tails, plus a non-git control axis — **811,210
distinct commands × 2 environments = 1,622,420 evaluations** per variant, each variant
diffed against `HEAD` (`cc012fc`) row by row.

| Variant | same | newly deny | newly ALLOW |
|---|---|---|---|
| 1 — give up | 1,309,950 | 312,470 | **0** |
| 2 — model, substituting | 1,471,560 | 129,440 | **21,420** |
| 4 — union (shipped) | 1,483,560 | 138,860 | **0** |

**Option 2 is disqualified by constraint 1**, and the rows say why plainly. Under
substitution, `git -C /repo mv rules/x.md docs/`, `git -C /tmp rm agents/coder.md` and
`git --work-tree=/tmp rm rules/x.md` all ALLOW: the flag is taken as proof that the
protected path spelled out in the command belongs to some other tree. Each of those is a
deny the guard has had since the check was written, and the first is the suite's own row
at `bash-mutation-guard.test.ts:196`.

**Option 1's cost is real and it is ordinary work.** It denies 173,610 commands that
option 4 allows — among them `git -C build rm out.js`, `git -C build clean -fdx`,
`git -C /tmp rm junk` and `git -C .. checkout HEAD~1 -- build/out.js`. The deny reason it
would give is also wrong in the way `CWD_UNKNOWN_UNPROVEN_CD` was written to avoid: it
says "a `cd` moved somewhere only known at run time" about a `-C` whose operand is a
literal, and rewriting the path cannot help.

Real-shell effects behind the verdicts, one fresh repository per row, bash and zsh, git
2.49.0 (`guard-bash-integration.test.ts`, "a git directory flag reaches the protected
list"):

```
  rules/x.md        GONE          git -C rules rm x.md
  agents/coder.md   GONE          git -C agents rm coder.md
  rules/x.md        GONE          git --work-tree=rules clean -fdx
  rules/untracked   GONE          git -C rules clean -fdx
  rules/x.md        REVERTED      git -C rules restore --source=HEAD~1 x.md
  agents/coder.md   GONE          git -C rules -C ../agents rm coder.md
  rules/x.md        GONE          git --namespace foo rm rules/x.md
```

## Answer

**Option 4.** The rule it states, and the reason it is not a special case:

> An operand is checked against every directory the guard can attribute to the
> invocation. A directory fact may only ever ADD reach, never remove it.

The union is not a hedge about what `-C` means — `-C` is exact and the model follows it
exactly. It is a refusal to spend a newly-learned fact on WITHDRAWING a deny. The guard is
an over-approximation of the paths a command may write; it has always denied
`mv $SRC rules/` on the visible protected operand rather than reasoning about where `$SRC`
might point, and `git -C /repo mv rules/x.md docs/` is the same shape. The structural
consequence is the property the whole change rests on and it is checkable rather than
hoped for: a candidate can only add a resolution, so it can only add a deny.

Three facts fell out of the same walk and are answered here rather than left implicit:

- **`--work-tree` is recorded, `--git-dir` is not.** `--work-tree` relocates pathspec
  resolution (`git --work-tree=rules clean -fdx` deleted `rules/x.md`); `--git-dir` names
  where the metadata lives and moves no pathspec. Measured, not assumed.
- **An unrecognised global option is read BOTH ways.** `git --namespace foo rm rules/x.md`
  deleted a protected rule because `foo` landed in subcommand position and the invocation
  read as an unrecognised program. Adding `--namespace` to a table would close the
  instance and leave the class, and the class includes options git has not shipped yet. So
  when the word in subcommand position matches no row and an unrecognised option stands in
  front of it, the next word is tried too. The cost is a rule, not a list: a false deny of
  the shape `git <unknown-option> <non-subcommand> <mutation-verb> <protected>`, of which
  `git --no-pager diff rm rules/x.md` — where `rm` is a file — is an example.
- **`git clean` with no pathspec stops being a residual.** It was listed as one because it
  "names no directory the ancestor check can compare". That was wrong about git: with no
  pathspec, `clean` deletes from the CURRENT directory down. Measured —
  `cd rules && git clean -fdx` removed `rules/junk.txt` and left the root's and `build`'s
  alone. The operand it does not spell is `.`, and supplying it is what makes
  `git -C rules clean -fdx` deny. A plain `git clean -fdx` at the project root still
  allows: the root is excluded from the ancestor check on purpose.

## The second question — `git checkout`, and the promise it collides with

`260804-1026_*_git-checkout-treeish-overwrites-a-protected-path-and-is-in-neither-the-verb-table-nor-the-residual-list.md` is answered here because it is the same walk and the same Turn.
`rules/protected-path-discipline.md` promises, in every agent's context in every consuming
project, that `git checkout HEAD -- rules/x.md` is fusion's own revert strategy and is
always allowed. Adding `checkout` to the table unconditionally would deny exactly the
paths that promise is about.

**The promise is kept, and the finding closes anyway**, because the distinction it needs
is one the table already draws for the other spelling of the same operation. `git restore`
is discriminated by `--source=`: the default source is the revert strategy, a named source
is an overwrite. `git checkout` takes its source as a POSITIONAL tree-ish instead, which is
the only reason `mutatesOnlyWhen` had nothing to hook onto. So:

> `git checkout` writes its paths when it names a tree-ish that is not `HEAD`, and writes
> nothing when it names none or names `HEAD`.

That is not a carve-out invented to save the promise. It makes the two spellings of one
operation agree, which is the finding's own complaint — and the test that pins it asserts
the pair (`git restore --source=HEAD~1 rules/x.md` denies, `git checkout HEAD~1 --
rules/x.md` denies, `git restore rules/x.md` allows, `git checkout HEAD -- rules/x.md`
allows) rather than either half alone.

Two costs, both stated as rules with open example sets:

- **Only the literal `HEAD` is proven inert.** The set of spellings denoting the same
  commit is open; `@`, `HEAD~0`, `HEAD^0` and the current branch's own name are examples,
  and all deny. Over-denying is the safe direction and the documented spelling is the way
  through.
- **Without `--`, the first positional is read as the tree-ish**, the way git reads it when
  it resolves as a rev. `git checkout rules/a.md rules/b.md` therefore denies on the
  second path although both are paths. `git checkout HEAD -- rules/a.md rules/b.md` and
  `git checkout -- rules/a.md rules/b.md` both allow.

**The branch classifier did not move.** `git-branch-guard.ts` is untouched, `shell-parse.ts`
is untouched, and the gold fixture (`fixtures/git-verdicts-head.json`, 4 override sets ×
its rows) reproduces byte for byte. `git checkout main`, `git checkout -b feature` and
`git checkout --detach HEAD~3` are pinned as allows in the MUTATION suite precisely so
that if the two policies ever start reporting each other's permission, a test says so.

---
Answered: 2026-08-04, Turn 10 (T10-1) — option 4, the union, with the `checkout` tree-ish
rule as its sibling answer.
Implemented: Turn 10 (T10-1), `hooks/lib/bash-mutation-guard.ts` — commit hash pending;
the orchestrator commits this Turn and owns filling it in here.

---
Implemented: `613d6fd` — the union rule shipped as described above; measured 0 newly allowing out of 1,622,420 evaluations, and structurally so, because a directory fact only ever adds a candidate resolution.

---
Retired: `ba7ccda` (260807-0931_*_plan-guard-misst-statt-orakelt.md) — the union rule `613d6fd` shipped lived in `hooks/lib/bash-mutation-guard.ts` and was deleted with the classifier. The guard models no working directory, git's or the shell's, because it reads no command text at all.
