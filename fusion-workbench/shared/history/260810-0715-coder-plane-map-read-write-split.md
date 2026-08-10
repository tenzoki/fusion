# R1 — the map's fold moved off the read path, and the rebuild's collision stopped being a race

**Agent:** coder
**Date:** 2026-08-10 07:15
**Status:** Complete
**Task:** Turn 2, R1
**Source records:**
- `fusion-workbench/shared/issues/260810-0456_o_fusion-plane-dry-run-rewrites-the-map-and-can-destroy-a-mapping.md`
- `fusion-workbench/shared/issues/260810-0457_o_rebuild-map-drops-a-colliding-plane-uuid-silently-unlike-the-migration-beside-it.md`
- `fusion-workbench/shared/reviews/260810-0512-coderev-turn-1-range-8960e1a-to-head.md` Theme B (F2, F3)

**Origin:** Not Circle work; no Circle active. Review findings against `f320db2`,
whose executor log is `fusion-workbench/shared/history/260810-0338-coder-plane-natural-key-marker.md`.

## The one defect behind the two exits

`f320db2` added a key migration to repair a duplicate-key problem, and reached the file
from the wrong side. `map_ensure` was `{ create if absent; map_migrate_keys; }` and sat
on the **read** path — `cmd_push:1180` before the dry-run gate at `:1190`, and
`cmd_map:1394` before every inspection branch. `map_migrate_keys` ends in
`mv "$tmp" "$MAP"`. So `map`, `map <key>`, `push --plan` and `plan` each rewrote
`.plane-map.json`, and against a map carrying the legacy duplicates the migration exists
to repair, the collision rule discarded a Plane UUID — from a command the user ran to
look at something.

`--rebuild-map` was the second exit of the same thing: `JQ_REBUILD_MAP` assigned without
the `has()` guard `JQ_MIGRATE_MAP` carries and without a report, so of two Plane issues
carrying one key the winner was whichever the API returned last and the loser vanished.

Guarding the two call sites was available and was not the fix. The question the task put
is what makes the rewrite happen only where a write was asked for, and the answer had to
survive a third read path being added next month.

## What changed — `bin/fusion-plane`

**Reads and writes are now separate functions, and the read side has no write in it.**

- **`map_view`** computes the fold in memory and sets `$MAP_VIEW` to a path holding it.
  It never writes, replaces or creates `$MAP`. Every getter goes through it. It sets a
  global rather than printing the path, because a command substitution would run it in a
  subshell and lose the cache, the temp-file handle, and the once-per-run report with it.
- **`map_write <jq-program> [args…]`** applies a program to that folded form and replaces
  the file. Its callers are, by name, commands that were asked to write: `map_set`,
  `map_forget`, `map_prune`, `map_migrate`.
- **`map_put <file>`** is the single physical writer; `map_write` and `rebuild_map` both
  end there, so invalidating the view cannot be forgotten in one of them.
- **`map_ensure` is gone.** Nothing creates an empty map to make a read work; the getters
  already tolerated an absent file.
- **`map --migrate`** is new: the fold as a command whose whole job is the fold, so an
  operator repairing a legacy board performs the collapse deliberately. Idempotent — an
  already-folded map reports `already marker-free` and writes nothing.

A read path added tomorrow gets `map_view` and has no way to write. That is the property
bought, rather than two guarded call sites waiting for a third.

**The report names UUIDs instead of counting them.** The old message said "1 entry/entries
collided". A dropped UUID is not recoverable from files: it names a Plane issue that goes
on existing, unreferenced, for a human to find and close, and that string is the only
handle they have on it. `map_report_fold` now prints `<old key> → <plane_id>` per loss,
once per run, before anything is written.

**`JQ_REBUILD_MAP` got the fold's collision rule, expressed in the data a rebuild has.**
Candidates for one key are ordered by one total ordering rather than a ladder of
branches — `sort_by([has-the-current-map's-UUID, updated_at, id]) | last`:

