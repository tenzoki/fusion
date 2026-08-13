# Coder — plan step 3: bring the portfolio template up to a performed operation

**Status:** Complete
**Date:** 2026-08-13 14:13
**Plan:** `circles/260813-0858-playmaker-maintains-backlog-store/planning/260813-1306_p_the-playmaker-maintains-the-backlog-store.md` step 3 (marked `[DONE]`)

## What changed

`rules/circle-records.md`, the portfolio template's `## Backlog — ranked` placeholder (line 126). One placeholder, both mandates:

- The ranked-entry half keeps its wording, and gains the second first-line form (`Recommended to split first:`) with its deliberate absence of a `/fusion:direct` line. Both forms are spelled exactly as `agents/playmaker.md:160` and `skills/next/SKILL.md:124` already read them, so the briefing render needs no change.
- The indented material under an entry is now what the run *proposed* for that entry, a proposed split among it — the passage step 2 rewrote in the prompt, said once here rather than twice.
- A `Performed this run:` part carries the operations the run performed, whose entries have left the ranking (a closed, deferred or merged-away entry is no longer `_o_`/`_p_`).
- Proposed and performed share four copyable line forms — `split` / `merge` / `close` / `defer` — one operation to a line, matching the plan's step-4 dispatch block so the relay copies rather than paraphrases.
- Closing sentence: a Phase 4 dispatch holds no confirmation, so everything is proposed and `Performed this run:` is absent.

Vocabulary is taken from `rules/fusion-workbench-conventions.md` `## Backlog entries` and `agents/playmaker.md` `## Two mandates, by dispatch path`; no second set was invented.

## Byte delta

`rules/circle-records.md` 11 228 → 11 958 bytes, **+730**. The file is emitted to `orchestrator`, `playmaker` and `shaper`, so the golden's three `circle-records.md 11228` lines become `11958`. With step 1's +1 933 on `fusion-workbench-conventions.md` (all 16 agents), this Circle's rule-text movement is complete and step 8 can regenerate the golden once.

## Verification

`cd hooks && npx vitest run` — exit 1. Two failures, both predicted by the dispatch and neither introduced here:

- `rules-emission-golden.test.ts` — red since step 1; step 8 regenerates it. Not regenerated here.
- `fusion-paths.test.ts` → *gives playmaker the read key and withholds the write key* — the assertion step 2 invalidated; step 6 inverts it.

Test files 2 failed | 46 passed (48). Tests 2 failed | 1012 passed (1014). No third failure.

Not committed.
