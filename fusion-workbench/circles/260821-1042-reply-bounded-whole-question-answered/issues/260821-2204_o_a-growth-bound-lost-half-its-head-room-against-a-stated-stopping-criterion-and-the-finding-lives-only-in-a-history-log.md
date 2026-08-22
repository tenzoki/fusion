A growth bound lost half its head-room against a stated stopping criterion, and the finding lives only in a history log

---

The plan's `## Where this Circle stops` requires that "none of the four growth bounds stands closer to failing than it did at HEAD `e764637`". The hook-test bound went from 21 lines of head-room to 11. Step 6 measured it, named it, and recorded it in its own history file, which is the one place `rules/fusion-workbench-conventions.md` `## Issue and Decision Filing` says a defect may not live. No record in any store carried it.

---

**Affects:** `circles/260821-1042-reply-bounded-whole-question-answered/planning/260821-1805_*_plan-reply-bounded-whole-question-answered.md:57` and `:180`; `hooks/lib/__tests__/reference-resolution-lint.test.ts:905-914`; `hooks/lib/__tests__/fixtures/surface-growth.golden:81,92`.

**Severity:** Medium. The growth itself is small and was honestly reported; the unfiled state is the defect, and the stopping criterion cannot be met as written.

**The numbers, reproduced.**

```
$ node -e '<sum TEST_LINE_BASELINE>'   # 17 875
$ find hooks/lib/__tests__ -name '*.ts' | xargs cat | wc -l   # 20 364
17 875 + 2 500 = 20 375 budget → 11 lines of head-room
```

At the anchor the surface stood at 20 354, so head-room was 21. The plan's budget table at `:57` records the surface as "Not touched, and no test is added", and its stopping criterion at `:180` reads:

> `cd hooks && npm test` exits 0, and none of the four growth bounds stands closer to failing than it did at HEAD `e764637`.

That criterion is unmet and cannot be met by anything the Circle still has to do. A closure note that repeats it would be false.

**What spent the ten lines.** Two attribution comment blocks above `BASELINE` in `hooks/lib/__tests__/reference-resolution-lint.test.ts`, six lines for step 2 and four for step 3. No test logic was added.

**One claim in the step-6 log does not hold, and it is the claim that justifies the spend.** `circles/260821-1042-reply-bounded-whole-question-answered/history/260821-2147-coder-the-corpus-is-measured.md:197`:

> The gate demands a written attribution for every baseline move, so the lines are the cost of an existing gate being obeyed rather than new test logic.

The gate demands no comment. `hooks/lib/__tests__/reference-resolution-lint.test.ts:919-929` is the whole of what it says on re-approval:

> If the change is legitimate, RE-APPROVING THE BASELINE IS THE EXPECTED RESPONSE: check the received numbers against the edit you made, then write them into BASELINE in this file and commit that with the edit.

The attribution comment is a convention of that file, carried by its accumulated comment stack, not a demand of the assertion. The convention is a good one and this record does not argue for dropping it. It argues that the cost was a choice and could have been sized as one.

**And the two blocks could have been one.** Both baseline moves land in a single commit; only the final triple `{ paths: 1258, anchors: 163, records: 116 }` is committed, and the intermediate `{ 1257, 162, 116 }` appears in no commit. One block naming both contributions would have carried the same reconstruction at roughly half the lines. The mitigating context is real and should be recorded with the fix: the user chose green-at-each-step over the plan's regenerate-once (`circles/260821-1042-reply-bounded-whole-question-answered/history/260821-2108-coder-regenerate-two-golden-fixtures-after-step-2.md:10-15`), which forced a per-step number update. It did not force a per-step comment block.

**What the fix is not.** Not a baseline move. `hooks/lib/__tests__/helpers/growth-bound.ts` authors the two events at which a baseline moves and neither happened here. The options are to consolidate the two comment blocks, or to accept the 11 lines and say so in the closure note instead of repeating the criterion at `:180`.

**Cross-references:** `circles/260821-1042-reply-bounded-whole-question-answered/history/260821-2147-coder-the-corpus-is-measured.md` `## The other three growth bounds` (where the executor recorded it, correctly and in full); `circles/260815-0007-remove-eight-mechanisms-and-cap-growth/issues/260815-0803_*_the-plans-step-3-file-list-says-fourteen-fixture-files-and-the-tree-held-fifteen.md` (the same class, a measurement recorded only in a history log); `rules/fusion-workbench-conventions.md` `## Issue and Decision Filing`.

---

