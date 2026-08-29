# Analyst session: simplification, performance, and why rules do not hold

**Date:** 2026-08-12 03:03
**Agent:** analyst (domain: code)
**Status:** Complete

## Task

Answer the user's three questions in one report: what to simplify, how to reach higher performance,
and how to shorten the loops so agents stop derailing through re-injected rules. Check the six
observations filed as `260812-0253` rather than accept them. Establish causes for the monitor's
missing ETA and the localhost failure without fixing either.

## Outcome

Four observations hold, one holds with a different cause, one is refuted.

The rule-decay hypothesis is refuted on two independent measurements. Within a document, em-dash
compliance is 6 percent better in the last third than the first across 186 documents. Across
agents, the freshest contexts are the least compliant. Across 37 days the ceiling is exceeded 9 to
27 fold every day, including the project's first history file. There was never a compliant state to
decay from.

The variable that separates a rule that holds from one that does not is whether the obligation
rides an act the agent must perform anyway. Measured today: `task_done` emitted 248 times,
`task_start` 177 times, both instructed in the same prompt file. That 36 percent gap is also the
root cause of the missing ETA.

Setup shell cost is 593 ms, 0.2 to 0.8 percent of Setup. The largest recoverable cost is
bookkeeping, up to 28 percent of 277.5 hours of session time. The single recommended first change is
to delete the hand-maintained session counters and derive them from git and the event log.

## Artifacts

- Report: `260812-0303-simplify-speed-and-why-rules-do-not-hold.md`
- No issues filed: all six observations already carry records dated `260812-0253`.
- Answers requested against existing decision `260810-0710_*_should-a-rule-be-allowed-to-land-without-the-check-that-enforces-it.md`, which is one open issue (`260810-0510_*_two-of-the-queue-ground-lints-negative-controls-re-implement-the-logic-instead-of-calling-it.md`) from decidable.

## Method note

Two measurement sub-agents were dispatched read-only: one for wall-clock cost across both
projects' event logs, one for the monitor diagnostics. Neither wrote files.
