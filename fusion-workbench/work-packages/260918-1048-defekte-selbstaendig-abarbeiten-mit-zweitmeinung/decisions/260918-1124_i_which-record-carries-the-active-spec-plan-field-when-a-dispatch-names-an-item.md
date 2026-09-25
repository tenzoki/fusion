# Which record carries `**Active spec/plan:**` when a shaper or planner dispatch names an `**Item:**`?

---
**Domain:** code
**Filed by:** planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260915-2142_*_the-active-spec-plan-write-rule-keys-on-the-claimed-item-while-the-item-parameter-sends-a-plan-elsewhere.md, 260910-2011_*_a-work-item-has-no-field-for-the-plan-it-runs-on-so-the-closure-step-lost-its-source.md, 260918-1124_*_autonomous-defect-package-fifteen-fixes-with-a-second-opinion-each.md

---

## Question

`agents/orchestrator.md` `### Shaping and planning` writes `**Active spec/plan:**` onto the claimed item. The `**Item:**` dispatch parameter sends a spec or plan into an item this checkout has not claimed. On that path the artifact lands in item X's container and the field is written onto nothing, or onto a claimed item Y that the plan was never written for. The closure step reads the plan in scope off that field (`agents/orchestrator.md` `### Step 5`, the disambiguation the defect record cites), so a later checkout that claims X finds no plan. The defect record names two resolutions and rules on neither; step 15 of the plan cited above settles it in a discussion before the prompt is edited, and the discussion needs the fork stated once.

## Options

1. **The field is written onto the record the dispatch wrote into.** The `**Item:**` value where the dispatch carried one, the claimed item otherwise. One rule, one input: the destination of the artifact and the destination of the field are the same record, because both are resolved from the same parameter.
   - Pros: closure finds the plan on the item it belongs to, in every session, which is what the field exists for (260910-2011). The write authority is already exercised on that path: the dispatch put the artifact into X's container, so writing X's head field adds no new reach.
   - Cons: a session writes into the head of an item it does not hold, one line, in a commit the item's holder later pulls. A concurrent edit of that line by the holder conflicts at the merge, as any two writes to one line do.
2. **The `**Item:**` path writes no field, and the prompt says so.** The write rule keeps its claim-keyed shape, and the closure step states that a plan dispatched with `**Item:**` is found by opening X's `planning/` store rather than X's record.
   - Pros: no session touches the head of an item it does not hold.
   - Cons: the defect the field was added to fix returns on exactly this path (260910-2011: closure lost its source); closure gains a second lookup with a second failure mode (two plans in the store, no field to say which is in force).

## Constraints

- The write rides the act that adopts the artifact; no separate bookkeeping pass maintains the field (`rules/fusion-workbench-conventions.md` `## Backlog entries — work items`).
- `agents/*.md` is a bounded surface; the edit lands inside the head-room measured on 2026-09-18 (16 689 bytes, survey group 2) or is paid for in the same file.
- Whichever option lands, a reader of the prompt alone must be able to answer which record names a plan that was dispatched with `**Item:**` (the defect record's acceptance).

## Recommendation

Option 1. The parameter already decides where the artifact goes; deriving the field's destination from a second input is the defect. The one-line write into an unheld item's head is the same class of write the `**Claim:**` takeover already makes, and the conventions accept that collision at the merge rather than preventing it.

---
Answered: 260918-1352_*_which-record-carries-active-spec-plan-under-item.md `## Recommendation` — option 1: the field is written onto the record the dispatch wrote into, the `**Item:**` value's record where the dispatch carried one and the claimed item's otherwise, in two clauses of `agents/orchestrator.md` (the write rule and Setup step 5's sentence on what `**Item:**` carries), with the held-path fallback kept only for the case with neither; the discussion converged after 2 rounds with no open dissent; ruled by orchestrator, Kai Stalmann <ks@qantr.com>, under the directive of `260918-1048-defekte-selbstaendig-abarbeiten-mit-zweitmeinung.md`.

---
Implemented: 260915-2142_*_the-active-spec-plan-write-rule-keys-on-the-claimed-item-while-the-item-parameter-sends-a-plan-elsewhere.md `Resolved:` — the two clauses of `agents/orchestrator.md` land in the commit that carries this line, the same commit that closes that defect.
