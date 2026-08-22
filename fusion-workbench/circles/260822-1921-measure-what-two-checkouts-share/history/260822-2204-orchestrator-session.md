# Orchestrator Session — 260822-2204

**Directive:** Measure what two checkouts of one project actually share and what each keeps to itself — the premise the whole multi-user arrangement rests on and that nobody has ever measured. Taken from the Circle record's `## Directive`.
**Circle:** 260822-1921-measure-what-two-checkouts-share
**Mode:** custom — two tasks read off the spec's `### C1` criteria, no planner pass by user choice
**Status:** Complete

## Setup snapshot

| Item | Value |
|---|---|
| Active Circle | 260822-1921-measure-what-two-checkouts-share (`_t_`) |
| git HEAD | f90de0c |
| Turn budget | 12, no configuration diagnostics |
| Detected domain | code (code_files=103, data_files=10, counted_by=git-ls-files) |
| Interrupted session | none |

## Open state

Both stores counted, per the two-store rule for every `SCAN_*` key.

- Open defects: 0 in the Circle, **119** in the shared store.
- Open plans: 0 in the Circle, 1 in the shared store (the multi-user spec, Partially Complete).
- Open decisions: 0 in the Circle, 5 in the shared store.
- Circles: 15 records — 1 active, 11 closed-coherent, 2 bounded, 1 superseded. No anticipated Circle
  remains, because this session's own activation consumed the only one.

## Setup notes

- The Circle record's `**Active session history:**` was `(none yet)` and is set to this file, in the
  same command that created it. `**Active spec/plan:**` is left as it stands: writing it belongs to
  the activation act, which `/fusion:next` performed and which declines it by its own text. That
  divergence is filed as `shared/issues/260822-2045_*_a-circles-head-fields-end-up-in-different-states-depending-on-which-of-the-two-activation-routes-ran.md`.

## Session log

### Turn 1 — the measurement and the addendum

**T-1 (analyst).** Measured what two checkouts of one project share, over the four-class state
partition, in two arrangements plus the nested case. Built under `/tmp/fusion-c1-measure/` and
deleted it. Verdict: the premise holds for both intended arrangements, on the precondition that each
tree carries its own `.fusion-setup`. Commit `06d1bd1`.

Three results beyond what was asked. The three-way question collapsed to two answers — no second
tree ever received the first tree's copy of a workbench file, so sharing is only ever the upward
walk. A second checkout has no active Circle while holding a record whose marker says one is active,
and nothing states what an orchestrator should do there. And the spec's class R3 does not survive
measurement for `.fusion-setup`, which every Setup rewrites.

**That third finding was visible in this working tree all day and I filtered it out.** The
`.fusion-setup` diff sat in every `git status` I ran across two sessions, and I excluded it from each
read as in-flight without opening it once. The classification is almost right, which is what made it
effective at hiding the case where it is wrong. The analyst found it by looking.

**T-2 (orchestrator).** Appended the addendum to
`shared/decisions/260822-1610_*_how-does-fusion-support-several-people-working-one-project-at-once.md`
resolving its closing sentence, and left that sentence standing above the addendum rather than
editing it away. Commit `b938f68`.

### Phase 3

Reconciler verdict **`coherent`**, all three edges. Eleven discrepancies, four tracking files
corrected, one defect filed. It verified the report's four checkable claims against the tree rather
than against the report, and all four held.

**One of its findings is against this session.** Four bookkeeping surfaces stood frozen at their
pre-Turn-1 state: `agentstate.yaml`, `orchestrator-live.md`, the Circle record's `## Turn log`, and
this file's own `**Mode:**` and session log. Filed as
`shared/issues/260822-2236_*_the-four-session-bookkeeping-surfaces-froze-again-and-the-detection-that-closed-the-first-record-has-been-removed.md`,
and its title names the reason it recurred: the measurement that used to catch this was removed on
2026-08-15 with the counters it watched. All four are written now, at Phase 4, which is later than
they should have been.

### Phase 4

Circle closed `_c_`, closure note appended, `.active-circle` cleared. No stop-conditions gate: the
session ran on the spec's `### C1` criteria rather than on a plan, and a spec carries no
`## Where this Circle stops` section.

## Coherence

<!-- RECONCILER-OWNED -->

**Verdict:** coherent

**Edges:**

