# Session: Four mechanisms — purpose, bindingness, and cost

**Date:** 2026-08-12 02:51
**Agent:** analyst (domain `code`)
**Status:** Complete
**Directive:** Answer four *why* questions the prior complexity analysis left open, from evidence,
in one report. No code changed.

## What was done

Read `shared/analyses/260812-0022-where-the-complexity-comes-from-and-what-would-have-to-go.md` in
full, then answered its four unanswered questions:

1. The churn and counter apparatus — origin, intent, and why nothing acts on the output.
2. The domain parameter — what changes when a domain is chosen, and how binding it is.
3. The self-bookkeeping family — what failure it was built for and whether its subject should exist.
4. The shell programs in `agents/orchestrator.md` — realistic to extract, token saving, decidability.

Two research sub-tasks were dispatched in parallel (`fusion:analyst`, non-writing) for the churn and
self-bookkeeping archaeology. Findings 2 and 4 were measured directly.

## Key measurements taken

- All 29 fenced blocks in `agents/orchestrator.md` parsed and classified twice, mechanically by
  free-variable analysis and by hand. 20 bash blocks, 6,800 bytes, 4.1 percent of the prompt.
- Prompt byte size before and after each of the six `bin/` helper creation commits. Five grew the
  file, one was neutral, none shrank it. Total +24,243 bytes.
- 12 prompt-text lint test files totalling 5,148 lines.
- Domain values across both projects: 527 `code`, 12 `data`, 6 `knowledge`, 1 `strategic`.
- `hooks/lib/domain-cascade.ts` has zero runtime consumers; it is test-only.
- Churn critical duty cycle in the control project: 53 to 100 percent of tracked writes.
- Zero hook firings of `state_drift`, `staging_drift`, `review_coverage` in either project.
- 27.7 percent of `agents/orchestrator.md` (45,623 of 164,716 bytes) is self-bookkeeping instruction.

## Output

- `shared/analyses/260812-0251-four-mechanisms-purpose-bindingness-and-cost.md` — the report.
  Three Mermaid diagrams, four verdicts, all four **change**.

## Issues filed

None, deliberately. Six of the seven proposed changes are user decisions rather than executor
defects, and two existing open records (`260811-1143`, `260811-1145`) already carry parts of the
work. Decision `260810-1544` parts (b) and (c) are the prerequisite for Finding 4 and are already
open.

## Files read, not modified

Read-only throughout. No code, data, ontology, prompt or configuration was changed.
