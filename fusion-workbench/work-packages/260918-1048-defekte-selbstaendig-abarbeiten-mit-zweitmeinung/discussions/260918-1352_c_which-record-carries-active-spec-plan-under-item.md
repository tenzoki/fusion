# Which record carries `**Active spec/plan:**` when a dispatch names an `**Item:**`?

---
**Domain:** code
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Partners:** orchestrator and consultant
**Rounds:** 2
**Ceiling:** 8
**Outcome:** converged
**Cross-references:** 260918-1124_*_which-record-carries-the-active-spec-plan-field-when-a-dispatch-names-an-item.md, 260915-2142_*_the-active-spec-plan-write-rule-keys-on-the-claimed-item-while-the-item-parameter-sends-a-plan-elsewhere.md, 260910-2011_*_a-work-item-has-no-field-for-the-plan-it-runs-on-so-the-closure-step-lost-its-source.md, 260918-1124_*_autonomous-defect-package-fifteen-fixes-with-a-second-opinion-each.md

---

## Question

Step 15 of the defect package (`260918-1124_*_autonomous-defect-package-fifteen-fixes-with-a-second-opinion-each.md`) repairs the write rule for `**Active spec/plan:**` in `agents/orchestrator.md` `### Shaping and planning`. The decision record `260918-1124_*_which-record-carries-the-active-spec-plan-field-when-a-dispatch-names-an-item.md` states the fork: option 1 writes the field onto the record the dispatch wrote into (the `**Item:**` value where one was passed, the claimed item otherwise); option 2 keeps the claim-keyed rule and has closure open the item's `planning/` store instead. The discussion runs over that record before the prompt is edited; its outcome is the orchestrator's ruling under the package's own authority.

## What held up

### C1 — On the `**Item:**` path the artifact and the field resolve from two different inputs, and they disagree exactly there.

- **Advanced by:** first partner
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** `agents/orchestrator.md` `### Shaping and planning` sets the field "on that item's record", the claimed one; `agents/shaper.md` and `agents/planner.md` (their `**Item:**` paragraphs) define the parameter as the way a dispatch writes into an item this checkout has not claimed. Two inputs; on the `**Item:**` path they name different records.

### C2 — Closure reads the plan in scope off the field first and falls back to a path nothing persists, so a later claimant of X finds no plan.

- **Advanced by:** first partner
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** `agents/orchestrator.md` `## Closing a work item` step 3 reads `**Active spec/plan:**` first and falls back "only when that field is absent" to a held path nothing persists; `260910-2011_*_a-work-item-has-no-field-for-the-plan-it-runs-on-so-the-closure-step-lost-its-source.md` names exactly this reader under "What is actually lost".

### C3 — Option 1 resolves both destinations from one input, and the one-line write into an unheld item's head is a write class the conventions already accept.

- **Advanced by:** first partner
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** the `**Item:**` path already lands the artifact in X's container through `$OUT_PLAN`; `rules/fusion-workbench-conventions.md` `## Backlog entries — work items` ("A takeover overwrites the field … The collision is detected and not prevented") accepts a one-line head write into an item another checkout may hold. Caveat recorded by the consultant: the same rule says an unheld item's writes go to `shared/` by construction, and `**Item:**` is the one deliberate override of that construction; option 1 rides that override rather than opening a new one.

### C5 — The option-1 edit is one clause in `agents/orchestrator.md` and fits the bounded surface without a funding cut.

- **Advanced by:** first partner
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** `hooks/lib/__tests__/surface-growth-bound.test.ts` (`AGENT_BASELINE` summing to 310 567, `AGENT_HEAD_ROOM` 18 000) against the golden's `agents` total of 311 696 gives 16 871 bytes of live head-room; the clause costs on the order of 100 to 150 bytes.

### C6 — `agents/orchestrator.md` Setup step 5 already misstates what `**Item:**` carries, and the option-1 clause is a no-op under that line unless it is corrected in the same edit.

- **Advanced by:** consultant
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** the paragraph "The claimed item, and what you do with it" says the held container name "is the value a `planner` or `shaper` dispatch passes as `**Item:**` when it must write into an item this checkout does not hold"; the claimed item is by definition held, so read literally the `**Item:**` value and the claimed item are one record, collapsing the two branches of the new clause. `README-agents.md` `## Dispatch parameters` states the parameter correctly ("when a plan must be written into an item this checkout does not hold").

