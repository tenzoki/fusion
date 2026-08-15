# When the seeding read creates a Circle from a Plane issue, does the Circle enter as anticipated (user activates later) or straight to active (Martin-style In Progress)?

---
**Domain:** code
**Status:** implemented
**Filed by:** planner
**Cross-references:** circles/260719-1536-plane-mirror-integration/_c_circle.md (the bounded read path in the Directive), circles/260719-1536-plane-mirror-integration/planning/260719-2223_*_plan-plane-bounded-bridge.md (Step 5, the seeding-read skill — depends on this answer), /Users/kai/Dropbox/qboot/projects/F03_digital-leadership/unite-co-creator/MARTIN.md (`/new-fe-feature` moves the story straight to In Progress), shared/analyses/260719-2141-plane-mirror-martin-convergence-feasibility.md §2 (activation mapping "breaks" — Martin reads to seed; fusion activates from files)

---

## Question

The one bounded read path — seed a new Circle from a named Plane issue — materialises the issue description into a Circle's Grounding and then never reads Plane about it again. The open question is which state the new Circle enters. Martin's `/new-fe-feature <seq>` moves the Plane story to In Progress immediately and starts work. fusion's normal flow prefers a gate: an anticipated Circle (`_a_`) that the user (or playmaker/`/fusion:next`) promotes to active (`_t_`) through the shaper's portfolio-activation path. The seeding read sits exactly on this fork, and the answer decides whether the command reuses the existing `/fusion:direct` machinery (anticipated) or the activation machinery (straight to active).

## Options

1. **Anticipated (`_a_`), reuse `/fusion:direct`.** The skill fetches the Plane issue description and hands it to the shaper in anticipated-circle mode, producing an `_a_` Circle whose Grounding is seeded from the issue. The user later activates it the normal way.
   - Pros: reuses the existing `/fusion:direct` → shaper path verbatim — smallest new surface, no new activation code. Keeps fusion's activation gate intact (a human still decides when work starts). Multiple stories can be seeded into the portfolio and ranked by playmaker.
   - Cons: one extra step versus Martin's habit — he expects seeding to also start the work. The Plane issue would move to In Progress only at the later activation, not at seed time.

2. **Active (`_t_`), Martin-style.** The skill seeds the Grounding and immediately activates the Circle (writes `.active-circle`, marker `_t_`), and the first push moves the origin Plane issue to In Progress — matching `/new-fe-feature` one-for-one.
   - Pros: exact ergonomic parity with Martin's most-used entry point; seed-and-go in one command. The origin story reflects "in progress" the moment work starts.
   - Cons: bypasses the activation gate and the shaper's Grounding refresh. Because fusion is single-active-Circle, seed-to-active must refuse (or stash) when another Circle is already active — extra guard logic. Larger new surface.

## Constraints

- fusion is single-active-Circle with no concurrency lock (user decision, Option 3, `shared/decisions/260719-2141_a_concurrency-worktree-slots-vs-single-active-circle.md`). Any straight-to-active path must handle "a Circle is already active" without corrupting `.active-circle`.
- The seeded Circle's future pushes must land on the SAME origin Plane issue (the natural-key map records the origin UUID at seed time) — true under both options; only the timing of the first In-Progress push differs.
- The read is one-shot and materialised into files; after seeding, Plane is not consulted about that Circle again (unchanged by this choice).

## Recommendation

**Option 1 (anticipated, reuse `/fusion:direct`)** as the default, because it reuses an existing, tested path and keeps the activation gate that single-active-Circle depends on — seed-to-active would have to reimplement the "already active" guard the orchestrator already owns. Martin's seed-and-go can be offered later as a thin convenience (`--activate`) once single-active-Circle interplay is confirmed, without reopening this decision. If the user weights Martin's parity above the smaller surface, Option 2 is legitimate but pulls the activation guard into the skill.

---
Answered:
Implemented:
Deferred:
Superseded by:

---
Answered: user approved the plan gate with recommended defaults (session 260719-1632) — the seeded Circle enters as **anticipated (`_a_`)**, reusing the `/fusion:direct` capture path; the user activates it later. Not straight-to-active. Realised in the plane bounded-bridge plan (this Circle's planning/).

Implemented: `bd62bf1` (Step 5, seeding read) — `skills/seed-from-plane/SKILL.md` hands the fetched Plane title+description to the existing `/fusion:direct` → shaper path, producing an anticipated `_a_` Circle; `bin/fusion-plane seed` records the origin UUID under the new Circle's natural key so later pushes land on the same origin story. No straight-to-active path was built. Verified by reconciler 2026-07-19: seed-extraction + origin-UUID-record tests green in `hooks/lib/__tests__/fusion-plane.test.ts`.

---
Retired: `d0ddabb` (step 2 of circles/260815-0007-remove-eight-mechanisms-and-cap-growth/planning/260815-0029_c_plan-remove-eight-mechanisms-and-cap-growth.md), completed by `1e29572` (step 12) — the seeding read left with the mirror and `/fusion:seed-from-plane` left with the administrative-surface collapse. No path now creates a Circle from a Plane issue, so the anticipated-versus-active question this record settled has no caller.
