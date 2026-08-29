A Circle's head fields end up in different states depending on which of the two activation routes ran

---

**Severity:** Low, and structural rather than urgent. Nothing breaks; a reader of `**Active spec/plan:**` cannot tell "this Circle has no spec" from "this Circle was activated by the skill".
**Domain:** code
**Filed by:** orchestrator, while performing an activation through `/fusion:next` on 260822
**Affects:** `agents/orchestrator.md` `## Circle head fields`; `skills/next/SKILL.md` Step 6.2
**Cross-references:** `rules/circle-records.md` `## Circle record template` (which defines both fields and their `(none yet)` sentinel); `rules/fusion-workbench-conventions.md` `## fusion-workbench Layout`, which enumerates the two writers on the activation path

---

## What is inconsistent

The `_a_` → `_t_` activation has **two sanctioned performers**, enumerated in the conventions file: the
orchestrator, and `/fusion:next` in its user-confirmed interactive branch. They disagree about the
head fields.

`agents/orchestrator.md` `## Circle head fields` gives the activation act a row for each field:

> | `_a_`→`_t_` activation, with the record rename | `**Active spec/plan:**` | the spec or plan this Circle runs on, if one exists and the record does not already cite it; otherwise leave the field as it stands |

`skills/next/SKILL.md` Step 6.2 says the opposite for the same act:

> `**Active spec/plan:**` is left exactly as it stands. If shaper's portfolio-activation mode already
> pointed it at a spec, that citation is current; if it reads `(none yet)`, this skill has no way to
> find the right file and must not guess one.

Both are defensible on their own terms. The skill's reasoning is sound for a skill: it holds no way
to identify the right spec. The orchestrator's is sound for an orchestrator: it usually knows,
because it just wrote or read the spec. What is not stated anywhere is that the field therefore ends
up in **different states for the same Circle depending on the route**, and neither document
acknowledges the other.

## The case that produced this

Circle `260822-1921-measure-what-two-checkouts-share` was activated through
`/fusion:next <dirname>` on 260822. Its `**Active spec/plan:**` reads `(none yet)`. Its own
`## Grounding snapshot` cites the spec it runs on, by path, in its first sentence:
`260822-1136_*_spec-fusion-becomes-a-multi-user-tool.md`.

So the spec exists, the record names it, and the field says nothing.

**Correction 260823, by the orchestrator that filed this.** The sentence that stood here claimed the
orchestrator's condition would have been met and the field written. That is wrong, and it was wrong
about the very case it cited. The condition reads "if one exists **and the record does not already
cite it**", and the record cites the spec in its Grounding. The condition fails, so the orchestrator
route leaves the field exactly as the skill route does. **The two routes agree on this record**, and
the example this was filed on demonstrates nothing.

Checked again on 260823 while activating `260823-0023-settle-what-travels-between-checkouts`,
whose record cites its specification twice outside the field. Both routes leave `(none yet)` there
too, and the shaper had carried a caution into that record on the strength of this defect's original
wording.

**A divergence remains, and it is narrower than what was filed.** The two routes differ only where a
spec exists and the record cites it **nowhere** — not in the field, not in the Grounding, not in the
Dependencies. Then the orchestrator writes the field and the skill does not. Neither of the two
Circles cited in this record is that case, so the divergence is stated here without a measured
instance, which is a weaker record than one with evidence and is said plainly rather than dressed up.

What survives unchanged is the consequence, for whenever that case does arise: the pointer literal
that keeps a record's Directive from duplicating its spec rides a write of the field, so the route
that declines to write it also declines the swap.

## Why it is worth a record rather than a shrug

The field has two mechanical readers, playmaker's portfolio rendering and a resume, and
`rules/circle-records.md` is explicit that both test for the literal `(none yet)` and treat it as
"nothing is cited". Neither can distinguish a Circle that genuinely has no spec from one whose
activation route declined to look. Every consumer of the field is therefore reading a value whose
meaning depends on a fact that is not recorded anywhere in the record.

There is a second-order effect. `rules/circle-records.md`
`### The Directive is a pointer once a spec exists` makes the pointer literal ride a write of this
field. A Circle activated through the skill keeps prose in its `## Directive` while its spec exists,
which is exactly the duplication that invariant was written to make impossible — not because anybody
wrote a second copy, but because the swap never fired.

## What to consider

Not costed here, and the choice is not obvious.

1. **The skill writes it too**, deriving the path from the record's own Grounding citation. Cheap for
   the common case, and a guess in every case where the Grounding cites more than one path.
2. **Neither writes it**, and the field is filled by the first session that runs the Circle, which is
   the one party that certainly knows. Moves the obligation to a place that already has a Setup step
   for the sibling field.
3. **The divergence is intended and gets written down** in both documents, so a reader of the field
   knows the value is route-dependent. Cheapest, and it leaves the readers no better off.

The three differ in who is assumed to know which spec a Circle runs on, which is the question under
all of them.

---
Resolved: referred (decision) — which activation route writes `**Active spec/plan:**` when no party is clearly its writer is the decision's question; 260824-2013_*_who-writes-the-circle-record-fields-that-no-current-party-may-write.md
