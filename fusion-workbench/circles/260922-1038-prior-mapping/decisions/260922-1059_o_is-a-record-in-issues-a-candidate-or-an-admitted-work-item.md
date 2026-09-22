# Is a record in `issues/` a candidate or an admitted work item, and which store does each go to?

---
**Domain:** code
**Filed by:** shaper, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260922-1045_*_spec-prior-nomenclature-plugin-source.md, 260922-1038-prior-mapping.md, nomenclature.md (this container)

---

## Question

The nomenclature marks `shared/issues/` (and the same store in every container) as Review: "an issue may be an unadmitted candidate or an admitted work item; migration depends on its state". Fusion has one `issues/` store with four markers (`_o_`, `_p_`, `_c_`, `_d_`) and no candidate register, no admission and no work-item lifecycle in the nomenclature's sense. Part (2) has to say what a record's marker and body mean in the new vocabulary before any file moves. Filed now so the part (2) spec has a citable question rather than an implicit one.

## Options

1. **Keep one `issues/` store and read the marker as the classification** — `_o_` is a pending candidate, `_p_` an admitted work item in progress, `_c_` and `_d_` dispositions (merged or rejected, deferred).
   - Pros: no file moves, no new store, the marker vocabulary already carries the distinction the table asks for.
   - Cons: the store's name says neither candidate nor work item, and the nomenclature's candidate dispositions (`selected`, `admitted`, `out_of_scope`) have no marker.
2. **Split by state into a candidate register and work-item records**, the nomenclature's two collections.
   - Pros: the stores say what they hold, naming rule 7.
   - Cons: fusion has no candidate register and no admission step; the split creates two stores for a mechanism that does not exist yet, and every `_o_` record has to be read by a person to be classified.
3. **Keep `issues/` unchanged as a Fusion record kind the concept has not named, and report that to the nomenclature's author.**
   - Pros: nothing is invented ahead of the concept.
   - Cons: the Review row stays open indefinitely.

## Constraints

- No file moves before the answer: `nomenclature.md` `### Fusion workbench migration` says its table "defines naming direction, not an authorised bulk move", and the part (1) spec keeps this store unchanged in name and content.
- The answer is realised by part (2), the consumer migration, and its spec cites this record; part (1) reads and writes the store where it stands today.
- Every citation of a record in this store keeps resolving through the move, whatever the answer: the basename is the citation, the store is not (`rules/fusion-workbench-conventions.md` `## Filename Patterns`).
