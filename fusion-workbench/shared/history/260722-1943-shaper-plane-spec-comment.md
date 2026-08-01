# Shaper session — Plane bridge spec-comment capability

**Date:** 2026-07-22 19:43
**Mode:** user-direct (design forks pre-decided by user; no clarification round)
**Output:** `shared/planning/260722-1943_o_spec-plane-spec-comment.md`

## Request

Specify a new opt-in capability in `bin/fusion-plane`: on push, upsert the full Circle
record as an idempotent Plane comment (the deferred "Step 6" hook), now that Martin
verified the comments-endpoint body shape (`{"comment_html": <html>}`, marker-based upsert,
confirmed on ticket #66). All five design forks were pre-decided ("Accept all five"), so no
AskUserQuestion round was run.

## Grounding verified against code

- `bin/fusion-plane:726` — thin description body `Mirrored fusion <kind>. fusion-key/source`.
- `build_write_body` (`:707-732`) — writes name/description_html/state only, never comments;
  a fusion comment therefore survives every re-push (this is why the comment is the correct
  home for the full spec — no source-of-truth conflict with the description).
- `push --closure` (`:882-885`) — accepted no-op placeholder; its block comment named the
  comments-body shape as the sole blocker. Now cleared.
- Decision `circles/260719-1536-plane-mirror-integration/decisions/260719-2313_i_...` —
  Option 1 (seed-origin = state-only description writes) with Option 3 (this spec-comment)
  as the planned continuation once the comments body was verified. Respected: a comment
  never touches the description.
- C4 offline doctrine (header `:71-77`) and the kind-label non-blocking pattern
  (`:948-956`, `LABELS_SKIPPED`) — the model for the comment path's failure discipline.
- Test seam: dry-run/mock vitest (`hooks/lib/__tests__/fusion-plane.test.ts`, commit
  `aefbf39`), fixture injection pattern (`FUSION_PLANE_ISSUES_FIXTURE`). New capability
  must be testable the same way.

## Spec shape

5 capabilities: C1 opt-in `spec_comment` config field (default off, no CLI flag); C2
idempotent marker-based upsert (`<!-- fusion-spec-comment:<key> -->`, GET→match→PATCH-or-POST,
`{"comment_html": <html>}`); C3 `<pre>`-wrap + HTML-escape `& < >`; C4 non-blocking failure
(no outbox, no exit-code change, self-heals next push); C5 dry-run/mock testability with a
comments fixture seam. Mermaid push-flow diagram with the comment-upsert branch included.
Deliverables: bridge change, vitest, docs, version bump, decision record. Consumer-side
`/new-fe-feature` fusion-key awareness explicitly OUT OF SCOPE.

No user decisions deferred → no decision record filed by shaper.
