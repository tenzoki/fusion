# Does `.guard-state/` become a Prior runtime record, or is it removed after migration?

---
**Domain:** code
**Filed by:** shaper, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260922-1045_*_spec-prior-nomenclature-plugin-source.md, 260922-1038-prior-mapping.md, nomenclature.md (this container)

---

## Question

`.guard-state/` is root-anchored and read by `bin/monitor`, `hooks/lib/events.ts`, `hooks/lib/guard-state-file.ts` and `hooks/lib/staging-drift.ts` (`rules/fusion-workbench-conventions.md` `## fusion-workbench Layout`). The hooks are observation-only since 260816, so what still lands there is counters and the write trace, not decisions. The nomenclature marks it Review: "permissions, process control, and runtime events belong to Prior, not the Fusion workbench", with the treatment "Prior runtime records or removal after migration". Filed so part (2) rules on a surface four consumers read at a fixed path rather than moving it.

## Options

1. **Keep it root-anchored under Fusion until Prior's runtime store exists**, then hand the counters over and remove the directory.
   - Pros: nothing breaks in the four consumers; the handover happens when there is somewhere to hand over to.
   - Cons: runtime state stays in the workbench for the interim, against the ownership boundary.
2. **Remove it after the consumer migration**, and drop what the hooks write there.
   - Pros: the boundary holds at once.
   - Cons: `bin/monitor` and `staging-drift` read it, and what they show would go with it; the value of the counters has to be measured first.
3. **Move it beside `orchestrator-events.jsonl` as one runtime area** under a name the nomenclature gives to runtime records.
   - Pros: one place for everything Prior will own.
   - Cons: two root-anchored surfaces move at once, each with consumers that have no fallback path.

## Constraints

- No file moves before the answer: `nomenclature.md` `### Fusion workbench migration` says its table "defines naming direction, not an authorised bulk move", and the part (1) spec keeps this store unchanged in name and content.
- The answer is realised by part (2), the consumer migration, and its spec cites this record; part (1) reads and writes the store where it stands today.
- Every citation of a record in this store keeps resolving through the move, whatever the answer: the basename is the citation, the store is not (`rules/fusion-workbench-conventions.md` `## Filename Patterns`).

---
Answered: 260922-1059_*_does-guard-state-become-a-prior-runtime-record-or-go.md `## Options` — option 1: `.guard-state/` stays root-anchored under Fusion until Prior has a runtime store; then its counters move there and the directory is removed; ruled by user, Kai Stalmann <ks@qantr.com>
