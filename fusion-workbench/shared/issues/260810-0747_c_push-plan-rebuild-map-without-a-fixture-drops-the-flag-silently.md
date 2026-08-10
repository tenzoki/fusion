# `push --plan --rebuild-map` without a fixture drops the flag silently

---

**Severity:** Low
**Domain:** code
**Filed by:** coderev, review of `ff70d3a..HEAD` (session `260810-0241`, Turn 2)
**Affects:** `bin/fusion-plane:1384-1396`
**Cross-references:** commit `c923935`; `bin/fusion-plane:1504-1506` (the doctrine it contradicts)

---

## The defect

The live rebuild sits inside the `DRYRUN -eq 0` branch:

```bash
if [ "$DRYRUN" -eq 0 ]; then
  config_valid || return "$EXIT_CONFIG"
  …
  if [ "$rebuild" -eq 1 ]; then
    rebuild_map || true
  fi
```

With `--plan` set and no fixture, `rebuild=1` is never read again. Verified: `push --plan
--rebuild-map --all` exits 0, leaves the map unchanged, and prints nothing about the flag on
either stream. The user asked for a mutation, did not get it, and was not told.

This is the doctrine `map_forget` states for the same file, twelve hundred lines later:

> an absent key is a reported failure (`EXIT_CONFIG`), never a silent no-op, because the caller
> asked for a mutation that did not happen — `:1504-1506`

## Suggested fix direction

Whatever is decided for `260810-0746` (the fixture path writing under `--plan`) settles this too:
if the combination is a usage error, this spelling errors with it; if the rebuild is planned
rather than performed, say so on stdout as an op. Silence is the one answer that contradicts the
file's own rule.

---
Resolved: 4bf509e — `cmd_push` refuses `--rebuild-map` under any dry run (flag `--plan` or env `FUSION_PLANE_DRYRUN=1`), keyed on the flag and placed after the env fold. Reporting a planned rebuild was rejected: `--plan` emits ops computed from the map, so a truthful plan for a rebuilt map requires performing the rebuild. Header, fold note, `usage()` and `docs/plane-setup.md` extended; the reads-never-write suite gained the fifth spelling.
