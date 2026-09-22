`docs/working-model.md` `## 3. The gates` describes the gate set `**Mode:** autonomous` answered before `57e2b7eb` moved the `ontocoder` row
---
Commit `57e2b7eb` realised `260922-1028_*_which-gates-does-the-autonomous-mode-answer-beyond-the-plan-the-claim-and-the-finish.md` (option 2) in `agents/orchestrator.md:383`: *Task involves `ontocoder`* is an answered row (`proceed — answered by **Mode:** autonomous on <container>`), the file-and-skip set is three rows (structural, destructive, ambiguous), and `:610` applies a curator ledger whole under the field. The user-facing doc still states the earlier set:

- `docs/working-model.md:105`: the field "answers the stops that are about the *solution* of that item, and no other: the plan review, the item's claim and its finish, and the read of its plan's stop conditions".
- `docs/working-model.md:111`: "any **ontology or structured-data change** (every `ontocoder` task …)" listed among the stops with no qualification.
- `docs/working-model.md:115`: "Under `**Mode:** autonomous` the ontology, destructive-operation and ambiguous-task gates put no question at all: the orchestrator files an open decision carrying the question the gate would have asked, skips the task, and goes on."

`rules/fusion-workbench-conventions.md:207` makes `agents/orchestrator.md` `## Human Gate Rules` the authority for which gates the field answers, so the prompt is right and the doc is the copy that drifted. The same commit's third change (the held item's pause confirmed by the instruction to claim another, `agents/orchestrator.md` `## Work items`) is described nowhere in the doc either.

Acceptance: `docs/working-model.md` `## 3. The gates` names the ontocoder task among the stops the field answers, names the three file-and-skip rows as three, and states the curator-ledger and pause readings of `57e2b7eb`; `grep -c 'ontology, destructive-operation and ambiguous-task gates put no question' docs/working-model.md` prints `0`; `cd hooks && npm test` exits 0.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
Executor: `coder` (documentation). Found in the closing review `260922-1208-reviewer-closing-pass-over-the-51-issue-package-451bb312-to-bf515cad.md`; last edit of the doc was `4d692c57`, which wrote the sentences `57e2b7eb` then falsified.
