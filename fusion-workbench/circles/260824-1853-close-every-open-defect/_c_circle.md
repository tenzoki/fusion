# Every open defect in the workbench is closed, fixed or referred, and the suite is green

---
**Domain:** code
**Filed by:** shaper (anticipated-circle mode), Kai Stalmann <ks@qantr.com>
**Claim:** Unclaimed
**Active spec/plan:** circles/260824-1853-close-every-open-defect/planning/260824-1905_*_plan-close-every-open-defect.md
**Active session history:** shared/history/260824-1750-orchestrator-session.md

---

## Directive

See `**Active spec/plan:**` above. The cited spec or plan states the Directive in force.

## Grounding snapshot

**Measured on 260824.** `shared/issues/` holds 126 records with an `_o_` or `_p_` marker; the `issues/` stores of the sixteen Circles under `circles/` hold 94 more, and every one of those Circles is terminal (`_c_`, `_b_` or `_s_`). No Circle is active and `.active-circle` is absent. The user chose to take all 220 into this Circle rather than the shared store alone.

**What binds from outside.** `shared/planning/260822-1136_*_spec-fusion-becomes-a-multi-user-tool.md` is the standing specification; its C0 to C3 closed coherent in four Circles (`260822-1154`, `260822-1921`, `260823-0023`, `260824-0530`) and its `### C4` is open. C4's acceptance criteria already name one defect as fixed there, `shared/issues/260822-1136_*_two-definitions-of-the-turn-count-disagree-and-the-resume-snippet-counts-every-session-in-the-log.md`; the user's rule for such records is that a C4 input is either solved here or closed with an explicit reference to C4, and nothing C1 to C3 landed is reversed.

**The growth bounds and the rule the user set for them.** Four surfaces carry a failing bound with a fixed head-room over a baseline: 12 000 bytes for the always-on rule set (`hooks/lib/__tests__/rules-emission-golden.test.ts`), 18 000 bytes for `agents/`, 20 000 for `skills/`, 2 500 lines for the hook tests (`hooks/lib/__tests__/surface-growth-bound.test.ts`). A baseline moves at exactly two written-down moments and never to make a red bound pass (`hooks/lib/__tests__/helpers/growth-bound.ts`). The user's answer for a fix that needs bytes a surface does not have: the fix pays for itself, with a cut on the same surface in the same step. A cut on one surface buys another surface nothing, by construction.

**How a defect closes.** `rules/fusion-workbench-conventions.md` `### Issue files`: append `Resolved:` and rename the marker to `_c_`. A closed record whose reasoning is later reversed gains `Revised by:` and keeps `_c_`. The user chose to see nothing before a record is closed as moot or unfixable; the `Resolved:` note is the whole justification and must stand on its own.

**Where the referred ones go.** A defect whose fix needs an unanswered decision is closed pointing at a decision record in `shared/decisions/` (three `_o_` records and eighteen `_a_` records stand there today; a new one is filed where none fits). A Circle-sized idea is closed pointing at a backlog entry, and filing one is the user's act, by hand or through `/fusion:memo`, never an agent's (`rules/fusion-workbench-conventions.md` `## Backlog entries`), so those references are collected for the user rather than filed by the executor. Open decisions are not answered inside this Circle unless one blocks a fix.

**A tension the planner meets, stated rather than resolved here.** `rules/circle-records.md` says a terminal Circle's artifacts stay in place and its record is never edited. The 94 records this Circle closes sit in terminal Circles' `issues/` stores; the record that is history is `_c_circle.md`, and a defect record is a store entry with its own marker vocabulary, so renaming one there does not edit the Circle record. The planner states the reading it works under.

**Two conditions the user set beside the answers.** The Circle ends with one closing review round and one final Turn to close what the review filed; and the batches run as autonomously as the executors can, by surface.

**Prior records of the same shape.** `shared/issues/260811-1734_*_reduce-the-surface-so-a-claim-cannot-go-stale-*.md` and the C0 cut-only Circle `260822-1154` are the precedents for paying with cuts; `shared/decisions/260822-1102_*_what-happens-when-a-planned-circles-required-work-exceeds-the-remaining-head-room.md` is the accepted decision that governs a Circle whose work exceeds a bound.

## Dependencies

(none among Circles). Binding by citation: `shared/planning/260822-1136_*_spec-fusion-becomes-a-multi-user-tool.md` (C1 to C3 closed and not to be reversed; C4 open and the referral target for its inputs).

## Turn log


- Turn 1 (session 260824-1750): commits 2cdd372..01964e4, 17 commits; Coherence verdict ok (user: continue); session history: shared/history/260824-1750-orchestrator-session.md
- Turn 2 (session 260824-1750): commits 01964e4..2acb9f8, 6 commits; Coherence verdict ok (gate not re-asked, covered by the Turn 1 answer); session history: shared/history/260824-1750-orchestrator-session.md
- Turn 3 (session 260824-1750): commits 2acb9f8..cce3c8e, 3 commits; Coherence verdict ok, loop converged; session history: shared/history/260824-1750-orchestrator-session.md

## Closure note

**Closed coherent on 260825**, after the Phase 3 verdict `coherent` (recommendation `none`) and the user's answer at the stop-conditions gate that all nine clauses of the plan's `## Where this Circle stops` hold. Session history: `shared/history/260824-1750-orchestrator-session.md`. Reconciliation detail: `circles/260824-1853-close-every-open-defect/history/260824-2159-reconciliation.md`. Plan: `circles/260824-1853-close-every-open-defect/planning/260824-1905_*_plan-close-every-open-defect.md`.

