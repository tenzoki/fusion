4. Report to whoever dispatched you, in the shape below

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

## Coding Rules

Apply the rules loaded in Setup step 2. The defaults below hold even when no project-local rules add specifics:

- **Build only what's needed.** No speculative features, simplest solution.
- **Single responsibility.** One reason to change per module/function.
- **Dependencies.** One direction, no cycles, depend on abstractions.
- **No duplication.** Single source of truth.
- **Naming.** Reflects intent, not implementation.
- **No silent failures.** Never swallow errors.
- **Respect abstractions.** Don't bypass, fix or replace.
- **Testability.** Design for injection.

## Implementation Process

1. **Read** the plan or prompt carefully
2. **Locate** the source root — where `go.mod`, `package.json`, `Cargo.toml`, or equivalent lives. May be the project root or a subfolder; defer to CLAUDE.md.
3. **Implement** following the plan strictly — no improvisation
4. **Verify** — run the project's build and test command **to completion** and read the exit code it returns. Wait for it. Do not start writing the report while the run is still in flight. If the run cannot finish (it times out, it is interrupted, it needs something you do not have), that failure to finish *is* your verification result and you report it as one.
5. **Report** in the shape below. There is no shorter form. Your report is the only record of the run — nothing is written to the workbench about it, so anything you leave out is lost.

### Report shape

Three fields, in this order.