# Analysis: the citation verdict is unreachable where an exhibit sits in an edited file

**Date:** 2026-09-12 16:14
**Type:** Impact
**Status:** Complete
**Requested by:** user, relaying a second report from a consuming project (cocreator)

## Question

A consuming project reports that `bin/fusion-citation-check` reaches `verdict=violations` on rows
the tool itself marks `unrewritable`, and asks for one change: that the verdict read editable AND
repairable rather than editable alone. Is the report factually correct, is the ask well founded,
and where does it belong in the records this project already holds?

## Scope

The checker's verdict logic and the grammar behind it, the two open records on the same subject,
and the precedent they cite. Not in scope: the reporting project's own corpus, which this
checkout cannot read, and the wider question of whether a project may narrow the citation corpus.

Read at HEAD `72f4c1ec` of 2026-09-12 13:03:42 +0200, branch `main`, 16 commits ahead of
`origin/main`, with two modified files in the working tree (the event log, and the decision record
this analysis amends). Every present-tense claim below is dated by that tree.

## Findings

### 1. The reported timeline is correct

The narrowing is commit `ff52dd4a` of 2026-09-05, "the shape verdict survives both exemptions".
v10.22.0 is tagged 2026-09-01 and v10.23.0 2026-09-05, so the change landed four days after the
release the reporting project recorded as clean and shipped in the next one. Their account of
when the fence stopped covering the store-prefix verdict matches the tree.

What the commit did is authored in `hooks/lib/citation-scan.ts`: the three kinds in
`SHAPE_DECIDED_KINDS` are judged on the token's shape, which needs no lookup, so the two
exemptions whose premise is that the token must not be looked up, `fenced-code` and
`record-example-file`, no longer silence them. The reporting project's phrase "the fence used to
cover everything" is an accurate description of the state before that commit.

### 2. The mechanism is as reported

`verdict=` reads one figure. From the header of `hooks/citation-check.ts`:

> `verdict=` does not read this figure: what makes it `violations` is `edited-violations` > 0 and
> nothing else, so a project gating on `verdict=` sees exactly what it saw before this figure
> existed.

`unrewritable-violations` is computed, printed in the key block, and repeated per row as a column.
It is a marginal over the same rows as `edited-violations` and never subtracted from it. A row
that is both `edited` and `unrewritable` therefore moves the verdict while the sweep is forbidden
from touching it and the grammar's own note says respelling it would delete the finding it exists
to show.

### 3. The reporting project's argument is this project's own, already accepted

Decision `260830-2225_*_should-an-archived-violation-move-the-checkers-verdict-line.md` settled
which rows move the verdict. Its option 1, the status quo it rejected, carries the con:

> the verdict can never return to `ok` in this repository. A figure that is structurally pinned at
> one value carries no information, and a reader who learns that stops reading it.

Its option 2 was rejected for a reason that reaches further than the option:

> it does not implement the criterion the question names. "Nobody will repair it" takes 256 rows;
> "sits in a frozen store" takes 65.

So the criterion this project chose is "nobody will repair it", and the chosen option 3 implements
it through one predicate, whether somebody still edits the file. That predicate does not reach a
row in a live file that no one is permitted to repair. The reporting project is standing on
exactly the residue, and its argument that an unreachable gate gets ignored is a restatement of
the con that decided the earlier record.

This reclassifies the request. It is not a new criterion offered to the project from outside. It
is the completion of a criterion the project selected and implemented in part.

### 4. fusion's own repository cannot observe the failure

Measured on 2026-09-12 at the HEAD above:

```
files=2853
edited-files=291
edited-violations=0
unedited-violations=702
unrewritable-violations=401
verdict=clean
```

All 401 unrepairable rows sit in files the live-file predicate already excludes, so the two
predicates never disagree here and the verdict is reachable. A project whose exhibits sit in a
live record, an open issue, an open decision or `CLAUDE.md` meets the intersection this corpus
does not contain. That is the structural reason the first report produced a diagnostic figure
rather than a repair: the mitigation was measured against a corpus in which the defect is
invisible.

### 5. What the change would and would not touch

