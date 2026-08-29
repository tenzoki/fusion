# The two spellings of the revert strategy still disagree at `HEAD`, and `checkout`'s second stated cost is unreachable

---

**Severity:** Medium
**Domain:** code (security control, and the claim made for it)
**Filed by:** coderev, review of `613d6fd`
**Affects:** `hooks/lib/bash-mutation-guard.ts:741-743` (`isGitRestoreSourceFlag`), `:947-951` (the `restore` row), `:887` / `:914-936` (`GIT_CHECKOUT_INERT_TREEISH`, `gitCheckoutWrites`); `rules/protected-path-discipline.md:86-104`; `260804-1323_*_…` `## The second question`
**Kind:** The `restore --source=HEAD` deny is PRE-EXISTING. What is NEW in `613d6fd` is the claim that the two spellings now agree, which the `HEAD` spelling falsifies — and that is the one spelling the whole argument is about.
**Cross-references:**
`260804-1026_*_…` (the finding, whose complaint was "the same operation in two spellings disagreeing"),
`260804-1323_*_…` (`## The second question`, where the claim is made and the costs are stated).

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
the disagreement `260804-1026_*_git-checkout-treeish-overwrites-a-protected-path-and-is-in-neither-the-verb-table-nor-the-residual-list.md` was filed about, surviving at exactly the spelling the
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
   same measured argument `260804-1323_*_should-the-guard-model-gits-own-working-directory-or-give-up-on-it.md` gave the union — the operation really is inert, but
   "inert" has to be argued for `--source=HEAD` the way it was for `checkout HEAD`.

## Test coverage this needs

- `git restore --source=HEAD rules/x.md` and `git restore --source HEAD rules/x.md` pinned
  with their current verdict and a comment naming this record, so the asymmetry is visible in
  the suite rather than only in prose;
- `git checkout rules/a.md rules/b.md` pinned as a **branch-policy** block (assert the reason
  names the branch policy), so the two policies cannot start reporting each other's
  permission unnoticed — the same guarantee `260804-1323` already asks for in the
  other direction.

## Anti-vacuity

Every row above already returns a verdict, so verdict-only assertions prove nothing. The
assertions have to be on the reason string and on the pair, exactly as
`260804-1323` says the `checkout` test does.

---

**In progress:** 2026-08-04, `coder`, plan Step 3. **The plan assigned this record to
Step 3 as a code pass, and Step 3 cannot close it.** What Step 3 could take, it took;
what it could not, it routed. Stated in full so the routing is not read as an oversight.

**Taken — the test coverage this record asks for, both items.**
`MEASURES: checkout and restore still disagree at HEAD (260804-1348_*_the-two-spellings-of-the-revert-strategy-still-disagree-at-head-and-checkouts-second-cost-is-unreachable.md, open)` pins the
whole pair with the current verdicts and a comment naming this record, so the asymmetry
is visible in the suite rather than only in prose. And
`leaves \`git checkout <file> <file>\` to the branch policy, which answers first` pins
part 2 through a real guard subprocess: the block's reason must name the branch policy
and must NOT be the protected-path reason, so the two policies cannot start reporting
each other's permission unnoticed.

