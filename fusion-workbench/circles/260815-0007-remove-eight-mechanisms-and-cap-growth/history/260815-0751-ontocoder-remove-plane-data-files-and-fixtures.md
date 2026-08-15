# Ontocoder — the Plane mirror's data files and fixtures leave the tree

**Date:** 2026-08-15
**Agent:** ontocoder
**Status:** Complete
**Circle:** `circles/260815-0007-remove-eight-mechanisms-and-cap-growth`
**Plan step:** 3 of `planning/260815-0029_o_plan-remove-eight-mechanisms-and-cap-growth.md`
**Dispatched by:** orchestrator

---

## What was asked

Delete the structured-data tail of the Plane removal: the configuration template and its filled
copy, the two runtime state files at the workbench root, and the on-disk fixture tree the mirror's
test suite walked. Step 2 (`d0ddabb`) had already removed the mirror's code, prompts and prose, so
every citation of these files was gone before this step opened. That ordering is the reason the two
halves are separate steps at all: `hooks/lib/__tests__/reference-resolution-lint.test.ts` resolves
`templates/`-shaped paths against the tree, so deleting `templates/plane.config.yaml` while
`skills/setup/SKILL.md` Step 0e still cited it would have left the intermediate commit red.

## What was deleted

Five entries, nineteen files, all of them git-tracked.

| Path | What it was |
|---|---|
| `templates/plane.config.yaml` | 8 922 bytes — the consumer-filled bridge configuration `/fusion:setup` Step 0e seeded into a project's workbench |
| `fusion-workbench/plane.config.yaml` | 6 520 bytes — this repository's own filled copy |
| `fusion-workbench/.plane-map.json` | 3 bytes — the record-to-Plane-ID binding that made the push idempotent |
| `fusion-workbench/.plane-outbox.jsonl` | 22 289 bytes, 50 lines — the human-readable log of deferred pushes |
| `hooks/lib/__tests__/fixtures/plane/` | 15 files — six JSON API-response fixtures and a nine-file workbench tree (one demo Circle with its issues and decisions, a `shared/` pair, and a `plane.config.yaml`) |

`hooks/lib/__tests__/fixtures/` now holds `rules-emission.golden` alone, and `templates/` holds
`fusion-guard.json` and `investigator-capture-layout.md`. The workbench root holds no Plane surface.

## The evidence question, and why nothing was archived

The outbox is the only file here that was evidence rather than configuration, and the plan's
instruction was to delete it rather than preserve it. Two facts make that safe. This repository's
workbench is git-tracked, so all nineteen files survive at `507dbc6^` and are recoverable by path.
And step 2's history entry already carries the two figures the removal rests on.

The outbox's contents were re-read here before deletion and are recorded once more, at the finer
grain this step could measure:

- **50 entries, every one of them deferred.** Not one push succeeded.
- **Two deferral reasons, in a 33/17 split.** 33 entries were deferred because `PLANE_API_KEY` was
  absent; 17 because Plane was unreachable (`curl rc 7 / HTTP none`).
- **46 distinct natural keys across 5 Circles**, spanning 2026-08-01 to 2026-08-15 — a fortnight of
  the bridge running against nothing.
- **`.plane-map.json` was `{}`.** The map is written on a successful push, so an empty map is the
  same claim the outbox makes, from the other side: zero pushes ever landed.

## Verification

`cd hooks && npm test` — **exit 0**, 48 test files, 903 tests, 40.4 s.

The baseline taken immediately before the deletions was identical in shape: 48 files, 903 tests,
30.3 s. A fixture deletion should move neither count, and it moved neither. The duration difference
between the two runs is scheduling noise on a suite whose slowest file (`fusion-paths.test.ts`,
88 tests, ~29 s) spawns a shell per case; it is not attributable to this change.

## Findings the plan did not predict