### C7 — Option 2 contradicts the user's ruling of 260915 on `260910-2011_*` and reintroduces the second reader's loss, which is the sharper case against it.

- **Advanced by:** consultant
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** that record's resolution paragraph reads "option 1 of the acceptance, ruled by the user on 260915 … the item grammar gains the field rather than the closure step being rewritten"; option 2 rewrites the closure step for one path, the branch the user ruled out, and the record's second lost reader (a reader of the item file, who cannot see what the work runs on without searching the store) returns for every `**Item:**`-dispatched plan.

### C8 — A third option, the dispatched agent writing the field itself beside the artifact, exists and is the worse fit.

- **Advanced by:** consultant
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** the planner could write the field with one input by construction, but `agents/shaper.md` forbids the shaper touching the item record ("leave the item exactly as it stands: no status change, no claim, no appended line") and retired the `**Initiated by:**` line because no surviving mode edits a record the user owns. Option 1 keeps the write at the orchestrator, where the prompt already places it, and touches one file.

### C9 — The step-15 edit is two clauses in `agents/orchestrator.md`, both inside the head-room: the write rule in `### Shaping and planning` and the `**Item:**` sentence in Setup step 5's "The claimed item" paragraph.

- **Advanced by:** first partner
- **Entered:** round 2
- **Last moved:** round 2
- **Evidence:** C6 makes the second clause a precondition of the first's acceptance; Setup step 5's other statement of the parameter ("what a `**Work-item:**` line carries and what an `**Item:**` parameter names") is a shared identifier grammar, not a shared value, and `agents/planner.md` and `agents/shaper.md` already read `**Item:**` as the item the dispatch writes into, so only the orchestrator's sentence moves. Net growth on the order of a hundred bytes against 16 871.

### C10 — The ruling is option 1 with C9's two clauses; the closure step needs no change.

- **Advanced by:** first partner
- **Entered:** round 2
- **Last moved:** round 2
- **Evidence:** checked with a precision from the consultant: closure is claim-keyed by construction (`## Closing a work item` opens "the item this session claimed" and step 1 reads the held container name), which is what makes option 1 sufficient: X is only ever closed by a session holding X, whose step 3 reads the field off X's record, where the dispatching session put it. The only claim-keyed phrase in step 3 is the absent-field fallback, which stays. The decision record in play is `260918-1124_*_which-record-carries-the-active-spec-plan-field-when-a-dispatch-names-an-item.md`; `260910-2011_*` is a closed issue, not a decision. The ruling is the orchestrator's under the package's authority; the discussion decides nothing.

### C11 — Under option 1 the unpersisted fallback in closure step 3 can hand Y's closure a plan written for X, a narrow residual the same clause closes.

- **Advanced by:** consultant
- **Entered:** round 2
- **Last moved:** round 2
- **Evidence:** a session holding Y that dispatches with `**Item:** X` writes the field onto X and holds X's path; if Y's field is absent at closure the fallback reads that path. Today the same sequence writes X's plan onto Y's field, which is worse. Closed by keeping the "hold the path for the session" instruction only for the no-claimed-item case, inside the clause C9 rewrites; taken by the first partner.

## What fell

### C4 — Option 2 reintroduces the defect the field was added to fix and adds a second lookup with a failure mode of its own.

- **Advanced by:** first partner
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** refuted as stated: `260910-2011_*`'s acceptance offered two branches, a field on the item or a closure step rewritten to read a persisted source, and option 2 is the second branch applied to one path, so closure keeps a persisted source (X's `planning/`). The second conjunct (a lookup among several artifacts with no field saying which is in force) holds on the store's own shape.
- **Conceded:** first partner, round 2 — the consultant's C7 states the case against option 2 correctly: not "the defect returning" but the branch the user ruled out on 260915, plus the second reader's loss.

## What could not be decided

## Open dissent

## Recommendation

Option 1: `**Active spec/plan:**` is written onto the record the dispatch wrote into, the `**Item:**` value's record where the dispatch carried one and the claimed item's otherwise, in two clauses of `agents/orchestrator.md` (the write rule, and Setup step 5's sentence on what `**Item:**` carries), with the held-path fallback kept only for the case with neither an `**Item:**` nor a claim. Converged after 2 rounds under condition A: no entry undecidable and no new refutation in round 2. This recommendation binds nothing; the ruling is the orchestrator's, recorded on the decision record it cites.
