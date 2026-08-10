# Rebuild collision report names distinct issues, not repeated ones

**Status:** Complete
**Agent:** coder
**Source record:** `shared/issues/260810-0748_o_the-rebuild-collision-report-tells-a-human-to-close-the-plane-issue-it-kept.md`

---

## What was wrong

`JQ_REBUILD_MAP` grouped the rebuild candidates by key, ranked the whole group, and reported
`.[:-1]` as dropped. The ranking runs over *entries*, and nothing required those entries to be
distinct issues. One Plane issue appearing twice in a single `GET issues/` response — pagination
overlap, a retried page, a fixture assembled from two captures — therefore landed in both the kept
and the dropped position, and the operator was told to close by hand the live issue the rebuild had
just bound.

Reproduced before the change against a two-element fixture whose elements are byte-identical:

```
rebuild-map: two or more Plane issues carry the key
260719-1536-demo-circle::issues/260719-1600_open-issue.md — kept plane-uuid-SAME,
DROPPED plane-uuid-SAME. Each dropped UUID is a duplicate issue still on the board;
close it by hand.
```

## The fix

`bin/fusion-plane`, `JQ_REBUILD_MAP` only. The winner's id is subtracted from the losers, the
remainder is deduplicated, and a group reaches `.collisions` only if something is left:

```jq
| ( $ranked | last ) as $win
| { key: $k, win: $win,
    lost: ( ( [ $ranked[:-1][].id ] - [ $win.id ] ) | unique ) } )
```

Two consequences beyond the reported case. A repeated issue produces no collision entry at all, so
it is not reported as one resolved collision either — that would have been the same wrong statement,
quieter. And a loser returned twice is named once, because two lines would tell the operator to
close two Plane issues where one exists.

### Why subtracted after the ranking, not deduplicated before it

The record offered both. `group_by(.key) | map(unique_by(.id))` was rejected: `unique_by` keeps
whichever copy sorts first, which for equal ids is an input-order artifact, so an issue whose stale
copy arrived first would be ranked by that copy's `updated_at` and could lose its key to a distinct
issue that merely looks newer. That is the API-result-order dependence tiebreak 3 exists to remove.
Ranking every entry and subtracting afterwards leaves the ordering untouched and represents a
repeated issue by its freshest copy.

The ordering itself was not touched: `sort_by([is-the-current-map's-id, updated_at, id])` stands as
it was, per the record's "what is not wrong" section.

## Tests

`hooks/lib/__tests__/fusion-plane.test.ts`, in the existing
`push --rebuild-map: a collision is decided, not raced` block. A `collisionLine()` helper parses the
operator-facing stderr line into its kept and dropped UUIDs, so the properties are pinned at the
surface a human acts on rather than at the jq structure.

- The existing genuine-collision test now also asserts the `close it by hand` instruction is intact
  and that the kept and dropped UUIDs are exactly `plane-uuid-SECOND` and `[plane-uuid-FIRST]`, so
  the fix cannot be over-applied into silencing a real collision.
- New: two byte-identical entries produce no collision line, no `DROPPED`, and no close-it-by-hand
  instruction, while the key still binds to that UUID.
- New: a duplicated winner beside a genuine loser still reports the collision and names the loser
  alone.

Both new tests fail against the pre-fix jq (the duplicate case emits the false line; the mixed case
drops `["plane-uuid-LOSER", "plane-uuid-WIN"]`).

## Verification

`cd hooks && npm test` — exit 0. 38 files, 1007 tests, all green (baseline 1005 at `38fe341`, plus
the two new tests).

## Not touched

`cmd_push`'s dry-run gate and the header/usage text (`4bf509e`), and `stable_basename` /
`JQ_STABLE_KEY` (owned by record `260810-0458`). `JQ_MIGRATE_MAP`'s fold path was checked for the
same defect and does not carry it: `JQ_FOLD_LOSERS` selects on `plane_id != plane_id`, so two old
keys resolving to one UUID are already filtered out rather than reported as a loser.
