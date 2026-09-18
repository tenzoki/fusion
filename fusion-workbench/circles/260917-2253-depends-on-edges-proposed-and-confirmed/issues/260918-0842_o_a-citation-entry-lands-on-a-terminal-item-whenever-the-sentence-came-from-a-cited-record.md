The citation cell writes onto a terminal item whenever the sentence came from a cited record

---

`### The classification, cut on direction` makes the corpus owner the dependent "by definition" in the `(non-empty, no)` cell. For every sentence read out of a record the item record *cites*, that owner is the container the record sits in, which is routinely a terminal item. Three clauses in the same section say that cannot happen.

---

**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>

## The defect

`agents/curator.md` `### The corpus, and the live/terminal bound` defines the corpus as three things:

> read the item record, every file inside that item's own container directory, and every record **the item record** cites

The third of those sits in **other containers**. The same section then fixes the near endpoint by directory:

> The dependent is the item whose container held the file the sentence came from

The classification table's third row then reads:

> | non-empty | no | a `**Cross-references:**` entry on the corpus owner … A citation has no direction, so the corpus owner is the dependent by definition

`corpus owner` carries two referents that only coincide inside the live item's own container: the live item whose corpus this is, and the item owning the container the file sits in. The completeness argument for the ordering cell rests on the first — "The corpus owner is live by construction" — while the near-endpoint rule fixes the second.

Three clauses forbid the result the second reading produces:

- `### The corpus, and the live/terminal bound`: "this subject writes into a live work item's head and nowhere else."
- `### The classification, cut on direction`: "**The dependent is live in every outcome that produces an entry**".
- `## Scope`: "in the head of a **live** work item".

## It is reachable on this workbench today, not hypothetically

The one live item's record cites three records that resolve into other containers:

```
$ git ls-files ':(top)fusion-workbench/**/260909-1020_?_three-source-aspects-unnamed-and-the-proposal-pass-has-no-agent-or-surface.md'
fusion-workbench/circles/260908-2018-prerequisites-confirmed-once-order-computed/issues/260909-1020_o_…
```

`260908-2018-prerequisites-confirmed-once-order-computed` is `**Status:** done`. Any sentence in that issue naming another work item by basename is `(non-empty, no)`, and the table puts a `**Cross-references:**` entry on a terminal item. The other two citations resolve the same way, into `260908-2018` and into `260909-1700-cut-fusion-to-working-minimum`, both `done`.

The damage is bounded but real: precondition 2 of `### Pass 2 — apply` catches it after the gate and marks the entry `stale`, so nothing corrupts. What is spent is the user's judgement at a gate on a proposal that can never apply, and what is false is the section's own claim that the dependent is live in every outcome that produces an entry.

## Not the same as the two records already open on this corner

`260918-0825_*_…` is about the near endpoint being a *proxy for aboutness*, and `260918-0828_*_…` asks whether the pass may propose an edge whose dependent is not the corpus owner in the **ordering** cell. Neither reaches the citation cell, where the table asserts the dependent "by definition" and asks nothing about liveness.

## Acceptance test

Take a sentence out of `260909-1020_*_three-source-aspects-unnamed-and-the-proposal-pass-has-no-agent-or-surface.md` naming a work item other than `260908-2018`. Run it through `### The classification, cut on direction` as written. The outcome is either an entry on a live item or a stated non-entry — never an entry on `260908-2018`.
