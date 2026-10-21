The curator's net byte delta reads a relocation's After block as the source's new text
---
`agents/policy-curator.md` `### Blast-radius stop` defines the per-surface net byte delta as "After minus Before bytes over its entries". For a relocation entry the After block is the text the destination must carry, not the source's new text, so on a placement run the delta reports roughly zero for the surface that shrinks most.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>

**Evidence.**

- `agents/policy-curator.md` `### Blast-radius stop`, the sentence added in `8c3e046e`: "**A survey always states each surface's net byte delta**: After minus Before bytes over its entries."
- `agents/policy-curator.md` `### Ledger entry schema`, the relocation paragraph: "**The After block is the text the destination must carry** ... the pointer line is what replaces the passage where it stood."
- So for a relocation, After is about the same size as Before. The source surface (`CLAUDE.md`) actually changes by `len(Pointer left behind) - len(Before)`. The destination surface gains `len(After)`, and that gain is counted against no surface.
- Worked case, the package's own target. Relocating krk's 124 103-byte section yields a `CLAUDE.md` delta near 0 under the stated formula. The real figure is about -124 000. The 1.5x write-back clause in the same paragraph then compares numbers that are about equal and never fires on a relocation.
- A second reading gap in the same formula: a deletion's After block is the literal `(deleted)` (`### Ledger entry schema`). The formula does not say that this counts as 0 bytes.

**Scope.** The policy-curator prompt only. `skills/curate/SKILL.md` Step 3 item 3 and Step 5 carry the delta as the curator reports it, so they inherit the error without restating the formula.

**Acceptance.** The net-delta sentence defines the delta per entry kind. A tiered or consolidation entry contributes `After - Before` to its surface, and `(deleted)` counts as 0 bytes. A relocation contributes `Pointer left behind - Before` to the source surface and `+After` to the destination's surface. Edge entries keep `After - Before`. The 1.5x clause states which entries it ranges over. The `surface-growth-bound.test.ts` and dispatch-path bounds stay green with no head-room or baseline edit.

---
Resolved: `agents/policy-curator.md` `### Blast-radius stop` now defines the net delta per entry kind (relocation: pointer minus Before on the source, After on the destination; `(deleted)` = 0) and limits the 1.5x clause to tiered and consolidation entries; commit "fix: closing-review findings of the lean-CLAUDE.md package", 2026-10-21.
