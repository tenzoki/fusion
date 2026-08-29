# Session: Plane-mirror ↔ Martin convergence feasibility analysis

**Date:** 2026-07-19 21:41
**Agent:** analyst
**Status:** Complete
**Requested by:** user (to inform reshaping the anticipated Plane-mirror Circle)

## What was done

Feasibility + convergence analysis: can fusion's planned one-way Plane mirror converge with Martin's verified two-way, story-driven Plane workflow so that regular fusion becomes attractive to Martin while he keeps profiting from Plane?

Read in full: MARTIN.md (the verified running integration), the anticipated Circle record, the 2026-07-16 Plane spec, decisions D1/D3/D4, and the fusion Circle/marker conventions.

## Key conclusions

- Recommendation on Plane's role: **option (b) — bounded bridge**. Keep the push-only mirror (C3 + C4 unchanged) and add exactly one command-driven, one-shot seeding read (seed a Circle from a Plane issue), materialised into files immediately.
- Central insight: **"push-only" and "files = source of truth" are separable invariants.** D1 bundled them. A one-shot seeding read violates only push-only, not SoT, so it preserves the user's protected invariant while giving Martin activate-from-story.
- Self-hosted reconciliation: MARTIN.md proves issues/states/links/comments ARE reachable on self-hosted; only Pages is unreachable (#8986). Confirms the spec's split — no contradiction.
- Reuse (research gate): named 7 concrete pieces from MARTIN.md to reuse (key handling + `zsh -ic`, runtime `states/` resolution, issue-links, `sequence_id` lookup, closure write-back, absent-key fallback doctrine, config shape).
- Biggest adoption risk: worktree-slots (N parallel) vs single-active-Circle + no concurrency lock. Filed as a separate decision.

## Artifacts produced

- Analysis: `260719-2141-plane-mirror-martin-convergence-feasibility.md` (3 Mermaid diagrams: two-models, concept-mapping, recommended-(b)-architecture).
- Decision (open): `260719-2141_*_plane-rolle-push-only-vs-bounded-readback-martin.md` — refines (does not supersede) D1.
- Decision (open): `260719-2141_*_concurrency-worktree-slots-vs-single-active-circle.md`.

## Notes

- No Circle active — `.active-circle` absent, so all `$OUT_*` resolved into `shared/` (fusion-paths). Correct per Origin Rule (analysis was user-requested to inform a not-yet-active Circle).
- Setup note: `fusion-rules analyst` emitted no `stilwerk/` voice profile (neither `default-voice-*.yaml` nor `chat-voice-*.yaml`). Proceeded under `user-facing-output.md` alone per `agent-setup.md ## Voice profiles`. Report written in English (consistent with the Circle record and MARTIN.md; no `**Language:**` line declared in CLAUDE.md, defaults to en).
- Did not activate or reshape the Circle — that is a later shaper/orchestrator step.
