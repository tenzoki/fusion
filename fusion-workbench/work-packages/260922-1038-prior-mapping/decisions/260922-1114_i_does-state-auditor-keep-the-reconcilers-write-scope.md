# Does `state-auditor` keep the reconciler's write scope, or narrow to the auditor the nomenclature describes?

---
**Domain:** code
**Filed by:** planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260922-1045_*_spec-prior-nomenclature-plugin-source.md, 260922-1038-prior-mapping.md, nomenclature.md (this container)

---

## Question

The spec's C2 renames `reconciler` → `state-auditor` "with the write scope unchanged". `nomenclature.md` `### Stable Fusion profile identifiers` describes `state-auditor` as one that "audits runtime records, the workbench, and Git without changing them". The reconciler renames state markers, appends reconciliation notes and advances progress marks in plans, issues and decisions (`agents/reconciler.md`, `README-agents.md` `## The agents`, reconciler row; `/fusion:reconcile` also advances this checkout's reconcile mark). The two descriptions do not agree, and the spec files the mismatch rather than narrowing the agent inside a naming item. Filed so the question is citable by the item that builds the Prior module's profile set, and so the rename step can cite what it deliberately leaves open.

## Options

1. **Rename now, scope unchanged**, and record in `README-agents.md` `## The agents` that the profile's write scope is wider than the nomenclature's description until a later item narrows it.
   - Pros: the rename is a rename; nothing about what the agent does changes in a naming release; the divergence is written where the roster is read.
   - Cons: a reader who trusts the nomenclature's description is surprised by a marker move.
2. **Narrow the agent to audit only**, moving the marker renames and the note appends to the orchestrator (which already performs decision transitions at the user's word).
   - Pros: the profile matches its description.
   - Cons: a behaviour change outside a naming item; the orchestrator prompt grows on a surface at zero head-room; `/fusion:reconcile`'s contract changes.
3. **Keep the name `reconciler`** for the wider role and add `state-auditor` later as a second, read-only profile.
   - Pros: no mismatch at all.
   - Cons: two profiles for one reading pass; the roster gains a twelfth prompt; the nomenclature names no `reconciler`.

## Constraints

- The spec's Out of Scope holds for this item: "Changing what any agent does: every rename keeps the prompt's scope, reads and writes as they stand, the reconciler's write scope included."
- Whatever the answer, `bin/fusion-rules`'s decision-transition audience (`IS_DECISION_TRANSITION_AGENT`) and the orchestrator's dispatch of the reconcile pass keep working under the new name.

## Recommendation

Option 1 for this item; options 2 and 3 are for the item that builds the profile set, which is where the nomenclature's descriptions become contracts.

---
Answered: 260922-1114_*_does-state-auditor-keep-the-reconcilers-write-scope.md `## Options` — option 1: the state-auditor keeps the reconciler's write scope, and `README-agents.md` `## The agents` records that it is wider than the nomenclature's audit-only description; a later item may narrow it; ruled by user, Kai Stalmann <ks@qantr.com>

---
Implemented: `README-agents.md` `## The agents` — the state-auditor row records the reconciler's write scope as kept by this record and wider than the nomenclature's audit-only profile; the agent prompt kept the scope at the rename (`7727987a`)
