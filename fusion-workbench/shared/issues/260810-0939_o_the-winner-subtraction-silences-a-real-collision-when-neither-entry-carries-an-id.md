The winner subtraction silences a real collision when neither entry carries an id
---
`a7c2b03` subtracts `$win.id` from the losers so a Plane issue returned twice is not
reported as a collision with itself. Distinct Plane issues carry distinct UUIDs, so the
subtraction is sound in every case where `.id` is a real UUID — checked, and a genuine
two-issue collision still reports in full.

There is one input where two *distinct* entries share an `.id`: neither carries one.
`JQ_REBUILD_MAP` reads `id: .id` with no guard, so a missing field yields `null`, and
`[null] - [null]` is empty. Two different Plane issues, both without an `id` field,
collide on one key and the report goes silent — where the pre-fix filter at least
printed `DROPPED null`.
---
**Evidence**

`bin/fusion-plane:1398` binds the id unguarded (`id: .id`), while the sibling field is
guarded one line up (`select($key != "")`, `:1396`). The subtraction is `:1406`, the
report gate `:1409`.

Ran the shipped filter and its predecessor over a fixture holding two distinct
issues, neither with an `id`:

```
--- bcb0ae8 (pre-fix)
{"map":{"C::issues/260719-1600_x.md":{"plane_id":null,...}},
 "collisions":[{"key":"...","kept":null,"dropped":[null]}],"orphans":[]}
--- a7c2b03 (shipped)
{"map":{"C::issues/260719-1600_x.md":{"plane_id":null,...}},
 "collisions":[],"orphans":[]}
```

**Why this is Low, stated honestly.** Plane's `GET issues/` always returns `id`, so the
live path cannot reach it; the reachable route is the `--fixture` test seam. And the map
entry it writes is already useless in both versions — `plane_id: null`, which
`map_get_id`'s `// empty` (`bin/fusion-plane`, the `map_get_id()` one-liner) turns into
"no mapping", so the next push creates rather than PATCHing a dead UUID. Nothing crashes
and no live UUID is lost. What the change costs is the last diagnostic that said
anything was wrong.

**Fix direction — one `select`, matching the shape already there.** Drop the entry at
extraction, the same way an entry with no embedded key is dropped:

```jq
| select(($key != "") and (.id | type == "string") and (.id != ""))
```

That keeps a `plane_id: null` out of the rebuilt map as well, which is the larger latent
problem behind the same missing guard, and it leaves the subtraction operating only on
real UUIDs — where it is provably correct.

**Scope:** `bin/fusion-plane`, `JQ_REBUILD_MAP` only.

Found in code review of `18b6094..a7c2b03`, commit `a7c2b03`.
