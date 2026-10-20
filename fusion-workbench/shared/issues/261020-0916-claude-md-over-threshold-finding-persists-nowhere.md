An over-threshold claude-md finding persists nowhere and one stamp silences it for 30 days
---
The `claude-md` selector of `skills/check/SKILL.md` reports and stamps; nothing files an issue, memo or event row, so the finding is gone after the chat and the stamp mutes the check until the window or the version moves.
---
**Filed by:** orchestrator (on the user's instruction), Kai Stalmann <ks@qantr.com>

krk grew ~105 KB after the check shipped (v11.5.0, `fd4472ff`) with no trace of any finding.

Evidence: `261020-0835-why-a-consumers-claude-md-grows-unchecked.md`

**Acceptance:** A weighed result with `over>0` leaves a durable trace (event row or record) that a later session or `/fusion:check` surfaces, without re-asking every session.
