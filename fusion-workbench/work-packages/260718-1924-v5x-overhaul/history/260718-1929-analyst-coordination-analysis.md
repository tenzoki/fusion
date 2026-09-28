# History: Circle A — agent-coordination analysis

**Date:** 2026-07-18 19:29
**Agent:** analyst
**Circle:** `260718-1924-v5x-overhaul`
**Status:** Complete

## Directive

Execute Circle A (LEAD, read-only) of the v5.x overhaul: study how the 15→16 agents coordinate, enumerate the dispatch graph (Mermaid), catalogue per-prompt duplication/divergence, capture the subagent-cannot-ask-user gap, and emit two hand-off artifacts — Circle D's audit rubric and Circle C's editor-fit criteria.

## What was read

All 15 `agents/*.md` in full (3,374 lines); `bin/fusion-rules`, `bin/fusion-paths`, `bin/fusion-workbench-root`; `README-agents.md`; `docs/philosophy.md`; `rules/design-diagrams.md`; the master plan's Circle A/B/C/D sections. Grep-quantified the shared Setup block, Output-Style tiers, history-log step, readability-gate line. Empirically confirmed AskUserQuestion is absent from a dispatched subagent's tool inventory (this session).

## What was produced

- `260718-1929-agent-coordination-analysis.md` — the coordination analysis report. Two Mermaid diagrams (dispatch flowchart, subagent-proxy sequence). Eight ranked findings (F1-F8), each tagged analysis-only vs re-wiring-for-D. §6 = Circle D rubric (R1-R5, each with a concrete per-prompt test). §7 = Circle C editor-fit criteria (7 criteria).
- This history entry.

Nothing else was written; read-only on all source (code, prompts, helpers, docs).

## Top findings

1. **F1 (High):** Setup steps 1-2 duplicated verbatim across 14 prompts + 1 expanded on orchestrator — the largest single duplication; Circle B's mechanism input, Circle D's factoring target.
2. **F2 (High):** subagent-cannot-ask-user — `AskUserQuestion` is orchestrator-only; shaper/planner/bugfixer/analyst instruct it but cannot call it when dispatched, so all user-involvement proxies through the orchestrator with cold-start re-dispatch cost. Generalises to a class.
3. **F3/F4 (Medium):** Output-Style exists in three shapes where two suffice; conceptrev is in `IS_PROSE_AGENT` but lacks the long-form block and its Setup omits the voice-profile read its Output Style assumes.
4. **F5 (Medium):** reviewers (coderev/ontorev/conceptrev) lack the history-log step 12/15 agents carry.

## Hand-off artifacts confirmed present in the report

- Circle D rubric — §6, five dimensions R1-R5, each with a concrete per-prompt test.
- Circle C editor-fit criteria — §7, seven criteria.

## Note on output placement

Report written to the Circle's `analyses/` per the master plan (Circle A deliverable) and the fusion coordination model — Circles C and D read the rubric/criteria from this file in later sessions with no shared context. The file is the load-bearing hand-off, not a chat message.
