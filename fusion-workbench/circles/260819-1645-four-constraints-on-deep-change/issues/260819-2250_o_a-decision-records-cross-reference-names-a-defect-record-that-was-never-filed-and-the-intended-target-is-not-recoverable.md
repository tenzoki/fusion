A decision record's cross-reference names a defect record that was never filed, and the intended target is not recoverable

---

Filed by `coder` during step 7 of
`circles/260819-1645-four-constraints-on-deep-change/planning/260819-2016_*_four-constraints-on-deep-change.md`,
which resolves the citations that resolve to nothing. Measured at HEAD `4aae336`.

---

## What is wrong

`shared/decisions/260813-0826_*_should-fusion-help-become-a-self-knowledge-skill-that-answers-from-the-live-installation.md`
carried, in its `**Cross-references:**` line, a path naming a defect record about the user-facing
documentation lagging two releases and still describing a removed guard. **No file with that slug
has ever existed in this repository.** `git log --all --diff-filter=A` over the workbench shows
commit `799fded` adding exactly two records at the stamp the citation used, and neither carries
that slug: one is about the playmaker holding no write key to the backlog store, the other about a
documentation step reaching three files where the feature reached seven surfaces. Both were
archived by the `260817-1907` sweep.

The citation was not a staleness and not a store error. It was wrong when the decision record was
written, and it points at a record that was described rather than filed.

## Why this is a defect and not a repair

The curator already reached the same conclusion and stopped at the same place
(`circles/260801-1244-curator/history/260814-1332-curator-run.md`, candidate C-class, tier
`candidate`): the closest surviving record is the documentation-step one, and calling that the
intended target is speculation, not a citation. Step 7's rule is that no token stays standing
because its target cannot be identified, so the path was dropped and its substance — what the
cross-referenced record was about, and where the finding that it does not exist was measured —
moved into the line. That repair makes the decision record honest. It does not recover the
reference, and nothing in this workbench can.

**What is lost.** A reader of that decision cannot reach whatever evidence its author had in mind
for the claim that fusion's user-facing documentation lags its releases. The claim itself survives
in the decision's body; only its supporting citation is gone.

## What would close this

One of two things, and both need somebody who knows what was meant:

1. The author (or a session with the transcript) names the record that was intended, and the
   cross-reference is written to it.
2. The finding is re-established from the tree — the documentation-lag claim is re-measured
   against the current release — and a defect record is filed for it now, with the decision's
   cross-reference pointed at that.

Neither is a mechanical repair, which is why this is filed rather than done.

## Where

- `shared/decisions/260813-0826_*_should-fusion-help-become-a-self-knowledge-skill-that-answers-from-the-live-installation.md:7`
  — the cross-reference, now carrying the stamp and the description instead of the dead path.
- `shared/analyses/260813-0831-the-seam-between-a-measured-answer-and-a-cited-one.md:234` — the
  same dead path, in an analysis that is outside the repair corpus and was not touched by this
  step. It will need the same treatment whenever that surface is repaired.
