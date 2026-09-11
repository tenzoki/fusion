A work item's own record classifies as unclassified, so staging-drift claims nothing about the unit of work

---

`classify()` in `hooks/lib/staging-drift.ts` has no branch for a work item's record. The record whose basename equals its container's directory name matches no `LIVE_STATE` row, no `ROOT_RECORDS` row, not the `_circle.md` test at `:459`, and no entry of `STORES` at `:237`, so it falls through to `unclassified`. The v11 unit of work is therefore the one record `bin/fusion-staging-drift` explicitly claims nothing about, and an uncommitted work item never reaches `verdict=`.

---
**Filed by:** reconciler, Kai Stalmann <ks@qantr.com>
**Cross-references:** `260911-1339_*_staging-drift-still-classifies-a-pointer-a-rule-says-nothing-creates-and-names-a-turn-boundary-trigger-it-does-not-have.md` (the same file, the stale-prose subject; this is the classification gap its `:461` claim points at from the wrong side); `260811-0114_*_the-queue-rebuild-and-its-history-file-never-entered-a-commit-and-survive-only-in-the-working-tree.md` (the defect the helper was built for)

**Measured at HEAD `9ceb5cc7`**, by calling the compiled `classify()` on four paths:

```
<container>/<container>.md            (a work item's own record)
  -> {"klass":"unclassified","why":"not a record store and not live state — nothing is claimed about it"}
<container>/issues/<record>.md        (an issue inside the same container)
  -> {"klass":"record","why":"an authored record under the issues store"}
<container>/_c_circle.md              (a legacy Circle record)
  -> {"klass":"record","why":"a Circle record"}
<shared>/backlog/<record>.md          (a stranded entry of the retired store)
  -> {"klass":"record","why":"an authored record under the backlog store"}
```

where `<container>` is the container store joined with a work item's `YYMMDD-HHMM-<slug>` directory and `<shared>` is the shared store.

An artifact *inside* an item's container is classified, because its path carries a store segment. The item's own record is the one file in the container that carries none, and it is the file the item is.

**Why this matters more than an unclassified row usually does.** The `unclassified` class is documented as the one about which nothing is claimed, so the helper does not merely miss the record, it states that it has no opinion. `/fusion:memo idea:` writes exactly this shape, and `rules/fusion-workbench-conventions.md` `## Backlog entries — work items` makes it the unit of work. A session that files an item and does not stage it gets `verdict=` with the item absent.

**`STORES` still carries `backlog`.** The resolver names no such store at v11; the entry survives and is what classifies the two stranded entries under `fusion-workbench/shared/backlog/` as records. Whether it stays is the same question the item-record branch raises, so it is named here rather than filed twice.

**Acceptance test:** `classify()` returns a `record` class for a work item's own record, with a `why` naming what it is, and the test file pins it on both shapes: a record whose basename equals its container's name, and one whose does not. Whether `backlog` leaves `STORES` is decided in the same commit or filed as its own record. `hooks/dist/` is rebuilt in the same commit, because `committed-dist.test.ts` compares the two.
