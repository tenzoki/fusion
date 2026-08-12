# Coder — steps 1, 2 and 3 of the protected-path removal

**Date:** 2026-08-12 13:10
**Agent:** coder
**Status:** Complete
**Dispatched by:** orchestrator
**Plan:** `shared/planning/260812-1232_p_remove-the-protected-path-half-of-the-compliance-guard.md`, steps 1–3

---

## What was asked

The three test-side steps of the removal plan, as one dispatch: pin the legacy-halt migration path
before anything moves, re-point the six suites whose deny probe was a protected path, and carve the
surviving project-configuration coverage out of the heaviest file in the suite before step 5 deletes
what remains of it. No production file changes in any of the three.

## Verification

`cd hooks && npm test` — exit 0.

| | Test files | Tests |
|---|---|---|
| Baseline at `a3d8a5f` | 53 | 1363 |
| After steps 1–3 | 55 | 1356 |

The delta is `+6` (the new legacy-halt file), `−1` (a duplicate merged in `hook-fail-open.test.ts`),
`−26` (carved out of `guard-rules-write-integration.test.ts`) and `+14` (the new project-config file).

## What the steps were for, measured

The plan's shape rests on one number: with `guard.protectedPaths` emptied, 11 files and 153 cases
failed, and six of those files were not about protected paths at all. Re-measured after these three
steps, against the same emptied list:

| | Files failing | Cases failing |
|---|---|---|
| Before | 11 | 153 |
| After | 6 | 106 |

Five of the six remaining files are deleted outright by step 5 — `guard-case-folding`,
`guard-rules-write-integration`, `protected-snapshot-integration`, `protected-snapshot-subdirectory`,
`fusion-protected-paths`. The sixth is `config.test.ts`, whose three remaining failures are exactly
the cases step 7 removes with the fields they name (the shipped list, the rule roots the flag
exempts, and `projectDeclaredProtectedPaths`). Nothing that survives the removal still depends on the
protected list. That was the whole purpose of step 2, and it is now a measurement rather than an
expectation.

## Step 1 — the migration guarantee

New: `hooks/lib/__tests__/legacy-halt-clearing.test.ts`, 6 cases.

A consuming project can upgrade while halted, carrying a state file written by code that will no
longer exist. Two triggers no surviving path can produce — `protected_path_measured` from the
tracker's outright halt, `protected_path` from the guard's CHECK 2 — are seeded into
`escalation.json`, and each is driven through the full route: the guard loads it, blocks a write tool
at CHECK 1, `clear-halt.js` clears it and reports success, and the write goes through afterwards.

The block message is asserted as the whole command, `cd <project-root> && node
<plugin-root>/hooks/dist/clear-halt.js`, not as a substring naming the script. The `cd` is
load-bearing: run from anywhere else the script finds no workbench and reports success about a project
it never opened. `CLAUDE_PLUGIN_ROOT` is passed to the child explicitly so the expected string is
exact on every machine rather than weakened to a substring to survive both.

One case asserts the legacy trigger reaches the human's screen. `coerceState` does not validate the
elements of `recentEvents`, and a later tightening that rejected unknown triggers would blank the one
explanation a migrating user has for why their project is halted.

## Step 2 — the six probes

The probe is now the decision-governed deny (CHECK 3), armed from the throwaway project's own
`fusion-guard.json` and packaged in the harness as `GOVERNED_CONFIG` / `GOVERNED_PATH` /
`withGovernedProject`. Two properties make it a drop-in: it runs through the same `recordBlock`, so
every counter and threshold case is unchanged, and `src/api/service.ts` is matched by no protected
pattern, so no re-pointed case can pass for the protected-path reason by accident.

- **`guard-escalation-shape.test.ts`** (12) — all nine deny rows re-pointed. Subject unchanged: a
  shape-valid but wrong `escalation.json` must not make the guard fail open.
- **`guard-state-shape.test.ts`** (9) — see the judgement call below.
- **`hook-fail-open.test.ts`** (17 → 16) — see the merge below.
- **`guard-bash-integration.test.ts`** (15) — the precondition, the write-path deny, the macOS
  realpath trap, the post-block innocuous-Bash run and both halves of the self-detect stand-down. The
  trap and the stand-down cases were not among the four that fail on an emptied list, because both
  assert an ALLOW and would have passed vacuously; they are re-pointed for that reason rather than to
  keep the suite green.
- **`guard-halt-event.test.ts`** (3) — the threshold case now uses three siblings under the one
  governing glob, so the `file` field of each row stays distinct.
