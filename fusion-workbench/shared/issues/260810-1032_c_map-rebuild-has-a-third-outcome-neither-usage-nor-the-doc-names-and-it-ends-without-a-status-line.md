# `map --rebuild` has a third outcome neither `usage()` nor the doc names, and it ends without a STATUS line

---

**Severity:** Medium
**Domain:** code
**Filed by:** coderev, review of `7f617b1..7ddacbc` (Turn 4)
**Affects:** `bin/fusion-plane:1860-1877` (`map_rebuild`), `bin/fusion-plane:2206-2214`
(`usage()`), `docs/plane-setup.md:315-322`
**Cross-references:** commit `98c8b3f`; `bin/fusion-plane:173-176` (the exit-code table
this departs from); `bin/fusion-plane:1786-1791` (`map_prune`'s C4 doctrine)

---

## The defect

`map --rebuild` is a new public command. Both surfaces that describe its failure
behaviour name exactly two outcomes, success and exit 10:

`usage()` (`:2210-2213`):

> Reads Plane (GET issues/), writes only the map: it needs the key, and an unreachable
> Plane or an absent key changes NOTHING and exits 10.

`docs/plane-setup.md:321`:

> If the key is absent or Plane is unreachable it changes nothing and exits 10.

There is a third outcome. Four paths inside `rebuild_map` return `EXIT_CONFIG` (1), and
`map_rebuild` passes it straight out (`:1875`, `rebuild_map || return "$?"`):

| `bin/fusion-plane` | Condition | Returns |
|---|---|---|
| `:1492` | `--fixture` path does not exist | 1 |
| `:1511` | the issues response does not parse | 1 |
| `:1519` | the issues response was **empty** (2xx, empty body) | 1 |
| `:1541` | `map_put` could not write the file | 1 |

Measured, against a local mock answering `GET issues/` with HTTP 200 and an empty body,
`PLANE_API_KEY` present:

```
$ fusion-plane map --rebuild
fusion-plane: rebuilding .plane-map.json from Plane (embedded fusion-key)…
fusion-plane: rebuild-map: the issues response was empty — map not changed
EXIT=1
```

Two things are wrong with that outcome, and they are separable.

**1. The exit code contradicts the file's own classification.** `:174` defines
`EXIT_CONFIG=1` as "missing/invalid config, bad usage of a live command". A 2xx with an
empty body, an unparseable payload, and a full disk are none of those. The doctrine
`map_prune` states one function above (`:1786-1791`) is the opposite one: "every 'we
could not tell' answer leaves the entry alone and returns EXIT_DEFERRED". `map --rebuild`
leaves the map alone, exactly as C4 requires, and then reports it with the code reserved
for the operator having got the invocation wrong. An orchestrator or script branching on
the exit code reads "your config is broken" for a Plane-side condition.

**2. It ends without a `STATUS:` line.** Every other terminal path in the `map` family
prints one — `:1760`, `:1764`, `:1775`, `:1779`, `:1783`, `:1799`, `:1833`, `:1837` —
including `map_rebuild`'s own absent-key branch at `:1872` (`STATUS: deferred (0 rebuilt)
— key absent`). The four `EXIT_CONFIG` paths above return through `:1875` before `:1876`
is reached, so the run ends on an `err` line and nothing else. A consumer reading stdout
for a status sees an empty stream.

The same gap exists on the live-unreachable path: `rebuild_map:1499` returns
`EXIT_DEFERRED` and `map_rebuild` returns it at `:1875` without ever reaching the
`STATUS` printf. So even the outcome the doc *does* name arrives without the status line
its sibling commands always emit.

## Why this matters now rather than before

`rebuild_map`'s exit codes were previously internal — `push --rebuild-map` was the only
caller and it discarded them (`:1642`, filed separately). `98c8b3f` promotes them to a
public command's contract and documents that contract in two places, and both
descriptions are incomplete on the first spelling an operator hits when something is
actually wrong.

## Suggested fix direction

Two changes, both small, and they can land together:

1. Classify the Plane-side reads the way `map_prune` classifies them: an empty or
   unparseable response is a "could not tell" and belongs at `EXIT_DEFERRED` with the map
   untouched, which is already what happens. Keep `EXIT_CONFIG` for the fixture-not-found
   case (`:1492`) and the unwritable-map case (`:1541`), which really are local
   conditions — and say so in `usage()` and the doc.
2. Give `map_rebuild` a terminal `STATUS:` line on every exit, in the shape `map_prune`
   uses. Route the failures through a single tail rather than `|| return "$?"`, so a
   fifth failure path added later cannot skip it by construction.

---
Resolved: df75004 — map --rebuild now classifies an unreadable Plane answer as deferred (exit 10) and a local fault as failed (exit 1), and every branch falls through to one tail printing the STATUS line. No return sits between the branches and that tail, so a fifth failure path cannot skip it.
