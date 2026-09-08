# What does the Directive pointer swap do when the cited plan points back at the record?

---
**Domain:** code
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:** `260818-1504_*_how-does-a-circle-record-carry-its-directive-once-a-spec-exists-and-who-may-correct-it-before-one-does.md`, `260907-1942_*_message-between-checkouts-read-before-pull.md`

---

## Question

`agents/orchestrator.md` `## Circle head fields` obliges the orchestrator, in the same command as
any write of `**Active spec/plan:**` that moves the field off `(none yet)`, to replace the record's
`## Directive` body with the fixed pointer literal that `rules/circle-records.md`
`### The Directive is a pointer once a spec exists` defines. The obligation carries no condition.

It was met at 260907-2003 in this Circle and could not be discharged as written. The field write is
owed and was performed; the coupled swap was not, and this record is why.

The rule's own statement of purpose is that the record and the spec can never come to state two
different Directives, "not because somebody keeps two copies in step, which decays, but because the
second copy never exists". Both halves of the swap assume the cited file states the Directive. This
Circle's plan deliberately does not. Its `## Directive` section reads, in full, that the Circle
record states it and the plan does not restate it, and its `**Spec:**` head field says the same:
there is no spec, and the record's Directive and Grounding snapshot stand in a spec's place.

Performing the swap would therefore have produced a citation loop, record to plan to record, and
deleted the only statement of the Directive in the process. The invariant the rule protects is
already satisfied here by the plan's own restraint: there is exactly one copy, and it is in the
record.

## Options

1. **The swap is conditional on the cited file actually stating a Directive.** The obligation gains
   a test the writer can perform: read the cited file's `## Directive`; where it points back at the
   record, write the field and leave the record's prose alone. Pro: keeps one copy in every case,
   which is the invariant. Con: an unconditional obligation gains a branch, and the branch is
   evaluated by reading prose rather than by testing a literal, which is weaker than the
   `(none yet)` and `See ...` sentinels the rest of the mechanism runs on.
2. **A plan that carries a Directive section must state the Directive, not point back.** The
   obligation stays unconditional and the constraint moves to `agents/planner.md`: a plan planned
   from a Circle record restates the Directive rather than citing it. Pro: the head-field
   mechanism keeps its single unconditional form. Con: it mandates exactly the second copy the
   record was written to prevent, and that copy then decays on the first edit to either file.
3. **The pointer literal gains a second sentinel for this case**, so the record's Directive is
   replaced by a line naming the plan as the implementation and keeping the prose beneath it. Pro:
   the field and the section stay coupled. Con: it reintroduces prose in the record under a new
   name, which is the state option 1 of the binding record rejected.

## Constraints

- Whatever is chosen, exactly one file states the Directive of a Circle at any time. That is the
  invariant `260818-1504_*_...` was decided on and this record does not reopen it.
- A reader must be able to tell pointer from prose by a literal opening, without parsing. The
  existing mechanism runs on `(none yet)` and on ``See `**Active spec/plan:**` above.``.
- The Circle currently stands with its field written and its Directive prose intact. That state
  satisfies the invariant and violates the letter of the head-field obligation, and it stays as it
  is until this record is ruled.

## Recommendation

Option 1. The obligation exists to prevent a second copy, and where no second copy was created
there is nothing for it to prevent; making it conditional on that fact costs one read and keeps
the invariant exactly. Option 2 mandates the duplication the whole mechanism was built to remove.
Option 3 answers a question about coupling that nobody asked, and reintroduces record prose under
a new sentinel.

The test in option 1 should be written against the literal the plan template already produces
rather than against free prose, so that it is a first-line read like the other two sentinels. What
that literal should be is part of the same ruling.

---
Reconciled 260908-0027 (reconciler, HEAD `9d99b19d`): no answer exists anywhere on disk, so the
marker stays. Searched every store in `SCAN_ANALYSES`, `SCAN_PLANS`, `SCAN_DECISIONS` and
`SCAN_HISTORY` for a ruling on the pointer swap: the only text bearing on it is this record's own
`## Question`, and the plan it names closed without a step that touches the obligation. The record
it cross-references on how a Circle record carries its Directive once a spec exists is unmoved.

Also seen: 260908-1612 by orchestrator — the next Circle's plan
`260908-1612_*_cut-the-skills-surface-and-add-the-post-step-body.md` does the same thing, in the
same words: its `## Directive` reads "The Circle record carries the full Directive and its
Grounding; this plan does not restate them." So the field was written and the record's prose left
standing a second time, in two consecutive Circles, by two separate planner runs given no
instruction about it either time. That moves the question off a single measured case: a plan
planned from a Circle record declines to restate the Directive as a matter of course, which is what
option 2 would have to forbid.

---
Reconciled 260908-1814 (reconciler, HEAD `ee99a578`): still `_o_`, no answer anywhere on disk. Searched
every store in `SCAN_ANALYSES`, `SCAN_PLANS`, `SCAN_DECISIONS` and `SCAN_HISTORY` across both the active
Circle and the shared pair; nothing rules on the swap, and the plan of the Circle that recorded the second
instance closed with no step touching the obligation.

**The second instance is accurately described, with one wording correction.** Verified on disk: the
`_t_circle.md` record of `260908-1410-cut-skills-surface-add-post-body` carries
`**Active spec/plan:** 260908-1612_*_cut-the-skills-surface-and-add-the-post-step-body.md` with its
`## Directive` prose fully intact, and that plan's `## Directive` reads "The Circle record carries the full
Directive and its Grounding; this plan does not restate them." So the field was written, the coupled swap
was not, and the state is the same one this record's `## Constraints` describes for the first Circle. The
addendum's "in the same words" overstates it: the prior Circle's plan reads "The Circle record states it in
full and this plan does not restate it." Same substance, two independent wordings — which is the stronger
observation for option 2, since it shows two planner runs reaching the same refusal without a shared
phrase to copy. Nothing else in the addendum needs correcting.
