# Reconciliation — the message-between-checkouts Circle, session 260907-1659

**Status:** Complete
**Filed by:** reconciler, Kai Stalmann <ks@qantr.com>
**Domain:** code
**Verified at:** HEAD `9d99b19d`, range `abcaa823..9d99b19d`, 12 commits, branch `main`

## What was reviewed

One plan, seven decision records (four moved this session, three untouched and open in the shared
store's relevant slice), seven issue records (five filed in the range, one filed earlier in this
Circle, one closed record re-opened for audit), one Circle record, one forum entry, and the
orchestrator's own session history. No review file exists in this Circle: `bin/fusion-review-coverage`
reports `commits=12 reviews=0 uncovered=12`, which the Circle record's Turn log already states and
which the Circle review at Phase 4 is what answers.

## What was updated

| File | Change |
|---|---|
| the plan `260907-1942_*_message-between-checkouts-read-before-pull.md` | `**Status:**` Draft to Complete, marker to closed, `## Reconciliation Log` added with the per-step evidence and the head-room correction |
| `260907-1234_*_the-spec-review-analysis-ends-with-two-lines-of-tool-markup.md` | still open, evidence appended |
| `260907-2301_*_the-retention-decisions-cross-reference-cites-the-tier-heading-by-its-pre-edit-wording.md` | still open, evidence appended |
| `260907-2332_*_two-descriptions-of-the-cleanup-run-order-reverse-the-last-two-steps.md` | still open, evidence appended; the drift widened this session |
| `260907-2003_*_what-does-the-directive-pointer-swap-do-when-the-cited-plan-declines-to-restate-the-directive.md` | still open, the stores searched are named, no marker moved |
| `260907-1659-orchestrator-session.md` | `## Coherence` appended |

Two records were filed, both in the shared store by the Origin Rule: each is a defect in a shipped
mechanism found beside this Directive rather than caused by it.

- `260908-0027_*_the-universal-core-comment-names-five-files-while-the-bound-measures-three.md`
- `260908-0027_*_the-write-time-citation-check-is-silent-on-the-class-that-produced-every-violation-of-this-session.md`

No decision marker was moved. All four that reached implemented were moved by the session itself
and each was verified rather than re-marked.

## The four implemented decisions, checked against what the cited commits contain

Each `Implemented:` line names a commit, each commit exists in the range, and each commit's diff
contains what the line claims.

- The store question, implemented at `af3f23e2` and `97bc8b0b`: the resolver prints `shared/forum`
  for both keys, and the store is named in the layout tree, the filename-pattern table and the key
  table. Read in `bin/fusion-paths` and in both rule files.
- The retention question, implemented at `97bc8b0b`: `skills/archive/SKILL.md` gained the tier-1 row
  selecting by filename age, and the tier heading widened from terminal markers to terminal markers
  and age, which is the half the ruling required in as many words and the half a row alone would
  have left false.
- The approval-placement question, implemented at `4c421f29`: the message half sits inside Step 6,
  and both flag consequences the ruling accepted are stated in the body.
- The one-stop question, implemented at `4c421f29`: the approval rides the existing call as a second
  question, with the draft printed as ordinary output before the gate.

The two `Answered:` lines that cite a location rather than a commit both resolve: one to the Circle
record's `## Grounding snapshot`, one to `260907-1659-orchestrator-session.md` `## Rulings given in
this session`, where the ruling is written out at length. Both name who ruled.

## Key findings

**1. The plan's always-on head-room figure is wrong by 5 239 bytes and the plan text still carries
it.** The `## Current State` table records 9 737 bytes of head-room on the always-on rule surface.
It summed the five files `RULE_BASELINE` labels the universal core; the hard bound measures the
intersection of every agent's emission, which is three files, because two of the five moved to
derived audiences at the two gates of 2026-08-27. Re-measured here from `bin/fusion-rules`'s own
unindented emission list and the file sizes at both ends of the range: floor 65 498, budget 77 498,
core 73 000 with 4 498 free at `abcaa823` and 73 317 with 4 181 free at HEAD. Step 12 found this and
its log states it; the plan was never corrected. **A later reader would have been misled**, and that
is the answer to the question this pass was asked: the row sizes work, it is the row a planner opens
first, and it claims more than twice the room that exists. Corrected in the plan's reconciliation log
rather than in the table, since a plan description is not the reconciler's to rewrite. The root cause
is a comment in the gate's own file and is now filed.

