# Which treatment do the stores and root-anchored files the nomenclature's migration table omits take?

---
**Domain:** code
**Filed by:** shaper, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260922-1045_*_spec-prior-nomenclature-plugin-source.md, 260922-1038-prior-mapping.md, nomenclature.md (this container)

---

## Question

`nomenclature.md` `### Fusion workbench migration` classifies fourteen paths. The layout tree in `rules/fusion-workbench-conventions.md` `## fusion-workbench Layout` defines more, and these have no row: the record stores `forum/` (messages left for another checkout) and `discussions/` (the claim register `/fusion:discuss` writes), and the root-anchored surfaces `orchestrator-events.jsonl`, `.commit-lock/`, `.cadence-anchors`, `.session-marker`, `.checkout-id`, `.asset-provenance` and the `monitor` binary. Read against the ownership boundary, the two stores are Fusion record kinds the concept has not named and the seven root surfaces are runtime state, sessions and persistence that Prior owns. Part (2) needs a treatment for each, and the part (1) spec refuses to invent one; the gap is reported to the nomenclature's author instead. Filed so the report is citable.

## Options

1. **Ask the nomenclature's author to extend the table** with one row per omitted path, and treat every omitted path as Retain until then.
   - Pros: the table stays the single naming index; no name is invented in a workbench rule.
   - Cons: part (2) waits on the extension for these nine paths.
2. **Classify them in the part (2) spec by the boundary alone**: `forum/` and `discussions/` Retain as record kinds (naming rule 7, they are named for their records), the seven root surfaces to Prior's runtime records when that store exists and root-anchored until then (the same treatment `.guard-state/` takes).
   - Pros: part (2) proceeds; the classification follows a rule the nomenclature already states.
   - Cons: a treatment table with two authors.
3. **Rename `forum/` and `discussions/` now** to nouns the concept might prefer, and leave the root files.
   - Pros: none the other two lack.
   - Cons: names invented ahead of the concept, on every consumer's workbench.

## Constraints

- No file moves before the answer: the table "defines naming direction, not an authorised bulk move", and the part (1) spec keeps every omitted path unchanged in name and content.
- The seven root-anchored surfaces are bound to fixed root-relative paths by consumers with no fallback (`## fusion-workbench Layout`, "The root-anchored surfaces are not negotiable"); any answer that moves one names every consumer and changes them in the same commit.
- The answer is realised by part (2), whose spec cites this record.
