An open defect cites a test file deleted eleven days ago, so half of it is unfixable as written

---

`shared/issues/260810-0510_o_two-of-the-queue-ground-lints-negative-controls-re-implement-the-logic-instead-of-calling-it.md` names two files in its `**Affects:**` line, with line ranges. One of them no longer exists.

```
$ ls hooks/lib/__tests__/ | grep -i queue          # no match
$ git log --oneline --diff-filter=D -1 -- hooks/lib/__tests__/queue-ground-lint.test.ts
dd312eb refactor(queue): the persisted task list goes, the batching stays
```

`hooks/lib/__tests__/queue-ground-lint.test.ts:222-256` is the subject of the record's part 1, which is the larger half: two of three negative controls in that file were tautologies that asserted a property of a string the test had just built, rather than calling the production assertion. That finding cannot be acted on, cannot be verified, and cannot be closed by a diff, because the file went with the persisted task list it gated.

Part 2 still stands. `hooks/lib/__tests__/executor-verification-report-lint.test.ts` exists at 218 lines and the record's claim about its fixture is unaffected.

---

## Why this matters beyond one record

The record is open, so it is read as live work. A queue built from the open issues offers it as a task; an executor that picks it up spends a dispatch establishing that its main subject is gone. That is the cost of a stale record rather than of the defect it describes.

It also sits in the corpus a cut-only Circle has to survey. Plan `shared/planning/260822-1154_*_plan-c0-cut-only-circle-buys-head-room-on-four-bounded-surfaces.md` step 1 reads the open defects that name duplication in the hook test suite in order to build its cut ledger, and this is one of them. A ledger row derived from a deleted file is a cut that cannot be made.

**The class, not the instance.** Nothing walks the `**Affects:**` lines of open records against the tree. `hooks/lib/__tests__/workbench-citation-lint.test.ts` recomputes its corpus from the tree on every run and does resolve workbench citations, so a token pointing at a deleted path should in principle redden the suite; it did not here, which is worth establishing before this record is closed. Either the citation form in that `**Affects:**` line is outside the gate's predicates, or the gate's corpus does not reach `shared/issues/`. Whichever it is, it is a second finding and belongs in its own record once measured.

---

**Fix direction, and the choice is small.** Append a note to `260810-0510` stating that part 1's subject was deleted in `dd312eb`, narrow the record to part 2, and leave the marker open on part 2's strength. Do not close the whole record: part 2 was never fixed and closing it would lose a live finding to a housekeeping edit. Do not rewrite the `**Affects:**` line in place either; the line records what the reviewer saw, and a note is how this project records that a subject went away.

---
**Severity:** Low. Nothing is broken; a live record points at a file that is not there.
**Domain:** code
**Filed by:** planner, while surveying the hook test suite for C0's cut ledger
**Affects:** `shared/issues/260810-0510_o_two-of-the-queue-ground-lints-negative-controls-re-implement-the-logic-instead-of-calling-it.md`
**Verified at HEAD `370bfc5`** by listing `hooks/lib/__tests__/`, by `git log --diff-filter=D` on the named path, and by confirming that `executor-verification-report-lint.test.ts` is present at 218 lines.
**Cross-references:** `shared/planning/260822-1154_*_plan-c0-cut-only-circle-buys-head-room-on-four-bounded-surfaces.md` step 1, which reads that record as ledger input.
