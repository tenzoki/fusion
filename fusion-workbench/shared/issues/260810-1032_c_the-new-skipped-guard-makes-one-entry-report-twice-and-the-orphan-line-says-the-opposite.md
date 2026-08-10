# The new `skipped` guard makes one entry report twice, and the orphan line says the opposite of the SKIPPED line

---

**Severity:** Low
**Domain:** code
**Filed by:** coderev, review of `7f617b1..7ddacbc` (Turn 4)
**Affects:** `bin/fusion-plane:1433-1437` (the `$usable` / `$skipped` split),
`bin/fusion-plane:1451-1453` (`orphans`), `bin/fusion-plane:1463-1467`
(`JQ_REBUILD_REPORT`'s orphan line)
**Cross-references:** commit `98c8b3f`; closed issue
`260810-0939_c_the-winner-subtraction-silences-a-real-collision-when-neither-entry-carries-an-id.md`
(the finding this closed)

---

## The defect

`98c8b3f` drops id-less entries at extraction and reports them as `SKIPPED`, which closes
`260810-0939` correctly. But `orphans` is computed from the entries that *survived* the
drop:

```jq
| $usable                          # :1437 — id-less entries are gone from here on
| group_by(.key)
| map( … )
| { map: …, collisions: …, skipped: $skipped,
    orphans: ( ( ($current|keys) - map(.key) ) | … ) }   # :1451
```

`map(.key)` at `:1452` enumerates only the usable keys. So a key that was dropped for
having no `id`, and that the *current* map already holds, falls into `orphans` as well —
and the orphan line asserts a reason that is false for it (`:1464`):

> the map entry `<key>` -> `<uuid>` (origin=fusion) **carries no fusion-key in Plane** and
> is gone from the rebuilt map.

It carries a fusion-key. That is how the rebuild found it at all; it was dropped for a
different reason, which the line above already stated.

## Evidence

Current map holding one entry, and a fixture whose single issue carries that exact key
and no `id`:

```
$ fusion-plane map --rebuild --fixture issues-noid.json
fusion-plane: rebuild-map: 1 issue(s) carrying the key <K> came back with no id —
  SKIPPED: an issue the response does not identify cannot be mapped. Nothing was lost
  from Plane, and nothing in the rebuilt map points at those issue(s).
fusion-plane: rebuild-map: the map entry <K> -> OLD-UUID (origin=fusion) carries no
  fusion-key in Plane and is gone from the rebuilt map.
fusion-plane: rebuild-map: wrote 0 entries
STATUS: rebuilt (0 entries, from fixture …)
EXIT=0
```

One input entry, two report lines, and the second contradicts the first. For a
`seed`-origin entry the contradiction is more expensive than cosmetic: the orphan line
would additionally print the `seed --record-origin` re-bind command, telling the operator
their story's binding was lost to a missing `fusion-key:` line that is in fact present.

## The behaviour change underneath it

Before `98c8b3f` the same input produced a map entry with `plane_id: null` — useless, but
not an orphan, because the key was in `map(.key)`. The guard is right to drop it. What
moved with it is which report line the entry lands on.

A second consequence of the same shape, worth recording beside it: when **every**
returned issue lacks an `id`, `$usable` is empty and the rebuilt map is `{}` — written,
exit 0. The empty-response guard at `:1516` does not fire, because `$tmp` holds a
perfectly valid JSON object. The pre-existing class ("a response with no key-carrying
issues also empties the map") is unchanged in kind; `98c8b3f` adds one more input to it.
Every lost entry is named in `orphans`, so nothing is silent.

## Why this is Low

Reachable only through the `--fixture` seam. `bin/fusion-plane:1414-1415` states that
Plane's `GET issues/` always returns `id`; `inference:` I did not verify that against a
Plane instance, and the record is filed on the author's claim.

## Suggested fix direction

Subtract the skipped keys from the orphan set, so an entry is diagnosed once:

```jq
orphans: ( ( ($current|keys) - map(.key) - ($skipped | map(.key)) ) | … )
```

The `SKIPPED` line already says what happened to those keys and that nothing in the
rebuilt map points at them, which is the whole of what the orphan line would have added.

---
Resolved: df75004 — orphans subtracts the skipped keys, so an id-less entry is reported once. A second test pins that a genuinely unseeable entry is still reported, which is the failure mode to avoid here: the guard being fixed was itself added to stop a false report.
