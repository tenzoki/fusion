The escalation state's read-modify-write can lose a halt raised by a parallel tool call

---

`escalation.json` is loaded, mutated in memory and written back with an atomic
rename, with no lock. The rename prevents a torn file. It does not prevent a
lost update. A halt raised by `hooks/tracker.ts:343` between another call's load
at `hooks/guard.ts:587` and its save at `hooks/guard.ts:771` is overwritten with
`haltActive: false`.

---

Context.

`saveEscalation` (`hooks/lib/escalation.ts:186-201`) writes a temp file and
renames it, which makes each write atomic against a reader. It serialises the
whole `EscalationState` object the caller is holding, so the write is a full
replacement of the file, not a field update.

`hooks/guard.ts` holds that object across the entire PreToolUse decision. It
loads at `hooks/guard.ts:587`, and the allow path saves at `hooks/guard.ts:771`
after `resetBlockCounter`. Everything between those two lines is time in which
another process can have written a different state.

The writer that matters is the measurement. `hooks/tracker.ts:335-343` loads the
state, calls `raiseHalt` (`hooks/lib/escalation.ts:273-289`), and saves. That is
the halt raised when a protected path was actually changed, and
`rules/protected-path-discipline.md:48` describes it as the outright halt that
does not wait for a threshold.

`speculation:` the interleaving. Two tool calls running concurrently, call A a
write tool that will be allowed and call B whatever changed a protected path:

    B (PostToolUse) loads state, raises halt, saves    haltActive: true
    A (PreToolUse)  loaded state earlier               haltActive: false in hand
    A               allow path saves its object        haltActive: false on disk

The halt is gone, its `recentEvents` entry with it, and the `guard_halt` event at
`hooks/tracker.ts:344` remains in the log describing a halt that is no longer
recorded. The shape of the read-modify-write is verified by reading; the
interleaving is not measured, because Claude Code exposes no per-call
correlation key in the hook payload and reproducing it needs two concurrent
tool calls.

`hooks/tracker.ts:272-280` already records the parallel-call residual for
`protected-snapshot.json` and states it as under-reporting rather than a wrong
revert. That reasoning does not extend to `escalation.json`, where the exposure
is the opposite: the halt was correct and is erased.

The same read-modify-write shape applies to `churn.json`
(`hooks/lib/churn.ts:87-96`) and `cross-file.json`
(`hooks/lib/cross-file.ts:101-108`), where a lost update costs only counter
accuracy.

This is distinct from decision `260807-0945_o`, which asks how the escalation
store survives an agent that deliberately deletes it. This is accidental loss
under ordinary concurrent operation, with no adversary.

---

Severity: Medium, and conditional on how often Claude Code runs guarded tool
calls in parallel, which is not measured here.

Fix direction: three candidates, none obviously right. Re-read the state
immediately before saving and merge the halt flag rather than replacing it;
or make the halt flag its own file, so the two writers never share one document;
or take the same advisory lock `bin/fusion-commit-lock` already implements. The
first is the smallest and would need `haltActive` treated as monotonic within a
call, which matches how `coerceState` already leans (`hooks/lib/escalation.ts:96-101`).

Cross-references:
`260809-1101-guard-support-layer.md` (finding 5);
`260807-0945_*_integritaet-des-eskalationsspeichers.md`;
`rules/protected-path-discipline.md`.

---

**Reconciliation 260809-1651-reconciliation.md (reconciler, domain `code`) — stays `_o_`. Untouched by the defect round.**
The six commits `451a07e..fb262d8` touch `hooks/tracker.ts`, `hooks/lib/protected-snapshot.ts`, `hooks/lib/git-branch-guard.ts` and the new `hooks/lib/reverted-copy.ts`. `hooks/lib/config.ts`, `hooks/lib/churn.ts`, `hooks/lib/cross-file.ts` and `hooks/lib/escalation.ts` are not in the diff, so every line this record cites still reads as filed and its acceptance criteria are unmet.

---

Resolved 260809-1927-escalation-save-merges-a-parallel-halt.md (coder): the first of the three candidates — the save re-reads
the file and merges, rather than replacing it. `saveEscalation` in
`hooks/lib/escalation.ts` now loads the current file, writes the caller's object on
top of it, and keeps two things the caller could not know about:

- a halt that appeared on disk **after** this state was loaded. The test is "newly
  raised", not "raised": `haltActive || (onDisk.haltActive && !baseline.haltActive)`.
  An unconditional OR would have been monotonic in the sense the record suggested and
  would also have resurrected the halt `clear-halt.ts` had just cleared, since that
  caller loads a halt and deliberately writes `false`.
