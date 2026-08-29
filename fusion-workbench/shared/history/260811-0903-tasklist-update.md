# Tasklist rebuild — 260811-0903-tasklist-update.md

**Agent:** taskplanner (domain `code`)
**Git HEAD:** `7785330`
**Active Circle:** none — no `.active-circle` pointer, so every `OUT_*` resolved into `shared/`
**Output:** `fusion-workbench/tasklist.md` (2872 lines, replacing the 260810-1723-tasklist-update.md queue entirely)

## What was scanned

| Store | Files read | Open records found |
|---|---|---|
| `shared/issues/` (`$SCAN_ISSUES`) | all | **53**, all `_o_`, no `_p_` |
| `circles/260801-1244-guard-rules-write/issues/` | named path | 10 |
| `circles/260801-1244-rule-provenance-header/issues/` | named path | 2 |
| `circles/260807-0923-guard-misst-statt-orakelt/issues/` | named path | 2 |
| `circles/260805-2005-textschicht-gegen-code-nachziehen/issues/` | named path | 1 |
| `circles/260719-1536-plane-mirror-integration/issues/` | named path | 1 |
| `shared/decisions/` + `circles/*/decisions/` | all | 9 open, 5 answered, 15 implemented |
| `shared/planning/` | all | 1 open, deliberately not inventoried (session scope) |
| `shared/reviews/` | listed | 16 files, 10 of them `coderev` |
| `circles/*/_*_circle.md` | all 12 | 1 anticipated, 10 closed, 1 superseded |

The five Circles holding open records are all closed, so `$SCAN_ISSUES` does not reach them. They were
read by naming their paths and are cited in the queue by workbench-relative path. Per the Origin Rule
none was moved and none is proposed for moving.

## Result

- **69 records inventoried**, 68 queued, 2 closed without work.
- **1 queue entry has no record behind it** — the red suite, found by running it.
- **28 tasks need a human answer** before an executor can start; **2 need the user at a machine**.
- **38 tasks are dispatchable now**, 1 of them a prerequisite for the other 37.
- **31 tasks carry no dependency edge** and are parallelisable.
- Routing: 67 to `coder`, 1 to `ontocoder`, 2 to nobody.

## The finding that changes how the session runs

**The test suite is red at HEAD and no record says so.** `cd hooks && npm test` at `7785330`:
41 files, 1142 tests, **1 failed**, 88.04s. `hooks/lib/__tests__/reference-resolution-lint.test.ts`
fails on one dangling citation — `skills/setup/SKILL.md:45` names
`260717-0115_*_live-workbench-split-across-two-layouts-during-conversion.md`, a record whose marker
moved to `_c_` in the last session.

It matters beyond its size. `agents/coder.md:78-80` derives `Result: done` from the suite's exit code,
so every executor dispatched before this is fixed reports `blocked` whatever it touched. That is
precisely the defect queued record `260810-0703_*_the-report-contract-derives-blocked-from-a-suite-exit-code-so-a-known-red-baseline-blocks-every-task.md` describes, and it converted from latent to active
between the two queue builds. It is task 1, and the queue says plainly that it precedes everything
whose acceptance is an exit code.

The cause is worth carrying: **closing a record breaks every citation that names its old marker.** The
record was closed *because* the previous queue classified it as needing no work. The queue's own
close-without-work section now warns about this and names the wildcard form as the remedy.

## Already resolved — reported, not dropped

Two records need no code change. Both still carry `_o_` on disk; renaming that marker is the
reconciler's call.

**`260804-0842_*_the-git-gold-fixture-carries-no-double-pipe-pipe-or-ampersand-joiner-and-no-allow-only-row.md`** (git gold fixture, guard-rules-write Circle) — **obsolete**. All four things it acts
on were deleted by the v6.0.0 measurement rewrite and by `7598073`: the fixture
(`hooks/lib/__tests__/fixtures/git-verdicts-head.json`), the test (`git-branch-guard.test.ts`), the
classifier (`hooks/lib/bash-mutation-guard.ts`) and the segmenter (`hooks/lib/shell-parse.ts`).
Verified by `ls` on each. Its whole ask is coverage for a regression in machinery that no longer
exists.

