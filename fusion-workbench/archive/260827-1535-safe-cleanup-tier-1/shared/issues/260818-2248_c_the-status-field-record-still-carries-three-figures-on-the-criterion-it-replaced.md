The Status-field decision record still carries three figures on the criterion it replaced

---

**Severity:** Low
**Domain:** code
**Filed by:** reconciler, session `shared/history/260818-2124-orchestrator-session.md`, domain `code`, Turn 2
**Affects:** `shared/decisions/260818-2212_o_should-the-decision-records-status-field-exist-at-all-now-that-the-circle-records-has-been-removed.md`, lines 66, 105 and 116; and the `Resolved:` note of `shared/issues/260818-2228_c_the-status-field-decision-record-miscounts-its-own-measurement-in-three-places.md`, point 1
**Cross-references:** `shared/issues/260818-2228_c_the-status-field-decision-record-miscounts-its-own-measurement-in-three-places.md` (the defect this is the residue of), `shared/issues/260812-1232_o_thirty-four-of-seventy-four-decision-records-carry-a-status-header-that-contradicts-their-filename-marker.md` (the drift the decision discharges), `rules/critical-stance.md` §3

---

## What holds

Every total the correction landed was re-derived independently at `53b6862`, by reading the marker
out of each filename and the first `**Status:**` line out of each body, and reproduces exactly:

- 94 records, 51 shared and 43 across the Circle stores.
- 44 under a naive whole-field comparison.
- 5 correct-but-non-template headers — four annotated (`260803-1419_i_*`, `260803-1803_i_*`,
  `260803-2338_i_*`, `260809-2004_i_*`) and one in marker form (`260718-2150_i_*`) — of which 4 are
  in Circle stores and 1 is shared.
- 39 disagreeing, split **20 shared / 19 Circle**, which is the table's new row.
- The five breakdown rows, each against ground truth: 14 `_i_`/`answered`, 13 `_i_`/`open`, 8
  `_a_`/`open`, 3 `_d_`/`open`, 1 `_s_`/`open`. They sum to 39, and 39 + 5 = 44.
- 39 + 5 + 50 exact = 94, the closure's own final line.

The criterion is stated once, at lines 57-62, and it is the right one.

## The defect

Three figures elsewhere in the same record were not moved with it, so the record now expresses two
criteria at once — which is the condition `260818-2228` was filed to end.

**1. The trend paragraph, line 66.** It closes *"37 of 106 (2026-08-17, reconciler), 40 of 94
today"*. The table nine lines above it says 39. This is the sentence a reader takes the headline
number from, and it is also the sentence advertising every figure in it as re-derived.

**2. Option 2's second con, line 105.** *"A hard gate fails immediately on 40 records nobody intends
to edit."* Under the criterion the record now states, a gate that objected to headers naming the
wrong state would fail on 39; a lint that re-derived the exact template word — which is what option 2
proposes — would fail on 44, because it would also catch the five non-template forms. 40 is the
figure of neither gate, and nothing in the record supports it any more. The distinction is load-
bearing for this option: the con is an argument about how red the gate starts.

**3. The Constraints section, line 116.** *"The measurement splits 20/20 between shared and Circle
stores, so a shared-only answer covers half the population."* The table says 20/19. The conclusion
survives — 20 of 39 is still about half — but the figure is the old one.

## The knock-on claim

`260818-2228`'s `Resolved:` note opens *"The criterion is now stated once and used consistently."*
Stated once is true. Used consistently is not, by the three lines above. Points 2, 3 and 4 of that
note hold exactly, as does its head-room paragraph and its closing re-measurement; only the second
half of point 1 overstates.

## One lesser thing, noted and not counted

The reconciliation note this reconciler appended at lines 148-157 still reads *"the measurement above
was re-derived independently at HEAD `53b6862` and reproduces exactly — 94 records, 40, the 20/20
split, the naive 44 and all six breakdown rows"*. The measurement above it now reads 39, 20/19 and
five rows. The note is dated and attributed, so it is legible as a record of the earlier revision,
and this project does not edit a note to match a text that changed under it. It is named here only
so that whoever fixes the three figures decides deliberately whether to mark it as pre-correction
rather than discovering the mismatch later.

## Evidence

Re-derived 2026-08-18 at HEAD `b46756e` by the reconciler, over the 94 records that existed at
`53b6862`:

- `git ls-tree -r --name-only 53b6862` under `shared/decisions/` and `circles/*/decisions/` returns
  94 paths, 51 and 43.
- Comparing each filename marker with the first `**Status:**` line: 44 are not the exact template
  word; of those, 5 still name the correct state (4 annotated, 1 in marker form), leaving 39
  disagreeing, 20 shared and 19 Circle.
- `grep -n -E '\b(39|40|44|20/20|20/19)\b'` over the record returns the three stale figures at lines
  66, 105 and 116, alongside the corrected ones at 37, 39, 49, 50 and 61.

## Fix direction

Three edits, no change to any conclusion: line 66 to `39 of 94 today`; line 105 to the figure of the
gate that option 2 actually proposes, with a word saying which criterion it is counting under; line
116 to `20/19`, keeping the "about half" reading it already carries. Then narrow point 1 of
`260818-2228`'s `Resolved:` note, or reopen that record until the three are done.

As with `260818-2228`: whoever edits this must not touch the record's marker or its `**Status:**`
field. It is the open question about that field and is one of the records any answer will account
for.

---

---
Resolved: all three figures moved onto the stated criterion in
`shared/decisions/260818-2212_o_*`. The trend paragraph reads 39 of 94 and now says what the five
earlier figures are — each pass's own whole-field criterion, on which today's figure is 44, so the
series stays comparable instead of silently mixing two rules. Option 2's con reads **44** with the
reason spelled out: a lint that re-derives the expected word from the filename demands the word
exactly, so it fails on the 39 wrong states plus the 5 right states written in another form, which
is neither of the two figures that were candidates before. The constraints section reads 20 shared
against 19 Circle and no longer claims the split is even.

The record's marker and `**Status:**` field were left untouched, as your `260818-2228` required and
this record repeated.

Re-read after the edits: no figure in the record now rests on the whole-field criterion without
naming it as such.
