# P-3b: the hooks suite made safe to run concurrently with itself

**Date:** 2026-08-15 11:33
**Agent:** coder
**Status:** Complete
**Trigger:** Inserted prerequisite step P-3b of Circle `260815-0007-remove-eight-mechanisms-and-cap-growth`.
**Binding record:** `shared/decisions/260811-2009_a_is-the-hooks-suite-meant-to-be-run-concurrently-with-itself-and-if-not-who-serialises-it.md` — option 2, chosen by the user.
**Standing on:** `circles/260815-0007-remove-eight-mechanisms-and-cap-growth/history/260815-0850-bugfix-legacy-halt-clearing-flake.md` (the deterministic diagnosis of case 2).

---

## What was wrong, restated as the three independent faults it turned out to be

The decision record and issue `260814-2118` between them already separated three
failure shapes. Working through them established that they are three separate causes and
that a fourth one, nobody's record, was sitting underneath two of them:

1. **The shared build output.** `hooks/package.json` built with `rm -rf dist && tsc` before
   every `vitest run`, so a second run in the same checkout left `hooks/dist/` absent for
   one to two seconds. Three suites read that tree.
2. **Two wall-clock-bound cases.** `fusion-commit-lock.test.ts`'s noclobber case had to
   *catch* the creator inside an injected four-second window by polling;
   `monitor-warnings-panel.test.ts`'s browser-launch case gave the marker file a
   ten-second budget. Both assume a machine that starts a process promptly.
3. **A worker that dies with no assertion failing.** `Error: Worker exited unexpectedly`
   from tinypool, one test file's results never returned. Pre-existing, separately
   recorded, and **not fixed here** — see the residual at the end.
4. **The suite poisoned its own machine, and this was not in any record.** Measured
   mid-session on this laptop: **42 orphaned `bin/monitor` processes, the oldest three
   days and twenty-one hours old**, one of them holding half a core. Each is a python HTTP
   server polling a deleted workbench every two seconds, left behind whenever a run was
   killed rather than finishing. Every later run of the suite paid for them. This is very
   plausibly a large part of why both timing records only ever reproduced "under load".

## What was changed

### 1. The build stopped deleting (`hooks/scripts/build.mjs`, new)

`npm run build` compiles into a private staging directory under `.build-staging/` and moves
the result into `dist/` **file by file with `rename(2)`**, which POSIX guarantees is atomic.
A file whose content is already identical is skipped, so an unchanged rebuild writes
nothing and leaves no git noise. Three properties follow, and they are the point:

- a path under `dist/` is never absent, so `reference-resolution-lint.test.ts`'s
  `existsSync` over prose citations of `hooks/dist/…` cannot read them as dangling;
- a file under `dist/` is never partial, so `node dist/clear-halt.js` gets a complete
  module or the previous complete module, never the half-written state an in-place `tsc`
  write passes through;
- nothing is deleted except an output whose `.ts` source is gone.

The prune is deliberately conservative — an entry goes only when it is absent from *this*
build **and** its source is absent from the tree — so a concurrent run that has just added
a source does not have its fresh output deleted by a build that compiled before that source
existed. Verified: `diff -r` against `rm -rf dist && tsc` is empty, and the orphan case was
exercised by adding and removing a probe source.

`npm run build:clean` keeps the old destructive form for the rare case where the wipe
itself is wanted. Nothing routine invokes it.

**One consequence a future editor has to know:** the prune's rule is only sound while "a
`.ts` exists under `hooks/`" and "the build emits it" are the same statement. A TypeScript
file the build deliberately skips is exactly the pair the prune cannot decide — its stale
output and a concurrent run's fresh output look identical. That is why the vitest
configuration below is `vitest.config.mjs` and not `.ts`: `tsconfig.json` `include` matches
`*.ts` at the hooks root, and an `exclude` line would have created that undecidable pair.
It was caught by noticing `dist/vitest.config.js` appear in `git status`.

### 2. The two content readers got a private build (`FUSION_TEST_DIST`)

