# Does a gate protected in one consuming project bind fusion's own cut?

---
**Domain:** code
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260909-2215-gate-firing-read-before-the-cut.md `### The same gates across three projects`; 260909-1843_*_implementation-cut-fusion-to-a-working-minimum.md step A1

---

## Question

Step A1 measured three event logs: fusion's own and two consuming projects. The Rebalance gate
clears half in one of the three (krk, 50.9 % against that project's sessions) and falls below half
in the other two (fusion 35.1 %, unite-co-creator 31.7 %). The step's criterion does not say whether
a population means one project or all of them, so it does not say whether that single clearance
protects the gate from step C1.

## Options

1. **Any one project protects** — a gate clearing half anywhere survives.
   - Pros: fusion ships to projects it cannot measure; a gate load-bearing for one consumer is
     evidence it may be load-bearing for others.
   - Cons: one project's habits then veto a cut for everyone, and the sample is three projects that
     happen to be reachable rather than a representative set.
2. **Only fusion's own log decides** — the plugin's own population is the population.
   - Pros: one denominator, no weighting question, and it is the log this project can keep measuring.
   - Cons: fusion's own use is atypical of a consuming project by construction, since this repository
     develops the tool rather than uses it on ordinary work.
3. **A majority of the measured projects** — two of three.
   - Pros: one clearance does not veto, and a pattern across consumers still counts.
   - Cons: the threshold is invented for this one decision and rests on there happening to be three
     logs.

## Constraints

Only the Rebalance gate turns on this today. Whatever is chosen should be stated in step C1 so a
later reader can tell a deliberate scope from an unexamined one.

## Recommendation

None from the orchestrator. The analysis routes this to the user and states the figures without
choosing between them.
