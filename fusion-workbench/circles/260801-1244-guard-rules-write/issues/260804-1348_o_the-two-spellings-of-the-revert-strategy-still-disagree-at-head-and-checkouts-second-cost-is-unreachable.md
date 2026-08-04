# The two spellings of the revert strategy still disagree at `HEAD`, and `checkout`'s second stated cost is unreachable

---

**Severity:** Medium
**Domain:** code (security control, and the claim made for it)
**Filed by:** coderev, review of `613d6fd`
**Affects:** `hooks/lib/bash-mutation-guard.ts:741-743` (`isGitRestoreSourceFlag`), `:947-951` (the `restore` row), `:887` / `:914-936` (`GIT_CHECKOUT_INERT_TREEISH`, `gitCheckoutWrites`); `rules/protected-path-discipline.md:86-104`; `decisions/260804-1323_i_…` `## The second question`
**Kind:** The `restore --source=HEAD` deny is PRE-EXISTING. What is NEW in `613d6fd` is the claim that the two spellings now agree, which the `HEAD` spelling falsifies — and that is the one spelling the whole argument is about.
**Cross-references:**
`issues/260804-1026_c_…` (the finding, whose complaint was "the same operation in two spellings disagreeing"),
`decisions/260804-1323_i_…` (`## The second question`, where the claim is made and the costs are stated).

---

## What is wrong — part 1, the claim

The decision record says of the `checkout` tree-ish model:

> That is not a carve-out invented to save the promise. **It makes the two spellings of one
> operation agree**, which is the finding's own complaint.

and the rule file says, at `:89`: *"Now they agree."*

Measured, real guard subprocess, one fresh project per case:

```
ALLOW   git checkout HEAD -- rules/x.md
block   git restore --source=HEAD rules/x.md
block   git restore --source HEAD rules/x.md

ALLOW   git restore rules/x.md                    # restores from the INDEX, a different op
block   git checkout HEAD~1 -- rules/x.md
block   git restore --source=HEAD~1 rules/x.md
```

`git checkout HEAD -- <path>` and `git restore --source=HEAD <path>` are the **same
operation**: restore the file to its committed state. One allows, the other denies. That is
the disagreement `260804-1026` was filed about, surviving at exactly the spelling the
promise protects.

`git restore <path>` is *not* the equivalent — it restores from the index, not from `HEAD` —
so the allowed `restore` form is not a substitute for the denied one.

The asymmetry has an honest architectural cause, and it should be written down rather than
papered over: `restore` is discriminated by `mutatesOnlyWhen`, which receives the **flag
token** and nothing else. It sees `--source=HEAD` as a whole and could in principle inspect
the value, but it never sees the value of the separated form `--source HEAD` at all
(`writtenOperands` consumes it as a `valueFlags` value at `:1399-1402`). So `restore` cannot
carry the `HEAD` exception uniformly with the mechanism it has, and `checkout` can. That is a
real reason for the two rows to differ. It is not a reason to claim they agree.

## What is wrong — part 2, the unreachable cost

The rule file states the `checkout` row's second cost as:

> **Without `--`, the first positional is read as the tree-ish**, the way git reads it, so
> `git checkout rules/a.md rules/b.md` denies on the second path.

Measured:

```
block   git checkout rules/a.md rules/b.md
        reason: "fusion policy: agents never switch git branches autonomously (prevents
        branch-drift chaos) … The bare `git checkout <file>` form is allowed only when
        <file> exists on disk and is not also a branch/ref name."
block   git checkout HEAD rules/x.md
        reason: the same branch-policy text.
```

Both are blocked by the **branch policy** (`git-branch-guard.ts`), not by the mutation
classifier. The mutation row's cost is real in the classifier and unreachable through the
hook, because the branch guard reaches these commands first and gives a different reason.

So an agent that meets the documented cost meets a branch-drift lecture and a
`FUSION_ALLOW_BRANCH_SWITCH=1` offer, and is never told the thing the protected-path rule
prepared it for. The branch reason does name `git checkout -- <file>` as a way through, so it
is not unactionable — it is just not the rule the reader was given.

## Recommendation

Two documentation edits and one optional code edit.

1. **Replace "Now they agree" with what is true.** Say that `checkout` and `restore` now
   agree for every named source **except the literal `HEAD`**, that
   `git restore --source=HEAD <path>` denies where `git checkout HEAD -- <path>` allows, and
   why (`mutatesOnlyWhen` never sees a separated flag's value). One sentence, and it turns a
   falsifiable claim into a checkable one.
2. **Re-state the "without `--`" cost as reached through the branch policy**, or drop the
   example: `git checkout rules/a.md rules/b.md` is a branch-policy deny in practice, and the
   protected-path rule should not claim an outcome the other policy owns.
3. **Optional, and worth a decision rather than a patch:** teach the `restore` row the same
   `HEAD` inertness by moving its discrimination from `mutatesOnlyWhen` to a
   `positionalModel`-style hook that can see the flag's value in both spellings. That closes
   the disagreement properly instead of documenting it. It NEWLY ALLOWS
   `git restore --source=HEAD <protected>`, which is a first for this Circle, so it needs the
   same measured argument `260804-1323` gave the union — the operation really is inert, but
   "inert" has to be argued for `--source=HEAD` the way it was for `checkout HEAD`.

## Test coverage this needs

- `git restore --source=HEAD rules/x.md` and `git restore --source HEAD rules/x.md` pinned
  with their current verdict and a comment naming this record, so the asymmetry is visible in
  the suite rather than only in prose;
- `git checkout rules/a.md rules/b.md` pinned as a **branch-policy** block (assert the reason
  names the branch policy), so the two policies cannot start reporting each other's
  permission unnoticed — the same guarantee `decisions/260804-1323` already asks for in the
  other direction.

## Anti-vacuity

Every row above already returns a verdict, so verdict-only assertions prove nothing. The
assertions have to be on the reason string and on the pair, exactly as
`decisions/260804-1323` says the `checkout` test does.
