
### Step 4 — commit

After each completed task:

1. **Run validation:** Execute the project's test suite and validation tools as documented in CLAUDE.md. All relevant checks must pass.
2. **If validation fails:** Attempt self-healing before reverting. **The attempt goes back to the executor that did the work**, not to a separate agent: `bugfixer` was removed at v11 and its diagnose-before-editing contract now lives in `code-implementer` and `data-implementer`.
   a. Emit `task_error`.
   b. Re-dispatch the **same executor** the task went to, with the validation output and the list of files that task changed, and say that this is a defect dispatch so it takes the diagnose-before-editing route in its own prompt. Its prompt carries the whole-tree git prohibition from **Step 2**.
   c. If it reports success — a `Verification:` line reading `exit 0` — proceed to step 3. Emit `bugfix_success`.
