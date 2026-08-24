The hooks suite fails differently on repeated full runs, and does so on clean HEAD

---
Three consecutive full runs of `cd hooks && npm test` produced three different failure sets, all of them in the lock and halt-reaping harnesses, and all of them passing when the same files are run in isolation. The behaviour was measured on clean HEAD, so it is not caused by any working-tree change. It makes "the suite is green" an unreliable statement, which matters because the release process's step 0 and every task's acceptance criterion rest on it.

---
**Found by:** `coder`, during task T12 of Turn 6, session `260813-2345` (resumed 260814-2009), Circle `260801-1244-curator`. Reported in `circles/260801-1244-curator/history/260814-2110-coder-turn-6-ten-citations-and-five-under-named-rows.md`.
**Owner:** `coder`.
**Severity:** Medium — no shipped behaviour is wrong, but the instrument that decides whether shipped behaviour is wrong is unreliable.
**Affects:** `hooks/lib/__tests__/legacy-halt-clearing.test.ts`, `hooks/lib/__tests__/clear-halt-concurrent-halt.test.ts`, `hooks/lib/__tests__/fusion-commit-lock.test.ts`.

## What was measured

The measurement is the coder's, not this record's author's, and it is reported here as it was reported:

1. Three full-suite runs against a working tree carrying the T12 changes failed differently each time — first `legacy-halt-clearing.test.ts` (4 tests), then `clear-halt-concurrent-halt.test.ts` together with `fusion-commit-lock.test.ts`, then `fusion-commit-lock.test.ts` alone.
2. Each named file passes in isolation, 24 of 24.
3. The T12 files were backed up and reverted, and the suite was run on clean HEAD: **exit 1**, with more failures than the change had ever produced.
4. The files were restored and the suite re-run: exit 0.

Step 3 is what makes this a suite defect rather than a defect in the change under test. The distinction was established by measurement rather than assumed, which is why it is worth recording.

## The shape of the failing assertions

Both named assertions are timing windows rather than logic:

- `"the creator never created a holder-less lock directory"` — the window in `bin/fusion-commit-lock` between the atomic `mkdir` and the noclobber holder write. `rules/workbench-stash-and-lock.md` `## Commit lock` documents that window as real and gives it a 60-second stale path; a test that asserts it is never observed is asserting the absence of a state the design admits.
- a `clear-halt` exit of 1 where 0 was expected.

Both harnesses spawn real processes against real directories, so under full-suite parallel load they contend for wall-clock in a way they do not when run alone.

## Why this is not already covered

`shared/decisions/260811-2009_*_is-the-hooks-suite-meant-to-be-run-concurrently-with-itself-and-if-not-who-serialises-it.md` asks the neighbouring question and is still open. That record asks whether the suite is *meant* to run concurrently with itself and who would serialise it if not. This record adds the measurement that answers half of it empirically: run concurrently with itself, it currently produces false failures on unmodified source. The decision record is the place the fix is chosen; cite this one from it.

## What a fix would have to establish

Not "make the failures stop." The two candidate directions differ in what they claim:

1. **Serialise the harnesses that own a real filesystem resource** (the commit lock's directory, the guard's escalation state), so contention cannot occur. Cheap, and it leaves the assertions saying what they say.
2. **Weaken the assertions to what the design actually guarantees.** The holder-less window is documented as reachable; an assertion that it is never reached is stronger than the mechanism promises, and under load it is simply false.

Direction 2 is the one that changes what the suite means, so it belongs to the open decision above rather than to a repair pass.

## Two further independent measurements, same session

The `coder` on task T11 met it separately, on a different working tree, without sight of the T12 run: `fusion-commit-lock.test.ts` failed in three of six full runs and passed in isolation. That agent identified the mechanism — the harness polls for 10 seconds against a 4-second stall, so a loaded machine misses the window — and declined to file, on the ground that it could not characterise the load condition. The mechanism it names is the concrete form of the timing-window shape described above.

The orchestrator then met a third variant while verifying Turn 6 before the commit: the first full run reported `Test Files 48 passed (49)` with `Errors 1 error` and `Tests 1021 passed (1030)`, so one file did not run at all rather than failing an assertion. The immediately following run on the same unchanged tree reported 49 of 49 and 1030 of 1030, green.

