# Coder: the six Turn 2 review findings are cleared

**Date:** 2026-08-23
**Agent:** coder
**Circle:** `260823-0023-settle-what-travels-between-checkouts`
**Source:** `circles/260823-0023-settle-what-travels-between-checkouts/reviews/260823-1318-coderev-c2-turn-2.md`, all six findings
**Status:** Complete

---

## What was asked

Clear all six findings of the Turn 2 review. The user took the full set at a gate over the reviewer's
own recommendation of three now and three later. The sixth was conditional: if an honest fix did not
fit the 372 bytes free on `skills/`, stop on that item alone and report what a minimum honest version
costs. It fitted, at 170 bytes, so all six are closed.

## What was done, in the order it was done

**1. High. Ten `Record:` citations in the Turn 1 review.** Fourteen were rewritten, not ten. The four
the finding does not name were resolving when it was filed and are pointers that die at their targets'
next transition, and one of them was about to die in this very pass: the `**Plan:**` field at `:9`
names the plan that item 3 renames. The other three are the one Turn 1 record still open, a citation of
`shared/issues/260818-1637_*_no-gate-resolves-a-path-line-citation-and-thirteen-drifted-in-a-single-change.md`
sharing line `:57`, and an elided `_c_` form at `:76` that a slug search does not find.

The Turn 2 review was rewritten in the same pass, seven citations, six of them the `Record:` lines
naming the records this pass closes. Repairing the Turn 1 review while breaking the Turn 2 review would
have been the finding's own fault committed inside its repair, one Turn later.

No corpus was widened. The second half of that record, whether a review file belongs in the citation
gate, is a user's question under
`circles/260819-1645-four-constraints-on-deep-change/decisions/260819-1645_*_what-defines-the-citation-gates-corpus-and-what-happens-when-a-marker-move-changes-it.md`
and stays open.

**2. Low. The false closure claim, in four files.** The four citations were rewritten to `_*_`. A
tree-wide search for both decision records under every hard marker now returns nothing outside
`archive/`. The claim's editable copy, in
`circles/260823-0023-settle-what-travels-between-checkouts/history/260823-1243-coder-two-decision-records-close-as-implemented.md`,
carries an appended correction with the original sentence left standing, on the reasoning the
`Revised by:` convention gives. The copy in `a76ee8f`'s commit message is not editable and stands
uncorrected; that is stated in the closure note rather than glossed.

**3. Low. The plan's marker.** Renamed `_o_` to `_c_` with `mv`. Twenty hard-marker citations of the
plan across seventeen files were rewritten to `_*_` first, the Circle record's `**Active spec/plan:**`
field among them, plus two elided citations of a neighbouring record. The `planner_done` row in
`fusion-workbench/orchestrator-events.jsonl` was deliberately left alone: it is an append-only machine
record of what was true at 06:08, and editing it would falsify a log rather than repair a pointer.
The plan now sits outside both the citation gate's corpus and the stopping-section lint's, which is the
cost the record names and the user's gate accepted.

**4. Low. `inCorpus(PORTFOLIO)`.** Now `inCorpus("portfolio.md")`, plus a four-line comment saying why
the literal, so the next reader tidying it back into the constant meets the reason first.

**5. Low. The README corpus row.** `README-hooks.md:369` now names five kinds, reusing the test file's
own one-line statement of the clause.

**6. Medium. Step 0i's blind branch.** The probe was widened rather than the words narrowed. The
pointer test now runs first and `find` runs unconditionally, so the count is taken always and the
pointer gates only the offer. Order matters twice over: written the other way the block exits 1
whenever no pointer is present, which is one of the two conditions the step exists to report.

## Verified

`cd hooks && npm test` returned exit 0, 41 files, 724 tests.

Step 0i's four branches were exercised in a scratch tree, because a case split is not verified by a
suite that never runs it:

| tree | prints | branch | exit |
|---|---|---|---|
| two `_t_` records, pointer present | `pointer-present` + two paths | `MULTIPLE-ACTIVE` | 0 |
| two `_t_` records, no pointer | two paths | `MULTIPLE-ACTIVE` | 0 |
| one `_t_` record, no pointer | one path | `MISSING-POINTER`, offer | 0 |
| no record, no pointer | nothing | report nothing | 0 |

The first row is the shape the shipped probe could not see and the one the record calls the likelier
under two checkouts. Against the live workbench the probe prints `pointer-present` and this Circle's
own record, which is the report-nothing branch and is correct.

## Measured, every surface touched

| surface | before | after | free after | head-room |
|---|---|---|---|---|
| `skills/` bytes | 240 067 | 240 237 | 202 | 20 000 |
| hook-test lines | 20 177 | 20 181 | 194 | 2 500 |
| `agents/` bytes | 403 056 | 403 056 | 14 787 | 18 000 |
| always-on rules bytes | 95 252 | 95 252 | 3 321 | 12 000 |

`agents/` and the always-on rule set were not touched at all; their figures are recorded so the report
says what did not move as well as what did. `README-hooks.md` is on no bounded surface, +148 bytes,
48 114 to 48 262. Workbench records, reviews, history files and plans are on no bounded surface.

**One golden was regenerated and no baseline moved.** `hooks/lib/__tests__/fixtures/surface-growth.golden`
carries exactly two changed entries and their two totals, and nothing else:

```
-  setup/SKILL.md 49075                    +  setup/SKILL.md 49245
-  total 240067                            +  total 240237
-  workbench-citation-lint.test.ts 370     +  workbench-citation-lint.test.ts 374
-  total 20177                             +  total 20181
```

That is +170 bytes on `setup/SKILL.md` for item 6 and +4 lines on the citation lint test for item 4.
`AGENT_BASELINE`, `SKILL_BASELINE`, `TEST_LINE_BASELINE` and `RULE_BASELINE` are untouched, so the
regeneration records the growth and absolves none of it.

## Note for the next reader

The pattern this Turn's High finding names held for a third time and was caught rather than filed. Two
renames in this pass would have dangled pointers elsewhere: the plan rename into eighteen files, and
the six record closures into the Turn 2 review. Both were searched for before the `mv`, not after, and
both searches had to allow for the elided form ending in an ellipsis, which the citation parser reads
as a pointer and a plain slug search misses. Three of the citations repaired here were of that form.

Nothing was committed. The orchestrator commits.
