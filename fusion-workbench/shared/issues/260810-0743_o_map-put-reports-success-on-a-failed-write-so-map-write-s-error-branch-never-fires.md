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
