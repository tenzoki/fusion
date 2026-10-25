The user invoked `/fusion:curate`. This is the user-facing surface for the `policy-curator` agent. It dispatches the agent to **survey**, reads the run file the agent wrote, holds the **approval** itself, and dispatches the agent a second time to **apply** only the entries the user approved.

**It performs this procedure and no other.** No pass runs before it or after it, and nothing here commits: the policy-curator's edits are working-tree edits, and `/fusion:cleanup` is what commits them when the user runs it.
