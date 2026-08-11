# Reconciliation — 260811-2330

**Agent:** reconciler
**Domain:** code
**Session reconciled:** `260811-0752` (five Turns, exited Phase 2 on the Max-Turns circuit breaker)
**Range:** `7785330..31746d1`, 37 commits
**Active Circle:** none — every store resolved to `shared/`
**Coherence verdict:** `review-needed`, written to `shared/history/260811-0752-orchestrator-session.md` `## Coherence`

---

## What was reviewed and what was changed

| Population | Reviewed | Changed |
|---|---|---|
| Defect records | 249 in `shared/issues/`, 193 across eight Circles | 5 |
| Decision records | 67 live (32 shared, 35 in Circles) | 9 |
| Plans | 6 in `shared/planning/` | 1 |
| Reviews | 12 in `shared/reviews/`, of which 2 from this session's evening | 2 |
| Work queue | `tasklist.md`, 74 entries | 0 — not the reconciler's to edit; one defect filed against it |
| New records filed | — | 1 |

Nothing was renamed. Every marker on disk was already correct.

## 1. The work queue — current, and the check that says so is trustworthy here

**Verdict: `queue: current — unaffiliated backlog, no Circle active and none named`.** Run as
written at `agents/orchestrator.md:871`, against `fusion-workbench/tasklist.md` and an absent
`.active-circle`: `G=none`, `AC=none`, row 1 of the ground table.

**The check is trustworthy at that site, and record `260811-1915` says otherwise because it read
the wrong copy.** There are two derivations of the queue head in one prompt:

- `agents/orchestrator.md:871`, the `#### Reading a queue` snippet the ground table and
  `/fusion:setup` Step 3 both cite — **fixed** by commit `b4eb4db` (2026-08-11 10:36, Turn 1 of
  this session), which replaced the two-alternative `grep -oE` with a `sed` form reading the value
  after the label. Returns `none`.
- `agents/orchestrator.md:829`, the Phase 4 step 4 retirement block — **still carries the old
  expression**. Returns `.active-circle` on the same head line.

Verified at `9f84254`, the HEAD in force at the 19:00 resume: line 747 already carried the fixed
form and line 705 the old one. So the `STALE` verdict this session recorded at Setup and repeated
into `260811-1915` could not have come from the canonical snippet.

The record stays open — its second witness (`260811-1425`, transferred from a consuming project)
is against the surviving copy and is unaffected — and is annotated with the measurement. This is
also the divergence `260810-0511` predicted, now realised and costing one false measurement inside
one day; that record is annotated too. Queue entry 29 closes both at once by deleting the second
copy rather than patching it.

**The queue is behind the workbench, which is a separate question and the answer is 18 commits.**
Built at HEAD `f70cb07` (17:34); HEAD is `31746d1`. Since the build: 15 records moved `_o_`→`_c_`,
8 more were filed and closed, 17 were filed and are still open, and 3 decisions moved `_a_`→`_i_`.
Its 74 entries were re-checked against disk one by one: 13 are marked `[x] done` and all 13 have a
`_c_` record behind them; the 61 marked `[ ] open` all have an open record or an unrealised `_a_`
decision behind them. **No entry contradicts its record.** What the queue is missing is entries, not
corrections — a rebuild, which is the taskplanner's job at the next session's Phase 1.

**One defect in the queue, filed rather than fixed** (the reconciler does not edit `tasklist.md`):
`shared/issues/260811-2330_*_the-work-queue-carries-eighty-one-literal-marker-citations-and-three-are-already-dead.md`.
81 record citations use a literal marker against 7 in the ratified wildcard form, and three are
already dead — including task 1's citation of `shared/decisions/260806-0015_i_zitierform-fuer-workbench-records.md`,
which is the record that ratified the wildcard form and has never lived in `shared/`. The citation
lint's surface (`hooks/lib/__tests__/reference-resolution-lint.test.ts:118-155`) never reads
anything under `fusion-workbench/`, so nothing was going to catch it.

