# `--rebuild-map` and `--plan` stopped being resolvable — the pair is refused

**Agent:** coder
**Date:** 2026-08-10 09:15
**Status:** Complete
**Task:** fix `260810-0746` + `260810-0747` (one fix; the second record says the first settles it)
**Source records:**
- `fusion-workbench/shared/issues/260810-0746_o_push-plan-rebuild-map-fixture-writes-the-map-in-a-dry-run-that-four-documents-say-writes-nothing.md`
- `fusion-workbench/shared/issues/260810-0747_o_push-plan-rebuild-map-without-a-fixture-drops-the-flag-silently.md`

**Origin:** Not Circle work; no Circle active. Review findings (coderev, session
`260810-0241`, Turn 2) against `ff70d3a..HEAD`, whose executor log is
`fusion-workbench/shared/history/260810-0715-coder-plane-map-read-write-split.md`.

## The one shape behind both records

`--rebuild-map` REPLACES `.plane-map.json`. `--plan` is documented in four places as
writing nothing. The pair asks for both at once, and `cmd_push` resolved it twice, in
opposite directions:

- the **fixture** spelling ran ahead of the dry-run gate (`rebuild_map` ends in
  `map_put`), so `push --plan --rebuild-map --fixture <f>` replaced the map under a flag
  that says it does not — including, on a legacy duplicate pair, dropping a Plane UUID;
- the **flagless** spelling sat inside the `DRYRUN -eq 0` branch, so under `--plan` the
  flag was read once at parse time and never again: exit 0, map unchanged, nothing said
  on either stream — against this file's own `map_forget` doctrine (`:1504-1506`) that a
  mutation the caller asked for and did not get is a *reported* failure.

Two placements, one contradiction. Fixing them separately would have been two special
cases for one wrong question.

## What changed — `bin/fusion-plane`

One check in `cmd_push`, after the flag loop and after both env folds
(`FUSION_PLANE_DRYRUN`, `FUSION_PLANE_ISSUES_FIXTURE`), before `resolve_workbench`:

```bash
if [ "$rebuild" -eq 1 ] && [ "$DRYRUN" -eq 1 ]; then …  return "$EXIT_USAGE"
```

It sits on `$rebuild` (the flag), not on `$rebuild_fixture`, so a fixture arriving from
the env twin without `--rebuild-map` is unaffected — the flag is what asks for the
mutation. It sits after the env fold, so `FUSION_PLANE_DRYRUN=1 push --rebuild-map` is
refused too, and the message names the env rather than a `--plan` the caller never typed.
Both dry-run sources, both fixture spellings, and the `plan` alias reach the same gate.

### Why refusal, and not "report that it planned a rebuild"

Both directions were on the table in record `260810-0746`. The op list decides it:
`--plan`'s entire output is the ops computed **from the map**. A run that reported a
planned rebuild would then emit ops computed against the map the rebuild was about to
replace — a plan for a board that will not exist when it is executed, and the consumers
of that JSON parse it as the answer. Emitting a truthful op list means performing the
rebuild's effect on the view first, which is the mutation the flag was refused for; the
alternative is a synthetic `rebuild-map` op in a stream whose every other member is a
Plane call. Refusing is the only answer that is neither a lie nor the write.

The refusal also costs nothing that worked: there was never a dry-run preview of a
rebuild (the live one is unpreviewable by construction), and `push --rebuild-map …` alone
is untouched — the tests pin that.

### Documented surfaces

None of the four statements the record cites became false, which is a property of this
direction rather than a coincidence: refusing the pair makes "a dry run writes nothing"
true for *every* spelling. Three were extended so a reader meets the refusal where they
meet the flag — the header subcommand block (`:16-22`), the fold note (`:104-111`), and
`usage()`. `map_report_fold`'s stderr line and the `NO map_ensure here` comment were left
alone: both name commands, and `push --plan --rebuild-map` is no longer one.
`docs/plane-setup.md` gained a paragraph under "A dry run writes **nothing**" with the
rebuild-then-plan order and why the reverse order would mislead.

## What changed — `hooks/lib/__tests__/fusion-plane.test.ts`

- The `reads never write .plane-map.json` loop gained the **fifth spelling**
  (`push --plan --rebuild-map --fixture`). Its args are now built per-workbench so the
  fixture can be written into the scratch copy: a *destructive* one, whose embedded key
  folds onto the surviving entry, so the assertion is evidence rather than an inert file.
  The loop's third element is now the per-spelling "and it did not do this silently"
  check — the fold report for the four reads, the usage refusal for the fifth.
- `push --plan --rebuild-map` with no fixture, flag order reversed, the `plan` alias, and
  the `FUSION_PLANE_DRYRUN=1` env twin: all four exit 2, name the flag, leave the file
  byte-identical; the env one names the env.
- A rebuild *without* a dry run still rebuilds — the refusal is not a ban on the flag.

## Verification

`cd hooks && npm test` — **exit 0**, 38 files / 1005 tests, all green. The tree carried a
concurrent `+1` from another session (`fusion-count-sources.test.ts`, record
`260810-0749`), so the measured baseline was 1002 rather than the 1001 in the brief; this
change is the remaining `+3`. Before that, the five spellings and the working rebuild were
driven by hand against a scratch workbench holding the colliding legacy map, comparing
`shasum` before and after each run.

## Not touched

`stable_basename` / `JQ_STABLE_KEY` (record `260810-0458`) and `JQ_REBUILD_MAP`'s
`.collisions` grouping (record `260810-0748`) — separate tasks, and this fix needed
neither.

## Adjacent, filed nowhere, not fixed here

`push --fixture <f>` **without** `--rebuild-map` reads the fixture never and says nothing
— the same silence family. It is not the same fix: `FUSION_PLANE_ISSUES_FIXTURE` is picked
up unconditionally, so refusing a fixture-without-flag would break every push in a shell
that exports the env seam. It wants its own decision about what the env twin means.
