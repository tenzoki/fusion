# clear-halt discards a halt raised between its load and its save, and tells the human it cleared

---

**Severity:** Low — a narrow window, a human-initiated act, and the next measured change re-raises the halt; but the tool reports success for a halt it never saw
**Domain:** code
**Filed by:** coderev (incremental review of `6b94e17..HEAD`)
**Affects:** `hooks/lib/escalation.ts:287` (`haltActive: state.haltActive || (onDisk.haltActive && !baseline.haltActive)`), reached from `hooks/clear-halt.ts:87-88`
**Cross-references:**
`fusion-workbench/shared/issues/260809-1101_c_escalation-json-read-modify-write-can-lose-a-halt-raised-by-a-parallel-tool-call.md` (the record `5f2cd56` closes),
`hooks/lib/escalation.ts:236-242` (where the trade is stated)

---

## What is wrong

The merge adopts a halt found on disk only when it is *newly* raised — that is,
when the caller did not already see one. The docstring gives the reason and it
is right for the case it names: a caller that loaded a halt and is writing
`false` is `clear-halt.ts`, and an unconditional OR would resurrect the halt the
user just cleared.

The test cannot tell that case from a different one. When `clear-halt` loads a
halt **and** the measurement raises a second, unrelated halt between that load
and the save, `baseline.haltActive` is true, so the newly-raised halt is not
adopted and is written away. The human is then told "Halt cleared. Guard will
resume normal operation." for a protected-path violation that happened while
they were reading the output — and which they never saw named.

## Measured

Direct exercise of the module against a temp workbench:

```
C = loadEscalation()            # sees the halt the human came to clear
D = loadEscalation()
raiseHalt(D, "protected_path_measured", "D halt"); saveEscalation(D)
clearHalt(C); saveEscalation(C)
→ haltActive: false             # D's halt is gone
```

D's `recentEvents` entry survives the merge — the event list is append-merged
correctly — so the record of the halt is in the file while the halt itself is
not. That asymmetry is what makes the outcome hard to notice afterwards.

The three other cases in the same exercise behave as documented: a halt raised
concurrently with a `guard.ts` save survives; events are neither duplicated nor
lost under the 10-entry trim; a second save from the same object appends only
what was pushed after the first.

## Suggested direction

Not a merge change — the current rule is the right default. The cheap fix is in
`clear-halt.ts`: after `saveEscalation` returns, compare the events now on disk
against the ones it printed, and if a `halt`-level entry arrived that the human
did not see, say so and exit non-zero rather than printing the success line. A
tool reporting normal operation while a halt it never showed was discarded is
the same failure class `260805-1134` closed for this script.

A narrower alternative: have `clear-halt` re-read and refuse when the disk halt
is not the one it loaded. That needs a halt identity the state does not carry
today, so it is the more expensive of the two.

## Acceptance criteria

- [ ] A halt raised between `clear-halt`'s load and its save is either preserved
      or reported, never silently dropped with a success line.
- [ ] The ordinary path — nothing concurrent — still prints
      "Halt cleared. Guard will resume normal operation." and exits 0.

---
Resolved: e39b3fe — clear-halt re-reads the state after saving and compares the halt-level events there against the ones it was holding; anything it never showed is named on stderr and the run exits 2 instead of printing success. The merge rule in escalation.ts is untouched, as this record argues it should be.

Reproduced before the change at 7f617b1, at module level and by spawning the compiled script with the second halt injected between its load and its save: exit 0, empty stderr, success line printed. After: exit 2, no success line, the halt named with its file.

Both acceptance criteria met. Three guards were added against the worse defect of refusing where it currently succeeds: the comparison is against the state as loaded rather than the five lines printed, the re-read is wrapped so a throw costs the check and not the clear, and nothing is re-raised or refused.
