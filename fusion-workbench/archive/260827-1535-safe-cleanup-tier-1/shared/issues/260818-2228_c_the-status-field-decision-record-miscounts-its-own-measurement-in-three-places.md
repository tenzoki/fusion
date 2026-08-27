The Status-field decision record miscounts its own measurement in three places

---

**Severity:** Low
**Domain:** code
**Filed by:** reconciler, session `shared/history/260818-2124-orchestrator-session.md`, domain `code`
**Affects:** `shared/decisions/260818-2212_o_should-the-decision-records-status-field-exist-at-all-now-that-the-circle-records-has-been-removed.md`, sections `## The measurement` and `## What actually reads and writes the field`; the same two figures as re-stated in the note appended to `shared/issues/260812-1232_o_*.md` and in commit `8fa3286`
**Cross-references:** `shared/issues/260812-1232_o_thirty-four-of-seventy-four-decision-records-carry-a-status-header-that-contradicts-their-filename-marker.md` (the defect the decision discharges), `shared/decisions/260816-0711_a_is-count-pinning-the-convention-for-every-gate-that-reports-what-it-examined.md` (the open question about whether a report pins the count of what it examined, which is the convention that would have caught items 2 and 3 below)

---

## What holds

Re-derived independently at HEAD `53b6862` by extracting the marker from each filename and the first
`**Status:**` line from each body, over every live decision store and no archived one. The record's
central measurement reproduces exactly:

- 94 records, 51 shared and 43 across the Circle stores.
- 40 headers not holding the template word their marker calls for, split 20 shared and 20 Circle.
- 44 under a whole-field comparison, which is the curator run's figure; the four extra are headers
  holding the right word followed by a reconciliation annotation.
- The six-row breakdown table reproduces row for row: 14 `_i_`/answered, 13 `_i_`/open, 8
  `_a_`/open, 3 `_d_`/open, 1 `_s_`/open, 1 outlier.
- `260815-2312_i_*` does read `**Status:** answered`, so the record that removed this field from the
  Circle record is itself in the set.
- Two shipped surfaces define the vocabulary for this record kind, and no test under
  `hooks/lib/__tests__/` compares a header against a marker.

The finding, the recommendation and the option set are unaffected by everything below.

## The defect

Three counts about the measurement disagree with the measurement.

**1. The 40 includes one record that agrees with its marker.** The outlier row of the breakdown is
`circles/260718-1924-v5x-overhaul/decisions/260718-2150_i_reviewers-history-log-step.md`, whose head
reads:

```
**Status:** _i_ (implemented — reviewer edits realising the ruling landed in Circle D, session 260718-2110)
```

That header does not disagree with the `_i_` on the filename. It states the marker and then glosses
it with the correct template word. Under the record's own exclusion rule — the four annotated
headers "are right and are not counted as drift here" — this one belongs with them, and the count of
headers **disagreeing** with their marker is **39**, with **5** correct-but-non-template headers
rather than 4. The record's headline sentence says "disagreeing", so 39 is the figure that sentence
supports; 40 is the figure a "does not hold exactly the template word" criterion supports, and the
record uses one criterion in the prose and the other in the arithmetic.

The breakdown table compounds it by describing the row as "a whole sentence of reconciliation prose
where one word belongs". The header is not prose where a word belongs: it leads with the marker,
which is the one token that cannot be wrong.

**2. "Four measurements", five listed.** `## The measurement` opens its trend paragraph *"The trend
across four measurements of the same store"* and then lists five: 34 of 74, 35 of 86, 39 of 100, 37
of 106, 40 of 94. Commit `8fa3286` says five. All five trace to real prior measurements —
`260812-1232` carries 34 of 74 in its own title, 35 of 86 at line 73, 39 of 100 at line 87 and 37 of
106 at line 90 — so the figures are sound and only the count of them is wrong.

