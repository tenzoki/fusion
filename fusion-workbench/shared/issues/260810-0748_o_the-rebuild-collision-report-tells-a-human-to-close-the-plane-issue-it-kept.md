# The rebuild collision report tells a human to close the Plane issue it kept

---

**Severity:** Low
**Domain:** code
**Filed by:** coderev, review of `ff70d3a..HEAD` (session `260810-0241`, Turn 2)
**Affects:** `bin/fusion-plane:1253-1260` (`JQ_REBUILD_MAP`'s `.collisions`), `:1268-1270`
**Cross-references:** commit `c923935`; `shared/issues/260810-0457_c_rebuild-map-drops-a-colliding-plane-uuid-silently-unlike-the-migration-beside-it.md`

---

## The defect

The collision grouping ranks candidates and reports `.[:-1]` as dropped. It does not require the
ranked entries to be distinct issues. When one Plane issue appears twice in the `GET issues/`
response — pagination overlap, a retried page, a fixture assembled from two captures — the same
UUID lands in both `win` and `lost`, and the report reads:

```
rebuild-map: two or more Plane issues carry the key c::issues/260719-1600_x.md —
kept UUID-SAME, DROPPED UUID-SAME. Each dropped UUID is a duplicate issue still on
the board; close it by hand.
```

Reproduced against a two-element fixture whose elements are byte-identical.

The instruction is actionable and wrong: an operator who follows it closes the live issue the
rebuild just bound. `c923935` chose to name each dropped UUID rather than count them precisely
because "a count gives a human nothing to search for" — here the name given is a handle on the
wrong object.

## What is not wrong

The ordering itself is total and was verified separately: `sort_by([is-the-current-map's-id,
updated_at, id])` breaks every tie between **distinct** issues on the UUID string, and reversing
the order of the API response yields the same winner. This finding is about the report, not the
choice.

## Suggested fix direction

Deduplicate by `.id` inside each group before ranking (`group_by(.key) | map(unique_by(.id))`),
or subtract the winner's id from `dropped` when composing `.collisions`. Either makes an
identical-issue duplicate a no-op instead of a false instruction.