**`260805-1830`** (domain heuristic reporting `strategic` over a Cargo workspace) — **fixed**. The
cascade at `agents/orchestrator.md:149-172` now reads `counted_by` and then `code_files` before either
`strategic` branch, `bin/fusion-count-sources` supplies the source inventory the record asked for, and
`hooks/lib/domain-cascade.ts` executes the cascade rather than the lint reading its prose. The prompt's
own justification names this exact consuming project: *"122 commits and 108 Rust files … the heuristic
reported `strategic` for five straight days across four sessions."*

## Partly resolved — still queued, with the discharged half named

- **`260811-0114_*_the-queue-rebuild-and-its-history-file-never-entered-a-commit-and-survive-only-in-the-working-tree.md`** (uncommitted queue rebuild): `60f47c2` committed `tasklist.md` and its history file
  and `.commit-msg-tmp` is gone, so the immediate state is repaired. The record itself says that
  "closes nothing"; the three durable questions stay queued as task 5.
- **`260803-1352`** (unclamped guard advisory): both sites it names and the clamp they skip
  (`forEvent`, `EVENT_DETAIL_MAX`) no longer exist anywhere in `hooks/`. The defect moved to
  `hooks/tracker.ts:508`, where `rulesWriteDetail(exempted)` is unbounded and there is now no clamp in
  the codebase at all. Queued as task 18 with corrected coordinates.
- **`260805-1548`** (no duplicate check at filing time): **unblocked**. Its blocking decision
  `260805-1559_*_der-regeltext-ratchet-laesst-keine-erweiterung-zu-und-heute-war-die-erste-noetige.md` moved to `_i_` — the rules-emission ratchet became a growth budget that reports rather
  than fails (`3163281`) — and the decision's own note says the withheld paragraph is now landable.
  The record's "why it isn't in there" section is stale and should be struck in the same pass. Queued
  as task 20, ungated.
- **`260805-1830`** (Rust in the coder's description): `agents/coder.md:19` gained `.rs`; the
  frontmatter `description` and `README-agents.md` did not. Queued as task 35 for the remainder.
- **`260804-2100`** (subdirectory cwd): both clauses of its title are now false — fail-closed is gone
  and the measurement root moved to `measurementRoot()`. The residual is real and is the one
  `CLAUDE.md` still tracks: `hooks/guard.ts:165` resolves the write-tool pre-deny against
  `process.cwd()`. Queued as task 19.

## Human gates

Nine decision records are open and the user chose not to answer them up front. Four of the nine block
queue entries; five block nothing here and are noted so their absence is not misread. Where a task
waits on one, the entry names the decision by path and states what cannot be started without it.

Twenty-eight tasks carry a gate. Six are partial — part of the work is ungated and named separately.
Three of the gates are new since the last queue and form one cluster: the source-root branch, its
missing reach into two more skill bodies, and the domain one-liner in four bodies are one design
question (`260810-2145_*_should-a-repeated-skill-body-snippet-become-a-bin-helper-now-that-one-fact-lives-in-four-executable-copies.md`), which is why they are chained rather than listed side by side.

Two tasks route to nobody: the live Plane body check needs the configured instance, and the emission
measurement needs a machine this session cannot reach.

## Verification method

All 69 were checked against the working tree at `7785330` by reading the file or running the command
the record cites; every queue entry carries a `**Verified:**` line saying what was read or run. Of the
40 records carried over from the 260810-1723-tasklist-update.md queue, all 40 were re-run rather than trusted — every one
is still open. Reconciliation notes inside records were treated as history, not as current truth,
which is what surfaced the three "the record is right and its coordinates are wrong" cases above.

Two measurements moved materially and are recorded in the queue rather than only argued: the guard
event log grew from 11 142 lines / 4.9 MB to **17 443 lines / 8.2 MB** in six days, overtaking
`260805-1859`'s linear projection; and `SKIP_LICENCES` now holds 41 entries against the 26 that
`260810-2110` measured, so both records that quote a figure for it need re-counting rather than
copying.

## Out of scope, noted once

`shared/backlogs/260811-0826_observations.txt` is an untracked user note in a directory the layout does
not define. It carries no marker and is not a defect record, so it was not inventoried. It is worth a
human read: several of its observations are about fusion's own operating cost rather than about any
record in this queue.
