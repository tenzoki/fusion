# coder — Net-negative breaker: aligned populations, stated residual, repaired worked example

**Status:** Complete
**Date:** 260816-0050
**Agent:** coder
**Source record:** `260815-2328_*_the-net-negative-breakers-two-counters-cover-different-populations-and-both-are-the-untrusted-pair.md`
**Files changed:** `agents/orchestrator.md` (+544 B)

## What the task was

A review finding against `3c0e7da`, in two parts. Part 1: the Net-negative circuit breaker's two
inputs are the same unit over different populations — `issues_created` scoped to reviewers at
Step 3c, `issues_resolved` unscoped — so the comparison is biased toward not tripping, the mirror
of the bias `3c0e7da` removed. Part 2: the worked example below the exit table no longer names a
task resolution (while the Zero-progress row it must clear is stated in tasks) and closes on a
queue-entry claim resting on the 1:1 issue-to-task mapping the same commit denies.

## What I changed

1. **`:952`/`:953` — the definitions.** `issues_created` widened to "issues filed this session by
   **any** agent or the user, not only by reviewers at Step 3c"; `issues_resolved` to "issues
   resolved this session by **any** agent". Populations now match on both producer and moment.
2. **After the circuit-breaker table — the trust position, stated.** One paragraph: Net-negative is
   the only control decision reading the untrusted pair; per-Turn derivation would cost the
   Phase-4 store read every Turn and is not paid; the row is a divergence signal, not a
   measurement.
3. **`:642` — the worked example.** Now "A Turn that resolves one task — closing one issue — and
   files another that enters the queue satisfies none of them: no error, no halt, work still
   runnable, and one entry off the queue for one on."

## Judgement: was the definition edit sufficient?

**Necessary, not sufficient — and the shortfall is stated rather than fixed.** The population
asymmetry is a defect with no defence, so it was closed. The trust question is different: the
breaker reads two counters the prompt itself distrusts, at a zero-difference threshold where a
drift of one flips the verdict.

Deriving the inputs was considered and rejected as out of proportion to a review fix. The Phase-4
derivation is anchored at `session.git_head_at_start` and yields session-cumulative counts; the
breaker needs a per-Turn delta, so it would need a second derivation anchored at
`control.turn_start_head` — a new ~20-line block running every Turn. That is a design change
carrying its own per-Turn cost, and it belongs in a decision record. So the position was written
down instead, which is what the source record's part 3 asks of whoever touches part 1.

## Residual left standing (not this record's finding)

The counters are session-cumulative by their own definition, while Net-negative reads them as a
per-Turn comparison and Zero-progress as per-Turn deltas. This predates `3c0e7da` and was left
untouched.

## Verification

`cd hooks && npm test` — **exit 1**. Sole failure: `surface-growth-bound.test.ts > matches the
checked-in golden`, the per-file byte inventory the dispatch names as stale by design and excludes
from scope; 750 of 751 tests pass. Run in a detached worktree carrying only this patch, so the
signal is not contaminated by concurrent edits to other bounded surfaces. The `agents` growth bound
itself did not trip — 544 B against roughly 17 800 B of head-room.

## Note

The issue-record rename was done with `git mv`, which stages it. No `git add` or `git commit` was
issued; the orchestrator commits.
