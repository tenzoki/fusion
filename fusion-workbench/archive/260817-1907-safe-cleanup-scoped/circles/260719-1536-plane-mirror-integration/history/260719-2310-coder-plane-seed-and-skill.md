# History — coder — Plane bounded seeding read (plan Step 5)

**Date:** 2026-07-19
**Circle:** 260719-1536-plane-mirror-integration
**Plan:** 260719-2223_*_plan-plane-bounded-bridge.md — Step 5
**Status:** Complete

## What was implemented

Step 5 of the Plane bounded-bridge plan: the one bounded seeding read.

### `bin/fusion-plane seed` (replaced the stub)

Two-phase design so the map key can be the not-yet-created Circle's stable directory name:

- **Phase A — `seed <seq>`**: resolves `sequence_id`→issue UUID via Martin's verified `GET issues/?per_page=100 | jq 'select(.sequence_id==$s)'` lookup, GETs the issue title+description **once**, emits them + `origin_plane_id` as JSON on stdout. Writes nothing to the map (the Circle key does not exist yet).
- **Phase B — `seed --record-origin <circle-dir> <origin-plane-id>`**: pure map write (no network). Records the origin UUID under the Circle's stable directory-name natural key with empty `last_state`, so the first `push --circle` syncs the origin story to the marker state and later pushes land on the same story (closes the round-trip).
- **Dry-run seam — `seed --plan --fixture <captured issue JSON>`** (also `FUSION_PLANE_SEED_FIXTURE` / `FUSION_PLANE_DRYRUN=1`): identical lookup+extract jq against a fixture, no curl. Same seam shape as `push --plan`. This is what Step 8 tests.
- **C4 never-silent fallback**: absent key / Plane-down / HTTP error prints the issue board URL + exact fetch command (human-readable to stderr, machine JSON to stdout), returns `EXIT_DEFERRED` (10). Non-numeric / not-found seq returns `EXIT_USAGE` (2) with a clear message. Never crashes.

Reused verbatim from the existing helper: `resolve_workbench`, `cfg_load`/`build_base`/`config_valid`, the `zsh -ic` key wrapper (`plane_curl`, `plane_key_present`), `map_ensure`/`map_set`, `issue_web_url`, exit-code vocabulary. No key/config/map machinery reimplemented.

### `skills/seed-from-plane/SKILL.md` (new — `/fusion:seed-from-plane <seq>`)

Modeled on the sibling `/fusion:direct`. Flow: pre-flight paths → `bin/fusion-plane seed <seq>` bounded read → feed fetched title+description into the existing `/fusion:direct`→`shaper` anticipated-Circle path (DR-2: `_a_`, never `_t_`) → Phase B `--record-origin` binds the round-trip. Deferred path relays the manual-paste fallback and proceeds into the same creation path. Never silent, never blocked.

## Not done (out of scope for this step)

- No edit to `agents/orchestrator.md` (Step 6) and no tests added (Step 8) — per task.
- Not committed (orchestrator commits).

## Verification

- `bash -n bin/fusion-plane` clean; `+x` preserved.
- Exercised in a scratch fixture workbench: `seed --plan --fixture` (ok JSON with extracted description + origin UUID), `--plan` without fixture (usage error), non-numeric seq (usage error), unknown seq (usage error), `--record-origin` (map entry with empty `last_state`), live unreachable/absent-key (deferred JSON, exit 10, never silent). Real workbench left untouched (tests used `FUSION_PLANE_WORKBENCH`).
- `fusion-paths seed-from-plane` resolves cleanly (WORKBENCH, CIRCLE, OUT_CIRCLE).
- No UUID/state-ID literal in `bin/fusion-plane` (no-hardcoded-state invariant intact).
- `claude plugin validate .` passes (only the pre-existing CLAUDE.md-at-root warning).
