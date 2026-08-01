# History — ontocoder — Plane config surface + template (Plan Step 1)

**Date:** 2026-07-19T20:38Z
**Agent:** ontocoder
**Circle:** 260719-1536-plane-mirror-integration
**Plan:** planning/260719-2223_p_plan-plane-bounded-bridge.md — Step 1
**Status:** Complete

## Task

Author the Plane bridge config template (Plan Step 1): `templates/plane.config.yaml`,
the file a consuming project copies to `fusion-workbench/plane.config.yaml` (via
`/fusion:setup`, Step 7) and fills in for its own Plane instance.

## Files changed

- `templates/plane.config.yaml` (new) — the config schema + inline documentation.

## Field list (what bin/fusion-plane will consume, Steps 2+)

- `base_url` — Plane instance root (scheme + host only; helper appends
  `/api/v1/workspaces/<workspace_slug>/projects/<project_id>/...`).
- `workspace_slug` — URL-path slug (not the workspace UUID).
- `project_id` — target project UUID.
- `states:` — rename map, fusion-canonical name → instance state name. Keys are
  the fixed canonical set {Backlog, Todo, In Progress, Done, Cancelled} the
  marker→state tables produce; values are the names on the consumer's board.
  Resolved name→UUID at runtime via the `states/` endpoint (no UUID literals).
- `state_fallback:` — optional; canonical-name → ordered list of canonical
  fallbacks when the primary name is absent on the instance. Default
  `Cancelled: [Done]` per the plan's mapping table.

No `api_key`/`token`/`secret` field — key lives only in `$PLANE_API_KEY` (env),
read via `zsh -ic` (Martin's verified wrapper; MARTIN.md:62-119). Enforced by the
Step 8 lint guard (b).

## Alignment with Step 2 (bin/fusion-plane)

Field names match the plan's Data Structures block and MARTIN.md's verified
endpoint construction, so Step 2's config load + `states` resolution + `doctor`
read this template without renaming anything. Canonical state names match the
Step 1 mapping tables exactly; runtime `states/` resolution keeps UUIDs out of
config and code.

## Validation

- YAML parses (python `yaml.safe_load`).
- Top-level keys exactly {base_url, workspace_slug, project_id, states, state_fallback}.
- No api_key/apikey/token/secret/password field anywhere (key-in-env invariant).
- Canonical state key set = {Backlog, Todo, In Progress, Done, Cancelled}.

## Notes / scope guard

- Martin's specific workspace/project IDs NOT hardcoded (Step 1 did not authorize
  citing them as a worked example). Placeholders only; `plane.digitalleadership.com`
  cited illustratively in a comment as the self-hosted example.
- Only the file Plan Step 1 names was created. No later-step files touched.
- Not committed (staging left to the orchestrator).
