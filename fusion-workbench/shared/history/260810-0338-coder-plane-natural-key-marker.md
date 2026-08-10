# T4 — the state marker taken out of the Plane mirror's natural key

**Agent:** coder
**Date:** 2026-08-10 03:38
**Status:** Complete
**Task:** T4 (queue entry 4, `I:260807-1939-plane-key`)
**Source record:** `fusion-workbench/shared/issues/260807-1939_o_plane-natural-key-carries-the-state-marker-and-breaks-on-every-transition.md`

## What changed

`bin/fusion-plane`

- **`natural_key <scope> <subdir> <file>`** — the one place a record's natural key is now
  built, sitting on **`stable_basename`**, which drops the `_<m>_` marker segment from a
  `YYMMDD-HHMM_<m>_<slug>.md` filename. Both live next to `marker_from_filename`: what that
  function extracts is exactly what these two discard, and the adjacency is the argument.
- The **six construction sites** (`reconcile_circle` ×2, `reconcile_shared` ×2,
  `emit_manual_only._manual_walk_circle` ×2) now call it. None composes a key itself.
- **`map_migrate_keys`** — re-keys a map written under the old form, once per run, from
  `map_ensure`, so it happens before any lookup on every path that touches the map. A map that
  is already stable normalises to itself and the file is not rewritten at all.
- **`JQ_STABLE_KEY`** — the same normalisation as a jq definition, shared by the migration and
  by `JQ_REBUILD_MAP`.

`hooks/lib/__tests__/fusion-plane.test.ts`

- New section 2b, six tests: the key is unchanged across a transition; the record's own
  reproduction, inverted; a legacy entry migrates and still resolves with its `origin` intact;
  a legacy map holding one record twice collapses to the newest and reports it; an
  already-stable map is left byte-identical; `--rebuild-map` normalises a legacy embedded key.
- New lint guard, in the style of the existing no-UUID-literal guard: exactly one line in
  `bin/fusion-plane` may compose `::` together with a `basename`, `stable_basename` must be
  what it calls, and the guard is shown firing on an injected seventh site.
- The `run` helper moved from `execFileSync` to `spawnSync`. `execFileSync` surfaces stderr
  only on a throw, so a *successful* run's diagnostics were unobservable and no test could
  distinguish a reported condition from a silent one. The collision report is exactly such a
  condition.
- `issueKey` / `decisionKey` / `sharedIssueKey` / `sharedDecisionKey` take the record's real
  on-disk filename, marker and all, and strip it the way the helper does. The tests keep
  naming files that exist while asserting on the key those files resolve to, which is the
  distinction the defect erased.

## Why the marker had to leave the key

The key is identity; the marker is state. A transition is precisely the event the mirror
exists to carry into Plane, so a key carrying the marker changed on exactly the event that had
to find the existing entry. `map_get_id` is an exact string comparison, a miss routes to
`op="create"`, and the result was a second Plane issue while the first stayed at its old state
permanently — the idempotency guarantee the whole helper is built on, inverted.

fusion had already made this call correctly once, for Circle directories: the marker sits on
`_t_circle.md` and never on the directory name, which is why a Circle's key is just its
directory name and needed no change here. The same rule had not reached issues and decisions.

## The migration, and why it is a migration rather than a tolerant lookup

A permanent read-time fallback (try the stable key, then scan for a marker-bearing sibling)
would have kept the old form alive indefinitely in a helper whose point is that the old form
is wrong. `map_migrate_keys` re-keys instead, once, and the getters stay exact comparisons.

**The collision rule is the interesting half.** The old scheme could record one record twice —
once per state it was pushed in — which *is* the duplicate this defect produces. Two legacy
keys can therefore normalise onto one. The entry with the newer `last_pushed` wins, because
that is the issue the board has been tracking, and the drop is reported on stderr naming the
count: a dropped UUID means a stray Plane issue exists that a human has to close, and that
must not be silent.

`--rebuild-map` needed the same normalisation for a reason nothing else in the file reaches:
what sits in an already-created Plane issue's description is whatever key was current when
fusion POSTed it. Read back verbatim, a rebuild restores exactly the mapping the next
transition invalidates, which is why the record correctly noted that `--rebuild-map` was no
recovery path. It is one now.

## Verification

- `hooks/lib/__tests__/fusion-plane.test.ts` — **69 passed**, including the six new
  behavioural tests and the three-test lint guard.
- The record's literal reproduction, run outside vitest against a scratch copy of the plane
  fixture workbench: push at `_o_` plans `op=create`; the entry is recorded under the key the
  helper itself planned; the file is renamed to `_c_`; the second push plans **`op=update`
  against `plane-0001` under the same key** — not a second create.
- The legacy two-marker map, run the same way: `map` reports `2 entries → 1`, names the
  collision, and keeps the more recently pushed UUID.
- `npm test` from `hooks/` — **906 passed, 1 failed**. The failure is
  `rules-emission-golden.test.ts`, on a byte-count change in
  `rules/fusion-workbench-conventions.md`, a file this task never touched. It passed in the
  full run I made twenty minutes earlier and failed in the next one, with the concurrent
  Turn-mate's edit to that file landing in between. Not caused by this change and not mine
  to regenerate.

## Left for the orchestrator

`fusion-workbench/tasklist.md` entry 4 and the `_o_` marker on the source record are not
touched here: the task's file list was narrow, the queue file has concurrent writers this
Turn, and the orchestrator owns the commit this closure would cite.

`fusion-workbench/.plane-map.json` was **not** migrated, because there is nothing in it — it
is still three bytes, `{}`, exactly as the record said. The 29 legacy keys in
`.plane-outbox.jsonl` are left alone: the outbox is a human record of what was pending, not a
correctness queue, and `outbox_drain_circle` matches on the Circle-name prefix, which the
change does not touch.