**Not taken — recommendation 3, the code edit, and this is the substantive finding.**
The plan's Step 3 says `checkout` and `restore` are "one operation with two flag
grammars, and the pass that adds a field to both rows is the pass that can make them
agree". There is no reconciliation available to a coder step. Making them agree by
teaching `restore` the `HEAD` exception NEWLY ALLOWS
`git restore --source=HEAD <protected>` — which this record itself flags as "a first for
this Circle" and calls worth a decision rather than a patch — and every Turn of this
Circle has held that no command newly allows. Making them agree the other way denies
`git checkout HEAD -- <path>`, which is fusion's own revert strategy and is promised to
every agent in every consuming project. So the code half is a Human-Gate question, filed
as
`260804-1815_*_should-git-restore-source-head-become-inert-the-way-git-checkout-head-already-is.md`,
with the architectural cause (`mutatesOnlyWhen` never sees a separated flag's value)
written down rather than papered over.

**Not taken — recommendations 1 and 2, the documentation edits.** Both are in
`rules/protected-path-discipline.md`, which is Step 7's file and out of Step 3's scope.
`rules/protected-path-discipline.md:89` still says "Now they agree" and the `checkout`
row still states a second cost that the branch policy reaches first.

**What has to happen for this record to close, and where the plan is short.** Step 7's
`Closes` line does not name `260804-1348_*_the-two-spellings-of-the-revert-strategy-still-disagree-at-head-and-checkouts-second-cost-is-unreachable.md`, so as the plan stands nothing owns the two
documentation edits. Either Step 7 adopts them — the natural home, since they are two
sentences in a file it is already rewriting — or a ninth step does. Flagged rather than
silently absorbed.

---

**Recommendations 1 and 2 taken: 2026-08-04, `coder`, out-of-band from plan Step 7, at the
user's explicit request.** The ownership gap flagged above is closed at the plan as well —
Step 7's `Closes` line now names this record, annotated as already discharged. Recommendation
3 remains not taken and is not this record's to take: it is `260804-1815`, answered
option 1 by the user on 2026-08-04. The record is complete on both documentation edits as far
as this coder can tell; the orchestrator owns the marker move.

**Recommendation 1, taken.** `rules/protected-path-discipline.md`'s "Now they agree" is gone.
It now says the two spellings agree for every source **except the literal `HEAD`**, states
the asymmetry as a fact with its three denied spellings, gives the architectural cause
(`mutatesOnlyWhen` never sees a separated flag's value; `checkout` takes a positional), and —
the obligation `260804-1815`'s answer adds on top of this record's — **names the allowed
form** rather than describing it: write `git checkout HEAD -- <paths>`. `README-hooks.md`
carries the same paragraph. The `restore` table row's denied column now shows
`--source=HEAD` beside `--source=HEAD~1`, so the pair is visible where a reader looks it up.

Re-measured at HEAD, real guard subprocess, one fresh project per case:

```
allow  git checkout HEAD -- rules/x.md
BLOCK  git restore --source=HEAD rules/x.md
BLOCK  git restore --source HEAD rules/x.md
BLOCK  git restore -s HEAD rules/x.md
allow  git restore rules/x.md          (the index, a third operation)
```

**Recommendation 2, taken — and the record's framing of it needs one correction.** The cost
is **not unreachable**; the record's *example* is what the branch policy answers first. With
both operands present on disk the mutation classifier gets the turn and gives its own reason:

```
BLOCK  git checkout rules/x.md agents/coder.md   protected-path reason, names agents/coder.md
BLOCK  git checkout docs rules/x.md              protected-path reason, names rules/x.md
allow  git checkout notes.txt build/out.js
BLOCK  git checkout rules/a.md rules/b.md        BRANCH reason — rules/a.md is not on disk
BLOCK  git checkout HEAD rules/x.md              BRANCH reason — HEAD is a ref
```

The discriminator is the branch guard's own documented escape (`git-branch-guard.ts`: the
bare form is allowed only when the first operand names a file that exists on disk and is not
also a ref). So both files now state the cost with a **reachable** example and then state the
rule for which policy answers, rather than dropping the example as this record's option
allowed. Stating the rule is what recommendation 2 was really asking for; dropping the
example would have left the next reader to rediscover the same thing.

**One further sentence of the same defect class, corrected while in the row.** The rule
file's allowed column listed `git checkout main` — which **denies**, under the branch policy.
That is the same wrong shape the record names: the protected-path rule claiming an outcome
the other policy owns. It is removed from the column, and the table is now explicitly the
mutation classifier's verdicts, with moving HEAD sent to `git-branch-discipline.md`.

No code was changed and none was needed for either edit.
