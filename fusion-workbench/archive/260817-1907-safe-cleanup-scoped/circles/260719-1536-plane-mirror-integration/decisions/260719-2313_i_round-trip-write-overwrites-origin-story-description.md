# When a seeded Circle pushes back, should the mirror overwrite the origin Plane story's description with fusion's mirror body?

---
**Domain:** code
**Status:** implemented
**Filed by:** orchestrator (raised by coder during Step 5)
**Cross-references:** circles/260719-1536-plane-mirror-integration/planning/260719-2223_*_plan-plane-bounded-bridge.md (Step 3 build_write_body, Step 5 seed round-trip); shared/decisions/260719-2141_*_plane-rolle-push-only-vs-bounded-readback-martin.md (the bounded-bridge decision this refines)

---

## Question

The seeding read closes a round-trip: seed a Circle **from** a Plane story, work, then `push` fusion's state **back** to that same story (the map records the origin UUID under the Circle's key). But `bin/fusion-plane`'s `build_write_body` (committed in the core, `982336f`) PATCHes the issue's `description_html` with fusion's own "Mirrored fusion circle…" body. For a normally-mirrored Circle that is correct — fusion owns the issue. But for a **seeded** issue that originated as a **human's story description** (Martin's use case), the first push would **overwrite Martin's original story text** with fusion's mirror body. That is almost certainly not wanted: the human wrote that story.

## Options

1. **Push writes state only for seeded issues; never touches description.** The map already knows an issue is seed-origin (it was created via `seed --record-origin`, not via a fusion POST). For those, `push` PATCHes `state` (+ maybe a status label) but leaves `description_html` alone. fusion-owned issues (created by fusion's POST) keep full-body mirroring.
   - Pros: preserves the human's story; smallest surprise; the map already carries the origin flag needed to branch. Cons: two write shapes (owned vs seeded), one `if`.
2. **Push appends a fusion status block to the origin description** (fenced region it owns and rewrites), leaving the human's text above it.
   - Pros: story + live fusion status in one place (Martin sees progress on his story). Cons: description edit-war risk if the human also edits; needs a stable delimiter; more fragile.
3. **Push posts a comment for status, never edits seeded descriptions** (Martin's own flow posts closing comments).
   - Pros: matches Martin's verified `issues/{id}/comments/` habit; zero description contention. Cons: another endpoint (comments body unverified in MARTIN.md, see issue 260719-2304); status spread across comments.

## Constraints

- Must not silently destroy human-authored content (this is the whole reason the item is filed).
- The map already distinguishes seed-origin from fusion-owned issues — the branch is cheap.
- The comments-body shape is not yet verified against the live instance (issue 260719-2304).

## Recommendation

Option 1 for correctness now (state-only writes for seeded issues, full mirror for fusion-owned), with Option 3's closing comment as a later add-on once the comments body is verified. It is the one that cannot destroy the human's story. Resolve at Step 6 (orchestrator wiring) or before the first real round-trip push.

---
Answered: user chose **Option 1** (session 260719-1632, follow-up on 2026-07-20) — push writes state only for seed-origin issues and never touches their title or description; fusion-created issues keep the full mirror body.
Implemented: `a7eccbe` — durable `origin` field (`seed`|`fusion`) in `.plane-map.json`, preserved across updates (without preservation the first push would relabel a seeded entry and the second would overwrite the story); one branch point sets `write_scope`; entries lacking `origin` resolve to `fusion` so existing maps are unchanged; `--plan` exposes `write_scope`/`writes`. 6 new tests, `npm test` 290/290. Documented in `docs/plane-setup.md` `## First run` (`c605626`).
Deferred:
Superseded by:

---
Retired: `d0ddabb` + `7c12d6a` (steps 2 and 3 of circles/260815-0007-remove-eight-mechanisms-and-cap-growth/planning/260815-0029_c_plan-remove-eight-mechanisms-and-cap-growth.md) — the durable `origin` field this record's answer added lived in `.plane-map.json`, which went with the mirror's code and data. There is no round-trip write left to preserve an origin story's description against.
