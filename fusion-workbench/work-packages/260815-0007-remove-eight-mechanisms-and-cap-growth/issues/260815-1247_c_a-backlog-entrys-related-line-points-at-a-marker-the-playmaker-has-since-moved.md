# A backlog entry's Related line points at a marker the playmaker has since moved

---

`260814-2312_*_collapse-the-eight-admin-commands-into-three-entry-points.md` names its
sibling as `260814-1733_*_radical-simplification.md`. That entry is now `_c_`, so the
citation resolves to nothing. Its sibling cites the same store with a `_*_` stem and does not break.

---

**Severity:** Low — one dangling citation between two entries in one directory.
**Domain:** data
**Filed by:** `ontorev`, reviewing `7c12d6a..5d29b6d` (`260815-1247-ontorev-turn-2-structured-data.md`)
**Owner:** `ontocoder`
**Affects:** `260814-2312_*_collapse-the-eight-admin-commands-into-three-entry-points.md:6`

**Verified 2026-08-15 at HEAD `5d29b6d`.** The store holds five entries; no
`260814-1733_*_radical-simplification.md` exists.

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

The closure note in `260811-0826_*_observations.md` — *"Split: became
`260814-1733_*_radical-simplification.md`, …"* — names three entries at their `_o_` names and two of them
have moved since. That line is a historical statement about what the split produced and stays true. Only
the `**Related:**` pointer above is live.

## What the fix has to establish

Rewrite the one `**Related:**` citation in the `_*_` stem form. Whether the convention should say so for
every marker-bearing citation is the open question deferred by
`260815-0804_*_a-decision-records-cross-reference-points-at-an-a-circle-md-that-activation-renamed.md`,
and it now has a third store's worth of evidence behind it.

## Related

- `260815-0804_*_a-decision-records-cross-reference-points-at-an-a-circle-md-that-activation-renamed.md`
- `260815-1247_*_the-implemented-decision-records-two-cross-references-were-broken-by-the-commit-that-transitioned-it.md`

---

**Reconciliation 260819-1453 (reconciler, Domain `code`, Circle-store pass) — CLOSED as moot. The entry carrying the broken line left the live store.**

```
ls shared/backlog/
  260811-0826_c_observations.md
  260814-1733_o_attach-the-rule-to-the-act.md
  260814-1733_p_bounded-executor-dispatches.md

find fusion-workbench -name '*collapse-the-eight-admin*'
  archive/260817-1907-safe-cleanup-scoped/shared/backlog/
    260814-2312_c_collapse-the-eight-admin-commands-into-three-entry-points.md
```

The entry was closed and archived in `e59dea2` on 2026-08-17. The archived copy still spells the stale marker in its `**Related:**` line, and that is correct to leave: an archived record is frozen history, not a live pointer, and nothing enumerates it. No live backlog entry carries the defect.

**Closed as moot rather than as fixed, and the class was not addressed.** Nobody corrected the citation; the file that held it stopped being live. The general defect — a `**Related:**` line written with a literal marker against a record the playmaker will rename by design — is unfixed and has no gate: `hooks/lib/__tests__/reference-resolution-lint.test.ts` scans the *shipped text* and resolves its citations against the workbench, never the workbench against itself. Two sibling records in this same store state the same class from the decision side (`260815-0804_*_a-decision-records-cross-reference-points-at-an-a-circle-md-that-activation-renamed`, `260815-1247_*_the-implemented-decision-records-two-cross-references-were-broken-by-the-commit-that-transitioned-it`) and both stay open, so the class keeps a live carrier.

---
Resolved: moot. The backlog entry carrying the stale `**Related:**` marker (`260814-2312_*_collapse-the-eight-admin-commands-into-three-entry-points.md`) was closed and archived out of `shared/backlog/` in `e59dea2` on 2026-08-17. No live entry carries the defect. The citation was never corrected and the class stays open on two sibling records in this store.
