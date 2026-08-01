# Plane mirror integration — Circle 2 (C3 + C4)

---
**Domain:** code
**Status:** closed
**Filed by:** orchestrator (user request "run one circle for the Plane mirror", 2026-07-19)
**Active spec/plan:** cites the existing spec (see Grounding); the per-Circle implementation plan is produced by the planner now that the Circle is active
**Active session history:** shared/history/260719-1632-orchestrator-session.md

---

## Directive

Install, implement, and test a **Plane bridge** for fusion's work queue — reshaped from a pure one-way mirror to a **bounded bridge** (variant b), per the user's decision of 2026-07-19.

The continuous channel is a **push-only, idempotent mirror**: fusion's work items (Circles, issues, decisions) appear in a Plane project (plane.so) as a secondary, read-along view, and fusion stays fully operational when Plane is unreachable — rebuilding the mirror from files and never failing silently. This is capability **C3** (the work queue appears in Plane) and capability **C4** (fusion stays operational offline), unchanged from decisions D1 and D3.

In addition, the bridge provides **exactly one bounded read path**: on explicit user command, seed a new Circle from a named Plane issue by reading that issue's description once and writing it straight into the new Circle's Grounding, after which the files are the source of truth and Plane is not consulted about that Circle again. This one-shot seeding read refines D1 (it does not overturn it): "push-only" and "files = source of truth" are separate invariants, and materialising a read into a file immediately keeps files authoritative while relaxing only the stricter push-only implementation choice.

The Circle **reuses Martin's verified self-hosted Plane integration primitives** rather than reinventing them (source: `/Users/kai/Dropbox/qboot/projects/F03_digital-leadership/unite-co-creator/MARTIN.md`): the `$PLANE_API_KEY` handling with the `zsh -ic "..."` wrapper (the non-interactive shell does not inherit the key otherwise), runtime `states/` resolution (never hardcode state IDs; this also maps fusion markers to Plane states), the issue-links endpoint (`issues/{id}/links/`, verified reachable on self-hosted), `sequence_id`→UUID resolution (the human handle the seeding command takes and the reusable half of the file↔Plane-ID idempotency map), and the absent-key / Plane-down fallback doctrine ("print the exact transition and let the human do it in the UI" — C4's "never silently broken" made concrete).

