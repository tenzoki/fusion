# `map_view`'s cache and cleanup die in the subshell every caller runs it in

---

**Severity:** Medium
**Domain:** code
**Filed by:** coderev, review of `ff70d3a..HEAD` (session `260810-0241-orchestrator-session.md`, Turn 2)
**Affects:** `bin/fusion-plane:671-729`, `:764-781`
**Cross-references:** commit `c923935`; `260810-0456_*_fusion-plane-dry-run-rewrites-the-map-and-can-destroy-a-mapping.md` (the fix that introduced this)

---

## The defect

`map_view` caches its fold in three shell variables (`MAP_VIEW`, `MAP_VIEW_TMP`,
`MAP_VIEW_READY`), reports the fold once per run via `MAP_FOLD_REPORTED`, and hands its temp
file to an `EXIT` trap (`map_view_cleanup`, `:677-678`).

Every function that calls it is itself always called inside a command substitution:

| Caller | Call site |
|---|---|
| `map_json` (`:764`) | `$(map_json \| jq …)` at `:1509`, `:1556`, `:1626`, `:1628` |
| `map_get_id` (`:766`) | `pid="$(map_get_id "$nk")"` at `:1559` and in `process_artifact` |
| `map_get_state` (`:767`) | same shape |
| `map_get_origin` (`:777`) | `origin="$(map_get_origin "$nk")"` at `:790` |

A command substitution runs in a subshell. Every assignment `map_view` makes is discarded when
that subshell exits, and bash does not run an inherited `EXIT` trap for a command-substitution
subshell. So on each lookup the fold is recomputed from scratch, a fresh temp file is created,
the "once per run" report fires again, and nothing removes the file.

The function's own header names this exact mechanism, for a different reason:

> it does not print the path, because a command substitution would run it in a subshell and lose
> the cached fold, the temp-file handle and the once-per-run report with it — `:682-684`

The hazard was seen and then designed around only for the return-value case.

## Measurement

One `push --plan --all` against a fixture workbench whose map carries one marker-bearing key,
with `TMPDIR` pointed at an empty directory:

| Binary | temp files left in `$TMPDIR` | fold-report lines on stderr |
|---|---|---|
| `ff70d3a` (before the fix) | 0 | 0 (it wrote the map instead — issue `260810-0456_*_fusion-plane-dry-run-rewrites-the-map-and-can-destroy-a-mapping.md`) |
| `c923935` (HEAD) | **24** | **24** |

Control, same binary against an already-folded map: 0 files, 0 reports.

Two independent confirmations of the mechanism: a bash `EXIT` trap does not run when the
function is invoked as `x=$(f)` and the file it created survives; and a variable assigned inside
`$(…)` does not survive to the parent.

## Consequences

1. **Unbounded temp-file leak.** One file per lookup, none removed, for the whole life of any
   workbench whose map is still in the legacy form — which is exactly the population
   `map --migrate` was added for and which will not have run it yet.
2. **The report inverts its own purpose.** `map_report_fold` names each losing UUID because
   "that string is the only handle a human has on the stray Plane issue" (`:710-713`). Repeated
   24 times it is a wall the operator scrolls past.
3. **Cost.** Four `jq` passes over the whole map per lookup, where the design intends one per run.

## Suggested fix direction

The three getters are the only reason `map_view` is reached from a subshell. Either resolve the
view once in the parent before any loop that reads it (an explicit `map_view` call at the top of
`reconcile_*`, `map_prune`, `cmd_map`) and have the getters read `$MAP_VIEW` without calling
`map_view` themselves; or make the fold deterministic in its temp path so a re-entrant call
reuses the same file and the trap has one thing to remove.

---
Resolved: building the view moved into the parent, and the header stopped being the only place that knew.

Every getter invoked `map_view` as `$(…)`, so its cache and its cleanup died with the subshell. Measured: one `push --plan --all` against a legacy map leaked 24 temp files and printed the fold report 24 times; the pre-fix binary leaked none. After: 0 temp files, 1 report.

**The code moved to the header, not the reverse.** `map_view`'s own header already named this hazard, for the return-value case only — so the file already knew, in one place, and the code did not. Building the view is now each subcommand's job in the parent, and the four getters call a new `map_view_required` that fails closed when nobody built one.

One detail worth keeping: `map_put` sets the view to what it just wrote rather than clearing it, because what it wrote is already the folded form. That removes the invalidate-and-rebuild dance instead of adding a step to it.

Session: `260810-0241-orchestrator-session.md` (Turn 3, task R4). Executor log: `260810-0805-coder-plane-discarded-write-status.md`.
