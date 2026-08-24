# Every open defect in the workbench is closed, fixed or referred, and the suite is green

---
**Domain:** code
**Filed by:** shaper (anticipated-circle mode), Kai Stalmann <ks@qantr.com>
**Claim:** Claimed 260824-1853: Kai Stalmann <ks@qantr.com>, checkout 5e8248d7.
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

**Prior records of the same shape.** `shared/issues/260811-1734_*_reduce-the-surface-so-a-claim-cannot-go-stale-*.md` and the C0 cut-only Circle `260822-1154` are the precedents for paying with cuts; `shared/decisions/260822-1102_a_what-happens-when-a-planned-circles-required-work-exceeds-the-remaining-head-room.md` is the accepted decision that governs a Circle whose work exceeds a bound.

## Dependencies

(none among Circles). Binding by citation: `shared/planning/260822-1136_*_spec-fusion-becomes-a-multi-user-tool.md` (C1 to C3 closed and not to be reversed; C4 open and the referral target for its inputs).

## Turn log

