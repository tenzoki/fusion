# What two checkouts of one project actually share, measured rather than assumed

---
**Domain:** code
**Filed by:** shaper (anticipated-circle mode)
**Active spec/plan:** (none yet)
**Active session history:** circles/260822-1921-measure-what-two-checkouts-share/history/260822-2204-orchestrator-session.md

---

## Directive

After this Circle, the workbench holds an analyst report that states from measurement, not from reasoning, what two checkouts of one project share and what each keeps to itself. The report covers two arrangements, a second full clone and a `git worktree` of the same repository, and for each it says, entry by entry over the four-class state partition in `shared/planning/260822-1136_*_spec-fusion-becomes-a-multi-user-tool.md`, whether the second tree got its own copy, the first tree's copy, or nothing at all. It states in addition what a fresh clone of a project that tracks its workbench holds and lacks, what an agent does in that tree before `/fusion:setup` has run there, what happens when the second tree sits inside a directory that already holds a workbench, and whether two trees can hold the same Circle active at once. The answered record `shared/decisions/260822-1610_*_how-does-fusion-support-several-people-working-one-project-at-once.md` then carries an addendum that resolves its own closing sentence, which today says the arrangement is chosen but not proven. A measurement showing that two checkouts do **not** get isolated workbench state in a case the user intends to use closes this Circle just as well, and is worth more than the three Circles it stops.

## Grounding snapshot

**Where this Circle comes from.** It is capability C1 of the approved specification `shared/planning/260822-1136_*_spec-fusion-becomes-a-multi-user-tool.md`, whose `### C1` section already carries acceptance criteria and is the source of every measurement named in the Directive above. The specification's own argument for running C1 first is that it is the cheapest possible refutation of the sequence: capabilities C2 through C4 all rest on the isolation premise, and if the premise fails they are wrong in a way no care inside them would reveal.

**C1 has shrunk since the specification was written, and the Directive reflects the remainder.** C1 had two halves, verifying the isolation and superseding the blocking decision. The supersession is done. It was written at the Rebalance gate of session `shared/history/260822-1009-orchestrator-session.md` and landed in commit `02dff51`, so `shared/decisions/260719-2141_*_concurrency-worktree-slots-vs-single-active-circle.md` now carries the superseded marker and the reframed answer is `shared/decisions/260822-1610_*_how-does-fusion-support-several-people-working-one-project-at-once.md`. Only the verification half remains.

**What the superseded record still binds.** Its own sentence survives its supersession: nothing in fusion may assume two orchestrators can run safely against one workbench. The chosen arrangement satisfies that sentence rather than overturning it, because two orchestrators never run against one workbench. They run against two, which is exactly the claim this Circle measures.

**Four scope answers the user gave at shaping, each with the cost the user accepted.**

- The measurement is an analyst pass whose product is a report. No executable check ships, no new surface is created, and no growth budget is spent. Accepted cost: after a change to `bin/fusion-workbench-root` the report no longer says anything about the current behaviour.
- The measurement runs against a throwaway project created for the purpose, small and clean, with no risk to real data. Accepted cost: findings that appear only at realistic size can be missed.
- A negative result in the nested case, where the second tree sits inside a directory that already holds a workbench, is documented and nothing more. Nesting is not an arrangement the user intends to use, so the sequence continues and the finding stands in the report. Accepted cost: somebody who does set it up that way walks into it without being told.
- Closure is the report plus an addendum to `shared/decisions/260822-1610_*_how-does-fusion-support-several-people-working-one-project-at-once.md`, whose closing paragraph currently records the arrangement as chosen but not proven. A how-to for setting up a second checkout was offered and not chosen.

**The mechanism the nested case tests.** `bin/fusion-workbench-root` walks upward from the working directory looking for `fusion-workbench/.fusion-setup` and prints the first ancestor that has one. A second tree created inside a directory that already holds a workbench will therefore find the parent's marker. That is the failure mode the superseded record named and nobody measured.

**Two facts about tracking that bound the measurement.** fusion ships no rule about whether a project tracks its workbench, and a consuming project decides for itself; this repository does track its own. Which root entries a project that tracks its workbench should commit is authored in `rules/workbench-tracking.md`, and the specification's four-class partition builds on that split rather than restating it.

**Portfolio context.** No anticipated Circle existed in this workbench before this one, and C0 of the same specification ran to completion with no Circle directory at all. That gap is filed as `shared/issues/260822-1556_*_the-spec-names-five-circles-and-the-workbench-holds-none-of-them-so-c0-closed-with-nothing-to-transition.md`, whose first fix direction is to file the specification's remaining Circles as anticipated records so the portfolio can rank them. This Circle is the first of them.

## Dependencies

No Circle dependency: the specification's C0 ran without a Circle directory, and C2 through C4 depend on this one rather than the reverse.

Artifacts in `shared/` that bind this Circle, cited rather than copied per the Origin Rule:

