# The session_id row assertion sits in the state-load suite because that was the only permitted file

---
`guard-state-shape.test.ts` documents one subject over eighty lines of header. It now carries a
second one that does not belong to it, and the header says so rather than hiding it.

---
**Filed by:** coder, Kai Stalmann <ks@qantr.com>

**Severity:** Low

**Cross-references:**
`hooks/lib/__tests__/guard-state-shape.test.ts` `## A second subject, and it is here by dispatch rather than by fit`;
`hooks/lib/__tests__/guard-bash-integration.test.ts`, the `describe` block "the write path allows and records, for all four write tools".

## What is misplaced

Step 11's second branch put `session_id` on every row `hooks/guard.ts` and `hooks/tracker.ts`
write into `fusion-workbench/.guard-state/events.jsonl`. Its one assertion lives in
`guard-state-shape.test.ts`, whose declared subject is the state LOAD: a shape-valid JSON file
of the wrong shape used to throw past the tracker's catch and empty its reply.

The row's other field assertions — `tool` and `file` on a `guard_allow` — live in
`guard-bash-integration.test.ts`, four cases in a row, one per write tool. That is where a
reader looks for what a row carries, and where a future field will be added by whoever adds one.

## Why it was filed here rather than moved

The step's dispatch enumerated the test files it may touch and named this one. Line budget was
not the constraint: 36 of the 62 available hook-test lines were still unspent after the block
landed.

## Fix direction

Move the `describe` block to `guard-bash-integration.test.ts`, drop the header section that
apologises for its position, and keep the assertion over BOTH rows — the `guard_allow` from the
PreToolUse side and the `review_coverage` from the PostToolUse side. The two hooks reach one
seam in `hooks/lib/events.ts`, and a case that asserts only the hook somebody happened to be
reading is what the block exists to prevent. The move needs the coverage fixture the current
home supplies (`withGap`, `reviewLands`), so it is a move of the fixture too, or a narrower
assertion on the guard row alone plus a tracker row asserted where a tracker row already is.