**What was built.** Every defect record in the workbench outside `archive/` carries `_c_`: 220 records open at activation and 30 filed and closed during the Circle, 250 in the range `571f945..cce3c8e` (24 commits, 3 Turns). Endings as measured by the reconciler: fixed 190, referred 34, moot 21, unfixable 3. `cd hooks && npm test` is green at the closing HEAD (43 files, 760 tests). The four growth bounds are green and no baseline map moved; head-room at close: `agents/` 3 007 bytes, `skills/` 1 770, hook tests 0 lines, always-on rules 14 bytes. C1 to C3 of the multi-user spec stand; three records are referred to C4.

**Seven backlog ideas for the user to file** (`/fusion:memo`; no agent files a backlog entry). Each is the idea a closed record was referred to: a closure step that detects a Turn log still holding its placeholder, plus a freeze detection over the surviving bookkeeping surfaces (`shared/issues/260801-1020_*_plane-mirror-circle-closed-with-empty-turn-log.md`, `shared/issues/260822-2236_*_the-four-session-bookkeeping-surfaces-froze-again-and-the-detection-that-closed-the-first-record-has-been-removed.md`); the orchestrator diffing its working tree against the expected file set after each dispatch (`shared/issues/260801-1410_*_unattributed-edit-to-ontocoder-prompt-during-session.md`); a route that adopts existing pre-Circle work into an anticipated Circle (`shared/issues/260803-1837_*_no-route-turns-existing-pre-circle-work-into-a-circle.md`); a timing of the full Setup written into the event log (`shared/issues/260812-0253_*_setup-takes-far-too-long-and-nothing-measures-it.md`); a measurement design that counts wrong dispatch instructions against their executor runs (`shared/issues/260812-0253_*_the-orchestrators-instructions-to-sub-agents-are-often-wrong.md`); a check that a commit carrying `Task: P-<n>` implies step n of its plan is `[DONE]` (`circles/260815-0007-remove-eight-mechanisms-and-cap-growth/issues/260815-1848_*_step-14-landed-without-its-done-marker-and-the-issue-that-closed-this-for-three-earlier-steps-did-not-hold.md`).

**Six measurements this tree cannot make**, closed `unfixable` or on their measured half, each record naming its command: the macOS Local Network listener claim (`shared/issues/260816-0110_*_the-macos-local-network-listener-claim-is-unverified-at-head-and-still-justifies-a-harness-constraint.md`), the emission measurement on the unite cocreator machine (`circles/260801-1244-guard-rules-write/issues/260805-2323_*_die-emissionsmessung-auf-der-unite-cocreator-maschine-steht-noch-aus.md`), whether a fresh project still raises approval dialogs before Setup (`circles/260815-0007-remove-eight-mechanisms-and-cap-growth/issues/260815-1617_*_re-measure-whether-a-fresh-project-still-raises-approval-dialogs-before-setup-keeps-asking.md`); and the measurement halves of `shared/issues/260812-0253_*_the-orchestrators-instructions-to-sub-agents-are-often-wrong.md` (referred to backlog), `shared/issues/260816-1330_*_the-repunctuations-evidence-paragraph-carries-a-token-count-nobody-can-reproduce-and-an-inverted-capitalisation-claim.md` and `shared/issues/260822-1506_*_the-v9-upgrade-notes-preamble-calls-six-checks-optional-and-check-2-describes-a-silent-behaviour-change.md`.

**Role-budget crossings** (report-only, `rules-emission-golden.test.ts` stderr): playmaker over by 3 351 bytes, shaper by 2 963, orchestrator by 208; all three from `rules/circle-records.md` growing 22 798 to 24 653 in step 13, the orchestrator crossing caused by this Circle. Playmaker and shaper were already over before it.

**Review coverage, stated per `shared/decisions/260815-2109_*_may-a-circle-close-over-an-uncovered-review-range-and-who-decides.md`.** Nine review files tile `571f945..13aaa85` and `a760849..01964e4`. Five commits no review opened: `1eb7ef6`, `2acb9f8` (the Turn 2 review records themselves), `3b0dc93` and `5ad6185` (the Turn 3 closures: `agents/orchestrator.md`, `agents/reconciler.md`, `agents/playmaker.md`, `bin/fusion-session-domain`, `bin/fusion-commit-lock`, `rules/fusion-workbench-conventions.md`, two test files) and `cce3c8e` (reconciliation records). The Turn 2 ontorev's `**Not-opened:**` list (15 coderev-scope files) was read by the Turn 2 coderev over the same range.

**Eight decision records stay open** in this Circle's `decisions/` (stamp `260824-2013`): licence file, dispatch origin, Circle-record writers, marker rename and staging, the two dialog-ban forks, executor report baseline, scan scope of archive and terminal stores. Thirty-four closed defects refer to them; they leave every agent's scan set with this rename (`circles/260823-0023-settle-what-travels-between-checkouts/issues/260823-1403_*_closing-a-circle-removes-its-open-records-from-every-agents-scan-set-and-no-closure-step-says-so.md`, itself referred to the scan-scope decision).

**What this Circle learned about itself.** Three blockers recurred across every parallel batch and none was a defect in the work: a marker rename dangles every citation that spelled the old marker (repaired six times, twice inside terminal Circle records as citation repairs); a test pin that measures the whole tree cannot be committed green piecewise, so four intermediate commits of Turn 1 are red on `reference-resolution-lint` in isolation while every Turn-end HEAD is green; and the citation lint's own positive control assumed the workbench always holds an open defect, which the Directive made false. The last was found by the closing measurement and fixed in the same Turn.
