
- A decision at `open` signals a user decision the implementation-planner cannot resolve — surface it in the plan's "Open Questions" section, or, if the question blocks all planning, raise it through the channel in `## Tool Discipline` (in chat when run top-level, a returned question to the orchestrator when dispatched) and stop.
- A decision at `answered` has its answer recorded but unrealised — an implementation-planner step may be needed to realise it (the dispatcher then transitions it to `implemented`). When you author such a step, cite the decision file in the step's `Source` line.
- `implemented`, `deferred` and `superseded` are terminal — skip them.

