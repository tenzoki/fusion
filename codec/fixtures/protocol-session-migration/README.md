# protocol-session-migration: the recorded migration session (FJ04 step 7)

Fifty-four exchanges through `bin/fusion-record`. They cover `migration` in all five phases, with the `maintenance` and read operations that bracket them. The contract is `../prior/REQUESTS.md`, `## FJ04 (the contract delta, amended for ab9cb59)` and `## FJ04 (addendum for a1fb17a)`. The gate is `src/__tests__/round-trip-cli-migration.test.ts`. It regenerates these files only under `UPDATE_PROTOCOL_SESSION_MIGRATION=1`, and its header lists every exchange with what it answers. The session is not indexed by `../manifest.json` (`fixtures.test.ts` exempts the directory).

## The base

There is no `base/` here. Each of the three bases A, B and C starts from a fresh copy of the legacy fixture `../legacy-v12/workbench/`, taken as it stands. Its one link stays a link with its own text: `cp -R` on macOS, `cp -a` on Linux, `cpSync(..., { recursive: true, verbatimSymlinks: true })` in Node. The fixture's empty container tree and its untracked file are not recreated.

## What the host does between exchanges

Seeds are copied onto the workbench root immediately before the exchange named in this table:

| Seed | Holds | Copied before |
|---|---|---|
| `seed/01-survey/` | `.fusion-setup` and thirty generated live issues under `shared/issues/`, so that the cut makes three chunks | 01; and first in B (27) and C (46) |
| `seed/02-plan/` | proposal 02, carrying five blocking findings | 02 |
| `seed/03-survey/` | the four files the five consented repairs edit: three `**Filed by:**` lines, the duplicate step renamed `2b`, the deferred Circle set `paused` | 03; second in B and C |
| `seed/04-plan/` | proposal 04, which excludes `stilwerk`, a name outside the allowlist | 04 |
| `seed/05-plan/` | proposal 05, composed over 03's survey, and the note `shared/memos/notes-fixture-added-during-composition.md`, which lands after it | 05; third in B and C |
| `seed/07-plan/` | proposal 07, composed over 06's survey | 07; fourth in B and C |
| `seed/11-apply/` | chunk 2's committed intent, cut in process after its commit point | 11 |

Each proposal lies at `.json-state/migration/proposal-<nn>.json`, and its plan request binds it by sha256. Every proposal copies `eligible_sha256` from the survey it was composed after (C9, option 1). Every proposal except 04 selects the whole exclusion allowlist.

Edits the host makes, each on the workbench root:

| Before | Edit |
|---|---|
| 36 | append `\n` to `archive/migrations/migration-20261002-session/rollback.json` |
| 37 | remove that last byte again |
| 49 | append `\n` to `shared/plans/260905-0900_o_plan-benchmark-suite.record.json`, a control file chunk 2 wrote |
| 50 | remove that last byte again |

## The substitutions

- **`<workbench>`.** In the answers, this stands for the base's absolute root. No request names `workbench`: each is answered against `FUSION_WORKBENCH`, or against the root `bin/fusion-record` finds by walking up to `fusion-workbench/.fusion-setup`. So no request digest depends on where the root lies, and neither does any answer that carries a digest (`rollback.json`'s binding, chunk 0's `progress`).
- **`<since:<nn>-<op>>`.** This stands for a fence's `since`, which is the clock when the fence lands: chunk 1's apply (08, 28, 47) or a `begin` (24, 34). Every later occurrence is recorded as the placeholder naming its setter. That includes `seed/11-apply/`'s `intent.json`, which carries 08's.

Nothing else depends on the clock, the host or a generated id. The cut that produced seed 11 ran with the clock fixed at `2026-10-02T12:00:00.000Z`.

## Replaying

For each base:

1. Copy `../legacy-v12/workbench/` to `<project>/fusion-workbench/`.
2. Run the exchanges of that base in order (A: 01 to 26, B: 27 to 45, C: 46 to 54).
3. Before each exchange, do what the two tables above name. When copying a seed, replace each `<since:...>` with the value its setter answered in this replay.
4. Send `<nn>-<op>.request.json` to `bin/fusion-record` from `<project>`, with `FUSION_WORKBENCH` unset.
5. Compare stdout byte for byte with `<nn>-<op>.response.json`. Replace `<workbench>` with the real path the wrapper resolved (`pwd -P`) and each `<since:...>` with this replay's value.

The gate's last case does exactly this from bash, over roots whose path holds a space and a comma.

## What it shows, and the limit it records

- **Base A** runs the migration. Plan refuses three times: for blocking findings, for an exclusion outside the allowlist, and for a file added after composition (`source-changed`). Then the freeze names three chunks. Chunk 3 is refused before chunk 2 lands, and again while chunk 2's intent is held. Chunk 2's own request finishes that intent. Then come chunk 3 and verify, and the replays of a chunk, of verify and of plan. Base A also records the second-run no-op, `end`, `list`, and `show` of an open package and of the terminal plan the paused package binds (`record-closure`).
- **Base A's last three exchanges record the step-6 limit.** The no-op's stored answer is a later operation, so the first rollback after activation refuses (`after-state-changed`, naming 18). A host reads state with `survey`, which stores nothing (open question `261002-2128_*_should-a-second-run-no-op-plan-stay-a-later-operation-that-blocks-rollback.md`).
- **Base B** rolls back across activation. The first rollback binds `rollback.json`. An altered copy of it is `plan-file-changed`. Chunk 0 removes it with the plan files, and 35's replay answers without it. After cleanup, B records the legacy `end`, its replay, and the replays of apply 1 and verify.
- **Base C** rolls back two landed chunks. The rollback is refused after a host write, then completes down to chunk 0 and the legacy `end`.
