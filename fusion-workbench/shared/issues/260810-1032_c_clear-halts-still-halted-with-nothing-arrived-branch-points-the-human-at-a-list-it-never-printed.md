# `clear-halt`'s "still halted, nothing arrived" branch points the human at a list it never printed

---

**Severity:** Low
**Domain:** code
**Filed by:** coderev, review of `7f617b1..7ddacbc` (Turn 4)
**Affects:** `hooks/clear-halt.ts:213-217` and `:224-227` (and the identical lines in
`hooks/dist/clear-halt.js`)
**Cross-references:** commit `e39b3fe`; `hooks/lib/escalation.ts:329-333` (`saveEscalation`'s
halt merge); `hooks/lib/__tests__/clear-halt-concurrent-halt.test.ts` (the two concurrent
cases, neither of which reaches this branch)

---

## The defect

The post-clear check raises on `arrived.length > 0 || stillHalted`. The two conditions are
reported by two independent `if`s, and the combination `arrived.length === 0 &&
stillHalted` produces output that names nothing and then tells the human to read it:

```ts
if (arrived.length > 0) {
  console.error(`But ${arrived.length} halt… which you were not shown:`);
  for (const e of arrived) { console.error(`  [${e?.level}] …`); }   // the list
} else {
  console.error("But the guard is halted again, by something raised while this ran.");
}
if (stillHalted) {
  console.error("The guard is still halted. Read what is named above, then run this again to clear it.");
}
```

When `arrived` is empty, the only line above is the one-sentence `else`. Nothing has been
named. The human is running the tool that exists because every write is already blocked,
is told the halt was not cleared, and is directed to evidence that was never printed.

The `else` line is also an unverified assertion: it states a cause ("by something raised
while this ran") in exactly the case where no halt event arrived to support it. The
branch's own precondition is that nothing was raised — a halt was **re-adopted** rather
than raised.

The opening line of the block, `"The halt you came to clear is cleared."`, is false here
too: it was cleared and then written back.

## Evidence — the precondition, measured

`saveEscalation` sets `haltActive` back to `true` with no new event whenever a writer
holding a state loaded *while the halt was active* saves after the clear. Its merge is
`state.haltActive || (onDisk.haltActive && !baseline.haltActive)`, and the first disjunct
is enough (`hooks/lib/escalation.ts:329`). Run against the shipped `dist/lib/escalation.js`
in a throwaway project:

```
W loaded haltActive: true events: 1
after clear -> halted: false
after W's save -> halted: true
halt-level events on disk: 1        <-- unchanged; nothing was raised
```

`unseenHaltEvents(seen, after.recentEvents)` returns `[]` against that file, and
`isHalted(after)` returns `true`. That is the branch.

## Reachability, stated honestly

**`verified:` not reachable from the two shipped writers.** I enumerated every
`saveEscalation` call site: `hooks/tracker.ts:583` always pairs with `raiseHalt` (`:568`),
which appends a halt event, so `arrived` is non-empty there. `hooks/guard.ts` has three:
`:576` and `:638` follow `recordBlock`, which appends a halt event whenever it sets
`haltActive`; `:675` is the allow path, reached only when the load was *not* halted, so
its `state.haltActive` is `false`. `guard.ts`'s CHECK 1 (`:458-491`) returns without
saving at all, which is what keeps the measured scenario above out of production.

**Reachable from outside them.** `coerceState` reads any truthy `haltActive`
(`hooks/lib/escalation.ts:113`), so a hand-edited file, a restored backup, or a state
written by a different fusion version lands here. So would any third writer added later —
and the branch exists precisely because the author expected one.

**Untested either way.** The suite's two concurrent cases inject at `load` (giving
`arrived > 0`, `stillHalted` false) and at `save` (giving both true). Nothing exercises
`arrived === 0 && stillHalted`, so its text has never been read by a test or a human.

## What is *not* wrong here

The three guards `e39b3fe` claims against a false "not cleared" all hold, and I checked a
fourth. `seen` is the state as loaded rather than the five printed lines, pinned by "does
not report a halt that was on disk at load but too old to print". An unreadable state
file loads as the empty state, which yields `arrived = []` and `stillHalted = false`. The
multiset comparison cannot over-report, because `saveEscalation` only ever concatenates
the disk trunk with the caller's own appends since its own baseline — no shipped path
re-applies an event the caller already saw. The one route to a duplicated event is a
state object with no `baselines` entry, which only a hand-built state produces and no
production caller does. **There is no false positive on `arrived`.**

## Suggested fix direction

Make the two conditions one report rather than two independent sentences. Concretely:

- When `stillHalted` and `arrived` is empty, say what is true — the clear was written and
  then overwritten by a writer that was already holding the halt, no new violation is
  recorded — and drop "Read what is named above", which has nothing to point at.
- When `stillHalted`, do not open with "The halt you came to clear is cleared."

The verdict (non-zero exit, no success line) is right in all four combinations and should
not move.

---
Resolved: 49e5b1d — the branch is kept and its message rewritten. Dropping it would print the success line over a state file reading haltActive true, because stillHalted measures the file after the save rather than reasoning about call sites. It now says the clear was written, the guard is halted again, no halt event is on disk it could name, and hands over the state file path from guardStatePath. No list referenced, no cause asserted. The report block splits on arrived first, giving three disjoint cases; the two from e39b3fe are byte-identical. Tested via a hand-edit injection that writes the bytes, since no exported function produces that shape.
