# The Turn budget becomes a configured value

**Status:** Complete
**Agent:** coder
**Task:** 10 · `I:260811-1734c`
**Closes:** `260811-1712_*_max-turns-is-hardcoded-in-eight-places-and-cannot-be-set-per-project.md`
**Baseline:** `bb9d66d`

## What was wrong

`5` was written into `agents/orchestrator.md` eight times, in four spellings, and no project
could change any of them. One of the eight already called the number a *default* — a word
that was false, because no source could override it.

## What was built

**One container in the configuration loader.** `hooks/lib/config.ts` gained `orchestrator`,
with the single leaf `maxTurns`. It takes the same per-leaf walk as every guard setting:
project `fusion-guard.json`, then the plugin's `hooks/config.json`, then `DEFAULTS`. The
reuse was the requirement in the record and it held without strain — the only thing the
loader had to learn was one more leaf rule.

The type check is `isPositiveInteger`, shared with `escalation.blocksBeforeHalt` rather than
duplicated. That is what decides the out-of-range cases: `0`, a negative, a decimal and a
string are each dropped, named in an advisory, and inherit the default. No ceiling.

**One reader.** `hooks/turn-budget.ts` behind `bin/fusion-turn-budget`, in the shape
`bin/fusion-churn-rank` established: a thin bash wrapper resolving `hooks/dist/` relative to
itself, one `KEY=value` line on stdout, diagnostics on stderr, exit 2 for no workbench and
exit 3 for missing compiled hooks. Measured against a scratch project: `12` when declared,
`5` with the advisory when the declaration is unusable, exit 2 outside a workbench.

**The default lives in exactly one place** — `DEFAULTS.orchestrator.maxTurns` — and
deliberately not in the plugin's `hooks/config.json`. Every other leaf is spelled in both,
and the loader's docstring already says nothing keeps the two agreeing. One copy cannot
disagree with itself.

**Eight prompt sites, none of them a number now.** The Turn-loop header, the Turn-start
dashboard refresh, the Step 3d table row, the Rebalance-bounding paragraph and its Phase-3
sub-paragraph, the `agentstate.yaml` schema line, and the dashboard counters paragraph. All
name `<max-turns>` or `progress.max_turns`.

**The gate.** `hooks/lib/__tests__/turn-budget-lint.test.ts`. Non-vacuity was measured, not
assumed: its eight patterns find all eight literals in `git show bb9d66d:agents/orchestrator.md`
and zero in the current file. Its failure message names the two routes a legitimate change
takes, so the gate does not become the thing to delete.

## The one case the record left open, and how it was cut

The read can fail three ways: helper absent from an older install, exit 2, exit 3. The split
has to be complete, and a fourth option — invent a number — is exactly the defect being
removed. So the three collapse into one branch, and the branch is a *state*: the budget is
**unresolved**. Setup reports which of the three and its remedy; `progress.max_turns` is
omitted from `agentstate.yaml` rather than filled with a word (`/fusion:circle-stash` parses
that key with `[0-9]+`, and an absent key is a case it already handles); the dashboard shows
`--`; the Max-Turns circuit-breaker row is not evaluated, and the prompt says so where the
row is. The loop stays bounded by the other five conditions and by convergence — but not by
a count, and the session is told that plainly.

## Two edits outside the eight sites, both to stop a claim going stale

- `skills/setup/SKILL.md` inlines Setup, so it resolves the budget too — by **citing** the
  orchestrator's block, not copying it, the way it already cites the churn ranking and the
  domain cascade. Its header sentence naming "the two steps that cite one without an inline
  fallback" became three.
- `README-hooks.md` gained the `turn-budget.ts` row beside its siblings.

`hooks/lib/__tests__/config.test.ts` needed two structural touches: the anti-regression
comparison against the pre-project-layer loader now runs over a named `guardSurface()` that
excludes the one container no hook reads, with the reason written down; and the anti-vacuity
plugin layer in the template suite grew an `orchestrator` section so a template that ever
restated the key still fails there.

`.gitignore` needed `!bin/fusion-turn-budget` — `bin/*` would otherwise have shipped a
plugin with a helper its own prompts call. The file's own warning comment is what caught it.

## The scope bound, and what deciding it would take

Untouched, as the record required: the Directive-revisions cap of 1
(`progress.directive_revisions_this_session`), the one-bugfixer-attempt-per-task rule, and
the three-errors-per-Turn cascade threshold.

What the call needs, now that there is something real to weigh it against:

1. **The mechanism generalises at no cost.** A second leaf under `orchestrator` — say
   `maxDirectiveRevisions` — is four lines in `config.ts` and one more line of output from
   the helper. There is no argument from effort for leaving them fixed.
2. **They are not the same kind of number, and that is the actual question.** The Turn
   budget is a *resource* allowance: how much work this project wants one session to attempt.
   The other three are *safety* thresholds — the point at which fusion stops trusting the
   loop to converge. A project raising its own safety threshold is raising it against itself,
   which is a different decision from raising a work allowance, and the guard's own
   `guard.enabled` precedent says fusion does not always let a project loosen what governs it.
3. **The concrete asymmetry to weigh:** the Turn budget was hit by a real session as a real
   constraint (31 records closed, 37 still queued). Nobody has reported hitting the
   Directive-revisions cap or the bugfixer-attempt rule and wanting it higher. Deciding all
   three now would be configuring for a pressure nobody has measured.
4. **The cheapest next step** is to leave them and let the same evidence accumulate: if a
   session reports being stopped by one of the three, that report is the input the decision
   is missing.

## Verification

`cd hooks && npm test` — exit 0. 51 files, 1321 tests. Baseline was 50 files, 1301 tests;
the delta is the 10 lint cases in the new file and the 10 loader cases added to
`config.test.ts`.
