Every sub-agent files its history into the active Circle, because the resolver cannot make the judgement the Origin Rule asks for

---

**Severity:** Medium. Nothing is lost and nothing breaks; records land one store away from where the Origin Rule puts them. The cost is that a Circle's history store fills with work that has nothing to do with its Directive, which is precisely what the Origin Rule exists to prevent.
**Domain:** code
**Filed by:** orchestrator, after moving three such records by hand in one sitting
**Affects:** `rules/fusion-workbench-conventions.md` `## Origin Rule`; `bin/fusion-paths`; every agent prompt's Setup contract
**Cross-references:** `rules/workbench-path-resolution.md` (why a key set is derived rather than declared, which is the same seam seen from the resolver's side)

---

## Measured

Three sub-agents in succession, all while Circle `circles/260823-0023-settle-what-travels-between-checkouts/` was active, filed their session histories into that Circle's `history/` store. None of the three pieces of work arose from its Directive, which is about what travels between checkouts:

- a `coder` making `skills/next/SKILL.md` Step 6.5 imperative, which repairs an activation defect
- a `coder` writing the v10.6 release text
- an `ontocoder` bumping the marketplace manifest for that release

All three were moved to `shared/history/` by the orchestrator afterwards. That is three hand corrections of the same kind in one sitting, which is the shape this project treats as a mechanism problem rather than three lapses.

## Why it happens

`bin/fusion-paths` resolves `OUT_HISTORY` to the active Circle's store whenever one is active. It cannot do otherwise: the Origin Rule's question is **"did this arise from the active Directive, or did you merely find it nearby?"**, and that is a judgement about the dispatch's subject, which the resolver has no access to. The rule says so itself — it is built on origin rather than durability precisely because an agent *knows* its own origin.

The gap is that knowing is not the same as being asked. An agent's Setup resolves `OUT_HISTORY` once and writes there at the end; nothing between those two moments puts the Origin Rule's question to it. `rules/fusion-workbench-conventions.md` `## Issue and Decision Filing` does ask it, explicitly and well — "The one judgment left to you is the one the Origin Rule names" — but it asks it about **defects and decisions**, and a session history is neither. So the one place the question is posed does not cover the artifact that is misfiling most reliably.

## What this is not

It is not the agents being careless. Each of the three resolved its write target exactly as its Setup contract instructs, and the contract is what sent it there. An instruction followed correctly producing the wrong result is a defect in the instruction.

Nor is it an argument for the resolver guessing. Its whole design is that it resolves paths and makes no judgements, and a heuristic that inferred a dispatch's origin from its text would be the undecidable-question shape this project has deleted twice.

## What to consider

Not costed here, and the third is the cheapest and the weakest.

1. **Extend the filing question to histories.** `## Issue and Decision Filing` already poses the Origin Rule's judgement in the right words; a sibling sentence covering the session history would put it where the write happens. Costs bytes on an always-on rule surface, which has the least head-room of the four.
2. **Put it in the Setup contract instead.** `rules/agent-setup.md` explains what `OUT_*` means and is the last thing an agent reads before resolving; one clause there would reach every agent at the moment the value is held rather than at the moment it is spent.
3. **Leave it to the orchestrator to correct.** What happens today. It works while somebody is watching, which is the property the four-frozen-surfaces record already shows does not hold.

The three differ in whether the question reaches the agent that writes or the party that reviews. Today it reaches neither by design, only by habit.
