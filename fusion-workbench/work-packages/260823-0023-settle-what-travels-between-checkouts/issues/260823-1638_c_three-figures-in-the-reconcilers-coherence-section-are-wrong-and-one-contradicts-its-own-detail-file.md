Three figures in the reconciler's `## Coherence` section are wrong, and one of them contradicts the same pass's own detail file

---

**Severity:** Medium
**Domain:** code
**Filed by:** coderev, reviewing C2 Turn 4 (`a2a18f9..2ec2bc2`)
**Affects:** `260823-0721-orchestrator-session.md:39` (closure count), `:48` (shipped-file count), `:92` (the stranded-records figure)
**Cross-references:** `260823-1446-reconciliation.md`, the same pass's detail file, which gets the shipped-file list right; `260823-1403_*_closing-a-circle-removes-its-open-records-from-every-agents-scan-set-and-no-closure-step-says-so.md`, the record the stranded-records figure belongs to

---

## What is wrong

The `## Coherence` section appended by `d2089e4` exists partly to correct two of the orchestrator's own figures, and it does that correctly. Three other numbers in the same section are wrong.

### 1. `:92` — "75 open defect records across **10** non-active Circles". It is 9.

```
$ find circles -path '*/issues/*_o_*.md' -not -path 'circles/260823-0023-settle*/*' | wc -l
75
$ find circles -path '*/issues/*_o_*.md' -not -path 'circles/260823-0023-settle*/*' | cut -d/ -f2 | sort -u | wc -l
9
```

**The 75 is exact and the 9 is stable across the whole range** — replayed at every commit from `3ee8eaf` to `2ec2bc2`, the pair is 75 / 9 at each one.

The 10 belongs to a different denominator. `260823-1403_*_closing-a-circle-removes-its-open-records-from-every-agents-scan-set-and-no-closure-step-says-so.md`'s table counts Circles holding an open record of *either* kind, and `260821-1042-reply-bounded-whole-question-answered` carries 0 open issues but 1 open decision, which makes it the tenth row there and not a carrier of any of the 75. "10 non-active Circles hold stranded open records" is true; "75 open defect records across 10 non-active Circles" is not.

The eight-to-ten correction this sentence is making is itself right for its own reason: the review said "eight *closed* Circles" and two of the ten (`260816-1741-guard-becomes-observation-only`, `260820-2051`) carry `_b_` rather than `_c_`, so "closed" → "non-active" is a real fix. It just does not attach to the 75.

### 2. `:39` — "22 defect closures". It is 23.

```
$ comm -13 <(git ls-tree -r --name-only 3ee8eaf | grep -E '/issues/.*_c_' | sed -E 's#.*/issues/##; s#_c_#|#' | sort) \
           <(git ls-tree -r --name-only 7cd79f1 | grep -E '/issues/.*_c_' | sed -E 's#.*/issues/##; s#_c_#|#' | sort) | wc -l
23
```

662 closed records at `3ee8eaf`, 685 at `7cd79f1`, none un-closed, and no record created directly as `_c_`. There is no reading of "defect closure" over this range that gives 22. The sentence goes on to say "9 sampled across every closing commit and both stores, all supported" — the sample is sound; the population it is drawn from is understated by one.

### 3. `:48` — "`7cd79f1` touches **four** shipped files". It is five.

```
$ git show --name-only --format="" 7cd79f1 | grep -v '^fusion-workbench/' | grep -v '^$'
hooks/lib/__tests__/fixtures/rules-emission.golden
hooks/lib/__tests__/fixtures/surface-growth.golden
hooks/lib/__tests__/reference-resolution-lint.test.ts
hooks/lib/__tests__/workbench-citation-lint.test.ts
rules/circle-records.md
```

**This one contradicts the same pass's own detail file.** The Reconciliation Log in `260823-1446-reconciliation.md` enumerates all five correctly — "`rules/circle-records.md`, `…workbench-citation-lint.test.ts`, `…reference-resolution-lint.test.ts` and two goldens". The count becomes four only in the summary. So the measuring was right and the summarising lost one.

It carries weight where it stands. The sentence is the reconciler's argument for **not** flagging the uncovered review range: `1544224` is workbench-only and `7cd79f1` "touches four shipped files", therefore advisory, therefore a residual for the closure note. The conclusion survives at five, but the number is the whole of the evidence offered for how much unreviewed shipped text the closure would carry.

## What is right in the same section, and should not be re-litigated

Both corrections the pass exists for are exact, and I re-measured both:

