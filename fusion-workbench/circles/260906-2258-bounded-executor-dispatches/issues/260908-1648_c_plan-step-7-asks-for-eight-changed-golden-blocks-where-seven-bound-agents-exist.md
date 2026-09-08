Plan step 7 asks for eight changed golden blocks where seven bound agents exist

---
`260907-1450_*_plan-bounded-executor-dispatches.md` `### 7. Repair the role table and regenerate the
emission golden` states, in its `## Changes` bullet 3, that *"exactly eight blocks should change, one per
bound agent each gaining one file, and no eighth"*. There are seven bound agents, the same step's
**Acceptance criterion** says *"the golden diff touches exactly the seven bound agents' blocks"*, and the
sentence contradicts itself inside its own clause: eight blocks with no eighth.

---
**Filed by:** coder, Kai Stalmann <ks@qantr.com>

**Evidence path.** Both halves are in one section of one file: `## Changes` bullet 3 against
`**Acceptance criterion:**` two bullets later. The seven are enumerated in the same plan at
`## Current State` and in the case arm step 6 prescribes.

**How it was resolved in the artifact.** The coder executing steps 6 and 7 took the acceptance criterion,
regenerated the golden and measured the diff block by block: seven blocks changed — bugfixer, coder,
coderev, curator, ontocoder, ontorev, reconciler — each gaining `bounded-dispatch.md` and nothing else,
with no block added or removed. The dispatch prompt for this task had already corrected the figure to
seven, so the wrong number never reached an executor's hands unqualified.

**Why the record exists even though the artifact is right.** The plan still carries both halves, so the
next reader of step 7 meets a check whose stated pass condition would fail on a correct result. No gate
reads a plan's arithmetic; `plan-stopping-section-lint` judges presence of one section and nothing else.

**Acceptance test.** `grep -n 'eight blocks' ` over the plan returns nothing, or returns only text that
names the correction and says seven governs.

---
Reconciliation 2026-09-08: verified against the tree at `de94102f` and still open. The passage this record is about is unchanged in its source file, so the defect stands whatever the plan step's marker says.

---
Resolved: step 7 now reads "exactly seven blocks should change", corrected on the user's ruling of `260908-2051_*_is-a-completed-plan-amended-when-one-of-its-verification-lines-turns-out-unreachable.md`, option 1. `grep -n 'eight blocks'` over the plan returns one hit, the reconciliation log entry naming the correction, which is what this record's acceptance test permits.
