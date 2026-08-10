# `push --rebuild-map` swallows a failed rebuild and reconciles against the stale map

---

**Severity:** High
**Domain:** code
**Filed by:** coderev, review of `7f617b1..7ddacbc` (Turn 4)
**Affects:** `bin/fusion-plane:1641-1643`
**Cross-references:** commit `98c8b3f`; `bin/fusion-plane:1474-1477` (the equivalence
this contradicts); `bin/fusion-plane:1626-1629` (the fixture branch that gets it right);
`bin/fusion-plane:1863` and `:1875` (what `map --rebuild` does with the same status);
closed issue `260810-0747` (quoted the same line for a different defect)

---

## The defect

`98c8b3f` adds `map --rebuild` and states, at `bin/fusion-plane:1474-1477`, that the two
spellings are one implementation:

> TWO commands end here and share this body exactly: `map --rebuild`, which stops when
> this returns, and `push --rebuild-map`, which continues into the reconcile. One
> rebuild, two things done with it — there is no second implementation to keep in step.

The body is shared. What is not shared is the one branch where a failure is decided.
`map_rebuild` propagates it:

```bash
rebuild_map || return "$?"          # :1863 (fixture) and :1875 (live)
```

`cmd_push`'s live branch discards it:

```bash
if [ "$rebuild" -eq 1 ]; then
  rebuild_map || true               # :1642
fi
```

So a rebuild that fails under `push --rebuild-map` does not stop the run. The reconcile
that follows runs against the map the rebuild did not replace, and the command reports
`STATUS: ok`.

`cmd_push` is inconsistent with itself as well: its own fixture branch twelve lines
higher (`:1627`) writes `rebuild_map "$rebuild_fixture" || return "$?"`.

## Evidence — measured, not inferred

Two copies of the committed test fixture workbench, identical `.plane-map.json`,
`base_url` pointed at a local mock that answers `GET .../issues/` with **HTTP 200 and an
empty body** (which `rebuild_map:1516-1520` correctly refuses: "the issues response was
empty — map not changed", `EXIT_CONFIG`) and answers `GET .../states/`, `POST` and
`PATCH` normally. `PLANE_API_KEY` set to a dummy value, so both runs take the live path.

```
$ fusion-plane map --rebuild
fusion-plane: rebuilding .plane-map.json from Plane (embedded fusion-key)…
fusion-plane: rebuild-map: the issues response was empty — map not changed
EXIT=1
map: unchanged

$ fusion-plane push --circle 260719-1536-demo-circle --rebuild-map
fusion-plane: rebuilding .plane-map.json from Plane (embedded fusion-key)…
fusion-plane: rebuild-map: the issues response was empty — map not changed
fusion-plane: created Plane label 'Zirkel' for kind 'circle'.
… 5 more label lines …
STATUS: ok (6 pushed)
EXIT=0
map: 6 new entries, all plane_id "posted-uuid" (the mock's POST response)
```

Same input, same failed rebuild, same message on stderr. One command stops and says so
with a non-zero exit; the other creates six issues on the board and exits 0.

## Why this is High rather than a wrong exit code

The situation in which an operator reaches for `--rebuild-map` is the one
`docs/plane-setup.md` describes: "If the map is lost or badly out of date, rebuild it
from Plane itself." The stale map is the premise of the request. When the rebuild fails
and the reconcile proceeds anyway, every artifact the stale map does not know about is
POSTed as a **new** Plane issue — duplicating issues that already exist on the board,
which is the exact outcome the rebuild exists to prevent. The run then reports `ok`, so
nothing tells the operator to go looking.

The failure modes that reach `:1642` with a live, reachable Plane are real ones, not only
the empty body above: a non-2xx from `GET issues/` (`:1503`, `EXIT_DEFERRED`), an
unparseable response (`:1511`, `EXIT_CONFIG`), and a `map_put` that could not write the
file (`:1541`, `EXIT_CONFIG` — a read-only mount or a full disk, the case
`docs/plane-setup.md` already documents for `map --migrate`).

Note that an *unreachable* Plane hides the defect: `fetch_states` fails immediately after
and the push defers with exit 10 for its own reason. That is why the existing suite does
not catch this — its live-path cases all use an unroutable host.

## Suggested fix direction

Propagate, the way the fixture branch beside it already does:

```bash
if [ "$rebuild" -eq 1 ]; then
  rebuild_map || return "$?"
fi
```

`rebuild_map` already prints a reason on every failure path, so the operator loses no
diagnostic. Whether the deferral should instead go to the outbox (as `emit_manual_only`
does for the absent-key and unreachable-states cases twenty lines below) is a design
call; what is not a design call is that the reconcile must not run on a map the rebuild
was asked to replace and did not.

Whichever is chosen, pin it: the file has no test that drives the live rebuild against a
*reachable* endpoint, which is why the whole class is invisible to the suite.

---
Resolved: df75004 — push --rebuild-map aborts when the rebuild fails, and queues nothing either. The reconcile reads the map to choose PATCH against POST per artifact, so a warning cannot help: by the time it prints, the POST has happened. It also does not fall through to emit_manual_only, because those notes are computed from the same stale map and would hand a human the stale answers to run by hand. Measured against an HTTP mock: before, exit 0 with STATUS ok (6 pushed) and 5 creates plus 1 update on the board; after, exit 10, map byte-identical, nothing sent. Four new cases drive the live rebuild against a reachable endpoint, which is the gap that let this through.
