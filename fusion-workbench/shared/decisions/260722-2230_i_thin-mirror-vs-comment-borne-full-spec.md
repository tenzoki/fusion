# Thin mirror description vs. comment-borne full Circle spec — where does the full brief live?

---
**Domain:** code
**Status:** implemented
**Filed by:** orchestrator
**Cross-references:** circles/260719-1536-plane-mirror-integration/decisions/260719-2313_i_round-trip-write-overwrites-origin-story-description.md (the parent decision this continues — its Option 3 named this spec-comment as the planned next step); shared/planning/260722-1943_*_spec-plane-spec-comment.md (spec); shared/planning/260722-2021_c_plan-plane-spec-comment.md (plan)

---

## Question

The Plane bridge mirrors a Circle as a Plane issue whose description is a
deliberately thin stub: `Mirrored fusion <kind>` + fusion-key + source path
(`bin/fusion-plane:726`). A developer who opens the mirrored issue sees no brief.
Where should the full Circle spec live so a developer can read it in Plane, without
creating a source-of-truth conflict with the local Circle record?

## Options

1. **PATCH the full spec into the issue description.** Rejected: the next
   `fusion-plane push` rewrites the description back to the thin stub (the push always
   writes `description_html`), so the spec would be clobbered on every reconcile. It
   also collides with decision 260719-2313, which forbids overwriting a human-authored
   seed-origin story's description.
2. **Keep the description thin; carry the full brief in a Plane comment.** Chosen. The
   push writes only `name` / `description_html` / `state` and never touches comments
   (`build_write_body`), so a fusion-authored comment survives every re-push untouched.
   The comment is the one Plane surface with no source-of-truth contention against the
   description.
3. **Leave it thin; consumers fetch the brief locally.** This is the pre-existing
   behavior (and stays valid — the consumer-side `/new-fe-feature` fusion-key awareness
   does exactly this). But it does not help a developer reading the ticket in Plane, which
   was the stated need.

## Constraints

- The push must never overwrite a seed-origin (human-authored) story's description
  (decision 260719-2313).
- The bridge stays bash + jq + curl — no Markdown renderer, no new dependency.
- The comment write is auxiliary: it must never block or defer the state transition
  (the C4 offline doctrine), and it must be idempotent across re-pushes.
- Default off — zero behavior change for consumers who do not opt in.

## Recommendation

Option 2, realised as the `spec_comment` opt-in (default off). When enabled, every
non-deferred Circle push upserts the full Circle record body as one idempotent Plane
comment, keyed on an embedded marker `<!-- fusion-spec-comment:<key> -->` (GET comments,
marker-match, PATCH the match else POST). Body wrapped in `<pre>` and HTML-escaped
(jq `@html`). It applies to seed-origin and fusion-owned issues alike — a comment never
touches the description, so decision 260719-2313 is preserved rather than reopened. A
failed comment write is non-blocking (self-heals on the next push).

This is the planned continuation of decision 260719-2313 (its Option 3), unblocked by
the comments-endpoint body shape `{"comment_html": <html>}` being verified against a live
Plane instance (ticket #66).

---
Implemented: dd6b092 (docs/version) atop bf5dc5e (wiring) and 4d95a91 (primitives), tests d75afed — bin/fusion-plane `spec_comment` opt-in; the full Circle brief now rides in an idempotent, re-push-surviving Plane comment while the description stays a thin stub. 315 tests passing; plugin validates.
