The dependent endpoint is read off which container a file sits in, and a split breaks that silently

---

The pass attributes one end of every relation to the item whose container carried the sentence. That is a proxy for the item the sentence is *about*, and a split — an ordinary maintenance operation the conventions put with the orchestrator at the user's word — separates the two without touching the file. It happened in this item's own session an hour before the first run, and it is why `L10` cites an acceptance criterion that belongs to a different item and has already been met.

---

**Filed by:** analyst, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260918-0738-curator-run.md, 260918-0823_*_the-edge-classification-is-neither-disjoint-nor-complete-in-three-demonstrated-places.md, 260918-0706-strike-unconfirmed-depends-on-entry.md

## The defect

`### The corpus, and the live/terminal bound` fixes the far endpoint carefully — by basename, or by the container hop, with the hop's authority argued and bounded. It fixes the near endpoint nowhere. Every test in `### The classification` says "this item", and "this item" is only ever defined as the item whose corpus is being read.

That holds as long as a container's files are about that container's item. A split breaks it. `rules/fusion-workbench-conventions.md` `## Backlog entries — work items` puts splitting with the orchestrator at the user's word and states that none of the maintenance operations adds work to the store; nothing in it says the documents move, and in this case they did not. The spec stayed in the original container and half its subject left.

## The instance, verified

`260917-2256_*_spec-depends-on-edges-proposed-and-confirmed.md` `### C1` carries this acceptance criterion:

> - [ ] `260909-1700-cut-fusion-to-working-minimum.md` carries no `**Depends-on:**` field, and the change is one line removed with nothing else in that record touched.

The run read it as a relation between `260917-2253-…` and `260909-1700-…` and proposed `L10` on it. But C1 was split out on 260918-0706 and is now the whole of `260918-0706-strike-unconfirmed-depends-on-entry.md`, which reads `**Status:** done`. The strike landed: `260909-1700-cut-fusion-to-working-minimum.md` carries no `**Depends-on:**` field today. So the criterion describes work that a **different** item did and that is **finished**, and the entry attributes it to the item whose directory the spec happens to sit in.

The run saw it and said so — "A user who reads this and refuses it is reading it correctly" — but filed it against a section that has no rule to fix. Naming the weakness inside an entry does not repair the mechanism that produced it, and the next instance will be in a run nobody reads this carefully.

## Why it is worth a record rather than a note on `L10`

The proxy is load-bearing twice over, because the hop authorised at `git:8fad8ead` applies the same substitution to the far endpoint: a cited record identifies the item whose container holds it. Both ends of every proposed edge are now attributed by directory membership rather than by subject. A split, a container that holds a document about two items, and a document filed in the wrong container all produce a confidently-tiered edge between the wrong pair, and none of the three is detectable from the sentence.

The `inferred` tier does not carry this. `inferred` is defined as fixing the relation "from what the two items' artifacts and directives do" — it grades the reading of the relation, not the identification of the endpoints, and a reader trusting the tier is being told the wrong thing is uncertain.

`L10` is worth noting separately as an entry: the edge it proposes is defensible on other evidence in the same corpus — `260911-0715_*_a-depends-on-entry-asserts-an-ordering-where-the-section-it-was-derived-from-asserts-a-conflict.md` sits in `260909-1700-…`'s container and is already cited by this item's head, so the hop reaches the same target from a citation that is still true. The edge may be right; the citation offered for it is not. That is the failure mode the ledger's whole citation discipline exists to make impossible, since the ledger's promise is that checking an entry is one file open.

## Acceptance test

The section says how the near endpoint is identified, in the same terms it uses for the far one, and a document whose subject has moved out of the container it sits in does not produce an edge attributed to that container's item — or the section states that it may, names the cost, and the tier vocabulary distinguishes an endpoint fixed by the sentence from one fixed by directory membership. `L10` is re-derived under the amended rule before it is offered at a gate, and either carries a citation that is true at HEAD or is withdrawn.
