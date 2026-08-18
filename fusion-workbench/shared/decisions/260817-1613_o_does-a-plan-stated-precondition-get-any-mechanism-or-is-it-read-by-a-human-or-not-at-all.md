# Does a plan-stated precondition get any mechanism, or is it read by a human or not at all?

---
**Domain:** code
**Status:** open
**Filed by:** reconciler
**Cross-references:** `circles/260816-1741-guard-becomes-observation-only/issues/260817-1417_c_the-release-went-out-over-a-turn-whose-six-shipped-file-commits-no-review-opened.md` (the case, closed on its own option 2, with this half explicitly undischarged); `shared/decisions/260815-2109_a_may-a-circle-close-over-an-uncovered-review-range-and-who-decides.md` (the adjacent answered question: coverage is advisory, and its option 3 is unimplemented)

---

## Question

A plan may write a condition into `## Where this Circle stops` — "this Circle's review pass has
run" — and nothing reads it. Circle `260816-1741-guard-becomes-observation-only` wrote exactly that
clause, tagged and pushed v10.0.0 without the pass, and nobody noticed until the reconciler read
the plan against the tree at Phase 3, after the release. The plan was marked Complete by then.

This is not the coverage question. Whether a Circle may *close* over an uncovered review range is
answered (`260815-2109`, coverage advisory, gap named in the closure note) and was followed
correctly here. This is the narrower one behind it: a plan states a precondition in prose, in a
section every plan has, and no gate, lint, agent step or helper looks at it. The condition is
therefore enforced by whether a human happens to re-read a plan they approved days earlier — which
in the measured case they did not.

It must be decided now rather than later because the failure is silent and post-hoc: the only thing
that surfaced it was a reconciliation pass that happened to run, and reconciliation runs after the
release, not before it.

## Options

1. **Nothing — the clause is prose for a human, and that is stated.** Amend `agents/planner.md` so
   `## Where this Circle stops` says outright that its contents bind nobody mechanically. Cheapest,
   and honest.
   - Pros: no new mechanism, no new miss rate. Stops the clause reading as a gate when it is not.
   - Cons: the next plan repeats the measured failure exactly. Writing "this bounds nothing" into
     the one section a planner uses to bound a Circle is close to deleting the section.
2. **The orchestrator reads the clause at Phase 4, before the closure transition, and asks.** One
   step, at the point where the plan and the closure meet anyway.
   - Pros: no parsing — it puts the section in front of the user at the one moment it is
     actionable. Rides an obligation that already holds, the way the `bin/fusion-paths` call rides
     Setup step 2.
   - Cons: an instruction in an agent prompt is overridable under task pressure, which
     `rules/critical-stance.md` §4 records as a measured failure mode of exactly this shape. And it
     fires after the release in the measured case, since the tag went out mid-Circle.
3. **A structured field the planner must fill, checked by a gate.** Turn the prose into something
   like `**Preconditions:**` with one line per condition and a named checker.
   - Pros: the only option where a missing or unmet condition is visible without a human reading
     prose.
   - Cons: most preconditions a plan states are not mechanically decidable ("verified against a
     real consuming project"), so the gate would check that the *field* is filled, not that the
     condition holds — a form of the undecidability `rules/critical-stance.md` §4 warns against
     approximating. It also adds a shipped mechanism to a plugin whose last two Circles removed
     eight of them.

## Constraints

- Whatever is chosen must not become a fourth thing that decides from text what a human meant; the
  project has removed two such mechanisms already (the shell write classifier, the branch policy).
- It must not add always-on bytes to every dispatch: four shipped surfaces carry failing growth
  bounds (`README-hooks.md` `### Growth bounds on the shipped text`).
- `bin/fusion-review-coverage` is explicitly not a release gate, by its own header. Any answer that
  quietly makes it one contradicts a shipped contract and needs to say so.

## Recommendation

Option 2, with option 1's honesty applied to it: the orchestrator reads `## Where this Circle
stops` aloud at Phase 4 and asks whether each clause holds, and the planner's own section text says
that a human at that gate is the whole of the enforcement. That is the same shape the
`**Decidability:**` line already uses — put the question where somebody looks rather than build a
checker for a question that is mostly undecidable. Option 3 is the one to reach for only if option
2 is measured and misses.

---
**Reconciliation 260817-1836** (reconciler, domain `code`, HEAD `2552586`). Still open, filed
earlier the same day by the previous pass and unanswered since. Searched: no analysis in
`shared/analyses/` addresses plan-stated preconditions, no planning file names
`## Where this Circle stops` as a subject, and no other decision record answers it. The adjacent
answered record `260815-2109` (coverage is advisory, the gap is named in the closure note) remains
answered-but-unrealised — its option 3, filtering the uncovered set to commits touching shipped
files, is absent from `hooks/lib/review-coverage.ts` at HEAD — so the mechanism half of this
question has no partial answer standing in for it either. Marker stays `_o_`.

---
**Reconciliation 260818-0814** (reconciler, domain `code`, HEAD `f3a3565`). Still open and
unanswered. Searched: no analysis in `shared/analyses/` addresses plan-stated preconditions — the
one report this session added is on identifier containment; no planning file names
`## Where this Circle stops` as a subject; no other decision record answers it. The adjacent
`260815-2109_a_may-a-circle-close-over-an-uncovered-review-range-and-who-decides.md` is still
answered-but-unrealised — its option 3, filtering the uncovered set to commits touching shipped
files, is absent from `hooks/lib/review-coverage.ts` at HEAD, which this session's own
`verdict=uncovered` over `f3a3565` demonstrates. Marker stays `_o_`.
Log: `shared/history/260818-0814-reconciliation.md`.