**Progress 2026-08-21: four of the ten lines are back, six are not.**

The two attribution blocks are now one, at `hooks/lib/__tests__/reference-resolution-lint.test.ts:905-910`. Every fact the two carried survives in it: which file and which two sections were edited, which token moved which class, that no other rewrite in either step contributed one, that no scanner, exemption or class changed, and how each step was attributed. What went is what consolidation removes and nothing else: the second date stamp, the second naming of the file, the second attribution sentence, and the two separate statements of which classes stayed put.

The surface now stands at 20 360 lines against a budget of 20 375, so head-room is 15 where it was 11, and where HEAD `e764637` had 21.

```
$ find hooks/lib/__tests__ -name '*.ts' | xargs cat | wc -l   # 20 360
17 875 + 2 500 = 20 375 budget → 15 lines of head-room
$ cd hooks && npm test                                        # exit 0, 40 files, 718 tests
```

`hooks/lib/__tests__/fixtures/surface-growth.golden` was regenerated per its own header. Its diff is the one file entry (1432 to 1428) and the surface total (20 364 to 20 360), nothing else.

**Why the last six are not recoverable here.** They are the note itself. The stopping criterion asks that no bound stand closer to failing than at the anchor, and this Circle moved the pin, which the file's convention answers with a written attribution. Only a note costing zero lines satisfies the criterion as written, and a note costing zero lines is no note. This record argues against buying lines that way, so six lines of the gap stand: the closure note should state 15 lines of head-room rather than repeat the criterion at `circles/260821-1042-reply-bounded-whole-question-answered/planning/260821-1805_*_plan-reply-bounded-whole-question-answered.md:180`.

The record stays open. What it now holds is a decision for the closure, not a defect with an unapplied fix.

---
**Reconciliation 260821-2349** (reconciler, HEAD `9a68760`). **Confirmed open, and its figures are
current rather than stale.** Re-measured independently: `find hooks/lib/__tests__ -name '*.ts' |
xargs cat | wc -l` gives 20 360 against a budget of 20 375, so 15 lines of head-room, which is what
this record's progress note states. `hooks/lib/__tests__/fixtures/surface-growth.golden` agrees at
`total 20360`. The two attribution blocks are one at
`hooks/lib/__tests__/reference-resolution-lint.test.ts:905-910`. `cd hooks && npm test` exits 0,
40 files and 718 tests.

One correction to how this is being framed at closure. It is being read as "no zero-line outcome
exists". The tree supports a weaker statement: a zero-line outcome existed and was declined on good
grounds. The gate's own re-approval text at `hooks/lib/__tests__/reference-resolution-lint.test.ts`
asks only that the received numbers be checked and written into `BASELINE` with the edit; the
attribution comment is that file's accumulated convention, which this record itself says it does
not argue for dropping. Honouring the convention was a defensible choice and it cost the six
remaining lines. The criterion at
`circles/260821-1042-reply-bounded-whole-question-answered/planning/260821-1805_*_plan-reply-bounded-whole-question-answered.md`
`## Where this Circle stops` is unmet at closure either way, which is what this record asks the
closure note to say.

---
**Reconciliation 260822-0234** (reconciler, domain `code`, HEAD `05b46f2`). **Confirmed open, and
the figure has not moved since the last pass.** Re-measured by summing `TEST_LINE_BASELINE` out of
`hooks/lib/__tests__/surface-growth-bound.test.ts` over the files present and comparing against the
tree the way that test does: 20 360 lines against a budget of 20 375, so 15 lines of head-room,
where HEAD `e764637` had 21. `cd hooks && npm test` exits 0, 40 files and 718 tests.

**Tonight's eleven commits touched no file under `hooks/`**, verified with `git diff --stat
084c626..HEAD`, so nothing in the 260822-0019 session spent or recovered a line here. The six-line
gap this record ends on is the same six lines, and the disposition it asks for is unchanged: the
closure note states 15 lines of head-room rather than repeating the criterion at
`circles/260821-1042-reply-bounded-whole-question-answered/planning/260821-1805_*_plan-reply-bounded-whole-question-answered.md`
`## Where this Circle stops`.

**This is the single flagged item on the Artifact-to-Grounding edge of tonight's Coherence
verdict**, recorded in
`circles/260821-1042-reply-bounded-whole-question-answered/history/260822-0019-orchestrator-session.md`
`## Coherence`. The record stays open past the Circle's closure by design: what it holds is a
statement the closure note has to make, and it survives the Circle to say so.
