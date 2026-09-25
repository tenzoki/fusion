# Step 4 — remove churn and the cross-file counters: code, prompts and prose

**Date:** 2026-08-15
**Agent:** coder
**Status:** Complete
**Plan:** `260815-0029_*_plan-remove-eight-mechanisms-and-cap-growth.md` step 4
**Verification:** `cd hooks && npm test` — exit 0, 46 test files, 842 tests, 31 s

---

## What the churn heatmap was

A PostToolUse mechanism that counted every write-tool file mutation into
`fusion-workbench/.guard-state/churn.json`, keyed at the workbench root, and emitted
`churn_warning` / `churn_critical` events when a file crossed a per-session threshold. It never
blocked and nothing downstream acted on a warning: the monitor rendered the two events in its
warnings panel, and the orchestrator read a ranking of the map at Setup through
`bin/fusion-churn-rank` to name high-thrash files. Configured by two leaves,
`churn.changesPerSessionWarning` (5) and `churn.changesPerSessionCritical` (10), which no project
ever set — the leaves themselves are step 5's.

It carried a plugin-repo stand-down of its own, in `hooks/tracker.ts`'s `main`, asked of the
workbench root rather than of cwd, because its keys were anchored there. That stand-down is the
second half of what CLAUDE.md documents as "two parts of the guard self-disable here"; one part is
left.

## What was deleted

| File | Lines | Why |
|---|---|---|
| `hooks/lib/churn.ts` | 667 | the heatmap |
| `hooks/churn-rank.ts` | — | the ranking CLI |
| `bin/fusion-churn-rank` | — | its wrapper |
| `hooks/lib/__tests__/churn.test.ts` | — | subject gone |
| `hooks/lib/__tests__/churn-key-anchor.test.ts` | — | subject gone |

`hooks/dist/churn-rank.{js,d.ts}` and `hooks/dist/lib/churn.{js,d.ts}` were pruned by
`scripts/build.mjs`, which removes a `dist/` entry whose TypeScript source is absent at prune time.
They are named in the report's file list all the same: the tarball ships `hooks/dist/`, and an
unstaged deletion there would ship four dead modules.

## The surgical part — `hooks/tracker.ts`

