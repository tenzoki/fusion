2. Emit `planner_start`.
3. Invoke `implementation-planner` with the spec file path (or the raw request if shaping was skipped). Prefix **every** such dispatch with `**Executors:** code-implementer, data-implementer, analyst` on its own line, with no condition in front of it. Whether any step needs `analyst` is the implementation-planner's to decide once the plan exists, and it routes a step there when, and only when, that step produces a strategic deliverable. You do not hold the input for that judgement, which is why you no longer make it.
4. When it returns, read the plan file it produced and hold its path for the session: the binding is what **Closing a work package** step 3 resolves the plan in scope from, and the held path only the fallback when none is bound.
5. Emit `planner_done`.
6. **APPROVAL: Plan review.** Present the plan summary. The summary lists every step whose `Files:` names `CLAUDE.md`, each with its `CLAUDE.md:` line, or says there is none. Options: **Approve**, **Modify** (re-invoke it), **Cancel** (or, under `mode` `autonomous`, the answer the field gives — **Human approval rules**). Approve adopts it per the rule above.


### Step 1 — read the task

1. **Read the source.** Open the plan step, the issue record, or the user's own words in full. A task you have only summarised is a task you have already narrowed.
2. **Route it** per the **Agent Routing Table**.
3. **Approval check.** If the task meets any condition in **Human approval rules**, emit `gate_hit`, put the question to the user, and emit `gate_response` with their decision. On Skip: emit `task_skipped` and move on. On Defer: `transition --to deferred` on the source and emit `task_deferred`. Under `mode` `autonomous`, the clause in **Human approval rules** sorts the conditions into three sets: answered by the field, file-and-skip with no question put, and ask as written.
