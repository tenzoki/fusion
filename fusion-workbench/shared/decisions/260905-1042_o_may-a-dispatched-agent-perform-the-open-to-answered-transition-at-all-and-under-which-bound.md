# May a dispatched agent perform the open-to-answered transition at all, and under which bound?

---
**Domain:** code
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:**
`260905-0529-consumer-findings-citation-form-and-decision-authority.md` `### 2a`, `### 2b`, `### 2c` and its R4, which is the analysis this record exists to settle;
`agents/orchestrator.md` `## Phase 1: Work Queue Construction`, step 3;
`agents/reconciler.md`, the `_o_` branch of its decision-marker pass;
`rules/fusion-workbench-conventions.md` `## State Markers — decisions`, where `_o_` and `_a_` are both Grounding-Stand with no field distinguishing their authority

---

## Question

Two shipped prompts answer the same question differently, and a consuming project met the gap in practice: a dispatched agent moved three decisions the project's plan reserved for the user out of `_o_`, and nothing caught it.

The orchestrator's prompt says open decisions are user-input gates, not executor work, and that the orchestrator records the user's inline answer and performs the transition. The reconciler's prompt instructs a dispatched agent to perform the same transition itself, bounded: only where the answer **already exists** under an analysis, a plan or another decision, and the agent records where it is rather than choosing among the options.

That bound is prose in one agent's prompt and nothing enforces it. An agent that reads the reconciler's line and then supplies the answer itself has crossed a line no mechanism draws.

## What the consultation established, and is not re-argued here

- **No filter failed.** The consumer's report attributes the incident to a filter that should have held. There was none, and there is a shipped prompt on the other side. The incident is authorised behaviour meeting an unstated bound, not an escape from a control.
- **The consumer's proposed self-citation check would report a sanctioned form.** `rules/fusion-workbench-conventions.md` lists the decision record itself among the legitimate targets of an `Answered:` line, so a check rejecting a citation that resolves into the annotated file would fire on a case the rules permit. It would also settle the orchestrator-versus-reconciler disagreement by mechanism rather than by decision, in a direction nobody has chosen.
- **The vocabulary genuinely cannot express the distinction.** A grep for a user-reserved concept across the agents, the rules, the skills, the hook library and `CLAUDE.md` returns nothing, and `_o_` and `_a_` sit together as Grounding-Stand with no field carrying who ruled.

## Options

1. **Only the orchestrator transitions `_o_` → `_a_`, and only to relay a ruling the user gave.** The reconciler reports an answer it finds and moves no marker.
   - Pros: one party, one path, and the party is the one that holds the gate; the reconciler keeps reporting drift, which is its job; the consumer's marker becomes unnecessary, because no agent may transition at all and there is nothing to reserve.
   - Cons: an answer that genuinely exists on disk now waits for a session to notice it, so records sit at `_o_` longer and the reconciler's pass loses a repair it can make today.
2. **The reconciler keeps the transition and its bound becomes explicit and testable.** The prompt states that the agent records a located answer and never supplies one, and something checks it.
   - Pros: the repair stays where the evidence is; the bound is already the prompt's intent, so this is a strengthening rather than a change of behaviour.
   - Cons: what would be checked is whether the cited answer pre-dates the transition, and nothing in a record carries that; the check would be a proxy for a question the tree cannot answer, which is the same fault the consultation names in the consumer's proposal.
3. **The vocabulary gains an authority field**, extending `**Filed by:**`'s agent-or-user distinction to the resolution line, so `_a_` records who ruled.
   - Pros: the distinction becomes readable downstream, which it is not today; it reuses an existing convention rather than inventing a second one.
   - Cons: it answers a different question. Who ruled is worth recording whether or not a dispatched agent may transition, so this is a complement to 1 or 2 and not a substitute; adopting it alone leaves the two prompts still disagreeing.

## Constraints

- No option may leave two shipped prompts giving different answers to this question. That is the defect.
- The reconciler's existing bound — the answer must already exist elsewhere, and the agent records its location rather than choosing — is what makes its transition defensible at all. An option that keeps the transition without the bound is not on the table.
- A mechanism must not decide this by fiat. The consultation's second finding is exactly that: a check introduced to enforce an unsettled rule settles it in a direction nobody chose.

## Recommendation

`inference:` Option 1, with option 3 filed separately rather than folded in. The consultation's own reasoning points there: if only the orchestrator relays a user ruling, the marker the consumer asks for is unnecessary and the repair is a prompt edit rather than a new mechanism. Option 2's cost is the decisive one — the check it needs would test whether a cited answer pre-dates its transition, and nothing on disk records that, so it repeats the fault the consultation identified in the consumer's proposal one level up.
