# Rules-emission golden regenerated for the curator's two gate bullets

**Status:** Complete
**Agent:** coder
**Domain:** code
**Date:** 2026-08-16 13:05

## What this was

`rules/user-facing-output.md` grew by 758 bytes when the curator added two bullets to
`## Questions and gates` ("A response moment is either a question or an explicit
'nothing to decide'" and "Every option says what it forecloses"). That file is in the
universal core of the always-on rule set, so the per-agent size assertions in
`hooks/lib/__tests__/rules-emission-golden.test.ts` went red on the stale fixture.

The regeneration was deliberately pulled forward rather than being folded into the
queued repunctuation sweep over the same file: the two changes are independent defect
fixes and each needs its own green suite before its own commit.

## What changed

One file, and only one:

- `hooks/lib/__tests__/fixtures/rules-emission.golden` — 30 insertions, 30 deletions.

Every one of the 15 agent stanzas moved by the same 758 bytes, which is what a change to
a universal-core file must look like:

- `user-facing-output.md 16788` → `17546` in all 15 stanzas
- each stanza's `total` line by +758

No other rule file's recorded size moved. `RULE_BASELINE` was not touched, and neither
was any test source.

## Verification

```
cd hooks && UPDATE_RULES_GOLDEN=1 npx vitest run lib/__tests__/rules-emission-golden.test.ts
  → 1 failed, 14 passed (the update-flag guard fails on purpose)
cd hooks && npm test
  → exit 0, 40 test files, 764 tests passed
```

## Head-room after the change

The hard bound measures the universal core against `RULE_BASELINE` (86 573 bytes at the
2026-08-14 arming) plus `GROWTH_BUDGET` of 12 000, so the ceiling is 98 573.

| Figure | Bytes |
|---|---|
| Universal core emitted now | 90 461 |
| Baseline floor | 86 573 |
| Growth since the baseline | 3 888 |
| Ceiling (floor + 12 000) | 98 573 |
| Head-room remaining | 8 112 |

The queued repunctuation sweep has 8 112 bytes of room before the always-on bound fails.

## Not committed

Left staged-free and uncommitted, per the dispatch. The workbench also carries an
unrelated modification to `fusion-workbench/orchestrator-events.jsonl`, which is
hook-written session state and not part of this change.
