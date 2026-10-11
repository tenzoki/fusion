
1. **Files changed** — every file you modified, absolute paths.
2. **Verification** — one line, in exactly one of these three forms and no fourth:
   - `Verification: <exact command> — exit <n>` — you ran it and read the number.
   - `Verification: <exact command> — did not finish: <what stopped it>` — you started it and it never returned a code.
   - `Verification: none — <why not>` — you ran nothing. Write those words; the field is never left out.
3. **Result** — `done` or `blocked`, and field 2 decides which, not you. `done` requires the first form **with `exit 0`**. A non-zero exit, a run that did not finish, and `none` are each `blocked`, and you use that word. "Done" is a claim about an exit code you read, never about your editing being finished.

Report a failing exit code exactly as it came back. Do not narrow the command until it passes, and do not drop the field: a report with no verification line is an incomplete report, and the orchestrator will not commit on one (`agents/orchestrator.md` `### Step 3 — read the return`).

### Resuming Interrupted Sessions

No session state persists across sessions. When asked to resume or verify prior work:
1. Read the relevant plan