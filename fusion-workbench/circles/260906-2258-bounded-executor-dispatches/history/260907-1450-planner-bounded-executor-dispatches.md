# Planner session: implementation plan for the bounded executor dispatches

**Date:** 2026-09-07 14:50
**Agent:** planner
**Filed by:** planner, Kai Stalmann <ks@qantr.com>
**Status:** Complete
**Circle:** 260906-2258-bounded-executor-dispatches

## What was asked

Write the implementation plan against `260907-0820_*_spec-bounded-executor-dispatches.md`, detailed enough to be executed autonomously: per step, which file, which place in it, which change, which verification command, which acceptance criterion. Four review reports were named as prior work, with two reservations from the fourth that the plan had to write out.

## What was produced

- `260907-1450_*_plan-bounded-executor-dispatches.md`, 15 steps, dependency-ordered, one executor each: 12 to `coder`, 1 to `ontocoder`, 1 to `analyst`, plus the byte-reckoning step.
- `260907-1450_*_which-program-hands-the-orchestrator-the-dispatch-bound-at-setup.md`, the one design fork the plan would otherwise have been written on a preference. Three options, costed; the plan is written against option B and Step 3 cites the record.

## What was measured rather than carried over

Every figure the plan states was taken by this session against the working tree at `abcaa823`, with `agents/` unmodified.

- `agents/` head-room: **4 618 bytes**. Baseline map sums to 399 843 over 15 files, tree holds 413 225, net 13 382 against 18 000. Reproduces the specification's figure exactly.
- The growth arithmetic is **net across the surface**, so a cut anywhere in `agents/` pays for growth anywhere else in `agents/` and never for growth in another surface. That is what makes the plan's fallback cut possible.
- `skills/` head-room 13 131 bytes; hook-test-line head-room 2 730 lines, that surface sitting below its baseline.
- `session_start` rows carrying `session_id`: **9 of 93** today. The fourth check read 9 of 92; the extra row is a session started since.
- All **263** machine-written dispatch rows carry a `session_id` and every one matches a `session_start` row, so C4's new criterion holds at 100 percent today.
- Rule emission per agent, run from a neutral working directory.

## The finding no review pass had

Emitting one new rule file to the seven bound agents **empties three `ROLES` entries** in `rules-emission-golden.test.ts` and fails the suite on an entry nothing matches any more. Measured: `(core only)` is exactly `coder`, `ontocoder`, `bugfixer`; `review-contract.md` is exactly `coderev`, `ontorev`; `decision-record-examples.md` is `reconciler` alone. All six are bound. `user-facing-output.md` survives because `consultant` is not bound. Step 7 of the plan exists for this and names the three keys to delete and the four to add.

## The two reservations the fourth check left

Both are written into the plan rather than sent back to the shaper.

1. Step 2e's attempt-versus-dispatch line is **Step 9 change 4**, written as a stipulation this work makes and explicitly not as something the prompt already says.
2. The `session_id` degradation is **Step 11 change 3**, where an unattributable dispatch is reported on stdout as `unattributable=` and its cause named on stderr, and **Step 12**, which requires a unit case for it. The risk table carries it with today's coverage figure.

The check's third recommendation, the Step 3a stall's event treatment, is decided in Step 9: `task_error` is emitted at the stall and not at a bounded return.

## The constraint that shaped the solution

Eight paragraphs under `agents/` do not fit in 4 618 bytes. The plan puts the obligation in one conditionally emitted rule file, `rules/bounded-dispatch.md`, touching none of the seven bound prompts, and splits the orchestrator's half by a stated rule: what must be known before the rule file is read stays in the prompt (which seven agents, how the deadline is computed, the Step 3b step 2d exclusion), everything else goes in the file and is read on demand. Budgets per edit sum to 3 790 against 4 618, leaving 828 bytes of margin, and Step 14 re-measures rather than trusting that figure. The named fallback cut moves two commit-procedure narratives from the prompt into `rules/commit-lock.md`, which the orchestrator already receives by emission, so no information leaves its context.

## What was not done

No code, data or prompt was edited. No agent was dispatched. The plan is a plan.

## Verification

- `plan-stopping-section-lint`, `workbench-citation-lint`, `marker-format-lint`, `reference-resolution-lint`, `sentence-identifier-containment`: all green with the two new files in the tree.
- `bin/fusion-citation-check`: `verdict=clean`, and neither new file appears in the violation listing.
- `bin/fusion-prose-metric` on both new files: `ok` (plan 0.2 per 1000 against a ceiling of 1; record 0.0). Both needed a reduction pass; the first draft of the plan stood at 5.2.
