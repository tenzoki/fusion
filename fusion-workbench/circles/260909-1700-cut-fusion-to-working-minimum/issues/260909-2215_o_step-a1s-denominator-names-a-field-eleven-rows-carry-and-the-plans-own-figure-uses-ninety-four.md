Step A1's denominator names a field eleven rows carry and the plan's own figure uses ninety-four
---
Step A1 of `260909-1843_*_implementation-cut-fusion-to-a-working-minimum.md` directs that the population be "the `session_start` rows carrying a session identifier". Read literally that is the rows carrying a `session_id` field: 11 of the 94 in-scope `session_start` rows at `e8dbeb74`. The field arrived with v10.8.0 and the earliest in-scope row carrying it is 2026-08-26, while every gate numerator spans the log from 2026-07-06, so the literal reading divides a five-month numerator by a two-week denominator and multiplies every rate by about 8.5. The plan's own `## Current State` uses the other reading, reporting the gate counts "against a `session_start` population of 97 before per-checkout scoping", and 97 is every `session_start` row including those with no `session_id`.
---
**Filed by:** analyst, Kai Stalmann <ks@qantr.com>
The two readings change which gates land on the head list that C1 may not delete from, so the ambiguity is load-bearing rather than cosmetic. The analysis used 94 and reported 11 alongside: `260909-2215-gate-firing-read-before-the-cut.md` `### The population, and an ambiguity in how the step names it`.

**Acceptance test:** step A1's population sentence names one of the two row sets unambiguously, and the Current State figure and the step agree.
