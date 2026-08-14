The net-negative circuit breaker compares a per-finding count against a per-batch count

---
The orchestrator's "Net-negative progress" circuit breaker trips on two consecutive Turns where
`issues_created > tasks_resolved`. The two sides are not counted in the same unit. A reviewer files
one issue **per finding**; the orchestrator then folds that whole batch into **one** queue entry for
the next Turn. So a review that finds seven real defects and is fully resolved next Turn contributes
7 to the left side and 1 to the right, and a healthy review loop reads as divergence.

---
**Measured 2026-08-14, Circle `260801-1244-curator`, over its whole life:**

```
Turn | tasks resolved | issues filed by review
  1  |       3        |      7
  2  |       2        |      3
  3  |       3        |      6
```

Every Turn is net-negative, so the breaker's two-consecutive-Turn threshold was met at Turn 2 and
has been met continuously since. Nothing about this Circle was diverging: Turn 1's seven findings
were all closed by Turn 2's T5, Turn 2's three by Turn 3's T6, and the Circle reached both halves of
its Directive. The findings were in shipped prose, none in behaviour, and `npm test` was green at
every Turn boundary.

The breaker did not fire at Turn 2 or Turn 3, which is its own half of the defect: the condition was
met and the check was not performed. It was performed at the end of Turn 3, on the resumed session,
which is where this record comes from.

---
**What the breaker is trying to detect** is presumably work that generates more problems than it
closes — a real and worth-catching condition. Two things it could compare instead, neither
investigated here:

1. issues **filed** against issues **closed**, both per finding, which would have read 7/0, 3/7,
   6/3 for this Circle and tripped on nothing.
2. issues filed in a Turn that are still open two Turns later, which measures the backlog the loop
   is actually leaving behind.

Both are guesses at the right question and neither is a recommendation. What is established here is
only that the present comparison is between two different units and therefore cannot mean what its
name says.

**Affects:** `agents/orchestrator.md` Step 3d, the Net-negative progress row.
**Cross-references:** this Circle's Turn log in
`circles/260801-1244-curator/_t_circle.md`; the Turn-3 review
`circles/260801-1244-curator/reviews/260814-1419-coderev-curator-turn-3.md`.

---
**Reconciliation, 2026-08-14 (reconciler, verified at HEAD `18173e1`). The claim holds. Stays open.**

The two counters are defined nine hundred lines apart in the same prompt and the definitions carry
the unit mismatch on their face:

- `agents/orchestrator.md:1014` — "`issues_created` — issues filed by reviewers during incremental
  review". One file per finding, which is what `agents/coderev.md` produces.
- `agents/orchestrator.md:1011` — "`tasks_resolved` — total tasks marked done". One queue entry,
  whatever number of findings it absorbs.

Nothing in the prompt constrains the fan-in between the two, so the ratio is not merely biased, it
is **undefined**: the same amount of real progress reads as 7-against-1 or as 1-against-1 depending
only on how a batch of findings was enqueued. That is what makes the comparison unable to mean what
its name says, and it is a stronger statement than "the threshold is set too low".

This Circle's own numbers are the worked case and the record states them correctly: 3/7, 2/3, 3/6,
with every Turn's findings closed by the next Turn's single task. Verified against the Turn log in
`circles/260801-1244-curator/_t_circle.md` and against `agentstate.yaml`'s `work_queue`, where T5
carries "The seven Turn-1 review findings" and T6 "The three Turn-2 review findings" as one entry
each.

**One correction to the record's framing, offered rather than edited in.** The record says the
breaker "did not fire at Turn 2 or Turn 3, which is its own half of the defect". That is two defects
in one sentence, and separating them matters for whoever fixes it. The comparison being cross-unit
is a design fault in `agents/orchestrator.md:600`. The check not being performed at a Turn boundary
where its condition held is an execution fault of this session, and it is the same shape as the
Turn-3 bookkeeping gap filed as
`circles/260801-1244-curator/issues/260814-1450_o_the-turn-3-bookkeeping-says-no-review-ran-in-the-commit-that-landed-the-review.md`.
Fixing the metric will not make the check run.

**`inference:`** the record's candidate 1, filed against closed both per finding, is the shape that
`agents/orchestrator.md:1015` already has a counter for — `issues_resolved` — which the breaker
does not read. That is a hint the right comparison was available and not wired, not a proof of it;
the record is right to call both candidates guesses.
