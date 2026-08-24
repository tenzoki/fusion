# Is the hooks suite meant to be run concurrently with itself, and if not, who serialises it?

---
**Domain:** code
**Status:** answered
**Filed by:** orchestrator
**Cross-references:** `shared/issues/260810-1135_*_a-timing-case-in-fusion-commit-lock-test-fails-under-load-and-passes-in-isolation.md` (queue task 37); `shared/issues/260811-1409_*_the-browser-launch-case-in-the-monitor-suite-fails-under-parallel-load-and-passes-in-isolation.md` (queue task 38); `shared/issues/260810-1820_o_an-executor-verified-a-gate-by-mutating-a-file-another-executor-held-in-the-live-tree.md` (queue task 40); `agents/coder.md` `### Report shape`

---

## Question

The executor report contract derives `Result: done` from the exit code of the project's full
verification command, and `agents/orchestrator.md` Step 3a dispatches executors in parallel
batches whose **file sets** are disjoint. Those two rules are individually sound and together
produce N concurrent `npm test` runs against one working tree. The suite is not concurrency-safe,
so the contract's own gate fails for reasons unrelated to the change under test.

Measured this Turn, four executors on disjoint files. One reported `blocked` after three full runs
with **three different failing pairs**, every one of which passed alone against the same tree:

1. `record-counts-measurement` — reads `agents/orchestrator.md`, which a second executor was
   editing mid-run.
2. `fusion-commit-lock` + `reference-resolution-lint` — the lint reported `hooks/dist` and eleven
   files under it **missing**, because a concurrent run deletes and rebuilds `dist/` and the lint
   read the tree mid-rebuild.
3. `fusion-commit-lock` + `monitor-warnings-panel` — the two already-recorded load-sensitive cases,
   filed as tasks 37 and 38.

Case 2 is the one that makes this a decision rather than two more defect records. Disjoint file
sets do not make the runs disjoint: `hooks/dist/` is shared build output that every run destroys
and re-creates, so no batching discipline over source files can separate them. Task 37's record
already anticipated the question in one line — "consider recording this and task 38 against one
decision about whether this suite is meant to be run concurrently with itself at all" — and this
is the third instance in one session, so it is time to answer it rather than repair each symptom.

## Options

1. **The orchestrator serialises verification.** Executors make their change and report what they
   would run; the orchestrator runs the suite once per batch on a quiet tree and owns the verdict.
   - Pros: one run instead of N, so the wall-clock cost of a batch falls rather than rises; the
     shared-`dist` race cannot occur; the exit code means what the contract says it means.
   - Cons: an executor no longer verifies its own work, which is a real weakening of
     `agents/coder.md` — the executor is the party that knows what it changed and what to look at
     when the suite goes red. A batch failure also has to be attributed to one of N changes by the
     orchestrator, which has less context than any of the executors.
2. **Make the suite safe to run concurrently.** Give each run its own build output (a per-run
   `dist` directory, or a build that does not delete before it writes), and fix the two
   wall-clock-bound cases so they wait on something observable rather than a fixed budget.
   - Pros: the contract is left alone and every executor keeps verifying its own work; the two
     load-sensitive records (tasks 37, 38) are closed by the same change rather than separately.
   - Cons: tasks 37 and 38 have both established that the timing budgets are the visible half of
     the problem and neither has been costed; a per-run `dist` touches the build for every consumer
     of it, including the committed `dist/` this repository ships.
3. **Narrow what an executor verifies.** The executor runs only the test files its change can
   reach, and the full suite runs once at the end of the batch.
   - Pros: cheap, no build change, keeps verification with the party that made the change.
   - Cons: "the test files a change can reach" is not decidable from the change — a prompt edit is
     read by lint tests nobody would predict, which is exactly how this session's prompt edits keep
     turning suites red. That makes this an approximation of an undecidable question
     (`rules/critical-stance.md` §4).
4. **Dispatch executors one at a time.** No concurrency, no race.
   - Pros: nothing to build; the contract and the executor prompts stay as written.
   - Cons: the batch is the reason a Turn closes fourteen entries instead of four. This trades the
     session's throughput for a property the other three options buy without it.

## Constraints

- Whatever is chosen must keep a red suite meaning "your change broke something". A gate whose
  failures are routinely dismissed as load teaches its reader to re-run rather than to look, and
  that is the damage tasks 37 and 38 both name.
- `hooks/dist/` is committed in this repository and the installed hooks run from it, so any change
  to where a run builds must leave the shipped output exactly where it is.
- The answer governs `agents/orchestrator.md` Step 3a (batching), Step 3b (validation) and
  `agents/coder.md` `### Report shape` together. Answering it for one of the three leaves the
  other two contradicting it.

## Recommendation

Option 2 for the build race and option 1 for the verdict, if they can be taken together: the
shared `dist` is a genuine defect in the build regardless of who runs the suite, while the
attribution problem in option 1 is the reason not to adopt it alone. Not proposed as a package
without the user's call, because option 1 is a real weakening of the executor contract and that is
the user's trade to make, not the orchestrator's.

---

## Evidence added 260811-2330 — reconciler, final reconciliation of session `260811-0752`

**Marker unchanged (`_o_`).** No answer is recorded here; this adds one measurement that narrows
the option space.

`cd hooks && npm test` was run twice at HEAD `31746d1`, with **one agent running and nothing else
in flight** — no parallel executors, no second session, no concurrent build.