## 2. Decision records — measurement reproduced, stub half repaired

**`260811-2146`'s measurement reproduces exactly at HEAD: `total=67 mismatched=34 stub=12`.** No
decision record was touched after the review commit `e3da397`, so nothing has moved.

**The 34 needs one qualification.** It compares the `**Status:**` field against the marker's
vocabulary word by exact equality. Five of the 34 already state the right word and carry a trailing
parenthetical about a past correction (`implemented (corrected from 'open' by reconciliation
260804-1021…)`). **The substantive disagreement is 29 of 67, not 34.** That matters for the lint the
record's acceptance criteria ask for: written to exact equality, it fails five records that earlier
reconciliation passes deliberately annotated.

**The 29 were not touched**, per the record's own instruction and `agents/orchestrator.md:288` —
the disagreements are the evidence for `260802-0920`, which asks whether the field should exist.

**The stub half is done.** Thirteen unfilled `<set when status moves to _X_>` lines stood above a
filled annotation of the same kind, across nine records; all 13 are gone, along with the wholly
unfilled blocks carrying most of them (32 placeholder lines in total). Three records keep a
placeholder on purpose — `Deferred:` and `Superseded by:` lines on records that were never deferred
or superseded state nothing false and are not contradicted by anything beside them. The issues side
had exactly one instance of the same shape, an empty `Resolved:` in
`shared/issues/260810-1730_*_die-erzeugung-von-portfolio-md-…`; it is gone with them. Acceptance
criterion 2 of `260811-2146` is met.

## 3. The records this session closed — 53, every one with a note that cites something real

**53 closures**, established by comparing every record path's marker at `7785330` with its marker
at HEAD rather than by git's rename detection, which finds only 47 (six resolution notes were long
enough to push the rename below the similarity threshold). The split: 24 records that were already
open at 07:52, and 29 filed and closed inside the session.

**All 53 carry a resolution note.** No second instance of the loss `951c809` recovered. Notes are
written in three shapes — a bare `Resolved:`, a bold `**Resolved:**`, and a `## Resolved (…)`
heading — which is variance the convention in `rules/fusion-workbench-conventions.md`
`### Issue files` does not authorise but which costs nothing to read; not repaired, and not filed.

**Citations inside the notes were resolved, not trusted.** Every backticked commit hash resolves to
a commit. Every path citation resolves to a file, with four exceptions, all repaired or explained:

| Citation | Disposition |
|---|---|
| `shared/decisions/260811-1534_o_…` in `circles/260801-1244-guard-rules-write/issues/260805-1859_c_…` | stale marker — rewritten to the wildcard form |
| `shared/decisions/260810-0710_o_…` in `shared/issues/260810-1205_c_seven-of-sixteen-commits…` (twice) | stale marker — rewritten to the wildcard form |
| `shared/decisions/260811-1522_o_…` in `shared/issues/260811-1413_c_readme-hooks-still-describes…` | stale marker — rewritten to the wildcard form |
| `shared/history/260810-1907-reconciliation.md` in `shared/issues/260810-1730_c_die-erzeugung-von-portfolio-md-…` | **not a defect here** — the record was transferred from a consuming project and the citation is into *that* project's workbench. Left as written. |

**The two transferred records both closed correctly.** `260810-1730` in `b53c7dd`, `260811-0932` in
`282ef42`, each with a `Resolved:` note naming the commit's substance and the verification run.
The third transferred finding was merged into `260811-1915` as a second witness rather than filed
twice, which is right, and is the only part of that record still standing after the measurement in
section 1.

## 4. The suite

`cd hooks && npm test` at HEAD `31746d1`, twice, one agent, nothing else in flight:

- Run 1 — 51 of 52 files, 1335 of 1349 tests, one `Error: Worker exited unexpectedly` from
  `tinypool`. One file's 14 tests never reported.
