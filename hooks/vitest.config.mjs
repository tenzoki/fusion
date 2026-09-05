import { availableParallelism } from "node:os";
import { defineConfig } from "vitest/config";

// ---------------------------------------------------------------------------
// One run does not get to claim the whole machine.
//
// ## Why a suite needs a setting for this at all
//
// This one is subprocess-bound rather than CPU-bound: nearly every case spawns
// a real bash script, a real `node`, or a real python server, because the
// things under test are scripts and hooks whose whole subject is a working
// directory. Vitest's default worker count is one per core, which is right for
// a suite that owns the machine and wrong for this project, whose working
// pattern is several executors verifying disjoint changes in one checkout at
// the same time (`agents/orchestrator.md` Step 3a dispatches them in parallel
// batches, and `agents/coder.md` has each of them run this suite).
//
// ## The measurement
//
// 16 cores, an otherwise idle machine, three `npm test` runs started five
// seconds apart in one checkout:
//
//   - At the default worker count, 5 of 9 runs failed. Both failures were the
//     same shape in every one of them: a 30-second case timeout in
//     `fusion-commit-lock.test.ts` and in `monitor-warnings-panel.test.ts`,
//     with nothing racing — both cases wait on states that do not expire. The
//     instrumented latency for one bash script to reach its first `mkdir` was
//     9.5 s in a run that PASSED and past 30 s in the two that did not. Three
//     runs at one worker per core is a threefold oversubscription on top of a
//     suite that already spawns a process per case, and macOS fork/exec is what
//     collapses under it.
//   - At half the cores, 9 of 9 runs were green.
//
// The cost to a single run is 20%: 31.2 s at the default, 37.5 s here. That is
// the whole price, and it buys the property the suite is supposed to have.
//
// ## What this is not
//
// It is not a widened timeout and not a retry. No budget moved, no assertion
// changed, nothing is skipped. What changed is how much of the machine one run
// takes while another needs it — which is a statement about concurrency, which
// is the question. Answering
// `shared/decisions/260811-2009_*_is-the-hooks-suite-meant-to-be-run-concurrently-with-itself-and-if-not-who-serialises-it.md`
// option 2, alongside the build change in `scripts/build.mjs` and the two
// observable waits in the files named above.
//
// ## Why `.mjs` and not `.ts`
//
// `tsconfig.json` `include` is `["*.ts", "lib/**/*.ts"]`, so a `vitest.config.ts`
// is compiled into `hooks/dist/` and shipped. Excluding it there would fix the
// shipping and break something else: the build's orphan prune keeps a `dist/`
// entry whose `.ts` source still exists, and it cannot tell a deliberately
// unbuilt source's stale output from a concurrent run's fresh one
// (`scripts/build.mjs`). Plain ESM keeps the two questions the same question.
//
// `speculation:` half is a round number, not an optimum. It was the first value
// tried and it was green; whether a third or three quarters is better on other
// hardware is unmeasured. What is measured is that one-per-core is wrong here.
// ---------------------------------------------------------------------------
const half = Math.max(2, Math.floor(availableParallelism() / 2));

// ---------------------------------------------------------------------------
// The case deadline is a deadlock guard, not a speed assumption.
//
// Vitest's default `testTimeout` is 5000 ms, and this project never set one, so
// every case that does not pass its own budget ran on that default: 12 of the 13
// cases in `fusion-commit-lock.test.ts`, 3 of the 21 in
// `monitor-warnings-panel.test.ts`, and the untimed subprocess cases in 18
// further files. Those files' own headers say what the deadline is for, in
// `fusion-commit-lock.test.ts:80-84`: "the only deadline left is the vitest case
// timeout, which is a deadlock guard rather than an assumption about how fast
// the lock is." At 5 seconds it was exactly such an assumption, and the
// measurement above records a bash-to-first-`mkdir` latency of 9.5 s in a run
// that PASSED.
//
// 30 s is `CASE_TIMEOUT` in `lib/__tests__/helpers/guard-harness.ts:970`, the
// value the cases that do carry their own budget already use, so this makes the
// default agree with the suite's own explicit answer instead of introducing a
// second number. Analysis:
// `260906-0026-what-shared-state-the-hook-suite-reaches.md`, finding 3, change 1.
//
// Every case reached by this waits on an observable event (a process exit, a
// first-fail message on stderr, a served response), so no assertion is widened
// and nothing is skipped: what moves is only how long a starved machine may take
// to reach the event it is already waiting for.
// ---------------------------------------------------------------------------
export default defineConfig({
  test: {
    pool: "forks",
    poolOptions: { forks: { maxForks: half, minForks: half } },
    testTimeout: 30_000,
  },
});
