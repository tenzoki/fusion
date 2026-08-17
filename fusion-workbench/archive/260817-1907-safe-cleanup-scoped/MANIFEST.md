# Archive Manifest

**Date:** 2026-08-17 19:07
**Mode:** scoped tier-1 — tier-1 minus every artifact the plugin's shipped text names
**Slug:** safe-cleanup-scoped
**Invoked by:** orchestrator, during `/fusion:cleanup`

## Why this is not plain tier-1

Tier-1 treats a terminal Circle as safe to move by construction, and its only
citation check reads `CLAUDE.md`. That assumption does not hold in this
repository. `rules/rule-file-provenance.md` requires every rule file to cite the
Circle that caused it, so eleven of the sixteen terminal Circles are named from
`rules/`, `agents/`, `skills/`, `hooks/`, `docs/`, `bin/` and the READMEs, and
the `CLAUDE.md` filter catches one of the eleven. The user was asked and chose
to archive only what nothing in the shipped text names.

## The filter, and the two passes it took to get right

The first pass grepped each candidate's filename verbatim and archived 296
shared records. That filter was wrong: shipped text cites a record with a
wildcard marker, `YYMMDD-HHMM_*_slug.md`, which no literal filename match can
find, and it read only seven roots, omitting `bin/`. Six citations went dangling
and `hooks/lib/__tests__/reference-resolution-lint.test.ts` failed on them.

The filter that stands is marker-agnostic and root-complete: a record is kept in
the live store when its `YYMMDD-HHMM` stamp appears anywhere in `bin/`,
`rules/`, `agents/`, `skills/`, `hooks/`, `docs/`, `CLAUDE.md`, `README*.md` or
`install.sh`. 118 records were restored from this archive folder under it. The
whole hook suite is green afterwards, 653 tests, the reference lint's record
baseline back at its pinned 94.

## Circles archived

- `260717-1638-marker-format-ohne-glob-metazeichen` (`_c_`) — marker format without glob metacharacters
- `260719-1536-brest-unite-co-creator-conversion` (`_c_`) — Brest Unite co-creator conversion
- `260719-1536-plane-mirror-integration` (`_c_`) — Plane mirror integration, since removed from the plugin
- `260801-1244-guard-bash-inspection` (`_c_`) — the guard's Bash inspection, since deleted
- `260813-0910-documentation-matches-shipped-plugin` (`_b_`) — documentation matches the shipped plugin

## Circles kept, named from shipped text

`260716-1847-workbench-umbau`, `260718-1924-v5x-overhaul`,
`260801-1244-curator`, `260801-1244-guard-rules-write`,
`260801-1244-rule-provenance-header`, `260804-1205-shell-reachability-model`,
`260805-2005-textschicht-gegen-code-nachziehen`,
`260807-0923-guard-misst-statt-orakelt`,
`260813-0858-playmaker-maintains-backlog-store`,
`260815-0007-remove-eight-mechanisms-and-cap-growth`,
`260816-1741-guard-becomes-observation-only`

## Files archived

178 terminal records from the shared store, each at its original path relative
to the workbench root:

- `shared/issues/*_c_*.md` — 161 closed defects
- `shared/planning/*_c_*.md` — 6 closed plans
- `shared/decisions/*_i_*.md` and `*_s_*.md` — 9 terminal decisions
- `shared/backlog/*_c_*.md` — 2 closed backlog entries

## Guard event log

rolled: `.guard-state/events.jsonl` -> `.guard-state/events-260817-1907.jsonl`,
18251 lines, 7989105 bytes. The live log was re-created empty.

## Counts

- 5 Circles (111 files)
- 178 shared records (1299523 bytes)
- 1 rolled guard event log (7989105 bytes)
- **Total:** 291 files

## Safety filters applied

- 11 terminal Circles kept: named from shipped text
- 118 terminal shared records kept or restored: their stamp appears in shipped text
- Root-anchored surfaces untouched, apart from the event-log roll the archive procedure defines
- No open, in-progress, deferred, anticipated or active artifact was considered

## Collisions

none
