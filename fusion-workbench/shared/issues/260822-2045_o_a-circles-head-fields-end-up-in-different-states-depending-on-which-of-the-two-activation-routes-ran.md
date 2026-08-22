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

Circle `circles/260822-1921-measure-what-two-checkouts-share/` was activated through
`/fusion:next <dirname>` on 260822. Its `**Active spec/plan:**` reads `(none yet)`. Its own
`## Grounding snapshot` cites the spec it runs on, by path, in its first sentence:
`shared/planning/260822-1136_*_spec-fusion-becomes-a-multi-user-tool.md`.

So the spec exists, the record names it, and the field says nothing. Had the orchestrator performed
the same activation, its own table's condition — "if one exists and the record does not already cite
it" — would have been met and the field written.

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
