# Does a unit of work keep its own container for the artifacts it produces?

---
**Domain:** code
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260909-1843_*_implementation-cut-fusion-to-a-working-minimum.md step C9; 76d833be; 07961552; 260909-1615_*_spec-cut-fusion-to-a-working-minimum.md

---

## Question

Step C9 replaced the Circle with a work item: one file in the shared backlog store, carrying `**Status:**`, `**Claim:**` and `**Depends-on:**` in its head, with no marker on its filename. It removed the container with it. A Circle was a directory holding that unit of work's own `planning/`, `issues/`, `decisions/`, `history/`, `reviews/` and `analyses/`; an item has none, and every artifact now lands in one shared store per kind. The Origin Rule, which decided which of the two a given artifact belonged in, was deleted outright on the ground that with one store per kind there is no placement decision left to govern.

The question is whether that removal stands, and it has to be asked now rather than after step D1, because D1 is the one-way move that would flatten twenty-six existing containers into the shared stores.

## Options

1. **Restore the container, keep the item file's shape.** A unit of work is a directory again, holding its artifacts, and the item record inside it keeps everything C9 gave it: no filename marker, state as a head field, one file per item so two checkouts merge without conflict.
   - Pros: the overview comes back, and the two properties C9 bought — a citation that survives a state change, and merge-friendly filing — are not paid back for it.
   - Cons: the Origin Rule has to come back with it, because a placement decision exists again; the resolver needs a per-work branch again; and the migration body has to be rewritten before D1 runs.
2. **Leave it flat.** One store per kind, as C9 shipped it.
   - Pros: no placement decision, a simpler resolver, and the cut's smallest surface.
   - Cons: nothing bundles what one unit of work produced, so the only way to see it is to search six stores by stamp.
3. **Flat stores plus a generated index.** Keep one store per kind and have a helper render, per item, what belongs to it.
   - Pros: no placement decision and no move.
   - Cons: the index is derived from something, and after the cut nothing records which unit of work an artifact came from; the field that would carry it does not exist.

## Constraints

D1 has not run and the user has not updated their install, so twenty-six containers and 1414 files are intact on disk. Whatever is chosen must be settled before D1, because D1 is not reversible by a forward commit.

## Recommendation

Option 1. Option 3 is not available on today's evidence: it needs a per-artifact origin field that the cut removed along with the rule that set it, so it would have to be reintroduced anyway, and at that point the container is cheaper than the index.

---
Answered: 260910-0900-orchestrator-session.md `## Ruling on the container` — option 1, restore the container while keeping the item file's shape. The user's reason, in their own words: the Circles were introduced for a good reason, and without the bundling it is impossible to keep an overview. Ruled by user, Kai Stalmann <ks@qantr.com>.
