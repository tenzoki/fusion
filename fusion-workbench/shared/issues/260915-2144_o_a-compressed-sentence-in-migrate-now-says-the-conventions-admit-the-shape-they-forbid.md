A compressed sentence in `/fusion:migrate` now says the conventions admit the shape they forbid
---
The byte cut that funded the `**Active spec/plan:**` carry rewrote the two-records-in-one-container bullet and inverted its claim about the conventions. The behaviour it describes is unchanged — the group is still refused — but the sentence a reader takes the rule from now reads as though the conventions permit a container holding two records.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260910-2011_*_a-work-item-has-no-field-for-the-plan-it-runs-on-so-the-closure-step-lost-its-source.md

**Evidence.** `skills/migrate/SKILL.md`, the "Two Circle files that differ only by marker are refused, not merged" bullet.

At `v11.2.0`:

> The conventions admit **no such shape** and no consumer handles it: the record is the sole carrier of Circle state, so a directory with two records has no defined state …

At HEAD:

> producing one container holding two records and therefore no defined state, **which the conventions admit and no consumer handles**.

"no such shape" was dropped and its negation moved off the verb, so "the conventions admit [it]" is now the natural reading and is the opposite of what the file said. The refusal itself stands in the next clause, so nothing executes wrongly; what is wrong is the stated authority for it.

**Scope.** `skills/*/SKILL.md` is a bounded surface at 320 B of margin as of `55be2491`, so the repair has to be near-neutral. "which the conventions admit no such shape for" or "a shape the conventions do not admit and no consumer handles" both fit inside a few bytes of the current text.

**Acceptance.** The bullet states that the conventions do **not** admit a container holding two records, in a form no reader can take the other way, and `skills/` stays inside its bound.
