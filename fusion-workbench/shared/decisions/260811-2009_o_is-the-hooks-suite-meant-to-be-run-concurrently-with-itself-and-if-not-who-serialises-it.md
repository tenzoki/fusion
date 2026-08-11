# Is the hooks suite meant to be run concurrently with itself, and if not, who serialises it?

---
**Domain:** code
**Status:** open
**Filed by:** orchestrator
**Cross-references:** `shared/issues/260810-1135_o_a-timing-case-in-fusion-commit-lock-test-fails-under-load-and-passes-in-isolation.md` (queue task 37); `shared/issues/260811-1409_o_the-browser-launch-case-in-the-monitor-suite-fails-under-parallel-load-and-passes-in-isolation.md` (queue task 38); `shared/issues/260810-1820_o_an-executor-verified-a-gate-by-mutating-a-file-another-executor-held-in-the-live-tree.md` (queue task 40); `agents/coder.md` `### Report shape`

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
