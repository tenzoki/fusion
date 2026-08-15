The `control:` block is documented as holding no counts, three lines below a field defined as an integer counter

---

`agents/orchestrator.md:1011` justifies the block's new name with "it holds no counts" and closes at
`:1021` with "Three surfaces remain in this file and none of them is a tally". The schema three
lines above defines `directive_revisions_this_session: <integer; initialised to 0; capped at 1>`,
which is a count, is incremented at a write point, and is the one field in the block whose value is
a number.

---

## The two statements

Schema, `agents/orchestrator.md:983-986`:

```yaml
control:
  turn_start_head: "<short hash, recorded at start of current Turn …>"
  paused_at_task: "<task ID when Rebalance 'Revise Grounding' paused Phase 2 …>"
  directive_revisions_this_session: <integer; initialised to 0; capped at 1 …>
```

Prose, `:1011`: **"The block is called `control:` because it holds no counts"**.

Prose, `:1021`: **"Three surfaces remain in this file and none of them is a tally: a git anchor and
two pieces of control state."**

The write-point table at `:1037` then says: *"`control.directive_revisions_this_session`
incremented"*.

## Why this is worth a record rather than a shrug

The defensible reading — a counter that gates behaviour is control state, not a tally — is exactly
right, and it is nowhere in the file. What is in the file is a flat "no counts" that its own schema
falsifies, sitting at the head of the section that has to survive the next reader asking "may I
persist this number?". The seven fields were removed on a stated criterion; a criterion contradicted
by the surviving neighbour is one a later editor will either apply wrongly or ignore.

There is a second, smaller slip in the same sentence: "Three surfaces remain **in this file**" is
true of the `control:` block, not of the file, which also holds `session:`, `current_task:`,
`work_queue:` and `plan_context:`.

## Suggested fix

State the distinction the block actually draws — a number written to *bound behaviour across an
interruption* is control state; a number written to *report progress* is a tally and is derived —
and scope the "three surfaces" sentence to the block. No schema change.
