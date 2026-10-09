The axibra ruling makes a migration a release precondition, but step 20 does not list it
---
The user's ruling recorded in `95fecad4` makes a successful axibra migration a precondition of step 20. Step 20's own precondition list, which the release approval asks item by item, does not carry it.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Severity:** low
**Found by:** review `261009-1624-reviewer-coverage-pass-over-4e1e1b47-to-052932e2.md`

**Evidence.**
- Plan `261009-1021-plan-fj05-release-acceptance-of-13-0-0-with-the-claim-takeover.md` line 658, added by `95fecad4`: "**Ruling 2026-10-09 (user):** … a successful axibra migration is a precondition of step 20."
- The same plan, step 20, "**Preconditions**, each asked in the one approval": decision A1 (step 19), the user's own test with Claude and Prior, step 13's coverage verdict, `claude plugin validate .`. No axibra item. "Dependencies: 19, decision A1 answered."
- The ruling sits as the file's last paragraph, after the step notes. An executor reading step 20 reads its own list.

**Fix direction.** Add "the user confirms the axibra migration succeeded on C as installed in step 14" to step 20's preconditions, citing the ruling line; or a step note on 20 that does the same.

**Acceptance.** Step 20's precondition list names the axibra migration and cites the 2026-10-09 ruling.

Resolved: 2026-10-09, the plan carries a step note before step 13 that names C as `052932e2`, the coverage command and clone, and the axibra precondition of step 20.