- `shared/planning/260822-1136_*_spec-fusion-becomes-a-multi-user-tool.md`, capability `### C1` and the section `## The state partition`
- `shared/decisions/260822-1610_*_how-does-fusion-support-several-people-working-one-project-at-once.md`
- `shared/decisions/260719-2141_*_concurrency-worktree-slots-vs-single-active-circle.md`
- `shared/history/260822-1009-orchestrator-session.md`
- `shared/issues/260822-1556_*_the-spec-names-five-circles-and-the-workbench-holds-none-of-them-so-c0-closed-with-nothing-to-transition.md`

## Turn log

- Turn 1 (session 260822-2204): commits `f90de0c`..`b938f68`; Coherence verdict `coherent`;
  session history:
  `circles/260822-1921-measure-what-two-checkouts-share/history/260822-2204-orchestrator-session.md`.
  Two tasks, both resolved: the isolation measurement, and the addendum that resolved the closing
  sentence of the Grounding record the measurement was run for.

## Activation proposal

**Proposed for activation at 260822-2040**, by playmaker session
`260822-2040-playmaker-direct-dispatch` (domain bias `code`, git HEAD `d2b374e`).

This is the only anticipated Circle in the workbench, and it ranks first on merit rather than by
default. Its `## Grounding snapshot` cites no open decision record: the two decisions it names are
`shared/decisions/260822-1610_*_how-does-fusion-support-several-people-working-one-project-at-once.md`,
which is answered, and
`shared/decisions/260719-2141_*_concurrency-worktree-slots-vs-single-active-circle.md`, which is
superseded. Its `## Dependencies` section names no Circle, so there is nothing for it to wait on,
and the specification it comes from argues the reverse dependency: capabilities C2 through C4 rest
on the premise this Circle measures. The four scope answers recorded in the Grounding already fix
the method, the environment, the treatment of a negative result in the nested case, and what
closure consists of, which is more than an anticipated Circle usually carries before activation.

**What activation does not settle.** The Circle produces an analyst report and a decision addendum.
No executable check ships and no growth budget is spent, so the four bounded surfaces in
`hooks/lib/__tests__/surface-growth-bound.test.ts` and
`hooks/lib/__tests__/rules-emission-golden.test.ts` are untouched by it.

The marker is unchanged by this proposal. Activation is the user's act via `/fusion:next`, or the
orchestrator's after a user confirmation.

## Closure note

**Closed coherent on 260822**, on the Phase-3 verdict `coherent` from
`circles/260822-1921-measure-what-two-checkouts-share/history/260822-2239-reconciliation.md`, whose
`## Coherence` section is appended to
`circles/260822-1921-measure-what-two-checkouts-share/history/260822-2204-orchestrator-session.md`.
One Turn, two tasks, both resolved, commits `f90de0c`..`b938f68`.

**The Directive was reached in the direction it left open.** It asked for a measurement and said in
its own last sentence that a result showing two checkouts do *not* get isolated state would close
this Circle just as well, and be worth more than the three Circles it would stop. The result came
back positive: the premise holds for both arrangements the user intends to use, a second full clone
and a `git worktree`, on the precondition that each tree carries its own `.fusion-setup`. The
reconciliation checked the four claims that were checkable against the tree rather than against the
report, and all four held.

**One sharper result than the Directive asked for.** The question was posed three ways — the second
tree gets its own copy, the first tree's copy, or nothing — and the middle possibility never
occurred in any arrangement. Sharing is only ever the upward walk of `bin/fusion-workbench-root`,
never a shared file.

**One failure, bounded rather than waived.** The nested placement fails where the second tree has no
marker of its own: the root walk hands it the parent's workbench entire, active Circle, guard state
and commit lock included. That is the failure mode the superseded decision named and nobody had
measured. The user's decision at shaping was to document it and not treat it as a blocker, because
nested is not an arrangement they intend to use, so it closes this Circle as a recorded bound on the
answer rather than as an open defect against it.

**Six of the seven C1 acceptance criteria are met**, four by this session and two by the earlier
session that wrote the supersession, verified at their files rather than assumed. The seventh is a
conditional whose precondition did not arise: it prescribes what happens if the measurement fails,
and it did not.

**What this Circle leaves open**, each cited where it lives rather than counted:
`circles/260822-1921-measure-what-two-checkouts-share/decisions/260822-2219_*_what-does-a-second-checkout-do-with-a-circle-record-marked-active-that-it-never-activated.md`
asks a question the arrangement did not previously have, and
`circles/260822-1921-measure-what-two-checkouts-share/issues/260822-2219_*_the-tracked-setup-marker-is-rewritten-by-every-setup-and-carries-the-checkouts-absolute-path.md`
records that the specification's class R3 does not survive measurement for one of its two members.
Both are inputs to C2, which is where the state partition gets built.

**Consequence for the sequence.** C2 through C4 may proceed on evidence rather than on an
assumption. The Grounding record they rest on,
`shared/decisions/260822-1610_*_how-does-fusion-support-several-people-working-one-project-at-once.md`,
no longer closes by calling itself chosen but not proven; its addendum resolves that sentence and
leaves it standing above, so a later reader sees the claim was open before it was closed.