- Run 2 — 52 files, **1349 tests, exit 0**.

**Green.** The crash is the load-sensitive class already recorded as `260810-1135`, `260811-1409`
and `260810-0918`, not a new failure. It is worth one thing beyond that, and it is written into
`shared/decisions/260811-2009_*_is-the-hooks-suite-meant-to-be-run-concurrently-with-itself…`: it
happened with **no** parallel executors, so at least one instability of this suite survives the
removal of cross-executor concurrency entirely. That removes option 4's remaining claim
(serialising executors leaves vitest's own workers running concurrently inside each invocation) and
leaves option 2's per-run build output as the only option addressing the intra-run case. The
decision keeps its `_o_` marker; only evidence was added.

## 5. Other records reconciled

- `shared/planning/260801-1122_o_spec-normative-consolidation.md` — untouched by this session and
  out of the Directive's scope by the queue's own statement of ground; marker stays `_o_`. A new
  Reconciliation Log entry records that its C5 sections now describe a **deleted** mechanism rather
  than a merely historical one: `hooks/lib/command-word.ts`, `shell-parse.ts` and
  `git-branch-guard.ts` do not exist, and `hooks/guard.ts` names the mutation classifier only in
  three retirement comments. The curator capability itself is unaffected. Three of the spec's four
  Circles are closed; `circles/260801-1244-curator` is still `_a_` and its agent does not exist.
- `shared/reviews/260811-2152-coderev-turn-4-range-b261d83-951c809.md` — disposition table appended:
  6 of 10 findings closed, all in Turn 5, in the order the review recommended.
- `shared/reviews/260811-2309-coderev-turn-5-orchestrator-loop-and-bookkeeping-machinery.md` —
  disposition appended: 8 of 8 open, none worked, because the loop exited in the same commit that
  filed them. Its release recommendation was re-verified rather than taken on trust.

## 6. Left for someone else

Four things this pass found and did not fix, because they are not the reconciler's to fix:

1. **The session history file is incomplete.** `shared/history/260811-0752-orchestrator-session.md`
   has no Turn 5 entry, its head still reads `**Status:** In progress`, and its `## Session result`
   block still says "Turn 3 closed. Phase 3 reconciliation not run." That is the orchestrator's
   Phase 4 work and is expected to be outstanding at this point; it is named here so it is not
   forgotten. The `## Coherence` section this pass appended is the only part of that file the
   reconciler owns.
2. **`bugreports/` at the repository root is untracked, unignored, and consumed.** It holds the
   three findings the user transferred from the KRK project plus `krk-meldungen.txt`. All three
   have been dealt with (two closed in the store, one merged into `260811-1915`). It is outside
   `fusion-workbench/`, no convention names it, and `git add -A` would commit it.
3. **The 29 decision records whose `**Status:**` disagrees with their marker** — the user's call,
   per `260811-2146`.
4. **The uncommitted tree.** This pass touched 21 workbench files and added 2 (this log and the
   new record), all unstaged; `orchestrator-events.jsonl` is modified by the hooks, not by this
   pass. The staging check at Cleanup will name them.

## Counts

| Metric | Value |
|---|---|
| Open defect records at session start (`7785330`) | 69 — 53 shared, 16 in Circles |
| Open defect records at HEAD (`31746d1`) | 74 — 64 shared, 10 in Circles |
| Open defect records after this pass's own filing | 75 — 65 shared, 10 in Circles |
| Records closed this session | 53 — 24 pre-existing, 29 filed and closed |
| Records filed this session, still open | 29, of which 22 by `coderev` |
| Of those 29, filed against this session's own commits | 12 (Turn-4 review 4, Turn-5 review 8) |
| Decisions: open / answered / implemented / deferred | 1 / 12 / 50 / 4 |
| Suite | 52 files, 1349 tests, exit 0 |
