# The reference-resolution pin is red on commit B's tree and no step re-approves it

**Filed:** 2026-09-17 15:08
**State:** open
**Severity:** blocking (step B13's acceptance criterion cannot be met until it is cleared)
**Found by:** analyst, during step B11's cut search
**Cross-references:** `260917-1124_*_implementation-fusion-discuss-a-two-agent-discussion-loop.md` (steps B8, B9, B13), `260917-1508-the-cut-search-on-both-bounded-surfaces.md`

## What is wrong

`hooks/lib/__tests__/reference-resolution-lint.test.ts` fails on the working tree. `BASELINE` at `:464` pins `{ paths: 1625, anchors: 268, stampBare: 11 }`; the tree resolves `{ paths: 1636, anchors: 272, stampBare: 11 }` — eleven paths and four anchors more.

The drift is legitimate and is this work's own. `skills/discuss/SKILL.md` (step B8) and the two edits to `README-agents.md` (step B9) both sit inside the gate's scanned surface: `surface()` at `:95-142` enumerates every `skills/*/SKILL.md` and every `README*.md` at the plugin root. The gate's own failure text names re-approval as the expected response and says it belongs in the commit that caused the drift.

No step of the plan covers it. B13 regenerates `fixtures/surface-growth.golden` and nothing else, and its acceptance criterion is that `npm test` passes from a clean checkout — which it cannot, while this pin stands at its pre-B8 figures.

## Why it is not step B11's to fix

B11 is read-only on every source file, and the cut it returned cannot move these counts in either direction: `surface()` reads `hooks/lib/*.ts` and `hooks/*.ts` non-recursively, so `hooks/lib/__tests__/` is outside the scanned corpus entirely. Verified by running the gate on an unmodified scratch copy and on the cut copy: identical failure, identical figures.

## The fix

In step B13, beside the golden regeneration: check the received numbers against B8's and B9's edits, then write `{ paths: 1636, anchors: 272, stampBare: 11 }` into `BASELINE` with a re-approval entry in the established form on that line. Re-measure before writing rather than copying the figures from here — the tree will have moved by then if B12 lands first.

## Acceptance

- `cd hooks && npx vitest run lib/__tests__/reference-resolution-lint.test.ts` is green.
- The re-approval entry names what was added and attributes the +11 and +4 to the two steps that made them.
- `npm test` passes from a clean checkout at commit B's landing.

---
Resolved: re-approved in step B12 rather than B13, because B12's own edits to `README-hooks.md` move the counts again and a pin re-approved before them would have been red at the landing. The instruction in `## The fix` to re-measure rather than copy the figures from here is what made that safe. `BASELINE` in `hooks/lib/__tests__/reference-resolution-lint.test.ts` now reads `{ paths: 1644, anchors: 272, stampBare: 11 }`, with a nineteenth re-approval entry on that line attributing every one of the +19 paths and +4 anchors to the three scanned files that carry them, each measured by restoring the file to HEAD in place: `skills/discuss/SKILL.md` +10/+4 (step B8), `README-agents.md` +1/0 (step B9), `README-hooks.md` +8/0 (step B12's two log entries). The one interaction is named in the entry — moving the new body aside alone reads eleven down rather than ten, because the README-agents roster row cites it and that token dangles once the target is gone. The +11/+4 stated above was correct for the tree it was measured on and is superseded by the figure at the landing. Verified: `cd hooks && npm test` leaves one failure, the surface golden, which step B13 regenerates.
