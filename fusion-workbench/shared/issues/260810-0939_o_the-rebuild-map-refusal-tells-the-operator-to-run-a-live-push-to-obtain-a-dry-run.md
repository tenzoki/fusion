The `--rebuild-map` refusal tells the operator to run a live push to obtain a dry run
---
`4bf509e` refuses `push --plan --rebuild-map` and, in the same breath, prints the
remedy `push --rebuild-map --circle <dir> && plan --circle <dir>`. That first command
is not a rebuild. It is a full live reconcile: with `DRYRUN=0` it passes `config_valid`,
requires `$PLANE_API_KEY`, calls `fetch_states`, and runs `reconcile_circle`, which
POSTs and PATCHes issues on the Plane board. An operator who asked for a *preview* is
told to mutate the board first.

`docs/plane-setup.md` prints the same remedy inside the section headed
**"0. Dry run first — zero risk, nothing goes over the wire."**, before step 1 creates
the disposable Circle. Following the document in order runs a live push against a real
Circle under a heading promising the opposite.
---
**Evidence**

- `bin/fusion-plane:1550-1551` — the two `err` lines of the refusal:
  ```
  err "push:   rebuild, then plan against the rebuilt map:"
  err "push:     $SELF push --rebuild-map --circle <dir> && $SELF plan --circle <dir>"
  ```
- `bin/fusion-plane:1583-1599` — with `DRYRUN=0` the run reaches `config_valid`,
  `plane_key_present`, `rebuild_map`, `fetch_states`; `:1602-1610` then reaches
  `reconcile_all` / `reconcile_circle`.
- `docs/plane-setup.md:170` is the section heading; `:194-206` is the new paragraph and
  its code block.

**There is no rebuild-only spelling.** `cmd_map` (`bin/fusion-plane:2083-2095`,
implementation at the `cmd_map()` definition) offers `--forget`, `--prune` and
`--migrate` and nothing else. `--rebuild-map` exists only as a flag on `push`, and
`push` always continues into the reconcile after the rebuild. So after `4bf509e` there
is no way at all to obtain a post-rebuild op list without first mutating the board.

**Secondary defect in the same snippet.** The remedy chains with `&&`, but a push whose
key is absent or whose Plane is unreachable returns `EXIT_DEFERRED` (10) — the normal
offline case the C4 doctrine is built around (`bin/fusion-plane:1588-1598`). The `&&`
then swallows the `plan` step silently, which is the shape the file's own `map_forget`
doctrine forbids elsewhere.

**Fix direction — two options, one of them integral.**

1. Give the rebuild its own non-reconciling command (`map --rebuild`, alongside
   `--migrate`, which is already the "mutate the map and stop" shape), and point both
   the refusal and the doc at it. That makes "rebuild, then plan" true, and removes the
   only reason the refused pair looked useful.
2. If that is out of scope, the guidance must state plainly that the first command is a
   live push, and the doc paragraph must move out of the zero-risk section to after
   step 1.

The refusal itself is correct and the reasoning behind it (a plan computed from the
pre-rebuild map would describe a board that no longer exists) holds. This is about what
it hands the operator instead.

**Scope:** `bin/fusion-plane` (the Plane bridge) and `docs/plane-setup.md`. No agent or
skill invokes `--rebuild-map`, so nothing in the plugin's own wiring is broken by it.

Found in code review of `18b6094..a7c2b03`, commit `4bf509e`.
