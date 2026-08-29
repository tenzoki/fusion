The Plane natural key carries the state marker, so the mapping breaks on exactly the event the mirror exists to push

---

**Severity:** High
**Domain:** code
**Filed by:** consultant, found while checking the premise of a report from another project
**Affects:** `bin/fusion-plane` (push path, map maintenance, `--rebuild-map`), `fusion-workbench/.plane-map.json`
**Cross-references:** `260807-0158_*_record-filenames-collide-on-the-minute-and-nothing-prevents-it.md` — the filename question whose verification turned this up; it has since been closed as mis-scoped. The durable answer sits in `260807-0158_*_how-is-a-unique-record-filename-obtained.md`: cite a record by its full filename, never by the timestamp alone. The two defects sit on different surfaces and carry different severity.

---

## The defect

The Plane mirror's natural key is the full filename, and the state marker sits inside it.
The marker changes on every state transition. A state transition is precisely the event the
mirror exists to carry into Plane. So every transition presents a key the map has never
seen.

The consequence: instead of moving the existing Plane issue to Done, the push creates a
second one. The first stays at its old state permanently.

## Evidence

The key is built at six sites, identically, always from the raw basename:

```
bin/fusion-plane:934   "$name::issues/$(basename "$f")"
bin/fusion-plane:939   "$name::decisions/$(basename "$f")"
bin/fusion-plane:954   "shared::issues/$(basename "$f")"
bin/fusion-plane:959   "shared::decisions/$(basename "$f")"
bin/fusion-plane:1158  (same form on the defer path)
bin/fusion-plane:1161  (same form on the defer path)
```

The lookup is an exact string comparison with no tolerance for a changed marker:

```
bin/fusion-plane:550   map_get_id() { … jq -r --arg k "$1" '.[$k].plane_id // empty' "$MAP"; }
```

And a miss routes straight to creation:

```
bin/fusion-plane:705-713
  existing_id="$(map_get_id "$nk")"
  if [ -z "$existing_id" ]; then op="create"
```

No rename detection exists. Searching the whole file for `rename`, `re-key`, `rekey` and
`marker chang` hits line 51 only, which means something unrelated: renaming state names on a
localised board.

## The recorded keys show it directly

`fusion-workbench/.plane-outbox.jsonl` holds 29 distinct natural keys. Every one carries the
marker inside the key:

```
260801-1244-guard-bash-inspection::issues/260801-1430_c_substitution-operand-….md
260801-1244-guard-bash-inspection::issues/260801-1513_c_backslash-line-continuation-….md
```

Those entries stand there as `_c_`. Before they were closed, the same files stood as `_o_`.
Had the map been populated at both moments, there would now be two Plane issues per defect.

## Why nobody has seen it yet

`.plane-map.json` is empty: three bytes, contents `{}`. The mirror has never pushed
successfully in this repository, and all 29 operations fell back to the outbox. That makes
the defect invisible so far, not harmless. It surfaces on the first working push, at the
second run over the same file after a state change.

## `--rebuild-map` does not help

The obvious recovery path is rebuilding the map from Plane. It does not work here.
`rebuild_map()` (`bin/fusion-plane:1012-1034`) reads the key back out of the Plane issue's
description, and what sits there is the key embedded at creation time (`build_write_body`,
`bin/fusion-plane:890`: `fusion-key: %s`). That is the old key with the old marker. The
rebuild therefore restores exactly the mapping the state change just invalidated.

## What the key should be instead

The marker is state, not identity. It belongs in `last_state`, where it already lives
(`map_get_state`, `bin/fusion-plane:551`), and not in the key. What stays stable across a
record's whole life is the timestamp and the slug, so the form
`<store>::issues/YYMMDD-HHMM_<slug>.md` with no marker segment.

fusion has already made this call once, correctly, for Circle directories: the marker sits
on `_t_circle.md` and never on the directory name, so every reference into a Circle survives
its whole lifecycle (`rules/fusion-workbench-conventions.md:191`, `CLAUDE.md` section on
Circles). The same rule was not applied to defects and decisions.

Open, and not decided here: what happens to map entries already written and to the embedded
`fusion-key` lines in Plane issues already created. While `.plane-map.json` is empty the
change costs nothing, which is an argument for making it before the first successful push.

How fast this bites was demonstrated by this report on itself. The cross-reference above
pointed at `260807-0158_*_…` when it was written. Less than half an hour later that record
stood at `_c_` and the reference was dead. It was repaired with `_*_` at the marker position,
the form `CLAUDE.md` already uses for decision references. People and prose can work around
it that way. `map_get_id` cannot, because what sits there is an exact string comparison.

## Reproduction

```
# push a mirrored record in state _o_, then close it and push again
bin/fusion-plane push --plan <circle>      # shows op=create for the _o_ file
mv <circle>/issues/260101-0900_o_x.md <circle>/issues/260101-0900_c_x.md
bin/fusion-plane push --plan <circle>      # shows op=create again, not op=update
```

The dry run `--plan` is enough, because `op` is decided in `process_artifact` before any
network call and the plan reports the operation.

## Provenance of this finding

Found while verifying a report from a consuming project which claimed fusion identifies
records by timestamp alone. The claim was false: the filename carries the slug and is
unique. The verification did lead to the one place in the system where a filename genuinely
serves as a key, and there sits a real defect, just not the one that was reported.

---
Resolved: the key is built in one place, and that place drops the marker.

`natural_key` now sits on `stable_basename` — the record's basename with the `_<m>_` marker segment removed — and all six construction sites call it. Circles were already correct, because their key is the directory name; that was the precedent this record cited, and the record kinds now follow it. The marker did not disappear, it went where it already belonged: `last_state`.

**Migration, rather than a tolerant lookup.** `map_migrate_keys` re-keys a legacy map once per run from `map_ensure`, before any lookup. A map already in the stable form normalises to itself and is not rewritten. Where the old scheme recorded one record under two keys — the duplicate this defect produces — the more recently pushed entry wins and the discard is named on stderr, because a dropped UUID is a stray Plane issue somebody has to close by hand. A permanent tolerant lookup was rejected deliberately: it keeps the wrong key form alive indefinitely inside the helper whose whole purpose is that the form was wrong.

`--rebuild-map` is a recovery path again. It was not one before: the `fusion-key:` line inside an already-created Plane issue holds whatever key fusion used when it POSTed, so a verbatim rebuild restored precisely the mapping a state transition had invalidated. It now normalises on read.

**Verified three ways, not one.** The test file carries 69 passing tests, six of them new behavioural cases plus a three-test lint guard that fails if a seventh site ever composes a key from a raw basename — the guard was shown firing against an injected violation rather than assumed. Outside vitest, the record's own reproduction was run against a scratch copy of the fixture workbench: push at `_o_` created, rename to `_c_`, push again **updated the same `plane_id` under the same key** instead of creating a second issue. A legacy two-marker map was migrated the same way: two entries collapsed to one, the collision named, the newer UUID kept.

`.plane-map.json` needed no migration in this workbench — still `{}`, as the record predicted. The 29 legacy keys in `.plane-outbox.jsonl` are deliberately untouched: it is a human-readable record rather than a correctness queue, and its drain matches on the Circle-name prefix.

Session: `260810-0241-orchestrator-session.md` (task T4). Executor log: `260810-0338-coder-plane-natural-key-marker.md`.
