# The fixture test carries one tautological assertion and leaves three branches of the computation unexercised

---

`work-graph.test.ts` covers every case its own plan step named. Against the implementation it
landed with, one assertion cannot fail and three branches are never entered. Each is cheap to
close and each would pass under a wrong implementation as it stands.

---

**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>

**Related:**
`260908-2018-prerequisites-confirmed-once-order-computed.md` (the item that wrote the test);
`260913-0821_*_an-item-record-whose-head-the-parser-cannot-read-vanishes-from-the-order-with-no-report.md` (the fourth gap, the head-block heading bound, filed separately because it carries a behaviour change with it)

**Measurement anchor.** Every line number below was read in this work tree at commit `c2a12973`
on 2026-09-13, against a green suite.

## What is covered, stated first

Step C3's case list is met in full. The chain whose topological order is not its basename order,
the fan-out, the two-member cycle, the entry naming nothing, the `done` item carrying an outgoing
entry, and the seven behaviours the step named (depth, transitive count, order, readiness, cycle
naming, the dangle rule, terminal exclusion) are all asserted, as are the two extra assertions the
spec asked for. The archive assertion at `hooks/lib/__tests__/work-graph.test.ts:137` is guarded
against vacuity by the `opened.length` check on the next line, which is the right shape.

## The defect

**One assertion cannot fail.** `hooks/lib/__tests__/work-graph.test.ts:106`:

```ts
expect(report.rows.map((r) => r.order)).toEqual(EXPECTED.map((_, i) => i + 1));
```

`order` is assigned by a counter incremented once per emitted row
(`hooks/lib/work-graph.ts:409`), so the sequence is `1..rows.length` for every possible input.
The line before it already fixes `rows.length` at nine. The assertion therefore states that nine
equals nine. It reads as a check on the printed order; the order is actually checked by the `dir`
column of `EXPECTED` on line 105.

**Three branches are never entered.**

1. **Resolved-edge deduplication.** `hooks/lib/work-graph.ts:316` keys a `seenEdge` set on the
   node pair so that a repeated entry counts once. No fixture item names the same resolvable
   prerequisite twice, so `edges=6` holds with the set removed. The dangle side of the same
   behaviour is covered, at `hooks/lib/__tests__/work-graph.test.ts:54`.
2. **The self-edge cycle.** `hooks/lib/work-graph.ts:404` detects a one-member component carrying
   an edge to itself and reports it as a cycle. No fixture item depends on itself, so
   `report.cycles` is unchanged with that whole `selfEdge` term removed.
3. **The empty store.** `hooks/lib/work-graph.ts:421` returns `verdict: "empty"` when there are no
   nodes, and `hooks/order.ts:62` documents that value as a real answer reaching exit 0. No
   fixture has zero nodes.

None of the three is reachable from the live store either, which is the reason the fixture exists
at all.

## Acceptance test

1. The tautological assertion is replaced by one that can fail, or removed. If the intent was to
   check that `order` is dense and starts at 1, assert it against `report.rows.length` rather than
   against `EXPECTED`.
2. One fixture item carries the same resolvable prerequisite twice, and `edges` is asserted to
   count it once. Removing the `seenEdge` set reddens the suite.
3. One fixture item names itself, and the assertions cover its cycle row, its readiness and the
   `blocks` figure its component carries. Removing the `selfEdge` term reddens the suite.
4. A root with no `circles/` directory returns zero items and `verdict=empty`.
5. The file stays inside the hook-test surface bound. It landed at 144 lines against a budget of
   144, so these cases are paid for with their own cut, never with a baseline edit.

## Scope

`hooks/lib/__tests__/work-graph.test.ts` alone. No change to `hooks/lib/work-graph.ts` is implied
by this record: all three branches read correct, they are simply unproved.