- **`config.test.ts`** (85) — twelve of the fifteen measured failures re-pointed; three left for
  step 7 as the plan directs.

### The judgement call in `guard-state-shape.test.ts`: state drift, and why

The plan named session-state drift first and review coverage as the fallback if drift proved awkward
to trigger in the harness. **State drift was chosen and it was not awkward.** The reason is recorded
in the file's own header, and in `freezeCommitCount` in the harness: of the three surviving tracker
reports, drift is the only one that fires on every guarded tool call. Review coverage needs the
payload itself to be a `.md` file under a `reviews/` store with a session window to measure against;
staging drift needs HEAD to have moved since the previous call. Either would have coupled these rows
to a second trigger that has nothing to do with `churn.json`, and the payload constraint would have
forced every case off the ordinary `notes.txt` edit the defect was measured on.

The fixture is six lines of `agentstate.yaml` and three commits — three, because the measurement
allows a difference of one as the commit in flight. It went into the harness rather than into the
test file because a second suite needed it in the same step.

### The one case merged rather than re-pointed

`hook-fail-open.test.ts` carried two cases that differed only in which check produced the deny: CHECK
2 with the state directory unwritable, and CHECK 3 with the state directory unwritable. Same failing
writer, same verdict, same site. Re-pointing the first would have produced a verbatim duplicate of the
second, so it was merged: the CHECK 3 case inherited the `260809-1825` citation and a comment saying
what collapsed into it. Net one case fewer, no site left uncovered.

### `config.test.ts` needed a new fixture, not just a new path

Twelve of the fifteen cases distinguished "inherited from the plugin layer" from "fell through to
DEFAULTS", and `guard.protectedPaths` was the ONLY leaf where the shipped `hooks/config.json` supplied
that difference — eight patterns against an empty default. Once it goes, the shipped file agrees with
`DEFAULTS` everywhere, and those cases would keep passing while distinguishing nothing.

They now load against `DISTINGUISHING_PLUGIN`, a synthetic plugin layer declaring three leaves that
each disagree with their default (`defaultSensitivity: "high"`, `categoryPaths: {onto: […]}`,
`blocksBeforeHalt: 9`). The wrong-type table moved from `protectedPaths` to `categoryPaths` with its
four spellings unchanged, because the rule it demonstrates belongs to the leaf walk and not to that
leaf.

## Step 3 — the carve

New: `hooks/lib/__tests__/guard-project-config-integration.test.ts`, 14 cases.
`guard-rules-write-integration.test.ts`: 111 → 85 cases, 119.8 s → 48.7 s.

The plan's line numbers were checked against the file as it stands and were exact: `:47`, `:1713`,
`:1819`, `:2141`.

What moved is what survives: the harness capabilities the three describes depend on, the unparseable
project file reported rather than swallowed, the `guard.enabled` refusal and its stated cost, the two
`blocksBeforeHalt` cases, and the plugin-repo case's surviving half. Cases whose subject WAS the
protected list — the self-protection floor, a project narrowing or emptying the list, a wrong-typed
`protectedPaths` inherited past — had no probe to re-point and stayed behind to be deleted with the
mechanism.

Two cases were dropped rather than moved, both because re-pointing would have duplicated coverage that
already exists: a halted guard blocking a write, and the write guard standing down in the plugin's own
repository. The plugin-repo describe kept the half nothing else asserts — the configuration LOAD is
not stood down there, only the verdict is.

## What the plan got wrong about the current tree

Three things, all small, all recorded here rather than left to be met later.

1. **Step 5 is not "green by construction".** It drops the `rules/x.md` and `agents/coder.md` seed
   fixtures from the harness, and `guard-bash-integration.test.ts` — a step 2 file, not a step 5 one —
   built its git fixture by writing to both. Fixed here: that describe reverts `notes.txt` instead,
   which is seeded, tracked and guarded by nothing. Anything else outside step 5's file list that
   writes to those two seeds will still break at step 5; nothing else in the suite does today.
2. **`hook-fail-open.test.ts` loses a case rather than keeping seventeen.** The plan counted two
   protected-path cases in it and expected both to be re-pointed. One of them collapses into its
   neighbour, as above.
3. **`config.test.ts`'s fifteen failures are not fifteen "fixture cases".** Three of them are cases
   about the fields step 7 deletes, and the plan's own instruction to leave those untouched contradicts
   its count. Twelve were re-pointed; the three remaining are the ones step 7 already plans to delete.

## Not done

Steps 4 and beyond, as dispatched. No commit — the orchestrator commits.
