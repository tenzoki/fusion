# clear-halt: the "still halted, nothing arrived" branch says what it measured

**Agent:** coder
**Status:** Complete
**Source:** `shared/issues/260810-1032_o_clear-halts-still-halted-with-nothing-arrived-branch-points-the-human-at-a-list-it-never-printed.md`
**Follows:** `e39b3fe` (the post-clear re-read), reviewed in `7f617b1..7ddacbc`

---

## The decision: keep the branch, fix the message

The reviewer left the choice open — dead code, or a real defensive case with wrong
text. I kept it, and the reason is not that a hand edit is likely.

`stillHalted` is a measurement of the state file taken after the save. It answers
"is the guard halted right now", which is the question the human's next write will
also ask. `arrived` answers a different question: "did a halt event land that this
run never showed you". Dropping `|| stillHalted` from the condition would print
`Halt cleared. Guard will resume normal operation.` over a file that says
`haltActive: true` — which is precisely the failure class the header of
`clear-halt.ts` documents twice already, and the reason the check exists at all.
Unreachability is a claim about today's two `saveEscalation` call sites. The
success line is a claim about the file.

So the branch stays, and the text now says only what the run measured.

## What was wrong with the text

Three sentences, all unsupported when `arrived` is empty:

- `The halt you came to clear is cleared.` — contradicted by the file just read back.
- `But the guard is halted again, by something raised while this ran.` — asserts a
  cause in exactly the case where no event arrived to support one.
- `The guard is still halted. Read what is named above, then run this again to
  clear it.` — nothing was named above.

The structural cause was reporting the two facts as two independent `if`s. They are
not independent: what "still halted" means to the human depends on whether anything
arrived to account for it.

## The change

`hooks/clear-halt.ts` — the report block now splits on `arrived` first and covers
three combinations, disjoint and complete:

| `arrived` | `stillHalted` | Report |
|---|---|---|
| > 0 | true | unchanged (halt cleared, these arrived, still halted, read them) |
| > 0 | false | unchanged (halt cleared, these arrived, written away with it) |
| 0 | true | **new** — the clear was written, the halt is back, nothing arrived to explain it, and here is the state file |

The new text names no list, asserts no cause, and hands over the one concrete thing
left: the absolute path to `escalation.json`, resolved through `guardStatePath` —
the same seam `escalation.ts` loads through, so the two cannot disagree. Only the
leaf filename is repeated here, because `escalation.ts` keeps its constant private
and that file was out of scope.

Actual output of the new branch, measured in a throwaway project:

```
The clear was written, but the guard is halted again.
Nothing arrived to explain it. No halt event is on disk that you were not already shown,
so this run cannot name a second violation: something put the halt back without recording one.
That is what a writer still holding the state from before the clear does, and what a hand
edit of the state file does:
  <root>/fusion-workbench/.guard-state/escalation.json
The guard is still halted. Run this again once nothing else is writing that file. If it
comes back halted with nothing named, read the file yourself.
```

The file header gained a section on why the check reports per case rather than per
fact, and on why the unreachable-today combination is kept.

## The test

`hooks/lib/__tests__/clear-halt-concurrent-halt.test.ts` — the existing shim gained a
third injection, `hand-edit`: after the script's `saveEscalation` returns, it reads
the JSON state file, flips `haltActive` back on, and writes it, leaving
`recentEvents` untouched. No exported function produces that shape, because
`raiseHalt` always appends an event with the halt — which is exactly why the record
called a hand-written state file the honest route. Two cases:

- the report says the halt came back, names no list, and prints the state file path
  (asserting the *absence* of `Read what is named above`, `which you were not shown`
  and `The halt you came to clear is cleared.`, and exit 2)
- the clear itself still happened: `halt_cleared` on the record, `consecutiveBlocks`
  back to 0

Both assert the constructed state first (`haltActive: true` on disk, exactly one
halt-level event), so neither can pass as the ordinary path under a different name.

`clear-halt-concurrent-halt.test.ts` went from 6 cases to 8. The three ordinary-path
cases and the two `e39b3fe` cases are untouched, including the exact string
`The guard is still halted.` the save-injection case asserts.

## Verification

`cd hooks && npm test` — exit 0. 39 files, 1036 tests, all passed.

Two earlier runs of the same command failed and neither failure was this work:
`fusion-plane.test.ts` (8 cases, concurrent task editing `bin/fusion-plane`) and
`fusion-commit-lock.test.ts` (one timing case, which passes in isolation and passed
on the run above). Neither imports `clear-halt`.

## Files changed

- `hooks/clear-halt.ts`
- `hooks/dist/clear-halt.js`, `hooks/dist/clear-halt.d.ts` (rebuilt by `npm test`)
- `hooks/lib/__tests__/clear-halt-concurrent-halt.test.ts`

Not committed, and the issue marker is left at `_o_` — the user validates first.
