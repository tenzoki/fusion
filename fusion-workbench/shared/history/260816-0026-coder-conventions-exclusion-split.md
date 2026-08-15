# coder — correct the two-legacy-stores exclusion sentence

**Status:** Complete
**Agent:** coder
**Task:** Fix the false claim at `rules/fusion-workbench-conventions.md:64` that four shipped consumers exclude both legacy stores.
**Source record:** `circles/260815-0007-remove-eight-mechanisms-and-cap-growth/issues/260815-1938_c_the-always-on-conventions-file-says-four-consumers-exclude-two-stores-and-one-of-them-excludes-one.md`

## What the measurement found

Re-measured at working-tree HEAD before editing, against all four files the sentence names:

| Consumer | excludes `stashes/` | excludes `.migration-v2-backup/` |
|---|---|---|
| `skills/setup/SKILL.md:60,67` | yes | yes |
| `skills/log-activity/SKILL.md:82,89` | yes | yes |
| `skills/archive/SKILL.md:96` | yes | no |
| `agents/playmaker.md:61` | yes | yes |

The split the source record reports is the split that is there. Four exclude the stash store; three of those also exclude the migration backup, and the one that does not is the archive skill's never-archive list (safety filter 1).

`skills/setup/SKILL.md` and `skills/archive/SKILL.md` were both modified by concurrent tasks during this run. Both cited line numbers were re-checked afterwards and still resolve to the exclusion they are cited for.

## What changed

One file, one line. `rules/fusion-workbench-conventions.md:64`:

- The bold lead dropped the count: "four shipped consumers still exclude them" became "shipped consumers still exclude them", because the count belongs with the store it was measured for.
- The citation sentence now carries the split: "Four consumers exclude `stashes/` — [four citations] — and all but the archive skill exclude `.migration-v2-backup/` too."

Cost: 97 bytes on the always-on surface (54 526 → 54 623), paid by every agent on every dispatch. `hooks/lib/__tests__/fixtures/rules-emission.golden` was regenerated for it (`UPDATE_RULES_GOLDEN=1`, then the flag-off re-run); the diff is that one file's size and the fifteen per-agent totals, nothing else. The universal-core growth bound still passes.

## What was deliberately not done

`skills/archive/SKILL.md:96` is untouched. Adding `.migration-v2-backup/` there would change shipped behaviour to make a sentence true, which is the wrong direction — the sentence was the defect. Having read the file, I do think the exclusion belongs there: safety filter 1 is a list of workbench root entries that no tier survey can reach anyway, so its real audience is the natural-language archive mode, and in that mode the two legacy stores are equally reachable while only one is protected. That is a behaviour decision, not this task's correction, and it is filed as `shared/issues/260816-0025_o_the-archive-skills-never-archive-list-omits-the-migration-backup-store-while-naming-its-twin.md`.

`hooks/lib/__tests__/fixtures/surface-growth.golden` is untouched, per the dispatch.

## Verification

`cd hooks && npm test` — exit 1. One failure: `surface-growth-bound.test.ts`, the known staleness, and the diff names only `skills/cleanup/SKILL.md` and `skills/next/SKILL.md`, both edited by concurrent tasks. No surface I touched appears in it, and `rules-emission-golden.test.ts` passes in full.

## Files changed

- `rules/fusion-workbench-conventions.md`
- `hooks/lib/__tests__/fixtures/rules-emission.golden` (regenerated)
- source record appended and renamed `_o_` → `_c_`
- `fusion-workbench/shared/issues/260816-0025_o_…` (new)
