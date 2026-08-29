An unknown global option that carries its own value should not also consume the next word

---

The resumed option walk in `classifySegment` (commit `9716ee5`, plan step 3)
treats every unrecognised global option as though it might take a separate
value, so it skips the following token as well. For an option written in the
attached form, `--exec-path=/x`, that is provably wrong: the value is already
part of the token, and no further word belongs to it.

The consequence is three of the ten measured false denials the step accepted as
its price. `git --exec-path=/x grep switch` is denied today because `grep` is
consumed as the option's value and `switch` lands in subcommand position.

---

Context.

Not setting `unknownOption` for any token containing `=` removes those three
without allowing anything new: an attached-value option cannot be the form that
hides a subcommand behind a separate word, which is the entire failure mode the
resumed walk exists to close.

The `coder` implementing step 3 identified this, deliberately did not build it,
and said why: the refinement appears neither in the plan nor in the remedy that
`260804-1333_*_an-unrecognised-git-global-option-swallows-the-subcommand-and-the-invocation-reads-as-an-unrecognised-program.md` settled, and quietly extending a security-relevant classifier past
its planned scope is how a fix acquires unreviewed behaviour. That judgement was
right, and this record exists so the improvement is not lost to it.

Why it is worth taking. This project retired an entire classifier over false
alarms: 17 in four days of one consuming project, against 0 real hits. The
remaining seven false denials are the accepted cost of fail-closed, but three of
them are not a cost of anything. `git --no-pager grep switch`, the one form
somebody plausibly types, is not among the three and stays denied either way.

Acceptance criteria.

1. A global option token containing `=` does not cause the next token to be
   skipped.
2. The corpus measurement is re-run: nothing newly allowed against the
   `451a07e` baseline, and the newly-denied count falls from 145 to 142.
3. The cost rule recorded in the step-3 tests, and whatever text step 6 carries
   into `rules/git-branch-discipline.md`, is updated to match the smaller set.

Filed by the orchestrator from the step-3 completion report, 2026-08-09.
Depends on plan `260809-1229_*_plan-five-severe-guard-defects.md`
step 6 for criterion 3.

---

**Reconciliation 260809-1651-reconciliation.md (reconciler, domain `code`) — stays `_o_`. Verified as genuinely open, not as bookkeeping left behind.**
The refinement was not built. `classifySegment` sets `unknownOption = true` for every unrecognised `-`-prefixed token without testing for `=` (`hooks/lib/git-branch-guard.ts:283-285`), so `--exec-path=/x` still causes the next word to be skipped. Criterion 1 unmet; criteria 2 and 3 follow from it. The record's own dependency on step 6 of `260809-1229_*_plan-five-severe-guard-defects.md` is now discharged in the sense that step 6 has landed — `rules/git-branch-discipline.md` `## One deny you will not have expected` carries the cost as a rule with an open example set, so criterion 3 becomes an edit to existing text rather than a wait for it to be written.

---
Resolved: `classifySegment`'s unknown-option branch now reads `unknownOption = !t.includes("=")`
in `hooks/lib/git-branch-guard.ts`. A token carrying its own value is complete, so the walk
stops at the next bare word, which is where it stopped before the resumed walk was added. The
test is the `=` rather than a table of attached-value options, because a table carries the same
"every option git has not shipped yet" gap the section already declines to close by adding rows;
the four options the walk knows are matched earlier and never reach the line, `--git-dir=`
included.

Measured against the `451a07e` baseline: newly denied falls from 145 to 142, the 135 real
HEAD-movers are unchanged, and the three rows that move are all attached-value and all deny to
allow (`--exec-path=`, `--namespace=`, `--attr-source=` in front of `grep switch`).
`git --no-pager grep switch` stays denied. Nothing is newly allowed.

Calibration: the 1143-row sweep script was never committed and was rebuilt from the recorded
decomposition, which reproduces exactly. Read the absolute counts as "the recorded measurement
reproduces", not as bytes from the original script. Independent of the row set: nothing newly
allowed, and only attached-value rows moved. The committed corpus fixture was not regenerated.

Also updated: `rules/git-branch-discipline.md` `## One deny you will not have expected` for the
smaller cost set, and the stale comment about unquoted heredocs left behind by `69a2d00`.
1145 tests green. Commit `378b80a`.