Three agents, three trees, three different failure shapes, and one of them a file that never executed. The last is worth separating from the other two: an assertion that fails under load is a timing assumption, while a file that errors out of the run is the runner itself losing a worker, and a fix aimed only at the first would leave the second.

---

## Measurement added 260815-0850 — bugfixer

**Marker unchanged (`_o_`).** Nothing is fixed here. This separates the three shapes the record
already holds side by side, because they do not share a cause and a repair aimed at one leaves
the others.

### `legacy-halt-clearing.test.ts` — shared build output, not timing

Established, with a deterministic reproduction:

```
npx vitest run lib/__tests__/legacy-halt-clearing.test.ts &
sleep 0.6 && npm run build
```

produces `AssertionError: expected 1 to be +0` at `legacy-halt-clearing.test.ts:209` — the exact
assertion this record names as "a `clear-halt` exit of 1 where 0 was expected".

`hooks/package.json:9` is `"build": "rm -rf dist && tsc"` and `:10` runs it ahead of every
`vitest run`, so a second `npm test` in the same checkout leaves `hooks/dist/` absent for one to
two seconds. `legacy-halt-clearing.test.ts:90` spawns the live `dist/clear-halt.js` with plain
`node` at four points across the file's ~5 s runtime; with `dist/` gone the child is
`MODULE_NOT_FOUND` and exits 1. Measured on its own: `dist` moved aside, `node
hooks/dist/clear-halt.js` exits **1** printing `Error: Cannot find module`.

**The 4-of-6 count is the fingerprint.** The first case of each `describe` reaches only
`runWrite`, which the harness spawns from SOURCE as `tsx guard.ts`
(`helpers/guard-harness.ts:164-200`). Exactly the four `dist`-dependent cases fail; the two that
do not touch `dist` pass. A timing cause would not partition that way.

**It is not load.** Twelve full runs at HEAD `c4761dc`: eight idle, all exit 0; four with 32 spin
loops saturating all 16 cores, all exit 1 — and in all four the failing file was
`fusion-commit-lock.test.ts`, never this one. CPU pressure alone does not reach it.

This is case 2 of decision `260811-2009` verbatim, so **direction 1 and direction 2 of this
record's `## What a fix would have to establish` both miss it**: serialising the harnesses that
own a filesystem resource does not help, because the resource is `hooks/dist/` and every run
destroys it; and there is no assertion here to weaken, because the assertions are right and the
artifact under them is gone.

### The other two shapes are unchanged and are other causes

- `fusion-commit-lock.test.ts` — reproduced 4 of 4 under CPU saturation. Genuine wall-clock
  assumption, already `shared/issues/260810-1135_*_…`. This is the one direction 2 is about.
- A file that never runs (`Errors 1 error`, `48 passed (49)`) — the reconciler already measured
  this with nothing else in flight (`260811-2009`, evidence of 260811-2330: `Error: Worker
  exited unexpectedly` from tinypool). Not the build race and not a timing budget.

### Why no repair was applied

Snapshotting `dist/` into a temp directory in `beforeAll`, the way
`clear-halt-concurrent-halt.test.ts:127` already does, shrinks this file's exposure from ~5 s to
~20 ms without removing it — a wipe landing during the copy converts four red tests into one
errored file, which is the third shape above. It also leaves the other readers of the live tree
exposed: `reference-resolution-lint.test.ts:323` resolves prose citations with
`existsSync(join(pluginRoot, token))`, so any citation of `hooks/dist/…` reports missing during a
wipe, which is what decision `260811-2009` measured. A change that makes the suite look greener
without making it more trustworthy is the damage that decision's Constraints section names.

The two repairs that would actually close it — a build that does not delete before it writes,
or serialising runs in the checkout — are options 2 and 1 of `260811-2009`, which is open.

---

## Measurement added 260815-1133 — coder, step P-3b of Circle `260815-0007-remove-eight-mechanisms-and-cap-growth`

**Marker unchanged (`_o_`).** Two of the three shapes this record holds are closed. The third
is not, and it is why this record stays open. Full account:
`circles/260815-0007-remove-eight-mechanisms-and-cap-growth/history/260815-1133-coder-hooks-suite-concurrency-safety.md`.

### Closed: the shared build output