- Run 1: `Test Files 51 passed (52)`, `Tests 1335 passed (1349)`, one unhandled error —
  `Error: Worker exited unexpectedly` from `tinypool`. One file's 14 tests never reported.
- Run 2, immediately after, same command: `Test Files 52 passed (52)`,
  `Tests 1349 passed (1349)`, exit 0.

**What this does and does not show.** It does **not** reproduce case 2 of the question above: no
second `npm test` was deleting `hooks/dist/` underneath this one, so the shared-build-output race
was not the cause here. What it shows is that at least one instability of this suite survives the
removal of cross-executor concurrency entirely — vitest runs its own test files in parallel
workers, so a single invocation is already a concurrent run against one tree.

**The consequence for the options.** Option 4, "dispatch executors one at a time", was already the
weakest on throughput grounds. This measurement removes its remaining claim: serialising executors
leaves the suite running concurrently with itself inside each invocation, so the failure observed
above would still occur, and a red suite would still sometimes mean "load" rather than "your change
broke something" — which the Constraints section names as the damage to avoid. `inference:` the
same reasoning weakens option 1 in the same direction, since serialising the *verdict* does not
serialise the workers inside the one run it keeps; option 1's case rests on the shared-`dist` race
and on attribution, not on this.

Option 2's first half — give each run its own build output, or build without deleting first — is
untouched by this and remains the only option that addresses the intra-run case as well.

`speculation:` the crashing worker was not identified. Vitest reported the pool exit rather than a
file, and run 2 named no slow or failing file, so which of the 52 died is not established from
these two runs. Whoever takes this up should reproduce with `--pool=forks --no-file-parallelism`
or `--reporter=verbose` before costing option 2, rather than assuming it is one of the two
already-recorded timing cases (`260810-1135`, `260811-1409`).

---

## Evidence added 260815-0850 — bugfixer, investigating `shared/issues/260814-2118_o_…`

**Marker unchanged (`_o_`).** No option is chosen here. This adds a deterministic reproduction of
**case 2** and one measurement that separates it from the load-sensitive cases it has been
travelling with.

Case 2 has only ever been observed as a side effect of a real batch. It reproduces on demand:

```
cd hooks
npx vitest run lib/__tests__/legacy-halt-clearing.test.ts &
sleep 0.6 && npm run build
```

`AssertionError: expected 1 to be +0` at `legacy-halt-clearing.test.ts:209`. The child is
`node hooks/dist/clear-halt.js` (`:90`), and with `dist/` mid-rebuild it is `MODULE_NOT_FOUND`
and exits 1. Moving `dist` aside by hand and running the same command gives exit **1** and
`Error: Cannot find module`, so no inference is carrying the conclusion.

**Case 2 and the timing cases are distinguishable from the outside, which they were not before.**
Twelve full runs at HEAD `c4761dc`:

- Eight on an idle machine, `cd hooks && npm test` — all exit 0. `legacy-halt-clearing.test.ts`
  green in all eight.
- Four with 32 spin loops saturating all 16 cores — all exit 1, and in all four the single
  failing test was `fusion-commit-lock.test.ts`'s noclobber case. `legacy-halt-clearing.test.ts`
  green in all four.

So CPU pressure alone never reaches `legacy-halt-clearing.test.ts`; only a concurrent build does.
Its 4-of-6 failure count is the signature: the two cases per `describe` that spawn `dist/` fail
and the one that goes through `tsx guard.ts` from source does not. A reader meeting a red suite
can now tell which of the two questions they are in without re-running anything —
`fusion-commit-lock` alone is a timing budget (tasks 37/38), `legacy-halt-clearing` at 4 of 6 is
this record's case 2.

**What it does to the options.** Nothing is added for or against option 1, 3 or 4. It sharpens
option 2 by splitting its two halves further apart than the Recommendation already had them: the
build half is now reproducible in one command and is not blocked on costing the timing budgets,
which are a separate fault with separate evidence. `inference:` that makes "a build that does not
delete before it writes" costable on its own, ahead of the rest of option 2, if the user wants
the cheapest thing that makes the instrument readable.

**What was deliberately not done.** The obvious local repair — snapshot `dist/` into a temp
directory in `legacy-halt-clearing.test.ts`'s `beforeAll`, as `clear-halt-concurrent-halt.test.ts`
already does at `:127` — was rejected rather than overlooked. It narrows that file's exposure from
~5 s to ~20 ms without closing it, converts its failure shape into the errored-file shape this
record's 260811-2330 evidence describes, and leaves the other readers of the live tree untouched
(`reference-resolution-lint.test.ts:323` resolves prose citations with `existsSync`, which is how
case 2 was first seen). It would have moved the suite toward green without moving it toward
trustworthy, which this record's Constraints section forbids.

---
Answered: shared/history/260814-2306-orchestrator-session.md:198 — Option 2: make the suite safe to run concurrently. Each run gets its own build output or the build stops deleting before it writes, and the two wall-clock-bound cases wait on something observable. The verification contract and the executor prompts are unchanged. Answered by the user after a bugfix dispatch reproduced the cause deterministically.

Implemented: 332267a — the build compiles into a private staging directory and replaces `hooks/dist/` file by file with `rename(2)`; the two cases that launch or copy a compiled artifact read their own run's build through `FUSION_TEST_DIST`; a run is capped at half the machine's cores. Measured 6 of 6 red before, 12 of 12 green after, at two parallel runs with an eight-second offset.
