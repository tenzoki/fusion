The migration premise in the Circle-placement decision does not match the workbench

---

The answered decision `shared/decisions/260812-0254_*_where-do-a-circles-spec-and-plan-belong-when-the-circle-exists-before-them.md`
reasons from a state the workbench is not in. Its `## Answer` says: *"The existing twelve Circles
are migrated, not left. […] every session history, decision record and review that cites a spec
or plan in `shared/planning/` has to move with it."* That sentence assumes twelve Circles whose
specs and plans sit in the shared store. Measured on 260812: ten of the twelve already hold their
planning documents inside their own directories, and `shared/planning/` holds seven files in
total, six of which were written with no Circle active at all.

---

**What was measured, and how.**

Each spec and plan has a sibling session-history file written by the same agent run, under the
same `bin/fusion-paths` call, carrying the same `YYMMDD-HHMM` stem. Where that history file sits
is therefore a record of where `OUT_*` resolved at the moment of writing, and so of whether a
Circle was active. Checked for all seven files in `shared/planning/`, exactly one witness each:

| File stem | Sibling history | Circle active when written |
|---|---|---|
| 260717-1918 | `circles/260716-1847-workbench-umbau/history/260717-1918-planner-session.md` | yes — `260716-1847-workbench-umbau` |
| 260722-1943 | `shared/history/260722-1943-shaper-plane-spec-comment.md` | no |
| 260722-2021 | `shared/history/260722-2021-planner-plane-spec-comment.md` | no |
| 260801-1122 | `shared/history/260801-1122-shaper-normative-consolidation.md` | no |
| 260807-2024 | `shared/history/260807-2024-planner-two-language-declarations.md` | no |
| 260809-1229 | `shared/history/260809-1229-plan-five-severe-guard-defects.md` | no |
| 260812-1232 | `shared/history/260812-1232-planner-remove-the-protected-path-half.md` | no |

Two further facts bound the migration further. `260801-1122_*_spec-normative-consolidation.md` is
cited as the spec by **four** Circles (`curator`, `guard-bash-inspection`, `guard-rules-write`,
`rule-provenance-header`), so it cannot move into one of them without breaking the other three.
And `260717-1918`, the only file with a Circle origin, was lifted out of that Circle deliberately
at closure, with the reason recorded at `circles/260716-1847-workbench-umbau/_c_circle.md:49`.

**Why this matters rather than being a happy surprise.** The user chose the fuller of two options
on the strength of a premise, and the premise is wrong in the direction that made the option look
expensive. The decision itself is not wrong — the placement rule does change, and every Circle
created from now on contains its own founding documents. What is wrong is the record's account of
what the migration costs and touches, which a later reader will take as the description of what
was done.

**Where it is being handled.** `shared/planning/260812-1720_*_circle-first-placement-and-the-backlog-store.md`
carries the measurement in its `## Current State`, gates on it at step 11, and files the one
genuine question (does the migration reverse the recorded promotion?) as
`shared/decisions/260812-1720_*_does-the-circle-first-migration-reverse-a-recorded-promotion-out-of-a-circle.md`.
This defect record is the note that the decision record's own body should carry the corrected
premise once the gate is answered, so the two do not disagree in the archive.

---
**Reconciliation 260817-1836** (reconciler, domain `code`). Re-verified reproducible at HEAD `2552586`: `shared/decisions/260812-0254_*_where-do-a-circles-spec-and-plan-belong-when-the-circle-exists-before-them.md:81` still states that the existing twelve Circles are migrated, with no correction note. The plan that would have executed it records that its step 12 never ran because the gate answered leave it, so the premise was never overtaken by events either. Marker stays open. Log: `shared/history/260817-1836-reconciliation.md`.

---
Resolved: fixed — the decision record carries the corrected premise (ten of twelve Circles held their own planning documents; step 12 never ran); shared/decisions/260812-0254_*_where-do-a-circles-spec-and-plan-belong-when-the-circle-exists-before-them.md:143
