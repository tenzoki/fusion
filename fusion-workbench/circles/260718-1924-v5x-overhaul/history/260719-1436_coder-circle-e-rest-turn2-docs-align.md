# History: Circle E-rest Turn 2 — align docs + wire explainer pointers

**Agent:** coder
**Date:** 2026-07-19 14:36
**Circle:** 260718-1924-v5x-overhaul
**Plan:** planning/260719-1416_p_plan-circle-e-rest-docs-cleanup-v5-close.md (Turn 2, steps 2–5)
**Status:** Complete

## What I did

Applied the plan's per-file staleness audit to five docs. Verified each stale reference against the live tree (16 agents, v5.3.0, underscore markers, `bin/fusion-rules` source) before editing.

### 1. README-agents.md
- Bracket→underscore markers: playmaker Writes cell `[m]-circle.md` → `_a_circle.md`; layout tree `[m]-circle.md carries the marker` → `_t_circle.md carries the marker (all states glob as *_circle.md)`.
- Rewrote the "plugin ships exactly one rule file" claim into an accurate always-on-core / conditional / mechanism-docs breakdown (verified against `bin/fusion-rules`: core = agent-setup.md first, then conventions, decision-record-examples, user-facing-output, critical-stance, git-branch-discipline, + chat-voice; conditional = design-diagrams for diagram agents, default-voice for prose agents, domain patterns; context-manifest.md + context-lean-claude-md.md shipped-but-not-emitted).
- Rewrote the helper description: `agent-setup.md` emitted first as the factored Setup contract all 16 prompts point at; `fusion-rules <agent> [<topic>]` + optional `./rules/context-manifest.yaml` (path/skill units by agent AND topic, byte-identical when absent).
- Added `editor` to the workbench-conventions-only pattern→agent row.
- Added 4 skills to the skills table: `/fusion:next`, `/fusion:direct`, `/fusion:circle-stash`, `/fusion:circle-pop`.

### 2. skills/help/SKILL.md
- three → five "Why it's built this way" pillars; softened the fast-answer line's hard count.
- Added `editor` and the `/fusion:next`/playmaker Circle surface (taskplanner still the in-Circle queue) to the entry-point list.
- Added the `./rules/context-manifest.yaml` topic-scoped-loading mechanism to the Configure/Project-rules area.
- Added working-model.md routing pointers in the philosophy topic and the daily-practice topic.

### 3. CLAUDE.md (align only — NOT slimmed, F2 bullet NOT added)
- Added `rules/agent-setup.md` (Circle D) to the "Rules loading" convention bullet: emitted first, the factored Setup contract all 16 prompts point at. Additive one-sentence insertion; no restructure, no slim.

### 4. Cross-ref pointers to the explainer
- docs/philosophy.md "Where to read more": added `[working-model.md](working-model.md)` bullet.
- README.md top line: added `[docs/working-model.md](docs/working-model.md)` alongside philosophy + agents links.

## Verification
- All explainer link targets exist on disk (`docs/working-model.md`, `rules/context-manifest.md`, `rules/context-lean-claude-md.md`).
- No residual `[m]-circle`, "exactly one rule file", or "three load-bearing" strings in the edited docs.
- Rule-set description cross-checked against `bin/fusion-rules` source, not memory.

## Issue filed (out-of-scope defect)
- issues/260719-1436_o_claude-md-seven-prose-agents-stale-count.md — CLAUDE.md line 47 says "seven prose agents"; `bin/fusion-rules` `IS_PROSE_AGENT` now lists nine (adds conceptrev, editor). Not in the Turn 2 audit; left for Turn 3's sweep.

## Files changed
- README-agents.md
- skills/help/SKILL.md
- CLAUDE.md
- docs/philosophy.md
- README.md
