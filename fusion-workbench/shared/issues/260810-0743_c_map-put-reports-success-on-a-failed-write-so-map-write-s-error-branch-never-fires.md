# `map_put` reports success on a failed write, so `map_write`'s error branch never fires

---

**Severity:** High
**Domain:** code
**Filed by:** coderev, review of `ff70d3a..HEAD` (session `260810-0241`, Turn 2)
**Affects:** `bin/fusion-plane:731-760`, and through it `:1039`, `:1043`, `:1514`, `:1533`, `:1569`, `:1778`
**Cross-references:** commit `c923935`; `shared/issues/260810-0459_c_fusion-count-sources-reports-a-measured-zero-when-git-fails-which-its-own-header-forbids.md` (same shape, fixed one commit earlier in `ea492e6`)

---

## The defect

`map_put` is documented as "THE ONE place `$MAP` is replaced". It does not read the status of
the replacement:

```bash
map_put() {
  mv "$1" "$MAP"
  [ -z "$MAP_VIEW_TMP" ] || rm -f "$MAP_VIEW_TMP"
  MAP_VIEW_TMP=""
  MAP_VIEW=""
  MAP_VIEW_READY=0
}
```

`mv`'s exit status is discarded by the four assignments after it, the last of which returns 0.
So `map_put` always returns 0. `map_write` ends in `map_put "$tmp"`, so `map_write` always
returns 0 too, and every caller's `|| return "$EXIT_CONFIG"` guard is unreachable on this path.

## Reproduction

Verified against a scratch fixture workbench with the committed `bin/fusion-plane` at `c923935`,
with the workbench directory made unwritable so `mv` fails:

```
$ chmod 555 "$WB"
$ FUSION_PLANE_WORKBENCH="$WB" bin/fusion-plane map --migrate
mv: rename /var/folders/.../fusion-plane-map.n7JN1J to .../.plane-map.json: Permission denied
STATUS: migrated (1 entries)
$ echo $?
0
```

The map on disk is byte-identical to before. `mv`'s own stderr leaks through, so the failure is
not literally silent, but both surfaces a caller reads — the `STATUS:` line and the exit code —
assert a migration that did not happen. `map_forget` and `map_prune` report the same way, and
their `%s entries remain` count is read back out of the unchanged file.

## Why this is worse than an ordinary swallowed status

`c923935` exists to stop `.plane-map.json` losing a Plane UUID. On the live push path,
`map_set` (`:783-794`) ends in the same `map_write` → `map_put` chain and is called at `:1039`
(after a create) and `:1043` (after an update). *Inference, from reading the call chain rather
than from a live Plane run:* a lost write there means the freshly created issue's UUID never
reaches the map, the next push's `map_get_id` returns empty, and fusion POSTs a **second** Plane
issue for the same record — which is issue `260807-1939`, the defect this whole line of work
exists to close, re-entered from the write side.

It is also the shape `ea492e6` had just removed from `bin/fusion-count-sources` twelve minutes
earlier: an operation that failed, wearing the label that says it succeeded.

## Suggested fix direction

Read the status: `mv "$1" "$MAP" || return 1`, and invalidate the view only on success (or
invalidate unconditionally and still return non-zero — the view is cheap to rebuild). The
callers' `|| return "$EXIT_CONFIG"` guards are already in place and become live.

---
Resolved: the write reports its own failure, and the enumeration found four more of the same class in the same file.

`map_put` discarded the status of `mv "$1" "$MAP"`, four assignments followed, and the last returned 0 — so every caller's `|| return "$EXIT_CONFIG"` was unreachable code. Reproduced against a `chmod 555` workbench: `map --migrate` printed `STATUS: migrated (1 entries)` and exited 0 with the map unchanged; `map --forget` the same. After the fix both print no STATUS line and exit 1.

**This was the third instance of one shape in one session**, which is why the task was scoped to enumerate rather than patch. `ea492e6` had removed the same shape from `bin/fusion-count-sources` one commit earlier, and `c923935` — the commit that introduced this one — exists specifically to stop this file losing a Plane UUID. On the live push path a silently failed `map_put` is that loss, plus a second Plane issue for a human to find and close.

Four more found by the enumeration, none of them reported by anyone:

- `map_write` and `rebuild_map` both replaced the map with an **empty file** when jq read no input — jq exits 0 on empty input, measured rather than assumed.
- `outbox_drain_circle`'s `|| true` let a malformed outbox be moved over and then deleted: a read-and-repair path destroying what it walked.
- `outbox_append` let a failed `>>` abort the run, which is the crash the deferral contract exists to prevent — and the new deferrals from this same fix would have hit it first.

Eleven further sites were examined and deliberately left, each with a reason recorded in the executor log: the `|| true` lookups whose emptiness is checked immediately after, the `ls … || true` walks where the failure *is* the answer, `artifact_title`'s grep, `doctor`'s `|| echo '?'`.

**`set -o pipefail` was considered and rejected**, on the ground that it changes the status of every pipe in the file at once, including those whose first-stage failure is intended. The two load-bearing pipes were split into statements instead.

Two fixes are reasoned rather than executed and say so in place: the live `map_set` deferrals and `outbox_drain_circle` both need a 2xx from a real Plane instance to reach, so no test covers them.

Verified: 38 files, 1001 tests, 0 failures — 993 baseline plus 8 added.

Session: `shared/history/260810-0241-orchestrator-session.md` (Turn 3, task R4). Executor log: `shared/history/260810-0805-coder-plane-discarded-write-status.md`.
