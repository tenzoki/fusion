All three Turn-log ranges drop their own first commit, which is the range-spelling fault this Circle caught and fixed two Turns earlier

---

**Severity:** Medium
**Domain:** code
**Filed by:** coderev, reviewing C2 Turn 4 (`a2a18f9..2ec2bc2`)
**Affects:** `260823-0023-settle-what-travels-between-checkouts:60-62` (`## Turn log`), all three entries
**Cross-references:** `260823-1318-coderev-c2-turn-2.md:10`, where the identical fault was caught and corrected inside this Circle; `260810-1205_*_seven-of-sixteen-commits-in-the-session-range-never-reached-a-review-pass-and-nothing-measures-the-gap.md`, the record behind the `**Reviewed-range:**` mandate that fixed the same class for review files

---

## What is wrong

`d2089e4` filled the `## Turn log` after three Turns, in one pass. All three entries spell their commit range as if `A..B` were inclusive of `A`. Everything in this project that reads `A..B` reads it as git does, exclusive of `A`.

```
- Turn 1 (session 260823-0721): commits 21ae170..e41393e; Coherence verdict coherent; …
- Turn 2 (session 260823-0721): commits e7454e3..5fc3201; Coherence verdict coherent; …
- Turn 3 (session 260823-0721): commits a2a18f9..7cd79f1; Coherence verdict review-needed …
```

Read as git ranges, the three cover 9 + 5 + 2 = 16 of the session's 19 commits, and each gap is that Turn's own first commit:

| Turn | As written | `git rev-list --count` | Commit that falls out | Correct spelling | count |
|---|---|---|---|---|---|
| 1 | `21ae170..e41393e` | 9 | `21ae170` | `3ee8eaf..e41393e` | 10 |
| 2 | `e7454e3..5fc3201` | 5 | `e7454e3` | `e41393e..5fc3201` | 6 |
| 3 | `a2a18f9..7cd79f1` | 2 | `a2a18f9` | `5fc3201..7cd79f1` | 3 |

The corrected spellings tile exactly: 10 + 6 + 3 = 19 = `git rev-list --count 3ee8eaf..7cd79f1`, with no gap and no overlap. So the **commit sets the author meant are right in all three cases**; what is wrong is that the notation used cannot express them, and the notation is the only thing on disk.

**The exclusive reading is this project's, not an outside convention.** `bin/fusion-review-coverage` parses `..` as git does — its own output for this Circle reports `range=3ee8eaf..2f1e3a6 … covers=9`, and `git rev-list --count 3ee8eaf..2f1e3a6` is 9. The three review headers in this Circle spell their ranges the same way and tile under it.

**The Turn-start events already carry the correct exclusive base**, so the right value was on disk when the log was written. `fusion-workbench/orchestrator-events.jsonl`: `turn_start turn=1 … head 3ee8eaf`, `turn=2 … head e41393e`, `turn=3 … head 5fc3201`.

## This is a repeat, inside the same Circle

`260823-1318-coderev-c2-turn-2.md:10`:

> the dispatch named the span `e41393e..b8a4c1a` and listed `e41393e` among its six commits. Written that way the exclusive-from form leaves `e41393e` untiled, and `bin/fusion-review-coverage` reports it uncovered. The header therefore spells the same six commits as `2f1e3a6..b8a4c1a`.

That correction was made, committed, and reviewed in this Circle. The Turn log then made the same mistake three more times, in a single pass, eight commits later. Filling three Turns' bookkeeping at once is what let it happen: the check that catches an off-by-one is comparing the range against the previous entry's end, and there was no previous entry to compare against.

## One adjacent error in the events log

`turn_end turn=3` records `"3 tasks resolved, 4 commits, 7 issues created, 10 issues resolved"`. Turn 3 landed **three** commits (`a2a18f9`, `1544224`, `7cd79f1`; `git rev-list --count 5fc3201..7cd79f1` = 3). Turns 1 and 2 both check out (10 and 6). Named here rather than filed separately because it is the same Turn-3 commit count, arrived at from the other side. The event log is append-only and is not corrected in place; this is a note for whoever reads it, not a repair request.

## Verified

Ran `git rev-list --count` on all six spellings in the table. Read all three review headers and confirmed they tile under the exclusive reading (`3ee8eaf..2f1e3a6` 9, `2f1e3a6..b8a4c1a` 6, `b8a4c1a..a2a18f9` 2). Extracted every `2026-08-23` event from `orchestrator-events.jsonl`, sorted by `ts`, and read the three `turn_start` heads and three `turn_end` details. History over the range is linear with no merges.

## Direction, not a prescription

Rewrite the three ranges as `3ee8eaf..e41393e`, `e41393e..5fc3201`, `5fc3201..7cd79f1` before the closure rename, so the log tiles the session it describes.

The general repair is not in this record. `rules/circle-records.md:154-155` gives the Turn-log format as `commits <hash>..<hash>` and says nothing about which end is inclusive, which is the same silence the `**Reviewed-range:**` mandate had to close for review files. Whoever fixes this class should decide once whether the Turn-log line states the convention, or takes the Turn-start `head` value directly, which is the only spelling that cannot be got wrong because it is already written.

---
Resolved: `71f47c1` rewrote all three ranges to `3ee8eaf..e41393e`, `e41393e..5fc3201` and
`5fc3201..7cd79f1`, and added a Turn 4 entry.

Verified against git and against this session's own slice of the event log rather than against the
commit message. The slice is `orchestrator-events.jsonl:2023-2101` — the file is append-only across
every session this project has run, so a whole-file grep returns six Turns and 68 gate events and is
the wrong denominator. Within the slice, `turn_start` carries `head 3ee8eaf`, `head e41393e`,
`head 5fc3201` and `head 7cd79f1`, which are exactly the four bases now written.

`git rev-list --count` on the three corrected ranges returns 10, 6 and 3, matching the counts the
entries now carry. They tile the session's 19 commits exactly, with no gap and no overlap.

One discrepancy found and it is not in the Turn log: the event log's own `turn_end turn=3` detail
says "4 commits" where the range holds 3. `5fc3201` landed at 11:24:37Z, inside Turn 2 and at Turn
2's own Coherence `gate_hit`, and Turn 2's `turn_end` already counts it among its 6. So the event
detail over-counts by one, in the same direction the Turn log used to. It is a machine-written detail
string in an append-only log, not a tracking claim, and nothing reads it for a total. Recorded here
rather than filed.

Closed by reconciler, second Coherence pass, 260823-2130-reconciliation.md.
