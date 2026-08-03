# The Bash halt event records neither the command nor the segment it blocked

---

**Severity:** Low
**Domain:** code
**Filed by:** coderev, reviewing Turn 2 of `circles/260801-1244-guard-rules-write` (`bf75941..HEAD`)
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

Found in `circles/260801-1244-guard-rules-write` while reading STEP 2a for the halt-above-
exemption ordering, which is correct.