- **Artifact↔Grounding:** 6 of C1's 7 acceptance criteria verified met (4 by this session's report, 2
  discharged earlier in `02dff51` and re-verified at their files rather than assumed); the 7th is a
  conditional whose antecedent is false. 4 checkable report claims opened at their own source and all 4
  held (`bin/fusion-workbench-root` and `hooks/lib/workbench-root.ts` walk upward identically;
  `skills/setup/SKILL.md:94-98` truncates and writes `$(pwd -P)`; `hooks/lib/events.ts:102` and
  `hooks/lib/guard-state-file.ts:186` both `mkdirSync` recursively; the installed and work-tree helper
  are byte-identical). 0 open coderev or ontorev issues in this Circle. `bin/fusion-review-coverage`
  reports `uncovered=2`, and both commits touch only `fusion-workbench/`, which is the padding that
  `shared/decisions/260815-2109_a_may-a-circle-close-over-an-uncovered-review-range-and-who-decides.md`
  names and settles as advisory, so it does not flag this edge. **11 drift items found, 4 corrected in
  place, 1 filed, 2 annotated; the remaining 4 are the frozen bookkeeping surfaces below.**

- **Artifact↔Directive:** the commits move **toward** the Directive, and both artifacts it named landed
  as specified. `06d1bd1` produced the report with all four measurement clauses answered: the per-entry
  two-arrangement table over the whole state partition (`## Findings` 1), the fresh clone and the
  pre-Setup agent question (3 and 4), the nested case with four placements probed (5), and two trees
  holding one Circle plus both push cases with transcripts (6). `b938f68` appended the addendum to
  `shared/decisions/260822-1610_*_...`, resolving the closing sentence and leaving it standing above
  the resolution rather than editing it away. **The positive result is supported and not merely
  reported:** identity was taken by device and inode and then by an append-and-compare write test, and
  the four mechanism claims re-checked here all held. Two bounds are stated rather than glossed. The
  pre-Setup clause is answered from the two mechanisms an agent's Setup runs, not from a live session,
  and the report names that gap in its own `## Scope` and `## Open Questions`. And the measurement
  apparatus was deleted, as the Circle's Grounding chose, so the report is not reproducible from the
  tree; `/tmp/fusion-c1-measure` is gone and `git status` is clean apart from the in-flight event log.
  The Directive's negative branch did not arise: isolation holds for both intended arrangements.

- **Grounding↔Directive:** 25 active decisions in scope across both stores, 24 in `shared/` and 1 in the
  Circle. **0 conflicting.** The multi-user cluster is mutually consistent and consistent with the
  Directive: `260822-1610_a_` now carries the measurement it asked for and correctly stays answered
  rather than implemented; `260719-2141_s_` is terminal and its binding sentence, that nothing may
  assume two orchestrators run safely against one workbench, is satisfied by measurement rather than
  overturned; the three open C2/C3-scoped records (`260822-1136` ×2, `260822-1556`) are untouched by
  this Circle and blocked on nothing it produced. The record filed this session,
  `circles/260822-1921-measure-what-two-checkouts-share/decisions/260822-2219_o_what-does-a-second-checkout-do-with-a-circle-record-marked-active-that-it-never-activated.md`,
  **opens a question the arrangement did not previously have** and is not a tension: it is downstream of
  the Directive's own fourth clause, its option 2 is explicitly refused against the closed writer set of
  `.active-circle`, and the addendum names it. It needs the user, at C2.

**Rebalance recommendation:** none

**One thing for Phase 4 that no edge is flagged on.** Four session-bookkeeping surfaces still describe
the state before Turn 1: `agentstate.yaml` (T-1 running, T-2 queued), `orchestrator-live.md`
(`Tasks: 0/2 | Commits: 0`), this Circle record's empty `## Turn log`, and this file's `**Mode:**`,
`**Status:**` and `## Session log`. The event log carries `task_done` for both tasks and `turn_end` at
`20:28:48`. Those four are yours to write and not the reconciler's, which is why they are named here
rather than corrected. The condition is the fifth recorded instance and nothing measures it any more:
the state-drift computation that closed
`shared/issues/260801-2038_c_session-bookkeeping-froze-at-turn-1-while-three-turns-ran.md` was deleted
on 2026-08-15, that record now carries a `Revised by:` line saying so, and the live defect is filed as
`shared/issues/260822-2236_o_the-four-session-bookkeeping-surfaces-froze-again-and-the-detection-that-closed-the-first-record-has-been-removed.md`.
It is a defect in how a session records itself, not drift between the Artifact, the Grounding and the
Directive, so it is reported rather than made into a Rebalance the four options cannot answer.

Full pass: `circles/260822-1921-measure-what-two-checkouts-share/history/260822-2239-reconciliation.md`
