The user started the curate entry. This is the user-facing surface for the `policy-curator` entry. It dispatches that entry to **survey**, reads the run file the child run wrote, holds the **approval** itself, and dispatches the entry a second time to **apply** only the entries the user approved.

**It performs this procedure and no other.** No pass runs before it or after it, and nothing here commits: the policy-curator's edits are edits in the workspace, and the host carries the apply pass's edits into the user's checkout when the run ends, uncommitted.
