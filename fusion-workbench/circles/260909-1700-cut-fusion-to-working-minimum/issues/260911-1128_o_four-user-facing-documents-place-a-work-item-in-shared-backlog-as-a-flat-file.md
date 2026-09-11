Four user-facing documents place a work item in shared/backlog as a flat file
---
`bin/fusion-paths` values `OUT_BACKLOG` and `SCAN_BACKLOG` as `circles`, and the conventions define an item as a directory holding a record of its own name. Four shipped documents still say an item is one file at `fusion-workbench/shared/backlog/<stamp>-<slug>.md`. The directory they name has no resolver key and holds two entries nothing scans.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** `260910-2020_*_the-two-existing-backlog-entries-keep-the-retired-marker-form-that-d1-migrates-into.md` (the two stranded entries, filed when the store was still `shared/backlog/`); `a8f52f62`, `9b792042` (the grammar as it stands)

**The shipped answer**, `bin/fusion-paths:387`:

```
    OUT_BACKLOG|SCAN_BACKLOG)     printf '%s' "circles" ;;
```

and `rules/fusion-workbench-conventions.md` `## Backlog entries — work items`: *"It is a directory,
and its record lives inside it. The container is `circles/YYMMDD-HHMM-<slug>/` (`$OUT_BACKLOG`) and
the record is `circles/YYMMDD-HHMM-<slug>/YYMMDD-HHMM-<slug>.md`"*. `skills/memo/SKILL.md:108` writes
exactly that shape, so the executable half is coherent.

**The six sites that are not**, measured at HEAD `1d6103c4`:

| site | what it says |
|---|---|
| `docs/working-model.md:11` | *"An item lives at `fusion-workbench/shared/backlog/<timestamp>-<slug>.md`"* — and the heading above it reads **One file per item** |
| `docs/working-model.md:163` | *"A new file appears at `shared/backlog/<stamp>-split-…>.md`"* |
| `docs/fusion-intro.md:85` | *"Es ist *eine Datei*, `fusion-workbench/shared/backlog/<stamp>-<slug>.md`"* |
| `docs/fusion-intro.md:107` | *"als eigene Datei in `shared/backlog/`"* |
| `README.md:163`, `:165` | *"file … in `backlog/`"*; *"files ideas as work items in `shared/backlog/`"* |
| `README-agents.md:34`, `:226` | *"the work items at `backlog/`"*; *"files an idea as a new work item in `fusion-workbench/shared/backlog/`"* |

Each is wrong twice — the store, and the shape (a file where the grammar has a directory).
`working-model.md` and `fusion-intro.md` are the two documents a new user is pointed at, so this is
the first thing they learn about the unit of work.

**The store is now orphaned, not merely renamed.** `fusion-workbench/shared/backlog/` still holds
two entries, stamped 260814-1733, with the slugs `bounded-executor-dispatches` and
`attach-the-rule-to-the-act` and the retired markers `_c_` and `_p_` on their names. No `SCAN_*` key
names that directory, so nothing reads them; the record cross-referenced above was filed when they
were merely in the wrong grammar and it is now also the wrong store. This part is that record's to
carry.

**Acceptance.** The six sites name `circles/<stamp>-<slug>/<stamp>-<slug>.md` and say directory
rather than file, or the resolver names `shared/backlog` again. A grep for `shared/backlog` over
`docs/`, `README.md` and `README-agents.md` returns only sentences whose subject is that the store
moved.
