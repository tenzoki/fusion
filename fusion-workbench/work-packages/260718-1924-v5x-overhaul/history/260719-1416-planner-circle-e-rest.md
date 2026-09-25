# Planner — Circle E-rest (docs cleanup + v5.0 closing gate)

**Date:** 2026-07-19 14:16
**Agent:** planner (Domain: code, Executors: coder)
**Circle:** 260718-1924-v5x-overhaul (active)

## What was planned

Per-Circle implementation plan for E-rest, the remaining docs-cleanup and v5.0 closing gate of the fusion v5.x overhaul. Master plan deferred E's file-level detail to this pass (A–D landed; philosophy.md + README.md + README-hooks guard-tuning already done).

Plan file: `260719-1416_*_plan-circle-e-rest-docs-cleanup-v5-close.md`

## Inputs read

- Spec `260718-0437_*_spec-fusion-v5x-overhaul.md` §"Circle E" and master plan `260718-1001_*_master-plan-fusion-v5x-overhaul.md` §"Circle E" (Grounding).
- Live docs audited for staleness: README-agents.md, README-hooks.md, skills/help/SKILL.md, CLAUDE.md; confirmed backbone docs philosophy.md, README.md.
- plugin.json (already v5.3.0, "16 agents"); agents/ (16 files); skills/ (14 skills).

## Per-file staleness found

- README-agents.md: bracket markers `[m]-circle.md` (lines 40, 209); "exactly one rule file" (153, self-contradicts 174); helper description omits agent-setup.md + Circle B manifest/topic (155-161); pattern table omits editor (170); skills table omits circle-pop/circle-stash/direct/next (188-197).
- skills/help/SKILL.md: "three load-bearing ideas" now five pillars (23); entry list omits editor (34-42); "next → taskplanner" should add /fusion:next (39); Configure omits Circle B manifest (82-85).
- CLAUDE.md: no mention of rules/agent-setup.md (Circle D); optional F2 contract bullet. Align only, no slim.
- README-hooks.md: verified CLEAN (zero edits expected). README.md, philosophy.md: already done.
- Supersedes item 3 of 260717-1740_o (README drift); items 1-2 moot after README rewrite.

## Structure

4 Turns: T1 create working-model explainer; T2 align README-agents + help skill + CLAUDE.md + pointers; T3 consistency sweep + verify README-hooks; T4 release gate (bump plugin.json + marketplace.json, validate, smoke test, B-rest severance/closure). Mermaid bundle DAG included (linear spine + 3 decision inputs) for conceptrev.

## Decisions surfaced for the gate (user rules)

1. Explainer home — recommend new docs/working-model.md.
2. Release version — recommend 5.4.0 (minor; reserve 6.0.0 for a contract break).
3. B-rest severability — recommend sever to own tracking, close fusion-side umbrella.

## Next

Plan gate: conceptrev evaluates the diagram; user resolves the 3 decisions and approves. No agents dispatched (planner stops here).
