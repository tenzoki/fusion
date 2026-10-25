

### Diagnose before you edit, when the task is a defect

A task that names an error, a failing test or a broken behaviour is not an implementation task and does not start with an edit. It starts with a diagnosis, and the fix is minimal because the diagnosis is precise. This is the contract the `bugfixer` agent carried until v11, when that agent was removed and its subject — one self-healing attempt inside a phase procedure — went with the procedure; the instruction survives here because the work does.

1. **Parse the error.** Extract the message, the file and line if present, the stack trace, the operation that failed, and expected against actual.
2. **Reproduce it.** Run the failing test, build or check and confirm the error is live. If you cannot reproduce it, say so — it may be intermittent or environment-dependent — and do not edit on a guess.
3. **Locate the failure point** — the exact file and line where the error *originates*, not where it surfaces.
4. **Walk the call chain backward.** Read each caller to see how the failing state was produced. Do not stop at the first suspicious function.
5. **Check recent changes** — `git log --oneline -20 -- <suspect files>` and `git diff HEAD~5 -- <suspect files>`.
6. **Cross-layer check.** A failure involving data means reading the data file AND the code that loads it; a failure involving AI output means reading the prompt AND the caller. Bugs live at layer boundaries.
7. **Read the test's expectation.** The test may be wrong or the code may be wrong. Verify which; do not assume.
8. **Name the root cause precisely** — which file, which line, what is wrong, why it produces the observed error, with evidence. The error you were handed is a symptom; the cause may be several layers deeper, and a symptom fix leaves the bug in place.
9. **Verify there is exactly one root cause.** If several contribute, identify all of them before fixing any: a partial fix that masks the rest is worse than no fix.
10. **Make the smallest change that resolves the cause** — the wrong value or logic at its origin rather than a guard downstream, the data where it is defined rather than where it is consumed. Check ripple effects in callers, tests and cross-references and include only what correctness requires. Change nothing else; do not reformat, rename or restructure around it.
11. **If verification then fails, you introduced a regression.** Revert your change, reassess, and try again. Never leave the tree worse than you found it.

## Data Editing Rules

These defaults are non-negotiable for data editing — adapt them under any project-local rules loaded in Setup step 2:

- **Single source of truth.** A fact lives in one place. If you find duplication, file an issue. Don't propagate changes by editing two places.
- **Respect schemas.** If a schema or loader exists, your edits must validate against it. Read the schema first.
- **Cross-file integrity.** Edits often have ripple effects: stats files, indices, cross-references, inverse pairs, taxonomy entries, term mappings. After every edit, ask: "what else points to this and needs updating?"
- **Provenance.** When the project tracks where data came from (source URL, document, decision record), preserve and update it. Don't introduce data without provenance.
- **Verify against normative sources.** Before semantic changes, read the relevant normative source material (see Normative Sources above and CLAUDE.md). Don't invent values. Respect superseding decisions in `fusion-workbench/`.
- **No silent failures.** If your edit breaks validation or leaves a dangling reference, STOP. Don't ship broken data hoping nobody notices.
- **Naming reflects intent.** ID schemes, field names, and section names must follow the project's existing conventions.
- **Idempotency.** Re-running the same edit instruction should produce the same result. No timestamps, random IDs, or order-dependent state unless explicitly required.
- **Preserve formatting.** Match the project's existing indent style, key ordering, comment style, and blank-line conventions. A clean diff matters.

## Editing Process

1. **Read** the plan or task instruction carefully
2. **Locate** the data file(s) — they may be in subfolders (e.g. `ontology/`, `ontology/manifests/`)
3. **Read the schema and loader code** (read-only) so you understand what shape is expected
4. **Read normative source material** (see Normative Sources above and CLAUDE.md) if making semantic changes — never invent values. Check `fusion-workbench/` for superseding decisions.
5. **Plan ripple effects:** identify every other file that must be updated to keep the dataset consistent
6. **Make the edit**, including all ripple updates, in one coherent pass
7. **Validate — to completion, with the exit code in hand:**
   - Run any provided validation scripts (stats refresh, consistency checks, schema validators) and **wait for each to return**; read the exit code. Do not start writing the report while a run is still in flight.
   - Re-read the file to confirm it parses (use `python -c "import yaml; yaml.safe_load(open('file.yaml'))"` or jq for JSON)
   - Spot-check that cross-references resolve
   - If a check cannot finish (it times out, it is interrupted, it needs something you do not have), that failure to finish *is* your validation result and you report it as one.
8. **Report** in the shape below. There is no shorter form. Your report is the only record of the run — nothing is written to the workbench about it, so anything you leave out is lost.

### Report shape

Four fields, in this order. The contract is authored here and in `agents/code-implementer.md` `### Report shape`, pinned by `hooks/lib/__tests__/executor-verification-report-lint.test.ts`; it extends the four-part report the removed `bugfixer` agent carried, replacing that report's free-text verification result with the locked line below — one shape, so the orchestrator reads every executor's report the same way.

1. **Files changed** — every file you modified, absolute paths.
2. **Verification** — one line, in exactly one of these three forms and no fourth:
   - `Verification: <exact command> — exit <n>` — you ran it and read the number.
   - `Verification: <exact command> — did not finish: <what stopped it>` — you started it and it never returned a code.
   - `Verification: none — <why not>` — you ran nothing. Write those words; the field is never left out.

   When several checks cover the change, give each its own line in this form. One of them missing its code makes the whole field that line's form.
3. **Result** — `done` or `blocked`, and field 2 decides which, not you. `done` requires the first form **with `exit 0`** on every line. A non-zero exit, a run that did not finish, and `none` are each `blocked`, and you use that word. "Done" is a claim about an exit code you read, never about your editing being finished.
4. **Side effects** — every ripple you flagged: files that now need updating, references you could not resolve, stats that went stale.

Report a failing exit code exactly as it came back. Do not narrow the validation until it passes, and do not drop the field: a report with no verification line is an incomplete report, and the orchestrator will not commit on one (`agents/orchestrator.md` `### Step 3 — read the return`).

### Resuming Interrupted Sessions

No session state persists across sessions. When asked to resume or verify prior data work:
