# Diagnosed the hook suite's concurrency failures, and said what loop 3 has left

**Status:** Complete
**Filed by:** analyst, Kai Stalmann <ks@qantr.com>
**Checkout:** 5e8248d7
**Domain:** code
**HEAD:** `1b305c97`
**Session:** `260905-2008-orchestrator-session.md`
**Report:** `260906-0026-what-shared-state-the-hook-suite-reaches.md`

## What was asked

Two jobs, standing in for the consultant. First, find out what shared state the hook suite reaches, per record `260905-2356_*_the-hook-suite-is-not-isolated-from-a-second-copy-of-itself-and-fails-at-forty-percent-under-one.md`, confirming or refuting its inference file by file, and say what the repair looks like and which of the record's two acceptance routes to take. Second, briefly, what loop 3 should do. A third instruction: do not force the rate measurement into either of the two branches my own previous analysis pre-agreed.

## What was done

Read the eight named test files, `helpers/guard-harness.ts`, both build scripts, `vitest.config.mjs`, and the production modules under them (`lib/git.ts`, `lib/review-coverage.ts`, `lib/staging-drift.ts`, `lib/citation-scan.ts`, `hooks/tracker.ts`). Read the governing decision `260811-2009_*` and the two loop-2 history files. Checked tsx's transform cache as a shared-state candidate and cleared it.

Ran seven full `npm test` runs and 640 timed git invocations between 00:06 and 00:24: one alone as a baseline, three concurrent pairs, three further pairs with a git-latency sampler, forty quiet samples afterwards. The baseline and the quiet samples ran with nothing else of mine in flight; the pairs are the concurrent condition itself. Nothing in the repository was edited and `git status` is unchanged.

## What was verified

**The record's inference is refuted for all eight files.** Every one builds its root with `mkdtempSync`. No file reaches a shared path, a shared directory name or the real workbench, and the shared build output the previous repair round addressed is genuinely closed.

**What fails is three fixed wall-clock budgets under machine contention.** Reproduced: two of six concurrent runs red, both on `review-coverage.test.ts:543` with `expected 'unchecked' to be 'covered'`. `unchecked` is what `measureReviewCoverage` returns when `lib/git.ts` hands back `null`, which it does on a timeout at 5 s. Measured: `git log` latency 23 ms quiet, up to 7580 ms under two concurrent suites, zero spawn errors. Six of the eight files fail through that one function. The other two fail on vitest's default `testTimeout` of 5000 ms, which the project never sets: `fusion-commit-lock` runs 12 of 13 cases on it, `monitor-warnings-panel` 3 of 21, and eighteen further files carry untimed subprocess cases.

**The larger finding: `lib/git.ts` is production code and both callers run inside PostToolUse.** On a loaded consuming machine the budget renders a timeout as a well-formed report claiming git would not answer. The suite going red is that fault reporting itself, which is why the report recommends repair over declaring the suite single-instance.

**`scripts/run-tests.mjs`'s sync into `hooks/dist/` is not implicated.** Content-identical files are skipped, no case reads that tree's content, and `committed-dist.test.ts` reads a `git archive` extraction of its own.

**HEAD moved at 00:30**, after every measurement was taken: the orchestrator committed the isolation record as `aacf0554` and appended an index-lock section to it. That section's inference, that tests in the affected set held the index, is refuted in finding 7: every git call in the suite runs in a temp repository except four read commands that take no index lock. The family that does take it is `git status`, which `hooks/tracker.ts`'s staging-drift measurement runs against the project on a commit-bearing tool call, and which this analysis also ran twice. The record's conclusion stands and gets sharper; the remedy is `GIT_OPTIONAL_LOCKS=0` on that one call.

The citation gate was re-run after the report was written: 13 tests green. `bin/fusion-prose-metric` reports 0 em-dashes over 3891 prose words.

## What was recommended

Repair, in three changes: an explicit `testTimeout` in `vitest.config.mjs` (one line, widest reach, no ruling needed); a decision record on `lib/git.ts`'s budget, recommending that a timeout be separated from a decline and retried once; and the `$URL_FILE` read that `260905-2158`'s entry 8 already specified for the monitor's port. Run the acceptance after the first change alone, to separate which budget owns which share of the 40 percent.

Both rate-conditioned records should become `_d_`, superseded by the isolation record, and the two branches I pre-agreed should not be applied to either: the case split was disjoint but not complete, since it treated the rate as a scalar over one condition. Entry 9's `speculation:` about the review-file mtime floor is refuted by the assertion text.

Loop 3's substantial work is the isolation repair plus `260905-2213_*`, which waits on nothing.

## Written

One analysis report, `$OUT_ANALYSIS/260906-0026-what-shared-state-the-hook-suite-reaches.md`, and this entry. No issue filed, per the dispatch; one is recommended in the report. No defect record, decision record or source file was edited.
