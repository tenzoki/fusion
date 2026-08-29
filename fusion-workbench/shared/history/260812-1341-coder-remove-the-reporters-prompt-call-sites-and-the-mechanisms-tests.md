# Coder — steps 4 and 5 of the protected-path removal

**Date:** 2026-08-12 13:41
**Agent:** coder
**Status:** Complete
**Dispatched by:** orchestrator
**Plan:** `260812-1232_*_remove-the-protected-path-half-of-the-compliance-guard.md`, steps 4–5

---

## What was asked

The two prompt call sites of `bin/fusion-protected-paths` (step 4), and the deletion of the seven
test files whose subject is the mechanism plus the partial cuts in `paths.test.ts` and the harness
(step 5). No production file changes in either.

## Verification

`cd hooks && npm test` — exit 0.

| | Test files | Tests | Vitest duration | `npm test` wall clock |
|---|---|---|---|---|
| Baseline at `bae6f69` | 55 | 1356 | 72.13 s | 74.09 s |
| After steps 4–5 | 48 | 1001 | 56.28 s | 58.21 s |

Delta: −7 files, −355 cases, −15.9 s of wall clock. The `tests` figure — the summed parallel work
rather than the wall clock — fell from 523.03 s to 312.38 s, which is 210.7 s. Only 153.3 s of that
is the deleted files' own recorded time; the rest is the remaining files running faster in a less
contended pool, so the plan's "roughly 200 seconds of parallel test work" is right for the wrong
arithmetic and the honest attributable figure is the smaller one.

Per deleted file, from the baseline run: `rules-write-exemption` 160 cases / 0.05 s, `fs-locator` 25 /
0.59 s, `fusion-protected-paths` 14 / 3.89 s, `protected-snapshot-subdirectory` 4 / 7.50 s,
`guard-case-folding` 20 / 20.97 s, `protected-snapshot-integration` 39 / 49.07 s,
`guard-rules-write-integration` 85 / 71.24 s. Sum 347. `paths.test.ts` went 26 → 18. 347 + 8 = 355,
so every case in the delta is accounted for and nothing failed quietly into the count.

## Step 4 — the two prompt call sites

- `agents/orchestrator.md` — the "Effective protected paths" bullet, its `bash` block and its
  explanatory paragraph deleted from Setup Step 5 (was `:142-152`). The **guard halt check
  immediately above it survives**, unchanged: it reads `escalation.json` and warns on `haltActive`,
  which is what a project upgrading while halted needs and is not part of this removal.
- `skills/setup/SKILL.md:265` — the pointer bullet deleted. Its neighbours (guard check above,
  churn ranking below) are untouched.

**`CLAUDE.md` carries no `bin/fusion-protected-paths` row.** The plan's "if one is there" condition
is not met: the helper shipped in v7.4.0 and CLAUDE.md was never given a layout row for it. Its four
remaining protected-path mentions (`:13`, `:25`, `:26`, `:130`) are prose about the mechanism and
belong to step 9, which already lists them. Nothing in the tree cites
`bin/fusion-protected-paths` from a shipped text surface now — grepped across `agents/`, `skills/`,
`rules/`, `docs/`, `templates/`, `CLAUDE.md` and `README*.md`, zero hits. `reference-resolution-lint`
therefore has nothing to resolve against the file step 6 deletes.

## Step 5 — the deletions

Seven files deleted outright, as named:
`guard-case-folding`, `protected-snapshot-integration`, `protected-snapshot-subdirectory`,
`rules-write-exemption`, `fs-locator`, `fusion-protected-paths`, `guard-rules-write-integration`.

### `paths.test.ts` — partial, as directed

Removed: the `matchesAnyFolded` describe (7 cases) and the `canonicalise` case (1). Kept:
`globToRegex`, `matchesPattern`, `matchesAny`, `foldCase`, `collapseSegments`. Three comment edits
came with the cut, each because it pointed at something that no longer exists:

