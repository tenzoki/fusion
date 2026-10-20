An over-threshold claude-md finding persists nowhere and one stamp silences it for 30 days
---
The `claude-md` selector of `skills/check/SKILL.md` reports and stamps; nothing files an issue, memo or event row, so the finding is gone after the chat and the stamp mutes the check until the window or the version moves.
---
**Filed by:** orchestrator (on the user's instruction), Kai Stalmann <ks@qantr.com>

krk grew ~105 KB after the check shipped (v11.5.0, `fd4472ff`) with no trace of any finding.

Evidence: `261020-0835-why-a-consumers-claude-md-grows-unchecked.md`

**Acceptance:** A weighed result with `over>0` leaves a durable trace (event row or record) that a later session or `/fusion:check` surfaces, without re-asking every session.

---
Resolved: `hooks/session-start.ts` runs `bin/fusion-claude-md-weight` live at every session start where a workbench is found (2-second timeout, fail-open) and, while a section is over the threshold, adds one line to the envelope naming the count, the largest section, `/fusion:curate --placement` and the route `rules/context-lean-claude-md.md` `### Relocating in a consuming project`; it clears at the first start after the file is lean. Departure, accepted by the user under D3 option 4 (`261020-0925-how-do-due-checks-and-an-over-threshold-claude-md-reach-a-session-that-never-runs-setup.md`): the durable trace is the file itself, recomputed at each start, not an event row or record, because a stored count can show a file as over after it became lean. On the user's ruling, `hook-route-exclusion.test.ts` admits the helper as the session-start hook's second program. Plan step 7 of `261020-0927-plan-consumer-claude-md-stays-lean.md`.
