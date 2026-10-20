Curator corrections carry no byte delta, so runs that grow CLAUDE.md pass unnoticed
---
The policy-curator's ledger reports a blast-radius percentage but not whether its replacements are longer than what they replace; a truth-correcting run can roughly double the text it touches with no signal.
---
**Filed by:** orchestrator (on the user's instruction), Kai Stalmann <ks@qantr.com>

`foreign:krk:260917-1450-curator-run.md`: 11 entries touch 3 409 bytes and write back 6 938; curator runs added ~29 KB (16 % of growth).

Evidence: `261020-0835-why-a-consumers-claude-md-grows-unchecked.md`

**Acceptance:** The curator's run file and approval question state the net byte delta beside the blast-radius figure, and a run whose replacements exceed a stated factor says so.

---
Resolved: `agents/policy-curator.md` `### Blast-radius stop` now has every survey state each surface's net byte delta (After minus Before bytes over its entries), and, when the entries write back over 1.5 times the bytes they replace, a clause saying so: a reporting cut-off, never a stop, the factor resting on one measurement (krk, 2026-09-17: 2.03 times). `## Tool Discipline` and `skills/curate/SKILL.md` Steps 3 and 5 carry the delta in the same clause as the blast-radius check, so the user reads it at approval. The run-file half was already met by `## The run file` item 3. Plan step 8 of `261020-0927-plan-consumer-claude-md-stays-lean.md`.
