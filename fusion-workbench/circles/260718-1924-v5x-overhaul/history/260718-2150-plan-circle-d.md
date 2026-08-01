# History: Circle D per-Circle planning pass

**Date:** 2026-07-18 21:50
**Agent:** planner (Domain: code; Executors: coder)
**Circle:** `260718-1924-v5x-overhaul`
**Status:** Complete

## What I did

Produced the per-Circle implementation plan for **Circle D — Agent-prompt
revision** of the fusion v5.x overhaul, gated on Circles A and B (both landed).

- Read the grounding in full: A's coordination analysis (§4/§5/§6, F1–F8), the
  umbrella master plan §Circle D + §Testing Strategy, everything Circle B shipped
  (`rules/context-manifest.md`, `rules/context-lean-claude-md.md`, `bin/fusion-rules`),
  Circle C's `agents/editor.md`, and — first-hand — the prompts coder, coderev,
  ontorev, conceptrev, plus the parameter-parsing blocks in taskplanner/reconciler/
  playmaker/planner.

- Verified the load-bearing finding: **no factored Setup unit exists yet.** B
  shipped the manifest mechanism but not the unit; F1 requires D to create it.

## Decisions settled

- **F1** (settled in plan): create `rules/agent-setup.md` as a sixth always-on
  plugin rule emitted by `bin/fusion-rules`; each prompt's Setup shrinks to a
  minimal bootstrap pointer. Reuses B's always-on emission spine (not the
  project-side, topic-scoped manifest, which is the wrong tool for universal
  plugin-side Setup). Subsumes F4 for free.
- **F5** (user-gated): filed decision record
  `decisions/260718-2150_o_reviewers-history-log-step.md`. Recommendation: document
  the exception. Gates the R5 cells of the three reviewers.
- **F6** (settled in plan): leave the parameter-parsing block alone — verified it is
  not byte-identical across the four agents, so no clean unit to factor; a unit would
  relocate rather than reduce.

## Deliverables

- Plan: `planning/260718-2150_o_plan-circle-d-agent-prompt-revision.md`
- Decision: `decisions/260718-2150_o_reviewers-history-log-step.md`
- 16×5 scoring table, 8 bundles (foundation + 5 prompt bundles + orchestrator-last +
  coupling note), Mermaid bundle/dependency DAG for the plan gate.

## Next

Plan goes to conceptrev (diagram gate) and the user (plan gate). The F5 decision
needs a user ruling. On approval, Circle D executes via coder, Bundle 0 first.
