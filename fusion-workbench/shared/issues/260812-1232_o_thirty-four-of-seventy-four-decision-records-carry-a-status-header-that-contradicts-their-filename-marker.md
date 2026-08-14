Thirty-four of seventy-four decision records carry a Status header that contradicts their filename marker

---
The decision-record template in `rules/fusion-workbench-conventions.md` `## Decision Record Template`
gives every record a `**Status:** open | answered | implemented | deferred | superseded` header, and
`## State Markers — decisions` gives the filename a marker meaning the same thing. In 34 of the 74
decision records on disk the two disagree, and in every case the marker is the one that is right.

The filename marker moves because renaming the file is the transition; the header is a second copy of
the same fact, maintained by hand, and it is the copy that gets left behind.

---
**Witness:** planner, measuring the decision store while planning the protected-path removal
**Severity:** medium — a reader who trusts the header reads a closed question as open
**Affected:** 34 files under `fusion-workbench/shared/decisions/` and `fusion-workbench/circles/*/decisions/`
**Cross-references:**
`rules/fusion-workbench-conventions.md` `## Decision Record Template` and `## State Markers — decisions`,
`shared/decisions/260810-1635_a_where-does-the-obligation-sit-to-update-the-artefact-that-explains-a-behaviour-when-the-behaviour-changes.md` (the same class, one level up),
`shared/issues/260811-1734_o_reduce-the-surface-so-a-claim-cannot-go-stale-in-several-places-at-once.md`

## The measurement

Derived by reading the marker out of each filename and comparing it with the first `**Status:**` line
in the body:

| Marker | Header says | Count |
|---|---|---|
| `_i_` implemented | `open` | 11 |
| `_i_` implemented | `answered` | 6 |
| `_a_` answered | `open` | 7 |
| `_d_` deferred | `open` | 4 |
| other mismatches, including three headers carrying a whole sentence of reconciliation prose where a single word belongs | | 6 |

Four of the mismatched headers already carry a note saying a reconciler corrected them once, for
example `260803-1803_i_...` reading "implemented (corrected from `open` by reconciliation 260804-1021;
the filename marker `_i_` was already right)". So the drift is known, has been repaired by hand at
least twice, and has re-accumulated since.

## Why it is worth a record rather than a sweep

The immediate cost is small and real: this planning session read
`260804-1632_d_should-findrelevantdecisions-fold-case-...` and
`260809-1224_d_is-the-decision-governed-escalation-check-3-a-live-feature.md`, both of which say
`**Status:** open` in the body while being deferred by their marker and by a dated deferral note at
the foot of the file. Both were read correctly only because the marker was checked.

The durable cost is that the header is a hand-maintained second copy of a fact the filename already
carries, which is the defect class `260810-1635` is about and `260811-1734` is the work for. A sweep
that corrects 34 headers today leaves the mechanism that produced them intact.

## Two candidate fixes, for whoever picks this up

1. **Drop the `**Status:**` line from the template** and let the marker be the single source. Cheapest,
   and it removes the copy rather than synchronising it. Costs a one-time pass over 74 files and a
   check of whatever reads the header — `bin/fusion-paths` and the reconciler prompt at least.
2. **Add a lint** in the shape of the existing `marker-format-lint.test.ts` that re-derives the
   expected header from the filename and fails on a mismatch. Keeps the copy and makes it impossible
   to leave stale. It does not shrink the surface, which is what `260811-1734` is trying to do.

Both are cheap. Option 1 is the one consistent with the reduce-the-surface work already open; this
record does not choose between them.

---
**Reconciliation, 2026-08-14 (reconciler, re-measured at HEAD `41c224c`). Stays open, and the
population grew.**

Re-derived rather than carried forward: a loop over `shared/decisions/*.md` and
`circles/*/decisions/*.md` reading the marker out of each filename and comparing it against that
file's `**Status:**` line reports **39 mismatches over 86 records**. Four of those are false
positives of the naive comparison — records whose header carries the right word followed by a
parenthetical annotation an earlier reconciliation added, for example
`shared/decisions/260809-2004_i_*` reading "implemented (marker `_i_`; header corrected by the
reconciler 260809-2252 …)". Discounting those, the real figure is **35 of 86**, against the 34 of 74
this record measured on 2026-08-12.

**One new instance was created and corrected inside this session.**
`shared/decisions/260813-0027_i_should-the-orchestrator-be-able-to-dispatch-the-shapers-portfolio-activation-mode.md`
walked open to answered to implemented across commits `e02f268` and `0b14d03`; both renames moved
the filename marker and neither touched the header, which still read `open` two transitions later.
This pass corrected it. That is the mechanism this record describes, caught in the act rather than
inferred: the rename is a `git mv`, the header is a separate edit, and nothing binds them.

The count in this record's title is left as written. It states what was measured on 2026-08-12 and
it is a measurement, not a pointer — restating it here is the derive-over-correct form the project
applies to exactly this class.
