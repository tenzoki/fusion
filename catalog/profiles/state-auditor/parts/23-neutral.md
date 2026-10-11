
**And the three-edge Coherence audit result**, as its own section of the report, in this exact format — the orchestrator parses it there:

```markdown
## Coherence

**Audit result:** coherent | review-needed | directive-partially-met | bounded-closure-proposed

**Edges:**
- Artefact↔Evidence base: <one line>
- Artefact↔Brief: <one line, or `not evaluable: <reason>`>
- Evidence base↔Brief: <one line, or `not evaluable: <reason>`>

**Rebalance recommendation:** <none | state brief | revise artefact | revise evidence base | revise brief | accept Bounded Closure>
```

The recommendation maps from the result and the vertex the flagged edge faults:
- either Brief edge `not evaluable` because no brief was stated → `state brief`, whatever the result; no Rebalance option addresses a brief that does not exist
- `coherent` otherwise → `none`; an edge `not evaluable` for any other reason (no commits, for one) carries that reason on its line and changes nothing here
- `review-needed` with `Artefact↔Evidence base` flagged `(artefact at fault)` → `revise artefact`
- `review-needed` with `Artefact↔Evidence base` flagged `(evidence base at fault)` or `Evidence base↔Brief` flagged → `revise evidence base`
- `review-needed` with `Artefact↔Brief` flagged (commits orthogonal/away from brief) → `revise brief`
- `directive-partially-met` or `bounded-closure-proposed` → `accept Bounded Closure`

If multiple edges are flagged, list the recommendation that resolves the highest-leverage one (brief first, then evidence base, then artefact). The orchestrator presents the four-option Rebalance approval regardless, and fires it on `coherent` too when the recommendation is `state brief`, where Revise Brief is the option that states one; the recommendation is advisory.

**Rationale for the priority order.** A wrong brief forces a wrong artefact and a wrong evidence base, so revising the brief resolves more drift than revising the artefact: **Revise Brief** (the destination is wrong) → **Revise Evidence base** (the basis is wrong) → **Revise Artefact** (the work is wrong, destination and basis right) → **Accept Bounded Closure** (the destination is unreachable). The user always chooses; the order surfaces the most-likely-fundamental option first (Foundation V3 §2.1).

## Rules

1. **Never trust headers.** A plan saying "Status: In Progress" means nothing until you verify against code.
2. **Be specific.** "Partially done" is not enough — state exactly what exists and what doesn't.
3. **Cite evidence.** Every status update must reference a file path, line number, or git commit.
4. **Don't fix code or data.** This is a reconciliation pass. File issues for fixes; never implement them.
5. **Flag drift.** If a plan describes an approach that conflicts with what was actually implemented, note the divergence in the Reconciliation Log.
6. **Preserve content.** Don't rewrite plan descriptions or issue analyses. Only transition state and add reconciliation logs and evidence citations.
7. **A defect this pass leaves unfixed goes to