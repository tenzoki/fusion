# What becomes of `memos/`, which the concept has no record type for?

---
**Domain:** code
**Filed by:** shaper, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260922-1045_*_spec-prior-nomenclature-plugin-source.md, 260922-1038-prior-mapping.md, nomenclature.md (this container)

---

## Question

`shared/memos/` holds three append or overwrite logs per checkout (`memos-<checkout>.md`, `tasks-<checkout>.md`, `cadence-<checkout>.md`), written by `/fusion:memo` and `/fusion:cadence` and read by no agent (`rules/fusion-workbench-conventions.md` `## Path Resolution`, "there is deliberately no `SCAN_MEMOS`"). The nomenclature marks the store Review: "`Memo` is not a canonical semantic type in the new concept", and directs each record to evidence, decision or handover by content. Filed so part (2) decides it rather than moving the files by default.

## Options

1. **Keep the store as personal logs outside the record model**, unchanged, and state in the nomenclature that a per-checkout log is not a Fusion record.
   - Pros: matches what the files are (one writer, no reader among the agents); no classification pass.
   - Cons: a store the concept does not name survives on the always-on layout.
2. **Classify each file's lines by content** into evidence, decision or handover records.
   - Pros: the nomenclature's own direction.
   - Cons: the lines carry no type and no author; the pass is a reading by a person over every line, and the cadence digest is regenerated on every run and has nothing to classify.
3. **Retire the store** and move the memo and task commands onto the forum or the work-package record.
   - Pros: one store fewer.
   - Cons: changes what `/fusion:memo` does, which is a behaviour change outside a naming migration.

## Constraints

- No file moves before the answer: `nomenclature.md` `### Fusion workbench migration` says its table "defines naming direction, not an authorised bulk move", and the part (1) spec keeps this store unchanged in name and content.
- The answer is realised by part (2), the consumer migration, and its spec cites this record; part (1) reads and writes the store where it stands today.
- Every citation of a record in this store keeps resolving through the move, whatever the answer: the basename is the citation, the store is not (`rules/fusion-workbench-conventions.md` `## Filename Patterns`).