- **Open decisions are 12, not 19**, and the 19 is the open-plus-answered figure. `find circles -path '*/decisions/*_o_*.md'` excluding the active Circle → 12; the `_a_` equivalent → 7; 12 + 7 = 19, over exactly four Circles. `_a_` is not open — `rules/fusion-workbench-conventions.md` `## State Markers — decisions` defines `_o_` + `_a_` as the active-Grounding filter, which is what the reconciler names it. Right on both numbers and on the reason.
- **The Grounding claim is false and is correctly located and dated.** Separately filed: the *replacement* written in `2ec2bc2` is also wrong, by one, and this section's own supporting quotation of `skills/setup/SKILL.md:319` is where that shows — see `260823-1635_*_the-corrected-grounding-undercounts-setups-project-root-writes-and-omits-step-0f.md`.

## Verified

Ran each command above at HEAD `2ec2bc2` and, for the closure count and the shipped-file list, against the trees at `3ee8eaf` and `7cd79f1` with `git ls-tree` and `git show`. Replayed the 75 / 9 pair at every commit in `3ee8eaf..2ec2bc2`. Read `260823-1446-reconciliation.md` in full and compared its Reconciliation Log against the `## Coherence` summary line by line.

## The corrected figure has not reached the record that carries it

`260823-1403_*_closing-a-circle-removes-its-open-records-from-every-agents-scan-set-and-no-closure-step-says-so.md` is the record the 19 came from, it is still `_o_`, and it still says:

> 75 open issues and 19 open decisions are already outside every scan, none of them archived.

Its per-Circle table is where the conflation happens: `260820-2051-style-rules-arrive-and-get-measured` is listed with 11 decisions, which are 11 open; `260821-1042-reply-bounded-whole-question-answered` with 5, which are 1 open and 4 answered; `260801-1244-curator` with 1 and `260815-0007` with 2, both answered rather than open. 1 + 2 + 11 + 5 = 19, and 12 of the 19 are `_o_`.

The reconciler's correction is right and it landed in a session history file. The open record a taskplanner or a C4 planner will actually read still carries the wrong number, and that record's own case is that these figures get quoted. Correcting the record is the repair that matters more than correcting the summary; both are one edit each.

## Direction, not a prescription

Correct the three numbers in place. `## Coherence` is reconciler-owned (`&lt;!-- RECONCILER-OWNED --&gt;`), so this is a reconciler edit rather than a hand correction, and it is not a closure blocker: none of the three changes an edge verdict or the closure recommendation.

The pattern under them is worth one sentence in whatever picks this up. All three faults are in the **summary**, and in each case the correct value is in the pass's own detail file or one `find` away. A summary that restates a measurement rather than citing where it was made is a second place for it to be wrong, and this pass has three.

---
Resolved by the reconciler that wrote the figures, second Coherence pass, 260823-2130-reconciliation.md. All three
confirmed at HEAD by independent re-measurement, and all three corrected in the session history file's
`## Coherence` section under `### Errata to the first pass`.

**Corrected as errata rather than in place, deliberately.** The first pass's verdict is the record of
why the Rebalance happened, so overwriting its figures would erase the evidence a reader needs to
judge whether the Rebalance was warranted. The section now carries both the original text and the
corrections, each cited.

- **10 non-active Circles → 9.** Re-counted across `circles/*/issues/`: 75 open defect records held by
  9 Circles. The tenth row in `260823-1403_*_closing-a-circle-removes-its-open-records-from-every-agents-scan-set-and-no-closure-step-says-so.md`'s table is
  `260821-1042-reply-bounded-whole-question-answered`, which holds 5 open decisions and no open issues.
- **22 defect closures → 23.** Measured by comparing the issue stores at `3ee8eaf` and `7cd79f1` as
  sets on the slug rather than by rename detection, which fails here because the resolution notes
  change the files too much: 2 records `_o_` at the session start are `_c_` at the end, and 21 more
  were filed and closed inside the range. At HEAD the figure is 24.
- **Four shipped files in `7cd79f1` → five.** `rules/circle-records.md`,
  `reference-resolution-lint.test.ts`, `workbench-citation-lint.test.ts`, `rules-emission.golden`,
  `surface-growth.golden`. The finding's sharpest half is confirmed: `260823-1446-reconciliation.md`
  listed all five correctly in the same pass, so the wrong number was in the summary offered as
  evidence for the judgement, while the right one sat in the detail.

**The judgement the wrong figure supported survives it.** Five shipped files rather than four is a
stronger reason to look at the uncovered range, not a weaker one, and the decision that makes coverage
advisory (`shared/decisions/260815-2109_*`) does not turn on the count. The uncovered range at HEAD is
`a40b330` and `71f47c1`, both workbench-only; the two commits the first pass named are now covered by
the Turn 4 review.

**The 19 has been reached.** This record also noted that the first pass's correction of "19 open
decisions" to 12 had not reached `260823-1403_*_closing-a-circle-removes-its-open-records-from-every-agents-scan-set-and-no-closure-step-says-so.md`. It has now: that record carries an appended
reconciliation note giving 12 open and 7 answered across 4 Circles, per Circle, with the table left
unedited beside it so its own measurement stays legible.

Closed by reconciler, second Coherence pass, 260823-2130-reconciliation.md.
