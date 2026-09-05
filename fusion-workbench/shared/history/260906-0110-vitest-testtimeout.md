# Set the suite's case deadline to 30 s, and measured what share of the concurrent failures it was

**Status:** Complete
**Filed by:** coder, Kai Stalmann <ks@qantr.com>
**Checkout:** 5e8248d7
**Domain:** code
**HEAD:** `aacf0554`
**Analysis:** `260906-0026-what-shared-state-the-hook-suite-reaches.md`
**Record:** `260905-2356_*_the-hook-suite-is-not-isolated-from-a-second-copy-of-itself-and-fails-at-forty-percent-under-one.md`

## What was asked

Change 1 of the analysis, dispatched alone so its effect could be separated from
the other two budgets: set `testTimeout` in `hooks/vitest.config.mjs` to 30 000 ms,
change nothing else, then measure by running the suite alone once and running the
concurrent experiment the record specifies.

## What was done

One line added to `hooks/vitest.config.mjs`, `testTimeout: 30_000`, with a comment
block above the export saying what the deadline is for and why the value is the
suite's own `CASE_TIMEOUT` rather than a second number. Nothing else was edited:
not `lib/git.ts`, not `lib/staging-drift.ts`, not the monitor's port handling, and
no test file.

Counted, with a script over `lib/__tests__/*.test.ts`, which cases already carry
their own budget: 121 of 702 case declarations, 581 on the config default. The two
files the analysis names were read directly rather than counted:
`fusion-commit-lock.test.ts` carries one explicit `30_000` (`:338`) across 13 cases,
`monitor-warnings-panel.test.ts` carries 18 across 21.

## What was measured

Machine: 16 cores, load average 9.85 at the start, two idle Claude sessions and a
terminal. Nothing else of mine ran during any measurement.

**Alone, once.** `npm test`, exit 1, 55.6 s, 875 of 877 passing. Two failures, both
pre-existing and neither a timeout:

- `citation-sweep.test.ts`, the release gate that sweeps this repository's own
  workbench. It names `260906-0026-what-shared-state-the-hook-suite-reaches.md` and
  reports `rewrites=5`: the analysis record filed earlier this session carries five
  store-prefixed citations in its Sources section. Deterministic, content-based,
  and the corpus red `CLAUDE.md` documents under "npm test goes red on a citation
  I did not edit".
- `staging-drift.test.ts`, one case, an empty `additionalContext`. That is the
  `lib/git.ts` null path, finding 5 of the analysis, and it fires even solo.

Both were re-run at the old budget (`npm test -- --testTimeout=5000` over those two
files) and both failed there too, so neither is caused by this change. The
staging-drift failure named a *different* case in the two runs, which is itself the
nondeterminism finding 5 describes.

**Ten pairs, twenty runs.** Two full `npm test` runs started together, ten rounds.
Per-run wall clock rose from 55.6 s alone to 98–110 s in a pair.

| class | runs |
|---|---|
| red on `citation-sweep` alone (the pre-existing content red) | 20 of 20 |
| carrying any further failure | 2 of 20 |
| vitest case timeout on the config default (what this change addresses) | 0 of 20 |

The two runs with a further failure:

- round 3, half A: `guard-bash-integration` (`['guard_allow']` where
  `['guard_allow', 'review_coverage']` was expected) and `guard-state-shape` (an
  empty coverage sentence). Both are the `lib/git.ts` 5-second budget collapsing to
  `null`, which is change 2 and was deliberately not touched here.
- round 5, half A: `fusion-commit-lock.test.ts`, "a creator reaped between mkdir and
  its holder write…", `Test timed out in 30000ms`. That is the one case in the file
  that already carried its own `30_000`, so this change did not reach it.

**A second solo run, taken after the ten pairs as the closing verification.** exit 1,
52.6 s, 872 of 877 passing. Five failures: the citation gate again, plus two cases in
`review-coverage.test.ts` (`expected 'unchecked' to be 'covered'`, the exact signature
of finding 2) and two in `staging-drift.test.ts`, all four the `lib/git.ts` null path.
Zero vitest timeouts. The machine's five-minute load average was still 11.63 from the
pairs when it started, so "alone" here means only that no second suite was running.

So of the twenty runs, no failure at all belongs to the budget this change moved.
The raw red rate is 20 of 20 because of the citation gate, and 2 of 20 once that
deterministic red is set aside; neither figure is comparable to the record's 40
percent, which was taken over a corpus that did not yet contain the analysis record.

## Reading of the commit-lock header's intent

`fusion-commit-lock.test.ts:65-84` says every wait in the file ends on a monotone
event and that "the only deadline left is the vitest case timeout, which is a
deadlock guard rather than an assumption about how fast the lock is." 30 000 keeps
that intent and does not defeat it. Every condition those cases wait on persists
once true (a gate file appearing, a first-fail line that stays in the accumulated
stderr, a process exit), so a genuine deadlock never satisfies the condition and
still hits the deadline; it now hits it 25 seconds later. At 5 s the deadline was
the very thing the header disclaims: the same file's config comment records a
bash-to-first-`mkdir` latency of 9.5 s in a run that PASSED, so the old constant sat
below the measured passing distribution.

One qualification, measured rather than inferred: 30 s was itself crossed once in
twenty loaded runs. 30 s is a weaker speed assumption, not the absence of one, and
no finite constant is purely a deadlock guard. What it buys is a constant above the
loaded distribution for the twelve cases that had none instead of below it.

## Not done, and why

- `lib/git.ts`: the larger half of the record, a user ruling, filed as
  `260906-0035_*_what-should-the-git-helpers-budget-be-and-is-a-timeout-retried.md`.
- The monitor's port handover (change 3) and `GIT_OPTIONAL_LOCKS=0` (change 2b),
  both out of this dispatch.
- The `citation-sweep` red: a citation fault in a workbench record, not code, and
  outside this dispatch's file scope. Named here and reported, not edited.
