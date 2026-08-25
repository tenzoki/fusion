# C4 step 2, the two edits its dispatch put out of scope — the reference pin and the missing entry-point row

**Status:** Complete
**Agent:** coder
**Filed by:** coder, Kai Stalmann <ks@qantr.com>
**Checkout:** 5e8248d7
**Plan:** `circles/260825-2023-presence-travels-monitor-filters-own-checkout/planning/260825-2140_*_c4-presence-travels-and-the-monitor-reads-its-own-checkout.md`, step 2

## What was changed

Two files, and nothing else in a working tree that already held the finished work of plan steps 2 and 3 uncommitted.

1. **`hooks/lib/__tests__/reference-resolution-lint.test.ts`** — `BASELINE` re-approved from `{ paths: 1380, anchors: 193 }` to `{ paths: 1404, anchors: 193 }`, with the attribution prepended to the existing comment on the same line, in the form that line already uses. The line carries its own note on why the comments live there rather than above: the hook-test line budget is at its bound.
2. **`README-hooks.md`** — one row for `events-query.ts` in the `## Files` entry-point table, beside `review-coverage.ts` and in its shape. The `lib/` half of that table is held in set equality by `derivable-enumerations-lint.test.ts`; the entry-point half is held by nothing, which is why the row was missing and why nothing would ever have reported it.

## The number is 1404, not the 1402 the dispatch named

The dispatch handed over 1380 + 22 = 1402, measured by step 2 in isolation, and instructed that the figure be verified before it was written rather than trusted. It was verified, and both readings are right about their own scope:

- Before edit 2, the gate reported `{ paths: 1402, anchors: 193 }`, exactly as handed over.
- After edit 2, it reports `{ paths: 1404, anchors: 193 }`.

The 2 are edit 2's own cost. The new entry-point row cites `bin/fusion-events` and `lib/events-query.ts` once each, and both are class (a) plugin-file paths that resolve. The handover figure could not have included them: it was measured before the row existed. So `1380 + 22 (the program) + 2 (the row naming it) = 1404`, and the committed baseline is the number the tree actually produces with both edits in it. The comment on the `BASELINE` line states that split, so the next reader does not have to re-derive which half is which.

The three shares of the program's 22 were checked against the two doc diffs rather than taken on trust: `CLAUDE.md`'s Layout row cites `bin/fusion-events`, `rules/workbench-tracking.md`, `bin/fusion-identity`, `hooks/lib/events-query.ts` and `hooks/dist/events-query.js`, which is 5; `README-hooks.md`'s `hooks/lib` row cites `lib/events-query.ts`, `bin/fusion-events`, `rules/workbench-tracking.md` and `CLAUDE.md`, which is 4. The remaining 13 are `bin/fusion-events`'s own header, which enters the gate's surface whole because a `bin/` file starting `#!` is scanned on its comment lines. The two new `.ts` sources move nothing, as handed over: `hooks/**.ts` is on the surface for class (c) record citations only, and neither module cites a record.

## Verification

`cd hooks && npm test` — **exit 1**. One failure, and it is the expected one:

- `committed-dist.test.ts` `git ls-files bin/ equals the directory listing` — `bin/fusion-events` is untracked. Staging is the orchestrator's act at the commit, so this closes there and was left alone. Structural for any new `bin/` helper.

The reference-resolution gate is green on both halves, the pin and the dangling-reference check. The three failures the dispatch warned about, one in `review-coverage.test.ts` and two in `staging-drift.test.ts`, did not appear in either full run of this session, so there is no separate isolated reading to report: the figure above is the full-suite run.

## Scope held

`agents/orchestrator.md`, `bin/fusion-events`, `hooks/lib/events-query.ts` and the plan file were not opened for writing. No growth-bound baseline was edited; the hook test suite gained no lines, the `BASELINE` re-approval being an in-place edit of one existing line.
