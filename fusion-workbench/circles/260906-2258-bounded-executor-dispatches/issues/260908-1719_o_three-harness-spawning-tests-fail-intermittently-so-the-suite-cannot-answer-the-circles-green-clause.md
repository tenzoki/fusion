Three harness-spawning tests fail intermittently, so a green suite cannot be established in one run

---
`staging-drift.test.ts`, `fusion-commit-lock.test.ts` and `guard-state-shape.test.ts` fail
intermittently under `npm test`, never the same set twice, and each passes when run alone. All three
spawn real git project roots through the guard harness. Nothing in this Circle's edits is read by any
of them.

This matters beyond the noise: `260907-1450_*_plan-bounded-executor-dispatches.md`
`## Where this Circle stops` makes a green `npm test` a closure clause, and its release precondition
requires that answer on the exact commit a tag names. A suite that answers differently on repeated
runs of one tree cannot answer either question in one run.

---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>

**Evidence, five runs on 2026-09-08, two observers.**

- Orchestrator, 16:29, after step 5: 3 files failed, 5 tests failed, among them
  `staging-drift.test.ts:593`, whose assertion expected a Circle-record path in the tracker's
  additional context and received the empty string. Immediately re-run alone on the same tree:
  53 files, 924 tests, all passed.
- Coder executing step 8, four runs on its own tree: one fully green at 924 of 924; the other three
  each failed a different one to three of the same three files. Its own reading, which it labelled
  inference rather than measurement, was that the cause is pre-existing and unrelated to its edit.

**What is not yet established.** Nobody has run the suite repeatedly on a tree with none of this
Circle's changes, so "pre-existing" is inference on both sides. The shared property of the three
files is that they spawn real project directories and run git in them, which makes concurrency and
filesystem timing the first place to look, but no cause has been measured.

**Two candidate causes worth separating before anything is repaired.** Concurrent test processes:
in this session's own case a sweep helper and a second agent's vitest run overlapped the failing
run. And per-run state inside the harness itself: three suites writing project roots under one
temporary directory would interfere whether or not another process is present.

**Acceptance test.** Run `npm test` five times in a row on one unchanged tree, with no other process
touching the repository, and record the failing set each time. The defect is real if any run differs
from any other; it is closed when five consecutive runs agree. Until then, no reading of the closure
clause taken from a single run should be treated as settled.
