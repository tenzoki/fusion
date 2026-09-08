Two hook tests fail only in the parallel full run and pass in isolation

---
`review-coverage.test.ts` ("speaks once for a gap that persists and again for one that grows") and
`staging-drift.test.ts` ("names a modified queue, an untracked history entry and a workbench
commit-message file") failed inside `cd hooks && npm test` on 260908 and passed immediately when run
alone: `npx vitest run lib/__tests__/review-coverage.test.ts lib/__tests__/staging-drift.test.ts`
returned 40 of 40 green.

The bugfixer that met them reported a neighbouring case in the same file needing 42 seconds on its
own, which points at a deadline that holds when the case runs alone and does not when the full suite
runs it in parallel with everything else.

---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>

**Why it matters here rather than as background noise.** A sixteen-step plan is being executed in
this workbench and every step's verification is a suite run. A test that fails on load and passes
alone makes each of those runs ambiguous: the executor cannot tell its own regression from the
machine being busy, and the cheapest wrong response — re-running until green — is the one that hides
a real failure the next time.

**What is not yet established.** Which deadline is being exceeded, and whether the two cases share a
cause or merely a symptom. Nobody has read the two tests against each other; the observation is a
side finding from a dispatch sent to repair something else, and it is recorded here so the next full
run has something to compare against rather than rediscovering it.

`260906-0035_*_what-should-the-git-helpers-budget-be-and-is-a-timeout-retried.md` is open in the
shared store on an adjacent question, a budget for the git helpers and whether a timeout is retried.
Read the two together before proposing a fix for either; a deadline raised in one place and not the
other is how a suite acquires two conventions.

**Acceptance test.** Run `cd hooks && npm test` three times on an otherwise idle machine and three
times under load. The defect is closed when the two named cases return the same verdict in all six
runs, whatever that verdict is — a case that fails consistently is a different and easier problem
than one that fails sometimes.

---
**Observed again on 260908-0030, and it is wider than two cases and wider than two files.** The
coder executing Step 3 of `260907-1450_*_plan-bounded-executor-dispatches.md` ran the full suite
twice over the same tree, twenty minutes apart. The first run was 911 of 911 green in 35 seconds.
The second failed two cases in 88 seconds, and both passed immediately when the two files were run
alone (35 of 35 green). Three things this adds:

- A **third file** is in the shape: `hook-fail-open.test.ts`, "delivers the tracker's report with
  its throttle record unwritable (260809-2045)", which asserted on the tracker's stderr and got an
  empty string. Nothing in this record predicted it, so the set named above is a sample rather than
  the population.
- A **different case** of `staging-drift.test.ts` than the one named here: "treats the
  machine-written surfaces and this session's own history file as in flight", which read
  `verdict=unchecked` where it expected `clean`. So the unit that fails is not stable within a file
  either.
- The **whole-suite duration is the signal**: 35 seconds green against 88 seconds with two
  failures, on one machine, over one tree. Both failing assertions are on a subprocess's output —
  one on empty stderr, one on a git-dependent verdict falling back to `unchecked` — which is what a
  subprocess deadline expiring looks like from the assertion side, and is consistent with the
  deadline hypothesis above rather than new evidence for it.

**Filed by:** coder, Kai Stalmann <ks@qantr.com>
