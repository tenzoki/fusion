# A timing case in the commit-lock test fails under load and passes in isolation

---

**Severity:** Low — no product defect is implied, but a suite that fails for reasons unrelated to the change under test erodes the one gate this session commits on
**Domain:** code
**Filed by:** orchestrator, from an observation the T16 executor reported alongside its own work (session `260810-0844`, Turn 4)
**Affects:** `hooks/lib/__tests__/fusion-commit-lock.test.ts` — one timing case
**Cross-references:** `shared/issues/260810-0918_o_the-suite-total-moves-between-runs-and-the-variance-is-entirely-in-one-file.md` (a different instability in the same suite); `bin/fusion-commit-lock`; `rules/workbench-stash-and-lock.md` `## Commit lock`

---

## The observation

During Turn 4, with three agents running `npm test` concurrently against the same checkout,
one full-suite run failed a single timing case in `fusion-commit-lock.test.ts`. The same case
passed in isolation, and passed on the next full run. Two other runs in the same window failed
only on files a concurrent task was editing, which is a different and understood cause.

## What has not been established

Whether the flake is load-induced or intrinsic. The observation was made under an unusual
condition — three vitest processes on one machine — and that is exactly the condition under
which a timing assertion with a real sleep in it will fail without anything being wrong. So
the honest reading is that this may be a test that is correct but not robust under CPU
contention, rather than a test that is wrong.

Nobody has identified *which* case it was. The executor reported the file and the shape, not
the case name, because it was correctly staying inside its own scope. That is the first thing
to establish and it is cheap: run the file alone in a loop under artificial load and see which
case moves.

## Why it is worth a record

This session commits on the suite's exit code, and every task in it was asked to report that
code as the thing that decides whether its work lands. A suite with a load-sensitive case in it
means that gate has a false-failure mode, and a false failure teaches its reader to re-run
rather than to look — which is the same erosion the drift-check record (`260810-0710`,
closed) described from the other side.

The commit lock is also the mechanism that makes concurrent agents safe to run at all, so a
flaky test of it is worth understanding rather than retrying past. Note that the lock's own
documented behaviour includes real timing: a 200ms poll with exponential backoff to 2s, and
stale-lock detection at 60 seconds. A test of that necessarily waits, and the question is
whether it waits on a wall clock or on an injectable one.

## Fix direction

Identify the case first. If it asserts on elapsed wall-clock time, the fix is to make the
timing injectable rather than to widen the tolerance — a widened tolerance is the same test
with a longer fuse. If it depends on the stale-lock threshold, that threshold is a constant the
test could be given rather than sharing with production.
