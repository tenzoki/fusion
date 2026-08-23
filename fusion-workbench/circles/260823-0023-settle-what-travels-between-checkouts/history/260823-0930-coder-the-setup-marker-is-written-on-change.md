# Coder session: the setup marker is written on change, not on every run

**Date:** 2026-08-23
**Agent:** coder
**Domain:** code
**Circle:** `circles/260823-0023-settle-what-travels-between-checkouts`
**Plan:** `circles/260823-0023-settle-what-travels-between-checkouts/planning/260823-0800_o_c2-what-travels-between-checkouts-is-settled.md`, step 4
**Status:** Complete

## What was done

The unconditional marker write in `skills/setup/SKILL.md` Step 0 was replaced by a conditional one.
The shipped version is resolved once, exactly as the old block resolved it, and the marker is written
only when the file is absent or when the `plugin_version` it carries is not the shipped one. In every
other case nothing is written at all, so no run that changes nothing moves the file's modification
time.

`setup_pwd` is gone from the emitted JSON, which now carries `setup_at` and `plugin_version` and
nothing else. No consumer ever read the dropped field: every reader of `.fusion-setup` tests only
that the file exists.

The prose is one sentence and a pointer to
`rules/workbench-tracking.md` `## The setup marker is written on change, not on every run`, which
step 1 wrote and which this step restates in no part.

**The pre-v4 refusal above the write is untouched.** It stops Setup before this point precisely so
`plugin_version` is not overwritten, and a conditional write narrows when that overwrite happens
without removing it, so the refusal still guards a real loss.

A marker written by an older fusion, carrying `setup_pwd` at the current version, is left exactly as
it stands. That is the plan's own reading in `## Data Structures`: no migration is needed, and a
version change rewrites the file in the ordinary way.

## Files changed

- `/Users/k1/Projects/productive/fusion/skills/setup/SKILL.md`
- `/Users/k1/Projects/productive/fusion/hooks/lib/__tests__/reference-resolution-lint.test.ts`
- `/Users/k1/Projects/productive/fusion/hooks/lib/__tests__/fixtures/surface-growth.golden`
- `/Users/k1/Projects/productive/fusion/fusion-workbench/circles/260823-0023-settle-what-travels-between-checkouts/planning/260823-0800_o_c2-what-travels-between-checkouts-is-settled.md`
  (step 4 marked `[DONE]`)

## Two gates forced a file outside the step's list, and both are re-approvals

Neither is a baseline moved to clear a bound.

**`reference-resolution-lint.test.ts` `BASELINE`: `{ paths: 1287, anchors: 177 }` →
`{ paths: 1288, anchors: 178 }`.** Both new tokens resolved; what failed was the pin on how many the
gate resolves. The step adds exactly one citation, `rules/workbench-tracking.md` with the anchor
`## The setup marker is written on change, not on every run`, which is one path and one anchor.
`records` is unchanged at 118. Re-approving the pin is what the assertion's own message prescribes.
Four comment lines were added above the constant, following that block's own convention: three
account for this step, and the fourth records that step 3 moved both counts the same way and left its
account in `git:c9eba48` rather than here, so the comment block reconciles with the number again.

**`fixtures/surface-growth.golden`: four lines.** `setup/SKILL.md 48522 → 48725` and the
`[skills bytes]` total `238781 → 238984`; `reference-resolution-lint.test.ts 1053 → 1057` and the
`[hook-tests lines]` total `20110 → 20114`, from the four comment lines above. Regenerated with
`UPDATE_SURFACE_GOLDEN=1 npx vitest run lib/__tests__/surface-growth-bound.test.ts`, which rewrites
the file and then fails on purpose so the flag cannot be left on. **No baseline map moved.**

## The `skills/` bound after the edit

| Figure | Value |
|---|---|
| Surface total | 238 984 bytes |
| Floor (`SKILL_BASELINE` over the same files) | 220 439 |
| Budget (floor + 20 000 head-room) | 240 439 |
| **Head-room left** | **1 455 bytes** |

The step added 203 bytes, not the neutral or negative figure it was asked to aim for. The code block
shrank; the citation of the rule that holds the reasoning is what the block spent. Step 5 works
against 1 455 rather than 1 658.

The hook-test line surface moved too, from the four comment lines: 20 114 lines, **261 left** of the
2 500 head-room, down from 265.

## Verification

`npm test` from `hooks/` — **exit 0**, 41 files, 724 tests passing.

Every acceptance criterion was run as a command in a scratch tree outside this repository, against a
plugin directory carrying a fabricated `plugin.json`, so the version could be changed under a
workbench that had already been set up.

| Case | Check | Result |
|---|---|---|
| Fresh workbench, no marker | file after the run | written, `{"setup_at":…,"plugin_version":"10.6.0"}` |
| | `setup_pwd` in it | absent |
| Second run, same version | SHA-256 | identical |
| | modification time (`stat -f %Fm`) | identical |
| Third run, shipped version `10.7.0` | SHA-256 | changed; file names the new version |
| | `setup_pwd` in it | absent |
| Tracked workbench, second run | `git status --porcelain fusion-workbench/.fusion-setup` | empty |
| Legacy marker with `setup_pwd`, same version | SHA-256 and modification time | both unchanged |

The last row is not one of the criteria. It was run because the plan's `## Data Structures` states
that an older marker is left as it stands, and the condition is what makes that true.

The scratch tree was removed at the end of the run.

## What this step did not do

No commit. Nothing outside the four files listed above was touched, and the pre-v4 refusal's wording
was not edited.
