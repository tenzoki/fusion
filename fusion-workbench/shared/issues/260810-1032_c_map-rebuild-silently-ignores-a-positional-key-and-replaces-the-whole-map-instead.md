# `map --rebuild <key>` silently ignores the key and replaces the whole map instead

---

**Severity:** Low
**Domain:** code
**Filed by:** coderev, review of `7f617b1..7ddacbc` (Turn 4)
**Affects:** `bin/fusion-plane:1893` (the positional capture), `bin/fusion-plane:1925-1937`
(the branch order)
**Cross-references:** commit `98c8b3f`; `bin/fusion-plane:1883-1884` (`--forget`, the one
flag that does take a key)

---

## The defect

`cmd_map` captures a bare positional argument as `key` (`:1893`) and dispatches on the
mutators first (`:1925-1932`), so `key` is read only in the two inspection branches at
`:1933-1936`. A key typed beside `--rebuild` is therefore accepted, discarded, and never
mentioned.

The `map` command family is the one place in this helper where a natural key *is* an
argument — `map --forget <key>` takes one, and bare `map <key>` prints one. `map
--rebuild <key>` reads, to anyone who has used those two, like a scoped rebuild. It is
the opposite: a whole-map replacement.

## Evidence

Map holding two entries. Fixture describing only the first. The second entry's key passed
positionally, which a reader would take to mean "rebuild this one".

```
$ fusion-plane map --rebuild --fixture one.json 'b::issues/2'
fusion-plane: rebuild-map: the map entry b::issues/2 -> B2 (origin=fusion) carries no
  fusion-key in Plane and is gone from the rebuilt map.
fusion-plane: rebuild-map: wrote 1 entries
STATUS: rebuilt (1 entries, from fixture one.json)
EXIT=0

$ cat .plane-map.json
{ "a::issues/1": { …, "plane_id": "NEW-1" } }
```

The named key is the one entry the command destroyed. No usage error, no note that the
argument was ignored, exit 0.

## Scope

`--prune` and `--migrate` share the shape, so this is not new behaviour in `cmd_map`; it
is newly *reachable under a spelling that invites the mistake*, because `--rebuild` is
the third mutator to be added and the first one whose name does not read as
whole-map-only. The fix below covers all three at once.

The report line does name the lost entry, so nothing is silent about the outcome — only
about the argument.

## Suggested fix direction

Reject the combination rather than ignore it, in the shape `cmd_map` already uses for
`--fixture` without `--rebuild` (`:1907-1910`) and for a second positional (`:1893`):

```bash
if [ -n "$key" ] && [ "$mutators" -gt 0 ]; then
  err "map: '$key' — --prune, --migrate and --rebuild act on the whole map and take no key"
  return "$EXIT_USAGE"
fi
```

Placed with the other argument checks, before `resolve_workbench`, so the refusal costs
nothing and reaches all three mutators. `--forget` is unaffected: its key arrives through
the flag, not as a bare positional.

---
Resolved: df75004 — a positional key beside --rebuild, --prune or --migrate is refused before any work, rather than accepted and ignored.
