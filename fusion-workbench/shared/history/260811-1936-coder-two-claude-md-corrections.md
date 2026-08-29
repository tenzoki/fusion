# Two `CLAUDE.md` corrections — tasks 7 and 28

**Agent:** coder
**Status:** Complete — edits landed; **result reported `blocked`**, because the project's test command exited non-zero (unrelated flakes, evidenced below).
**Started:** 260811-1936-coder-two-claude-md-corrections.md
**Finished:** 260811-2008
**Git HEAD at start:** `9f84254`
**Verification:** `cd hooks && npm test` — exit 1, twice, on flakes that differ per run and never read `CLAUDE.md` (detail below). The seven test files that do read `CLAUDE.md` — `npx vitest run` over them, 100 tests — exit 0.

---

## What was asked

Two queue entries, both correcting a false claim in `CLAUDE.md`, dispatched together because
they share the one file. File set: `CLAUDE.md` and nothing else. Three other executors were
running concurrently on `agents/orchestrator.md`, `hooks/lib/rules-write-exemption.ts` and
`hooks/lib/__tests__/commit-message-path.test.ts`.

## What landed

### Task 7 — `I:260811-1734a`, the churn-rank output contract

Source: `260811-1612_*_claude-md-is-the-fifth-surface-of-the-churn-rank-output-contract-and-was-left-on-the-old-one.md`,
under the parent `260811-1734_*_reduce-the-surface-so-a-claim-cannot-go-stale-in-several-places-at-once.md`.

Verified against `bin/fusion-churn-rank`'s own header before writing: five `KEY=value` lines
(`anchor=`, `entries=`, `absent=`, `noise=`, `ranked=`) and two read-path exclusions, not the
four keys and one exclusion the `CLAUDE.md` row claimed.

The row does **not** now carry the corrected list. Per the parent record it cites the helper's
header as the authoritative usage block and states plainly that it does not restate the keys or
the exit-code table, so a sixth surface cannot appear by someone updating this row in place of
the helper. What the row keeps is the *reason* the helper exists — the map never prunes, so two
classes of key stay in the map and out of the ranking, counted apart — which is behaviour, not
contract, and states no rival key list.

Measured after the edit, over `CLAUDE.md`, `README*.md`, `bin/`, `hooks/`, `agents/`, `skills/`
(excluding `dist/`, `node_modules/`, tests): the keys appear in `bin/fusion-churn-rank` (the
header) and `hooks/churn-rank.ts` (the producer's doc comment and the code emitting them), plus
`agents/orchestrator.md:126`, which is on the five-key contract already. One contract, not two.

### Task 28 — `I:260811-1345_*_claude-md-says-the-measurement-stands-down-on-cwd-and-it-has-asked-the-workbench-root-since-v6-0-1.md`, which root a stand-down asks

Source: `260811-1345_*_claude-md-says-the-measurement-stands-down-on-cwd-and-it-has-asked-the-workbench-root-since-v6-0-1.md`.

All three gates read at HEAD before writing the sentence, as the record insisted:

| Gate | Root it asks | Site |
|---|---|---|
| write-tool deny | `process.cwd()` | `hooks/guard.ts:405`, `isFusionPluginCwd()` |
| protected-path measurement | workbench root | `hooks/guard.ts:363` + `hooks/tracker.ts:492`, `measurementRoot()` → `isFusionPluginRoot(root)` |
| churn / event stand-down | workbench root | `hooks/tracker.ts:1160-1161`, `findWorkbenchRoot()` + `isFusionPluginRoot()` — moved there by `1d5eed6` |

So the write-tool deny is the only one still keyed to cwd. The troubleshooting row now says the
measurement asks the workbench root, points at the file's opening paragraph as the owner of the
split rather than restating it, and ends on what a halt here actually tells a debugger: the root
walked up to is not this repository, and nothing about cwd. No remaining claim in `CLAUDE.md`
about which root a stand-down asks contradicts another.

## Verification, and why the suite is not green

`cd hooks && npm test` exited **1** on both full runs, with a *different* pair of failures each
time and a third pair in an earlier run:

- run 1 — `lib/__tests__/record-counts-measurement.test.ts` (2 tests). Reads
  `agents/orchestrator.md`, which a concurrent executor had modified mid-run.
- run 2 — `lib/__tests__/fusion-commit-lock.test.ts`, `lib/__tests__/reference-resolution-lint.test.ts`.
  The lint reported `hooks/dist` and eleven files under it as missing from the tree; `hooks/dist`
  was present before and after. A concurrent `npm test` deletes and rebuilds `dist/`, and the lint
  read the tree mid-rebuild.
- run 3 — `lib/__tests__/fusion-commit-lock.test.ts`, `lib/__tests__/monitor-warnings-panel.test.ts`.

Every one of those files passes when run on its own against this working tree (both pairs
re-run, exit 0). None of them reads `CLAUDE.md`. The seven that do —
`session-start-subdirectory`, `derivable-enumerations-lint`, `rules-voice-profile`,
`rules-emission-golden`, `reference-resolution-lint`, `churn-key-anchor`,
`deliverable-language-lint` — pass together, 100 tests, exit 0.

The reading is that the full-suite red is load and concurrency between four executors sharing one
tree, not this change. It is a reading and not a proof: the only way to settle it is one full run
on a quiet tree, which was not available here. The orchestrator should re-run `npm test` after the
other three executors land and before committing.

## Files changed

- `/Users/k1/Projects/productive/fusion/CLAUDE.md`

## Records NOT closed, deliberately

No marker was renamed and no `tasklist.md` status was flipped. The executor report contract makes
`exit 0` the condition for `done`, and `npm test` exited 1; narrowing the command until it passes is
exactly what the contract forbids. So the transitions below are recommended, not performed, and the
orchestrator should make them after one full run on a quiet tree:

- `260811-1612_*_...` → `_c_`, with a `Resolved:` note (task 7, `I:260811-1734a`).
- `260811-1345_*_...` → `_c_`, with a `Resolved:` note (task 28, `I:260811-1345_*_claude-md-says-the-measurement-stands-down-on-cwd-and-it-has-asked-the-workbench-root-since-v6-0-1.md`).
- The parent `260811-1734` stays open either way: it closes per instance, and these are two of its
  instances.
