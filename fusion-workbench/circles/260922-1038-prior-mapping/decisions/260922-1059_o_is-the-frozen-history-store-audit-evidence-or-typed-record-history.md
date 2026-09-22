# Is the frozen `history/` store audit evidence under its own name, or typed record history to be classified?

---
**Domain:** code
**Filed by:** shaper, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260922-1045_*_spec-prior-nomenclature-plugin-source.md, 260922-1038-prior-mapping.md, nomenclature.md (this container)

---

## Question

`history/` is write-frozen since the session-history cut (`rules/fusion-workbench-conventions.md` `## Session history`): every existing file stays readable, no new file arrives, and citations of them resolve as they did. The nomenclature marks the store Review: "history is represented by versioned records and events, not one undifferentiated record class", and directs it to typed record history or audit evidence by content. Filed so part (2) rules on a frozen corpus rather than reclassifying it file by file by default.

## Options

1. **Keep every `history/` directory where it is, as audit evidence under its current name**, and add nothing to it (the state the cut already produced).
   - Pros: zero moves; every resolution line that cites a history file keeps resolving; the freeze already makes it evidence rather than a live class.
   - Cons: the name survives as an undifferentiated class the concept rejects.
2. **Move the corpus into `archive/`** as one sweep, keeping the basenames.
   - Pros: the live tree carries no frozen store; citations resolve through the archive as they do for every swept record.
   - Cons: `/fusion:cadence` and the citation corpus read `history/` by path today and would need the archive path; the sweep is one-way.
3. **Classify each file into typed records** (audit result, evidence, decision) by content.
   - Pros: the nomenclature's own direction.
   - Cons: several hundred session logs, each a narrative; the pass is a person's reading and creates records nobody cited under the new names.

## Constraints

- No file moves before the answer: `nomenclature.md` `### Fusion workbench migration` says its table "defines naming direction, not an authorised bulk move", and the part (1) spec keeps this store unchanged in name and content.
- The answer is realised by part (2), the consumer migration, and its spec cites this record; part (1) reads and writes the store where it stands today.
- Every citation of a record in this store keeps resolving through the move, whatever the answer: the basename is the citation, the store is not (`rules/fusion-workbench-conventions.md` `## Filename Patterns`).
