# Issue: bin/fusion-rules comment says "eight agents" but IS_PROSE_AGENT lists nine

**Status:** closed
**Filed by:** coder (Circle E-rest, Turn 3 — found during the consistency sweep; out of scope to fix here because it is a code file)
**Severity:** low (comment/code mismatch, no runtime effect)

## What

`bin/fusion-rules` line 129 reads:

    # Prose-agent flag — independent of PATTERNS. The eight agents below produce
    # long-form narrative output that the stylometric profile governs.

The `IS_PROSE_AGENT` case immediately below (line 132) lists **nine** agents, not eight:
`orchestrator, consultant, shaper, planner, analyst, investigator, playmaker, conceptrev, editor`.

`conceptrev` (v3.24.0) and `editor` (v5.2.0) were both added after the "eight" comment was written; the comment's count was never bumped.

## Why not fixed in Turn 3

Turn 3's scope is the doc consistency sweep (`README*.md`, `docs/*.md`, `skills/*/SKILL.md`, `CLAUDE.md`) plus the three pre-filed issue fixes. `bin/fusion-rules` is a code file, explicitly out of the coder's Turn-3 scope ("Do NOT touch code"). Filed for a follow-up.

## Fix

Change "The eight agents below" → "The nine agents below" on `bin/fusion-rules` line 129 (verify the count against the `IS_PROSE_AGENT` case at fix time).

---
Resolved: bin/fusion-rules line 129 comment changed "The eight agents below" → "The nine agents below" to match the nine-entry IS_PROSE_AGENT case (orchestrator, consultant, shaper, planner, analyst, investigator, playmaker, conceptrev, editor). Comment only; no runtime change. Fixed in Circle E-rest Turn 4.
