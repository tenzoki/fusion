A closed record's resolution note states a judgement HEAD reversed, and every citation to it points backward

---

`260817-2130_c_the-git-add-prohibition-s-restated-justification-holds-for-u-alone-and-is-false-for-the-other-three-shapes.md`
closes with a `Resolved:` note whose final sentence is false of HEAD:

> The quoted git pathspec glob is not named separately: it behaves as the directory argument
> does and is already routed there, and "unquoted" is what distinguishes the case that fails
> differently.

`307a696` reversed that judgement. At HEAD, `hooks/lib/staging-drift.ts` `stagingSentence()`
names the quoted form explicitly ("`-A`, a directory argument and a quoted pathspec glob are the
over-staging that shape prevents"), and the reverse clause reads "an unquoted shell glob". The
record carries no pointer to the reversal, so a reader who arrives at it reads the withdrawn
judgement as the current one and has nothing to follow.

---

## The trail, in the direction a reader travels

Every citation of `260817-2130` in the workbench points **at** it. None points out of it.
Measured with `grep -rn "260817-2130"` over the repository at HEAD `307a696`:

```
260817-2132_c_ ──────────┐
260817-2147_c_ (wrapper) ─┤
260817-2147_c_ (glob)  ───┼──>  260817-2130_c_   ──>  (nothing)
history/260817-2138 ──────┤
history/260817-2155 ──────┤
reviews/260817-2130, 2147 ┘
```

The two entrances that a later reader is most likely to use are the worst placed.
`260817-2132_c_`'s `Cross-references:` names `260817-2130` and does not name `260817-2147`, and
the same holds for the wrapper-header record `260817-2147_c_the-staging-drift-wrapper-header-still-carries-the-re-opens-f38f37d-wording-corrected-twice-in-the-typescript.md`.
Both were written before the reversal or without it in view. A reader entering from either lands
on the withdrawn judgement and stops.

`shared/history/260817-2138-coder-staging-sentence-per-shape-justification.md` §1 carries the
same withdrawn paragraph ("**The quoted git pathspec glob is deliberately not named
separately.**") under its own heading, also with no forward pointer.

## What is already in place, and why it is not enough

`shared/history/260817-2155-coder-quoted-glob-clause-and-wrapper-header.md` states the
supersession plainly and explains the non-edit:

> Neither of those two earlier files was edited: they are the record of what was decided then,
> and the disagreement is carried by `260817-2147`'s cross-reference to them, which is where a
> reader meets it.

That reasoning is sound about **preserving** the earlier judgement and wrong about **reaching**
it. A cross-reference is directional. `260817-2147_c_the-staging-sentences-completeness-claim-leaves-the-quoted-pathspec-glob-unaccounted-for.md`
does name the disagreement, in full and accurately, but only a reader who is already holding
`260817-2147` ever sees it. The reader the note is written for is the one holding `260817-2130`.

## The structural cause

The issues marker vocabulary has no supersession. `rules/fusion-workbench-conventions.md`
`## State Markers — issues and planning` offers `_o_`, `_p_`, `_c_`, `_d_`, and
`## Inline State Tracking` gives issue files exactly one annotation, `Resolved:`. The decisions
vocabulary has both halves of the pair (`Superseded by:` with a rename to `_s_`, and `Retired:`
with no rename), because a decision's answer was always expected to be revisited. An issue's
`Resolved:` note was not, and a `Resolved:` note that makes a design claim — as this one does,
and as a growing number do — has the same failure mode a decision record has, with none of the
vocabulary.

This is the same shape as `shared/issues/260813-0913_o_a-dependency-between-two-circles-can-only-be-recorded-on-one-side-because-nobody-may-write-the-other.md`
one layer down: a relation between two records that only one side is able to state.

## Fix direction

Two coherent answers, and the choice is a decision rather than a repair to start:

- **Annotate.** Give the issue vocabulary a second annotation for the case, along the lines of
  the decisions' `Superseded by:` and `Retired:` (which is the closer sibling, since it adds a
  line and moves no marker). Whoever files the reversing record appends it to the reversed one
  in the same change. Then fix the two instances above.
- **Leave it.** Accept that a `Resolved:` note is a statement about the moment it was written and
  is not maintained, and say so in `rules/fusion-workbench-conventions.md` where the annotation is
  defined, so a reader knows not to read one as current. That costs one sentence and no mechanism,
  and it is consistent with `shared/decisions/260816-0119_a_can-anything-carry-the-rename-to-citation-obligation-when-a-record-marker-moves.md`,
  which was answered "nothing new" for the adjacent class.

Do not hand-fix the two instances before the question is answered under the first option, and
under the second there is nothing to fix.

## Acceptance criteria

- A reader who opens `260817-2130_c_…` learns that its closing judgement was withdrawn, or
  `rules/fusion-workbench-conventions.md` states that a `Resolved:` note is not maintained.
- The same holds for `shared/history/260817-2138-coder-staging-sentence-per-shape-justification.md` §1.
- Whichever answer lands is written where the `Resolved:` annotation is defined, not only in a
  history file.

**Severity:** Low — no shipped text is wrong, and `hooks/` is correct at HEAD. The cost is a
reader-facing one, and it falls on exactly the audience the two records were written for.
**Domain:** code
**Filed by:** reconciler, final reconciliation of session `260817-2037`
**Cross-references:** `shared/issues/260817-2130_c_the-git-add-prohibition-s-restated-justification-holds-for-u-alone-and-is-false-for-the-other-three-shapes.md` (the reversed record); `shared/issues/260817-2147_c_the-staging-sentences-completeness-claim-leaves-the-quoted-pathspec-glob-unaccounted-for.md` (the record that reversed it, and the only place the disagreement is stated); `shared/history/260817-2155-coder-quoted-glob-clause-and-wrapper-header.md` (where the non-edit was decided and explained); `shared/issues/260813-0913_o_a-dependency-between-two-circles-can-only-be-recorded-on-one-side-because-nobody-may-write-the-other.md` (the same one-sided-relation shape, one layer up); `shared/decisions/260816-0119_a_can-anything-carry-the-rename-to-citation-obligation-when-a-record-marker-moves.md` (the adjacent class, answered "nothing new")

---
Resolved: the first of the two fix directions, chosen at a user gate — decision `shared/decisions/260817-2215_*_how-does-a-closed-defect-record-point-at-a-later-reversal-of-the-judgement-in-its-resolution-note.md`, option 1, with the footer named `Revised by:` and no rename. `rules/fusion-workbench-conventions.md` `## Inline State Tracking` now defines it in the issue half beside `Resolved:`, and `## State Markers — issues and planning` points at it from the `_c_` row, so a reader meets it where they look for the marker. `Superseded by:` is stated to keep its decision-record meaning and never to be used on an issue file. The measured instance is annotated: `260817-2130_c_…` carries the footer citing `307a696` and `260817-2147_c_…`, its `Resolved:` note is unedited and its filename unchanged. `shared/history/260817-2138-coder-staging-sentence-per-shape-justification.md` §1 is deliberately not annotated — history files carry no state vocabulary and are not maintained, and the annotation this record asked for is defined for issue files only. That leg of the acceptance criteria is therefore not met and is not going to be met by this footer; a reader entering §1 still meets the withdrawn paragraph, and closing that entrance needs its own decision about whether history files gain a forward pointer at all.
