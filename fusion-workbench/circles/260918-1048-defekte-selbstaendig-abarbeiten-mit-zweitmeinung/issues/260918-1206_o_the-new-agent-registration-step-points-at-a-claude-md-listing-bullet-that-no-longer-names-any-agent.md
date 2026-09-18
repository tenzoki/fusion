The new-agent registration step points at a CLAUDE.md listing bullet that no longer names any agent
---
`README-agents.md` `## Adding a new agent`, step 5, tells the author to register the name in "the agent listing bullet under `## What this is` in `CLAUDE.md` — it names every agent and states the count". The bullet it means was cut to a one-line pointer: `CLAUDE.md` `## What this is` now reads "the 11 prompts …" and names no agent. The names live in `README-agents.md` `## The agents`, in the agent table's first row. The paragraph under step 5 compounds it: it says the derivable-enumerations lint reads "N specialized agents" off the listing bullet in `CLAUDE.md`, while the lint itself was retargeted to `README-agents.md` when that bullet moved.
---
**Filed by:** coder, Kai Stalmann <ks@qantr.com>

**Evidence**

- `README-agents.md:320` — "The agent listing bullet under `## What this is` in `CLAUDE.md` — it names every agent and states the count"
- `README-agents.md:324` — "the listing bullet's \"N specialized agents\", and the Layout row's \"The N agent prompts\""
- `CLAUDE.md:12` — "- **agents** — the 11 prompts, what each is for, which dispatch parameter each reads, and the five that went at v11. Detail: `README-agents.md` `## The agents`." No agent name on the line.
- `CLAUDE.md:24` — the Layout row still reads "The 11 agent prompts; none declares a `tools:` line", so the second registration surface in step 5 holds; only the first is gone.
- `README-agents.md:47` — "11 specialized agents — orchestrator (top-level dispatcher) plus coder, ontocoder, …": where the names and the count now stand.
- `hooks/lib/__tests__/derivable-enumerations-lint.test.ts:165` — the "specialized agents" count is gated in `README-agents.md`, with the comment "was CLAUDE.md until the listing bullet moved".
- Surfaced as collateral of `260918-1124_*_autonomous-defect-package-fifteen-fixes-with-a-second-opinion-each.md`, the fix that moved the `skills/` row's pointer off the same `CLAUDE.md` `## What this is` section.

**Acceptance**

`grep -n 'What this is' README-agents.md` returns no line; step 5 of `## Adding a new agent` names `README-agents.md` `## The agents` as the surface that carries the names and the "specialized agents" count; and the paragraph under it attributes each gated phrase to the file `hooks/lib/__tests__/derivable-enumerations-lint.test.ts` reads it from.
