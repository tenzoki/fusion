# How do fusion issues and decisions attach to their Circle in Plane — child sub-issues, flat issues plus links, or one issue with labels only?

---
**Domain:** code
**Status:** implemented
**Filed by:** planner
**Cross-references:** 260719-1536-plane-mirror-integration (the Directive this serves), 260719-2223_*_plan-plane-bounded-bridge.md (the plan — Step 3 depends on this answer), 260719-2141-plane-mirror-martin-convergence-feasibility.md §2 (unit-granularity mapping, "no 1:1"), /Users/kai/Dropbox/qboot/projects/F03_digital-leadership/unite-co-creator/MARTIN.md (issue-links endpoint, verified reachable)

---

## Question

The plan resolves the artifact-type mapping as: every fusion work-queue artifact — a Circle, a fusion issue, a decision — becomes exactly one Plane issue, distinguished by a Plane label (`circle` / `fusion-issue` / `decision`). What stays genuinely open is **how a Circle's issues and decisions are attached to the Circle in Plane**, because Plane offers three shapes and the analysis found no forced 1:1 (a Circle is coarser than a Plane issue, a fusion issue is finer). The choice sets the Plane board's readability and the call/lookup cost per reconcile, and it is a user- and Martin-facing UX decision, so the planner should not settle it unilaterally.

## Options

1. **Child sub-issues (parent field).** The Circle is a parent Plane issue; each fusion issue and decision is a Plane issue with its `parent` set to the Circle's Plane UUID (resolved from the natural-key map). Label distinguishes kind.
   - Pros: the board mirrors fusion's containment exactly — expand a Circle, see its issues and decisions nested. Closest to how a reader thinks about a Circle. One query per reconcile shows the whole Circle.
   - Cons: every child create/update needs the parent UUID resolved first (one extra map lookup, already cheap). Sub-issue support and its API shape must be verified on the self-hosted instance (MARTIN.md verifies issues/states/links/comments, not the `parent` field specifically).

2. **Flat issues plus links.** Circle, issues, and decisions are all top-level Plane issues; the Circle issue carries a link (via the verified `issues/{id}/links/` endpoint) to each of its issues and decisions.
   - Pros: uses only endpoints MARTIN.md already verified reachable on the self-hosted instance — lowest integration risk. Links are the reuse-proven primitive.
   - Cons: no visual nesting on the board; the relationship is a list of links, not a hierarchy. A Circle with many issues clutters the top level.

3. **Labels only, no relation.** Every artifact is a top-level Plane issue tagged with its Circle's directory name as a label plus a kind label. No parent, no links.
   - Pros: simplest to build and to keep idempotent; the natural key is already the Circle name. Zero relation calls.
   - Cons: association is by label filter only — no click-through from a Circle to its issues. Weakest for a human reading along, which is the whole point of C3.

## Constraints

- The stable Circle directory name is the natural key for idempotency (unchanged by this choice; it is the label or the parent-issue identity in every option).
- 60 requests/min/client — sub-issues add one parent-lookup per child (map-cached, so ~0 extra network calls); links add one POST per relation. Both stay well under the limit for a normal Circle.
- Whatever is chosen must be reconstructible from files on rebuild (C4) — all three options are, because the relation is a pure function of which files sit in which Circle directory.
- Reuse MARTIN.md primitives where possible; the links endpoint (Option 2) is verified, the `parent` field (Option 1) is not yet.

## Recommendation

**Option 1 (child sub-issues), contingent on a one-call verification that the self-hosted instance accepts the `parent` field on issue create/update.** It is the only option that makes the Plane board read the way a Circle actually is — a container of issues and decisions — which is precisely what C3 ("read along in Plane") is for. The extra parent-UUID resolution is a map lookup fusion already does for idempotent push, so it adds no network cost. If the verification fails (the self-hosted build rejects or ignores `parent`), fall back to **Option 2 (flat plus links)** with no plan change beyond swapping the attach call — the links endpoint is already verified, and Step 3 of the plan is written so the attach mechanism is a single swappable function. Option 3 is the honest minimum if the user wants the smallest possible surface and accepts label-filtering instead of click-through.

---
Answered:
Implemented:
Deferred:
Superseded by:

---
Answered: user approved the plan gate with recommended defaults (session 260719-1632-orchestrator-session.md) — **child sub-issues**: each Circle is a parent Plane issue; its fusion issues and decisions attach as child sub-issues. Fallback to the MARTIN-verified issue-links endpoint (`issues/{id}/links/`) where sub-issue creation is unavailable on the self-hosted instance. Realised in the plane bounded-bridge plan (this Circle's planning/).

Implemented: `982336f` (Step 3, reconcile core) — the attach is a single swappable function (`attach_child` in `bin/fusion-plane`) with the child sub-issue `parent` field as the default and the verified `issues/{id}/links/` endpoint as the fallback, exactly as chosen. Verified by reconciler 2026-07-19: DR-1 attach tests green in `hooks/lib/__tests__/fusion-plane.test.ts` (child-attach for sub-artifacts, no parent for the Circle record, null parent for shared/). Note: the *live* acceptance of the `parent` field on the self-hosted instance is tracked separately by open issue `260719-2304_*_verify-plane-create-patch-body-against-live-instance.md` — the fallback path makes this decision safe regardless of that outcome.

---
Retired: `d0ddabb` + `7c12d6a` (steps 2 and 3 of 260815-0029_*_plan-remove-eight-mechanisms-and-cap-growth.md) — the whole Plane mirror left the plugin: `bin/fusion-plane`, `templates/plane.config.yaml`, `docs/plane-setup.md`, the runtime `.plane-map.json`/`.plane-outbox.jsonl` and the fixtures. There is no mirror left to attach an issue or a decision to, so the sub-issue-plus-link data model this record chose has no subject. The choice is not reversed; the thing it shaped is gone.
