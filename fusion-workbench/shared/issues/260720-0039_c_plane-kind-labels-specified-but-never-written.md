bin/fusion-plane never writes the kind label the plan specified

---
The Plane bounded-bridge plan's artifact→Plane-object mapping specifies that every mirrored artifact is "labelled by kind (`circle` / `fusion-issue` / `decision`)". The helper does not implement this: `build_write_body` sends only `{name, description_html, state}` plus `parent` when a parent exists. There is no `labels` field anywhere in `bin/fusion-plane` (verified: `grep -c '"labels"|labels=' bin/fusion-plane` → 0). The `kind` value exists only in `push --plan` output and in `.plane-map.json`, never on the Plane board.

---
Impact: a user cannot filter or distinguish fusion artifact kinds in Plane, which was part of C3's value ("the work queue appears in Plane" — as a usable view, not an undifferentiated pile). Two doc statements were false because of this and were corrected in `c605626`+ (the opening "labelled by kind" line and a "what worked" bullet); the implementation gap itself remains.

Fixing it needs a label name→UUID resolution step (Plane labels are referenced by UUID, like states), i.e. a `labels/` endpoint fetch cached per run, mirroring how `states/` is already resolved. Config would need the three label names (with the same rename-map shape the `states:` block uses) and a create-if-missing decision.

Cross-references: `circles/260719-1536-plane-mirror-integration/planning/260719-2223_c_plan-plane-bounded-bridge.md` (mapping table, agenda item 1); `circles/260719-1536-plane-mirror-integration/_c_circle.md`. Surfaced 2026-07-20 while making `docs/plane-setup.md` concrete.

---
Resolved: `4f6a3d2` — `labels:` rename map added to the config template; `resolve_kind_label` resolves name→UUID via `labels/` cached per run (mirroring `states/`, no hardcoded UUID) and creates a missing label once. Any label failure is named on stderr, counted in `STATUS:`, and the push continues unlabelled — a label never blocks a push. Seed-origin issues deliberately get no label (a label is also a modification of a human's story; decision 260719-2313 holds). Docs corrected. 6 tests. NOTE: the labels API shape (GET/POST `labels/`, the `labels` body field) is Plane-v1 inference, unverified live — same standing as issue 260719-2304; blast radius is bounded (a wrong assumption drops the label, the state transition still lands).
