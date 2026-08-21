# What happens to the Directive when the plan a Circle runs on deliberately does not state one?

---
**Domain:** code
**Filed by:** orchestrator
**Cross-references:** `rules/circle-records.md` `### The Directive is a pointer once a spec exists`; `agents/orchestrator.md` `## Circle head fields`; `circles/260821-1042-reply-bounded-whole-question-answered/planning/260821-1805_o_plan-reply-bounded-whole-question-answered.md` `## Directive`

---

## Question

Two shipped rules meet here and neither can be followed without breaking the other.

`agents/orchestrator.md` `## Circle head fields` obliges the orchestrator to set
`**Active spec/plan:**` in the same command as it reads a returned plan, and every write of that
field that moves it off `(none yet)` must also replace the record's `## Directive` body with a
fixed pointer literal. The literal is defined in `rules/circle-records.md`:

```
See `**Active spec/plan:**` above. The cited spec or plan states the Directive in force.
```

The invariant behind it is that the record's prose and the plan's prose are two copies of one
Directive the moment both exist, and the swap keeps the second copy from ever coming into being.

**This plan has no second copy.** Its `## Directive` section reads, in full: *"The Circle record
holds the Directive and it is not restated here."* It then summarises the three demands in one
sentence for orientation and points back at the record.

So the premise the invariant rests on is false in this case, and applying the rule mechanically
produces a citation loop: the record would say the plan states the Directive, the plan says the
record does, and the Directive is stated nowhere. The pointer literal would be asserting something
untrue about its own target.

The question is which of the three behaviours is correct, and the answer binds every future
Circle whose planner writes a plan of this shape, not only this one.

## Options

1. **The plan restates the Directive; the swap then proceeds as written.** Dispatch the planner
   to write the Directive into the plan's `## Directive`, then set the field and swap the record's
   prose for the pointer literal.
   - Pros: the invariant holds unmodified, no rule changes, and the record ends up pointing at a
     document that genuinely states the Directive. One document states it, which is what the
     invariant is for.
   - Cons: costs a re-dispatch. It also overrules a choice the planner made deliberately and
     stated in the plan, and no rule today tells a planner to restate a Directive it was given.
     The next planner makes the same choice again unless the planner's own prompt changes too.

2. **The field write and the Directive swap are decoupled when the target states no Directive.**
   Set `**Active spec/plan:**` to the plan and leave the record's prose standing. The invariant
   gains a stated exception: the swap fires only when the cited document actually states the
   Directive.
   - Pros: cheapest, and it is honest about where the Directive lives. The field's own purpose,
     making the plan visible to a reader of the record, is served immediately.
   - Cons: weakens an invariant whose value is that it is mechanical. "Only when the target states
     one" is a judgement each writer makes, and the duplication the invariant prevents returns the
     moment somebody judges wrong. It also leaves the record and the plan pointing at each other
     for orientation, which a reader has to untangle.

3. **The field stays `(none yet)` until a document states the Directive.** Change nothing now.
   - Pros: breaks no rule. The invariant holds vacuously.
   - Cons: reintroduces exactly the defect the head-field obligation was written to close. The
     Circle runs on a plan that no reader of its record can see, and both mechanical readers
     (playmaker's portfolio rendering, a resume) degrade silently. Filed once already as
     `260811-0932`.

## Constraints

- A terminal record is never edited, so whatever is decided applies to anticipated and active
  Circles only.
- The pointer literal is fixed text and no variant of it may be invented. If option 2 is chosen,
  the exception is stated in `rules/circle-records.md`, not improvised at the call site.
- Whatever is decided, one document must state the Directive in full. A state in which none does
  is not an acceptable outcome of any option.
- This Circle's own growth budgets bind any rule text the answer adds: the always-on rule set had
  3 507 bytes of head-room at HEAD `e764637`, and `rules/circle-records.md` is in that set.

## Recommendation

Option 1, and file a separate defect against the planner's prompt so the next plan does not
arrive in this shape. The invariant's strength is that it needs no judgement, and options 2 and 3
each buy a cheap fix by spending that. Option 1 is the only one that ends with the Directive
stated once, in a document the record cites, which is what both rules were written to achieve.

The cost is honest: one re-dispatch now, and a prompt change later that this record does not
attempt to specify.

---
Answered: <set when status moves to _a_>
Implemented: <set when status moves to _i_>
Deferred: <set when status moves to _d_>
Superseded by: <set when status moves to _s_>
Retired: <set when the subject is removed; the marker stays _i_ or _a_>
