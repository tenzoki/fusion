The merge driver unsorts a second event-log reader, and the repair direction already recorded for it is positional too

---

**Severity:** Medium
**Domain:** code
**Filed by:** coderev, reviewing C2 Turn 1
**Affects:** `agents/orchestrator.md:519`, `agents/orchestrator.md:1083`
**Cross-references:** `shared/issues/260822-1136_o_two-definitions-of-the-turn-count-disagree-and-the-resume-snippet-counts-every-session-in-the-log.md`, assigned to capability C4; `rules/workbench-tracking.md` `## The event log carries a union merge driver`, which states the cost this record is about

---

## What is wrong

Commit `c9eba48` ships the union merge driver, and `rules/workbench-tracking.md` states its cost plainly: after a merge the log is no longer chronological, so "any reader that walks the log positionally instead of reading each line's `ts` field therefore reads a false order".

Commit `2f1e3a6` repaired one such reader, the Phase-4 sequence diagram, which was this Circle's stated scope. A second reader is defined positionally in the same prompt and was left as it stands:

- `agents/orchestrator.md:519` — "the count of `turn_start` events in `orchestrator-events.jsonl`" is the Turn number's only record
- `agents/orchestrator.md:1083` — `progress.turn` is "the `turn_start` events in `orchestrator-events.jsonl` **since this session's `session_start`**"

"Since this session's `session_start`" is a positional read. After a union merge another checkout's block can stand after this session's `session_start` line, so the window that definition names no longer contains only this session's Turns.

## Why this is not the C4 record restated

`260822-1136` measures a different fault: two definitions of the Turn count disagree, and the `grep -c` at `agents/orchestrator.md:91` counts every session in the file. Plan step 7 correctly observes that `grep -c` is order-independent and left it alone. What that record cannot have anticipated is the driver, which did not exist when it was written on 2026-08-22.

The consequence lands on its proposed fix. Its `## Direction` says: "Deriving it means finding the last `session_start` line and counting `turn_start` after it, which is one `awk` or one `sed` range and no new mechanism." That derivation is positional, and after a union merge the last `session_start` in the file need not be this session's. C4 would implement a repair that the driver landed in C2 has already undermined.

## Verified

Read at HEAD `2f1e3a6`. The sequence-diagram sort at `:876` and the Observability rule at `:1332` are the only two sites in the prompt that mention sorting by `ts`. `agents/orchestrator.md:91` and `skills/setup/SKILL.md:369` both use `grep -c` over the whole file and are order-independent, as plan step 7 states. `bin/monitor`'s `computeETA` is the third reader and is deliberately assigned to plan step 9, so it is out of this record's scope.

## Direction, not a prescription

This is a note onto C4 rather than a repair here: whoever implements the session-scoped Turn count must sort by `ts` first, or find a window that does not depend on file order at all. Filing it against this Circle rather than appending to `260822-1136` because the cause is this Circle's own change, and the record it affects is a plan input for a capability not yet started.
