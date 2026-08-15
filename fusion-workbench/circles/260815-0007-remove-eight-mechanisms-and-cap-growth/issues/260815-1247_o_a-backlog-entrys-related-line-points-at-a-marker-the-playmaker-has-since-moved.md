# A backlog entry's Related line points at a marker the playmaker has since moved

---

`shared/backlog/260814-2312_c_collapse-the-eight-admin-commands-into-three-entry-points.md` names its
sibling as `shared/backlog/260814-1733_p_radical-simplification.md`. That entry is now `_c_`, so the
citation resolves to nothing. Its sibling cites the same store with a `_*_` stem and does not break.

---

**Severity:** Low — one dangling citation between two entries in one directory.
**Domain:** data
**Filed by:** `ontorev`, reviewing `7c12d6a..5d29b6d` (`reviews/260815-1247-ontorev-turn-2-structured-data.md`)
**Owner:** `ontocoder`
**Affects:** `fusion-workbench/shared/backlog/260814-2312_c_collapse-the-eight-admin-commands-into-three-entry-points.md:6`

**Verified 2026-08-15 at HEAD `5d29b6d`.** The store holds five entries; no
`260814-1733_p_radical-simplification.md` exists.

## The two forms, in one directory

Broken, a live pointer written at the marker of the day:

> **Related:** `shared/backlog/260814-1733_p_radical-simplification.md` — this is a sub-step of that
> simplification and should be shaped as part of it, not on its own axis

Durable, in the very file it points at:

> Split from `shared/backlog/260811-0826_*_observations.md`.

Both were written by the playmaker's maintenance pass. The store therefore carries two citation forms for
the same kind of reference, and only one of them survives the transitions the same agent performs.

## Why the backlog makes this worse than elsewhere

`rules/fusion-workbench-conventions.md` `## Backlog entries` gives the playmaker an **autonomous** rename
between `_o_` and `_p_`: *"Renaming between `_o_` and `_p_` states the playmaker's own ranking of a live
idea and is autonomous."* A pointer written with `_p_` in it is therefore invalidated by a write that
needs no gate and leaves no record beyond the rename. Elsewhere a marker moves at a reviewed transition;
here it moves whenever the ranking changes.

## Not a defect

The closure note in `260811-0826_c_observations.md` — *"Split: became
`260814-1733_o_radical-simplification.md`, …"* — names three entries at their `_o_` names and two of them
have moved since. That line is a historical statement about what the split produced and stays true. Only
the `**Related:**` pointer above is live.

## What the fix has to establish

Rewrite the one `**Related:**` citation in the `_*_` stem form. Whether the convention should say so for
every marker-bearing citation is the open question deferred by
`issues/260815-0804_o_a-decision-records-cross-reference-points-at-an-a-circle-md-that-activation-renamed.md`,
and it now has a third store's worth of evidence behind it.

## Related

- `issues/260815-0804_o_a-decision-records-cross-reference-points-at-an-a-circle-md-that-activation-renamed.md`
- `issues/260815-1247_o_the-implemented-decision-records-two-cross-references-were-broken-by-the-commit-that-transitioned-it.md`
