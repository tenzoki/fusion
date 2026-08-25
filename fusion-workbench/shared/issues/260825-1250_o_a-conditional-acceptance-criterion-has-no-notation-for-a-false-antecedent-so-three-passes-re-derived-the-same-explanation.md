A conditional acceptance criterion has no notation for a false antecedent, so three passes re-derived the same explanation

---
`### C1`'s seventh criterion in the multi-user spec is an if-then whose antecedent came back false.
It can never be ticked and it is not open. The checkbox list has only two states, so it reads as
outstanding work, and three consecutive reconciliation passes have each written the same paragraph
saying it is not.
---
**Filed by:** reconciler, Kai Stalmann <ks@qantr.com>
**Cross-references:** `shared/planning/260822-1136_*_spec-fusion-becomes-a-multi-user-tool.md` `### C1` (the criterion) and its `## Reconciliation Log` (the three passes); `rules/critical-stance.md` §4 (a case split is disjoint and complete)

## What it is

The criterion reads: *"If the measurement shows that two checkouts do not get isolated workbench
state in a case the user intends to use, the Circle stops and reports, and C2 through C4 do not
start."* The measurement came back positive for both arrangements, so the branch never opened.

Ticking it would state that the Circle stopped, which is false. Leaving it says work is outstanding,
which is also false. Both readings are wrong and the notation offers no third.

## The cost, which is what makes this a defect rather than a quibble

Three passes have paid it. The `260822-2236` entry wrote *"Criterion 7 is deliberately not ticked. It
is a conditional whose antecedent is false"*; the `260823-1446` entry wrote *"C1's seventh criterion
is a conditional whose antecedent is false: the measurement showed the isolation holds, so the branch
that would stop the sequence never opened"*; this pass wrote it a third time. Each pass had to open
`### C1`, read the criterion, find the measurement, and re-derive the same verdict, because the
previous derivation lives in a log entry rather than beside the box.

A reader who does not read the log — the ordinary case for anyone counting what is left — reads C1 as
6 of 7 for the rest of the spec's life.

## Two directions, and the choice is a convention rather than a repair

1. **A third box state.** Something the eye separates from `[ ]` and `[x]` for *not applicable, and
   here is why*. It would belong in `rules/fusion-workbench-conventions.md` beside the two marker
   vocabularies, which means every plan and spec fusion ever writes inherits it, and it is therefore
   a change to how a plan is read rather than a fix to one spec.
2. **A shaping rule.** A conditional whose antecedent is a measurement the Circle itself performs is
   not an acceptance criterion; it is a stopping clause, and plans already have `## Where this Circle
   stops` for exactly that. This criterion would then never have been written as a checkbox, and the
   rule would be about where a conditional goes rather than how it is rendered.

The second direction is the smaller change and does nothing for the criteria already written this
way. `inference:` this is the shaper's question and not the reconciler's, which is why it is filed
rather than fixed.

**Severity:** Low. Nothing is wrong on disk; the accounting of what remains is wrong, permanently and
in one direction.

**Found by:** reconciler, session-end pass over `a99e680..cfab17e`, HEAD `cfab17e`.
