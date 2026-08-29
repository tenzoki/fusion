# `fusion-plane` dry runs rewrite `.plane-map.json`, and on a legacy map they destroy a mapping

---

**Severity:** High
**Domain:** code
**Filed by:** coderev, review of `8960e1a..HEAD` (session `260810-0241-orchestrator-session.md`, Turn 1)
**Affects:** `bin/fusion-plane:649` (`map_ensure`), `:1179` (`cmd_push`), `:1394` (`cmd_map`), `:617-648` (`map_migrate_keys`)
**Cross-references:** commit `f320db2`; `docs/plane-setup.md`

---

## The defect

`cmd_push` calls `map_ensure` at `bin/fusion-plane:1179`, which is **before** the dry-run gate at
`:1190`:

```bash
  build_base
  map_ensure                                    # :1179

  ...
  # Live commands need config + key; dry-run needs neither network nor key.
  if [ "$DRYRUN" -eq 0 ]; then                  # :1190
```

`map_ensure` is `{ [ -f "$MAP" ] || printf '{}\n' > "$MAP"; map_migrate_keys; }` (`:649`), and
`map_migrate_keys` ends in `mv "$tmp" "$MAP"` (`:641`). So the migration introduced by `f320db2` runs
on every invocation, including the ones documented in `usage()` as *"dry-run: emit the JSON op list,
no curl"*. `cmd_map` (`:1394`) is affected the same way, and `map` / `map <key>` are read-only
inspection commands by contract.

The migration is not a no-op rewrite. `JQ_MIGRATE_MAP` (`:606-614`) is a re-key with a documented
collision rule: two entries that the old marker-bearing scheme recorded for one record collapse into
one, and the loser is discarded. On a map carrying legacy duplicates — precisely the map this commit
exists to repair — a dry run therefore discards a Plane issue UUID permanently.

## Verification

The ordering above is read directly from the source. The behavioural consequence was reproduced by a
sub-analysis against a scratch fixture: `push --circle <c> --plan` reported
`map: migrated to marker-free natural keys (2 entries → 1)` and the losing `plane_id` was gone from
the file afterwards. `fusion-workbench/.plane-map.json` in this repository is `{}` (3 bytes), so
nothing was at risk locally.

## Why it matters

"Plan" and "dry run" are the two words a user reaches for when they want to know what a tool would do
without letting it do anything. The commit that introduced the migration argued its collision handling
is safe because it is *reported* rather than silent — that argument holds for a live push a user chose
to run, and does not transfer to a command whose documented contract is that it changes nothing.

`map` is worse than `push --plan`, because there is not even a mutation in the neighbourhood for a
reader to attribute the change to.

## Fix direction

Move `map_migrate_keys` behind the live gate, or give it a read-only mode: compute the migrated view
in memory for the run's own key lookups and write the file only on a path that is already mutating.
Whichever is chosen, the migration should also be reachable explicitly — a `map --migrate` — so a user
repairing a legacy board performs the collapse deliberately rather than as a side effect of asking a
question.

---
Resolved: the read path and the write path are now different functions, so a dry run has nothing to write with.

`map_ensure` conflated two jobs — make the file readable, and normalise it — and sat on the read path, which is why `push --plan`, `plan` and the read-only `map` all reached `mv "$tmp" "$MAP"`. Guarding the two known call sites would have left the third to be written next month.

Instead the split is structural: `map_view` computes the fold in memory and provably cannot write; `map_write` applies a program to that fold and is reachable only from commands that were asked to write; `map_put` is the single physical writer. A read path added later gets `map_view` and has no route to the filesystem. `map --migrate` is new — the fold as a command whose entire job is the fold, for the case where somebody does want it.

Verified by reproducing the loss against a scratch fixture with the committed `HEAD` binary as the "before" column, then showing it gone. Eight probes flip cleanly. Full suite green: 993 passed, 0 failed, the plane suite 69 → 85 tests. Two existing tests changed because they asserted the destructive behaviour itself.

Session: `260810-0241-orchestrator-session.md` (Turn 2, task R1). Executor log: `260810-0715-coder-plane-map-read-write-split.md`.
