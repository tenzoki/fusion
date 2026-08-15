# The browser-launch case in the monitor suite fails under parallel load and passes in isolation

---
**Severity:** Medium — this session commits on the suite's exit code, and the second file with a load-sensitive wall-clock case makes that gate unreliable under the parallel-executor pattern the project uses
**Domain:** code
**Filed by:** coderev, reviewing Turn 2 range `270c566..1d5eed6`
**Affects:** `hooks/lib/__tests__/monitor-warnings-panel.test.ts:695` — the case *"a terminal on stdout still gets the dashboard opened for it"*
**Cross-references:** `shared/issues/260810-1135_o_a-timing-case-in-fusion-commit-lock-test-fails-under-load-and-passes-in-isolation.md` (the same class, a different file — that record's four observations are all under parallel load too); `shared/history/260811-1329-coder-four-low-priority-corrections.md:17-22` (the honest report that asked for this record if it recurred); commit `f2d9905`

---

## The observation, measured

Seventeen runs on one machine (10-core, macOS, vitest 2.1, default `forks` pool, no
`vitest.config`):

| Configuration | Runs | Result |
|---|---|---|
| Full suite, alone | 3 | 3 green, `48 files / 1248 tests` every time |
| `monitor-warnings-panel.test.ts` alone | 5 | 5 green, 12 tests |
| `monitor-warnings-panel.test.ts`, six concurrent copies | 6 | 6 green |
| **Full suite, three concurrent copies** | **3** | **3 failed, all three on the same two cases** |

Under the three-concurrent-suite configuration every run failed exactly:

```
FAIL lib/__tests__/monitor-warnings-panel.test.ts > bin/monitor — the browser launch
     > a terminal on stdout still gets the dashboard opened for it
AssertionError: expected false to be true
 ❯ lib/__tests__/monitor-warnings-panel.test.ts:695:48
   695|       expect(await waitForFile(marker, 10000)).toBe(true);
```

and the already-recorded `fusion-commit-lock.test.ts` case beside it. The monitor case ran
12331 ms against its own 30 s `it` timeout, so the vitest timeout is not what fired — the
`waitForFile(marker, 10000)` budget inside it expired. `bin/monitor` sleeps 0.5 s after forking
the server before it launches the browser; under three concurrent suites the python3 pty runner →
bash → fork → sleep → `open` chain does not finish inside ten seconds.

## What this is not

It is **not** the failure batch 4 reported. That one was `Error: Worker exited unexpectedly`,
47 of 48 files, 1239 of 1248 tests, no assertion failing. I did not reproduce a worker death in
any of the seventeen runs. Both signatures live in the same file and both are load-shaped, but
they are different events and this record covers only the one I measured.

It is also **not** caused by the pty probe `f2d9905` added. The probe is a memoised
`spawnSync("python3", ["-c", "import os; m, s = os.openpty(); …"])`, measured at 40–70 ms and run
at most once per worker process. It sits inside `startMonitor`, which returns before
`waitForFile`'s ten-second clock starts, so it cannot consume that budget. The added
`proc.on("error")` / `proc.on("exit")` listeners reduce one class of uncaught exception rather
than adding one.

## Why it is worth a record

`260810-1135` is scoped to `fusion-commit-lock.test.ts` and its fix direction — make the timing
injectable rather than widen the tolerance — is written for that file. This is a second file of
the same class, in a suite whose exit code is what every task in this session is asked to report
as the thing that decides whether its work lands. Two independently load-sensitive cases means a
three-executor batch has a false-failure rate high enough that a reader learns to re-run rather
than to look.

There is also a diagnostic gap `f2d9905` did not close. That commit made a *pty allocation*
failure say so. The failure that actually occurs says `expected false to be true` and names
neither load nor the ten-second budget, so it still reads as a `bin/monitor` defect — which is
the sentence the commit set out to remove.

## Fix direction

Establish first whether the ten seconds is a real requirement or an arbitrary budget. If it is
arbitrary, the fix is not simply a larger number: `waitForFile` should report *what it waited
for and how long* in the failure message, so a load failure is distinguishable from a launch
that never happened. If the launch latency is bounded by something the test can observe —
the server answering, the pty runner's own output — waiting on that rather than on a wall clock
removes the sensitivity instead of lengthening the fuse.

Consider recording both this and `260810-1135` against one decision about whether this suite is
meant to be run concurrently with itself at all. Three of the project's own working patterns
(parallel executors, a reviewer running `npm test` beside them) put it in that state routinely.

---

Resolved: `circles/260815-0007-remove-eight-mechanisms-and-cap-growth/history/260815-1133-coder-hooks-suite-concurrency-safety.md`
— the marker wait ends on an event, and one run no longer claims every core.

**What was done.** `waitForFile(marker, 10000)` is now `waitForFile(marker, proc)`: it ends
when the file appears or when the process that would create it exits, with no inner numeric
budget. `startMonitor`'s own fifteen-second poll for the server lost its deadline the same
way, so the case has one deadline instead of three stacked ones, and that one is the vitest
case timeout — a deadlock guard rather than an assumption about how fast this machine forks.
The record's reading was right: the launch was late, not absent, and a late launch is not
the defect these cases exist to catch.

That alone was not enough at the concurrency this record measured at. `hooks/vitest.config.mjs`
now caps one run at half the machine's cores, because the suite is subprocess-bound and three
runs at one worker per core oversubscribe macOS fork/exec threefold. Measured at the default:
9.5 s for one bash script to reach its first `mkdir` in a run that passed, past 30 s in the
two that did not. At half: 9 of 9 green. Cost to a single run: none measurable.

**Evidence, at this record's own configuration of three concurrent suites.** Before, on an
idle 16-core machine: 5 of 9 runs red, this case among them every time. After: 3 concurrent
× 4 rounds, **12 of 12 green on this case**, and 2 concurrent × 6 rounds, 12 of 12 exit 0.

**One thing this record's `## What this is not` section pointed at is still open.** The
`Error: Worker exited unexpectedly` signature is a different fault, it still occurs at
roughly 1 run in 12 with three concurrent suites, and it is held by
`shared/issues/260814-2118_o_the-hooks-suite-fails-differently-on-repeated-full-runs-and-does-so-on-clean-head.md`.
Two facts about it were established while closing this one: the worker that dies is always
`monitor-warnings-panel.test.ts`'s, and a real SIGTERM reaches it.

**Also found while measuring, and worth knowing here because this file is the source.** The
monitor cases were leaking their servers: 42 orphaned `bin/monitor` processes were found on
the machine, the oldest three days and twenty-one hours old, each a python HTTP server
polling every two seconds, one holding half a core. They accumulate whenever a run is killed
rather than finishing, and every later run of the suite pays for them — which is a large part
of what "under parallel load" has meant in practice for both timing records. The file now
reaps from `process.on("exit")` as well as `afterEach`. A signal-handler variant was tried
and removed: it turned an ordinary SIGTERM into a failed run.
