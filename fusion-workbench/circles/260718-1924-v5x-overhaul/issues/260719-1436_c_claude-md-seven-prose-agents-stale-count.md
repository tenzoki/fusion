# Issue: CLAUDE.md says "seven prose agents" — now nine

**Status:** open
**Filed by:** coder (Circle E-rest, Turn 2 — noticed while aligning CLAUDE.md, out of assigned audit scope)
**Severity:** low (doc staleness, no runtime effect)

## What

`CLAUDE.md` line 47 ("Two stylometric profile families") states the long-form `default-voice-<lang>.yaml` profile is "emitted by `bin/fusion-rules` only for the **seven** prose agents."

That count is stale. `bin/fusion-rules` `IS_PROSE_AGENT` (and the header comment at lines 89–95 / 131–135) now lists **nine** prose agents:
`orchestrator, consultant, shaper, planner, analyst, investigator, playmaker, conceptrev, editor`.

`conceptrev` was added v3.24.0 and `editor` v5.2.0; the "seven" predates both.

## Fix

Change "seven prose agents" → "nine prose agents" on CLAUDE.md line 47 (verify the count against `bin/fusion-rules` `IS_PROSE_AGENT` at fix time).

## Why not fixed in this Turn

Turn 2's scope is the plan's line-level staleness audit, which does not include this row (the audit's CLAUDE.md section covers only the `agent-setup.md` addition + the optional F2 bullet). Filed for Turn 3's consistency sweep (it sweeps CLAUDE.md for stale counts) or a follow-up.

---
Resolved: Verified against bin/fusion-rules:132 (IS_PROSE_AGENT lists nine: orchestrator, consultant, shaper, planner, analyst, investigator, playmaker, conceptrev, editor). Changed CLAUDE.md line 47 "seven prose agents" -> "nine prose agents".