**The fixture tree holds 15 files, not the 14 the plan's file list states.** The count was already
15 at `d78dfb7`, the commit before step 2, so nothing in step 2 changed it — the plan simply
miscounted. The step's scope was unaffected: its list names the directory as a whole ("the whole
tree"), so no file was unnamed and nothing had to be adjudicated. The whole tree was deleted. The
discrepancy is recorded because the same figure may appear in the step-14 after-measurement or in
the Circle's closure arithmetic, where a one-off count is worth catching rather than inheriting.

**Two `CLAUDE.md` rows still name Plane, and both are correctly out of scope.** The `templates/`
row (`CLAUDE.md:51`) names `plane.config.yaml` as a file setup seeds, and the `docs/` row
(`:52`) names `plane-setup.md`. The plan assigns the second to the curator at gate G1 explicitly;
the first is the same class of narrative claim and belongs with it. Neither is a dangling *path*
citation — the templates row writes the bare filename, not `templates/plane.config.yaml` — which is
why `reference-resolution-lint` stays green over them and why they can wait for G1 rather than
having to land here. Flagged so the curator's pass does not have to rediscover the first one.

## Files written

Deletions:

- `/Users/k1/Projects/productive/fusion/templates/plane.config.yaml`
- `/Users/k1/Projects/productive/fusion/fusion-workbench/plane.config.yaml`
- `/Users/k1/Projects/productive/fusion/fusion-workbench/.plane-map.json`
- `/Users/k1/Projects/productive/fusion/fusion-workbench/.plane-outbox.jsonl`
- `/Users/k1/Projects/productive/fusion/hooks/lib/__tests__/fixtures/plane/comments-other-key.json`
- `/Users/k1/Projects/productive/fusion/hooks/lib/__tests__/fixtures/plane/comments-with-marker-bare-array.json`
- `/Users/k1/Projects/productive/fusion/hooks/lib/__tests__/fixtures/plane/comments-with-marker.json`
- `/Users/k1/Projects/productive/fusion/hooks/lib/__tests__/fixtures/plane/map-synced.json`
- `/Users/k1/Projects/productive/fusion/hooks/lib/__tests__/fixtures/plane/rebuild-issues.json`
- `/Users/k1/Projects/productive/fusion/hooks/lib/__tests__/fixtures/plane/seed-issue.json`
- `/Users/k1/Projects/productive/fusion/hooks/lib/__tests__/fixtures/plane/workbench/plane.config.yaml`
- `/Users/k1/Projects/productive/fusion/hooks/lib/__tests__/fixtures/plane/workbench/circles/260719-1536-demo-circle/_t_circle.md`
- `/Users/k1/Projects/productive/fusion/hooks/lib/__tests__/fixtures/plane/workbench/circles/260719-1536-demo-circle/decisions/260719-1603_a_answered.md`
- `/Users/k1/Projects/productive/fusion/hooks/lib/__tests__/fixtures/plane/workbench/circles/260719-1536-demo-circle/decisions/260719-1604_i_implemented.md`
- `/Users/k1/Projects/productive/fusion/hooks/lib/__tests__/fixtures/plane/workbench/circles/260719-1536-demo-circle/issues/260719-1600_o_open-issue.md`
- `/Users/k1/Projects/productive/fusion/hooks/lib/__tests__/fixtures/plane/workbench/circles/260719-1536-demo-circle/issues/260719-1601_c_closed-issue.md`
- `/Users/k1/Projects/productive/fusion/hooks/lib/__tests__/fixtures/plane/workbench/circles/260719-1536-demo-circle/issues/260719-1602_d_dropped-issue.md`
- `/Users/k1/Projects/productive/fusion/hooks/lib/__tests__/fixtures/plane/workbench/shared/decisions/260719-1701_o_shared-decision.md`
- `/Users/k1/Projects/productive/fusion/hooks/lib/__tests__/fixtures/plane/workbench/shared/issues/260719-1700_o_shared-issue.md`

Added:

- `/Users/k1/Projects/productive/fusion/fusion-workbench/circles/260815-0007-remove-eight-mechanisms-and-cap-growth/history/260815-0751-ontocoder-remove-plane-data-files-and-fixtures.md`

Nothing else was touched. No code, no prompt, no prose, no commit.
