# Strike the one unconfirmed `**Depends-on:**` entry and close the two defects that name it

---
**Domain:** code
**Status:** done
**Claim:** 5e8248d7 — Kai Stalmann <ks@qantr.com>, 260918-0706
**Cross-references:** 260917-2253-depends-on-edges-proposed-and-confirmed.md, 260917-2256_*_spec-depends-on-edges-proposed-and-confirmed.md, 260911-1747_*_may-a-done-work-items-head-field-be-edited-at-all-and-under-what-bound.md
**Filed by:** user, Kai Stalmann <ks@qantr.com>

---

## Directive

The store holds exactly one `**Depends-on:**` value and it is wrong in two independent ways:
no user confirmed it, and it asserts an ordering where the prose it was derived from calls the
relation "substantive rather than an ordering nicety". It sits on
`260909-1700-cut-fusion-to-working-minimum.md`. Striking it is already authorised — the
answered decision on editing a terminal item's machine-readable head field rules that this
entry "may now be struck" — and the strike is the last remaining acceptance criterion in both
`260911-1747_*_the-migration-wrote-a-conflict-relation-into-depends-on-and-nobody-confirmed-it.md`
and
`260911-0715_*_a-depends-on-entry-asserts-an-ordering-where-the-section-it-was-derived-from-asserts-a-conflict.md`.

This is split out of `260917-2253-depends-on-edges-proposed-and-confirmed.md` because the two
halves of that item had different blockers: this one has none, and the other waited on a store
condition. It is also that item's genuine prerequisite: the proposal pass must not run against
a graph carrying an entry nobody confirmed, which the spec states in its own C1 heading, "the
store's one live edge is corrected **before the pass proposes anything**".

A reader knows this was reached when no work item in the store carries a `**Depends-on:**`
entry that a user did not confirm, and both named defect records carry a `Resolved:` note and
their closed marker.

---
Closed 260918-0706, coherent. One line removed from the head of
`260909-1700-cut-fusion-to-working-minimum.md` and nothing else in that record touched. Both
defect records carry their `Resolved:` note and their closed marker; the authorising decision
moved to implemented on the same change. The store now holds exactly one `**Depends-on:**`
entry, the one this split created, and a user confirmed it.

One consequence to name rather than leave for a reader to discover. This item is now terminal,
so it stops being a node, and the entry on
`260917-2253-depends-on-edges-proposed-and-confirmed.md` that names it becomes a dangle in the
ruled sense: the node is kept, the edge is dropped, and the count is reported. That is the
answered behaviour of a satisfied prerequisite and not a fault. The order over two nodes this
split produced stood for the length of the correction, which is what an ordering edge is for.
