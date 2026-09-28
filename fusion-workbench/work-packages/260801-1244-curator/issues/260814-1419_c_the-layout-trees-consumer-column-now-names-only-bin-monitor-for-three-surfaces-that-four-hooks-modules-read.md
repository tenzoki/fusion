The layout tree's consumer column now names only `bin/monitor` for three surfaces that four `hooks/lib` modules also read at a fixed path

---
Ledger entry L24 of the curator run rewrote the consumer column of `rules/fusion-workbench-conventions.md` `## fusion-workbench Layout`. The old citations (`hooks/tracker.ts:33-36, bin/monitor:72-75`) were stale line numbers and removing them was right. What replaced them under-names the consumer set: `agentstate.yaml`, `orchestrator-live.md` and `orchestrator-events.jsonl` now cite `bin/monitor` alone, while four modules under `hooks/lib/` construct those same paths at fixed workbench-relative positions. The prose two lines below the tree promises the opposite: *"Each is read at a fixed root-relative path by the consumer named beside it in the tree, and none of those consumers has a fallback path — relocating one into a Circle or into `shared/` breaks it silently."*

---
**Found by:** coderev, Turn-3 incremental review of `5c843e6..0301909`, review file `260814-1419-coderev-curator-turn-3.md`.
**Owner:** `coder` — the fix is an edit to a shipped rule file.
**Severity:** Medium.
**Affects:** `rules/fusion-workbench-conventions.md` `## fusion-workbench Layout`, the tree's `agentstate.yaml`, `orchestrator-live.md` and `orchestrator-events.jsonl` rows.
**Cross-references:** `260814-1332-curator-run.md:625` (the ledger entry and its evidence); commit `1a36fe4`.

**Verified 2026-08-14 at HEAD `0301909`,** by running the search the ledger entry ran, widened one directory:

| Surface | Named in the tree today | Also constructs the path at a fixed position |
|---|---|---|
| `agentstate.yaml` | `bin/monitor` | `hooks/lib/state-drift.ts:97`, `hooks/lib/review-coverage.ts:125`, `hooks/lib/churn.ts:125`, `hooks/lib/staging-drift.ts:175` |
| `orchestrator-live.md` | `bin/monitor` | `hooks/lib/churn.ts:123`, `hooks/lib/staging-drift.ts:176` |
| `orchestrator-events.jsonl` | `bin/monitor` | `hooks/lib/state-drift.ts:98`, `hooks/lib/churn.ts:124`, `hooks/lib/staging-drift.ts:180` |

`hooks/lib/state-drift.ts:97-98` is the load-bearing pair:

```ts
const STATE_REL  = `${WB}/agentstate.yaml`;
const EVENTS_REL = `${WB}/orchestrator-events.jsonl`;
```

`hooks/tracker.ts:96-101` imports `measureStateDrift` from that module and runs it on **every guarded tool call** (`hooks/tracker.ts:307`). So relocating `agentstate.yaml` breaks the drift measurement silently, which is exactly the failure the paragraph under the tree says the column exists to prevent — and the column no longer names the reader it would break.

**Why the pass produced it, which is the part worth fixing.** The evidence recorded at `260814-1332-curator-run.md:625` is `grep -n "agentstate\|orchestrator-live\|orchestrator-events\|guard-state" hooks/tracker.ts`, scoped to that one file. Inside `hooks/tracker.ts` the finding is correct: only comments match, at lines 221 and 709. The same entry then *did* widen the search for the fourth row, finding `hooks/lib/events.ts:18` and `hooks/lib/guard-state-file.ts:119` and adding both to the `.guard-state/` row. One row of four got the wider search; three did not. The inconsistency is inside a single ledger entry, so this is not a judgement the pass made and defended.

**The fix.** Restore the hooks consumers on the three rows, in the file-only citation form the same entry chose for `.guard-state/` (no line numbers — that is what made the old citation rot):

```
├── agentstate.yaml            # bin/monitor, hooks/lib/state-drift.ts, hooks/lib/review-coverage.ts, hooks/lib/churn.ts, hooks/lib/staging-drift.ts
├── orchestrator-live.md       # bin/monitor, hooks/lib/churn.ts, hooks/lib/staging-drift.ts
├── orchestrator-events.jsonl  # bin/monitor, hooks/lib/state-drift.ts, hooks/lib/churn.ts, hooks/lib/staging-drift.ts
```

Adds bytes to an always-on file, so it is charged against the growth bound armed in T4 and needs the golden regenerated in the same commit.

**One judgement the fix has to make, and it should be made explicitly.** `churn.ts` and `staging-drift.ts` name these paths in exclusion and classification lists rather than reading their contents. That is still a fixed root-relative dependency that breaks silently on a move, which is the property the column tracks, so the recommendation above includes them. If the column is meant to name readers only, say so in the column's own prose — do not leave the distinction to be re-derived.

---
Resolved: 9f4cdac. The three root-anchored rows in `rules/fusion-workbench-conventions.md` name
their consumers again, in file-only citation form, verified by grep over `hooks/lib/*.ts` at HEAD
rather than by reading the prior text. The judgement this record asked for is stated in the prose
under the tree: `churn.ts` and `staging-drift.ts` only name the paths rather than reading them at a
fixed position, they stay in the column all the same, and what breaks on a move is the same
dependency either way.
