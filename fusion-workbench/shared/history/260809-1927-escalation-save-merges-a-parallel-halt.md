# Session: the escalation save stops writing over a halt raised beside it

**Date:** 2026-08-09 19:27
**Agent:** coder
**Status:** Complete

## What was asked

Task 7 of `fusion-workbench/tasklist.md` (`I:260809-1101-escalation`), from
`shared/issues/260809-1101_*_escalation-json-read-modify-write-can-lose-a-halt-raised-by-a-parallel-tool-call.md`.
`escalation.json` is loaded, mutated in memory and written back through an atomic
rename with no lock. The rename prevents a torn file; it does not prevent a lost
update, because the save serialises the whole state object the caller is holding, so
every write is a full replacement. `hooks/guard.ts` holds that object across the entire
PreToolUse decision, and `hooks/tracker.ts` loads, calls `raiseHalt` and saves inside
that window whenever the measurement finds a protected path changed. The guard's allow
path then writes `haltActive: false` back over it.

Three candidates were on the table, none obviously right: merge on save, a separate
file for the halt flag, or the advisory lock `bin/fusion-commit-lock` already
implements.

## What was done

### The merge, candidate 1

`hooks/lib/escalation.ts`. `saveEscalation` re-reads the file and writes the caller's
object on top of what it finds, keeping two things the caller could not know about:

```ts
haltActive: state.haltActive || (onDisk.haltActive && !baseline.haltActive),
recentEvents: [
  ...onDisk.recentEvents,
  ...state.recentEvents.slice(baseline.eventCount),
].slice(-MAX_RECENT_EVENTS),
```

The halt test is "newly raised", not "raised". An unconditional OR would have been
monotonic in the sense the record suggested and would also have resurrected the halt
`clear-halt.ts` had just cleared — that caller loads a halt and deliberately writes
`false`. The events need no identity to merge because every mutation in the module is
an append: the disk list is the trunk, this caller's events since its own load go on
top. Without them the adopted halt would arrive with no entry explaining it, which is
the second half of the loss the record names.

The baseline — the halt the caller was shown and the length of its event list at load
time — lives in a `WeakMap` keyed on the state object. No call site changes and nothing
is added to the serialised shape. A hand-built state has no entry and is read as
"loaded from an empty file, not halted", so both defaults fail toward keeping what is
already recorded. After a save the caller's object is updated to what was written, so a
second save from the same object appends only what was pushed after the first.

`consecutiveBlocks` and `lastBlockTimestamp` stay last-writer-wins. A lost increment
costs counter accuracy — the threshold halt arrives one block later than it might have
— where a lost `haltActive` costs a halt that was correctly raised. That is the same
trade `hooks/lib/churn.ts` and `hooks/lib/cross-file.ts` make with the same shape, and
neither was touched.

### Escalation joined the state-file seam

The merge has to READ the file at save time, and a private reader beside
`hooks/lib/guard-state-file.ts` would have been a second copy of exactly what that
module exists to end. So `escalation.ts` moved onto `loadGuardState`/`saveGuardState`
and dropped its own path resolution and atomic write. `coerceState` stays its own —
the merge does not generalise to the other two state files — and now reuses the seam's
`isStateObject` and `nonNegativeCount`, which are identical to the checks it already
carried. `lastBlockTimestamp` is deliberately NOT tightened to `optionalTimestamp`:
nothing computes anything from it, so that would be a behaviour change with no defect
behind it. The seam's header note recording escalation as deliberately left out is
corrected, and a comment in `escalation.ts` still naming the deleted
`getEscalationPaths` is repointed.

### The test simulates the order, not a race

`hooks/lib/__tests__/escalation.test.ts`, describe "saveEscalation against a second
writer", six cases. Two processes are what makes the window happen in the wild; the
ORDER is what makes it a defect, and the order can be written down. Each case performs
both callers' steps in one process in the sequence that loses the halt — guard loads,
the measurement loads/raises/saves, guard saves the object it has been holding — so it
fails on the old code every run rather than on an unlucky one. No sleep, no child
process, no retry.

The cases run in a temp project with its own `.fusion-setup` marker and a `chdir` into
it. This repository has a workbench directly above `hooks/`, so a test that called
`saveEscalation` where it stands would write the developer's live halt state. Vitest 2
runs test files in forked processes, where `chdir` is available and scoped to the
worker; `afterEach` restores it.

Measured against the previous blind save (reverted in place, rebuilt, run): three of
the six cases fail — the halt, the two writers' events, and the trim over a merged
list. The other three are regression guards that pass either way, which is what they
are for.

## Calibration

`speculation:` unchanged and not promoted. The read-modify-write shape is verified by
reading. The interleaving is not measured and the frequency it depends on is unknown —
the hook payload carries no per-call correlation key, and reproducing it needs two
concurrent guarded tool calls. The fix is cheap enough not to need the frequency.

The merge shrinks the window rather than closing it. A halt raised between the re-read
and the rename is still lost; what changes is that the window falls from the whole
PreToolUse decision to those two calls. Only the lock closes it completely, and it was
declined rather than overlooked — serialising every guarded tool call and owning a
stale-lock story is a poor trade for the remaining microseconds on a surface where
contention is the rare case. Candidate 2, a separate file for the halt flag, was
declined for a smaller reason: it keeps `haltActive` safe and still loses the
`recentEvents` entry that explains it, so the event merge would have been needed anyway.

## How it sits with the open decision

`circles/260807-0923-guard-misst-statt-orakelt/decisions/260807-0945_*_integritaet-des-eskalationsspeichers.md`
stays open and is not answered here. It asks how the store survives an agent that
deliberately clears it — an adversary, where this was an accident — and none of its four
options is foreclosed: the merge asks `guard-state-file.ts` where the file is, so moving
the state (option 1) changes one resolver and not the merge; the assumption that every
mutation is an append is the same one the event-stream reading (option 3) builds on; the
waiver (option 4) is untouched. One point carries forward to whoever answers it: the
merge adopts content it finds on disk, so under an adversary a forged file's events ride
into the next write — but it never LOWERS a halt it finds there, only raises one, so the
direction an adversary wants is not helped, and a signing scheme (option 2) would verify
at the re-read exactly where it verifies at the load.

## Files changed

- `hooks/lib/escalation.ts` — the merge, the load baseline, the move onto the seam
- `hooks/lib/guard-state-file.ts` — header note corrected (escalation is no longer the
  module held back from this seam)
- `hooks/lib/__tests__/escalation.test.ts` — the six interleaving cases
- `hooks/dist/**` — rebuilt (compiled hooks are committed)
- `fusion-workbench/shared/issues/260809-1101_p_…` — resolution note appended; marker
  left at `_p_` as the dispatch instructed
- `fusion-workbench/tasklist.md` — task 7 status

No change to `hooks/guard.ts`, `hooks/tracker.ts` or `hooks/clear-halt.ts`: the fix is
entirely behind the two functions they already call. `hooks/config.json` untouched
(task 8 owns it).

## Verification

`npm run build && vitest run` from `hooks/`: 1151 tests, 35 files, all green.
