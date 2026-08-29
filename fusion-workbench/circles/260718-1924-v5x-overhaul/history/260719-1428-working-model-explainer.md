# Working-model explainer — Turn 1, Circle E-rest

**Status:** Complete
**Agent:** coder
**Circle:** 260718-1924-v5x-overhaul (active)
**Plan:** 260719-1416_*_plan-circle-e-rest-docs-cleanup-v5-close.md § Turn 1, step 1
**Directive slice:** create the plain, user-facing working-model explainer at its decided home.

## What was done

Created `docs/working-model.md` (new, 113 lines) — a user-facing (not agent-facing) explainer of how a fusion session actually operates. Six sections per the plan:

1. The Circle — one unit of work (Directive + Grounding + Artifact; the six-state lifecycle with `_a_/_t_/_c_/_b_/_s_/_d_` markers; one-active-Circle model + `.active-circle`; Circle-as-directory).
2. Spec-driven flow (shaper → spec gate → planner → plan gate → execute; shaper-skip case; spec + plan as the contract).
3. The gates (Human gates: spec, plan, ontology/ontocoder, destructive, ambiguous, branch-switch; per-Turn Coherence check with the three questions Grounding / Directive / Reachability; Rebalance gate's four choices in plain English).
4. The hooks (compliance guard: protected paths block, decision-governed high-sensitivity blocks, churn + ping-back observation-only warnings, escalation → halt, git branch-switch block; only three things block a write).
5. A worked walkthrough (one rate-limiting session from request to close, marking where each gate and hook fires).
6. Where to go next (pointers to philosophy.md, README.md, README-hooks.md, fusion-workbench-conventions.md, /fusion:help).

## Accuracy checks against the live system

- Marker letters and Circle lifecycle verified against `rules/fusion-workbench-conventions.md` `## State Markers — circles`.
- Coherence three-edge model + Rebalance four options verified against `agents/orchestrator.md` (Step 3c-bis, Rebalance Gate).
- Guard block-vs-warn semantics verified against `README-hooks.md` (only protected-path / high-sensitivity-decision / halt block; churn + cross-file are observation-only).
- Human gate list verified against `agents/orchestrator.md` `## Human Gate Rules`.
- 16 agents / Circle-container layout — consistent with the just-rewritten `docs/philosophy.md` and `README.md`.

## Deliberate non-duplication (cross-linked, not repeated)

- **philosophy.md** owns the "why" (design rationale, the five pillars). This doc points at it for rationale and does not restate the pillars.
- **README.md** owns install/setup/first-session/best-practices. This doc points at it for hands-on steps and for the portfolio-capture detail rather than re-explaining them.
- **README-hooks.md** owns guard config depth (fields, sensitivities, thresholds, halt clearing). This doc gives the block-vs-warn model in prose and defers config depth to it, and to the README's "Tuning or disabling the compliance guard" section for the on/off spectrum.
- **fusion-workbench-conventions.md** owns the exact layout + templates. This doc gives the working-level view and points there for the precise definitions.

## Scope

Owned and wrote exactly `docs/working-model.md`. Did NOT add the cross-reference pointers *into* philosophy.md / README.md — those are Turn 2 (plan step 5) and out of this Turn's scope. Outgoing links from working-model.md into those docs are one-directional and require no edit to the targets.

No defects found requiring an issue.