- the events another writer appended. Every mutation in the module is an append, so
  the merge needs no event identity: the disk list is the trunk and this caller's
  events since its own load are re-applied on top, then trimmed to the same ten.
  Without this the adopted halt would have arrived with no entry explaining it, which
  is the second half of the loss this record names.

What the caller held at load time is recorded in a `WeakMap` keyed on the state object
— the halt it was shown and the length of its event list. That keeps every call site
unchanged and adds nothing to the serialised shape. A state object that never came from
`loadEscalation` has no entry and is read as "loaded from an empty file, not halted",
so both defaults fail toward keeping what is already recorded. After a save the
caller's object is updated to what was written, so a second save from the same object
appends only what was pushed after the first, and the state in hand cannot silently
disagree with the file.

Nothing re-decides the tool call in flight. A guard that discovers an adopted halt at
save time has already allowed that call; the halt takes effect on the next one, where
CHECK 1 reads it. Widening the fix to reverse a verdict already reached would have
been a different change with its own decision behind it.

`consecutiveBlocks` and `lastBlockTimestamp` stay last-writer-wins, deliberately and
by the same argument this record makes for `churn.json` and `cross-file.json`: a lost
increment costs counter accuracy — the threshold halt arrives one block later than it
might have — where a lost `haltActive` costs a halt that was correctly raised. Neither
`hooks/lib/churn.ts` nor `hooks/lib/cross-file.ts` was touched.

The save had to read the file back, and a private reader beside the one in
`hooks/lib/guard-state-file.ts` would have been a second copy of exactly what that
module exists to end — so `escalation.ts` joined the seam at the same time.
`loadEscalation`/`saveEscalation` are now `loadGuardState`/`saveGuardState` plus the
merge; `coerceState` stays escalation's own (the merge does not generalise to the other
two files) and reuses the seam's `isStateObject` and `nonNegativeCount`, which are
identical to the checks it already carried. `lastBlockTimestamp` is NOT tightened to
the seam's `optionalTimestamp`: nothing computes anything from it, so that would be a
behaviour change with no defect behind it. The header note in `guard-state-file.ts`
that recorded escalation as deliberately left out is corrected.

Test, deterministic by construction rather than by timing:
`hooks/lib/__tests__/escalation.test.ts`, describe "saveEscalation against a second
writer". Each case performs both callers' steps in one process in the order that loses
the halt — guard loads, the measurement loads/raises/saves, guard saves the object it
has been holding — in a temp project with its own `.fusion-setup` marker and a `chdir`
(this repository has a workbench directly above `hooks/`, so a test that saved where it
stands would write the developer's live halt state). Measured against the previous
blind save: three of the six cases fail, the other three are regression guards that
pass either way. Full suite: 1151 tests, 35 files, green.

`speculation:` unchanged and not promoted. The read-modify-write shape was verified by
reading; the interleaving was not measured, and the frequency it depends on is still
unknown — the hook payload carries no per-call correlation key. The fix is cheap
enough not to need the frequency, and nothing above should be read as evidence that
the order has been observed in the wild.

What this shrinks rather than closes, stated plainly: the re-read and the rename are
two operations, so a halt raised between them is still lost. The window falls from the
whole PreToolUse decision — every check, every config read, every path match — to those
two calls. Only the third candidate, the lock, closes it completely, and it was declined
rather than overlooked: taking `bin/fusion-commit-lock`'s advisory lock around every
guarded tool call serialises the guard and imports a stale-lock story for a surface
where contention is the rare case, not the normal one. It stays available if the
remaining window is ever measured to matter. The second candidate, a separate file for
the halt flag, was declined for a smaller reason — it would have kept `haltActive`
safe and still lost the `recentEvents` entry that explains it, so the event merge would
have been needed anyway.

Sits with `260807-0945_*_integritaet-des-eskalationsspeichers.md`
without conflict, and that decision stays open. It asks a different question — how the
store survives an agent that deliberately clears it — and none of its four options is
foreclosed here: the merge asks `guard-state-file.ts` where the file is, so moving the
state (option 1) changes one resolver and not the merge; its assumption that every
mutation is an append is the same assumption the event-stream reading (option 3) builds
on; and the waiver (option 4) is untouched. One point is worth carrying forward to
whoever answers it. The merge now adopts content it finds on disk, which under an
adversary means a forged file's events ride into the next write — but it never LOWERS a
halt it finds there, only raises one, so the direction an adversary wants is not helped,
and a signing scheme (option 2) would verify at the re-read exactly where it verifies at
the load.
