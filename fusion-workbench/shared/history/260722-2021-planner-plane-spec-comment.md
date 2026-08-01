# Planner — Plane bridge opt-in spec-comment

**Date:** 2026-07-22 20:21
**Agent:** planner
**Input spec:** `shared/planning/260722-1943_o_spec-plane-spec-comment.md`
**Output plan:** `shared/planning/260722-2021_o_plan-plane-spec-comment.md`

## What was planned

Implementation plan for the approved `spec_comment` opt-in on `bin/fusion-plane`: an
idempotent, marker-keyed Plane comment carrying the full Circle record body, default off,
non-blocking, description untouched. Five dependency-ordered, independently-committable steps,
all assigned to a single `coder` (code-led change; template/plugin.json edits coupled to the
code + its vitest lint guards).

## Planner-owned technical resolutions (spec "Open for Planner")

- **Comment insertion**: single live call site via a `state_ok` tail after restructuring the
  noop early-return (`bin/fusion-plane:626`) into an `if [ "$op" != "noop" ]` wrapper. Fires on
  create/update 2xx **and** noop; never on a defer path (C4 preserved).
- **Noop-refresh**: comment fires on every non-deferred Circle push including a state noop —
  grounded in decided fork 1 ("fire on every push"; Martin's anticipated-brief edit is a noop).
- **Dry-run representation**: a separate `{op:"spec-comment", …}` op entry (not an `op_json`
  field) — the only shape that survives the noop case and leaves the ~20 existing op-shape
  assertions untouched.
- **Escaping**: jq `@html` (verified: single ampersand-first pass, marker outside the `<pre>`).
- **Fixture seam**: `--comments-fixture` / `FUSION_PLANE_COMMENTS_FIXTURE` (`--fixture` already
  taken by rebuild-map on push).
- **Endpoints** (confirmed against `$BASE`): GET/POST `…/issues/<id>/comments/`, PATCH
  `…/issues/<id>/comments/<comment_id>/`; list uses `?per_page=100`.
- **Note placement**: `COMMENTS_SKIPPED` counter folded into the STATUS line like `LABELS_SKIPPED`.
- **Decision record** placement: `circles/260719-1536-plane-mirror-integration/decisions/` per
  the Origin Rule (continuation of decision 260719-2313).

## Notes

No issues or blocking decisions surfaced. One non-blocking bound noted (>100 comments →
possible duplicate), consistent with the bridge's existing `per_page=100` paths. Plan carries
two Mermaid diagrams (live control flow; step DAG) for the conceptrev gate.
