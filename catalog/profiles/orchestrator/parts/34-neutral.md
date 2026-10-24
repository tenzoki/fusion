
### Step 3 — read the return

Read the report — the verification line first, then scope.

- **Read the `Verification:` line.** `code-implementer` and `data-implementer` report in one shape: the exact command run and the exit code it returned. Four cases, and there is no fifth:
  - **`exit 0`** — proceed.
  - **a non-zero exit** — the executor's own check failed. The task is **blocked**, not done: do not mark it complete. Go to **Step 4**, whose validation run confirms the failure and carries it into the self-healing branch. Do not commit ahead of that.
  - **`did not finish` or `none`** — nothing has been checked, so there is no failure to route anywhere. Run the project's validation yourself first, then re-enter this list with the exit code your own run returned.
  - **the line is absent** — the report is incomplete. The word "done" is not a verification result and is never read as one. Either re-dispatch the executor for that one missing line, or run the project's validation yourself as in the previous case. Never advance to the commit on a report whose verification you cannot name.
