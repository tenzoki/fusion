# Coder — Plane spec-comment, Step 2 (wire into process_artifact)

**Status:** Complete
**Date:** 2026-07-22
**Plan:** `260722-2021_*_plan-plane-spec-comment.md` (Step 2)
**File touched:** `bin/fusion-plane` (only)

## What was implemented

Wired the Step-1 spec-comment primitives into `process_artifact`, dry-run and live.

1. **`upsert_spec_comment <file> <nk> <issue_id>`** (new, after `comment_id_for_marker`):
   GET `comments/?per_page=100` → match this Circle's marker via `comment_id_for_marker`
   → PATCH the matched comment or POST a new one. Every transport failure / non-2xx at
   either step calls `comment_skip` and `return 0`. Never defers, never touches the
   outbox, never changes the exit code. All calls through `plane_curl`; no UUID literal.

2. **Dry-run block:** after the existing `op_json` emission, emits a SEPARATE
   `{op:"spec-comment", natural_key, kind:"circle", marker, comment_html, method[, comment_id]}`
   op for `kind=circle` when the gate is on — independent of create/update/noop.
   `method`/`comment_id` resolved offline from `COMMENTS_FIXTURE` (match→PATCH+id, else POST).

3. **Live noop restructure:** replaced `[ "$op" = "noop" ] && return 0` with an
   `if [ "$op" != "noop" ]; then … else state_ok=1; fi` wrapper around the whole state-write
   section. `state_ok=1` is set in the `2*)` success branch and in the noop `else` only.
   Single tail after the wrapper:
   `if [ "$state_ok" -eq 1 ] && [ "$kind" = circle ] && spec_comment_enabled; then upsert_spec_comment "$file" "$nk" "$existing_id" || true; fi`.
   Gate is kind+enabled+state_ok — NOT write_scope, so seed-origin Circles still get the
   comment while their description stays untouched (decision 260719-2313_*_round-trip-write-overwrites-origin-story-description.md).

4. **STATUS summary:** `COMMENTS_SKIPPED > 0` appends an "N spec-comment(s) skipped" clause
   to the existing label/STATUS note.

## Invariants verified

- `state_ok` is a `local` initialised to 0 on every `process_artifact` call → cannot leak
  across `--all` iterations.
- Every defer path either `return 0`s before the tail (rate-limited, state-unresolved,
  create/patch no-network, create-no-id) or falls through with `state_ok=0` (429, other
  HTTP) → a deferred state write never reaches `upsert_spec_comment`.
- `existing_id` = new id after create, mapped id on update/noop (confirmed in code).
- `|| true` on the tail call disables set -e inside `upsert_spec_comment` so the internal
  `comment_skip` (returns 1) cannot abort the script — same guard `resolve_kind_label` uses
  around `label_skip`.

## Verification

- `bash -n bin/fusion-plane` → clean.
- `npm test` (in `hooks/`) → 309 passed / 12 files. No behavior change observable yet: the
  gate is off in the test fixture config; the spec-comment tests land in Step 3.

Not committed (orchestrator commits).
