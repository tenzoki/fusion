# `push --plan --rebuild-map --fixture` writes the map, in a dry run four documents say writes nothing

---

**Severity:** Low
**Domain:** code
**Filed by:** coderev, review of `ff70d3a..HEAD` (session `260810-0241`, Turn 2)
**Affects:** `bin/fusion-plane:1377-1382`
**Cross-references:** commit `c923935`; `shared/issues/260810-0456_c_fusion-plane-dry-run-rewrites-the-map-and-can-destroy-a-mapping.md`

---

## The defect

`cmd_push` runs the fixture-driven rebuild **before** the dry-run gate:

```bash
if [ "$rebuild" -eq 1 ] && [ -n "$rebuild_fixture" ]; then
  rebuild_map "$rebuild_fixture" || return "$?"
  rebuild=0
fi

if [ "$DRYRUN" -eq 0 ]; then
  …
```

`rebuild_map` ends in `map_put`, so `push --plan --rebuild-map --fixture <f>` replaces
`.plane-map.json` despite `--plan`. Reproduced against a scratch workbench holding the legacy
duplicate pair: the map was rewritten to a single stable key and one UUID was dropped, from a
command carrying the dry-run flag.

The placement is deliberate — the comment above it says the fixture path "needs neither key nor
network, so it runs ahead of the live gate below" — but four surfaces state the opposite
property without qualification:

- `bin/fusion-plane:104-107` — "`map`, `push --plan` and `plan` resolve through the folded keys
  and leave `.plane-map.json` byte-identical"
- `bin/fusion-plane:1371-1375` — "This point is reached by `push --plan` and by `plan`, both
  documented as changing nothing"
- `map_report_fold`'s own stderr line — "reads do not (`map`, `push --plan`, `plan`)"
- `docs/plane-setup.md:187-192` — "A dry run writes **nothing** — not `.plane-map.json`, not even
  an empty one where none existed."

`hooks/lib/__tests__/fusion-plane.test.ts` `describe("fusion-plane: reads never write
.plane-map.json")` asserts the property for four spellings (`map`, `map <key>`, `push --plan`,
`plan`) and not for this fifth one.

## Why it is Low rather than Medium

`--fixture` is a test seam, documented as one in the file header, and `FUSION_PLANE_ISSUES_FIXTURE`
is its env twin. Nothing in the operator documentation tells a user to combine it with `--plan`.
The cost is that the invariant `c923935` is built on — "a command whose name says it reads cannot
write" — has one documented spelling that violates it, and the reader who checks the four
statements above will not find it.

## Suggested fix direction

Either refuse the combination (`--plan` with `--rebuild-map`: usage error, since a rebuild is a
mutation and a plan is not), or run the fixture rebuild inside the `DRYRUN -eq 0` branch beside
the live one and let `--plan --rebuild-map` report that it planned no rebuild. Add the spelling
to the `reads never write` loop either way.

---
Resolved: 4bf509e — `cmd_push` refuses `--rebuild-map` under any dry run (flag `--plan` or env `FUSION_PLANE_DRYRUN=1`), keyed on the flag and placed after the env fold. Reporting a planned rebuild was rejected: `--plan` emits ops computed from the map, so a truthful plan for a rebuilt map requires performing the rebuild. Header, fold note, `usage()` and `docs/plane-setup.md` extended; the reads-never-write suite gained the fifth spelling.
