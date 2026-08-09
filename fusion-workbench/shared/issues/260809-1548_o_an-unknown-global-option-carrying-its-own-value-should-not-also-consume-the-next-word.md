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
`260804-1333` settled, and quietly extending a security-relevant classifier past
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
Depends on plan `shared/planning/260809-1229_o_plan-five-severe-guard-defects.md`
step 6 for criterion 3.

---

**Reconciliation 260809-1651 (reconciler, domain `code`) — stays `_o_`. Verified as genuinely open, not as bookkeeping left behind.**
The refinement was not built. `classifySegment` sets `unknownOption = true` for every unrecognised `-`-prefixed token without testing for `=` (`hooks/lib/git-branch-guard.ts:283-285`), so `--exec-path=/x` still causes the next word to be skipped. Criterion 1 unmet; criteria 2 and 3 follow from it. The record's own dependency on step 6 of `shared/planning/260809-1229_c_plan-five-severe-guard-defects.md` is now discharged in the sense that step 6 has landed — `rules/git-branch-discipline.md` `## One deny you will not have expected` carries the cost as a rule with an open example set, so criterion 3 becomes an edit to existing text rather than a wait for it to be written.
