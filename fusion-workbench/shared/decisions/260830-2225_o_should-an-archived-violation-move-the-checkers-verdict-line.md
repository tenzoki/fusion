# Should an archived violation, which nobody will repair, move the checker's `verdict=` line at all?

---
**Domain:** code
**Filed by:** analyst, Kai Stalmann <ks@qantr.com>
**Cross-references:** `260830-1816_*_do-the-frozen-stores-enter-the-sweeps-and-the-checkers-corpus-the-way-the-live-tree-does.md` (the record this residual was left by); `260830-1841_*_citation-mechanism-four-defect-repair.md` (step 4, which produced the figures below); `260819-1645_*_what-defines-the-citation-gates-corpus-and-what-happens-when-a-marker-move-changes-it.md` and `260820-0805_*_the-citation-gates-corpus-excludes-only-archive-so-a-frozen-copy-tree-would-enter-a-blocking-gate.md` (whose reasoning bounds the **gate** and not the reporter); `260828-0904_*_is-an-archived-record-a-citation-target.md`; `260823-1414_*_does-the-workbench-citation-gates-corpus-cover-review-files.md` (related, open, and deliberately not folded in — it asks which files the **gate** reads, not which rows move the reporter's verdict)

---

## Question

`260830-1816_*_do-the-frozen-stores-enter-the-sweeps-and-the-checkers-corpus-the-way-the-live-tree-does.md`
settled that the checker reads the frozen stores the way it reads the live tree, and `32fe0d49`
realised it. The checker now sees 65 more violations than it did, every one of them inside a record
that was frozen when it was swept and that nobody will edit again.

The reporter's `verdict=` line is the one figure a reader acts on. It answers "is this project's
citation bookkeeping in order". A violation nobody will repair cannot be acted on, so counting it
changes what the line means: it stops being a work item and becomes a permanent property of the
tree. The question is whether such a row belongs in that count.

It is asked now because the answer was not part of what the corpus decision settled, and because the
figure moved by a fifth in one commit without the verdict changing state — which is exactly the
condition under which nobody notices the meaning drifting.

## Evidence

**The second-order figures from `32fe0d49`.** The corpus went from 1737 files to 2342 and `dangling`
from 247 to 312; `store-prefixed` stayed 0 and `verdict=violations` did not flip. It already read
`violations` over the narrower corpus. The 65 added rows are all under the archive, spread across
four sweep directories, confirmed by listing the rows rather than by assuming it.

**The 65 added rows, by the store the containing record sits in** (measured at `32fe0d49` over this
repository's committed workbench, plus one uncommitted machine-written file that carries no
Markdown):

| store of the containing file | rows |
|---|---|
| `issues/` | 33 |
| `planning/` | 25 |
| `analyses/` | 3 |
| `decisions/` | 2 |
| `backlog/` | 1 |
| the Circle record itself | 1 |

**The larger finding, and it is the one that decides the question.** Splitting all 312 rows by
whether anybody will ever edit the file that carries them:

| containing file | rows |
|---|---|
| under the archive store — frozen, added at `32fe0d49` | 65 |
| live, of a kind that carries no state marker at all (history 141, analyses 43, reviews 7) | 191 |
| live, carrying a terminal marker (`_c_` or `_i_`) | 56 |
| live, carrying a live marker, so inside the blocking gate's corpus | 0 |

The four classes are disjoint and sum to 312. **256 of the 312 rows sit in text nobody will repair,
and only a quarter of that mass is what step 4 added.** History files alone carry 141 rows, more than
twice what the corpus change contributed, and they were there before it. The other 56 sit in closed
issues and implemented decisions, which the marker vocabulary calls terminal.

**Nothing here reddens anybody's suite, and that is the shape of the cost.**
`hooks/lib/__tests__/workbench-citation-lint.test.ts` keeps its three frozen exclusions, and its
corpus predicates admit only the portfolio briefing, Circle records, open issues, live decisions and
live plans — it never read a history, analysis or review file, before step 4 or after. The zero in
the last row of the table above is that gate being green, measured rather than assumed: not one of
the 312 rows sits in a file the gate opens. So the new cost falls entirely on whoever reads a
`verdict=` line, and not at all on whoever runs `npm test`.

**One observation from step 4, stated precisely because it was first stated loosely.** A session
history that quotes an archived record's path in running prose does produce a violation row in the
checker's output. That is **not** new at `32fe0d49`: the resolution index always walked the whole
workbench, so such a citation was already read and already reported. What step 4 added is rows whose
*containing file* is frozen, and none of the 65 is a history file. Both facts point the same way, and
the second is the sharper one: the reporter's noise is dominated by a class the corpus change never
touched.

## Options

The dimension is which rows move `verdict=`. Every option keeps every row **printed**: a row nobody
prints is a row nobody can check, and hiding one is the coverage claim
`260830-1816_*_do-the-frozen-stores-enter-the-sweeps-and-the-checkers-corpus-the-way-the-live-tree-does.md`
already refused.

1. **Every row the checker reads moves the verdict** (status quo at `32fe0d49`).
   - Pros: no criterion, no second predicate, and nothing for a later reader to look up. The verdict
     means exactly "the checker found something", which is a statement anybody can verify by reading
     the rows under it.
   - Cons: the verdict can never return to `ok` in this repository, and it could not before step 4
     either. A figure that is structurally pinned at one value carries no information, and a reader
     who learns that stops reading it.
2. **Only rows outside the three frozen stores move it.** Frozen rows are printed and carried in a
   figure of their own, so the count stays visible and the verdict becomes actionable.
   - Pros: it is the smallest change, it reuses a list the tree already authors three times over, and
     it exactly undoes the verdict-level half of `32fe0d49` while keeping the corpus-level half that
     record settled.
   - Cons: **it does not implement the criterion the question names.** "Nobody will repair it" takes
     256 rows; "sits in a frozen store" takes 65. The cut misses 191 rows in live files of kinds that
     are never revised, so the verdict stays pinned and the change buys a second list for nothing.
3. **Only rows in a file somebody still edits move it** — the live-versus-terminal distinction the
   gate's own predicates already encode, applied over the whole corpus the checker reads.
   - Pros: it follows the criterion the question actually names, and takes all 256 unrepairable rows
     by one rule rather than 65 by a store list. It reuses a predicate this project already authored
     instead of adding a second one, and it makes `verdict=ok` reachable, which is what makes the
     line worth reading.
   - Cons: the predicate has to leave the test file it lives in to be shared, and that file is inside
     the blocking gate's own definition — moving it is a change to a gate nobody asked to touch. It
     also needs a judgement the gate never had to make, about the kinds that carry no marker at all
     (history, analysis, review, consult, memo), and the checker's corpus reaches surfaces outside
     the workbench — `CLAUDE.md`, `rules/`, `docs/` — where no marker exists and every file is live.

**The cut, checked.** The three are disjoint over "which subset of rows moves the verdict": all of
them, all minus the frozen stores, all minus the files nobody edits. Further subsets exist
arithmetically and none is named by a criterion in this tree. A fourth shape sometimes proposed —
printing one verdict per corpus half — is **not** a fourth answer here: it is orthogonal, any of the
three can carry it, and it is named so it is not mistaken for an option.

## Constraints

- Every violation stays printed under any answer. The corpus decision was taken partly because a
  verdict that omitted a quarter of the tree was a coverage claim nobody could check, and scoping the
  verdict must not reintroduce that by the back door.
- The `KEY=value` block must say what the verdict was computed over. A scoped verdict whose scope is
  not in the output is worse than an unscoped one.
- Whatever is chosen, `bin/fusion-citation-check` reports and never gates. No exit code carries the
  verdict, and none may start to: that rule is shared with `bin/fusion-review-coverage` and
  `bin/fusion-staging-drift`, and this record does not reopen it.
- The blocking gate's corpus is not in scope. It is settled by
  `260819-1645_*_what-defines-the-citation-gates-corpus-and-what-happens-when-a-marker-move-changes-it.md`
  and bounded by
  `260820-0805_*_the-citation-gates-corpus-excludes-only-archive-so-a-frozen-copy-tree-would-enter-a-blocking-gate.md`,
  and both reason about the cost of a red suite, which a reporter does not have.

## Recommendation

**The answer to the question as literally asked is that archived-ness is not the criterion.** An
archived violation is unrepairable, so the intuition behind the question holds; but so are 191 rows
that are not archived at all, and they outnumber the archived ones by nearly three to one. Option 2
would act on the smaller half of the problem and leave the verdict pinned exactly where it is, which
is the outcome that motivated asking.

Option 3 is what the measurement points at, and it is offered as a recommendation rather than as a
settled matter, because its two costs are real and are the user's to weigh: a shared predicate has to
be lifted out of a gate's definition file, and the marker-less record kinds need a judgement nobody
has made yet. If neither cost is worth paying, option 1 is the honest fallback — a verdict that never
returns to `ok`, said plainly in the checker's own header, is better than a scoped one whose scope
nobody can restate.
