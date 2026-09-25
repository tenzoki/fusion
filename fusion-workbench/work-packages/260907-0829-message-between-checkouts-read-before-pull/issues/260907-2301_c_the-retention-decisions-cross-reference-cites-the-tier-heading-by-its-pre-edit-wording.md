The retention decision's cross-reference cites the tier heading by its pre-edit wording

---

`260907-0902_*_how-is-the-message-stores-retention-expressed-against-an-archive-step-with-one-threshold-per-run.md`
carries a `**Cross-references:**` line naming the tier heading in `skills/archive/SKILL.md`. Commit
`97bc8b0b` widened that heading from terminal markers to terminal markers and age, which the same
decision record required in as many words, so the record now cites a heading its own ruling
renamed.

---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>

**Evidence.** The rename is in `97bc8b0b`, task S11. The dangling citation was found by the agent
that performed it and reported rather than repaired, correctly: the record was not that dispatch's
to edit.

**Why no gate caught it.** `hooks/lib/__tests__/reference-resolution-lint.test.ts` scans the shipped
surface and excludes the workbench tree, and
`hooks/lib/__tests__/workbench-citation-lint.test.ts` resolves record citations rather than heading
anchors into shipped files. A record citing a shipped heading falls between the two, so this class
of staleness is invisible to both. That gap is the part worth more than the one-line repair, and it
is the reason this is filed rather than fixed in passing.

**Acceptance.** The cross-reference resolves against the heading as it stands in the tree, and the
question of whether a record's anchor citation into shipped text should be gated at all is either
answered or filed as a decision.

---
Reconciled 260908-0027 (reconciler, HEAD `9d99b19d`): still open, and both halves re-read. The
record's `**Cross-references:**` line still names the tier heading by its pre-edit wording, while
`skills/archive/SKILL.md` carries the widened heading that names age beside the terminal markers.
The second half of the acceptance is untouched: no decision has been filed on whether a record's
anchor citation into shipped text should be gated at all, and neither of the two gates named in the
body has gained that reach.

---
Resolved: carried into `260922-0922_*_does-a-records-heading-anchor-citation-into-shipped-text-get-a-gate.md` by the commit that carries this line. The acceptance has two halves. The first, the stale anchor in `260907-0902_*_how-is-the-message-stores-retention-expressed-against-an-archive-step-with-one-threshold-per-run.md`, is history: that record is `_i_`, and `rules/fusion-workbench-conventions.md` `## Terminal states are history` forbids repairing it in place, so the pre-edit wording stands there as what the record said when it was written, and the widened heading in `skills/archive/SKILL.md` is the one a reader resolves it against. The second half, whether a record's anchor citation into shipped text is gated at all, is the choice the decision holds; the fix, a gate or a stated non-gate, lands when that decision is implemented.
