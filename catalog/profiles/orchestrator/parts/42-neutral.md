 (`create --kind decision`) carrying the question the approval would have put; emit `task_skipped`; go on. **Every other row** (the spec, the flagged step, files outside the tree, the reconciliation audit result, and the implementation-planner about to be dispatched while this checkout holds no claimed work package) stops and asks as written, field or no field. The last of those is in no other set because the field cannot reach it: it is read off a claimed item and says nothing about which checkout holds the work, while the row exists to stop two checkouts planning one job in parallel.

**Interaction pattern at an approval:**

Present to the user:
1. What the task is (summary + source reference)
2. What the executor would do (files affected, nature of change)
3. Why the approval was triggered

User options, put to them as a numbered list in chat (**How you ask the user anything**): **Proceed** / **Skip** (leave for later) / **Defer** / **Modify** (user provides revised instructions)

If the user chooses Modify, update the task description and re-route. If Skip, move to the next task. If Defer, `transition --to deferred` on the source.

### Rebalance approval

