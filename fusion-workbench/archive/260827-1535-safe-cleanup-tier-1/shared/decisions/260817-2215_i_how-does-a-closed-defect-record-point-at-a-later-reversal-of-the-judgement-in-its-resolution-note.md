# How does a closed defect record point at a later reversal of the judgement in its resolution note?

---
**Domain:** code
**Status:** implemented
**Filed by:** orchestrator
**Cross-references:** `260817-2207_*_a-closed-records-resolution-note-states-a-judgement-head-reversed-and-every-citation-points-backward.md` (the measured instance), `260817-2130_*_the-git-add-prohibition-s-restated-justification-holds-for-u-alone-and-is-false-for-the-other-three-shapes.md` and `260817-2147_*_the-staging-sentences-completeness-claim-leaves-the-quoted-pathspec-glob-unaccounted-for.md` (the two records the instance spans), `260817-2207-reconciliation.md` (the reconciliation that found it)

---

## Question

A defect record's `Resolved:` note routinely states not only what was done but why, and that
reasoning can be reversed by a later commit while the defect itself stays correctly closed. The
issue and planning vocabulary has no annotation for this. Decision records have two — `Superseded
by:` for an answer a later decision overrode, and `Retired:` for an implementation that was removed
with no decision overriding it — and both were added because the same need arose there. The question
is what the issue vocabulary gets.

It was measured in this session rather than anticipated. `260817-2130`'s resolution note ends on a
judgement that the quoted git pathspec glob need not be named separately in the staging prohibition.
One commit later, `307a696`, it is named. Every citation of that record in the workbench points at
it and none points out of it, so a reader arriving there reads the withdrawn judgement as current
and has nowhere to go. The reconciler's pass measured eight citations, all inbound.

## Options

1. **A supersession-style note on the issue vocabulary** — a footer line a closed record gains when
   the reasoning in its resolution note is later reversed, following the precedent of `Retired:` on
   decision records: appended to the body, citing the commit or record that reversed it, and
   changing no filename marker, because the defect is still closed and only its stated reasoning
   moved.
   - Pros: the trail runs forward. Costs one line at the moment of the reversal, which is the moment
     someone knows about it.
   - Cons: one more annotation in a vocabulary that already carries five for decisions and four for
     issues. Nothing enforces it, so an unwritten note is indistinguishable from no reversal.
2. **State in the conventions that a `Resolved:` note is not maintained** — the note records the
   state at the time it was written and is never brought forward; a reader wanting the current state
   follows the cross-references forward.
   - Pros: no vocabulary growth, and it makes an existing property explicit rather than adding an
     obligation nobody is measured on.
   - Cons: the measured case stands exactly as it is. A reader still reaches a false statement about
     HEAD; it is merely documented that they will.

## Constraints

- No filename marker may change. The defect is closed and stays closed; only the reasoning moved.
- Whatever is decided lives in `rules/fusion-workbench-conventions.md`, which is the single
  authoring home for both marker vocabularies and for the inline-tracking footers.
- `Superseded by:` keeps its decision-record meaning. Reusing the exact word across two vocabularies
  with different semantics is what the option-1 wording avoids.

## Recommendation

Option 1, with the footer named `Revised by:` and no rename — the label says that the resolution's
reasoning was revised rather than that the defect was superseded, and the no-rename rule follows
`Retired:`, which was added to the decision vocabulary for the structurally identical case of a
record whose body went stale while its marker stayed correct.

---
Answered: user gate, orchestrator session `260817-2037-orchestrator-session.md`, 2026-08-17 — option 1, a supersession-style note on the issue vocabulary, following the `Retired:` precedent. The label and the no-rename rule are the recommendation above; the mechanism is the user's choice.
Implemented: `rules/fusion-workbench-conventions.md` `## Inline State Tracking` (issue half) and `## State Markers — issues and planning` (`_c_` row pointer) — the issue vocabulary gains a `Revised by:` footer, citing the commit or record that reversed the reasoning in a `Resolved:` note, with no rename and `Superseded by:` reserved to decision records. Applied to the measured instance in `260817-2130_*_the-git-add-prohibition-s-restated-justification-holds-for-u-alone-and-is-false-for-the-other-three-shapes.md`; `260817-2207_*_a-closed-records-resolution-note-states-a-judgement-head-reversed-and-every-citation-points-backward.md` closed.
Deferred:
Superseded by:
Retired:
