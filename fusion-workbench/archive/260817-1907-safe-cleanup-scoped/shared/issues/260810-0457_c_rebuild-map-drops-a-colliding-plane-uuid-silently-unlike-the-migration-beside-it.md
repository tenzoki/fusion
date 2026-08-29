# `push --rebuild-map` drops a colliding Plane UUID silently, unlike the migration standing beside it

---

**Severity:** High
**Domain:** code
**Filed by:** coderev, review of `8960e1a..HEAD` (session `260810-0241-orchestrator-session.md`, Turn 1)
**Affects:** `bin/fusion-plane:1106-1114` (`JQ_REBUILD_MAP`), `:1140` (`rebuild_map`); contrast `:606-614` (`JQ_MIGRATE_MAP`) and `:644-646`
**Cross-references:** commit `f320db2`; `bin/fusion-plane:99-104` (the header claim)

---

## The defect

The two places that fold many old keys onto one stable key handle a collision differently, and only
one of them was given the rule.

`JQ_MIGRATE_MAP` guards the assignment and keeps the most recently pushed entry, and `map_migrate_keys`
reports the loss (`bin/fusion-plane:610-613`, `:644-646`):

```jq
| if (has($k) and ((.[$k].last_pushed // "") >= ($e.value.last_pushed // "")))
  then . else .[$k] = $e.value end)
```

`JQ_REBUILD_MAP` has no `has()` and no report (`:1112-1113`):

```jq
| if $key == "" then . else .[$key|ltrimstr(" ")|rtrimstr(" ")|stable_key] =
    {plane_id:$i.id, kind:"unknown", last_state:"", last_pushed:""} end)
```

Two Plane issues carrying the same `fusion-key:` — which is exactly the duplicate pair the
marker-in-the-key defect produced — now collapse to one entry. The survivor is whichever the API
returned last, and `rebuild_map:1140` then does a wholesale `mv "$tmp" "$MAP"`. The discarded UUID is
unrecoverable from the map and nothing is printed.

A recency tiebreak could not rescue it either: every rebuilt entry is written with `last_pushed:""`,
so there is no recency data in a rebuilt map at all.

## Verification

Read from source as quoted above. A sub-analysis reproduced it against a fixture holding the two
issues the defect produces: `rebuild-map: wrote 1 entries`, `plane-uuid-FIRST` absent and unreported,
and reversing the fixture order reversed which UUID survived — confirming the winner is decided by
API result order rather than by anything about the records.

## Why it matters

`bin/fusion-plane:99-104` states that `rebuild_map` "normalises the same way", and the commit message
for `f320db2` defends the collision rule on the ground that "a dropped UUID is a stray Plane issue
somebody closes by hand". Both claims are true of the migration and false of the rebuild. The header
is therefore wrong at the one place a maintainer would read to find out whether it is.

The path this lands on is the recovery path. A board somebody is rebuilding from is, by construction,
a board carrying the duplicates.

**Adjacent, pre-existing, now easier to reach.** `rebuild_map` replaces the map wholesale, and a
seed-origin issue's body never carries a `fusion-key:` line (`build_write_body:985-988` writes
`{state:...}` only for `state-only` scope). So a seed-bound entry is absent from the rebuild output and
its `origin:"seed"` disappears with it — after which fusion may overwrite a human's story title. That
hazard predates this range; presenting `--rebuild-map` as a working recovery path makes it likelier to
be exercised.

## Fix direction

Give `JQ_REBUILD_MAP` the same `has()` guard and the same caller-side report, and merge rather than
replace at `:1140` so entries the rebuild cannot see (seed-origin ones) survive it. If a merge is
judged wrong, the header at `:99-104` and `docs/plane-setup.md` should say plainly what a rebuild
discards.

---
Resolved: the collision has one total ordering instead of a race, and every dropped UUID is named.

`JQ_REBUILD_MAP` assigned without the `has()` guard its sibling `JQ_MIGRATE_MAP` carries, so the winner was decided by API result order, and every rebuilt entry got `last_pushed:""`, leaving no recency tiebreak even in principle. The order is now explicit: the UUID the current map already tracks, then `updated_at`, then the UUID string. Deterministic, and it prefers the binding the workbench already believes.

Every dropped UUID is **named** rather than counted. That string is the only handle a human has on the stray Plane issue the drop orphans, and a count gives them nothing to search for. Each orphan is printed with the `seed --record-origin` line that restores it.

**One half was deliberately not taken, and this record is where that is written down.** `--rebuild-map` still replaces the map rather than merging, so a seed-origin binding is still dropped. This record scopes that as pre-existing and offers "say plainly what a rebuild discards" as the alternative; the executor took that branch, on the ground that quietly broadening a recovery path's contract inside a task about not destroying UUIDs is the wrong place for it. Whether rebuild should merge is queued as its own decision: `260810-0718_*_should-rebuild-map-merge-with-the-existing-map-or-replace-it.md`.

The header comment at `bin/fusion-plane:99-104` claimed rebuild "normalises the same way", which was false at exactly the place a maintainer would check before trusting it. It now describes what the code does.

Session: `260810-0241-orchestrator-session.md` (Turn 2, task R1). Executor log: `260810-0715-coder-plane-map-read-write-split.md`.
