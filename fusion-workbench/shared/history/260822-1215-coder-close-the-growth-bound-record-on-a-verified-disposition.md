# Close the growth-bound record on a verified disposition

**Agent:** coder
**Task source:** `260822-1154_*_plan-c0-cut-only-circle-buys-head-room-on-four-bounded-surfaces.md`, step 8
**Status:** Complete
**HEAD at start:** `370bfc5`

---

## What the step asked for

Close `260821-2204_*_a-growth-bound-lost-half-its-head-room-against-a-stated-stopping-criterion-and-the-finding-lives-only-in-a-history-log.md`,
but only after confirming against the tree that the disposition it asked for was in fact made. No
shipped surface is touched, so the step spends none of the head-room the Circle is buying.

## What was verified, and how

**Claim 1: the closure note states 15 lines of head-room as residual 1 rather than repeating the
criterion.** True.
`260821-1042-reply-bounded-whole-question-answered` `## Closure note` carries
"Three residuals, named rather than resolved", whose first entry states 15 lines against 21 at HEAD
`e764637` and names the record as the place the finding lives. It does not restate the criterion at
`260821-1805_*_plan-reply-bounded-whole-question-answered.md`
`## Where this Circle stops`.

**Claim 2: the two attribution blocks were consolidated into one.** True.
`hooks/lib/__tests__/reference-resolution-lint.test.ts:905-910` is one six-line block dated
2026-08-21 covering both steps 2 and 3 of that Circle in a single re-approval. The block above it is
the earlier 2026-08-20 entry and the block below it is the 2026-08-22 v10.5 entry, neither of which
belongs to the pair the record complains about.

**The decision cited is the right one.** Read
`260822-1154_*_does-the-hook-test-line-budget-cover-comment-prose.md` in full before
citing it. Its question is exactly the residual the defect raises without answering, it names this
defect as its measured instance in its own cross-references, and it reaches no recommendation. The
planner's other record of the same stamp,
`260822-1154_*_does-a-cut-only-circle-re-baseline-the-surfaces-it-cuts.md`, is about
re-baselining and is not the one this note wanted.

**The head-room figure has moved since the closure.** Re-measured at HEAD `370bfc5` the way
`hooks/lib/__tests__/surface-growth-bound.test.ts` measures it: `TEST_LINE_BASELINE` sums to 17 875
over 39 entries, the budget is 20 375, and the tracked `.ts` files under `hooks/lib/__tests__` hold
20 363 lines, so head-room is 12 rather than the 15 the closure note states. `git diff --stat
9a68760 370bfc5 -- hooks/lib/__tests__` attributes the whole delta to one commit: three lines of
re-approval comment for the v10.5 release plus the regenerated golden. That is the same class of
spend the record is about, which is worth a reader knowing and is stated in the note.

## What was written

One `Resolved:` note appended to the record, per `rules/fusion-workbench-conventions.md`
`### Issue files`, then the marker renamed `_o_` to `_c_`. The note carries the two verifications, the
re-measurement at HEAD with its command, the statement that 15 is a figure at that closure and not a
property of the surface, and the citation of the open decision with the explicit statement that
closing the defect does not close the question.

**The closed plan's `## Where this Circle stops` was not touched**, per the step. A closed record is
not edited to make a past criterion true.

## What was deliberately not done

`git mv` staged the rename, which is an implicit `git add` the dispatch forbids and a shared index
another executor is working against. It was unstaged path-scoped with `git restore --staged` over
exactly the two paths, leaving the working tree rename intact and the staging decision with the
orchestrator. No whole-tree git command was run at any point.

## Verification

`cd hooks && npm test` exits 0, 40 files, 718 tests.

Here that proves one thing only, and the plan says so: the record edit and the marker rename broke no
citation gate. `hooks/lib/__tests__/workbench-citation-lint.test.ts` recomputes its corpus from the
tree on every run, so a rename leaving a stale citation elsewhere would redden it. It did not, because
every citation of this record outside the file itself uses the `_*_` marker glob rather than the
literal marker: checked across `fusion-workbench/portfolio.md`, the Circle record, the Circle's plan,
four history files, five issue files, four review files, `260822-1136_*_spec-fusion-becomes-a-multi-user-tool.md`
and the decision record. The suite proves nothing about the Circle's cut targets, which step 9 measures.

## Files changed

- `260821-2204_*_a-growth-bound-lost-half-its-head-room-against-a-stated-stopping-criterion-and-the-finding-lives-only-in-a-history-log.md`
  (renamed from `_o_`, `Resolved:` note appended)