- the import list lost `matchesAnyFolded` and `canonicalise`;
- the case-folding section header cited `guard-case-folding.test.ts` as its end-to-end proof, and
  framed the fold as the protected list's problem. Rewritten to describe the fold itself;
- the `matchesAny` case at `:76` pointed at "`matchesAnyFolded` below". Rewritten. Its
  `FUSION_ALLOW_RULES_WRITE` sentence was left standing — the exemption is step 6's to remove, and
  pre-empting it here would have put a second hand on that file.
- the last describe was `collapseSegments and canonicalise — neither folds case` and is now
  `collapseSegments — does not fold case`, with the reason restated without the deleted function.

### The harness — the two seeds, and what was checked before removing anything

`rules/x.md` and `agents/coder.md` dropped from `SEED_FILES`, with the comment above them rewritten:
it described a protected grouping that is going.

**Every helper was grepped for other callers before being considered, and none was removed.** No
helper in `guard-harness.ts` exists only to build a protected-path payload — the harness never had a
`writeProtected()`-shaped function; the mechanism was reached through the ordinary `runWrite` /
`runBash` / `runTracker` path with a protected *path* as the operand, and those four are load-bearing
for the surviving suites (`runWrite` 5 callers, `runBash` 3, `runTracker` 6, `runGuard` 3). Checked
and kept, with caller counts measured after the deletion:

| Helper | Callers | Kept because |
|---|---|---|
| `withPluginProject` | 7 | the self-detect stand-down cases, which survive |
| `projectConfig` | 2 | writes a project `fusion-guard.json` — the step-2 probe needs it |
| `makeProject` / `withProject` | 5 / 12 | every suite |
| `freezeCommitCount`, `DRIFT_SENTENCE_MARKERS` | 2 each | the step-2 state-drift probe |
| `GOVERNED_CONFIG`, `GOVERNED_PATH`, `governedFiles`, `withGovernedProject` | 1–4 | the step-2 replacement probe |
| `readEscalation`, `readEvents`, `childEnv`, `CASE_TIMEOUT` | 5–13 | every suite |
| `sessionStartEntry`, `GuardResult`, `TrackerResult`, `SessionStartResult`, `EventLine`, `GOVERNED_CATEGORY`, `UNGOVERNED_PATH` | 0 external, all used inside the harness | exported types and internals, not dead |

### Three things noticed and deliberately not done

1. **`runGovernedWrite` (`guard-harness.ts:629`) has no caller anywhere**, and had none at `bae6f69`
   either — verified with `git grep` against that commit. It is a step-2 leftover, not a
   protected-path helper, so removing it is not this step's business; it should go with the harness's
   next edit.
2. **`rules/retired/.keep` and `.claude/rules/local.md` are now unused seeds.** No surviving case
   reads either. They were the exemption suite's operands. The plan named two seeds and I dropped
   exactly those two; these two are flagged in a comment in the file and are candidates for step 6.
3. **`guard-bash-integration.test.ts:302` says "the fixtures are going".** They have gone. The file
   is not on step 5's list and the sentence is stale in tense only, so it was left alone rather than
   putting a second hand on a step-2 file.

## What the plan got wrong, confirmed

The previous executor's correction holds and mattered. Step 5 is **not** green by construction: the
suite was run, and it would have gone red at `guard-bash-integration.test.ts` had that file not
already been re-pointed onto `notes.txt` in step 2. Nothing else in the tree writes to the two
dropped seeds — grepped for `rules/x.md`, `agents/coder.md`, `rules/retired` and
`.claude/rules/local` across all remaining test files before the deletion; every remaining mention is
a string literal in an event payload, a lint fixture, or a comment, and none is a filesystem write
into a harness project.

No new dependency was discovered. Nothing outside the deleted files went red.

## Not done

Step 6 and beyond, as dispatched. No commit — the orchestrator commits.
