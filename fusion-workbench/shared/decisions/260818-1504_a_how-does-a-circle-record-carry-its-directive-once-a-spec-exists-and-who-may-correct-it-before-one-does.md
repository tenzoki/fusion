# How does a Circle record carry its Directive once a spec exists, and who may correct it before one does?

---
**Domain:** code
**Status:** open
**Filed by:** orchestrator
**Cross-references:** `shared/issues/260815-0752_*_no-agent-may-revise-an-active-circle-records-directive-so-a-revision-leaves-it-contradicting-the-spec.md` (the defect, with its three candidate answers), `shared/issues/260818-1452_*_gate-options-name-the-category-of-what-is-being-decided-instead-of-stating-its-content.md` (filed from the same report), `rules/circle-records.md` (the record template), `agents/shaper.md` mode 3, `agents/orchestrator.md` `## Scope` and `## Re-sharpening an anticipated Circle`

---

## Question

A Circle record's `## Directive` cannot be corrected once the Circle is active. The orchestrator
is forbidden it by name, and the shaper's portfolio-activation mode — which `agents/orchestrator.md`
calls "the only sanctioned writer" of that section — takes an `_a_circle.md` path and is scoped to
re-clarification ahead of activation. The Rebalance gate's Revise-Directive option writes the
revised intent into a new spec and never into the record, so the record is left contradicting its
own `**Active spec/plan:**` field.

The user reported it as a plain gap: there is no way to correct a mistake in a Circle's Directive
after the fact. That is broader than the filed defect, which describes a deliberate mid-Circle
revision. A typo, a wrong statement, and a reversed intent all hit the same wall.

**Two problems wear one name here, and separating them is what the answer turns on.**

- **A spec exists.** The Directive is then held twice, in the record and in the spec, with nothing
  synchronising them. This is a duplication problem.
- **No spec exists yet**, which is the state of every Circle from activation until planning
  finishes. The record holds the only copy, so nothing is duplicated. This is a permission
  problem: no party may write it.

## Options

1. **Pointer plus writer** — where a spec exists the record's `## Directive` carries a reference to
   `**Active spec/plan:**` instead of prose, so there is one source and nothing to synchronise;
   where no spec exists the shaper may rewrite the prose, on the user's explicit choice at a gate,
   by the same user-initiated condition that already governs its portfolio-activation mode.
   - Pros: each of the two problems gets the answer its own shape calls for. Covers anticipated and
     active Circles, with and without a spec.
   - Cons: two changes rather than one, and the record template changes shape.
2. **Pointer only** — the record stops carrying the Directive in words and cites the spec as the
   single source.
   - Pros: removes the duplication instead of assigning it a maintainer. The filed defect prefers
     this, warning that duplication with a maintainer is what the `**Status:**` head field already
     demonstrates decaying.
   - Cons: a Circle with no spec still holds prose nobody may edit, and that is the state
     immediately after activation.
3. **Widen the shaper's mode to active Circles** — smallest change, covers every error case.
   - Pros: one contract edit; a typo becomes fixable.
   - Cons: the Directive stays duplicated and may drift again between two re-sharpenings, which is
     the recurrence the defect warns against.
4. **A fourth permitted orchestrator write** — `## Directive`, only after a Rebalance
   Revise-Directive and only citing the approved spec.
   - Cons: reaches only that one path. A typo and a spec-less Circle stay unreachable, and
     Revise-Directive is capped at once per session.

## Constraints

- A terminal Circle's record is history and stays uneditable; none of the options changes that.
- Whatever writes the section keeps the user-initiated condition already carried by
  `agents/orchestrator.md` `## Re-sharpening an anticipated Circle`: the orchestrator may dispatch
  it only when the user's own words at a gate chose it.
- `rules/circle-records.md` is the single authoring home for the record template; the change lands
  there and is cited, not restated, by the prompts.
- Growth bounds bind: `agents/` has 18 000 bytes of head-room and every prompt edit spends it.

---
Answered: user gate, orchestrator session `shared/history/260818-1452-orchestrator-session.md`, 2026-08-18 — option 1, pointer plus writer. The duplication is removed where it exists and a sanctioned writer is provided where the record holds the only copy.
Implemented:
Deferred:
Superseded by:
