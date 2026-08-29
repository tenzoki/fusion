# Shaper session — finalise v5.x-overhaul umbrella spec

**Date:** 2026-07-18
**Mode:** user-direct (finalisation pass; forks answered by the user via the orchestrator)
**Spec:** `260718-0437_*_spec-fusion-v5x-overhaul.md`

## What happened

Folded the user's resolved decisions into the draft umbrella spec and removed the "held open / recommended default" framing. No decision was re-opened. No implementation planning was done (per-file steps stay with the planner).

## Resolved decisions folded in

1. Scope: five sequenced circles under one v5.x umbrella (A analysis → B context management → C editor → D prompt revision → E docs/working-model gate).
2. Theme 1 surface corrected: the consuming project's own `CLAUDE.md` + `rules/`, not the global `~/.claude/`. Global migration is the user's own job, out of scope.
3. Theme 1 form: manifest / topic-unit scheme extending `bin/fusion-rules`; heavy knowledge as on-demand Skills; `CLAUDE.md` as lean index.
4. Theme 1 delivery depth: mechanism + docs AND the reference conversion on `unite-co-creator` as dogfood proof (43 kb CLAUDE.md → lean index; 12 duplicated rule files deduplicated onto the `.claude/rules/` vs `./rules/` split). Conversion artifacts live in the UNITE repo.
5. Theme 1 granularity: per-agent AND per-topic/circle loading.
6. Theme 2 forms: Markdown + pptx (dl-brand-pptx + public pptx) + en/de translation; docx deferred.
7. Theme 2 role: produce only; no reviewing other agents' prose.
8. Theme 3 depth: per-agent audit against a rubric (clarity, structure, duplicated Setup boilerplate, tool discipline, Output Style) with targeted rewrites.
9. Theme 4 authority: analysis-only, read-only; re-wiring flows into Circle D. Captured the subagent user-involvement gap (shaper-as-subagent has no AskUserQuestion) as a coordination finding for the analysis.
10. Theme 5 depth: substantial backbone rework of philosophy.md (drop hermeneutic-circle/Gadamer residue, keep operational Coherence/Circle content, add plain user working-model + hooks/gates explainer); all docs align.

## Changes to the document

- Status: Draft → Final.
- Removed the subagent-status note block and the whole `## User Decisions Pending` section.
- Rewrote the Directive and Scope as settled (no "recommended" hedging).
- Updated the Mermaid diagram to the resolved dependency edges: A→C, A→D, B→D, C→D, and A/B/C/D→E.
- Each circle now carries a filled `Decisions made` and a `Non-goals` block.
- Rewrote Constraints and Out of Scope to reflect the corrected Theme 1 surface and the in-scope reference conversion.

## Left for the planner

Per-circle mechanics only: Circle A report structure + rubric detail; Circle B manifest/topic-tag/skill design + reference-conversion mapping; Circle C editor internals + registration surface; Circle D audit order + boilerplate factoring; Circle E doc re-sectioning; umbrella activation order.
