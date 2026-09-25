# Correcting four passages of the plan and its specification

**Status:** Complete
**Filed by:** coder, Kai Stalmann <kai@qantr.com>

Executes option 1 of `260908-2051_*_is-a-completed-plan-amended-when-one-of-its-verification-lines-turns-out-unreachable.md`:
a completed plan's closed marker does not exempt its text from correction. Text only. No `[DONE]`
marker, no `**Status:**` line, no filename and no file marker moved, and no reconciliation-log entry
added — that log is the reconciler's.

## Files changed

Both in this Circle's planning store:

- `260907-1450_*_plan-bounded-executor-dispatches.md`
- `260907-0820_*_spec-bounded-executor-dispatches.md`

## The four corrections

1. **Plan step 5, `## When you read the clock.`** (line 218) prescribed the overshoot illustration
   *"an agent that enters a 30-minute unit at minute 19 returns at minute 49"* while the same step's
   acceptance criterion and its `Do not:` line forbid any number of minutes in the written file. The
   criterion governs, so the prescription now states the residual without numerals — the wording
   `rules/bounded-dispatch.md` was actually built with — and adds one clause naming the criterion as
   the half that governs. Record: `260908-1619_*_plan-step-5-prescribes-a-minute-illustration-its-own-acceptance-criterion-forbids.md`.
   **The same illustration was upstream in the specification's residual 2** (line 772) and is corrected
   there in the same terms, which is why the specification was in scope at all.
2. **Plan step 7** (line 290) asked for *"exactly eight blocks"* in the regenerated golden where its
   own acceptance criterion names seven. Seven governs: seven bound agents, seven changed blocks,
   measured at execution. The figure is now seven; the clause *"and no eighth"* still reads correctly
   after it. Record: `260908-1648_*_plan-step-7-asks-for-eight-changed-golden-blocks-where-seven-bound-agents-exist.md`.
3. **Plan step 8, verification item 3** (line 350) expected `grep -c '045a14f\|f38f37d'` over
   `agents/orchestrator.md` to reach 0. It reads 1, because a third passage carrying `f38f37d` stands
   in `## Staging check` and the same step forbids moving it. The item now reads the two hashes
   separately — `045a14f` to 0, `f38f37d` to 1 — and names the surviving passage, which is the first
   of the two repairs that record's acceptance test allows. Record:
   `260908-1720_*_plan-step-8s-third-verification-expects-a-hash-count-of-zero-that-a-third-passage-makes-unreachable.md`.
4. **`## Where this Circle stops`** (line 560) asked whether four pinned values are byte-identical to
   `abcaa823`. `RULE_BASELINE` is not, by a comment block commit `01e0f688` rewrote in another
   checkout before this session began, with every numeric entry unchanged. This one was falsified from
   outside rather than by its own step, so the clause is corrected by saying what it means — values,
   compared entry by entry, rather than bytes — and by naming the comment change as the reason the
   literal reading answers no while no baseline moved. Measurement: `260908-1845-orchestrator-byte-reckoning.md`.

## Verification

- `cd hooks && npm test` — exit 1. 54 of 55 files pass, 946 of 947 tests.
  `workbench-citation-lint.test.ts` (13 tests) and `plan-stopping-section-lint.test.ts` (11 tests) are
  both green, and so are the three intermittently failing harness-spawning tests of
  `260908-1719_*_three-harness-spawning-tests-fail-intermittently-so-the-suite-cannot-answer-the-circles-green-clause.md`.
  The one failure is `citation-sweep.test.ts`, on a file outside this task's scope — see below.
- `bin/fusion-citation-sweep --dry-run` — `files=1 rewrites=1 ... bare-record=1`. Neither corrected
  file is in the rewrite list; both read `rewrites=0`.
- `grep -n 'minute 19\|minute 49\|30-minute'` over both files — three hits in the plan, none in the
  specification. All three are text that names the contradiction rather than prescribing the
  illustration: the step-5 `[DONE]` note at line 208 recording that it was not written and why, the
  reconciliation log at 709, and the risk-table row at 636.
- `grep -n 'eight blocks'` over the plan — one hit, the reconciliation log at line 711 naming the
  correction.
- `grep -n '045a14f'` over the plan — three hits, of which the verification item is line 350, now
  reading the two hashes separately.

## Two things left standing, deliberately

**The risk-table row at plan line 636** repeats the minute illustration and its mitigation column
claims `rules/bounded-dispatch.md` *"states the example rather than softening it"*, which the built
file does not. It is a fifth site, outside the four this task was given, and the dispatch forbade
touching one. It is the only remaining site where the illustration is asserted rather than reported,
so `260908-1619_*_plan-step-5-prescribes-a-minute-illustration-its-own-acceptance-criterion-forbids.md`
is not fully satisfied by this pass.

**The suite's one red test is not caused by these edits.** This Circle's own session history file
`260908-1529-orchestrator-session.md`, at line 65,
cites the plan with a spelled marker letter instead of the wildcard. The file is uncommitted and the
citation is on a line this session added; the committed copy carries none. One character fixes it, and
the file belongs to the orchestrator.
