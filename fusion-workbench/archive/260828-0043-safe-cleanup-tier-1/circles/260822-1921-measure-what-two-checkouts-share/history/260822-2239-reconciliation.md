# Reconciliation 260822-2239-reconciliation.md

**Agent:** reconciler
**Domain:** code
**Circle:** `260822-1921-measure-what-two-checkouts-share`
**Session:** `260822-2204-orchestrator-session.md`
**Range:** `f90de0c..b938f68`, 2 commits
**Aggregate verdict:** coherent

## What was reviewed

Both stores, per the two-store rule for every `SCAN_*` key.

| Kind | Circle | Shared | Updated by this pass |
|---|---|---|---|
| Plans | 0 | 6 files, 1 open (`_o_`) | 1 |
| Issues | 1 file, 1 open | 269 files, 120 open (`_o_`) | 2, plus 1 filed |
| Decisions | 1 file, 1 open | 62 files, 24 active (`_o_` + `_a_`) | 1 |
| Reviews | 0 | none | 0 |
| History | 5 files including this one | none | 1 written |

Counts taken at 260822-2239-reconciliation.md, after this pass's own filing. The open-issue figure includes the defect
filed below.

## Discrepancies: 11 found

Four corrected in tracking files, one filed as a new defect, four reported to the orchestrator as
Phase-4 work it alone may write, two annotated where they stand.

### Corrected

1. **All six met acceptance criteria of `### C1` were unticked.** Ticked in
   `260822-1136_*_spec-fusion-becomes-a-multi-user-tool.md:134-139`, with the
   evidence for each recorded in that file's `## Reconciliation Log`. Criterion 7 deliberately left
   unticked: it is a conditional whose antecedent is false.
2. **The spec carried no reconciliation entry for this session.** Appended. `**Status:**` stays
   `Partially Complete` and the marker stays `_o_`: two of five capabilities are delivered and C2
   through C4 are untouched.
3. **`260801-2038_*_session-bookkeeping-froze-at-turn-1-while-three-turns-ran.md` was
   closed on a mechanism that no longer exists.** Its `Resolved 260811-1005` note rests on
   `hooks/lib/state-drift.ts` and three callers. None of the four is at HEAD, verified by file:
   `hooks/lib/state-drift.ts`, `hooks/lib/__tests__/state-drift.test.ts` and
   `hooks/dist/state-drift.js` are absent, `bin/` holds no `fusion-state-drift`, and the only
   surviving mention of `state_drift` is `bin/monitor` rendering events already in the log.
   `hooks/tracker.ts:246` and `agents/orchestrator.md:238` both state the removal, and the latter
   names this record by number. A `Revised by:` line was appended; the marker stays `_c_` and the
   `Resolved:` note is left unedited, per `rules/fusion-workbench-conventions.md`
   `### Issue files`.
4. **`260801-1020_*_plane-mirror-circle-closed-with-empty-turn-log.md` had no record of
   the current instance.** One `Also seen: 260822-2236_*_the-four-session-bookkeeping-surfaces-froze-again-and-the-detection-that-closed-the-first-record-has-been-removed.md` line appended. Its part 2, making the
   omission detectable, is further from existing than when it was written.
5. **`260822-1136_*_how-does-the-tracked-event-log-behave-when-two-checkouts-both-appended-to-it.md`
   carried no pointer to the measurement that settles its option 1.** The report's `## Findings`
   section 7 measured both the benefit and the ordering cost, and its own recommendation 2 says it was
   deliberately not appended to the record. Appended here as reconciliation evidence. Marker unchanged
   at `_o_`: nothing on disk chooses between the three options, and `.gitattributes` still does not
   exist at the repository root, re-checked at HEAD.

### Filed

6-9. **The four session-bookkeeping surfaces froze at the Turn boundary, for the fifth time, and nothing
   measures the condition any more.** `agentstate.yaml` says T-1 is running and T-2 queued;
   `orchestrator-live.md` says `Tasks: 0/2 | Commits: 0`; the Circle record's `## Turn log` is empty;
   the session history's `**Mode:**` reads `(not yet resolved — Phase 0 pending)` and its
   `## Session log` holds no entry. `orchestrator-events.jsonl` carries `task_done` for both tasks and
   `turn_end` for Turn 1, all at `2026-08-22T20:28:48`, and two commits landed. Filed as
   `260822-2236_*_the-four-session-bookkeeping-surfaces-froze-again-and-the-detection-that-closed-the-first-record-has-been-removed.md`,
   in the shared store per the Origin Rule: this is a property of how a session runs, not of the
   measurement this Circle was executing. The four surfaces count as four discrepancies and as one
   defect: a reader checking any one of them should find the record, and the fix is one fix.

### Annotated where they stand

10. **Criterion 5 of `### C1` says the new record "is filed in the same Circle", and it is filed in
    `shared/decisions/`.** It was written at the Rebalance gate of session
    `260822-1009-orchestrator-session.md`, when no Circle was active, so the Origin
    Rule's "unknown origin means `shared/`" gives that placement. The substance is met; the literal
    placement clause is not. Ticked with the deviation stated in the spec's reconciliation entry.
    Nothing is moved: reach is cited, never re-placed.
