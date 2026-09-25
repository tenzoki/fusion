`README-agents.md` states the deleted consultant dispatch ban as live in four places, three of them with a falsified count

---
`f7cd6d04` deleted the ban from `agents/consultant.md` and `agents/orchestrator.md` and edited `README-agents.md` in the same commit without touching the four lines that describe it. Three of the four also carry a cardinality the deletion falsified.

---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>

**The four lines**, each quoted from the shipped tree at `f7cd6d04`:

- `README-agents.md:49` — "the two exclusions it carried, the consultant and no recursion, survive as prose in `agents/orchestrator.md` that nothing enforces". One exclusion survives, not two.
- `README-agents.md:92` — "its two exclusions (the consultant, and no recursion) are now prose in `agents/orchestrator.md` like every other agent's scope". Same.
- `README-agents.md:299` — "The orchestrator itself never recurses and never invokes `consultant` (user-initiated only), both now prose." Neither half of "both" holds: the consultant clause is deleted.
- `README-agents.md:369` — "Consultant remains user-initiated". False since this commit.

**Why this is the authoritative surface and not incidental prose.** `CLAUDE.md` names `README-agents.md` `## The agents` as the authoring home for the agent roster and its dispatch rules, and points at it from four rows of its own layout table. A reader sent there by `CLAUDE.md` is told the ban is live. Two of the four lines (`:49`, `:92`) are inside the passage documenting the 260913 allowlist deletion, so they are exactly the passage somebody would open to check.

**Counts.** `rules/critical-stance.md` §5 governs "two exclusions", "both now prose" and "the consultant and no recursion": each is a second copy of a list's length, and the copy is what drifted. The repair is to state the one surviving exclusion by name rather than to decrement a numeral.

**Acceptance test.** `grep -n "user-initiated\|two exclusions\|never invokes \`consultant\`" README-agents.md` returns nothing that asserts the ban as live, and no line in the file states a count of the orchestrator's exclusions that `agents/orchestrator.md` does not carry. `README-agents.md` is on no growth bound, so the repair costs nothing measured.

**Cross-references:** `260917-1119_*_spec-fusion-discuss-a-two-agent-discussion-loop.md` `### C3`, `260913-1108_*_the-positive-dispatch-rule-turns-on-an-undefined-word-and-leaves-both-exclusions-bound-to-the-orchestrator-alone.md`

---
Resolved: All four statements rewritten in `README-agents.md`, and no count was decremented — each line now names the surviving member instead. `:49` and `:92` (the 260913 allowlist passage) say that no recursion is what survives the allowlist as prose in `agents/orchestrator.md` and that the consultant entry went with it; `:49` adds that nothing in the prompts now bars the orchestrator from dispatching `consultant`. `:299` (`## Invariants`) keeps only the recursion half. `:369` (`## Migration note`) drops the "Consultant remains user-initiated" clause. The acceptance grep returns nothing. Counts re-enumerated while there: the skill table holds 14 rows against 14 directories under `skills/`, the 3 + 4 + 7 split at `:242` and the listing at `:263` name those same 14, and `:247`'s eleven checks match the 11 selector rows in `skills/check/SKILL.md` (2 kept by Setup + the other 9). The agent digits `:47`, `:49` and `:92` were not touched and stay gated. Verification: `cd hooks && npm test` — exit 0, 942 tests over 56 files.
