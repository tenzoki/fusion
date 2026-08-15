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

`shared/decisions/260811-2009_o_is-the-hooks-suite-meant-to-be-run-concurrently-with-itself-and-if-not-who-serialises-it.md` asks the neighbouring question and is still open. That record asks whether the suite is *meant* to run concurrently with itself and who would serialise it if not. This record adds the measurement that answers half of it empirically: run concurrently with itself, it currently produces false failures on unmodified source. The decision record is the place the fix is chosen; cite this one from it.

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
  assumption, already `shared/issues/260810-1135_o_…`. This is the one direction 2 is about.
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
