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

Also seen: 260816-1330 by coderev — re-measured at `6049d3e`: 39 of 100 records now disagree (13 `_i_`/answered, 12 `_i_`/open, 9 `_a_`/open, 4 `_d_`/open, 1 `_s_`/open), and commit `4921026` created the 40th by renaming `260816-0740_o_` to `_a_` while `shared/decisions/260816-0740_a_does-the-prose-register-get-a-measurable-gate-and-which-surface-does-it-measure.md:5` still reads `**Status:** open`. No test file under `hooks/lib/__tests__/` mentions `Status`, so the pair is still unread by any gate; `marker-format-lint.test.ts` scopes to `agents/*.md` and `skills/*/SKILL.md` and never looks at the workbench. Head-room on the hook-test surface is 1907 lines of 2500 if a gate is chosen, but a hard gate would fail on 39 records nobody is going to edit, which is the shape `shared/decisions/260816-0740_a_*.md` option 2 already argues against for the output store.

---
**Reconciliation 260817-1836** (reconciler, domain `code`). Re-verified reproducible at HEAD `2552586`: Re-derived rather than re-asserted. Over the shared decision store alone, 18 of 56 records carry a `**Status:**` that disagrees with their marker; over every decision store including the Circles, 37 of 106. No lint enforces agreement: `hooks/lib/__tests__/marker-format-lint.test.ts` scopes to `agents/*.md` and `skills/*/SKILL.md` and never reads the workbench. One record was corrected in this pass as a side effect of a marker walk (`260814-2017`), which does not touch the class. Marker stays open. Log: `shared/history/260817-1836-reconciliation.md`.

---
**The question this record reserved is now filed as a decision, 2026-08-18.**
`shared/decisions/260818-2212_o_should-the-decision-records-status-field-exist-at-all-now-that-the-circle-records-has-been-removed.md`
carries the two candidate fixes this record named, plus the third the Circle-record version of the
question considered, re-measured at HEAD `53b6862`: **40 of 94** records disagree (20 of 51 shared,
20 of 43 in Circle stores), and a naive comparison that counts four correct-but-annotated headers
reports 44.

The trigger was the Circle record's identical field being removed on the same day
(`260815-2312`, option 1, commit `95bebe1`), which is what made the reservation worth discharging
rather than renewing. **This record stays open**: the drift it measures is not resolved by filing a
question about it, and it is the record any sweep or lint will close.

Two things the new decision adds that this record did not have. The change surface is **two rule
files**, not the thirteen a grep for the field name returns, because four other artifact kinds carry
a `**Status:**` field of their own with different vocabularies. And `260815-2312` itself — the
decision that removed the field from the Circle record — is one of the 40, reading `answered` under
an `_i_` marker.

---
**Reconciliation 260818-2230** (reconciler, domain `code`). Re-verified reproducible at HEAD
`8fa3286`, re-derived rather than carried forward: the marker was read out of each filename and the
first `**Status:**` line out of each body, over every live decision store and no archived one. At
the pre-session HEAD `53b6862` the population is 94 (51 shared, 43 Circle) and 40 headers do not
hold the template word their marker calls for, split 20 shared and 20 Circle; a whole-field
comparison gives 44. Both figures and the six-row breakdown in
`shared/decisions/260818-2212_o_*.md` reproduce exactly. One of the 40 agrees with its marker in
substance and is written in marker form rather than in the template word
(`circles/260718-1924-v5x-overhaul/decisions/260718-2150_i_*.md`, reading
`**Status:** _i_ (implemented — …)`), so the count of headers *disagreeing* is 39 with 5
correct-but-non-template; that discrepancy and two count-of-count errors are filed as
`shared/issues/260818-2228_o_the-status-field-decision-record-miscounts-its-own-measurement-in-three-places.md`.
No record was hand-corrected, per this record's own instruction. No lint enforces agreement; the
full hook suite is green at this HEAD (672 tests, 36 files). Marker stays open — the question is now
filed as a decision, which does not resolve the drift. Log:
`shared/history/260818-2230-reconciliation.md`.

**Correction to the note above, same day.** Two figures in it were restated from a first pass and are
wrong. The disagreeing count is **39, not 40** (20 shared, 19 Circle): one header,
`circles/260718-1924-v5x-overhaul/decisions/260718-2150_i_*`, reads `**Status:** _i_ (implemented — …)`
and states its marker correctly rather than contradicting it. With it, **5** records carry the right
state in a non-template form, and 39 + 5 is exactly the 44 a naive whole-field comparison reports.
And the change surface is **fourteen** files that mention a field of that name, not thirteen; the
conclusion is unchanged, because only two of them define the vocabulary for this record kind.
Filed and closed as
`shared/issues/260818-2228_c_the-status-field-decision-record-miscounts-its-own-measurement-in-three-places.md`.
