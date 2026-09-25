# Shaper session: the fourth rework, after the stopping condition fired

**Date:** 2026-09-07 23:21
**Agent:** shaper, portfolio-activation mode, `**Scope:** spec`
**Filed by:** shaper, Kai Stalmann <ks@qantr.com>, checkout 5e8248d7
**Circle:** 260906-2258-bounded-executor-dispatches
**Initiated by:** the user, on 260907. The orchestrator put to the user that the C5 check had halted
the build at plan step 1 and that the break-even arithmetic filed later the same day reversed the
sign, and named three ways forward. The user answered "ok, 1. Ziel neu fassen und dann bauen", then
answered this round's three questions "1a 2a 3a".

## What was asked

Re-cut the Circle's goal on the corrected cost argument, in one pass: the specification, the
Directive pointer and the Grounding snapshot. Carry the positive but small saving with its range, the
break-even threshold as the actual result, the discount of at least 28.6 percent, the three results
nothing here carried before, the 1M context window against the source's 200k assumption, and the
history including the refuted form of the claim and the stopping condition that fired correctly.

## What the user settled this round

1. **What the work stops on.** The narrow form: the work stops if the byte reckoning at plan step 14
   shows the mechanism does not fit under the `agents/` growth bound without a cut to shipped text
   that loses information. Not the broad form over all four growth bounds, and not the option of
   carrying no stopping condition at all.
2. **What becomes of C5.** It stays as a capability, re-headed "The corrected cost argument is what
   the project keeps", marked met by the two filed reports, and it stops being the closure event.
   Plan step 1 stands as run.
3. **The second justification for the 20 minutes.** It joins the first at the setting site: of four
   candidates checked against the break-even arithmetic, 20 minutes maximises the pessimistic cell,
   and the break-even sits at 20.2 to 27.5 minutes.

## What was done

**The specification was revised in place** at
`260907-0820_*_spec-bounded-executor-dispatches.md`, as the three previous reworks of this Circle
were, rather than filed under a new timestamp. Every citation of it stays valid: the plan's `**Spec:**`
field, the Circle record's `**Active spec/plan:**` and eight history files point at that name. A new
file would have broken all of them for no gain, since the mode's purpose here is a re-cut goal and
not a second competing specification.

Seven changes to the specification:

- The Source line gains the fourth revision and states how it differs in kind from the first three.
- The Directive's closing clause moves from "closes when the cost argument on file says what is true"
  to closing on the mechanism being built and fitting under the `agents/` bound.
- A new governing section, `## What the saving actually is, now that it has been checked`, placed
  ahead of the requested-versus-enforced section because the goal was re-cut on it. It carries the
  four figures, the three new results, the window correction and the history of the refuted claim.
- C1's fourth acceptance criterion gains the second justification sentence, quoted as the verbatim
  comment text, with a note that the plan's step 2 has to be pulled along.
- C5 is re-headed, marked met by the two reports, gains two criteria and one decision, and loses the
  criterion that made its acceptance the closure event.
- `## Stops when` carries the new condition and records the old one as fired rather than deleting it.
- A fifth residual, the undecided middle of the population; nine enumerated user questions in
  `## User Decisions Pending` in place of a bare count of six; the break-even figures in
  `## Measured, and not open`; and three plan disagreements handed to the planner under
  `## Open for Planner`.

**The Circle record** took the two edits this mode permits. `## Grounding snapshot` gains three
paragraphs, the fired stopping condition, the four figures and the three new results, and two
existing paragraphs were corrected: the one that left the net sign unestablished, and the one that
gave the 20 minutes a single justification. `## Directive` was already the pointer literal and is
unchanged, and `**Active spec/plan:**` still cites the same two files because neither was renamed.

## What was not done, and why

**The plan was not touched.** Three disagreements between it and the revised specification are named
in `## Open for Planner` and go to the planner: step 2's comment text, the criterion count at lines
124 and 132 with the note that step 1 has run, and the old closure clauses in
`## Where this Circle stops`.

**The decision record's marker was not moved.** `260907-0820_*_is-a-token-side-measurement-of-the-splits-net-cost-worth-building.md`
is answered by its own option 3 and the answering report recommends against option 2, but the marker
is the orchestrator's to move. The specification records the answer without moving anything.

## Verification

`bin/fusion-prose-metric` on the two edited files: the specification 1 em-dash over 10 392 prose
words against a permitted 10, the Circle record 0 over 3 055 against 3. `bin/fusion-citation-check`
filtered to this Circle reports no violation in either file; the violations it prints are pre-existing
and in other stores. The Directive pointer was checked against
`rules/circle-records.md` `### The Directive is a pointer once a spec exists` and is byte-identical to
the mandated literal.
