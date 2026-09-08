# Analyst session: the break-even arithmetic for splitting a dispatch

**Date:** 2026-09-07 20:12
**Agent:** analyst
**Filed by:** analyst, Kai Stalmann <ks@qantr.com>, checkout 5e8248d7
**Circle:** 260906-2258-bounded-executor-dispatches
**Dispatched by:** user, executing option 3 of `260907-0820_*_is-a-token-side-measurement-of-the-splits-net-cost-worth-building.md`

## What was asked

Execute option 3 of the held decision and only that: derive the break-even split count from the
published price ratios and the prefix size fusion measures for itself, state the dispatch lengths
above which splitting pays, and compare that against the lengths fusion actually runs, working the
20-minute bound the user chose. Label every assumption. Show how strongly the result depends on the
one assumption that cannot be verified from this repository. Close with a verdict in one of three
mandated forms and a recommendation on whether option 2 is still needed. No instrumentation, no
measurement against a running dispatch, no before-and-after.

## What was done

Read the decision record, the C5 check, the Circle record's `## Grounding snapshot`, Findings 2 to 4
of the first planability check, and sections 1, 2 and the compaction section of the source analysis.
Loaded the bundled `claude-api` skill and read `shared/prompt-caching.md` Economics and TTL sections
directly rather than taking the price ratios second-hand, plus its current-models table for the input
price and the context window.

Measured from what is on disk: the always-on rule floor via `bin/fusion-rules coder | xargs wc -c`
(75 696 bytes), the seven bound agents' prompt sizes, the dispatch duration distribution re-derived
from `orchestrator-events.jsonl`, and the inter-write-call gap from `.guard-state/events.jsonl`.

Built the cost model under the documented multi-turn caching pattern, derived the break-even
condition, evaluated it over six cells spanning two call rates and three values of the added cost,
and ran the aggregate over the 13 long bound-agent dispatches at four candidate bound values.

One error of my own, caught before the report stood. The first derivation of the break-even excess
carried a factor of two, because I solved the continuous equal-parts form and then applied it to the
mechanism that actually exists, a bound firing once at B with a remainder. The correct form is
N − B = A/(0.1·T·B). Every figure that depended on it was recomputed and the report was rewritten:
the break-even range moved from 20.1-23.7 minutes to 20.2-27.5, the count of long dispatches inside
the band from five to seven, and the tokens-per-call sensitivity margin from 8x to 2.0x in the worst
cell. The aggregate figures were computed from the correct discrete formula throughout and did not
move.

## What was found

There is a run length above which splitting pays, it sits just past the bound, and the aggregate sign
is positive in every cell. The break-even is 21.3 minutes under the source's own 8.8-second call gap
and 25.0 minutes under this report's write-only floor of 17.4 seconds, with the six-cell range
spanning 20.2 to 27.5 minutes. Seven of the 13 long dispatches fall inside that band and the best and
worst cells disagree about all seven; the six past 28 minutes pay in every cell.

The net over the 10.99 days the machine-written log covers is 2.4M to 17.9M input-price-equivalent
tokens, $12 to $90 at Opus 5 input pricing. Net zero needs a per-split cost of 289 405 tokens against
the most pessimistic construction of 141 799, a 2.0x margin in the worst cell and 8.0x in the best.
The 800-tokens-per-call parameter, the least evidenced input in the model, would have to be
overstated by a factor of 2.0 in the worst cell before it decided anything.

Three results the Circle does not carry. The break-even does not depend on the split count, because
saving and added cost both scale with it. It moves inversely with the bound, so a shorter bound is
worse: at 10 minutes the worst cell drops to $5.79 and 2 of 13 dispatches pay, while 20 minutes is
the maximum of the worst cell among the four candidates tested. And the source's 200 000-token window
is not this session's: at 1M the whole measured population runs uncompacted, which matters because
the window is where the quadratic stops and is the one input that shrinks the saving materially.

Only one assumption inverts the sign, and it is verified against: a stateless API means the
accumulated tail is re-sent. The unverifiable assumption about how this harness bills a sub-agent
dispatch enters only through the added cost, which would have to be twenty times the extreme
construction before the aggregate turned negative.

Recommendation: do not build option 2. The record's criterion is met on a literal reading and not on
the reading it was written for, and the difference at stake is at most $78 over eleven days.

## Files written

- `260907-2012-break-even-arithmetic-for-the-dispatch-split.md` in this Circle's analysis store
- this history file

Nothing else was written. The decision record, the specification, the plan and the Circle record were
read only, and their markers are not this agent's to move.

## Verification

`bin/fusion-prose-metric` reports 0 em-dashes over 3 824 prose words against a permitted 3. The
duration re-derivation reproduces the Circle record exactly: 131 machine-written pairs, median 9.35,
p90 22.28, max 90.83, 15 past 20 minutes, 114 bound-agent pairs with 13 past 20. Tree read at HEAD
`223f916a`, one commit ahead of origin.

**A file moved under this run and it is reported rather than worked around.** A second session is
editing this checkout. The working tree went from one modified file to six during the run, including
`agents/playmaker.md` and `hooks/lib/__tests__/fixtures/rules-emission.golden`. None is an input
here: `playmaker` is exempt from the bound, `rules/circle-records.md` reaches no bound agent, and the
coder rule floor was re-measured after the drift and reproduced 75 696 bytes unchanged. The seven
bound agents' prefix figures were taken after that re-check.
