# An executor may report done while its own verification run is still in flight

**Filed:** 260805-0629
**Severity:** Medium-High
**Domain:** code
**Filed by:** consultant (from an orchestrator session note in a consuming project)
**Scope:** `agents/coder.md` Implementation Process, `agents/ontocoder.md`, `agents/orchestrator.md` Step 3a step 5 and Step 3b step 1

---

The coder is told to test and then to report, and nothing binds the two. No prompt requires
the verification command to have finished, and the report has no field for its result. The
orchestrator receives "done" with no way to tell whether the build is green, still running,
or never started.

Reported cost in the consuming session: about forty minutes of wall clock across two
executor dispatches.

---

## Problem

`agents/coder.md:63-70` is the whole completion contract:

    4. **Test** your changes compile and pass existing tests
    5. **Log** to `$OUT_HISTORY` what you implemented …
    6. **Report** to user: list of changed files + history file path

Step 4 states an obligation with no completion condition, and step 6 defines a report with
two fields, neither of which carries the outcome of step 4. An executor that starts a long
check and reports while it runs violates nothing written down.

The orchestrator does not close the gap on receipt. Step 3a step 5, "Verify output"
(`agents/orchestrator.md:334-336`), checks one thing only: whether the agent modified files
outside its declared scope. Build state is not examined. The orchestrator then runs the
project's validation itself at Step 3b step 1 (`:349`) before committing, which is correct
and is not the complaint. The complaint is that the executor's own run was still holding the
build when the orchestrator's run needed to start, so the orchestrator waited for a run
whose result it could not see and then started a second one it could.

The prior art for the missing field is one directory over. `agents/bugfixer.md:98-102`
already defines a four-field report, and the third field is "Verification result
(pass/fail)". The bugfixer's caller-facing contract is also already load-bearing in the
orchestrator: Step 3b steps 2c and 2d branch on whether the bugfixer reported success or
failure (`agents/orchestrator.md:353-354`). The coder and the ontocoder have no equivalent.

## Impact

Reported by the orchestrator of the consuming session: "beide coder meldeten zurück, bevor
ihr eigenes make check durch war — ich musste jedes Mal ihren Lauf abwarten und dann einen
eigenen, mitgeschnittenen starten. Rund vierzig Minuten Wanduhr." The session protocol
recording it lives in that project and is not reachable from this repository, so the timing
and the two dispatches are reported rather than checked here. The prompt-level gap they name
is checked, and is cited above.

The cost is not only the duplicated run. An unfinished check that the orchestrator cannot
observe is indistinguishable from a check that passed, and Step 3b's self-healing branch
(dispatch the bugfixer on failure) keys on the orchestrator's own run, so a silent executor
failure surfaces one full validation cycle later than it needed to.

## Reporter's proposed remedy

From the same note: "Nächstes Mal gehört in den Auftrag, dass ein Rückmelden ohne Exit-Code
bedeutet, dass nichts committet werden kann."

Stated as a contract, that is: an executor report without a verification exit code is
incomplete, and an incomplete report blocks the commit for that task rather than proceeding
to Step 3b. It puts the obligation where the knowledge is, since only the executor can
observe its own run, and it gives the orchestrator a checkable condition instead of an
assumption.

## What a fix has to do

Extend the report shape that `agents/bugfixer.md:98-102` already defines to `coder` and
`ontocoder` rather than introducing a second reporting mechanism. Three pieces:

1. **A completion condition on the test step.** `agents/coder.md:68` should require the
   verification command to run to completion before the agent reports, and should name what
   to do when it cannot finish (report the failure to finish, do not report done).
2. **A verification field on the report.** The command run and its exit code, alongside the
   changed-file list and the history path.
3. **A receipt check in the orchestrator.** Step 3a step 5 currently verifies scope only. It
   should also verify that the report carries a verification result, and treat its absence
   as a blocked task rather than proceeding to Step 3b.

The third piece is what makes the first two hold. A prompt obligation with no reader is the
failure mode this project has already recorded once, at `CLAUDE.md` "Problem 11": a "MUST"
in an agent prompt was overridden under task pressure, and the fix was to give the procedure
a checking surface rather than stronger wording.

## Cross-references

- `agents/coder.md:63-70` — Implementation Process, the test step and the report step.
- `agents/coder.md:74-79` — Resuming Interrupted Sessions, which does require running the
  build to confirm a green state. The obligation exists on the resume path and not on the
  normal path.
- `agents/bugfixer.md:91-102` — the verification phase and the four-field report, the prior
  art to extend.
- `agents/orchestrator.md:334-336` — Step 3a step 5, scope check only.
- `agents/orchestrator.md:349-356` — Step 3b, the orchestrator's own validation and the
  bugfixer branch that a missing executor result delays.
- `rules/critical-stance.md:25` — reuse before you build, which is why this points at the
  bugfixer's report shape rather than at a new one.
