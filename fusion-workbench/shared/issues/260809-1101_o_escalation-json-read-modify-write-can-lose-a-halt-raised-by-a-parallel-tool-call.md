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
`shared/analyses/260809-1101-guard-support-layer.md` (finding 5);
`circles/260807-0923-guard-misst-statt-orakelt/decisions/260807-0945_o_integritaet-des-eskalationsspeichers.md`;
`rules/protected-path-discipline.md`.

---

**Reconciliation 260809-1651 (reconciler, domain `code`) — stays `_o_`. Untouched by the defect round.**
The six commits `451a07e..fb262d8` touch `hooks/tracker.ts`, `hooks/lib/protected-snapshot.ts`, `hooks/lib/git-branch-guard.ts` and the new `hooks/lib/reverted-copy.ts`. `hooks/lib/config.ts`, `hooks/lib/churn.ts`, `hooks/lib/cross-file.ts` and `hooks/lib/escalation.ts` are not in the diff, so every line this record cites still reads as filed and its acceptance criteria are unmet.
