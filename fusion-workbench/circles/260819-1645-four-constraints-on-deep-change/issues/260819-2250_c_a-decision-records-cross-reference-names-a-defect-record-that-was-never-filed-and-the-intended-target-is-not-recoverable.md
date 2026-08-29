A decision record's cross-reference names a defect record that was never filed, and the intended target is not recoverable

---

Filed by `coder` during step 7 of
`260819-2016_*_four-constraints-on-deep-change.md`,
which resolves the citations that resolve to nothing. Measured at HEAD `4aae336`.

---

## What is wrong

`260813-0826_*_should-fusion-help-become-a-self-knowledge-skill-that-answers-from-the-live-installation.md`
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
(`260814-1332-curator-run.md`, candidate C-class, tier
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

- `260813-0826_*_should-fusion-help-become-a-self-knowledge-skill-that-answers-from-the-live-installation.md:7`
  — the cross-reference, now carrying the stamp and the description instead of the dead path.
- `260813-0831-the-seam-between-a-measured-answer-and-a-cited-one.md:234` — the
  same dead path, in an analysis that is outside the repair corpus and was not touched by this
  step. It will need the same treatment whenever that surface is repaired.

---
**Reconciliation 260820-0830-reconciliation.md** (reconciler, domain `code`, HEAD `04db0b0`) — **still open, reproduces
in both places the record names.** `260813-0826_*_should-fusion-help-become-a-self-knowledge-skill-that-answers-from-the-live-installation.md:7`
carries the repaired form: the stamp, the description and the finding that no such file exists, with
no path. `260813-0831-the-seam-between-a-measured-answer-and-a-cited-one.md:234`
still spells the dead path, as the record predicted. Neither of the two closure conditions has been
met — nobody has named the intended record and nobody has re-measured the documentation-lag claim.
The dispatch asked whether the target is covered by any repair corpus: it is not. The analysis sits
outside the citation gate's corpus (no `analyses/` clause), and the token is spelled with a
`fusion-workbench/` prefix, so no scanner reads it either. Marker unchanged.

---
Progress 260820 (`coder`, Circle Turn 2) — **the second location is repaired. Neither closure
condition is met, so this stays open.**

`260813-0831-the-seam-between-a-measured-answer-and-a-cited-one.md`, the `## Sources`
bullet the record named, no longer spells the dead path. It carries the same treatment step 7 gave
the decision record: the path dropped, the substance kept. The bullet now describes what was read,
names the stamp `260813-0825`, states that no file with that slug has ever existed, and gives the
measurement — commit `799fded` added exactly two records at that stamp and neither is this one. It
says the curator reached the same wall on 2026-08-14 and the repair pass on 2026-08-19, that naming
the closest survivor would be speculation rather than a citation, and that lines 173 and 216 of the
analysis argue about the record on their own evidence and are unchanged. It points at this record.

**No target was invented, and none is recoverable.** The stamp is left in place because it is what
the reader has: it is a `stamp-bare` token, which the scanner classes as undecidable and never as a
violation, so it neither dangles nor claims to point anywhere.

What would close this is still what the record says: somebody names the intended record, or the
documentation-lag claim is re-measured against the current release and filed fresh. Neither happened
here. **No citation anywhere in this workbench now names the record that was never filed** — that
was the scope of the repair, and it is complete.

---
Resolved: moot — the intended target is not recoverable and the repair that dropped the dead token is complete in both locations; `260813-0826_*_should-fusion-help-become-a-self-knowledge-skill-that-answers-from-the-live-installation.md`.