| Surface | Effect of reading editable AND repairable |
|---|---|
| `bin/fusion-citation-check` `verdict=` | reachable where it is currently pinned |
| every printed row and every counter | unchanged, including `store-prefixed` and `dangling` |
| `bin/fusion-citation-sweep` | unchanged; it already skips every hit carrying a reason |
| `hooks/lib/__tests__/workbench-citation-lint.test.ts` | unchanged, and it is fusion's own gate rather than a consuming project's |
| the 2026-09-05 narrowing | unchanged; the token stays judged and stays printed |

The teaching file's coverage, which the record's constraints protect, is carried by the blocking
test rather than by the helper's verdict line, so it survives the change inside this repository.
A consuming project wiring only on `verdict=` does lose that half, and this is the honest cost.

### 6. Where it belongs

Decision `260906-0416_*_should-a-project-be-able-to-declare-a-record-an-exhibit-and-what-does-that-declaration-cover.md`
is open and carried three options, all of them cut on one dimension: how a project may declare a
record an exhibit. The request is on the other dimension, which rows move the verdict, the one the
precedent above established. That record cites the precedent and carries no option on its
dimension, so its cut was not complete in the sense `rules/critical-stance.md` requires.

The two dimensions are independent. Any of the first three options can be taken with or without
the fourth, and the fourth settles nothing about the corpus asymmetry tracked in
`260906-0416_*_a-project-may-widen-the-citation-corpus-and-never-narrow-it-so-an-exhibit-has-no-declarable-form.md`.

## Implications

The record's binding constraint is that a release must not *silently* turn a red gate green. The
fourth option does turn red gates green, so it is admissible only with a release that names it and
an upgrade note that says which projects it moves. Framed that way the constraint is satisfiable
rather than violated, and the direction is one this project has already taken once deliberately.

There is a second implication the reporting project names and this analysis confirms. Option 3 of
the open record proposes telling projects to wire their gate on `unrewritable-violations`
themselves. The reporting project did precisely that, in a local Makefile. That proves the
criterion implementable, and it also proves that leaving it out of the tool obliges every
consuming project to rebuild the same predicate from the same two numbers.

## Recommendation

1. Take option 4 in the open decision, and treat it as independent of the option eventually taken
   on the declaration dimension. Route: the user gates the decision; `coder` implements.
2. Ship it in a release that names the change, with a paragraph in the upgrade note saying which
   projects see a verdict move from `violations` to `clean` and why.
3. Leave `260906-0416_*_a-project-may-widen-the-citation-corpus-and-never-narrow-it-so-an-exhibit-has-no-declarable-form.md`
   open. Nothing here answers it.

## Filed Issues

None. The subject is already carried by one open decision and one open issue, and this analysis
amends the decision rather than filing a third record.

## Sources

- `hooks/citation-check.ts` `## unrewritable-violations: the rows nobody is allowed to repair`
- `hooks/citation-check.ts` `## The verdict scope: only a file somebody still edits moves verdict=`
- `hooks/lib/citation-scan.ts`, the notes on `SHAPE_DECIDED_KINDS` and
  `RESOLUTION_PREMISED_EXEMPTIONS`
- `bin/fusion-citation-check`, header
- `hooks/lib/__tests__/workbench-citation-lint.test.ts`, the baseline message
- `260830-2225_*_should-an-archived-violation-move-the-checkers-verdict-line.md`
- `260906-0416_*_should-a-project-be-able-to-declare-a-record-an-exhibit-and-what-does-that-declaration-cover.md`
- `260906-0416_*_a-project-may-widen-the-citation-corpus-and-never-narrow-it-so-an-exhibit-has-no-declarable-form.md`
- commit `ff52dd4a`; tags v10.22.0, v10.23.0, v11.0.1
- `./bin/fusion-citation-check` run against this tree on 2026-09-12

## Open Questions

- [ ] Is `unrewritable`, the presence of an exemption reason, close enough to "nobody may repair
      this" to carry a verdict? A writer can fence a token they could have named in words, and
      nothing distinguishes the two cases mechanically. This is the same residual option 2 of the
      open record accepts for a declaration leaf.
- [ ] The reporting project's own figures (1192 rows, 9 of 13 judgement-relevant) could not be
      verified from here, and their 10.22.0 side is their record rather than a measurement, which
      they state themselves.
