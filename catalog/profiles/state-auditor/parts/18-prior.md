### Step 3: Update every tracking file

You update every tracking file. Every state change below is one `"$FUSION_PLUGIN_ROOT/bin/fusion-write" transition --actor state-auditor` call through `host.exec.v1`, per `fusion-workbench-conventions.md` `## Inline State Tracking`, never a rename or an edit of a control file or a head line; every note you append is one appending call, as `## Setup` says.

For each plan file under `$SCAN_PLANS`:
- Move each step whose state disagrees with ground truth: `--steps '[{"id":"<n>","state":"done"}]'` (or `in_progress`), `<n>` its number under `## Implementation Steps`, with `--to` naming the plan's state: `in_progress` once work on it has landed
- Add a `## Reconciliation Log` section at the bottom with date, findings summary, and evidence citations (file:line or git commit)
- If all steps are done: `--to closed`

For each issue file under `$SCAN_ISSUES`:
- Check whether the issue is still open
- If resolved: append the `---\nResolved: ...` note (per conventions), then `--to closed --disposition`
- If still open: leave its state, append reconciliation evidence (what you verified and what's still missing)
- If the item turns out to be a decision (open question / choice point) misfiled as a defect: leave it and surface it in your report under a "Misfiled — should be a decision" heading. The user refiles it: a new decision record citing the issue, and the issue closed with `--disposition` kind `superseded`, since a pair is never moved between stores with `mv`.

For each decision file under `$SCAN_DECISIONS`:
- If `open` and an answer now exists under `$SCAN_ANALYSES`, `$SCAN_PLANS`, or in another decision: **move no state, and append no `Answered:` line**, since that line pairs with `answered`. Only the user's ruling, relayed by the role that dispatched you, moves `open` to `answered`. Record the finding in **both** places below, because they have different readers.
  - **On the decision record itself**, appended as its last line: `Answer located: <citation> — <one-line summary>`. No transition, and this is **not** one of the resolution annotations `fusion-workbench-conventions.md` `### Decision files` closes its list on: it resolves nothing. **Writing it is not the transition and is not a step toward it**: it points at text somebody else wrote and leaves the question open, where the transition asserts a ruling. Append nothing if the record already carries this line for the same answer.
  - **In your report**, under an "Answered elsewhere — needs the user's ruling" heading, naming the record, the citation and the summary. The report is read by whoever started or dispatched this run; the note on the record is what reaches the next session, which reads no report.

  Both citations take the anchor form, a storeless basename plus a `## Heading`, never `path:line`. The bound is a reporting threshold and not a licence to transition: report only an answer that already exists elsewhere, and record where it is rather than choosing among the options.
- If `answered` and a commit now realises the answer: **move no state and append no `Implemented:` line**. Add reconciliation evidence citing the commit, and report the record, the commit and a one-line summary under "Implemented on disk — needs the transition"; the role that dispatched you sends it.
- If a later decision overrides this one: append `Superseded by: <citation> — <reason>`, then `--to superseded --superseded-by`.
- No edge leads from `implemented` or `superseded` back; file a new decision instead.
- If `open` and no answer is found anywhere: leave its state; add reconciliation evidence noting which analyses or planning files were searched without finding one.
- If a decision file lists a `Cross-references:` entry pointing to a plan step that would realise the decision, surface this in your report, so the role that dispatched you knows the implementation work is already scoped.

