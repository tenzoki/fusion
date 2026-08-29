# Coder — the net-negative breaker compares like with like

**Stamp:** 260815-2259
**Agent:** coder
**Status:** Complete
**Source record:** `260814-1430_*_the-net-negative-breaker-compares-a-per-finding-count-against-a-per-batch-count.md`
**Files changed:** `agents/orchestrator.md`

## What the defect was

The orchestrator's Net-negative progress circuit breaker tripped on
`issues_created > tasks_resolved`. The two counters are defined nine hundred lines apart in
the same prompt and count different things: `issues_created` is one file per reviewer
finding, `tasks_resolved` is one queue entry, and a batch of findings routinely enters the
queue as a single entry. Nothing in the prompt constrains the fan-in between them, so the
ratio is not merely biased but undefined, and a healthy review loop reads as divergence.

## What changed

Three edits, all inside `agents/orchestrator.md`, all localised to the lines they touch.

1. `:619`, the Step 3d circuit-breaker table — the threshold now reads
   `2 consecutive Turns where issues_created > issues_resolved`.
2. `:635`, the contingency table under the unresolved-budget check-in — the same row now
   reads `issues_created > issues_resolved, twice running`.
3. `:642`, the steady-state sentence that argument rests on — from "A Turn that resolves one
   task and files one issue" to "A Turn that closes one issue and files another".

The third edit was not cosmetic. That sentence exhibits a Turn satisfying none of the six
exits, which is what carries the "removing the count-based row removes termination" claim
above it. Against the old comparison the original example worked: one task resolved, one
issue filed, `1 > 1` false. Against the new one it names no issue resolution at all, so it
would have read as net-negative twice running and disproved the very point it is there to
make. The rewritten example resolves an issue and files another, so it clears the
net-negative row and the zero-progress row alike, and it still leaves the queue no shorter.

`issues_resolved` already existed at `:953` and no counter was added. `tasks_resolved`
remains defined at `:949` and is still read by the zero-progress row's prose.

## Coverage of the "any third statement" check

`grep -rn "issues_created" agents/ skills/ rules/ docs/ README*.md` returns four lines in
this prompt and nothing anywhere else: the two rows above and the two State Tracking
definitions at `:952` and `:960`. A second search for the condition stated in prose
(`divergen`, `more issues`, `net.negative`, `created.*resolved`) surfaced no further
statement of the comparison. There was no third occurrence.

## Byte delta

139 859 → 139 858 bytes, a shrink of one. `agents/` is a growth-bounded surface here and a
shrink never trips a bound.

## Verification — blocked, and not on the change

`cd hooks && npm test` exits **1**. Two tests fail and neither is the fix being wrong.

**1. `surface-growth-bound.test.ts` — "matches the checked-in golden".** This one is caused
by the change, and by any change: the golden at
`hooks/lib/__tests__/fixtures/surface-growth.golden` is a per-file byte inventory of the
bounded surfaces, so editing a single byte of any agent prompt makes it stale. Its diff is
exactly `orchestrator.md 139859 -> 139858`, and the surface's own head-room bound passes.
The documented remedy is a deliberate regeneration
(`UPDATE_SURFACE_GOLDEN=1 npx vitest run lib/__tests__/surface-growth-bound.test.ts`,
which rewrites the fixture and then fails on purpose so a second run is forced). That
fixture is outside the file set this task was permitted to touch, and regenerating it now
would be stale again the moment the next task in this session edits the same prompt, so it
is left for the session to do once, after the last edit to `agents/orchestrator.md` lands.

**2. `reference-resolution-lint.test.ts` — `README-hooks.md:394`, token
`hooks/lib/__tests`.** Not caused by this change and not in this task's file set. The
working tree carries concurrent modifications to `README-hooks.md`, `bin/monitor` and
`hooks/lib/__tests__/surface-growth-bound.test.ts` from another task in this session; the
first run of the suite, taken minutes earlier, showed this test passing and only the golden
failing. Left to whoever owns that edit.

The suite was 40 files / 751 tests, 38 files / 749 tests green.
