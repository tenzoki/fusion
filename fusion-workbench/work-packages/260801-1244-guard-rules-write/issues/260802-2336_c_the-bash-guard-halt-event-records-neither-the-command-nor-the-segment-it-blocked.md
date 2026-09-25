# The Bash halt event records neither the command nor the segment it blocked

---

**Severity:** Low
**Domain:** code
**Filed by:** coderev, reviewing Turn 2 of `260801-1244-guard-rules-write` (`bf75941..HEAD`)
**Affects:** `events.jsonl`, the monitor, and anyone reading back why a session stalled
**Cross-references:** `hooks/guard.ts:343-348` (the new halt event),
`hooks/guard.ts:368-373` (the sibling protected-path deny, which does record it),
`hooks/lib/bash-mutation-guard.ts:1526-1534` (`targetPath` is set on deny only)

---

## What was found

STEP 2a emits:

```ts
emitEvent(
  "guard_halt",
  "Bash",
  mutation.targetPath,
  "Halt active — mutating Bash command blocked",
);
```

`mutation.targetPath` is populated on a **denying** verdict only. The halt fires whenever
`mutation.mutates` is true, which is the common case where the command mutates something
unprotected — `rm notes.txt`, `echo hi > out.txt`. For all of those the third argument is
`undefined`, and the detail string is a constant. So the event records that a mutating Bash
command was halted and nothing about which one.

The sibling deny eight lines below does it properly: it passes `mutation.targetPath` (always
set on that branch) and a detail naming `mutation.offendingSegment`.

## Why it matters, at Low

A halt is the state a user has to come and clear, and the event log is where they reconstruct
what the agent was trying to do. With the command absent, a halted session leaves a run of
identical `guard_halt` lines that say only "something mutating was blocked, ten times". The
three `guard_block` events that *caused* the halt do name their segments, so the history is
not lost — which is why this is Low rather than Medium. What is lost is everything the agent
attempted after the halt, which is precisely the behaviour the halt exists to observe.

The verdict already carries what is needed: `mutation.offendingSegment` on a deny, and the
raw `command` in scope either way.

## Recommended fix

Render the segment (or the command, truncated) into the detail, the same way the deny branch
does — `Halt active — mutating Bash command blocked: <segment>`. `renderSegment` already
redacts quoted literals back into place for the deny path, so the same treatment applies.

Worth confirming while there: `guard_halt` is emitted from three places now (write-tool halt,
Bash halt, and `recordBlock` tripping a halt) and the monitor renders them into one row type.
A detail string that distinguishes them costs nothing and saves a reader guessing which
surface halted.

## Origin

Found in `260801-1244-guard-rules-write` while reading STEP 2a for the halt-above-
exemption ordering, which is correct.

---
Resolved: The Bash halt event now renders the command into its detail —
`mutation.offendingSegment` when the halted command was also protected (that verdict
does carry a rendered segment), otherwise the raw command. Both go through a new
`forEvent` helper in `hooks/guard.ts` that collapses whitespace to one line and
truncates at 200 characters, so an 80-operand `rm` cannot turn `events.jsonl` into a
transcript. `mutation.targetPath` is still passed as the event's file field; it is
correct when set and the detail no longer depends on it.

The closing observation confirmed and acted on, and it was as cheap as it looked. The
three `guard_halt` sources now name themselves in the detail:

  - `Halt active — write tool call blocked`                     (halted guard refusing a write)
  - `Halt active — mutating Bash command blocked: <segment>`    (halted guard refusing a shell mutation)
  - `Halt raised by this block — <cause>`                       (the block that tripped the threshold)

The third prefix comes from one new `emitBlockEvent(halted, tool, file, detail)` helper
rather than from four copies of an inline ternary at the four `recordBlock` sites (git
deny, Bash protected path, write-tool protected path, decision-governed). Non-halt
details pass through unchanged, so an ordinary `guard_block` row reads exactly as before.

One correction to the issue text: the sibling Bash protected-path deny did NOT already
name `mutation.offendingSegment` in its event detail — it passed the constant
`"Protected path"`, and the segment reached only the escalation record via the block
reason. That site now carries `Protected path: <segment>`, which is what the issue
described as already true. The write-tool sibling keeps the bare `"Protected path"`,
because on that surface the tool call IS the path and the file field already has it.

Covered by `hooks/lib/__tests__/guard-halt-event.test.ts`, 10 cases asserted on the
`events.jsonl` the guard wrote. `hooks/lib/__tests__/guard-bash-wiring.test.ts` keeps
its structural gate, now split across the call site and the shared emitter so neither
half can be deleted alone. Stubbing the detail changes back out fails 7 of the 10.
