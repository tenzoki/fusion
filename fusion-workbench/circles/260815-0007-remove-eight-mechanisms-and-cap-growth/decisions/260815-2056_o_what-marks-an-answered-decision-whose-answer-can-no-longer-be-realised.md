# What marks an answered decision whose answer can no longer be realised, because the thing it would have been realised against was deleted first?

---
**Domain:** code
**Status:** open
**Filed by:** reconciler, while applying `260814-1332`'s answer to the `_i_` population
**Cross-references:** `circles/260801-1244-curator/decisions/260814-1332_*_what-marks-an-implemented-decision-whose-implementation-was-later-deleted.md` (the answered sibling this record is the residual of); `shared/decisions/260806-1152_a_stash-manifest-dirname-and-pointer-content-duplicate.md` and `shared/decisions/260810-2032_a_should-the-drift-checks-four-sentences-be-pinned-to-an-approved-baseline-instead-of-screened-by-a-blacklist.md` (the two instances); `rules/fusion-workbench-conventions.md` `## State Markers — decisions` and `## Decision Record Template` (where `Retired:` now sits); `circles/260815-0007-remove-eight-mechanisms-and-cap-growth/history/260815-1913-reconciliation.md` §5 (where both instances were first measured)

---

## Question

`260814-1332` was answered on 2026-08-15 at a Rebalance gate: an **implemented** decision whose
implementation was later deleted gets a `Retired:` annotation citing what removed it, and keeps its
`_i_` marker. That answer was applied to twenty-five records the same day.

Two records in the same sweep are not implemented and were left untouched. Both are `_a_`, both were
answered by the user, and in both cases the thing the answer would have been written against was
deleted before anyone wrote it:

- `shared/decisions/260806-1152_a_stash-manifest-dirname-and-pointer-content-duplicate.md` — the
  answer was "keep both manifest fields, no schema change, record the reason in the manifest schema
  documentation". `5d29b6d` deleted `skills/circle-stash/` and `skills/circle-pop/` and cut the
  `## Stashes` half out of the rule file. There is no manifest and no schema documentation.
- `shared/decisions/260810-2032_a_should-the-drift-checks-four-sentences-be-pinned-to-an-approved-baseline-instead-of-screened-by-a-blacklist.md` —
  the record's own closing sentence says `_a_` → `_i_` is unavailable until the pin is written
  against the drift lint. `f45f76a` deleted `hooks/lib/__tests__/state-drift-detection-lint.test.ts`,
  `hooks/lib/state-drift.ts`, `hooks/state-drift.ts` and `bin/fusion-state-drift`. There is no lint
  and no four sentences.

**`Retired:` does not fit, and stretching it to fit would undo the reason option 3 was chosen.** Its
definition, as landed in `rules/fusion-workbench-conventions.md` `## Decision Record Template`, is
"set when the implementation is removed; the marker stays `_i_`" — it cites *what removed the
implementation*. These records have no implementation; their `Implemented:` line is empty and the
`_a_` marker says so. An annotation naming the removal of something that was never built is a
citation a reader cannot resolve. And an annotation that answers two different questions is the
property `260814-1332` declined option 2 over.

The reader-facing failure is also different, which is why this is a separate question rather than a
wording detail on the first. An `_i_` record with a deleted implementation misleads by claiming a
mechanism ships. An `_a_` record whose answer is unrealisable misleads in the opposite direction: it
claims *pending work* — decided, awaiting realisation — and `_a_` is Grounding-Stand, active
best-of-knowledge, so a future Turn reading the `_a_` set as its backlog will find two entries it
can never discharge and no statement on either saying why.

It must be decided because the class is not closed. Every future removal that outruns a recorded
answer produces another instance, and there are two on disk with nothing on them but a reconciler's
prose note.

## Options

1. **A `Retired:` annotation on `_a_` too, with the citation naming what removed the *subject*
   rather than the implementation.** One annotation, both cases.
   - Pros: no second annotation on a template that just gained one. A reader who has learned
     `Retired:` learns nothing new.
   - Cons: the annotation then means two things, which is what option 2 of `260814-1332` was declined
     for. It also has to be read against the marker to be understood — on `_i_` it says "the built
     thing is gone", on `_a_` it says "the thing it would have been built against is gone" — and a
     marker-plus-annotation pair that must be read together is the property the underscore vocabulary
     exists to avoid.
2. **A distinct `Unrealisable:` annotation, marker stays `_a_`.** Same family and same shape as
   `Retired:`, citing the plan, commit or gate that removed the subject.
   - Pros: keeps each annotation answering one question. Additive, nothing renames, no glob or count
     changes. Symmetrical with the answer already given for `_i_`, so the pair is learnable as one
     rule with two cases.
   - Cons: a seventh annotation on the template, charged against the growth bound armed on
     2026-08-14 — and this one lands on `rules/fusion-workbench-conventions.md`, an always-on file,
     so every agent pays for it on every dispatch. Two known instances is thin evidence for a
     vocabulary addition.
