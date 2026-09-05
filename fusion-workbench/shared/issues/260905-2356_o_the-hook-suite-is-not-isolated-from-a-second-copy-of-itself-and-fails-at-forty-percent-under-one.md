The hook suite is not isolated from a second copy of itself, and fails at 40 percent under one

---
Run alone, the suite is deterministic: 20 of 20 green. Run beside a second copy of itself on
the same machine and the same commit, 8 of 20 runs go red, across six test files. The failures
are not random and they are not fixed by any change in the code under test — they are the
suite reaching machine-global state that another run is holding at the same moment.

---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>

## What was measured

All figures at HEAD `1b305c97` unless a different commit is named, on one machine, with
`npm test` in `hooks/`.

| condition | runs | red | rate |
|---|---|---|---|
| alone, nothing else running | 20 | 0 | 0 |
| two suites started together, ten pairs | 20 | 8 | 40 % |
| at `e9bd3e53`, with agents writing the tree | 37 | 5 | 14 % |

The middle row is the controlled one and it is what makes this a finding rather than a
suspicion. The first and second rows differ in exactly one variable: whether a second copy of
the suite was running. Same commit, same machine, same command. A confounder was live before
that experiment — the quiet runs were taken at a later commit than the loaded ones, so a
repair could have explained the difference — and the experiment removes it.

An earlier batch of 8 consecutive red runs is **excluded** from every figure above. Those were
deterministic, caused by a citation this session committed and repaired at `4db7dddb`, and
counting them would have inflated the rate with something that was not a race at all.

## Which files

Observed red under concurrency, over the ten pairs: `guard-state-shape.test.ts` (three of the
four red rounds), `staging-drift.test.ts`, `declared-citation-paths.test.ts`,
`guard-bash-integration.test.ts`, `fusion-commit-lock.test.ts`,
`monitor-warnings-panel.test.ts`. Under agent load at the earlier commit, three
`review-coverage.test.ts` cases and `hook-fail-open.test.ts` were also seen, so the affected
set is wider than any single run shows.

Two of them name their resource in their own subject and are worth reading first, because they
suggest what the others are doing: `fusion-commit-lock.test.ts` exercises a mutex that is
deliberately machine-visible, and `monitor-warnings-panel.test.ts` binds a port. Both failed in
the same round.

**The inference this section carried has been read out of the code and refuted.** It guessed
that the remaining files reach a shared path, a shared directory name or the real workbench.
They do not: every one of the eight builds its root with `mkdtempSync`, and the one obvious
remaining reader of shared build output extracts a `git archive` into its own tree for exactly
that reason. What is shared is the machine, and what fails on it is three fixed wall-clock
budgets. The diagnosis, with the latency measurement behind it, is
`260906-0026-what-shared-state-the-hook-suite-reaches.md`; the title of this record is
therefore accurate about the condition and wrong about the mechanism, and the section below
states the mechanism.

## The mechanism, read out of the code

**Six of the eight files fail through one function.** `hooks/lib/git.ts` runs git under a
5-second budget and collapses a timeout into the same return value it uses for "this is not a
repository". Measured over 600 samples on a six-commit repository, `git log` takes 23 ms with
nothing else running and up to 7 580 ms with two suites running, with no spawn ever failing. So
under load the function reports, in a well-formed sentence, that git declined to answer.

**The other two fail on vitest's own default.** `testTimeout` is 5 000 ms and this project
never sets it. `fusion-commit-lock.test.ts` runs 12 of its 13 cases on that default and
`monitor-warnings-panel.test.ts` 3 of 21; eighteen further files carry the same exposure
without having been observed red yet.

**The production fault is the larger half of this record.** `hooks/lib/git.ts` is not test
scaffolding: both of its callers run inside the PostToolUse hook, in every consuming project.
A loaded machine there produces the same false claim, and no test is present to go red about
it. The suite failing is that fault reporting itself, which is the one piece of luck in this
record.

## Why this matters more than the two records it subsumes

`npm test` is the release gate for this project, and the sessions most likely to run it are
exactly the sessions with agents working — which is the condition that reddens it. A session
then spends a diagnosis distinguishing a real regression from this. It cost two in this session
alone: once as a false alarm, once as a wrong hypothesis that a concurrently writing agent was
to blame when the true cause was a committed defect.

The second cost is quieter and worse. A suite that goes red for reasons unrelated to the code
teaches its readers to re-run rather than to read, and this session has already filed two
separate records describing single instances of it, which is what absorption looks like while
it is happening.

## What this record replaces

`260904-2140_*_monitor-warnings-panel-test-fails-intermittently-on-the-dual-stack-bind.md` and
`260905-2134_*_review-coverage-test-fails-in-a-full-suite-run-and-passes-in-isolation.md` each
describe one instance of this. Both made a measured rate a precondition of their acceptance;
the rate is in the table above and the condition is named. Neither should be repaired on its
own: a per-case fix leaves the property in place and the next case arrives unannounced.

## Acceptance

Not a green run — this record cannot be closed by observing 20 more quiet passes, because 20
quiet passes are already in the table and explain nothing.

Either each affected test is made to reach only state it privately owns, so that a second copy
of the suite cannot disturb it, and the concurrent experiment above then reports 0 of 20; or
the project states that the suite is single-instance, says so where a session will read it
before running the gate, and gives a session the rule for telling this failure from a
regression. The first is the repair; the second is an honest bound if the first is judged too
expensive, and the choice between them is a decision this record does not make.

The experiment itself is the acceptance test either way: ten pairs of concurrent runs at one
commit, counting red runs out of twenty.

## One further manifestation, observed while filing this record

The commit that first carried this file failed. Git refused with its index-lock message and
the commit did not land; the identical command, retried immediately, succeeded as `aacf0554`.
Nothing had changed in between.

**Verified:** the failure happened, the retry succeeded, and no `index.lock` remained
afterwards.

**The inference first written here blamed the suite's git calls, and that is refuted.** All
four of the suite's git calls against this checkout are read commands, which take no index
lock. The family that takes one is `git status`, which the tracker hook runs on a
commit-bearing tool call — so the contender was a hook firing beside the commit, not a test.

It stays in the record because it widens it in a direction the title does not cover: the
contention reached the orchestrator's own commit, not only the suite. And the commit lock does
not help, by construction. It is anchored at the workbench and serialises fusion sessions
against one project, while git's index is contended by anything in this checkout that takes
it, this project's own hooks included.
