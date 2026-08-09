# coder — task 9, stop the churn and cross-file criticals latching

**Date:** 2026-08-09 20:23
**Task:** `I:260809-1101-latching` (queue task 9)
**Source:** `shared/issues/260809-1101_c_churn-and-cross-file-criticals-latch-permanently-and-never-reset.md`
**Decision:** `shared/decisions/260809-2004_a_should-the-latching-churn-and-cross-file-criticals-be-bounded-or-dropped.md`
**Status:** Complete

## What was done

The decision's answer is two-part, because the two counters were judged on what each is
used for. Churn keeps its lifetime number and loses only the comparison that latched;
cross-file goes entirely. Both halves landed together, because they share the tracker's
emit loop and the configuration files.

### Churn — the lifetime threshold comparison, and nothing else

`totalChanges` still increments and is still written to `churn.json`, because
`agents/orchestrator.md:113` and `skills/setup/SKILL.md:226` read it at Setup. What went is
the `totalChangesWarning` / `totalChangesCritical` pair and every surface that carried it,
which is what the decision's constraint on leaf-merged configuration requires: a key
removed from `hooks/config.json` alone would still be declarable in a project's own
`fusion-guard.json`, and the loader would keep honouring a threshold no code reads.

- `hooks/lib/churn.ts` — the total-level block in `analyzeChurn`, the two fields of
  `ChurnThresholds`, the two entries of `DEFAULT_THRESHOLDS`. The `ChurnThresholds`
  docstring now carries why the level is session-only, with the measurement (100% duty
  cycle over 21 days, 3,064 of 15,248 event lines) rather than a bare assertion, so the
  next reader does not restore it as an oversight.
- `hooks/lib/config.ts` — `GuardSettings["churn"]`, `DEFAULTS.churn`, the churn leaf-rule
  table, the `pickChurn` assembly.
- `hooks/config.json`, `hooks/config.example.json` — the two keys. The example's `churn`
  block gained a `_comment` saying there is deliberately no lifetime threshold, in the same
  place a reader would otherwise go looking for one.

The per-session pair is untouched. Measurement 5 of the decision found 0 files at
session-critical against 17 at lifetime-critical, so the level that survives is the one
that currently says nothing — which is the correct reading of a quiet session, not a
regression.

### Cross-file — removed outright

- Deleted: `hooks/lib/cross-file.ts` (226 lines), `hooks/lib/__tests__/cross-file.test.ts`
  (197 lines), `fusion-workbench/.guard-state/cross-file.json` (535 accumulated entries).
- `hooks/tracker.ts` — the import, the record-and-emit block that was the module's only
  consumer, and three comments that named it (the file header's numbered summary, the
  section banner, the config-load comment).
- `hooks/lib/events.ts` — `cross_file_warning` and `cross_file_critical` left
  `GuardEventType`.
- `hooks/lib/config.ts` — `GuardSettings["crossFile"]`, `RawConfig.crossFile`,
  `DEFAULTS.crossFile`, the `crossFile` leaf-rule table, `pickCrossFile`, and the `crossFile`
  block of the assembled value.
- `hooks/config.json`, `hooks/config.example.json` — the `crossFile` blocks.
- `bin/monitor` — the two event types left `WARNING_EVENT_TYPES`, both render branches left
  the level mapper (`Critical` and the `Cross-file` label), and four comments that used the
  four-event list as an example were re-counted to three.
- Docs: the `lib/cross-file.ts` row in the `README-hooks.md` file table (a lint checks that
  table against the tree, so the row had to go with the file), plus prose in
  `README-hooks.md` (Churn Detection, the state-file tree, the loosening table, the
  what-blocks paragraph), `README.md` (three places) and `CLAUDE.md` (the
  `.guard-state/{churn,cross-file,escalation}.json` list).

Two dead exports the investigation had already found went with it: `resetCrossFile`, which
never had a caller in the repository's history, and `getTopChurnFiles`, whose only caller
was its own test.

### Tests

- `churn.test.ts` — the `getTopChurnFiles` describe and the "returns critical at total
  critical threshold" case are gone; the remaining `analyzeChurn` cases share one
  session-only threshold constant. Three cases added, and they are the acceptance criteria
  rather than a restatement of the change: the shipped defaults still produce a session
  critical with nothing passed (the old lifetime pair lived in those defaults, so a
  careless deletion would have taken the session level with it); a file at 147 lifetime
  changes with a quiet session produces no warning at all, passed and unpassed thresholds
  alike; and that same file is reported again the moment its session count is hot, so the
  claim is "judged on now", not "exempt".
- `guard-state-shape.test.ts` — the six malformed-`cross-file.json` rows and the
  cross-file carry-forward case are gone; the churn rows and the repair case stay, rewritten
  for one state file. Its header records that cross-file carried the identical defect and
  the identical coverage until this removal.
- `monitor-warnings-panel.test.ts` — `cross_file_critical` left `RESCUED` and the two
  eviction fixtures, and the two level-mapper assertions went.
- `config.test.ts` — `crossFile` and the two `totalChanges*` keys left the
  before-step-6 fixture, the step-5 reimplementation, the leaf-walk case and the
  template-inheritance case.

**Result: `npm test` from `hooks/` — 34 files, 1127 tests, all passing.**

## The consequence that did not fit here

The decision's measurement 7 says the orchestrator's Setup read ranks
`hooks/lib/bash-mutation-guard.ts` first, a file deleted in v6.0.0, and calls it "the same
missing boundary seen from the reader's side". Measuring the whole file rather than its top
entry says otherwise: it is a second defect with its own cause.

`churn.json` holds 535 entries, of which 297 resolve to no file under any reading of the
key. The keys are not in one spelling — 229 are relative to `fusion-workbench/`, 149 are
absolute paths in this checkout, 120 are absolute paths in session scratchpads or `/tmp`,
37 are absolute paths under four other roots including another machine's home directory,
and **none** is relative to the repository root. The cause is in `hooks/tracker.ts`, which
normalises an absolute path against `process.cwd()` and stores it raw when the prefix does
not match, so the key is a function of where the session started rather than of the file.
`thrashingScore` then ranks on the lifetime total, every stale entry scores with
`session=0`, and the top six are all `session=0`.

Removing the lifetime *threshold* does not touch this: `totalChanges` and `thrashingScore`
were deliberately kept. Nor would a hand-prune of the file fix it — it would clear today's
ranking, regrow within days, and remove the evidence from the one surface where the defect
shows. The fix needs a decision with at least three parts (what the key should be anchored
to, what happens to the 535 existing entries, and whether an entry should be dropped when
its file disappears at all), which is not an executor's call.

Filed as
`shared/issues/260809-2023_o_the-churn-map-is-keyed-by-the-sessions-cwd-and-never-pruned-so-setups-thrashing-read-ranks-dead-paths.md`.

## Handoff

Not committed — the orchestrator commits under the commit lock. Two records are waiting on
that commit:

- The decision `260809-2004_a_…` still needs its `Implemented: <hash>` footer and the
  `_a_` → `_i_` rename. It was left rather than filled in with a path citation, because the
  hash is the better citation and it exists one step later.
- The source issue is already annotated and renamed to `_c_`; the queue entry for task 9 is
  marked done. Neither needed a hash.
