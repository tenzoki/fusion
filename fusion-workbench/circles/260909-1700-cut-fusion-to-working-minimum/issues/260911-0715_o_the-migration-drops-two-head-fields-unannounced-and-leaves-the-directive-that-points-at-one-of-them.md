The migration drops two head fields unannounced and leaves the Directive that points at one of them
---
`skills/migrate/SKILL.md`'s record conversion lists five head fields and carries the body "verbatim from `## Directive` down". A pre-v11 record's `**Active spec/plan:**` and `**Active session history:**` sit above `## Directive` and in neither half, so a consuming project's migration drops them silently, in a one-way step. Worse, a record whose Directive reads "See `**Active spec/plan:**` above" is left pointing at a field that no longer exists.
---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:** 2f8d1082 (the migration as shipped); a8f52f62 (step S10, which met this by hand); 260910-2011_*_a-work-item-has-no-field-for-the-plan-it-runs-on-so-the-closure-step-lost-its-source.md

**How it was found.** Step S10 converted this workbench's two live records by hand rather than by running the body, and the divergence between what the hand conversion had to do and what the body prescribes is the evidence. The claimed record carried both fields with real values, and its `## Directive` was the pointer literal naming the first of them.

**Two defects, not one.**

1. **The fields are dropped with no note.** The gap they leave is already filed as `260910-2011_*_a-work-item-has-no-field-for-the-plan-it-runs-on-so-the-closure-step-lost-its-source.md`, which asks for the format to gain a field or for the closure step to take the plan from elsewhere. This record is about the *migration's* behaviour in the meantime: dropping them unannounced, in a step that cannot be undone by a forward commit, is worse than dropping them with a line saying so.
2. **The pointer Directive is left dangling.** `rules/circle-records.md` mandated that a record whose spec exists replaces its Directive prose with `See **Active spec/plan:** above.` Every record written after that rule landed carries it, so this is not an edge case — it is the common shape for any Circle that got as far as a spec. After conversion that sentence names a field the record no longer has.

**What S10 did instead**, as one possible answer rather than the answer: carried both values verbatim into the body as a short block above `## Directive`, stating that the format defines no field for them and citing the open record. The pointer sentence then still resolves.

**Acceptance.** The migration either carries the two fields somewhere a reader can find them, or drops them and says so in the survey the user confirms. A record whose Directive is the pointer literal is not left naming a field that is gone — either the pointer is rewritten in the same pass, or the field it names survives. Whichever, the body says which, and `260910-2011_*` is cited so the two records are read together.
