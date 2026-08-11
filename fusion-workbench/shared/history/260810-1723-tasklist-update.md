# Tasklist rebuild — 260810-1723

**Agent:** taskplanner
**Domain:** code
**Git HEAD:** `5ef92eb`
**Active Circle:** none — every store resolved to `shared/`
**Output:** `fusion-workbench/tasklist.md` (rebuilt from scratch, 2117 lines)
**Status:** Complete

## What was asked

Rebuild the work queue against the current tree, scoped to defect records only. The session mode is
`issues`: the user's directive is to keep fixing defects first, so the one open plan and the seven open
decisions were inventoried and deliberately left out of the queue. The queue was to be ordered
ungated-first, so the tasks needing no user decision can all be worked before the human-gate questions
are answered in one batch.

## What was scanned

| Store | Read | Queued |
|---|---|---|
| `shared/issues/` | 47 open defect records (`*_o_*`; no `*_p_*` exist) | 45 tasks + 2 close-without-work |
| `shared/planning/` | 1 open plan (`260801-1122_o_spec-normative-consolidation`) | none, by instruction |
| `shared/decisions/` | 7 open decisions | none, by instruction |
| `shared/reviews/` | the 260810-1632 coderev pass over `430d73a..HEAD`, source of 5 new records | as task sources |
| `shared/history/` | recent session entries for context | — |
| `circles/*/issues/` | not inventoried — the user leaves these for a later session | — |

## Result

- **45 tasks queued.** 25 need no user decision (tasks 1-25); 20 carry a `**Human gate:**` line
  (tasks 26-45), three of them partial.
- **2 records close without work**, unchanged from the previous build: the lint-gate scope questions
  (`260717-0031`, all four answered in `path-literal-lint.test.ts`) and the two-layout conversion window
  (`260717-0115`, no longer reproducible).
- **0 blocked.** No task waits on another task that is missing from the queue.
- **Routing:** 44 to `coder`, 1 to `ontocoder` (the two `stilwerk/default-voice-*.yaml` profiles).
- **14 dependency edges**, 6 of them genuine content dependencies and 8 sequencing choices inside a
  contended file. 24 tasks have no edge at all and are parallelisable.

## Against the previous queue

The 260810-1434 queue was built at `430d73a` and inventoried 45 records. Nine commits landed since.

- **40 of its records are still open** and were each re-verified today rather than carried forward.
- **5 closed:** `260809-2243` (stray `</content>` tag, `e0acdb6`), `260810-0352` (Setup Step 5 helper
  absence, `26ea3c3`), `260809-2023` (churn key anchored to cwd, `25c5454`), `260801-1020` (archive's
  durability premise, `4f16c60`), `260810-0507` (Plane doc key shape, `7c4dfb2`).
- **7 records were new to this build:** the commit-message truncation and the release-ordering record,
  both filed by the session that produced the range, plus five from the `coderev` pass over it. Three of
  the five are residuals of the churn work that closed one of the five above.

Two decisions moved `_a_` → `_i_` in the same range (`260810-0920`, `260810-0921`); neither was ever a
queued task. Two new decisions were filed (`260810-1544`, `260810-1635`) and are out of scope here.

## Verification notes

Every one of the 47 was re-checked against the working tree, not against the record's own reconciliation
notes. Three results moved materially:

- **The drift check has fired.** `grep -c state_drift fusion-workbench/orchestrator-events.jsonl` returns
  **2**, where the previous build measured 0. The second entry is a live reproduction of `260801-2038`:
  the state file said 0 commits while git counted 7. That strengthens the record rather than closing it —
  the detection half now demonstrably works and the prevention half is still absent.
- **The suite-count variance did not reproduce, for the second time.** Three more runs of
  `fusion-plane.test.ts` gave 123/123/123, matching the previous build's three. Six consecutive runs now
  contradict the 96/93 the record measured.
- **Four line-number citations went stale inside the nine commits**, all in the previous queue's own text.
  They are now recorded as evidence in the task filed against that class rather than only argued.

Suite baseline measured rather than assumed: `cd hooks && npm test` gives **40 files, 1072 tests, green,
90.49s** — one file and 32 tests more than at `430d73a`, which is the new churn-key-anchor suite and the
monitor warnings-panel cases.

## One ordering choice worth recording

The previous graph ran the permission-seeding task before the citation-root task because both edit
`skills/setup/SKILL.md`. That was a file collision presented as an ordering, not a content prerequisite,
so it was reversed to honour the ungated-first instruction. Every genuine content dependency survived the
reordering unbroken; none had to be violated. One dependency was discharged rather than carried: the
tracker noise-comment task sat behind the churn-key task, which has since closed.
