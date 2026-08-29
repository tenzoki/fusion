# Does the two-checkout transport verification become a shipped check, or stay a one-off measurement per Circle?

---
**Domain:** code
**Filed by:** planner
**Cross-references:** `circles/260823-0023-settle-what-travels-between-checkouts/planning/260823-0800_*_c2-what-travels-between-checkouts-is-settled.md` `## Testing Strategy` (the reading this plan proceeds on); `shared/planning/260822-1136_*_spec-fusion-becomes-a-multi-user-tool.md` `### C1` `## Open for planner` (the same question asked once already, for C1); `circles/260822-1921-measure-what-two-checkouts-share/analyses/260822-2219-what-two-checkouts-of-one-project-actually-share.md` `## Scope` (the harness a shipped check would have to reproduce); `hooks/lib/__tests__/surface-growth-bound.test.ts` (the line budget it would spend)

---

## Question

C2's last acceptance criterion is a verification rather than a change: two checkouts, a session in each, push both, pull each into the other, and every line of the event log surviving with no hand editing. C1's measurement had the same shape and was answered as an analyst report. C3 and C4 will each need a verification of the same kind, because each adds something that travels between checkouts and each can break the transport in a way only two trees reveal.

So the question is whether this shape of verification becomes a check the suite runs, or stays a one-off measurement that a person commissions once per Circle and that nothing re-runs afterwards.

It has to be answered before C3 rather than during it. A shipped check written at C4 would have to be retro-fitted to the transport C2 and C3 built; one written now would bound how those two are designed, because a mechanism has to be reachable from a test to be tested by one.

## Options

1. **Stay a one-off analyst measurement, once per Circle.** Each Circle whose Directive touches the transport commissions a pass, the pass writes a report under the Circle's analysis store, and nothing re-runs it.
   - Pros: costs no lines on the hook-test surface, which has 287 left of its 2 500 head-room and no cut in prospect. Matches what C1 already did, so the practice needs no new rule text. An analyst report can state what it did not cover, which is the honest form for a measurement whose harness cannot run a live orchestrator session.
   - Cons: a regression in the transport is invisible between Circles. The union merge driver is declared by a skill body, which no test executes, so nothing at all would notice its removal or a typo in the rule line. Every later verification re-derives a harness somebody has already built twice.
2. **A shipped integration check, in the hook suite.** Spawn two clones against a local bare remote, append to the event log in each, push and pull both ways, and assert every line survives.
   - Pros: the transport becomes a property the suite defends rather than a claim a report made once. The harness stops being re-derived. `hooks/lib/__tests__/helpers/guard-harness.ts` already spawns project roots, so the pattern exists in this suite rather than being new to it.
   - Cons: spends most of the 287 remaining hook-test lines, and no cut is planned, so it would likely trip the bound and force the question of a cut inside a feature Circle. It also tests a skill body's bash block, which nothing in this suite does today: the block would have to be extracted or duplicated, and a duplicated block is a second spelling of one fact.
3. **A shipped check of the declaration only, not of the transport.** Assert that `/fusion:setup`'s block leaves a `.gitattributes` in which `git check-attr` reports `union` for the log path, and leave the push and pull cycle to the one-off measurement.
   - Pros: cheap in lines, because it needs one scratch repository rather than a remote and two clones. It catches the failure that is both most likely and most silent, which is the rule line drifting or vanishing from the skill body.
   - Cons: verifies the declaration and not the behaviour, so it would pass on the day git changed what `union` does. It still has to reach the skill body's block somehow, which is option 2's extraction problem at a smaller size.

## Constraints

- No growth-bound baseline moves except after a cut, in a commit that names the cut. The hook-test surface has 287 lines of head-room and this Circle plans no cut.
- The event log has no ceiling and may not acquire one, so a check may not bound the file it reads.
- A check that duplicated the merge rule line would put two spellings of one fact in the tree, which is the trap `shared/decisions/260810-0510_*` and its siblings were filed about. Any shipped check reads the line from the skill body or from `rules/workbench-tracking.md` rather than restating it.

## Recommendation

Option 3, contingent on the line budget being measured first rather than assumed. It defends the one failure that is silent today, the declaration disappearing from a skill body nothing executes in a test, at a fraction of option 2's cost, and it leaves the behavioural claim where C1 already put it, in a measurement that states its own bounds. Option 2 is the right shape and the wrong Circle: it should be considered when a cut has bought the lines rather than paid for by one.

C2 proceeds on option 1 for its own last criterion, so this record blocks nothing in the current Circle. What it settles is whether C3 inherits a harness or re-derives one.

---
Answered:
Implemented:
Deferred:
Superseded by:
Retired:

---
Deferred: a later Circle that meets the question again — user 2026-08-29, triage of open decisions left in terminal Circles; no scan reaches this store any more, so the deferral is recorded by hand.
