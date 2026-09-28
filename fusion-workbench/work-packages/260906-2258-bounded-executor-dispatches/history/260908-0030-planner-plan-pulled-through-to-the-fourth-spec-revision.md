# The bounded-dispatch plan is pulled through to the specification's fourth revision at the three places it names

**Status:** Complete
**Filed by:** planner, Kai Stalmann <ks@qantr.com>

## What was asked

Not a new plan. Pull `260907-1450_*_plan-bounded-executor-dispatches.md` through at the three places the shaper named in `260907-0820_*_spec-bounded-executor-dispatches.md` `## Open for Planner`, leaving the fifteen steps, their order, their executors, the 20 minutes, the seven bound agents and the gate character of Step 1 untouched. Additionally: check whether the plan's byte budget of 3 790 against 4 618 still holds, and report any file moving under the session, since a second session is running in this checkout.

## What was done

Read first, in full: the revised specification, `260907-1657-c5-cost-argument-check.md` and `260907-2012-break-even-arithmetic-for-the-dispatch-split.md`.

**Pull-through 1, Step 2's prescribed comment.** The step carried only the first sentence of the measurement C1's fourth criterion requires beside `DEFAULTS.orchestrator.dispatchMinutes`. It now quotes the criterion's full two-sentence wording as a block quote, with an instruction to copy rather than rephrase, and says which sentence came from which source so a later reader can re-take each. Step 2's acceptance criterion gained a clause requiring the comment to diff empty against that block quote.

**Pull-through 2, the criteria count and Step 1's status.** Step 1 gained a `Status` line recording that it ran on 2026-09-07, naming the report and quoting its verdict. Its `Changes` line no longer states a count. Its acceptance criterion now names which of C5's criteria are the check's own — the specification's first seven — and names what meets each of the rest, including that the user's acceptance is no longer among them. Its `Gate` bullet is unchanged and gained a second bullet recording that the gate fired, that the user released it on the break-even arithmetic rather than the plan releasing itself, and that an executor picks the work up at Step 2. The paragraph under the step-dependency diagram was corrected to match.

**Pull-through 3, `## Where this Circle stops`.** Rewritten. The two clauses hanging on the C5 verdict and the user's acceptance are gone, replaced by two that ask about the byte reckoning in the narrow form the user chose: does the mechanism fit, and if not, was the only way back a cut that loses information or a baseline edit. A clause was added asking whether the corrected cost argument is on file, which is what the Directive's closing clause now requires. Every clause is answerable yes or no by a person, and a short paragraph above them records that the closure condition moved and where the old one is accounted for.

## What was verified

- C5's acceptance criteria counted with `grep -c '^- \[ \]'` over its own section: **10** on the working tree, **9** at `223f916a`. The specification's `## Open for Planner` states nine, so its own correction is off by one. Filed as `260908-0020_*_the-specs-open-for-planner-states-nine-c5-criteria-where-c5-carries-ten.md`.
- The `agents/` head-room, re-measured at `223f916a` against the same `AGENT_BASELINE`: `agents/*.md` sums to 414 334, baseline 399 843, delta 14 491, head-room **3 509 bytes** against 3 790 budgeted. The build is 281 bytes over before it starts. The whole 1 109-byte difference is one uncommitted growth of `agents/playmaker.md` by the second session in this checkout; no other file in the directory moved from `abcaa823`. Filed as `260908-0025_*_the-agents-budget-is-281-bytes-short-after-another-sessions-growth-so-what-gives.md`, with four options and a recommendation.
- `AGENT_BASELINE`, `RULE_BASELINE`, `RELEASE_CAP` and `DRIFT_CEILING` are byte-identical from `abcaa823` through `223f916a` and in the working tree, checked with `git diff --stat` over the two test files, so the plan's baseline-identity clause is a live comparison.
- The plan carried `the budgets above sum to 3 650` where its own table's `Sum` row reads 3 790. Corrected, with the stray figure named rather than silently replaced.
- Three further sites carrying the stale 4 618 were brought up to date: the `## Current State` row, the byte-landing diagram's subgraph label, and the testing-strategy row.

## What was not done

No step was added, removed, reordered or reassigned. No executor changed. The 20 minutes, the seven bound agents and Step 1's gate text are as they were. Step 14's instructions were not rewritten — it already says to re-measure rather than to read a figure off the plan, and it already names the cut; what it gained is the dated re-measurement and the statement that its named cut is now the expected path rather than the fallback.
