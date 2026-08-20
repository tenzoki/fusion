# The plan is still `Status: Draft` under the open marker, with nine of its ten steps done

---

`circles/260819-1645-four-constraints-on-deep-change/planning/260819-2016_*_four-constraints-on-deep-change.md`
carries `**Status:** Draft` in its head. It was approved by the user at a gate on 2026-08-19, nine of
its ten steps are marked `[DONE]` in its own body, and the tenth is struck by an answered decision.
Its filename marker has never moved off the open one either.

`rules/fusion-workbench-conventions.md` `### Planning files` states both halves: a step in flight is
`[IN PROGRESS]`, and "when all steps are `[DONE]`: set `**Status:** Complete` in the header and
rename the filename marker to `_c_`". The marker vocabulary in the same file puts a record an agent
is actively working on at `_p_`, which this plan never reached either.

Every other plan in the workbench carries a settled Status — eighteen of them read `Complete`,
`Partially Complete` or `Superseded`, several with the evidence in the same line. This one is the
only plan in the tree whose Status still reads the word the planner wrote.

A second, smaller inconsistency in the same file: step 5's marker sits **after** its title
(`5. **Repair the 98 stale-marker citations** [DONE]`) where the other eight sit before it
(`6. [DONE] **Repair the 49 wrong-store citations**`). The conventions give the form as
`1. [DONE] **Step Title**`.

---

**Severity:** Medium — the plan is the record the Circle's head field points at, and it is the
document a resumed session reads to learn what is left. Read as written it says nothing has been
approved.
**Domain:** code
**Filed by:** `coderev`, reviewing `b91c01c..bbfc912`
**Owner:** `orchestrator`
**Affects:** the plan file named above — its `**Status:**` head field, its filename marker, and the
placement of step 5's `[DONE]`
**Cross-references:** `rules/fusion-workbench-conventions.md` `### Planning files` and
`## State Markers — issues and planning`

**Verified 2026-08-20 at HEAD `bbfc912`.** Every commit in the range that completed a step edited
this file to add its `[DONE]` and touched nothing else in the head; the `**Status:**` line is
byte-identical to the one `b6869aa` wrote.

## A consequence that is not obvious

Renaming the plan's marker is not free while the Circle record's `**Active spec/plan:**` field
spells that marker exactly. That coupling is filed separately as a defect of the head field, in
this same store, under the topic `the-circle-records-active-spec-plan-field-spells-an-exact-marker`.
Repair the head field first, or the two changes have to land in one commit.

## Fix direction

Set the Status to what is true — approved at the gate, nine steps done, step 10 struck by the corpus
answer — and move the marker with it, after the head field is repaired. Move step 5's `[DONE]` to
the front of its line while there.

---
Resolved: the plan is `_c_` and reads `**Status:** Complete`. Step 10 carries a struck marker naming the decision that removed it, so a later reader does not read an unmarked step as pending work.