1. the UUID the current map already records under that key (the issue fusion has been
   PATCHing — the fold's "most recently pushed wins" answered from better evidence),
2. `updated_at`, since a rebuilt entry has no `last_pushed` for the fold's own tiebreak,
3. the UUID string, so a tie never resolves by API result order.

It returns `{map, collisions, orphans}`; `JQ_REBUILD_REPORT` (kept beside it so a renamed
field is a missing line, not a wrong one) turns the last two into one human line each.

**`map_prune` snapshots its key list** before the loop instead of streaming it out of the
file it replaces on every 404. Pre-existing hazard, but the view made it reachable.

## What was deliberately not changed

**A rebuild still replaces the map; it does not merge.** Issue 260810-0457's "Adjacent,
pre-existing" note is right that a seed-origin binding is invisible to a rebuild — its
Plane issue is a human's own story and carries no `fusion-key:` line at all — and that
losing `origin:"seed"` lets a later push overwrite that human's title. The record scopes
that hazard out of the range and offers the alternative: say plainly what a rebuild
discards. I took that branch. Merging unverifiable entries back would stop the command
being the rebuild-from-Plane it is documented as, and quietly broadening a recovery
path's contract inside a task about not destroying UUIDs is the wrong place to decide it.

What the command does instead is stop being silent: every orphaned entry is named with
its UUID, its origin, and the `seed --record-origin` line that restores it. Whether the
merge should happen is left as a decision for the orchestrator to queue.

**`docs/plane-setup.md:251`** is issue 260810-0507's paragraph (the marker-bearing key
shape). My edits are in different paragraphs, so it is left queued on its own.

## Verification

**Reproduced first, against a scratch fixture workbench, then shown failing after.** The
script drives the real helper; the "before" column is the committed `HEAD:bin/fusion-plane`
extracted to a temp path, so both columns are the same reproduction against two binaries.

| Probe | Before | After |
|---|---|---|
| `map` on a legacy colliding map | file rewritten, `plane-uuid-FIRST` gone | file byte-identical, both UUIDs on disk |
| `push --plan` on the same | file rewritten, UUID destroyed | byte-identical |
| `plan` on the same | file rewritten | byte-identical |
| rebuild, equal `updated_at`, array order flipped | survivor flipped, nothing reported | same survivor both orders, loss named |
| rebuild, no `updated_at` at all, order flipped | survivor flipped, nothing reported | same survivor both orders, loss named |
| rebuild, SECOND newer, order flipped | survivor flipped | SECOND both orders (recency decided) |
| rebuild, SECOND newer but map tracks FIRST | survivor flipped | FIRST both orders (the board's answer won) |
| rebuild against a seed-origin entry | binding vanished, unreported | dropped and named, with the restore command |

Edge cases checked directly, not assumed: no map at all (`map` prints `{}`, `map --migrate`
reports nothing to do, **no file is created**); an unparseable map (exit 5, file untouched,
same diagnostics as before — byte-compared against the old binary, so not a regression I
introduced); no temp-file leak from `map_view` (`trap … EXIT`); and `seed --record-origin`
driven against a legacy map, which folds *because it writes*, reports the dropped UUID,
and preserves `origin:"seed"`.

- `hooks/lib/__tests__/fusion-plane.test.ts` — 69 → **85 tests, all passing**.
- `cd hooks && npm test` — **exit 0, 993 passed, 38 files, 0 failed.**
- The failure flagged as known in the task brief, `rules-emission-golden`, **passed** in
  every run I made. Nothing else moved.

### The two tests that had to change

Both asserted the behaviour that is now the defect, so neither could stay:

- *"a legacy marker-bearing map entry is migrated and still resolves"* asserted that a
  `push --plan` re-keyed the file on disk. It now asserts the dry run resolves through the
  fold and leaves the file alone, and that `map --migrate` performs the re-key with
  `origin:"seed"` intact.
- *"a legacy map that mirrored one record twice collapses…"* asserted the stderr word
  `collided`. It now asserts the dropped **UUID** appears, which is the point the count
  never carried.

Sixteen tests added across two sections: `reads never write .plane-map.json` (each of the
four read commands driven against the destructive input; no file created by a read; the
fold still resolving; `--migrate` performing and reporting it; a write folding in passing;
`--forget` taking the key a read prints) and `a collision is decided, not raced` (order
independence at each tier, the naming, both tiebreaks, the orphan report).

## Left for the orchestrator

Not touched, and none of them in the task's file list: `fusion-workbench/tasklist.md`
(concurrent writers this Turn), the `_o_` markers on the two source records, and the
commit. The queue entry and the marker renames want the commit hash this closure cites.

One decision worth queueing: whether `--rebuild-map` should merge rather than replace, so
a seed-origin binding survives it instead of being reported as lost. Deliberately not
decided here.
