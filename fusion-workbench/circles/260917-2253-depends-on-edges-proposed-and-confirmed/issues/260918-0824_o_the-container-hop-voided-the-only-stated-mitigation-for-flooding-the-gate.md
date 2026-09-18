The container hop voided the only stated mitigation for flooding the gate, and the two things named as holding it hold nothing

---

The plan's risk register mitigates gate flooding with one sentence: the cross-reference arm proposes only between two work items, not for the decision, analysis and plan records an item cites. The hop authorised at `git:8fad8ead` turns every cited record into a work-item endpoint, which is that mitigation's negation. The repair names the risk and says the one-hop bound and the pre-test hold it. Measured on the corpus the first run read, neither does.

---

**Filed by:** analyst, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260918-0738-curator-run.md, 260918-0823_*_the-edge-classification-is-neither-disjoint-nor-complete-in-three-demonstrated-places.md, 260918-0712_*_implementation-depends-on-edges-proposed-and-confirmed.md

## The defect

`260918-0712_*_implementation-depends-on-edges-proposed-and-confirmed.md` `## Risks & Mitigations`:

| Risk | Mitigation |
|---|---|
| The pass floods the gate with citation proposals | The cross-reference arm proposes only for a relation read between **two work items** — not for the decision, analysis and plan records an item cites, which have their own checkers. |

`agents/curator.md` `### The corpus, and the live/terminal bound` now reads:

> **A citation of a record identifies the work item whose container holds it.** … **It is one hop and there is no second** … it takes the candidate sources on a corpus like the first run's from 4 work-item basenames to some 30 record citations, which is the gate-flooding the plan's risk row names, and the one-hop bound plus the pre-test in `### The classification` are what hold it.

The mitigation said the decision, analysis and plan records an item cites do not become endpoints. The hop says they do. The plan's risk row is false at HEAD and nothing marks it.

The two replacements do not hold the risk:

- **The one-hop bound** stops recursion. It does not reduce the number of citations standing in the corpus, which is where the count comes from. It bounds the depth of a walk nobody was proposing to take.
- **The pre-test** excludes a sentence asserting no relation to another work item. After the hop, a sentence naming any record that lives in any container asserts a relation to another work item. The pre-test therefore excludes *less* after the repair than before it, which is the opposite of holding a flood.

## Measurement on the corpus the first run read

Over the item record and every file in its container, 70 distinct record basenames are cited. Resolved workbench-wide, excluding the archive:

| Where the citation resolves | Count |
|---|---|
| `shared/` stores (no container, so no work-item endpoint) | 35 |
| into a container — 6 the item's own, 21 another's | 27 |
| unresolved | 8 |

Those 21 citations into another container name **11 distinct containers**. Six of the eleven are excluded by the legacy-vocabulary rule the same commit added — five carry a pre-grammar `**Status:**` and one carries no `**Status:**` line at all. The remaining **five are work items**, all terminal and therefore all admissible as `**Cross-references:**` targets: `260908-2018-prerequisites-confirmed-once-order-computed.md`, `260909-1700-cut-fusion-to-working-minimum.md`, `260912-0438-human-facing-docs-leave-claude-md.md`, `260917-1338-depends-on-kanten-automatisch-erzeugen.md` and `260918-0706-strike-unconfirmed-depends-on-entry.md`. Two of the five the field already carries.

So on this store the real bound turns out to be the legacy-container exclusion and the fact that the store holds seven work items — neither of which is what the repair names, and neither of which scales. A workbench of forty native work items and the same citation density puts the endpoint count an order of magnitude higher with the same text in force.

The item record's own `**Cross-references:**` is the cleanest demonstration. Every one of the four basenames it already carries is a *record*; three of the four resolve into a container, and two of those containers are work items. The field the pass writes into is itself a source of new edges for the next run.

## A second consequence: the first run's result no longer reproduces

`260918-0712_*_implementation-depends-on-edges-proposed-and-confirmed.md` step 7 states its expected result in advance, "**two `**Cross-references:**` proposals**", so that a surprise is visible. At HEAD that number is wrong: the hop the same commit authorised reaches three not-yet-cited work items, and the residue items the run reported as `R2` and `R3` now identify endpoints and become entries rather than residue. A re-run of step 7 against the repaired prompt would differ from its own stated expectation, and the difference would read as a defect rather than as the repair working.

## Acceptance test

The prompt states what bounds the citation-edge yield in a way that does not name the one-hop bound or the pre-test, or it states that the yield is unbounded and the gate is the bound. The plan's risk row is corrected or struck, since the text it describes is gone. Step 7's expected result is re-derived at HEAD and the new figure recorded beside the old one with the reason it moved, so that the next run is measured against the design it is running.