**Out of scope:** continuous bidirectional sync; a conflict model; webhooks (the seed reads on explicit command, so Plane's double-webhook problem, makeplane/plane#7249, never arises); Plane as the authoritative work queue; and prose documents in Plane (the Pages API is unreachable on self-hosted instances, makeplane/plane#8986 — session logs, reviews, and analyses stay as files; only the work queue bridges).

Its prerequisite, Circle 1 (the Circle-container restructure), is complete — its stable Circle directory names are the immutable natural keys the mirror's idempotency relies on.

## Grounding snapshot

The integration is shaped and now **reshaped from the pure mirror to the bounded bridge (variant b)** on the strength of a feasibility analysis the user accepted. The original spec was written, conceptrev-clean, and its four framing decisions stand; one of them (D1) is refined, not overturned.

**The reshape (2026-07-19):**

- **Feasibility + convergence analysis** (primary input for this reshape): `shared/analyses/260719-2141-plane-mirror-martin-convergence-feasibility.md`. It compares fusion's planned push-only mirror with Martin's verified two-way, story-driven Plane workflow, shows that "push-only" and "files = source of truth" are separable invariants, and recommends variant b (bounded bridge). Its §5 holds the Variant B Directive this record now carries; its §4 holds the reuse list.
- **Martin's verified integration** (the reuse source, and live proof the same self-hosted Plane is reachable for issues/states/links/comments): `/Users/kai/Dropbox/qboot/projects/F03_digital-leadership/unite-co-creator/MARTIN.md`. Convergence with his `/new-fe-feature` seed-from-story habit is why the bounded read path exists; adopting his primitives is why the Circle does not reinvent them.
- **D1-refinement — answered (b), bounded bridge.** The user chose the bounded read path over the pure mirror. `shared/decisions/260719-2141_a_plane-rolle-push-only-vs-bounded-readback-martin.md` (now marked answered `_a_`). This refines, does not supersede, D1.

**The framing decisions that still stand:**

- **D1 — Plane's role → mirror, refined to bounded bridge.** Files + git stay the source of truth; the one seeding read is materialised into a file and then inert. `shared/decisions/260716-1847_a_plane-rolle-source-of-truth.md` (refined by the D1-refinement above).
- **D3 — offline behaviour → keep working.** fusion works without Plane; the mirror is rebuilt/re-synced later; a failure is never silent. The seeding read reuses this doctrine as its own fallback. `shared/decisions/260716-1847_a_offline-verhalten-bei-plane-ausfall.md`.
- **D2 — Circle-container layout** (done, Circle 1). **D4 — two Circles, restructure first** (this is the second). `circles/260716-1847-workbench-umbau/decisions/260716-1847_a_zuschnitt-umbau-und-plane-ein-oder-zwei-circles.md`.

Spec (cite where it lives, per the Origin Rule — do not copy): `circles/260716-1847-workbench-umbau/planning/260716-1847_o_spec-plane-integration-und-workbench-struktur.md`. Its conceptrev: `circles/260716-1847-workbench-umbau/reviews/260716-1853-conceptrev-spec-plane-integration-...md`. The spec's C3/C4 backbone and its "Open for Planner" list are unchanged and remain the plan's opening agenda; the reshape adds the seeding-read command and the MARTIN.md reuse list as first-class plan items.

**Concurrency — resolved: NOT supported (Option 3).** Per the user's decision of 2026-07-19, fusion does not support concurrency; it stays single-active-Circle with no concurrency lock. The Plane bridge is delivered; parallelism is explicitly out of scope. Martin's N parallel worktree slots remain his own mechanism outside fusion's guarantees (the advisory single-orchestrator warning applies). No worktree-isolation verification is needed — Option 1 is not relied upon. `shared/decisions/260719-2141_a_concurrency-worktree-slots-vs-single-active-circle.md` (answered `_a_`). This was the last activation blocker; it is cleared.

**Known Plane facts (from the spec, verify at planning):** REST API ~180 endpoints (Projects, Work Items, Cycles, Modules, Labels, States, Comments, Links), `X-API-Key` auth, webhooks. Two binding constraints: 60 requests/min per client; the Pages API is unreachable on self-hosted instances over public REST (makeplane/plane#8986) — so prose docs (session logs, reviews, analyses) stay as files, only the work queue bridges. Martin's file confirms issues/states/links/comments ARE reachable on the same self-hosted instance, so the spec's split (prose→files, work-queue→Plane) sits in the right place.

**Open for the per-Circle plan** (from the spec's "Open for Planner"): artifact-type → Plane-object mapping; the transfer mechanism (timing in the Turn loop, file↔Plane-ID mapping, idempotency so a twice-run transfer creates no duplicates — this is why Circle directory names are stable natural keys); double-webhook handling (makeplane/plane#7249) if any read-back is added; the API-key-from-env requirement; what "install" covers (a Plane instance — self-host vs cloud — and the API key).

## Dependencies

- Circle 1 (workbench-container restructure) — DONE (`circles/260716-1847-workbench-umbau/`, closed `_c_`). The stable Circle directory name is the immutable natural key the mirror's idempotency relies on.
- **Concurrency — resolved (not a blocker).** Per the user's decision of 2026-07-19, fusion does NOT support concurrency (single-active-Circle, no concurrency lock); parallelism is out of scope for this Circle. `shared/decisions/260719-2141_a_concurrency-worktree-slots-vs-single-active-circle.md` (answered `_a_`, Option 3). Martin's parallel worktree slots stay his own mechanism outside fusion's guarantees. No worktree-isolation verification remains for the planner.
- D1 + D3 answered; the D1-refinement (bounded bridge, variant b) is answered `_a_` (`shared/decisions/260719-2141_a_plane-rolle-push-only-vs-bounded-readback-martin.md`); D2 + D4 realised.

## Turn log

(none yet — anticipated; on activation: shaper portfolio-activation refreshes this Grounding snapshot against the current v5.4.0 tree, then the planner produces the C3+C4 implementation plan.)

## Closure note

Closed **coherent** on 2026-07-20 (reconciler verdict; no Rebalance). The Plane bounded bridge (variant b) is implemented in the fusion plugin source and offline-proven. Artifact = 6 commits on `main` (`eb9cf59`..`aefbf39`): `bin/fusion-plane` (push/plan/states/doctor/map/seed) with an idempotent `reconcile(circle)` core and the C4 never-silent offline doctrine; the `/fusion:seed-from-plane` bounded read; orchestrator wiring at the three transition points; install surface + docs; a vitest dry-run suite (`npm test` 284/284) with lint guards (no state-UUID literal, no key-in-config). `claude plugin validate .` passes. Three-edge Coherence in `shared/history/260719-1632-orchestrator-session.md` `## Coherence`.

**Two follow-ups tracked for go-live (not implementation debt, deliberately left open):**
- Issue `issues/260719-2304_o_verify-plane-create-patch-body-against-live-instance.md` — verify the create/PATCH body fields + `states/` envelope against a live Plane instance (none reachable this session; tests are offline by plan design). The DR-1 links fallback keeps the mirror safe if the `parent` path fails.
- Decision `decisions/260719-2313_o_round-trip-write-overwrites-origin-story-description.md` — a seeded issue's push-back must not overwrite the human's original story description (recommend Option 1: state-only for seeded issues). User's design call.

## Activation proposal

**Recommended as the next Circle — playmaker run 260719-1538 (trigger: orchestrator-phase4, portfolio refresh after the v5.x umbrella Circle closed coherent).**

Ranked first of the two anticipated Circles under the code-domain heuristic. Its `## Dependencies` names exactly one prerequisite — Circle 1, `260716-1847-workbench-umbau` — which closed `_c_` (coherent) on 2026-07-17, so the dependencies-closed check is clean. Its `## Grounding snapshot` cites zero open (`_o_`) decisions: D1 (Plane's role → mirror) and D3 (offline → keep working) are answered (`_a_`), and D2 + D4 are implemented. Fewest unresolved decisions plus an all-`_c_` dependency set is exactly what the code bias prioritises, and it also carries the most unblock value — this is the second and final Circle of the 2026-07-16 two-Circle spec, whose first Circle (the container restructure) shipped specifically to give the mirror the stable natural key its idempotency relies on. The user's stated priority ("firstly run one circle aiming at the plane mirror") agrees with the merit-based ranking; the recommendation does not rest on preference alone.

**Suggested activation timestamp:** 260719-1538 (or whenever the user activates).

**Activation note (does not change the ranking):** on activation, shaper in portfolio-activation mode should refresh this Grounding snapshot against the current v5.4.0 tree before the planner produces the C3+C4 implementation plan. The spec's "Open for Planner" list (artifact-type → Plane-object mapping, the transfer mechanism and its timing in the Turn loop, file↔Plane-ID idempotency, double-webhook handling if read-back is added, the API-key-from-env requirement, and the scope of "install") is the plan's opening agenda. The two Plane constraints from the spec still stand: 60 requests/min per client, and the Pages API is unreachable on self-hosted instances — so only the work queue mirrors; prose docs stay as files.

*No `mv` and no `.active-circle` write by playmaker — the user confirms via `/fusion:next` (or the orchestrator activates). Proposal, not commitment.*

## Activation proposal

**Recommendation reaffirmed — playmaker run 260719-2054 (trigger: orchestrator-phase4, portfolio refresh after the B-rest unite-co-creator Circle closed coherent).**

The 260719-1538 proposal above still holds; nothing in the ranking basis changed. One board update: the sibling anticipated Circle `260719-1536-brest-unite-co-creator-conversion` closed `_c_` (coherent) on 2026-07-19, so this is now the **sole** anticipated Circle, not the first of two. The code-domain check is unchanged and clean — zero open (`_o_`) decisions in the Grounding snapshot (the two Plane framing decisions are `_a_`-answered, D2/D4 implemented) and the one dependency, `260716-1847-workbench-umbau`, is closed `_c_`. On activation, shaper (portfolio-activation mode) refreshes the Grounding against the current v5.4.0 tree before the planner produces the C3+C4 plan.

*Proposal, not commitment — no `mv`, no `.active-circle` write by playmaker.*
