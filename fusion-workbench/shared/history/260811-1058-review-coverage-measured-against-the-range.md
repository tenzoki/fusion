# Review coverage measured against the range, not against the last Turn

**Agent:** coder
**Status:** Complete
**Task:** `I:260810-1205-review-coverage` (task 4 of `fusion-workbench/tasklist.md`)
**Source:** `fusion-workbench/shared/issues/260810-1205_o_seven-of-sixteen-commits-in-the-session-range-never-reached-a-review-pass-and-nothing-measures-the-gap.md`
**Rides:** task 2 (`8a49fd5`) — `hooks/lib/state-drift.ts`, the read-only-measurement-with-callers shape

---

## The defect, verified before it was fixed

The record's claim tiles exactly as stated. `git log --oneline 940d522..da8c9db` and
`b3cc034..7785330` return one and nine commits respectively, and neither range is inside
either of the two newest review files' declared spans (`5ef92eb..940d522`,
`da8c9db..b3cc034`). The gap is real and it is on both sides of the newer pass.

**And a finding the task asked for explicitly: the review files do NOT record their ranges
in a form a program can read.** Ten `coderev` files in `shared/reviews/` carried four
spellings of the range — `**Range:**`, `**Scope:**`, `**Scope reviewed:**`, `**Scope as
dispatched:**` — several carried none at all, and the filenames disagreed too
(`range-18b6094-to-a7c2b03`, `range-5ef92eb-940d522` with no `to`, and two ending in
`-to-head`, which names a different commit every day it is read). So the computation could
not be written over the existing format, and inventing a parser for a format the reviewers
were never told to write would have returned nothing while looking like coverage.

The mandate came first, the reader second.

## What landed

1. **`hooks/lib/review-coverage.ts`** — the measurement. Expands every review's declared
   `from..to` with `git rev-list`, unions them, and subtracts from
   `git rev-list <since>..<head>`. A set difference over commits rather than interval
   arithmetic over endpoints, so overlapping, out-of-order and merge-crossing ranges are all
   correct. `since` defaults to `session.git_head_at_start` in `agentstate.yaml` — the field
   the drift check already needed, so **no new state field was added**. Reviews are bounded
   to those modified at or after the anchor commit's date; both ways that bound can be wrong
   are the safe direction.
2. **`hooks/review-coverage.ts` + `bin/fusion-review-coverage`** — the CLI, in the
   `KEY=value` shape `bin/fusion-state-drift` uses, with the same exit-code contract
   (0 ran / 1 usage / 2 no workbench / 3 no compiled hooks). `verdict=uncovered` is a line
   of output, never an exit code — issue `260810-0710`'s lesson, carried over deliberately.
3. **`agents/coderev.md`, `agents/ontorev.md`** — two mandated header fields,
   `**Reviewed-range:**` (two resolved short hashes; `HEAD`, branches and tags refused) and
   `**Not-opened:**` (backticked list, or the bare word `none`). A `none` and a missing line
   are different facts and stay apart, for the reason `**Active Circle:** none` is mandated.
4. **`agents/orchestrator.md`** — Step 3c runs the helper before writing the dispatch prompt
   and adds the carried `**Not-opened:**` list to the review's scope; a Turn that changed
   nothing but inherited unopened files is no longer a skip. Phase 4 gains a
   `## Review coverage` section computed from the helper, with the gap named commit by
   commit, and the "Report to the user" list gains the same statement.
5. **`hooks/tracker.ts`** — the measurement runs unasked on **one narrow trigger**: a write
   tool landing a `.md` file under a `reviews/` store. Throttled on the gap signature,
   anchored at the workbench root, no stand-down in fusion's own repo.
6. **Two suites** — `review-coverage.test.ts` (18 cases against real throwaway git
   repositories and real subprocesses) and `review-coverage-mandate.test.ts` (14 cases: the
   mandate in both reviewer prompts, the prompts' own header lines run through the real
   parser, and the orchestrator's consumption of both answers, each with a negative control).

## The one design question the task posed, answered

**Does the coverage computation belong in the same shape as task 2's? Yes for the module and
the CLI. No for the every-tool-call ride, and the reason is not convenience.**

A stale `agentstate.yaml` is a fault at every moment after the commit that outdated it, so
measuring it on every tool call reports a fault only when there is one. An uncovered range
*mid-Turn* is the normal and correct state — review runs at Step 3c, after the Turn's tasks
land — so the same cadence here would fire on the commonest path, and a check that cries
wolf on its commonest path teaches its reader to ignore it. That is issue `260810-0710`
arriving one level up, and `agents/orchestrator.md` `### Drift check` already records it as
the reason the drift verdict is output rather than an exit code.

So the trigger moved rather than the mechanism: a **review file landing** is the moment the
answer is actionable, because that is when the next dispatch's scope is being decided. Which
is precisely the defect's second half — the `0939` pass declared three files it had not
opened, and the sentence went into a file nobody reopened.

## Not built, deliberately

The release gate. Whether a release may go out over an uncovered range is a decision, it is
not filed, and it belongs beside
`shared/decisions/260810-0710_o_should-a-rule-be-allowed-to-land-without-the-check-that-enforces-it.md`.
Nothing in this change blocks anything, and both the CLI and the prompt say so.

## Verification

`cd hooks && npm test` — exit 0, 45 files, 1210 tests (baseline 1178 at `b4eb4db`; +32).
`npx tsc --outDir /tmp/... && diff -r` against `hooks/dist` — identical.
Smoke run against this repository: `./bin/fusion-review-coverage --since 5ef92eb` reports 25
commits, 2 reviews, both `UNUSABLE (no **Reviewed-range:** line)` — the finding above,
demonstrated by the tool on the files that produced it.

## Residual, stated rather than left to be found

The mandate is prompt text and the lint gates the specification, not a run. A reviewer that
skips the fields produces a file the helper reports `UNUSABLE` by name with the reason and
whose commits stay in the uncovered list — loud rather than quiet, which is the improvement
and not a guarantee. The ten review files already on disk stay unusable; nothing back-fills
them, because their ranges are not recoverable from their text.
