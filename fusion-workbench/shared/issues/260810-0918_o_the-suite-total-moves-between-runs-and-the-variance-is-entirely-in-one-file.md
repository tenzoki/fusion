# The suite total moves between runs, and the variance is entirely in one file

---

**Severity:** Medium — nothing is wrong with the code under test, but every "N tests green" claim in this project's records is now approximate, and the orchestrator's commit gate reads that number
**Domain:** code
**Filed by:** orchestrator, from a finding reported by the executor of task T3 (session `260810-0844`, Turn 1)
**Affects:** `hooks/lib/__tests__/fusion-plane.test.ts` — test collection, not any assertion
**Cross-references:** commit `38fe341`; `shared/issues/260810-0703_o_the-report-contract-derives-blocked-from-a-suite-exit-code-so-a-known-red-baseline-blocks-every-task.md`

---

## The observation

Three consecutive `cd hooks && npm test` runs against the same tree reported three different
totals: 1002, 1005, 1002. All green each time. Diffing the per-file counts pins the whole
variance to one file: `hooks/lib/__tests__/fusion-plane.test.ts` collected **96** tests in one
run and **93** in another. Every other file was stable, `fusion-count-sources.test.ts` among
them at 18.

Measured by the T3 executor while establishing a baseline, and independently visible in this
session's own numbers: the orchestrator measured 1001 at `18b6094`, the T1 executor measured
1002 on the same commit with only its own files restored, and the post-fix run reported 1005
against an expected 1001 + 3 + 1.

## Why it is worth a record rather than a shrug

A test count that moves on its own defeats the cheapest check there is. This session's own
commit gate is the worked example: the orchestrator's rule is "the baseline is 38 files / 1001
tests, anything red is yours", and a task's executor is asked to report the exact command and
exit code. Exit code still works. The *count* does not, so a genuinely dropped test — a
`describe` that stops registering, a conditional `it` that silently skips — cannot be
distinguished from this variance by anyone reading two numbers.

Three tests appearing and disappearing is also the shape of a test whose registration depends on
something environmental: a fixture file's presence, a `git` invocation at collection time, a
platform probe, or a `describe.skipIf`. That would mean three assertions are not running on some
runs, which is a coverage question and not only a bookkeeping one.

## What has not been established

Which three tests. Nobody has diffed the collected test *names* between a 96-run and a 93-run —
only the counts were compared. That is the first thing to do, and it is cheap: `vitest run
hooks/lib/__tests__/fusion-plane.test.ts --reporter=json` twice, then diff the name lists. Do
not start from the source.

Also unestablished: whether the variance predates the two commits that touched this file today
(`4bf509e`, and `f320db2` before it) or arrived with them. `git stash` the tree and run the file
twice at `8960e1a` to find out.

## Suggested fix direction

Find the conditional registration and make it unconditional, or make its condition explicit and
asserted, so the file collects the same set every run. If some tests genuinely cannot run in
some environments, they should be `skip`ped visibly rather than never registered — a skipped test
is reported and counted, which is the property this defect removes.
