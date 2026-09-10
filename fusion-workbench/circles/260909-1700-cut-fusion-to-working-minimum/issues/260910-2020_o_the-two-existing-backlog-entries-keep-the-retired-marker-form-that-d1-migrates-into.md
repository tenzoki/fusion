The two existing backlog entries keep the retired marker form that D1 migrates into
---
Step C9a defined the work item as a file in `shared/backlog/` with **no marker on the filename** and its state in a `**Status:**` head field. The two entries already in that store carry a state marker between the stamp and the slug, in the form the same commit retired. Step D1 moves every Circle into the same store, so after the one-way step the backlog holds two grammars and nothing says which one a reader or a helper should expect.
---
**Filed by:** reconciler, Kai Stalmann <ks@qantr.com>
**Cross-references:** `260909-1843_*_implementation-cut-fusion-to-a-working-minimum.md` steps C9, D1; `76d833be` (the item grammar); `07961552` (the migration body)

**Evidence, read at `07961552`.** `ls fusion-workbench/shared/backlog/` returns two entries, both
stamped 260814-1733, one closed and one recommended:

```
260814-1733<marker>bounded-executor-dispatches.md
260814-1733<marker>attach-the-rule-to-the-act.md
```

where `<marker>` is `_c_` on the first and `_p_` on the second. Both are tracked. Neither carries a
`**Status:**` field. `rules/fusion-workbench-conventions.md`
`## Backlog entries — work items` states the store's grammar as `YYMMDD-HHMM-<slug>.md` with no
marker, "because an item's state is a head field: a state change edits the file instead of renaming
it, so every citation of an item stays valid for the item's whole life".

`skills/migrate/SKILL.md` converts Circle directories into that store and says nothing about what is
already in it: its survey block enumerates `circles/`, the pre-v4 type folders and bracket-marked
filenames, and its Step 4b builds one item per Circle. A grep for `backlog` over that body returns
four lines, all of them about the destination.

**Why it is worth a record rather than a rename in passing.** Renaming a file removes the marker
that carries its state, so the state has to be read out of the old marker and written into the new
field in the same act — which is exactly what Step 4b already does for a Circle record, with a
marker-to-status table and a user confirmation in front of it. Doing it by hand beside the migration
would be a second, unconfirmed conversion of the same kind. And the recommended entry is live: `_p_` meant
recommended, which maps to no value in `open | claimed | done | dropped` any more cleanly than
deferred does (`260910-2011_*_the-deferred-state-has-no-value-in-the-work-items-status-set.md` is
the same question one marker over).

**Acceptance.** Before D1 runs, either the migration body converts the entries already in
`shared/backlog/` alongside the Circles, with its marker-to-status table extended to the issue
vocabulary the two entries carry, or the conventions state that pre-v11 backlog entries keep their
marker form and how a reader tells them from work items. After D1, one `ls` of the store shows one
grammar, or shows two and the text says which is which.
