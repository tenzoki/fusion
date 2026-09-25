# Analyst — fourth check of the bounded-dispatch specification (targeted)

**Date:** 2026-09-07 14:34
**Agent:** analyst
**Filed by:** analyst, Kai Stalmann <kai@qantr.com>, checkout 5e8248d7
**Circle:** 260906-2258-bounded-executor-dispatches
**Dispatched by:** orchestrator, on the user's choice of a short targeted round

## What was asked

Check the seven points of the third planability check
(`260907-1401-third-planability-check-of-the-bounded-dispatch-spec.md`) against the shaper's third
rework, plus the claims the rework introduced. Explicitly not a fourth full pass: the specification
was not re-read for new defects.

## What was done

Read the reworked spec and the rewritten `## Grounding snapshot`. Checked the C3 five-site table row
by row against `agents/orchestrator.md` (Step 3a items 4 to 6, Step 3b steps 2b to 2e and step 7, the
circuit-breaker summary row, Phase 3 steps 1 to 4, Phase 4 steps 2a to 4, the curator paragraph, the
Agent Routing Table, the dashboard cadence rule). Checked the two-part sorting criterion against
`agents/reconciler.md` Steps 3 and 4 and `agents/curator.md` Pass 2. Checked the dispatch-population
reasoning against `hooks/lib/orchestrator-events.ts`.

Re-measured over `fusion-workbench/orchestrator-events.jsonl`: 131 machine pairs, 15 past 20 minutes;
114 bound, 13 past 20; long bound dispatches `coder` 10, `reconciler` 2, `bugfixer` 1; 17 exempt pairs
with the two long `analyst` runs at 35.18 and 33.85; quantiles 9.35 / 14.27 / 22.28 / 90.83. New
measurement: 9 of 92 `session_start` rows carry a `session_id`, while all 131 machine pairs carry one
and all 131 match a `session_start` row. Recomputed the `agents/` growth bound from the test file's
own `AGENT_BASELINE` map: 413 225 current against 399 843 baseline, net 13 382 of 18 000, so 4 618
remain, reproducing the specification's figure exactly.

## Outcome

All seven points close. Every figure in both documents reproduces. Two claims carry a qualification
(step 2e's attempt-versus-dispatch reading is a stipulation rather than a reading of the prompt; the
`session_id` join depends on a model-written row that has carried the field on 9 of 92 occasions), and
neither blocks a plan.

**Verdict:** spec passes.

## Artifacts

- `260907-1434-fourth-targeted-check-of-the-bounded-dispatch-spec.md` (analyses)

No issue and no decision was filed. Nothing outside this entry and that report was written.
