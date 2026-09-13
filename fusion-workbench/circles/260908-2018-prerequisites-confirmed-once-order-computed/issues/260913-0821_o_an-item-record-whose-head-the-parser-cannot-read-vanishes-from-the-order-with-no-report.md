# An item record whose head the parser cannot read vanishes from the order with no report, and the parse bound that decides it is untested

---

`computeWorkGraph` drops a record whose head yields no readable `**Status:**`, silently and with
no count. `/fusion:archive` is mandated to report that exact condition as a workbench-state
fault. Two consumers of one field, one reports it and one swallows it.

---

**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>

**Related:**
`260908-2018-prerequisites-confirmed-once-order-computed.md` (the item that built the computation)

**Measurement anchor.** Every line number below was read in this work tree at commit `c2a12973`
on 2026-09-13.

## The defect, part one: the silent drop

`hooks/lib/work-graph.ts:273`:

```ts
const status = headField(head, "Status");
if (status !== "open" && status !== "claimed") continue;
```

Three distinct conditions take that branch and produce the same nothing: a terminal item, a
record whose `**Status:**` is outside the four values, and a record whose head the parser could
not read at all. The module header at `hooks/lib/work-graph.ts:250` treats them as one: "A record
whose head declares no readable `**Status:**` is outside the node set for the same reason a
terminal one is." They are not the same reason. A terminal item is outside by a user's ruling. An
unparseable one is outside because a parse failed, and no figure in the report says so: not
`items=`, not a `note=` line, not a row.

`skills/archive/SKILL.md:150` reaches the same condition and is explicit the other way: "The
workbench-state fault is narrower than it reads, and only this form reaches it: a record in the
**item** form, `<container>/<container>.md`, whose `**Status:**` is missing or outside the four.
Report that one, exclude it, do not guess which state was meant."

A program whose stated design principle is a degradation named rather than hidden
(`bin/fusion-work-order:44`) should not be the one that hides this one.

The same `continue` covers a `readFileSync` that threw (`hooks/lib/work-graph.ts:267`). That is
correct for a terminal Circle container, which holds no record of its own name, and silent for a
record that exists and could not be read.

## The defect, part two: the head-block bound is untested

`hooks/lib/work-graph.ts:163`:

```ts
function headBlock(text: string): string[] {
  const head: string[] = [];
  let opened = false;
  for (const line of text.split("\n")) {
    if (line.trim() === "---") {
      if (opened) break;
      opened = true;
      continue;
    }
    if (/^#{2,6}\s/.test(line)) break;
    if (opened) head.push(line);
  }
  return head;
}
```

The heading break is never exercised. `record()` in
`hooks/lib/__tests__/work-graph.test.ts:63` emits `# dir`, blank, `---`, the fields, `---`, blank,
`## Context`, and the decoy field. Every fixture record therefore closes its head at the second
`---` before any `##` line is read, so deleting the heading test from `headBlock` leaves the whole
fixture green. The test's own header at `hooks/lib/__tests__/work-graph.test.ts:17` claims the
head-block parse as half of what can go wrong; it covers the `---` bound and not the other one.

Two shapes reach that branch, and both end in the silent drop above rather than in a report:

- A record whose head is opened by `---` but never closed, and which carries no `##` heading
  either, is scanned to end of file. The body prose the bound exists to exclude is then read as
  head, which is what `hooks/lib/work-graph.ts:156` says the bound is for.
- The heading test sits **above** the `if (opened)` guard, so a `##` line appearing before the
  opening `---` empties the head and drops the item.

Both shapes violate the template at `rules/fusion-workbench-conventions.md:184`, so neither is a
correctness failure against a well-formed store. They are the reason the fault needs reporting
rather than swallowing: the parser's failure mode on a malformed record is invisibility.

## Acceptance test

1. A fixture store carrying an item-form record whose head declares no readable `**Status:**`:
   the report names it. A count in the `KEY=value` block, in the shape `no-depends-on-field=`
   takes, plus one line naming the record, is enough; the shape is the implementer's to choose as
   long as a reader can tell "no live items" from "one live item I could not read".
2. A terminal item and a terminal Circle container stay silent, which is what they are today. The
   new report is about the unreadable case only.
3. A fixture record with no closing `---` and no body heading proves the heading bound: with the
   `/^#{2,6}\s/` line deleted from `headBlock` the suite goes red.

## Scope

`hooks/lib/work-graph.ts` (the report and the module header at line 250),
`hooks/order.ts` and `bin/fusion-work-order` (the new figure's documentation),
`hooks/lib/__tests__/work-graph.test.ts` (both cases).
