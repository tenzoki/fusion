The Circle's release precondition is written against a measurement that cannot read zero at closure

---
`circles/260824-0530-record-attribution-and-circle-claim/planning/260824-0613_*_c3-attribution-on-records-and-a-claim-on-the-circle.md` `## Where this Circle stops` states, as a precondition on any release or tag carrying this work, that `bin/fusion-review-coverage` "must name no uncovered commit in that range". At HEAD `cf7a5b0` it names one, and the one it names is the review file's own commit. A review pass that lands in its own commit can never be covered by itself, so the precondition as written is unsatisfiable at the moment it is meant to be read.

---
**Filed by:** reconciler

**Found by:** Phase 3 reconciliation of session `260824-0539`, checking the plan's own precondition rather than accepting the dispatch's statement of it.

**Severity:** Low on the work, Medium on the clause. Nothing shipped is wrong. What is wrong is a clause that reads as a gate, is quoted as one in a commit message, and cannot be satisfied.

## What was measured

`"$FUSION_PLUGIN_ROOT/bin/fusion-review-coverage" --since e209011` at HEAD `cf7a5b0`:

```
commits=18  reviews=2  unusable=0  uncovered=1  verdict=uncovered
  uncovered cf7a5b0 docs(reviews): the second pass closes the Circle's coverage and finds the exit code the repaired rule forgot
  review .../260824-1625-coderev-c3-two-fix-commits.md range=0f5889e..3fba5c6 not-opened=none covers=2
  review .../260824-1538-coderev-c3-attribution-and-claim-full-range.md range=e209011..0f5889e not-opened=none covers=15
```

`git show --stat cf7a5b0` lists four files, all under `fusion-workbench/`: the review file itself and the three records it filed. No shipped file is in it.

## The commit message states the opposite, and was right when it was written

`cf7a5b0`'s message opens: "`bin/fusion-review-coverage` now reads `uncovered=0 verdict=covered` over `e209011..HEAD`, 17 commits across two review files. That is the plan's release precondition met." That measurement was taken before the commit existed. Committing it moved HEAD to include it and made the sentence false, in the same act that recorded it. A commit message asserting a HEAD-relative measurement of itself is the general shape; this is one instance of it.

## Why this is filed and not appended

`circles/260801-1244-curator/issues/260814-2153_*_the-commit-that-closes-the-last-reviews-own-high-finding-is-the-one-commit-no-review-opens.md` names the cadence: the commit that discharges a review's findings is the one commit no review opens. That record has this pass's `Also seen:` line and is the right home for the cadence question. This record's subject is different: a *plan* wrote a release gate in the letter of an instrument the project had already decided is advisory, and a commit message quoted that gate as met. `shared/decisions/260815-2109_*_may-a-circle-close-over-an-uncovered-review-range-and-who-decides.md` was answered as option 1 on 2026-08-16 — coverage is advisory, the gap is a named residual in the closure note — so the clause was already inconsistent with the project's own answer on the day it was written.

## Fix direction

Two candidates, and this record picks neither.

1. **Amend the clause to the substance the answered decision already carries**: no uncovered commit in the range may touch a shipped file. Under that reading the precondition is met at HEAD, since the one uncovered commit touches only `fusion-workbench/`. This is option 3 of `260815-2109`, which that record has now recorded as absent from `hooks/lib/review-coverage.ts` across five consecutive checks; writing it into a plan clause before it is in the helper means the split stays a hand operation.
2. **Drop the precondition and rely on the closure note**, which is what option 1 of that decision prescribes and what four previous Coherence verdicts have applied.

Choosing between them is a decision about what a plan-stated precondition may assert, adjacent to `shared/decisions/260817-1613_*_does-a-plan-stated-precondition-get-any-mechanism-or-is-it-read-by-a-human-or-not-at-all.md`, which this plan's clause cites as its own binding record.

---
Resolved: fixed — the clause is amended to the answered decision's substance (option 1 of `260815-2109`: coverage is advisory, an uncovered commit is a named residual in the closure note); circles/260824-0530-record-attribution-and-circle-claim/planning/260824-0613_*_c3-attribution-on-records-and-a-claim-on-the-circle.md:517
