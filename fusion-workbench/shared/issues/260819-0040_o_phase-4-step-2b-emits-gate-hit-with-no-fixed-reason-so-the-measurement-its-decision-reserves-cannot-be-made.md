Phase-4 step 2b emits `gate_hit` with no fixed reason, so the measurement its decision reserves cannot be made

---

`agents/orchestrator.md:867` tells the orchestrator to reuse the existing events rather than add a
type — which is right — and then leaves both payloads unspecified, in a step whose binding decision
makes a later measurement the trigger for the next option.

---

The instruction:

> Emit `gate_hit` with the reason and `gate_response` with the answer; this step has no event type of
> its own.

Neither string is named. Compare the orchestrator's other explicit `gate_hit`, at
`agents/orchestrator.md:675`, which names its reason verbatim:

> emit `gate_hit` with reason `unresolved Turn budget`

And the event table at `agents/orchestrator.md:1234-1235` fixes the payload vocabularies:

| `gate_hit` | Human gate triggered | Gate reason |
| `gate_response` | User responded to gate | Decision (proceed/skip/defer/modify) |

Two consequences.

**The reason is free text, so the gate is not countable.** Each session writes whatever phrasing it
reaches for, and `orchestrator-events.jsonl` is append-only across sessions and read cross-session —
it is the one durable record of a gate having fired. Nothing can then answer "how often did this gate
fire, and how often did a clause come back not holding".

**That is precisely the measurement the decision reserves.** `260817-1613`'s answer closes:

> Option 3 stays available if option 2 is measured and misses.

Option 3 is the structured-field-plus-checker branch that was declined. The condition for reaching
for it is a measurement of option 2's miss rate, and option 2 as shipped emits nothing a miss rate
can be computed from. The decision is not wrong; its realisation left out the one thing that makes
its own escape hatch reachable.

**A third, smaller mismatch.** The answers this gate collects are per-clause holds / does not hold.
The documented `gate_response` vocabulary is proceed/skip/defer/modify, none of which fits. That is
the same class as the already-open
`shared/issues/260811-2306_o_the-check-in-emits-three-gate-response-decisions-outside-the-vocabulary-the-event-table-documents.md`,
arriving through a second gate; the two want one answer about whether the table's vocabulary is a
closed set or an illustration.

Verified at HEAD `b54ace5` by reading `agents/orchestrator.md:865-872`, `:675`, `:1234-1235` and by
`grep -n "gate_hit" agents/ skills/ hooks/ bin/ rules/ README*.md` (four hits, three in the
orchestrator prompt and one in the event table).

**Fix direction.** Name the reason string in the step the way `:675` does — one fixed token, so a
`grep` over the event log counts the gate — and say what goes in `gate_response` when the answer is
per-clause rather than one of the four documented decisions. This adds no mechanism and no parser; it
fixes what two existing events carry.

Found in the coderev pass over `52b1d95..b54ace5`, session `260818-2301`. No Circle active, so it is
filed in the shared store under the Origin Rule.
