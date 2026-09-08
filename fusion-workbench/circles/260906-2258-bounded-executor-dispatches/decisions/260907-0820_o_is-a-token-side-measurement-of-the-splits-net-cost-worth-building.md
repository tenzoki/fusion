# Is a token-side measurement of the split's net cost worth building, given that nothing in this tree carries one?

---
**Domain:** code
**Filed by:** shaper (portfolio-activation mode), Kai Stalmann <ks@qantr.com>
**Cross-references:** `260907-0820_*_spec-bounded-executor-dispatches.md` (C5); `260907-0710-planability-of-the-bounded-dispatch-spec.md` (findings 3 and 4); `260812-0303-simplify-speed-and-why-rules-do-not-hold.md` (section 2, section 3)

---

## Question

Bounding a dispatch splits one long run into several short ones. Splitting divides the volume of
re-sent tool output by the split count, and it also multiplies the number of prompt prefixes that
have to be written into cache at above plain input price, while no dispatch can read the previous
dispatch's accumulated tail. The two effects run in opposite directions and the net sign is
undetermined from anything in this repository: no source in fusion carries a token figure, and the
event log has no token field. The specification for the bounded-dispatch work accepts that as a
passing outcome, so this Circle can close without knowing whether the change saves money or costs
it. The question is whether the project should later build something that answers it, and what that
something would have to be.

It has to be asked now because the specification just closed over it. Left unfiled, the residual
disappears into an accepted criterion and nobody meets it again.

## Options

1. **Leave it undetermined and never measure.** Accept the volume law as the rationale and treat the
   cache effect as noise.
   - Pros: costs nothing. Consistent with the user's cut, which excluded new measurement from
     closure.
   - Cons: the project would carry a cost mechanism whose sign it has never established. A later
     reader finds the counter-effect written down and no answer beside it.
2. **Measure it from the harness, if the harness exposes it.** Find whether Claude Code surfaces
   per-request cache-read and cache-write token counts anywhere a workbench can read, and take the
   figure from real dispatches.
   - Pros: answers the question in the currency of the argument. Would also retire the currency
     limitation that C5 records against the free-handoff evidence.
   - Cons: unknown whether the numbers are reachable at all. If they are, reading them is new
     instrumentation, which is the thing the largest measured cost in this project is made of.
3. **Bound it by arithmetic instead of measuring it.** Derive the break-even split count from the
   published price ratios and the prefix size fusion already measures for itself, and state the
   dispatch lengths above which splitting pays.
   - Pros: no instrumentation, no new obligation. Uses two figures the project already holds.
   - Cons: rests on assumptions about how this harness bills a sub-agent dispatch, which is not
     verifiable from this repository. Produces a bound, not a measurement.

## Constraints

- Nothing chosen here may become a precondition for closing
  `260906-2258-bounded-executor-dispatches`. C5 permits an undetermined cache half by design.
- Any answer that adds a per-dispatch obligation on an agent is refuted in advance by this project's
  own measurement of standalone obligations.

## Recommendation

Option 3 first, and only then option 2 if the arithmetic puts the break-even near the dispatch
lengths fusion actually runs. The arithmetic costs one pass and is enough to tell a comfortable
margin from a close call, which is the thing worth knowing before anyone builds a measurement.

---
Answer located: `260907-2012-break-even-arithmetic-for-the-dispatch-split.md` — option 3 was carried out and closed the net sign positive, $12 to $90 over the log's 10.99 days, with the break-even run length at 20.2 to 27.5 minutes; option 2 was not taken. The finding is carried in this Circle's record, `## Grounding snapshot`, and in `260907-0657-orchestrator-session.md` `### The reframe, and what it cost`. The marker does not move: nothing on disk records a ruling on this question, and the `_o_` → `_a_` transition is the orchestrator's, to relay a ruling the user gave.
