# Two decisions this Circle realised in code are still answered, with no `Implemented:` citation

---

Both of this Circle's own decision records were answered at the plan gate and both are now realised
in code by `bbfc912`. Neither has moved from the answered marker to the implemented one, and neither
carries an `Implemented:` line.

- The corpus decision, `260819-1645_*_what-defines-the-citation-gates-corpus-and-what-happens-when-a-marker-move-changes-it.md`
  — option 1 is realised by `hooks/lib/__tests__/workbench-citation-lint.test.ts`, which asserts zero
  violations over a recomputed corpus and carries no baseline and no approvable number.
- The `stamp-name` decision, `260819-2016_*_does-the-citation-gate-judge-the-stamp-name-class-which-scanrecordcitations-does-not-read.md`
  — option 2 is realised by the `GATE_KINDS` array in
  `hooks/lib/__tests__/helpers/citation-scan.ts:443-449`, with the sibling lint's `BASELINE`
  re-approved in the same commit as the widening requires.

The same Circle did perform this transition twice, for the two decisions it consumed rather than
produced: `260805-1548_*_wie-soll-ein-circle-verschwinden-duerfen-den-jemand-absichtlich-loescht.md`
and `260816-0719_*_should-anything-assert-that-the-committed-hooks-dist-is-the-compilation-of-the-committed-source.md`
both carry the implemented marker and a resolving `Implemented:` citation. So the omission is these
two records, not a practice.

The step-9 history log states plainly that the executor transitioned nothing ("No plan step marked,
no marker transitioned, nothing committed"), which is the correct division of labour — and the
commit that landed the implementation did not pick it up.

---

**Severity:** Medium — the marker is the only source of a decision's state
(`rules/fusion-workbench-conventions.md` `## State Markers — decisions`), so two realised decisions
read as awaiting realisation to every pass that filters on it.
**Domain:** code
**Filed by:** `coderev`, reviewing `b91c01c..bbfc912`
**Owner:** `orchestrator` (the marker rename and the footer are the orchestrator's Phase 4 act)
**Affects:** the two decision records named above

**One consequence worth knowing before the transition is made.** The gate's corpus predicate selects
decisions carrying the open or the answered marker, so moving either record to implemented takes it
out of the corpus and takes its citations out of scope with it. That is the hole
`hooks/lib/__tests__/workbench-citation-lint.test.ts:69-78` records about itself, arriving on the
first two records it applies to. Neither record carries a dangling citation today, so nothing is
lost this time; the transition is still the moment the documented hole opens.

## Fix direction

Append an `Implemented:` line to each naming the file that realises it, and rename the marker, per
`rules/fusion-workbench-conventions.md` `### Decision files`.

---
Resolved: both are `_i_` with an `Implemented:` citation naming the mechanism and the commit. The corpus decision's note records that its accepted cost arrived on the first transition after arming; the stamp-name decision's records that the consequence it predicted between the two answers was paid where it said it would be.
