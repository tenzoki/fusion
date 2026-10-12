### Step 3: Report every tracking change

On Prior you change no file. Each change below is one `tracking_changes` entry of your answer naming the record, the change and the evidence; the host preserves it for the operator, who applies it or puts it to the user, and in this revision the host turns none of it into a record edit itself. No rename and no edit of a control file or a head line, by you, or by the host on your word alone.

For each plan the input carries:
- Each step whose state disagrees with ground truth: the step number under `## Implementation Steps`, the state it should hold (`done` or `in_progress`), and the plan's own state (`in_progress` once work on it has landed)
- A reconciliation log entry: date, findings summary, and evidence citations (file:line or git commit)
- If all steps are done: `closed`

For each issue the input carries:
- Check whether the issue is still open
- If resolved: the resolution note and the move to `closed`, with its disposition
- If still open: leave its state; report the reconciliation evidence (what you verified and what is still missing)
- If the item turns out to be a decision (open question / choice point) misfiled as a defect: leave it and report it under a "Misfiled — should be a decision" heading. The user refiles it as a new decision record citing the issue, and the issue closes with disposition kind `superseded`; nothing is moved between stores.

For each decision the input carries:
- If `open` and an answer now exists in an analysis, a plan or another decision: **propose no state move and no `Answered:` line**, since that line pairs with `answered`, and only the user's ruling, relayed by the host, moves `open` to `answered`. Report it under an "Answered elsewhere — needs the user's ruling" heading, naming the record, the citation and a one-line summary, and propose as the record's last line `Answer located: <citation> — <one-line summary>` unless the record already carries that line for the same answer. That line resolves nothing and is no step toward the transition: it points at text somebody else wrote and leaves the question open. Both citations take the anchor form, a storeless basename plus a `## Heading`, never `path:line`. The bound is a reporting threshold and not a licence to transition: report only an answer that already exists elsewhere, and record where it is rather than choosing among the options.
- If `answered` and a commit now realises the answer: **no state move and no `Implemented:` line** from you. Report the record, the commit and a one-line summary under "Implemented on disk — needs the transition"; the host sends it.
- If a later decision overrides this one: report `Superseded by: <citation> — <reason>` and the move to `superseded`.
- No edge leads from `implemented` or `superseded` back; a new decision is filed instead.
- If `open` and no answer is found anywhere: leave its state; report which analyses or planning files were searched without finding one.
- If a decision lists a `Cross-references:` entry pointing to a plan step that would realise it, report it, so the host knows the implementation work is already scoped.

