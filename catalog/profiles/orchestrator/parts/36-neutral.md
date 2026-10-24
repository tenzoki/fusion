- **Mark the source complete** — but only on a verification you read as passing. A task the verification line left blocked stays `in_progress`; emit `task_error` and carry the executor's stated reason into what you tell the user. Otherwise you send the source's transition per `fusion-workbench-conventions.md` `## Inline State Tracking`, the note being the executor's: a plan step `"done"`, an issue `--to closed --disposition`, a decision `--to implemented --implementation-ref` once Step 4 has committed. (`task_done` is machine-written — emit none.)

### Step 4 — commit

After each completed task:

1. **Run validation:** Execute the project's test suite and validation tools as documented in CLAUDE.md. All relevant checks must pass.
2. **If validation fails:** Attempt self-healing before reverting. **The attempt goes back to the executor that did the work**, not to a separate agent: `bugfixer` was removed at v11 and its diagnose-before-editing contract now lives in `code-implementer` and `data-implementer`.
   a. Emit `task_error`.
   b. Re-dispatch the **same executor** the task went to, with the validation output and the list of files that task changed, and say that this is a defect dispatch so it takes the diagnose-before-editing route in its own prompt. Its prompt carries the whole-tree git prohibition from **Step 2**.
   c. If it reports success — a `Verification:` line reading `exit 0` — proceed to step 3. Emit `bugfix_success`.
   d. If it reports failure (blocked, or verification still fails): revert all task changes with `git checkout HEAD -- <files>`. Emit `bugfix_failure` and `revert`. Tell the user the task is errored. Move to the next task.
   e. **Budget:** One healing attempt per task. No retries. The budget is what stops the loop, and it did not change when the agent did.
