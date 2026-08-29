# Make an executor's report carry the result of its own verification run

**Date:** 2026-08-10 04:00
**Status:** Complete
**Agent:** coder
**Task:** T8 — `I:260805-0629-verify-field`
**Source:** `260805-0629_*_an-executor-may-report-done-while-its-own-verification-run-is-still-in-flight.md`

## What was wrong

`agents/coder.md` stated two obligations and bound neither to the other: step 4 said test,
step 6 said report, and the report had two fields — changed files and the history path —
with nowhere for step 4's outcome to land. An executor that started a long check and
reported while it ran violated nothing written down. `agents/ontocoder.md` carried the same
shape at steps 7 and 9. `agents/orchestrator.md` Step 3a step 5 checked scope only and read
the word "done" at face value.

## What was built

**One report shape, extended from `agents/bugfixer.md`, not a second mechanism.** The
bugfixer's four-field report already carried "Verification result (pass/fail)" and the
orchestrator already branched on it; the two executors now report in that shape with the
field made precise.

The load-bearing part is not the added field, it is the **derivation**. `Verification:`
admits exactly three forms and no fourth — an exit code, a run that did not finish, or
`none` — and the `Result` field is defined *from* it: `done` requires the first form with
`exit 0`. The word "done" therefore names an exit code the agent read, not the fact that
its editing stopped. There is no arrangement of the shape in which a missing verification
goes unstated: leaving the field out leaves the report incomplete by its own definition,
and the third form exists precisely so "I ran nothing" has a place to be written.

The split is MECE over one question — did a verification run produce an exit code: it did,
it ran and did not, it never ran.

**The reader.** `agents/orchestrator.md` Step 3a step 5 now reads that line before it reads
scope, with four cases: `exit 0` proceeds; a non-zero exit blocks the task and goes to Step
3b, whose own validation run confirms the failure and carries it into the existing
self-healing branch (no parallel bugfixer path was added); `did not finish` / `none` means
nothing has been checked, so the orchestrator runs the validation itself and re-enters the
list with its own code; an absent line is an incomplete report and never reaches Step 3b's
commit. Step 6 was given the matching exclusion, so a blocked task is not marked complete.

**The gate.** `hooks/lib/__tests__/executor-verification-report-lint.test.ts` — 13 tests.
It asserts the three forms and the derivation in both executor prompts, the citation of
`bugfixer.md` as the shape extended, the surviving prior-art field in `bugfixer.md`, and
the four branches plus the commit refusal in the orchestrator's step 5. Two negative cases
feed it the pre-fix coder process and a half-fixed shape whose `done` is stated independently
of the field, so the gate is shown to fail on the defect rather than only to pass on the fix.

## Honest scope: a stronger convention with a reader, not an enforcement

Nothing here makes an unverified report *impossible to write*. The report is free text
produced by a model, and a prompt instruction is overridable under task pressure — this
project already recorded one case of a "MUST" in the orchestrator prompt losing to the
urgency of a user request (`CLAUDE.md` "Problem 11"), and `rules/critical-stance.md` §4
says the same about its own `Decidability:` line.

Three things were done that are stronger than a fourth bullet, and it is worth being exact
about which is which:

1. **The obligation now lives at the point of reporting**, in the report's own shape, rather
   than in a process step upstream of it. Tonight's live evidence is that the obligation is
   obeyed when stated there: every executor dispatched was told in its dispatch prompt to
   report its verification result, all complied, and two reported failures they could have
   omitted. That is the arrangement being made permanent.
2. **The report has no shape in which the omission is silent.** Dropping the field does not
   produce a shorter valid report; it produces one the orchestrator is told to reject.
3. **A second party reads the field.** This is the only actual enforcement, and it is the
   same kind fusion already relies on elsewhere: the human at the approval gate for
   `Decidability:`, the orchestrator here. The lint enforces nothing at run time either — it
   keeps the contract from quietly leaving the three prompts or drifting into two divergent
   shapes, which is a maintenance guarantee, not a behavioural one.

A real enforcement would need the executor's verification to be observable outside its own
report — the dispatcher capturing the exit code itself, or a hook recording that a check ran
between dispatch and return. That is a different mechanism and was not in scope here.

## Files changed

- `agents/coder.md` — Implementation Process step 4 (completion condition) and step 6, plus
  a new `### Report shape` section.
- `agents/ontocoder.md` — Editing Process step 7 (completion condition) and step 9, plus a
  new `### Report shape` section with the existing side-effects field folded in as field 4.
- `agents/orchestrator.md` — Step 3a step 5 (verification line read first, four cases) and
  the lead-in to step 6.
- `hooks/lib/__tests__/executor-verification-report-lint.test.ts` — new.

## Verification

`cd hooks && npm test` — exit 1: `934 passed, 1 failed`, the single failure being
`rules-emission-golden`, whose diff is the byte count of
`rules/fusion-workbench-conventions.md` (39529 → 41680). That file was not touched by this
task; the fixture is regenerated at the end of the session. No other test moved. The new
lint alone: `npx vitest run lib/__tests__/executor-verification-report-lint.test.ts` — exit
0, 13 passed.

## Not done here

The tasklist entry and the issue marker were left for the orchestrator's Step 3a step 6,
and `.claude-plugin/plugin.json` was not bumped — both belong to the committing agent.
