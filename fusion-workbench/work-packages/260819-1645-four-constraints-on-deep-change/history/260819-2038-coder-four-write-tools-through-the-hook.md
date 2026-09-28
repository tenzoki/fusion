# coder — put all four write tools through the hook

**Date:** 2026-08-19 20:38
**Status:** Complete
**Circle:** `260819-1645-four-constraints-on-deep-change`
**Task:** plan step 2, `260819-2016_*_four-constraints-on-deep-change.md`
**Closes:** `260816-2320_*_the-write-trace-is-now-the-guards-only-product-and-two-of-its-four-tools-reach-no-integration-case.md`
**HEAD at start:** `b6869aa`

## What changed

One file, `hooks/lib/__tests__/guard-bash-integration.test.ts`, +72 / -1 lines.

- `runGuard` added to the import list from `./helpers/guard-harness.js`.
- The describe renamed from "the Edit write path allows and records" to
  "the write path allows and records, for all four write tools".
- Three cases added beside the existing `Edit` one: `Write` and `MultiEdit`
  through `runWrite(root, path, "<tool>")`, `NotebookEdit` through
  `runGuard(root, "NotebookEdit", { notebook_path: path })` — the only route to
  the second branch of `extractFilePath` (`hooks/guard.ts:98-109`).
- Each of the four asserts the event list is exactly `["guard_allow"]`, that the
  row's `tool` is the tool name the case passed, and that its `file` names the
  path. The `tool` assertion was added to the existing `Edit` case too, which
  pins `runWrite`'s default name as a side effect.

The `tool` assertion is the point of the step: a case asserting `file` alone
stays green if the payload never carries the tool under test and the harness
falls back to its default.

## Harness signatures, checked before writing against them

Both match the plan. `runWrite(root, filePath, toolName = "Edit", overrides = {})`
at `hooks/lib/__tests__/helpers/guard-harness.ts:753-760`, and
`runGuard(root, toolName, toolInput, overrides = {})` at `:697-702`. The harness
was not edited.

## Verification

`cd hooks && npx vitest run lib/__tests__/guard-bash-integration.test.ts` —
exit 0, 16 tests passed (12 before). The full suite was deliberately not run:
four sibling coders were editing disjoint file sets concurrently.

Acceptance grep returns hits in this file (9 lines) plus the matcher assertion at
`hooks-wiring.test.ts:70`.

The deliberate reddening the plan names — removing the `notebook_path` branch —
was NOT performed, because `hooks/guard.ts` is outside this task's file set and
siblings were writing concurrently.

## Shared constant left alone, and it has moved

`TEST_LINE_BASELINE["guard-bash-integration.test.ts"]` is 346
(`surface-growth-bound.test.ts:323`) and the file now measures 417 by that test's own newline count (net +71). The bound
itself compares totals against head-room, so the net +71 spends head-room rather than
failing. What does fail until it is regenerated is the golden's per-file line
`fixtures/surface-growth.golden:60`, which still reads 346. Left untouched per
the task instruction; it belongs to the consolidation pass, which has to absorb
every sibling's addition in one regeneration anyway.