The file carries four call sites and only churn's came out. What went: the `trackChurn` function
whole, its six imports from `lib/churn.js`, `loadConfig`, `matchesAny`, `isFusionPluginRoot`, and
the `answer` wrapper whose second argument was `trackChurn`. What stayed, structurally intact: the
state-drift call (step 11's), the review-coverage call and the staging-drift call.

Two consequences worth stating rather than leaving to be re-derived.

**The plugin-repo stand-down went with churn**, because churn was the whole of what it governed.
The three measurements were deliberately ordered ahead of it, so removing it changes nothing about
what they report — the early-return branch it guarded joined the same sentences the normal path
joins. `hooks/lib/self-detect.ts` keeps both entry points, and its header now says why
`isFusionPluginRoot` is kept without a caller: the rule about which coordinate space a stand-down
is evaluated in is what a future root-anchored mechanism needs, and a mechanism that has to invent
the root-anchored form for itself will get it wrong.

**`answer` became a plain `respond`.** Nothing runs after the tracker's reply any more. The
ordering rule that put the reply first is kept in the header as a rule rather than as a
description, because it is what issue `260809-2045_*_the-churn-half-still-runs-before-the-reply-so-any-failure-there-discards-the-protected-path-halt-sentence.md` was paid for and the next thing added after
`respond` would reintroduce it.

## The behaviour change one test caught

With churn gone, the tracker writes to `.guard-state/` **only when a measurement has something to
record**. An ordinary write in a project with no drift, no review file and no moved HEAD now
touches the directory not at all — churn used to write on every write-tool call whatever the
project's state.

`hook-fail-open.test.ts`'s "an unwritable `.guard-state/` does not cost a hook its verdict" case
was resting on that unconditional write: with the directory at mode `0555` and nothing to report,
nothing threw and the case asserted a marker that never arrived. It was re-pointed at a project
that *has* drifted (`prepare: freezeCommitCount`, added as a hook to `withUnwritableStateDir`), so
the throttle write is attempted and the case has its subject again. The other half was added as its
own case: a tracker with nothing to report writes nothing, so a read-only state directory is not an
error condition for it. That property is now pinned rather than incidental.

## Two test files whose probe had to move, and why neither was deleted

**`guard-state-shape.test.ts`.** Its subject is a state LOAD swallowing the tracker's reply, and
every row seeded `churn.json`. The subject survives: `measureStateDriftForModel` loads
`state-drift.json` on every guarded tool call, before it produces the sentence, through the same
coercion seam. Re-pointed there — the malformed rows, the repair case, and a carry-forward case
rewritten as two calls in one project (the second must stay quiet, which is the throttle being read
rather than emptied). The file's header records both re-pointings, because this is the second.

**`monitor-warnings-panel.test.ts`.** The panel survives its churn rows, as the plan states. What
needed care is that `churn_warning` was the filler these cases overflowed the WARNING class with,
and it was the only warning-class event that belonged to no carve-out. After the removal exactly two
do — `guard_block` and `guard_halt` — so the filler is now a `warningRow()` helper emitting
`guard_block`, and `RESCUED` drops to those two. The level-mapping case lost its `churn_critical`
row and gained rows for `state_drift` and for the amber default, which is now reachable only by an
event no arm names.

## `bin/monitor` — one panel, not two

The Circle record's wording invites removing two panels. There is one warnings panel and churn
reached it as two event types. Removed: `churn_warning` and `churn_critical` from
`WARNING_EVENT_TYPES`, the `churn_critical` level branch, and — after the branch went — the
`.warning-row.critical` CSS, which no arm can now set. Five comment passages that sized the panel's
budgets by churn's arrival rate were rewritten to name the events that are actually left; the
budgets themselves are unchanged.

## `skills/cadence/SKILL.md` was not touched

Its nine occurrences of "churn" are *themes by number of distinct sessions*, a cadence metric with
no relation to the guard's heatmap. `README-agents.md`'s one occurrence (`:244`) is the same
metric, in the cadence skill's table row, so that file needed no edit either despite being in the
step's file list.

## Gate-forced documentation

- `CLAUDE.md`: the `bin/fusion-churn-rank` Layout row deleted. Two gates assert it independently —
  `derivable-enumerations-lint.test.ts` re-derives the `bin/` roster from the tree, and
  `reference-resolution-lint` resolves the row's own path token. The step's own bullet used to
  claim the opposite; the correction pass fixed it against step 2's run.
- `README-hooks.md`: `lib/churn.ts` and `churn-rank.ts` rows out of the `hooks/lib` file table
  (exact set equality both ways), and the `churn-rank.ts` row's citation of `bin/fusion-churn-rank`
  went with it. The prose at `:27` that replaced the "Churn Detection" section had to name the
  ranking helper without spelling its path, for the same reason.
- `bin/fusion-source-root:61`'s header comment cited `bin/fusion-churn-rank` as the precedent for
  resolving its own sibling relative to itself. Re-pointed at `bin/fusion-state-drift`, which
  resolves the same way. Shell comment lines are scanned, so this was gate-forced.

## Prompt precedents that pointed at a deleted block

Four passages cited Setup Step 5's churn ranking as the precedent for their own `[ -x ]` guard.
Each was re-pointed at a guard that still exists — the source count in `agents/orchestrator.md`
(three sites: the turn budget at Setup, the review-coverage read, the drift check) and the domain
detection in `skills/setup/SKILL.md` (two sites). Leaving one citing the deleted block is the defect
the plan warns about at step 4 and it would have survived the suite.

## Not in this step

The four configuration files (`hooks/config.json`, `hooks/config.example.json`, `fusion-guard.json`,
`templates/fusion-guard.json`) are step 5, an `ontocoder` step. The `churn` container left
`hooks/lib/config.ts` here — the type, `DEFAULTS`, `CONTAINER_LEAF_RULES`, `pickChurn`, the result
object and the now-unused `isThreshold` — and the loader carries an unrecognised top-level key
through untouched and undiagnosed, so the intermediate state emits no advisory. `churn` was not
retired the way `guard.protectedPaths` was; the plan's negative instruction is followed.

`hooks/lib/guard-state-file.ts`'s `optionalTimestamp` lost its only caller with the heatmap and was
deleted with it, and `escalation.ts`'s comment explaining why it does *not* use that primitive was
rewritten to say where the primitive went.

## What the plan did not predict

Three churn references survive in files step 4's list does not name, none of them gate-forced:
`.gitignore:39` (`!bin/fusion-churn-rank`), `.claude-plugin/plugin.json:4` (the shipped description
still advertises churn detection) and `skills/help/SKILL.md:106` ("churn thresholds"). Filed as
`260815-1206_*_three-churn-references-survive-step-4-in-files-the-step-does-not-name.md`
rather than fixed, per the step's scope instruction. This is the ninth instance of the class the
correction pass found in eight of eleven steps.

## Golden fixture

`hooks/lib/__tests__/fixtures/rules-emission.golden` regenerated by the documented one-command
procedure. The only change is `fusion-workbench-conventions.md` shrinking 52 756 → 52 680 bytes, 76
bytes, propagated through every role total. **`RULE_BASELINE` was not re-cut** — a deletion is
neither of the two re-baselining events.
