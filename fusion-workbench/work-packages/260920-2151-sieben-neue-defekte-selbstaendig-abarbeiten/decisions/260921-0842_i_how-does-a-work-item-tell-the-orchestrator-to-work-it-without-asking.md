# How does a work item tell the orchestrator to work it without asking, and which gates does that answer?

---
**Domain:** code
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260921-0657_*_no-shipped-text-lets-a-directive-pre-answer-the-solution-gates-so-an-autonomous-package-stops-three-times-before-its-first-fix.md, 260920-2151-sieben-neue-defekte-selbstaendig-abarbeiten.md, 260918-1048-defekte-selbstaendig-abarbeiten-mit-zweitmeinung.md, 260913-0909_*_may-the-orchestrator-reach-every-tool-and-may-an-agent-dispatch-another.md

---

## Question

Two work items asked to be worked autonomously (`260918-1048`: "drei Tage ohne Rückfrage, entscheide alles zur Lösung selbst"; `260920-2151`: "selbständig ausführen, nach demselben Muster"). The first session read its directive as the standing answer to the plan gate and asked nothing, writing the `gate_response` itself; the second, reading `agents/orchestrator.md` `## Human Gate Rules` as written, stopped three times before its first fix. Nothing in the tree distinguishes the two runs: no field, no rule, no switch says an item is to be worked without asking, and no clause of the gate table says which gates such a request may answer. The user named the second run's stops as the defect. The choice must be made now because the next autonomous package meets the same table.

## Options

1. **A head field on the work item, read at Setup with the claim, and a gate-table clause that branches on it.** The item record gains `**Mode:** autonomous` (absent means the ordinary mode, so no existing record changes); Setup reads it beside `**Status:**` and `**Claim:**`; the gate table says which conditions the field answers and which it never does; every answered gate still emits its `gate_hit` and a `gate_response` citing the field.
   - Pros: machine-readable, read at the one step every session runs; the answer is on disk with the item, not in the reader's interpretation of prose; the log shows which stops were answered by the field.
   - Cons: one more head field in the conventions' template and a clause in the orchestrator prompt, both on dispatch paths whose growth is bounded; `/fusion:memo` and hand-filed items must know the field exists.
2. **Directive prose, interpreted.** The gate table says a directive that asks for autonomy in words answers the solution gates.
   - Pros: no field, no template change.
   - Cons: this is what the first session did and the second did not; the trigger is a reading, not a fact, and two readers gave two answers to the same store.
3. **A switch on the invocation** (a parameter the user passes when starting the session or claiming the item).
   - Pros: explicit at the moment it applies.
   - Cons: not persisted with the item, so a session restarted mid-package has to be told again; nothing in the store says the item was meant to be worked that way.

## Constraints

- The field answers gates about the solution only: the plan review, the claim of the item the field sits on, the stop-conditions read at its close, and the finish of that item once its plan is complete. It never answers ontology changes, the removal or rebuild of something that exists, or an ambiguous mandate: those file an open decision and the step is skipped, as both directives already say.
- Every gate the field answers still writes `gate_hit` and `gate_response` to the event log, the response naming the field, so the measurement of gates is unchanged (`260909-2305_*_which-quantity-does-the-head-list-protect-a-gates-evaluation-rate-or-its-rate-of-returning-to-the-user.md`).
- `agents/orchestrator.md` has 16 484 bytes of head-room at `9c7101aa`; `rules/fusion-workbench-conventions.md` is on every dispatch path and the dispatch-path bound is zero-sum, so an added field costs a cut of the same size on the same path or a re-baselining event.
- A second opinion is taken on the concept before the prompt is edited; one commit.

## Recommendation

Option 1. The defect is that a fact lived only in a reading; the fix is to put the fact on disk where the reader already looks.

---
Answered: this record `## Options`, option 1 — the work item gains `**Mode:** autonomous`, read at Setup, answering the plan review, the claim and finish of that item and its stop-conditions read, never ontology, removal or ambiguity; every answered gate still logs its `gate_hit` and a `gate_response` citing the field; ruled by user, Kai Stalmann <ks@qantr.com>, in chat on 260921 (option 1 of the three put to him: build the mode now with the three points).

---
Implemented: `**Mode:** autonomous` on the work-item record, read at the orchestrator's Setup beside status and claim, answering the plan review, the claim and finish of that item and its stop-conditions read, never ontology, removal or ambiguity, every answered gate still logging `gate_hit` and a `gate_response` citing the field; in `rules/fusion-workbench-conventions.md`, `agents/orchestrator.md` and `skills/memo/SKILL.md`, in the commit that carries this line — the item says on disk what the first session read out of prose.
