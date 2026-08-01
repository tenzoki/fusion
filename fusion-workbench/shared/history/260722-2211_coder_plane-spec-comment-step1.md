# History: Plane spec-comment — Step 1 (primitives + gate + fixture seam)

**Date:** 2026-07-22
**Agent:** coder
**Status:** Complete
**Plan:** `shared/planning/260722-2021_p_plan-plane-spec-comment.md` (Step 1 only)
**Spec:** `shared/planning/260722-1943_o_spec-plane-spec-comment.md`

## Scope

Step 1 only — dormant primitives added to `bin/fusion-plane`. NO wiring into
`process_artifact` (that is Step 2). Zero behaviour change: every new symbol is
unreferenced until Step 2.

## Changes (`bin/fusion-plane`, only file touched)

- `COMMENTS_SKIPPED=0` — global (`:392`), in a new "Spec-comment" section after the labels section. [C4-3]
- `spec_comment_enabled()` (`:396`) — `[ "$(cfg_get spec_comment)" = "true" ]`; absent/false ⇒ off. [C1]
- `build_comment_body <file> <key>` (`:404`) — the exact one-jq body: `@html`-escaped `<pre>` body + literal marker. [C3]
- `comment_skip <reason>` (`:415`) — mirrors `label_skip`: info + increment, no defer/outbox/exit change. [C4-3]
- `comment_id_for_marker <comments_json> <key>` (`:426`) — marker matcher; `(.results // .)` envelope, like `state_uuid`/`label_uuid`. [C2-3]
- `COMMENTS_FIXTURE=""` — global run-state (`:550`).
- `cmd_push` flag parse (`:948-949`) — `--comments-fixture <path>` / `--comments-fixture=…`, distinct from the rebuild `--fixture`.
- Env fallback (`:958`) — `FUSION_PLANE_COMMENTS_FIXTURE` → `COMMENTS_FIXTURE`. [C5-2]
- Reconciled the stale `--closure` block comment: it no longer claims the comment hook is "NOT implemented / body shape unverified"; now states it IS implemented as the `spec_comment` opt-in, fired on every push, not closure-gated. `--closure` stays an accepted no-op; no semantic change.

## Verification

- `bash -n bin/fusion-plane` → clean.
- `npm test` (in `hooks/`) → 309 passed (12 files). Includes `path-literal-lint`, `marker-format-lint`, and the 48-test `fusion-plane` suite — all green, confirming no UUID literal and no behaviour regression.

## Constraints honoured

bash + jq + curl only; no new dependency; no state/label/comment UUID literal in source; no Plane call added (pure helpers); `process_artifact`, the description write, and every exit-code path untouched.
