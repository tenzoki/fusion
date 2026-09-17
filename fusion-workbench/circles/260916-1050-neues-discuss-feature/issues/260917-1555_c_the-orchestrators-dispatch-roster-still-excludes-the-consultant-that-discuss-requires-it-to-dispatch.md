The orchestrator's dispatch roster still excludes the consultant that `/fusion:discuss` requires it to dispatch

---
`f7cd6d04` deleted the sentence that banned the dispatch and left the enumeration that carries the same prohibition. `agents/orchestrator.md:170` still lists nine names, the consultant is not one of them, and the line closes "Keeping to the nine is yours."

---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>

**The contradiction.** `skills/discuss/SKILL.md:9` makes the running agent the first partner, "whatever agent that is", and `:140` requires it to "use the `Agent` tool with target `fusion:consultant`" once per round. `agents/orchestrator.md:170` reads:

> Invoke sub-agents: `shaper`, `planner`, `coder`, `ontocoder`, `reviewer`, `reconciler`, `analyst`, `editor`, `curator` — those nine. **Nothing enforces that list.** … Keeping to the nine is yours.

An orchestrator that runs `/fusion:discuss` is told by one shipped file to dispatch the consultant and by another to keep to a list the consultant is not on. Spec C2 admits the orchestrator as first partner explicitly ("Where that is neither the orchestrator nor the consultant, the ordinary session takes part" — the orchestrator is one of the two it names as the usual case).

**What the commit did and did not do.** The same hunk removed the clause "and `consultant` is not among them (**Never invokes** below)" from this very line, and removed the `consultant` bullet from `agents/orchestrator.md`'s Never-invokes block. It left the nine-name list and the closing instruction, which say the same thing by omission. Spec C3's acceptance criterion was "`agents/orchestrator.md` carries no sentence *excluding* the consultant from dispatch" — a positive enumeration is not a sentence of exclusion, so the criterion passes over the case that matters.

**Acceptance test.** A reader of `agents/orchestrator.md` `## Scope` alone can answer "may I dispatch `consultant` when a skill body tells me to?" and get the same answer `skills/discuss/SKILL.md` gives. Either the roster names the consultant, or the line states the condition under which the roster does not bind. Any added bytes are charged to all eleven dispatch paths only if they land in `rules/`; `agents/orchestrator.md` is charged to its own path alone (`hooks/lib/__tests__/surface-growth-bound.test.ts`, `AGENT_BASELINE`), which stands well inside its head-room after this range's net −309 bytes.

**Cross-references:** `260913-1108_*_the-positive-dispatch-rule-turns-on-an-undefined-word-and-leaves-both-exclusions-bound-to-the-orchestrator-alone.md` (the scope of the two exclusions, a different statement), `260917-1119_*_spec-fusion-discuss-a-two-agent-discussion-loop.md` `### C3`, `260913-0909_*_may-the-orchestrator-reach-every-tool-and-may-an-agent-dispatch-another.md`

---
Resolved: `agents/orchestrator.md` `## Scope` now names `consultant` in the dispatch roster, with the condition it is dispatched under — a skill body the session is running, `/fusion:discuss` once per round. The two asserted cardinalities on that line ("those nine", "Keeping to the nine") are gone rather than incremented: the names are the list, which is what `rules/critical-stance.md` §5 asks for, and no second copy of the length is left to drift. The same omission was fixed in the two other places it stood: the frontmatter `description`, whose dispatch list ended at `curator`, and the `## Agents the Orchestrator Invokes` table, which gains a `consultant` row naming the skill-body condition and stating that no routing-table row reaches it. Checked and left as they stand: the **Agent Routing Table** (no consultant row — the table answers which executor a *task* goes to, and the consultant is not one, per `260913-0909_*_…` `Implemented:`) and the **Never invokes** block (one bullet, `orchestrator`, and its "this entry" reads singular, which is already correct). Verification: `cd hooks && npm test` — exit 0, 942 tests; `hooks/lib/__tests__/fixtures/surface-growth.golden` regenerated for the +537 bytes.
