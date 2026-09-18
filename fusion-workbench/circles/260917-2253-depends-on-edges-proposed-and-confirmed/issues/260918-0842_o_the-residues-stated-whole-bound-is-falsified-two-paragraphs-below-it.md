Residue's stated whole bound is falsified two paragraphs below it

---

`### The classification, cut on direction` states residue's bound as exhaustive — "an ordering whose other end is not a work item, and nothing else" — and then routes a second, disjoint case to residue, where both ends are work items.

---

**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>

## The defect

`agents/curator.md` `### The classification, cut on direction`, immediately under the four-row table:

> **That is the residue's whole bound, and it is stated rather than left to a run's taste.** Residue is an ordering whose other end is not a work item, and nothing else.

Two paragraphs down, in the three-way split of the ordering cell:

> - **Dependent the other item** → **residue**, with the reason, and no entry.

In that case both ends *are* work items — test 1 returned a non-empty set by definition of the cell it sits in. So the bound that reads "and nothing else" excludes the case the split routes there.

Both sentences are new in this range and both arrived in the same repair (`8ff67839`, closing `260918-0823_*_…`). The narrow definition was written to stop the first run's residue count of six from being a matter of taste; the routing line was written so that the `260918-0828_*_…` readings are "reported rather than discarded unseen". As it stands the prompt supports both readings of what the run file's residue section must carry.

## Consequence

The run file's work-item-edge section "carries … the residue one line per sentence with the record it came from" (`## The run file`, item 5). A run that obeys the exhaustive sentence drops every dependent-is-the-other-item reading, which is exactly the class the open decision `260918-0828_*_may-the-edge-pass-propose-an-edge-whose-dependent-is-not-the-corpus-owner.md` needs to be visible in order to be answerable. The user would then be asked to rule on a question whose instances no run reports.

## Acceptance test

Residue has one definition in `agents/curator.md`, and both the `(empty, yes)` table row and the dependent-is-the-other-item bullet fall under it without an exception clause.
