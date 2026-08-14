Five of the eight root-anchored rows still under-name their consumers, by the criterion the same commit wrote into the prose below them

---
`9f4cdac` restored the consumer column on three rows of the layout tree in `rules/fusion-workbench-conventions.md` and generalised the criterion in the paragraph two lines under the tree: a module that only *names* the path, in an exclusion or classification list, belongs in the column beside one that reads the file. Applied to the whole tree that criterion adds `hooks/lib/staging-drift.ts` to five more rows and `hooks/lib/churn.ts` to one. Neither was added.

---
**Found by:** coderev, Turn-5 incremental review of `d5b71f1..41c224c`, review file `circles/260801-1244-curator/reviews/260814-2022-coderev-curator-turn-5.md`.
**Owner:** `coder`.
**Severity:** Medium.
**Affects:** `rules/fusion-workbench-conventions.md` `## fusion-workbench Layout`, the root-anchored block of the tree.
**Cross-references:** `circles/260801-1244-curator/issues/260814-1419_c_the-layout-trees-consumer-column-now-names-only-bin-monitor-for-three-surfaces-that-four-hooks-modules-read.md` (closed against `9f4cdac`; this is its remainder, on rows that record did not name); `circles/260801-1244-curator/issues/260814-1419_o_three-plane-files-entered-the-layout-tree-and-neither-of-the-two-per-surface-arguments-below-it-was-extended.md` (a **different** column — see the note at the end); `circles/260801-1244-curator/history/260814-1332-curator-run.md` ledger entries L24 and L25.

**Verified 2026-08-14 at HEAD `41c224c`** by reading `hooks/lib/churn.ts` and `hooks/lib/staging-drift.ts` directly.

## The criterion, as `9f4cdac` states it

> The column names a consumer that only *names* the path, in an exclusion or classification list, next to one that reads the file: what breaks on a move is the same dependency either way.

## What the criterion reaches and the tree does not say

| Row | Column at HEAD | Also names the path | Where |
|---|---|---|---|
| `.guard-state/` | `bin/monitor, hooks/lib/events.ts, hooks/lib/guard-state-file.ts` | `hooks/lib/churn.ts`, `hooks/lib/staging-drift.ts` | `churn.ts:126` `TRACKER_NOISE_FILES` holds the literal `"fusion-workbench/.guard-state/**"`; `staging-drift.ts:188` `LIVE_PREFIXES` holds `".guard-state/"` |
| `.commit-lock/` | `bin/fusion-commit-lock` | `hooks/lib/staging-drift.ts` | `staging-drift.ts:189` `LIVE_PREFIXES` |
| `.session-marker` | `bin/fusion-session-mark` | `hooks/lib/staging-drift.ts` | `staging-drift.ts:177` `LIVE_STATE` |
| `.plane-map.json` | `bin/fusion-plane` | `hooks/lib/staging-drift.ts` | `staging-drift.ts:182` `LIVE_STATE` |
| `.plane-outbox.jsonl` | `bin/fusion-plane` | `hooks/lib/staging-drift.ts` | `staging-drift.ts:183` `LIVE_STATE` |

The `.guard-state/` case is the one that shows the shape most plainly. `churn.ts` names that path at line 126, two lines below the `orchestrator-events.jsonl` at line 124 that `9f4cdac` cited as evidence for the row above it. The same constant, four entries, three of which reached the tree.

`plane.config.yaml` is correctly left alone: no `hooks/lib` module names it.

## Why it was missed

`circles/260801-1244-curator/history/260814-1910-coder-turn-5-four-review-findings.md` §3 records the verification as `grep -rn` over `hooks/lib/*.ts` for the three filenames the closed record named. A grep keyed on three filenames finds three filenames. The generalisation went into the prose in the same commit; nothing then re-read the tree against it.

This is the second time this eight-row block has been corrected one subset at a time — ledger entry L24 widened the search for `.guard-state/` and not for the three rows above it, which is exactly the finding `9f4cdac` closed.

## What the fix is

Add the modules named above to those five rows, in file-only citation form, matching the three rows `9f4cdac` wrote. Then read the whole block against the criterion once rather than row by row, so the third pass is the last.

Byte cost: an always-on file, so the delta is charged against the growth bound armed in T4 and `hooks/lib/__tests__/fixtures/rules-emission.golden` must be regenerated in the same commit. Roughly 150 bytes against the 11 063 of head-room measured at `9f4cdac`.

## Not the same thing as the open Plane record

`260814-1419_o_three-plane-files-entered-the-layout-tree-…` says *"Do not answer gap 2 by copying `hooks/lib/staging-drift.ts:182-183`"*. That caution is about the **tracked/untracked split** in `### Which of them a tracked workbench tracks`, where `LIVE_STATE` answers a different question (*is this file in flight during a session*) from the one the split asks (*does a past version answer anything*). It does not apply here. The consumer column asks a third question — *what breaks if this path moves* — and for that question `LIVE_STATE` and `LIVE_PREFIXES` are exactly the right evidence, because a hard-coded workbench-relative path in a classification list breaks on a move the same way a read does. That is the criterion `9f4cdac` wrote. The two records do not conflict and should be fixed separately.

---
Resolved: The criterion `9f4cdac` wrote is now applied to every root-anchored row. `hooks/lib/churn.ts` added to `.guard-state/`; `hooks/lib/staging-drift.ts` added to `.guard-state/`, `.commit-lock/`, `.session-marker`, `.plane-map.json` and `.plane-outbox.jsonl`. Consumers were established by grepping `hooks/*.ts`, `hooks/lib/*.ts` and `bin/*` for every root-anchored path rather than by re-reading the record: the additions are the code constants `TRACKER_NOISE_FILES` (`churn.ts:123-126`), `LIVE_STATE` (`staging-drift.ts:175-183`) and `LIVE_PREFIXES` (`staging-drift.ts:188-189`), and doc-comment mentions were deliberately not counted. `plane.config.yaml` is confirmed correct as it stood — no `hooks/lib` module names it in any list. The three rows `9f4cdac` already fixed were re-read against the criterion and need nothing further. Cost: +160 bytes against the always-on growth bound, leaving 10 903 of head-room; `hooks/lib/__tests__/fixtures/rules-emission.golden` regenerated in the same change.
