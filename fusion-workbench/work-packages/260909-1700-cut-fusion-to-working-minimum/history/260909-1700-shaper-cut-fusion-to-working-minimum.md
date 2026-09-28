# Captured the cut-fusion-to-a-working-minimum spec as an anticipated Circle

**Status:** Complete
**Filed by:** shaper (anticipated-circle mode), Kai Stalmann <ks@qantr.com>

**What was asked.** A `/fusion:direct` dispatch in anticipated-circle mode, whose draft named an
existing spec as the Directive and Grounding source and instructed that nothing the spec already
settles be re-asked. The draft also instructed that the Circle record's `**Active spec/plan:**`
field cite that spec.

**What was done.** No clarification round was run: the spec is complete, was revised against an
adversarial review, and the dispatch forbade re-deriving it. The Circle
`260909-1700-cut-fusion-to-working-minimum` was created with its record and its six artifact
subdirectories, and paths were re-resolved against it before any further write.

**The one judgement this run made, and why.** The dispatch's instruction to set
`**Active spec/plan:**` and the anticipated-circle template's default of `(none yet)` cannot both
stand. `rules/circle-records.md` `### The Directive is a pointer once a spec exists` settles it: a
record's `## Directive` holds prose if and only if that field reads `(none yet)`, and the same file's
`### Citation form in a Circle record's head field` anticipates exactly this case, a spec written
with no Circle in scope that a later Circle adopts. So the field cites
`260909-1615_*_spec-cut-fusion-to-a-working-minimum.md` and the `## Directive` section carries the
pointer literal. The refined Directive is in the spec, where the field points, and nowhere else.

**What was filed.** Two decision records carrying the open marker, in this Circle's own decision
store, for the two questions the spec left to the user: whether the live dashboard file survives,
and whether the plan-size ceiling fails hard or only reports. Both cite the spec for the argument
rather than restating it. Nothing else was written; no existing Circle was touched and no backlog
entry was involved, the draft being prose rather than an entry path.

**What was verified.** `bin/fusion-paths shaper 260909-1700-cut-fusion-to-working-minimum` resolves
every `OUT_*` key into this Circle. No `.active-circle` pointer exists and no record carries `_t_`,
so this Circle is anticipated and unclaimed, and activation is a separate user step.

**One conflict was found and written into `## Dependencies`.** The other anticipated Circle,
`260908-2018-prerequisites-confirmed-once-order-computed`, builds a prerequisite mechanism on the
Circle record, `portfolio.md` and playmaker's ranking, all of which this Circle's C6 and C7 remove.
The two cannot both proceed as written.