**2. `260906-0115`'s closure holds for what it built and does not reach the fault that recurred.**
The write-time check was live and working through this session — three `citation_form` rows in the
guard event log, all `store-prefixed`. Every one of the nine violations that took the suite red at
step 12 was a different class: a citation spelling the cited record's **current** marker, which
resolves, and which `REPORTED_STATUSES` therefore cannot see. Six of the nine cited this Circle's own
plan as `_o_` while the plan stood at `_o_`. So the closure was not a fix that failed; it was a fix
whose stated exclusion list names `dangling` and not this class, while the record's own acceptance
sentence reads as though every violation is now caught at the write. Filed. The argument that
excludes `dangling` — an undecidable lookup failure — does not transfer: this token resolved, and
the sweep already computes its rewrite mechanically.

**3. The suite was already red at `abcaa823`, and the plan measured against it without noticing.**
Verified independently: `260907-0710-planability-of-the-bounded-dispatch-spec.md` stands unchanged at
that commit carrying two marker-spelled tokens, so `citation-sweep.test.ts` failed there. The plan's
`## Current State` opens "Every present-tense claim below was read or run", and a green suite is not
among its claims, so this is a gap in what was measured rather than a false statement. At HEAD the
sweep reads `files=0 rewrites=0 bare-record=0`, re-run here after the plan's own marker move.

**4. The sixth stopping clause is unmet by construction and is properly recorded.** Confirmed rather
than reported as an omission, per the plan's own bold caveat, step 13's `## 4. What this session
cannot prove`, and the release precondition forbidding a tag until the clause is answered in writing.
Independently verified: the installed resolver exits 4 on the forum scan key for `news` while the
work-tree resolver answers `shared/forum`.

**5. The Circle record's Turn log undercounts the records left open by one.** It reads "Two filed
open: the Directive-pointer conflict and a stale cross-reference." Three records filed in this
session stand open: those two and
`260907-2332_*_two-descriptions-of-the-cleanup-run-order-reverse-the-last-two-steps.md`, filed in the
shared store at 2332 by the orchestrator. Every other head field and Turn-log figure checks out: the
claim names this checkout, both pointer fields resolve, the commit range and its count are right,
`bin/fusion-events turns` reports `turns=1` scoped to this checkout and this session's history file,
all thirteen steps are done, four decisions reached implemented, and review coverage is zero of
twelve. The Circle record is not the reconciler's to edit; the correction is one clause and belongs
to the Phase 4 closure that writes the record's final state anyway.

**6. `agentstate.yaml` is stale and now points at a filename that no longer exists.** It was last
updated at 260907-2316, still shows S10 as the current task at a gate with S10, S12 and S13 queued,
and carries the plan's pre-rename path in both `current_task.source_file` and
`plan_context.plan_file`. Its `key_findings` block repeats the wrong 9 737 figure. It is session
state rather than a tracking record, the orchestrator deletes it on a clean exit, and it is out of
this pass's scope — but a resume off it would now fail on a missing plan file, so it is named here.

**7. The forum entry is exactly to specification, with one property of the design visible in it.**
Twenty lines counted in the file: subject, blank, eight lines of the person's part in the chat
language, blank, nine lines of pointer block in the artifact language, no `**Filed by:**`. Every
record citation in the pointer block takes the storeless wildcard form and each resolves to exactly
one file. The property: its range reads `abcaa823..ec07e1b0` while the session ends at `9d99b19d`,
because the entry is composed before the commit that carries it. That is the same shape as the
accepted cost the plan already states about the two pushes, and no reader is misled by it — the
range names what the entry was written against. Not filed.

**8. Two claims in the tree still carry the wrong head-room figure and neither is repairable.** The
commit message of `97bc8b0b` writes "against 9737 of head-room on the always-on surface", and
`agentstate.yaml`'s `key_findings` repeats it. A commit message is immutable and the state file goes
at the session's exit. Named so that neither is later read as independent corroboration of the plan's
table.

## Verification

- `bin/fusion-citation-sweep --dry-run` — `files=0 rewrites=0 bare-record=0`, re-run after the plan's
  marker move.
- `cd hooks && npx vitest run lib/__tests__/workbench-citation-lint.test.ts lib/__tests__/citation-sweep.test.ts`
  — 30 of 30 passing, after every edit this pass made.
- `bin/fusion-review-coverage` — `commits=12 reviews=0 uncovered=12 verdict=uncovered`.
- `bin/fusion-events turns` — `turns=1`, `scope=checkout`.
- `git diff abcaa823 HEAD` over the two growth-bound test files and their helper — empty, so no
  baseline moved anywhere in the range.
- Always-on core re-measured by hand from the three unindented `emit_if_exists` lines in
  `bin/fusion-rules`: 73 000 bytes at `abcaa823`, 73 317 at HEAD.