11. **The report's verdict table scopes the isolation failure to nesting; its own `## Implications`
    states the general form.** The table's third row reads "placed **inside** a directory that already
    holds a workbench", while `## Implications` states the precondition correctly as "each tree carries
    its own `.fusion-setup`". The general form is what the addendum to `260822-1610_*_how-does-fusion-support-several-people-working-one-project-at-once.md` carries, so the
    durable record is the accurate one and nothing propagates the narrower reading. Not filed: the
    narrower row is a summary of the case that actually occurred, not a false claim.

## What was verified against the tree rather than against a report

The previous reconciliation found three claims that did not survive checking, two of them in reports
whose own text said they had checked the tree. Every claim below was opened at its own source.

**The two checkable claims the dispatch named.**

- `bin/fusion-workbench-root` walks upward as the nested finding describes: `current="$(pwd -P)"`, a
  `while` loop testing `"$current/fusion-workbench/.fusion-setup"`, `dirname` per iteration, exit 1 at
  the fixpoint. `hooks/lib/workbench-root.ts` `findWorkbenchRoot()` performs the identical walk with
  `resolve`/`dirname`, so the report's claim that agents and hooks answer alike holds at the source.
- `.fusion-setup` is rewritten by every Setup with the checkout's absolute path:
  `skills/setup/SKILL.md:94-98` writes it with `printf ... > ./fusion-workbench/.fusion-setup`, a
  truncating redirect, and the second field is `"$(pwd -P)"`. This repository's own committed marker
  reads `{"setup_at":"2026-08-22T10:06:53+0200","setup_pwd":"/Users/k1/Projects/productive/fusion","plugin_version":"10.5.0"}`,
  and `git log -- fusion-workbench/.fusion-setup` shows `06d1bd1` as its most recent write, which is
  this session committing the instance that had been dirty since the morning's Setup. Both halves of
  the filed defect are reproduced.

**Two further report claims, checked because they are cheap and load-bearing.**

- `hooks/lib/events.ts:102` and `hooks/lib/guard-state-file.ts:186` each carry
  `mkdirSync(paths.stateDir, { recursive: true })` at exactly those lines, so the report's
  self-healing claim for `.guard-state/` is right.
- `diff -q "$FUSION_PLUGIN_ROOT/bin/fusion-workbench-root" bin/fusion-workbench-root` reports no
  difference, so the report's scope claim that the measurement is insensitive to which copy ran holds
  at this HEAD.

**The scratch cleanup.** `/tmp/fusion-c1-measure` and `/private/tmp/fusion-c1-measure` are both absent.
`git status --porcelain` over the repository reports one entry, ` M fusion-workbench/orchestrator-events.jsonl`,
which `bin/fusion-staging-drift` classifies as `in-flight` with `verdict=clean`. Nothing the analyst
built landed inside the repository, and no untracked file remains. The measurement is therefore not
reproducible from the tree, which is the cost the Circle's Grounding accepted when it chose a throwaway
project; what is reproducible are the four mechanism claims above, and all four held.

**Every record this session touched.** `git diff --name-only f90de0c..b938f68` returns eight paths, all
under `fusion-workbench/`. Zero shipped files changed. Two records were filed into the Circle, both
correctly `_o_` and both correctly Circle-scoped: the defect arose from the Directive's own measurement
and the decision from its own finding. One addendum was appended in `shared/`, to
`260822-1610_*_how-does-fusion-support-several-people-working-one-project-at-once.md`, which correctly
stays `_a_`: no commit realises the answer, and the addendum says so itself. `260719-2141_s_` is
terminal and carries its `Superseded by:` line. `cd hooks && npm test` exits 0 (41 files, 724 tests),
which is what carries `workbench-citation-lint.test.ts` over every citation added this session.

**The Circle record's head fields.** `**Active session history:**` cites this session's file, written at
Setup in the same command that created it. `**Active spec/plan:**` reads `(none yet)`, and that matches
the account: `skills/next/SKILL.md:220` says the field "is left exactly as it stands" and that the skill
"must not guess", while `agents/orchestrator.md:275` would have written it on the same act. The
divergence is filed as
`260822-2045_*_a-circles-head-fields-end-up-in-different-states-depending-on-which-of-the-two-activation-routes-ran.md`,
still open. The knock-on the issue predicts also holds and is correct as it stands: because no path was
written, the record's `## Directive` still carries prose rather than the pointer literal, which is
exactly what `rules/circle-records.md:173` requires while the field reads the sentinel.

**Review coverage.** `bin/fusion-review-coverage --since f90de0c` reports `commits=2 reviews=0
uncovered=2 verdict=uncovered`. Both commits touch only `fusion-workbench/`, so no reviewer had a
shipped file to open. `260815-2109_*_may-a-circle-close-over-an-uncovered-review-range-and-who-decides.md`
settles that coverage is advisory and its own 260819-1400 note names precisely this padding: the
uncovered count includes tracking-file commits a reviewer has nothing to open in. The gap is named
here so the closure note can carry it, and it does not flag the Artifact edge.

## Markers moved

None. Every marker in scope is already right: `260822-1610_*_how-does-fusion-support-several-people-working-one-project-at-once.md` stays `_a_` because its realisation is C2
through C4 and none of it is on disk; `260719-2141` stays `_s_`; the two records filed this session stay
`_o_`; `260801-2038` stays `_c_` under a `Revised by:` line rather than reopening, per the conventions;
the spec stays `_o_` with `Partially Complete`.

## Misfiled — should be a decision

Nothing. Every open item examined in both stores is filed as the kind it is.
