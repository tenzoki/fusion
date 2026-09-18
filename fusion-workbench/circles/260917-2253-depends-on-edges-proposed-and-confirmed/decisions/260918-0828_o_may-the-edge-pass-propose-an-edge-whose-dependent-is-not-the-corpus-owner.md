# May the edge pass propose an edge whose dependent is not the corpus owner?

---
**Domain:** code
**Filed by:** coder, Kai Stalmann <ks@qantr.com>
**Cross-references:**
`260918-0823_*_the-edge-classification-is-neither-disjoint-nor-complete-in-three-demonstrated-places.md`
(section 2, where the question is derived as Gap B);
`260918-0827-adversarial-read-of-the-first-edge-run.md` (finding 7, which shows Gap B and the
first run's finding F4 are one question rather than two);
`260918-0738-curator-run.md` (the first run, where F4 was named and left);
`260917-2253-depends-on-edges-proposed-and-confirmed.md` (the work item)

---

## Question

`agents/curator.md` `### The classification, cut on direction` reads each sentence of a live work
item's corpus and proposes an edge between two work items. Both tests identify endpoints without
assigning roles; only the ordering reading assigns a direction. So a sentence in item A's corpus
may fix an ordering in which **B is the dependent** — B waits on A, or B waits on C — and the
entry would then be written into a record whose corpus this run never read.

May it? The question is the user's because it is a question about what this pass is *for*, not
about whether its text is consistent.

**It is one question, not two.** It reaches two inputs that have until now been carried as
findings of different severities:

- **Gap B** — the dependent is the other item and the target is the corpus owner. Where that
  other item is terminal, the entry would be forbidden by the live/terminal bound and by the
  write bound, and was routed by nothing at all.
- **F4** — a quoted ordering between two work items *neither* of which owns the corpus, discarded
  before the identification test. Its exposure is narrower and better located than the first run
  said: a record discussing two items usually sits in one of their containers, so the corpus-owner
  rule catches it. The real exposure is `shared/decisions/`, where 27 of the 70 citations in the
  first run's corpus resolve, and which is precisely where cross-item relations get ruled on.

A *no* closes both at the cost F4 names. A *yes* closes both and needs a liveness check on the
dependent — which the apply pass's precondition 2 now performs for every edge entry anyway.

## What the prompt does today, pending the ruling

Neither answer is written into the prompt. `### The classification, cut on direction` routes the
reading to **residue** — reported one line with the record it came from, proposed never — and
cites this record. That is the status quo made visible, not a ruling: before it, the reading fell
in no branch at all and was discarded unseen. The classification is disjoint and complete under
it, and stays so under either answer.

## Options

1. **No — the dependent is always the item whose corpus carried the sentence.**
   - Pros: the write bound stays a one-line fact ("this subject writes into a live work item's
     head and nowhere else"); no entry is ever proposed for an item this run did not read; the
     per-item iteration is the whole of the pass's scope.
   - Cons: an ordering stated in a shared decision record about two other items is never
     proposed, whoever's corpus reaches it. The residue reports it and a human acts on it.
2. **Yes, where the dependent is one of the two items the sentence identifies.** The entry is
   written on that item; the apply pass's liveness precondition already refuses a terminal one.
   - Pros: catches the orderings that are actually recorded where cross-item orderings get
     recorded; loses nothing that option 1 keeps.
   - Cons: the same edge is reachable from several corpora, so the suppression read carries more
     weight; the write bound needs restating, since the item written is no longer the item read.
3. **Yes, and drop the corpus-owner requirement entirely** — any two work items the sentence
   identifies, neither needing to own the corpus. This is F4 answered in full.
   - Pros: one rule instead of two; `shared/decisions/` becomes a first-class source.
   - Cons: the widest yield of the three against a gate that `260918-0824_*_the-container-hop-voided-the-only-stated-mitigation-for-flooding-the-gate.md`
     shows is already unbounded; it makes every run's corpus reach every item.

## Constraints

- Whatever is chosen, the dependent must be **live** at apply time. That check exists and is
  precondition 2 of the edge exception in `agents/curator.md` `### Pass 2 — apply`.
- The classification must stay disjoint and complete under the answer. All three options leave it
  so: 1 keeps residue, 2 and 3 move that cell to an entry.
- No answer writes into a work item before the gate.
- Gap B and F4 are ruled together. Answering one and leaving the other is what produced the
  present state, where an identical input is an open finding on one route and an undiscovered gap
  on the other.

## Recommendation

None offered. `speculation:` option 2 looks like the smaller step, but the yield question in
`260918-0824_*_the-container-hop-voided-the-only-stated-mitigation-for-flooding-the-gate.md` is
unresolved and it is that question, not this one, that decides whether widening the corpus is
affordable. Ruling this before that would be answering in the wrong order.