**3. "Thirteen files", fourteen in the record's own scope.** The record states its grep scope as
`agents/`, `skills/`, `rules/`, `templates/` and `hooks/lib/__tests__/`, then closes with *"two rule
files, not the thirteen files that mention a field of that name"*. At `53b6862`,
`grep -rl '\*\*Status:\*\*'` over exactly that scope returns 14: nine agent prompts (`analyst`,
`bugfixer`, `consultant`, `curator`, `orchestrator`, `planner`, `reconciler`, `shaper`,
`taskplanner`), two skills (`help`, `next`), two rule files, and
`hooks/lib/__tests__/reference-resolution-lint.test.ts`. Either the number is off by one or the
scope sentence names a directory the count excluded. The same "thirteen" is in the note appended to
`260812-1232` and in commit `8fa3286`.

## One number carried forward in a section about not carrying numbers forward

`## Options` option 2 states *"Head-room on the hook-test surface was 1907 lines of 2500 at the last
measurement."* That figure is quoted verbatim from the coderev note at `260812-1232:87`, dated
2026-08-16, and its baseline has moved since: the 2026-08-17 cleanup re-baseline set the hook-test
baseline to 17 875 lines (`hooks/lib/__tests__/surface-growth-bound.test.ts`, the
`TEST_LINE_BASELINE` doc comment). The surface measures 18 403 lines at `8fa3286`, so the head-room
is **1 972 of 2 500**. The record hedges with "at the last measurement", so this is not a false
claim, and it is listed separately from the three above for that reason. It is noted because it sits
five paragraphs below a sentence advertising every figure as "re-derived rather than carried
forward", and it is the one that was not.

## Fix direction

Four edits inside one record and no change to any conclusion: state 39 disagreeing plus 5
correct-but-non-template, or keep 40 and say the criterion is "does not hold exactly the template
word"; re-describe the outlier row as a header written in marker form; change "four measurements" to
five; change "thirteen files" to fourteen or narrow the stated scope to match. Re-measure the
head-room against the current baseline or drop the figure, which option 2 does not need.

Whoever edits this must not touch the record's marker or its `**Status:**` field: the record is the
open question about that field and is one of the records any answer will have to account for.

---
Resolved: all four edits applied inside
`shared/decisions/260818-2212_o_should-the-decision-records-status-field-exist-at-all-now-that-the-circle-records-has-been-removed.md`,
and the record's marker and `**Status:**` field were left untouched as this record required.

1. The criterion is now stated once and used consistently: a record counts as drift when its header
   names a state its marker does not, never merely for departing from the template's wording. The
   totals read 39 disagreeing (20 shared, 19 Circle) and 5 correct-but-non-template, which makes the
   naive figure 39 + 5 = 44 rather than an unexplained gap of four.
2. The outlier row is gone from the breakdown table, whose five rows now sum to 39, and
   `260718-2150_i_*` is named in the prose as the fifth non-template header, quoted in its own form
   rather than described as prose.
3. "four measurements" is now "five".
4. "thirteen files" is now "fourteen".

The head-room figure this record listed separately was re-derived rather than dropped: 1 972 lines
of 2 500 at `8fa3286`, from a per-file baseline summing to 17 875 against a surface of 18 403. The
sentence now cites the HEAD it was measured at, which is what the "at the last measurement" hedge was
standing in for.

Re-measured after the edits, with the corrected criterion: 39 contradicting, 5 correct-but-non-template,
50 exact, over the 94 records that existed at `53b6862`. The finding, the three options and the
recommendation are unchanged, as this record predicted.

**Correction to the resolution note above, same session.** Point 1 overstated. "The criterion is now
stated once" held; "and used consistently" did not. Three figures elsewhere in the record were still
on the criterion the edit replaced: the trend paragraph closed with "40 of 94 today" against a table
reading 39, option 2's con argued from "40 records", and the constraints section still split the
population "20/20". A narrow verification pass over `b46756e` found all three
(`shared/issues/260818-2248_c_*`), and they are now corrected: 39 in the trend, **44** in option 2
with the reason stated — a lint that re-derives the expected word demands the word exactly, so it
fails on the 39 wrong states plus the 5 right states in another form — and 20 shared against 19
Circle in the constraints.

The lesson is in the shape rather than the arithmetic. Changing a criterion changes every figure
derived from it, and the three that lagged were the three furthest from the table where the criterion
is defined. Nothing checks that.
