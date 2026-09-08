# Is a closed prerequisite a satisfied edge or no edge, and what is an archived one?

---
**Domain:** code
**Filed by:** shaper, Kai Stalmann <ks@qantr.com>
**Cross-references:**
`agents/playmaker.md:130` (a dependency resolving only under `archive/` is reported as `archived`
and never counted as closed);
`agents/playmaker.md:138` (the cycle graph spans `_a_` and `_t_` records only);
`rules/circle-records.md` `### Worked transitions` (the terminal markers);
`260819-1645_*_what-defines-the-citation-gates-corpus-and-what-happens-when-a-marker-move-changes-it.md`
(the comparable question, answered for the citation gate).

---

## Question

Readiness is the figure the ranking reads: a node is ripe when its prerequisites are done. That
makes the treatment of a finished prerequisite the load-bearing definition of the whole mechanism,
and today two lines of one prompt treat it two ways. `agents/playmaker.md:138` builds the graph over
non-terminal records only, so an edge to a closed Circle is not in the graph at all.
`agents/playmaker.md:130` reads the same edge as a flag and reports an archived target as
`archived`, explicitly refusing to count it as closed.

Three target states have to be distinguished and only two are today: a target that is live, a target
that carries a terminal marker in place, and a target that carries a terminal marker under
`archive/`. In this repository the third is not hypothetical. Three of the 23 records cite
`260822-1921-measure-what-two-checkouts-share`, which was archived and no longer resolves under
`circles/`.

The user has ruled what happens to an edge that resolves to nothing: report it, keep the node, drop
the edge. That ruling does not cover an edge that resolves perfectly well to a record whose work is
finished, which is the common case rather than the exception.

## Options

1. **Terminal in place is satisfied; archived is satisfied; unresolvable is reported and dropped.**
   Closure is closure, and where the record now sits says nothing about what it settled.
   - Pros: it is what a reader means by "prerequisite done", and it makes the readiness figure agree
     with the marker vocabulary, which is the source the user chose for progress. The archive is a
     move, not a reversal.
   - Cons: it contradicts `agents/playmaker.md:130` as written, so that line changes or the two
     readings stay in conflict.
2. **Terminal in place is satisfied; archived is reported and neither satisfied nor blocking.** The
   existing prompt line is preserved and generalised.
   - Pros: no change to a shipped reading; an archived target is a real signal that the citation may
     have decayed, and the archive sweep of `260817-1907` is on record as having broken six
     citations without anything noticing.
   - Cons: it leaves a node permanently neither ready nor blocked, which is a third state the
     ranking has no way to order.
3. **A terminal target is removed from the graph entirely, as today.** Only live prerequisites are
   edges.
   - Pros: matches `agents/playmaker.md:138` exactly; the graph stays small.
   - Cons: the transitive count then measures only unfinished work, so a node whose whole chain is
     done and a node with no chain at all score identically. That is the figure the Circle exists to
     produce, and this option makes it blind to history.

## Constraints

- The marker on the filename is the only progress source this Circle admits; no answer may introduce
  a second one.
- `rules/circle-records.md` forbids editing a terminal record, so no answer may require writing into
  one to repair its state.
- Whatever is chosen holds identically for both node kinds, since a backlog entry's `_c_` and a
  Circle's `_c_` both mean the work is no longer live.

## Recommendation

Option 1, with the conflicting line in `agents/playmaker.md` corrected in the same commit rather
than left standing. The archive is a relocation of a finished record and the terminal-states rule
already says closure is not a move. Option 3 is the strongest competitor and fails on one measured
property of this repository: 22 of 23 records are terminal, so a graph that drops them is the empty
graph, which is the state this Circle was filed to leave.
