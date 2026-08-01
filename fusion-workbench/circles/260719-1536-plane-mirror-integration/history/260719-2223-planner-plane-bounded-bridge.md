# Planner history — Plane bounded bridge plan

**Date:** 2026-07-19 22:23
**Agent:** planner (executors: coder, ontocoder)
**Circle:** 260719-1536-plane-mirror-integration

## What was planned

Produced the C3 + C4 + one-seeding-read implementation plan for the Plane bounded bridge, in the fusion plugin source (bin/, hooks/, agent prompts, skills, templates, docs).

**Plan:** `circles/260719-1536-plane-mirror-integration/planning/260719-2223_o_plan-plane-bounded-bridge.md` — 8 dependency-ordered steps.

## Core design decision

One integral design: the mirror is a single idempotent `reconcile(circle)` function (desired Plane state = pure function of files, diffed against a persisted natural-key map), invoked by the orchestrator at the state-change points it already owns (activation, per-Turn, Phase 4 closure). That one property delivers idempotency, offline rebuild-from-files, and never-silent at once. Code lives in `bin/fusion-plane` (bash, subcommand style) — reuses Martin's verified curl/jq/`zsh -ic` primitives verbatim; NOT a hook (hooks are guard/tracker only) and NOT TypeScript (would reinvent verified bash).

## Resolved the spec's "Open for Planner" agenda

Artifact→Plane-object mapping (all → Plane issues, labelled by kind; markers→states via runtime `states/`); transfer timing + `.plane-map.json` idempotency keyed on stable Circle dir name; C4 offline doctrine (outbox note + rebuild-from-files, reuses D3); seeding read via `/fusion:seed-from-plane` reusing `/fusion:direct`; key-from-env via `zsh -ic` + `plane.config.yaml` config surface; install doc + `doctor`; testing via dry-run `--plan` JSON seam + vitest + lint guards.

## Decision records filed (open choices surfaced, not buried)

- `circles/260719-1536-plane-mirror-integration/decisions/260719-2223_o_plane-datamodel-subissue-vs-flat-links.md` — how issues/decisions attach in Plane (child sub-issues vs flat+links vs labels-only). Recommend child sub-issues, fall back to verified links endpoint.
- `circles/260719-1536-plane-mirror-integration/decisions/260719-2223_o_seeded-circle-anticipated-vs-active.md` — seeded Circle enters `_a_` (reuse `/fusion:direct`) vs `_t_` (Martin-style). Recommend `_a_`.

Both have recommended defaults so Steps 3 and 5 can proceed; the plan gate confirms.

## Next

Plan is Ready for Review. Suggested: dispatch conceptrev on the plan (it carries 4 Mermaid diagrams), then the human plan gate, then taskplanner → coder/ontocoder execution. Planner stops here.
