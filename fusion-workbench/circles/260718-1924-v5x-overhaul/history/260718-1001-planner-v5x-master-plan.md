# History: master plan for the fusion v5.x overhaul

**Date:** 2026-07-18 10:01
**Agent:** planner (executors: coder, analyst)

## What was planned

Produced the master implementation plan for the v5.x overhaul against the finalised umbrella spec (`shared/planning/260718-0437_o_spec-fusion-v5x-overhaul.md`, conceptrev-clean). Output: `shared/planning/260718-1001_o_master-plan-fusion-v5x-overhaul.md`.

Sequenced all five circles as a DAG (two roots A+B, single sink E). Detailed the roots to executable step level; scoped C/D/E with acceptance + step outlines and marked exactly where file-level detail must wait on A's findings and B's landed mechanism.

## Grounding read

- Umbrella spec; both stilwerk voice profiles (default + chat).
- `bin/fusion-rules` and `bin/fusion-paths` in full; `rules/design-diagrams.md`; `rules/fusion-workbench-conventions.md` (marker convention).
- `docs/philosophy.md` (162 lines, hermeneutic framing to remove in E); `plugin.json` (5.0.0, "15 agents"); `README-agents.md`; the 15 agent prompt sizes; the coder Setup boilerplate (the duplicated steps 1-2).
- Reference project `unite-co-creator` at `F03_digital-leadership/unite-co-creator`: CLAUDE.md 259 lines/43kb; rules/ and .claude/rules/ each hold the same 12 files, ~1,861 duplicated lines per side; heavy BoK already packaged as `unite-*-sc-skill` skills.

## Key design decision

Circle B is one integral mechanism: an optional topic argument plus an optional project-side `context-manifest.yaml` layered onto `bin/fusion-rules`, byte-identical when no manifest is present. Not a second helper, not a per-topic point-solution set. Skill-packaging boundary formalises the existing `unite-*-sc-skill` pattern.

## Left for the gate

Five open questions, chief among them the editor's output-file placement (decides whether Circle C touches `bin/fusion-paths`) and the topic-source at Setup. Per-circle planning passes for C/D/E happen at activation, after A/B land.
