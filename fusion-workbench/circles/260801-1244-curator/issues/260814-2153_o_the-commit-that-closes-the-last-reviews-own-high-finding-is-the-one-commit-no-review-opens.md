The commit that closes the last review's own High finding is the one commit no review opens

---
`bin/fusion-review-coverage` reports `uncovered=1` at HEAD `d90b794`, and the uncovered commit is
the one that closed the Turn-6 review's only High finding. Every earlier Turn's fix commits were
opened by the *next* Turn's review; the last Turn has no next Turn, so its fix commit reaches
closure unopened. The gap is not caused by anyone skipping a step — it is where the review cadence
ends relative to where the Circle ends.

---
**Found by:** `reconciler`, second Phase-3 pass of session `260813-2345`, Circle
`260801-1244-curator`.
**Owner:** `orchestrator` — the cadence is a flow question, not a defect in any commit.
**Severity:** Low. The one uncovered commit changes a single clause of `CLAUDE.md` and adds records;
this pass read that clause at HEAD against `hooks/lib/__tests__/config.test.ts:1266` and against
`diff fusion-guard.json templates/fusion-guard.json`, and it is correct. What is missing is a
reviewer's independent pass, not a verified claim.
**Affects:** `agents/orchestrator.md` Phase 3 / Phase 4 ordering; `bin/fusion-review-coverage` as
the instrument that reports it.
**Cross-references:**
`circles/260801-1244-curator/issues/260814-2033_o_a-resume-that-re-enters-at-phase-3-never-asks-whether-the-turn-it-skips-past-was-reviewed.md`
(the same instrument reporting the same shape on the resume path — that record's cause is a skipped
review, this one's is a review that ran and then had work land after it);
`shared/issues/260810-1205_c_seven-of-sixteen-commits-in-the-session-range-never-reached-a-review-pass-and-nothing-measures-the-gap.md`
(the record that produced the helper).

## What was measured

`./bin/fusion-review-coverage` at HEAD `d90b794`:

```
commits=29  reviews=7  unusable=1  uncovered=1  verdict=uncovered
  uncovered d90b794 docs(claude-md): the two sentences f0d9d60 made false in the same Turn it repaired the mechanism
  review .../260814-2128-coderev-curator-turn-6.md range=41c224c..d270666 not-opened=none covers=3
```

The Turn-6 review declares `41c224c..d270666`. `d90b794` landed after it, because `d90b794` *is* the
repair of that review's F1. The same relation held at every earlier Turn and was invisible there: the
Turn-4 fix commits were covered by the Turn-5 review, the Turn-5 fix commits by the Turn-6 review.
Turn 6 is the last Turn, so nothing stands after it but closure.

## Why it is not the resume record's shape

`260814-2033_o` names a path where a review *never ran*. Here the review ran, on the correct range,
and reported `not-opened=none`. The uncovered commit exists because the review had findings and the
findings were fixed — which is the cadence working, not failing. The two records share an instrument
and not a cause, which is why this is filed rather than annotated onto that one.

## What a fix would have to establish

Not "run one more review". A review of `d90b794` would itself be followed by whatever it caused, and
the same commit would be uncovered one link further along. The question is which of these is the
project's answer, and this record does not pick one:

1. **Closure tolerates a bounded uncovered tail** — state the bound in `agents/orchestrator.md`
   (for instance: uncovered commits that touch no shipped executable and carry no new claim), and
   have Phase 4 report the tail rather than treat `uncovered>0` as an anomaly.
2. **A closure-time review pass covers the tail**, run after the last fix commit and before the
   closure commit, accepting that its own findings would have to be deferred to a record rather
   than fixed in place.
3. **The fix for a review finding is folded into the reviewed range** by re-declaring the review's
   `**Reviewed-range:**` after the fix lands — which changes what a `**Reviewed-range:**` field
   asserts, and is therefore a decision rather than a repair.

Option 3 is the one that changes the meaning of an existing field, so it belongs to a decision
record if it is preferred.


---

**Reconciliation 260819-1453 (reconciler, Domain `code`, Circle-store pass) — STAYS `_o_`. Re-measured at HEAD `e435f03` (v10.3.0). The governing question was answered elsewhere; the structural condition is untouched, and the answer is not implemented.**

`shared/decisions/260815-2109_a_may-a-circle-close-over-an-uncovered-review-range-and-who-decides.md` was answered by the user inline on 2026-08-16 as options 3 then 1, which subsumes this record's option 1. It stands `_a_` with an empty `Implemented:` line, and its own 260817-1836 reconciliation records that option 3 is absent from the code: `hooks/lib/review-coverage.ts` filters the uncovered set by coverage alone (`:612`) and names no shipped-file predicate.

Meanwhile `agents/orchestrator.md:602` still tells the reader *"whether a release may go out over an uncovered range is a decision nobody has filed"* — which was true when written and is false now.

**One correction that belongs to whoever picks this up.** Decision `260815-2109` cites this record as `shared/issues/260814-2153_o_…`. No such path exists: this file is in `circles/260801-1244-curator/issues/`. The citation is in the shared decision store, which this pass does not write to.
