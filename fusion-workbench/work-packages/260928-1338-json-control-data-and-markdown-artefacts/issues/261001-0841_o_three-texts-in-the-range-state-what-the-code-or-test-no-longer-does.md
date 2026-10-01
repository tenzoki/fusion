Three texts in the range state what the code or test no longer does
---
Three small drifts, each verified at the current tree:

1. The `hooks/lib/record-client.ts` header says `reconcile` grows quadratically and outlasts the timeout from about 1 200 records. The linear fix closed that issue, and 2 500 records now answer in 0.89 s median.
2. The test "precedence on initialize: replay and blocked recovery before manifest-present" in `codec/src/__tests__/ops.test.ts` builds no blocked intent.
3. The `pending-initialize-unreadable` detail names the intent directory twice.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260930-1712_*_the-codecs-reconcile-grows-with-the-square-of-the-record-count-and-outlasts-the-clients-timeout-from-about-1200-records.md (closed), 260930-1654_*_plan-initialize-the-codec-creates-a-new-workbench-and-list-names-its-state.md (steps 4, 7, 7a, 8 (d)), 261001-0837-reviewer-fj03b-initialize-and-fj03c.md

Severity: Low. Scope: `hooks/lib/record-client.ts` (comment), `codec/src/__tests__/ops.test.ts` (test name), `codec/src/cli/ops.ts` (detail text).

**Evidence:**

1. `hooks/lib/record-client.ts` header: "grows with the square of the record count: 2.1 s at 200 records, 47 s at 1 000, 310 s at 2 500, past this whole timeout from about 1 200 records". The fix and its measurement are in the initialize plan, steps 4 and 7. In the same range, `b3909330` removed the `ask`-level case "is unanswered/unparseable when the child exits 0 without output" from `record-client.test.ts`. That branch is now covered only through stubbed `gate` answers.
2. `codec/src/__tests__/ops.test.ts`, the case named above. It asserts replay and `operation-id-reused` ahead of `manifest-present` only. Blocked precedence is covered elsewhere: the "a blocked intent: every initialize is a typed refusal" case and recorded exchanges 23 and 25.
3. `codec/src/cli/ops.ts` `pendingInitialize`: `if (!r.ok) return unreadable(name, r.error.detail);`. `readIntent`'s detail already begins with the intent directory. The initialize plan step 8 departure (d) observed this and filed nothing.

**Fix direction:**

1. Reword the paragraph to the measured linear figures, and restore one `ask`-level empty-stdout case.
2. Rename the test, or add the blocked assertion to it.
3. Pass the reason without the prefix. This moves recorded bytes of `26-inspect`, so it needs a reviewed session delta in a digest-moving revision. Defer it to that revision.

**Acceptance:**

1. `grep -n 'square' hooks/lib/record-client.ts` finds nothing, and an `ask` stand-in that exits 0 with no output answers `unanswered/unparseable`.
2. The test's name and its assertions agree.
3. The recorded `26-inspect` detail names the directory once, under a reviewed delta.
