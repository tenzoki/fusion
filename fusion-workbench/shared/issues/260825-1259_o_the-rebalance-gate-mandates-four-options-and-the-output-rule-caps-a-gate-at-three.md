The Rebalance gate mandates four options and the output rule caps a gate at three

---
`agents/orchestrator.md:992` says the Rebalance gate "presents **four explicit options**".
`rules/user-facing-output.md:97` says "A gate carries at most three options, on whatever
surface", and adds that a decision needing a fourth "is too big for one gate: make it
smaller, or split the decision itself in two". Both are binding on the orchestrator, which
loads the rule on every dispatch. No agent can satisfy both.
---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:** rules/user-facing-output.md `## Questions and gates`; agents/orchestrator.md `### Rebalance Gate`; rules/critical-stance.md §4

## How it was met

Reached at a live gate on 260825: a Phase 3 reconciler verdict of `review-needed` with
recommendation `revise Artifact`, in session
`shared/history/260825-0858-orchestrator-session.md`. The orchestrator had to choose which
of the two rules to break before it could ask the user anything, which is the worst moment
for an unresolved conflict, because the choice is invisible to the user in the output it
produces.

## Why the cap is not arbitrary and cannot simply be widened

The three-option cap is derived rather than chosen. `rules/user-facing-output.md`
`## Length` caps a gate at eight lines on any surface. The two foreclosure clauses in
`## Questions and gates` require each option to carry, on its own line, what choosing it
rules out. One question stem plus three options plus three foreclosures is seven lines.
A fourth option makes it nine and breaks the length cap, so widening the cap to four is
not a one-word edit: it reopens the line budget the cap was derived from.

## Why the four options are not arbitrary either

The Rebalance gate's four are the three edges of the Coherence model plus its termination:
revise the Artifact, revise the Grounding, revise the Directive, accept Bounded Closure.
Dropping one drops a move the model says is available. The set is not padding.

## What this is really about

`rules/critical-stance.md` §4 is the frame: a case split that resists being made disjoint
and complete is evidence the problem is cut wrong. Here the split is complete and the
*presentation* is over budget, which is the neighbouring case. Candidates, none preferred
here:

1. The Rebalance gate is exempted from the three-option cap by name, in the rule, with the
   length cap raised for that one gate.
2. The gate is split in two, per its own recommendation field: first ask whether the
   Directive still stands (revise Directive, accept Bounded Closure), then ask what to
   change (Artifact, Grounding). Two gates of two options each, both inside every cap.
3. The orchestrator presents only the options the reconciler's recommendation makes live,
   which is what this session did ad hoc, and the rule says so explicitly instead of
   leaving it to each run to improvise.

## What this session did

Presented three options, chosen by which ones the verdict made live, and said so. That is
candidate 3 applied without authority, and it is recorded here rather than left as an
undocumented habit.
