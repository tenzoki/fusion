Plan step 8 asks for a closure that was already made, and the record already carries the note it prescribes

---

`shared/planning/260822-1154_*_plan-c0-cut-only-circle-buys-head-room-on-four-bounded-surfaces.md`
step 8 dispatches the coder to *"verify that the disposition the record asked for was made, then
close it"* and to *"Append a `Resolved:` note citing that closure note and stating that the figure it
quotes is the figure at that closure and not at HEAD."* The record is already closed and already
carries a note doing exactly that.

---

**Verified at HEAD `370bfc5`.** The file is
`circles/260821-1042-reply-bounded-whole-question-answered/issues/260821-2204_c_a-growth-bound-lost-half-its-head-room-against-a-stated-stopping-criterion-and-the-finding-lives-only-in-a-history-log.md`
— marker `_c_`, not the `_o_` a step-8 closure would move. Its tail carries the reproduced
measurement (`17 875 + 2 500 = 20 375 budget -> 12 lines of head-room`), names the three lines
`370bfc5` added and what they were, states **"Closing this defect does not close the question it
raises"**, and cites
`shared/decisions/260822-1154_*_does-the-hook-test-line-budget-cover-comment-prose.md` as the open
question that outlives the closure. That is the whole of what step 8 prescribes, including the
residual the step says the plan will file separately.

**What is left of the step.** Nothing that changes a file. The step's stated dependency set is empty
and its acceptance is that `npm test` exits 0 — which it does without the step running.

**Why file it rather than let the coder discover it.** Step 8 as written invites a second `Resolved:`
note on a closed record. This project treats a closed record as history that is not edited to make a
past state true (the step says so itself about the closed plan), and a duplicate note is the
duplication class the Circle exists to reduce.

**Fix direction.** Mark step 8 discharged at plan level with a citation of the record's existing tail,
or drop it. Do not append a second note.

**Affects:** `shared/planning/260822-1154_*_plan-c0-cut-only-circle-buys-head-room-on-four-bounded-surfaces.md:158-164`;
`circles/260821-1042-reply-bounded-whole-question-answered/issues/260821-2204_*_a-growth-bound-lost-half-its-head-room-against-a-stated-stopping-criterion-and-the-finding-lives-only-in-a-history-log.md`.

**Severity:** Low. No shipped surface is at risk; the cost is one wasted dispatch and a possible
duplicate note on a closed record.

**Found by:** analyst, step 1 of the same plan. Ledger: `shared/analyses/260822-1226-cut-ledger-for-three-bounded-surfaces.md`.

---
Resolved: **The record's premise is false and its fix direction is satisfied by the tree, so it is
closed with the correction rather than acted on.**

The target record was `_o_` at `370bfc5`, not `_c_`:
`git ls-tree --name-only 370bfc5 fusion-workbench/circles/260821-1042-reply-bounded-whole-question-answered/issues/`
returns `260821-2204_o_a-growth-bound-lost-half-its-head-room-…`. It became `_c_` in `4a58be1`,
which is plan step 8 running as task `P-8` — the first commit of the session, landed before the
ledger that produced this record. So the closure this record calls "already made" is step 8's own
effect, and step 8 was not redundant: it is the only reason the record is closed and carries the
`Resolved:` note this record quotes.

What the record got right, and it is why nothing was harmed: step 8 must not run twice. It did not.
It ran once, in `4a58be1`, and no second note was appended. The record's fix direction — "mark step 8
discharged at plan level with a citation of the record's existing tail" — is discharged by the
plan's own `## Reconciliation Log`, which marks step 8 `[DONE]` against `4a58be1`.

The body above is left exactly as written. It records what was concluded from the tree the analyst
was standing on, and the anchor error that produced it is filed as
`shared/issues/260822-1556_*_the-cut-ledger-states-a-head-anchor-two-commits-behind-where-it-ran.md`.

Closed by reconciler at HEAD `9f65463`, 260822-1556.
