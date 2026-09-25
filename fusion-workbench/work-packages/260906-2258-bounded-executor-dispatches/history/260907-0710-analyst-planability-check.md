# Analyst session: planability check of the bounded-dispatch Directive

**Date:** 2026-09-07 07:10
**Agent:** analyst, dispatched by orchestrator (Phase 0b spec review)
**Filed by:** analyst, Kai Stalmann <ks@qantr.com>, checkout 5e8248d7
**Circle:** 260906-2258-bounded-executor-dispatches
**Result:** `260907-0710-planability-of-the-bounded-dispatch-spec.md`, verdict rework needed, 8 gaps

## What was checked

Every factual claim in the Circle record's `## Grounding snapshot`, the reconstructibility of the
fourfold-saving calculation, the three reserved construction questions, and the decidability of the
future plan's load-bearing question.

## Measurements performed

- `orchestrator-events.jsonl`, 2953 lines at HEAD: field roster (15 keys, no token field), event
  roster (46 names, none a tool call), the pre-cut 1265-row window reproducing the source analysis's
  own scope figure, `task_start` 177 against `task_done` 248, pairing by `task` field 172 matched
  and 76 unmatched, and the 131 machine-written dispatch pairs with rows falling between them.
- `.guard-state/events.jsonl`, 431 rows before the probe: tool distribution Edit 278 / Write 147,
  `guard_allow` rows for artifacts only a sub-agent writes.
- One live probe inside this dispatch: a `Write` from within the sub-agent run produced one
  `guard_allow` row carrying the parent orchestrator's `session_id`. This closes the record's third
  reserved question by measurement.
- `bin/fusion-prose-metric` on the report: 1 em-dash over 3748 prose words, the mandated verdict
  line, inside the ceiling.

## Findings that changed the picture

The calculation reconstructs to the digit but its factor equals the chosen split count. The
zero-cost handoff is measured in minutes while the argument is in tokens. The non-cacheability
premise is refuted against the API documentation. The 36 percent figure does not reconstruct from
any stated input.

## Not done

No code, data or Circle file was touched. No issue and no decision was filed, per the dispatch: the
findings are spec gaps for one shaper rework round, not new work.
