The git helper reports a timeout as "not a repository", in every consuming project

---
`hooks/lib/git.ts` runs git under a fixed 5-second budget and returns the same value for a
timeout as for "this is not a git repository". Both of its callers run inside the PostToolUse
hook, so on a loaded machine a consuming project is told, in a well-formed sentence, that git
declined to answer when git was merely slow.

---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>

**Evidence.** `260906-0026-what-shared-state-the-hook-suite-reaches.md` measured `git log`
on a six-commit repository over 600 samples: 23 ms with nothing else running, up to 7 580 ms
with two test suites running, and no spawn ever failing. The budget is 5 000 ms, so the loaded
tail crosses it. Six of the eight test files that go red under concurrency fail through this
one function, which is how the fault was found; the tests are incidental to it.

**Why the collapse is the defect and not the budget.** A caller that receives `null` cannot
tell a project without git from a machine under load, so no caller can retry, degrade, or say
which happened. Every consumer of this helper inherits that, and none of them reports a
timeout today because none of them can see one.

**Acceptance.** A timeout and a not-a-repository answer are distinguishable by the caller, and
a report produced under load either carries the real git output or says that git timed out.
The concurrent experiment in
`260905-2356_*_the-hook-suite-is-not-isolated-from-a-second-copy-of-itself-and-fails-at-forty-percent-under-one.md`
is the test: the six files failing through this function stop failing, for the right reason.

**Blocked on a ruling, deliberately.** What the budget should be, and whether a timeout is
retried, is `260906-0035_*_what-should-the-git-helpers-budget-be-and-is-a-timeout-retried.md`.
This record states the defect; that one chooses the shape.

**Cross-references:**
`260905-2356_*_the-hook-suite-is-not-isolated-from-a-second-copy-of-itself-and-fails-at-forty-percent-under-one.md`
(the condition under which it fires, and its measurement).

---
Reconciled 260906-0335 (reconciler, HEAD `b462d55d`): marker unchanged at `_o_`, and every claim in
the record is true of the tree as it stands. Nothing has been dispatched against it, deliberately —
it is blocked on `260906-0035_*_what-should-the-git-helpers-budget-be-and-is-a-timeout-retried.md`,
which is still `_o_` with its recommendation standing and no ruling recorded anywhere.

Read at HEAD rather than taken from the analysis: `GIT_TIMEOUT_MS = 5_000` in `hooks/lib/git.ts`, and
the docstring above the wrapper enumerates the four conditions it collapses into one `null` — not a
repository, an unresolved ref, a non-zero exit, and the timeout. The collapse is exactly as filed.

**"Both of its callers" was re-checked because a third importer appeared after this record was
filed, and it still holds.** Three modules import `git()` at HEAD: `lib/review-coverage.ts`,
`lib/staging-drift.ts` and `lib/citation-scan.ts`. The third arrived on the PostToolUse path at
`b462d55d`, through `lib/citation-form.ts`. It does **not** reach `git()`: the scanner's only git
calls are inside `declaredCitationFiles()`, whose sole callers are `citation-check.ts` and
`citation-sweep.ts`, neither of which any hook runs. So the record's reach statement is accurate at
HEAD — but it is accurate by one function's worth of margin, and a future change that gave the
write-time check a declared-paths corpus would widen this defect without touching `lib/git.ts`.
