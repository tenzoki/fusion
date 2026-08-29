# `clear-halt` names the halt it discarded instead of printing success over it

**Agent:** coder
**Status:** Complete
**Date:** 2026-08-10
**Scope:** `hooks/clear-halt.ts`, `hooks/lib/__tests__/clear-halt-concurrent-halt.test.ts` (new), rebuilt `hooks/dist/`
**Record addressed:** `260809-2049_*_clear-halt-discards-a-halt-raised-between-its-load-and-its-save-and-tells-the-human-it-cleared.md`
**Not touched, on purpose:** `hooks/lib/escalation.ts` — the merge rule is the right default and stays as it is

---

## Reproduced first

Two levels, before any edit.

**Module level**, the reviewer's four lines against a temp workbench
(`loadEscalation` → second writer raises and saves → `clearHalt` + `saveEscalation`):

```
haltActive on disk after clear-halt's save: false
recentEvents on disk:
  [halt]  protected_path_measured: A halt — rules/a.md restored
  [halt]  protected_path_measured: D halt — rules/d.md restored
  [clear] halt_cleared: Halt mode cleared by human intervention

D's halt EVENT present: true
D's halt STATE present: false
```

The asymmetry the record names, confirmed: the record of the second halt is in
the file, the halt is not.

**Script level**, the compiled `dist/clear-halt.js` at HEAD `7f617b1`, spawned in
a throwaway project with the second halt injected between its load and its save
— exit **0**, and:

```
Halt active. Consecutive blocks: 3
Recent events:
  [halt] protected_path_measured: … rules/x.md restored

Halt cleared. Guard will resume normal operation.
```

Nothing on stderr. The injected violation named `rules/injected.md`, which the
human never saw. The same run in the other placement — the halt landing just
after the save, so the guard is genuinely halted afterwards — also exited 0 under
that same line, with `haltActive: true` on disk.

## What changed

`hooks/clear-halt.ts` only, after `saveEscalation` has returned. It re-reads the
state file, compares the halt-level events there against the ones it was
holding, and if anything arrived that it never showed the human it names it on
stderr and exits **2** instead of printing the success line. Nothing is
re-raised and nothing is refused: the clear the human asked for still happens,
and `consecutiveBlocks` is still reset.

Three decisions inside that are load-bearing:

- **Compared against the state as LOADED, not the five lines printed.** A halt
  event older than the last five was still on disk when the human asked for the
  clear, and belongs to the halt they were clearing. Reporting it would be a
  refusal with nothing behind it — the worse defect for a tool that runs when
  every write is already blocked. There is a case for exactly this.
- **A multiset, not a set difference.** Two halts can carry the same trigger,
  message and timestamp; treating the second as "already seen" would drop the
  one thing the check exists to surface. Events have no identity field and none
  was added — every mutation in `escalation.ts` is an append and no field is
  ever rewritten, so the recorded tuple is the identity.
- **The re-read cannot withdraw the confirmation.** It is wrapped like the
  `emitEvent` above it: a read that throws costs the check and prints a note, and
  the run still reports the clear it completed. An unreadable state file loads as
  the empty state, which reports nothing arrived — a check that cannot see is not
  evidence of a problem.

Also covered: a halt arriving *after* the save (`haltActive` still true at the
re-read). There the wording differs — the guard is still halted and the human is
told to run it again — because saying "not in effect either" would be false.

## Why not the merge

The record's reasoning, adopted unchanged. `escalation.ts:287` decides "newly
raised" against the halt the caller was shown, which is exactly right for the
caller `clear-halt` is; an unconditional OR resurrects the halt the user just
cleared, and there is a test pinning that. Telling the two halts apart needs an
identity the state does not carry. Reporting costs one file and no state-shape
change.

## Tests

`hooks/lib/__tests__/clear-halt-concurrent-halt.test.ts`, six cases, spawning the
real compiled script.

Both acceptance criteria are about what the human gets — which line is printed,
what the process exits with — and neither is observable from a function call:
`clear-halt.ts` is a top-level script with no exported entry point. So the cases
spawn `dist/clear-halt.js` and read stdout, stderr and the exit code.

The second writer is **injected, not raced**. The window is microseconds wide and
the script offers nothing to synchronise against, so a second process would
reproduce it on an unlucky run rather than every run. `dist/` is copied to a temp
directory with `lib/escalation.js` replaced by a shim that re-exports the real
module and raises a halt through it at a named point (`load` or `save`).
Everything the script runs is the shipped code; the state file and the merge are
real. This is the answer `escalation.test.ts` already gives for the module —
write the interleaving down instead of hoping for it — one level up.

Against a vacuous pass: each concurrent case asserts the injected event actually
reached the state file, so "the injection happened" is checked and not assumed.

| Case | Asserts |
|---|---|
| nothing concurrent | exit 0, the success line verbatim, `haltActive: false` |
| nothing halted | exit 0, "Guard is not halted in this project." |
| a halt on disk at load but too old to print | exit 0, the success line — the false-refusal guard |
| halt injected after the load | exit ≠ 0, no success line, the halt named on stderr, `haltActive: false` on disk |
| halt injected after the save | exit ≠ 0, no success line, "The guard is still halted.", `haltActive: true` |
| either concurrent case | `halt_cleared` on the record, `consecutiveBlocks: 0` — the job asked for still happened |

**Measured that the tests fail on the old code:** with `git show HEAD:hooks/clear-halt.ts`
swapped in and `dist` rebuilt, the two concurrent cases fail (`expected … not to
contain 'Halt cleared. Guard will resume normal operation.'`) and the three
ordinary-path cases pass — so those three encode the criterion that must not
move, not the fix.

## Verification

`cd hooks && npm test` — exit **0**, 39 files (38 at baseline plus this one),
1025 tests. The count moves run to run (1013 on the run before); that is the
known instability filed as `260810-0918`, so the exit code is what was read.

Nothing failed naming `bin/fusion-plane` or `fusion-count-sources.test.ts`, the
two files under concurrent edit.

## Left for the human

Not committed, and the issue file's marker is untouched — the user validates
first. `tasklist.md` entry 21 is also left `[ ] open` rather than ticked: two
other tasks are running against this workbench and a whole-file rewrite of the
shared queue from here could lose theirs.
