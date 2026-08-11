# The session's closure and filing counts are hand-maintained, and both drifted by two against the disk

---

**Severity:** Low — the net figure happens to be right, which is exactly what let the two errors survive; no decision was taken on the wrong number
**Domain:** code
**Filed by:** reconciler (final reconciliation of session `260810-0844`)
**Affects:** `fusion-workbench/orchestrator-live.md` (`## Session result`), `agents/orchestrator.md` (the Turn-loop bookkeeping that produces those lines)
**Cross-references:**
`shared/issues/260810-0751_o_the-record-about-counting-instances-of-a-shape-gives-three-different-counts.md` (same class — a hand-kept count disagreeing with itself inside one record);
`shared/issues/260810-0820_o_the-turn-1-review-totals-table-says-fourteen-findings-and-the-body-carries-seventeen.md` (same class — a totals table against its own body);
`shared/issues/260801-2038_o_session-bookkeeping-froze-at-turn-1-while-three-turns-ran.md` (the same bookkeeping surface failing in a coarser way)

---

## What is wrong

`orchestrator-live.md` `## Session result` reads:

```
18 defect records closed, 13 filed, 3 decisions filed, 2 reviews written.
Open defects: 48 at start, 43 at end.
```

Counted from the disk and from git at `ed87d87`:

| Figure | Reported | Measured | How measured |
|---|---|---|---|
| Records closed | 18 | **20** | 15 `_o_`→`_c_` renames in `git log --diff-filter=R -M 18b6094..HEAD -- shared/issues/`, plus 5 records added directly as `_c_` in `ed87d87` (filed and closed inside one uncommitted window, so git records no rename) |
| Records filed | 13 | **15** | 15 files in `shared/issues/` whose stamp is `>= 260810-0844` |
| Decisions filed | 3 | 3 | `260810-0920`, `260810-0921`, `260810-1010` — correct |
| Reviews written | 2 | 2 | correct |
| Open at start / end | 48 / 43 | 48 / 43 | correct |

**The arithmetic is self-consistent and still wrong.** `48 − 20 + 15 = 43` and `48 − 18 + 13 = 43` both land on the observed 43, so the endpoint check that would normally catch a miscount passes on either pair. Two compensating errors of the same size cannot be detected by the invariant the session has.

**The likely cause is the five records that git sees as additions, not renames.** The `260810-1032_c_*` set was filed by the `1032` review and closed by `df75004`/`49e5b1d` before anything was committed, so the `_o_` name never reached the index. A count kept by watching renames misses them from the closed side; a count kept by watching new `_o_` files misses them from the filed side. That is precisely the observed −2/−2.

## Why this is worth a record rather than a correction in place

The numbers are derivable. `shared/issues/` is a directory of files whose names carry both the marker and the filing timestamp, and the session start stamp is in `agentstate.yaml`. Every figure in that block is a two-line shell command against data that is already on disk, and none of them is currently computed that way.

## Acceptance criteria

- [ ] The `## Session result` counts are derived from `shared/issues/` and the session-start stamp at write time, not accumulated across Turns by hand.
- [ ] The closed count is derived from the marker on disk, not from git renames, so a record filed and closed within one commit is counted on both sides.

---
Resolved: `agents/orchestrator.md` Phase 4 gained `### The record counts are computed, not tallied` — a documented command, not a fourth measurement module. Two rules, one shell block: a record was **filed** this session when its own filename stamp is at or after `session.started`, and it **reached a marker** this session when the name it carries now did not exist at `session.git_head_at_start`. The second rule is what closes the −2/−2: the five records filed and closed inside one uncommitted window are counted on both sides, because neither rule consults a git rename. The block prints `filed <kind>` and `now_<marker> <kind>` counts and the four budget-table rows are read off them unaltered (`Issues created`, `Issues resolved`, `Decisions answered`, `Decisions implemented`); the same figures go into the user report. Where the anchor is missing or the project does not track its workbench it prints `records=unmeasured`, and the prompt says to write that word into the cells rather than a zero. Two bounds are stated in place: a closed record *moved* between stores reads as closed again, and the untracked-workbench case is what the `git cat-file -e` probe exists for. The State Tracking counter list now says the four record counters are not the ones the table is written from.

**No fourth module was added**, deliberately. Decision `260811-1146_*_does-the-measurement-family-get-a-shared-chassis-before-the-fourth-module.md` is open and deferred by the user, and this count needs no module: it is one shell block over data already on disk, run at the moment the table is written, in the same shape as the Circle count at Setup Step 5 and the queue-ground check.

Verified: the block was extracted from the file and run in **bash and zsh**, single-store and two-store, against this session's own range — `8 filed issue`, `5 now_c issue`, `1 filed decision`, cross-checked against `git diff --name-status -M 7785330` (4 renames to `_c_` plus one record added directly as `_c_`). The zsh run is why the store list is turned into lines rather than iterated as `for d in $SCAN_ISSUES`: zsh does not split an unquoted parameter, so that loop would hand `find` one path made of two. `cd hooks && npm test` → 48 files, 1246 tests, exit 0.

**Site note.** The record names `orchestrator-live.md` `## Session result` as the surface. No such section exists in `agents/orchestrator.md` — `grep -c "Session result"` is 0 — so that heading was improvised by the closing session rather than specified. The prompt-side surfaces the counts actually come from are the Phase 4 budget table and the Report-to-the-user bullets, and those are what this change makes derived.