3. **Rename `_a_` → `_d_` with a `Deferred:` line stating that the target no longer exists.**
   - Pros: uses a marker and an annotation that already exist, and takes the record out of the `_a_`
     set, which is the set that misleads. `_d_` is not terminal in the way `_i_`/`_s_` are, so a
     rebuilt subject could be reopened.
   - Cons: `Deferred:` means the user deferred, or an agent proposed and the user confirmed. Neither
     happened here, so the marker would record an event that did not occur. It also inverts the
     record's history: the user *answered* this question, and `_d_` says they declined to.
4. **Leave both records alone and let the reconciler's prose note carry it.** No vocabulary change.
   - Pros: costs nothing, and the note already exists on both records with the evidence and the
     deleting commit.
   - Cons: it is exactly the position `260814-1332` rejected for `_i_`, one marker over. A prose note
     buried under the footer is not visible to anyone filtering by marker, and the reconciler who
     wrote it will not be the one reading the `_a_` set next.

## Constraints

- Whatever is chosen must not require walking a terminal marker backwards; neither of the two
  instances is terminal, so this bites only if a future answer reaches into `_i_`.
- Any option touching `rules/fusion-workbench-conventions.md` or the decision-record template spends
  from the growth bound armed on 2026-08-14, on an always-on surface. Options 2 and 3 cost bytes
  there; 1 and 4 do not.
- Both instances are in `shared/`, so unlike the `_i_` population they are reachable from any run.
  Whatever is chosen can be applied in one pass.
- The answer must not weaken `260814-1332`'s. That record's whole value is that `Retired:` and `_s_`
  each mean one thing.

## Recommendation

**Option 2, at low-to-moderate confidence.**

`verified:` the two instances exist as described, and `Retired:`'s definition as landed does not
cover them.

`inference:` option 2 is the only one that preserves both properties `260814-1332` bought — one
annotation per question, and no rename — and its cost is the same kind of cost that answer already
accepted once. Option 1 is cheaper and gives back the property that made option 3 win over option 2
there; option 3 writes an event that did not happen.

`speculation:` two instances may be all there will ever be. The `_i_` class grew from two to
twenty-five in a fortnight because this project retires mechanisms by deleting code at user gates,
and an unrealisable *answer* needs the narrower coincidence of a gap between answering and building.
If the next two removals produce no further instance, option 4 is the honest choice and this record
should be closed rather than answered.

---
Answered:
Implemented:
Deferred:
Superseded by:
Retired:

---

**Reconciliation 260819-1453 (reconciler, Domain `code`, Circle-store pass) — STAYS `_o_`. No answer recorded, no annotation added to the template, and the class has not grown.**

**Measured at HEAD `e435f03`:**

```
grep -rn 'Unrealisable' rules/ agents/     → no hits
grep -n 'Retired:' rules/fusion-workbench-conventions.md
  :315   the _i_ row — "the body gains a `Retired:` line and the marker does not move"
  :430   the inline-tracking form
  :519   the template footer — "set when the implementation is removed; the marker stays _i_"
```

Option 2 was not taken: no seventh annotation exists. Option 1 was not taken either — `Retired:`'s definition is unchanged and still scoped to a removed *implementation*, so it still does not cover an `_a_` record whose subject was deleted. Option 3 would have renamed the two instances and neither has moved. Option 4, leave them to the reconciler's prose note, is what has happened by default rather than by choice, which is the position the sibling decision `260814-1332` rejected one marker over.

**The class has not grown, which is the record's own tiebreaker.** It named two instances and offered a test: *"If the next two removals produce no further instance, option 4 is the honest choice and this record should be closed rather than answered."* Four days and four releases later — including the whole v10 guard removal, which deleted an escalation module, a halt, a clearing script and a configuration file — the count is still two. Both cited instances are in `shared/decisions/` and are outside this pass's write scope; neither was re-measured here beyond confirming that no `Unrealisable:` annotation was added to either.

**So the input the record asked for now exists and points at option 4.** That is a reading, not a decision, and this pass does not take it: closing a record on the strength of a condition the record itself set is still the user's call, and option 2's argument — that one annotation should answer one question — does not weaken just because the class stayed small.

**One thing that has changed and bears on the choice.** On 2026-08-18 the decision-record head lost its `**Status:**` field, so the filename marker is now the state's only source and the footer block is the only place a transition can be evidenced. That raises the cost of option 4 slightly: a prose note under the footer is now the only thing distinguishing an `_a_` record that is waiting from one that can never move, and there is no longer a head field a reader might have checked instead.