`hooks/package.json` no longer builds with `rm -rf dist && tsc`. The compile goes to a private
staging directory and the shipped tree is refreshed file by file with `rename(2)`, so a path
under `dist/` is never absent and never half-written; the two cases that spawn or copy a
compiled artifact read the run's own private build instead of the shared one. The bugfix
dispatch's deterministic reproduction (`vitest run legacy-halt-clearing` with a build started
0.6 s later) is green 3 of 3, and so is the harsher form where the *destructive*
`npm run build:clean` runs against a live `npm test`.

### Closed: the timing budgets

`260810-1135` and `260811-1409` are both closed with their own evidence sections. Two changes
between them: each wait now ends on an observable event rather than a budget, and
`hooks/vitest.config.mjs` caps one run at half the machine's cores, because at one worker per
core three concurrent suites made a bash script take 9.5 s to reach its first `mkdir`.

### Not closed: a file that never runs

`Error: Worker exited unexpectedly` from tinypool still occurs. Rate on an idle 16-core
machine, measured after the changes above: **0 of 12** runs with two concurrent suites,
**1 of 12** with three. Two facts are now established that were not:

- **It is always `monitor-warnings-panel.test.ts`'s worker.** Identified by differencing the
  reported test names against a green run: the missing 15 are that file's, in every
  occurrence. The reconciler's note of 260811-2330 recorded that "which of the 52 died is not
  established"; it is now established, and it is the file that spawns fifteen detached
  process groups.
- **A real SIGTERM reaches the worker.** Found by accident: a `SIGTERM` handler installed
  during this work (and since removed, because it turned an ordinary signal into a failed run)
  fired, which no handler would have done unless the signal arrived.

What sends it is not established, and three candidates were considered and none confirmed. A
diagnostic over every process-group kill the monitor file performs found that **every one of
them targeted a live child of that same worker** — so the obvious explanation, one run
signalling another run's group through a reused pid, is not supported by the evidence.

### A fourth cause, in no record until now, and it changes how "under load" should be read

Measured mid-session: **42 orphaned `bin/monitor` processes on this machine, the oldest three
days and twenty-one hours old**, one of them holding half a core. Each is a python HTTP server
polling a deleted workbench every two seconds. They accumulate whenever a run is killed rather
than finishing, and they never exit. Every later run of the suite paid for them.

That is a standing, invisible load which has been present for as long as this record's
observations, and it belongs in any reading of "it fails under load" — the load was partly the
suite's own residue rather than the other work on the machine. The monitor file now reaps from
`process.on("exit")` as well as `afterEach`; a run killed with a signal still leaks.

**And a caution for whoever measures next.** A deliberate load test in this session left 32
spin loops running after the `kill` that was supposed to end them. Every timing number taken
in the following half hour was wrong by a factor of three to four, in a direction that made a
correct change look like a fourfold regression. Check `uptime` and the process table before
believing a timing measurement on this suite.

Also seen: 260816-0713 by coderev — one full-suite run at `f77633f` failed `monitor-warnings-panel.test.ts` "a terminal on stdout still gets the dashboard opened for it" (`http://localhost:PORT` where the pin expects `http://127.0.0.1:PORT`); two later full runs and an isolated run of that file were green, and the same file was green in a full run at `3a0408a`. So the flake now reaches a file this range touched (`94683c9`).

---
**Reconciliation 260817-1836** (reconciler, domain `code`, HEAD `2552586`; log `shared/history/260817-1836-reconciliation.md`). Two of three failure shapes are closed and the third is not. The shared-`dist/` build race is fixed: `hooks/scripts/build.mjs` and `run-tests.mjs` now build into a private staging directory and swap it in with a rename rather than removing and rebuilding in place. The commit-lock timing-budget failures are recorded closed on their own evidence. The third shape, the monitor-warnings worker dying under concurrent full-suite load, is still open on the record-s own latest entry (260816-0713, reproduced at `f77633f`) and was not reproduced in sequential runs, which is consistent with its documented low rate rather than evidence against it. Marker stays open on the third shape alone.

---
Also seen: 260824 by coder (C3 step 2) — `lib/__tests__/guard-state-shape.test.ts` "still reports the gap, and repairs the file instead of failing again" failed on the first full run and passed alone and on three subsequent full runs. The test spawns its own temporary project and read nothing that step wrote, which is one more instance of the load-sensitivity this record describes rather than a new fault.