`npm test` is now `node scripts/run-tests.mjs`: it keeps the staging directory alive for the
run and names it in `FUSION_TEST_DIST`. `helpers/guard-harness.ts` exports `TEST_DIST` from
it, falling back to `hooks/dist` for a bare `npx vitest run`.
`legacy-halt-clearing.test.ts` spawns from there and
`clear-halt-concurrent-halt.test.ts` copies from there.

The atomic sync above already covers an existence check and a spawn. What it does not cover
is a **whole-directory `cpSync`**, which the prune can still catch mid-walk; a private tree
has no second writer at all. So the two halves are not redundant: the sync protects the
shared tree's readers, the private build protects the one reader that walks a tree.

### 3. The two wall-clock waits became waits on events

`fusion-commit-lock.test.ts` — the injected `sleep 4` between `mkdir` and the holder write
is now a **gate**: the patched script announces itself by creating one file and parks
indefinitely until the test creates another. The holder-less state therefore persists until
the case ends it, so a starved machine takes longer to observe it rather than missing it.
Every wait in the case now ends on an event (a file appearing, a line reaching stderr, a
process exiting); the two `spawnSync` timeouts that stood in for "it is still blocking" were
replaced by the script's own first-fail message, and the two 10-second reap budgets by an
awaited exit. Case runtime fell from ~9 s to ~0.5 s as a side effect.

**Checked for vacuity rather than assumed:** with `set -C` stripped from the patched copy,
the case still fails with "creator never reported losing the acquisition". It detects the
defect it was written for.

`monitor-warnings-panel.test.ts` — `waitForFile` and `startMonitor`'s server poll now end
on the file appearing or the process that would create it exiting, with no inner numeric
budget. The vitest case timeout is the single remaining deadline and is a deadlock guard,
not an assumption about fork speed.

### 4. One run stopped claiming the whole machine (`hooks/vitest.config.mjs`, new)

This is the change that was **not** anticipated by the decision record, and it is the one
that makes three concurrent runs work. The suite is subprocess-bound: nearly every case
spawns a real bash script, `node`, or python server. At vitest's default of one worker per
core, three concurrent runs are a threefold oversubscription on top of that, and macOS
fork/exec collapses.

Measured on 16 cores, an otherwise idle machine, three runs started five seconds apart:

| Workers per run | Result |
|---|---|
| default (one per core) | 5 of 9 runs red — a 30 s case timeout in both files, nothing racing |
| half the cores | 9 of 9 green |

Instrumented latency at the default: **9.5 s for one bash script to reach its first
`mkdir`, in a run that PASSED**, and past 30 s in the two that did not. Cost to a single
run: none measurable (29.1 s here against 31.2 s at the default; the two differ by less
than the run-to-run spread).

This is not a widened timeout and not a retry. No budget moved, no assertion changed,
nothing is skipped. What changed is how much of the machine one run takes while another
needs it.

### 5. The process leak

`monitor-warnings-panel.test.ts` now reaps its monitors from `process.on("exit")` as well as
`afterEach`, and signals a process group only while its own child is still alive — a reaped
pid may have been handed to something else, and this machine cycles pids often enough for
that to be real rather than theoretical.

**A signal handler was tried here and removed, and the removal is the finding.** A
`SIGTERM` handler that reaped and then called `process.exit(128)` turned an ordinary signal
into a failed run: vitest instruments `process.exit` and reports it as an uncaught
exception, and the reap on the way out killed the monitor the case was still waiting for.
It also produced the one piece of hard evidence about fault 3 — that a **real SIGTERM
reaches the vitest worker**, which nothing in the existing records had established. A
signalled worker was going to die anyway; making its death louder helped nobody. A run
killed with a signal therefore still leaks, and so does SIGKILL.

## The measurement

Reproduction first, on the tree as it stood, HEAD `c45e27b`:

