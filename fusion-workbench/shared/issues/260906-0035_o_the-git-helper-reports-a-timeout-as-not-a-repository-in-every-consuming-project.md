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
