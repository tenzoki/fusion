# May a helper compute an order over work items after the portfolio layer goes?

---
**Domain:** code
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260909-1615_*_spec-cut-fusion-to-a-working-minimum.md `### C6: The portfolio layer becomes a flat list`, 260908-2018-prerequisites-confirmed-once-order-computed

---

## Question

C6 of the cut specification states, of the flat store that replaces the portfolio layer: "Order is
the user's and is not computed." Read literally that sentence forbids any computed ordering over
work items, and it therefore forbids the whole of the anticipated Circle
`260908-2018-prerequisites-confirmed-once-order-computed`, which exists to hold the prerequisite
relation as a confirmed assertion and compute depth, transitive blocking count, topological order,
readiness and cycles from it.

The sentence was written against playmaker's ranking, which asserts a ranked list from three prose
signals with no stated arithmetic and reads dependencies exactly one hop. Removing that is the
cut's intent. Whether it also removes a helper that computes an order from edges the user has
confirmed is a different question, and the two collide only on this sentence.

## Options

1. **The sentence stands.** No computed order over work items at all. The prerequisites Circle
   cannot be realised in any form.
2. **The sentence narrows to what it was aimed at.** No agent asserts a ranking. A helper may
   compute and report an order from confirmed prerequisite edges, and the user is free to ignore it.
3. **Order is computed by default.** The computed order governs unless the user overrides it.

## Constraints

- The carrier for a confirmed edge is the Circle record's `## Dependencies` section today, and C6
  deletes it. Any answer other than option 1 requires the replacement work-item file to carry a
  machine-readable dependency field, and it must be specified before the migration rather than
  retrofitted over every item afterwards.
- No agent originates a work item; that filing rule survives C6 and is not touched here.

---
Answered: 260909-1808_*_may-a-helper-compute-an-order-over-work-items-after-the-portfolio-layer-goes.md `## Question` — option 3: the user ruled that the order is not necessarily his to set, and that it is to be computed. The helper computes it; the user overrides where he wants to. C6's sentence is superseded by this record and must be restated when the spec is next edited; the work-item file carries a machine-readable dependency field from its first version; ruled by user, Kai Stalmann <ks@qantr.com>.