- Two `npm test` runs in the same checkout, started 8 s apart, 3 rounds — **6 of 6 red**,
  every one on the commit-lock noclobber case ("the creator never created a holder-less
  lock directory"), one of them on the monitor browser-launch case as well.
- The decision record's own deterministic command for case 2 — red, `expected 1 to be +0`
  at `legacy-halt-clearing.test.ts:209`.

After, all on an idle machine with the leaked processes cleared:

| What | Runs | Result |
|---|---|---|
| `cd hooks && npm test`, alone | 2 | exit 0, 48 files / 903 tests, 29 s |
| 2 concurrent, started 8 s apart, 6 rounds | 12 | **12 of 12 exit 0** |
| 3 concurrent, started 5 s apart, 4 rounds | 12 | 11 of 12 exit 0; the one red is fault 3 |
| 3 concurrent, 3 rounds (earlier build of the same change) | 9 | 9 of 9 exit 0 |
| `vitest run legacy-halt-clearing` + `npm run build` at 0.6 s | 3 | 3 of 3 green (was red) |
| `npm test -- legacy-halt-clearing` + a concurrent `npm run build:clean` | 1 | green — even the destructive build no longer reaches it |
| `fusion-commit-lock.test.ts` under 32 spin loops on 16 cores | 1 | green (this condition was 4 of 4 red before) |
| `diff -r` of `dist/` against `rm -rf dist && tsc` | — | empty; `git status` on `hooks/dist/` clean |

**A measurement that had to be thrown away, recorded so nobody repeats it.** Between the
first and second batteries, 32 spin loops from a deliberate load test survived a `kill` that
was supposed to end them, and ran for half an hour alongside the leaked monitors. Every
number taken in that window is wrong — a single run appeared to cost 115 s under the worker
cap and 125 s without, which is how the cap first looked like a fourfold regression. On a
clean machine the same two configurations are 29 s and 31 s. The lesson is small and
expensive: check `uptime` and the process table before believing a timing measurement on
this suite.

## Residual, stated plainly

**Fault 3 is not fixed.** `Error: Worker exited unexpectedly` still occurs, at roughly
1 run in 12 with three concurrent suites and 0 in 12 with two. It is always
`monitor-warnings-panel.test.ts` whose worker dies — which the existing records could not
say; the reconciler's note of 260811-2330 recorded that "which of the 52 died is not
established". Two things are now established: the file, and that a real SIGTERM reaches the
worker. What sends it is not established. It is out of this step's scope, it predates this
change, and it is held by
`shared/issues/260814-2118_o_the-hooks-suite-fails-differently-on-repeated-full-runs-and-does-so-on-clean-head.md`,
whose marker stays open for exactly that reason.

Two smaller residuals, neither a false failure:

- The browser-launch **negative** cases still wait a fixed 2.5 s to conclude that no tab was
  opened. Under load that can pass vacuously — it cannot fail spuriously — and closing it
  would need an observable that says "the launch decision has been made", which
  `bin/monitor` does not offer.
- A run killed with a signal, and any run killed with SIGKILL, still leaks its monitors. See
  §5 for why the handler that would have covered the first was removed.

## Files written

- `hooks/scripts/build.mjs` (new), `hooks/scripts/run-tests.mjs` (new)
- `hooks/vitest.config.mjs` (new)
- `hooks/package.json`, `hooks/tsconfig.json`, `.gitignore`
- `hooks/lib/__tests__/helpers/guard-harness.ts`
- `hooks/lib/__tests__/fusion-commit-lock.test.ts`
- `hooks/lib/__tests__/monitor-warnings-panel.test.ts`
- `hooks/lib/__tests__/legacy-halt-clearing.test.ts`
- `hooks/lib/__tests__/clear-halt-concurrent-halt.test.ts`
- `hooks/lib/__tests__/rules-emission-golden.test.ts` (a comment its premise made false)
- `README-hooks.md`

## Records

- `shared/issues/260810-1135` — closed, with the evidence above.
- `shared/issues/260811-1409` — closed, with the evidence above.
- `shared/issues/260814-2118` — **not** closed. Two of its three shapes are gone; the third
  is fault 3. A measurement section was appended and the marker left open.
- `shared/decisions/260811-2009` — left at `_a_`. The `_a_` → `_i_` transition wants the
  commit hash that carries this work, and this agent does not commit.
