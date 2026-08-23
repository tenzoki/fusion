Closing a Circle removes its open records from every agent's scan set, and no closure step relocates or names them

---

**Severity:** Medium
**Domain:** code
**Filed by:** coderev, reviewing C2 Turn 3
**Affects:** `agents/orchestrator.md:880-905` (Phase 4 Circle closure, steps 1 to 7 and the Report block), `bin/fusion-paths` (the `SCAN_*` resolution), `rules/fusion-workbench-conventions.md` `## Path Resolution`
**Cross-references:** `shared/issues/260801-1020_*_scan-keys-never-reach-the-archive-store.md`, the same shape one store further on and **not** this record. That one is about `archive/`; this one is about Circles still sitting under `circles/`

---

## What is wrong

`bin/fusion-paths` resolves every `SCAN_*` key to **the active Circle's store plus the shared one**. Measured at HEAD:

```
$ bin/fusion-paths taskplanner | grep SCAN_ISSUES
SCAN_ISSUES=circles/260823-0023-settle-what-travels-between-checkouts/issues shared/issues
```

`SCAN_CIRCLES=circles` is emitted to orchestrator, playmaker and curator, but it names the Circle *records*, not their issue or decision stores. So the moment `.active-circle` is cleared at Phase 4 step 4, every `_o_` record inside the closing Circle leaves the read set of taskplanner, reconciler, playmaker, curator and the orchestrator, at once and permanently. Nothing in Phase 4 moves them to `shared/`, and the closure Report block names commits and staging rows but never an open record left behind.

**This is not hypothetical and it is not small.** Counted over `circles/*/`:

| Circle | marker | open issues | open decisions |
|---|---|---|---|
| `260801-1244-curator` | `_c_` | 17 | 1 |
| `260801-1244-guard-rules-write` | `_c_` | 2 | 0 |
| `260807-0923-guard-misst-statt-orakelt` | `_c_` | 1 | 0 |
| `260813-0858-playmaker-maintains-backlog-store` | `_c_` | 4 | 0 |
| `260815-0007-remove-eight-mechanisms-and-cap-growth` | `_c_` | 24 | 2 |
| `260816-1741-guard-becomes-observation-only` | `_b_` | 7 | 0 |
| `260819-1645-four-constraints-on-deep-change` | `_c_` | 2 | 0 |
| `260820-2051-style-rules-arrive-and-get-measured` | `_b_` | 17 | 11 |
| `260821-1042-reply-bounded-whole-question-answered` | `_c_` | 0 | 5 |
| `260822-1921-measure-what-two-checkouts-share` | `_c_` | 1 | 0 |

75 open issues and 19 open decisions are already outside every scan, none of them archived.

**Why it is filed now rather than as general framework drift.** C2 is closing over three `_o_` issues and one `_o_` decision whose deferral reasoning depends on being found later. `260823-1110_*_the-merge-driver-unsorts-a-second-event-log-reader-…` says explicitly that its warning is "a note onto C4", and C4's own plan input, `shared/issues/260822-1136_*_two-definitions-of-the-turn-count-disagree-…`, carries **no reference back to it**. Checked: zero hits for the C2 record or for the merge driver in that file. So the mechanism the deferral relies on is a reader who happens to open a closed Circle's issue store.

## Verified

`bin/fusion-paths` run at HEAD for `taskplanner`, `reconciler`, `playmaker`, `curator` and `orchestrator`: all five get `SCAN_ISSUES` and `SCAN_DECISIONS` scoped to the active Circle plus `shared/`. `agents/orchestrator.md` Phase 4 steps 1 to 7 read in full: no step enumerates, relocates or reports the closing Circle's open records. Counts taken with `ls circles/*/issues | grep -c '_o_\|_p_'` and the decisions equivalent.

## Direction, not a prescription

Three shapes, and the choice is the framework owner's rather than an executor's.

Name them at closure: Phase 4 reports the closing Circle's `_o_` records to the user, so a deferral is a thing somebody saw. Cheapest, and it changes no store.

Or relocate them: closure moves open records to `shared/`, which is the store defined for work with no Circle affiliation, and a Circle that has closed is exactly that. It invalidates every citation of them unless the move rewrites them, which is the objection the Origin Rule already records against moves.

Or widen the read: a `SCAN_*` variant that reaches every Circle's store. That is the option `260801-1020` weighs for `archive/`, at the same cost, unbounded read scope, and answering the two together would be cheaper than answering either alone.

---
Reconciliation evidence, second Coherence pass, 260823-2130. Marker unchanged: the gap is real,
unrepaired, and fusion-wide. Two figures in the table above are corrected here rather than in place,
so the record's own measurement stays legible beside the correction.

**The issue column is exact.** Re-counted at HEAD across `circles/*/issues/`, excluding the active
Circle: **75** open defect records, held by **9** non-active Circles. The table lists ten rows because
`260821-1042-reply-bounded-whole-question-answered` holds five open decisions and no open issues. The
75 is stable across the whole session range.

**The decisions column counts open plus answered, and the summary line calls it open.** Re-counted at
HEAD: **12** open (`_o_`) and 7 answered (`_a_`), 19 together, across 4 Circles. Per row —
`260820-2051-style-rules-arrive-and-get-measured` 11 open and 0 answered; `260821-1042-…` 1 open and 4
answered; `260801-1244-curator` 0 open and 1 answered; `260815-0007-remove-eight-mechanisms-and-cap-growth`
0 open and 2 answered. So line 39's "19 open decisions" should read 12 open decisions, or 19 active ones
if the answered are meant to be in scope, which is defensible: an `_a_` record is grounding a later
Circle may need and it leaves the scan set at the same moment.

**The correction does not weaken the record.** 75 stranded defects and 12 stranded open questions is
the same finding at the same order of magnitude. It is corrected because the record's argument is a
measurement, and a measurement that is wrong in a summary while right in its own table is the exact
failure mode the C2 Turn 4 review named across four separate records.

**This Circle's own contribution, if it closes now:** 9 open records — 8 defects and 1 decision, after
this pass closed six that were already resolved on disk and still carried `_o_`. Two of them are C4's
own inputs (`260823-1110_*` the second event-log reader, `260823-1302_*` the monitor's
session attribution), so a C4 planner reading only `shared/` will not find them.
