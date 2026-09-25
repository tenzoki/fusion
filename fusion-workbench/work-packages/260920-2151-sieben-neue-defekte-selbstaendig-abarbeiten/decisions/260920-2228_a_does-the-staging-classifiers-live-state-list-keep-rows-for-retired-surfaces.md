# Does the staging classifier's `LIVE_STATE` list keep rows for retired surfaces, or is it exactly what the tracking rule names?

---
**Domain:** code
**Filed by:** planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260918-1335_*_the-live-state-comment-keeps-two-retired-rows-for-a-consequence-classify-cannot-produce.md, 260918-1409_*_the-live-state-list-claims-class-l-in-full-while-two-class-l-entries-classify-as-unclassified.md, 260911-1339_*_staging-drift-still-classifies-a-pointer-a-rule-says-nothing-creates-and-names-a-turn-boundary-trigger-it-does-not-have.md, 260920-2228_*_seven-new-defects-worked-autonomously-with-a-second-opinion-each.md

---

## Question

`LIVE_STATE` in `hooks/lib/staging-drift.ts` holds three rows for files nothing writes any more: `agentstate.yaml`, `orchestrator-live.md` and `portfolio.md`. The comment above the list keeps the first two on an argument that is false at HEAD `80bebc96`: it says dropping them would move a leftover copy to `record`, where the report claims a commit forgot it, while `classify()` sends a root-level basename with no row to `unclassified`, printed and unclaimed (probed on the compiled module: `classify("some-root-leftover.md", "")` returns `unclassified`). The same comment claims the list is class L of `rules/workbench-tracking.md` "in full" and it is not: `.checkout-id` and `.cadence-anchors` are in that class and have no row.

Two defects sit in one comment block, and both come down to one question: what is the list's membership rule? Either it is exactly the classes the rule names (L in full, R2, R3), or it also keeps a row per retired surface so a leftover in an upgrading project is named as retired rather than unknown. The `.active-circle` row was removed on the first reading (`260911-1339_*`), so the tree already leans one way, but the comment still argues the other. The question must be settled before either defect is fixed, because the fix to the class-L claim is written differently under each answer, and a later reader of the list would otherwise re-derive it from the next retirement.

## Options

1. **The list is exactly the rule's classes: drop the three retired rows and the paragraph that keeps them.** `LIVE_STATE` plus `LIVE_PREFIXES` then equals class L, R2 and R3 of `rules/workbench-tracking.md` `## The four classes`, and a test can hold that equality against the rule text.
   - Pros: one membership rule, checkable by reading the rule; a retired surface leaves the list when it leaves the rule, with no second decision; the `.active-circle` removal already applied this reading.
   - Cons: a leftover `agentstate.yaml` in a project that upgraded from before 2026-09-10 prints under `unclassified` ("nothing is claimed about it") instead of `in-flight` with a `why` that says it is retired; no verdict changes, but the user loses the hint. The `portfolio.md` row is pinned by `hooks/lib/__tests__/staging-drift.test.ts` (the loop that expects it as `in-flight` and its `until v11 removed both` text), so the test loses two lines with the row.
2. **Keep the retired rows, and say why truthfully.** The three rows stay; the paragraph is rewritten to state the real consequence of dropping one (`unclassified`, not `record`) and the real reason for keeping it (a leftover is named as retired, which tells the user to delete it). The class-L claim is fixed separately by adding the two missing rows and by saying the list is class L plus the retired rows.
   - Pros: no behaviour change for an upgrading project; the test's `portfolio.md` pin stands.
   - Cons: two membership criteria (what the rule names, plus what once did), so every future retirement is a decision whether to keep the row; the comment then has to enumerate the retired rows and keep that enumeration true; the benefit is a `why` string on a file the project is meant to delete anyway.
3. **Keep the rows for now and mark them as expiring**, with a date or a version after which they go.
   - Pros: none the first two do not have.
   - Cons: nothing checks a date (`rules/fusion-workbench-conventions.md` `## Backlog entries — work items` states the principle for a paused item and it holds here); the row leaves on somebody remembering, which is how the comment came to be false in the first place.

## Constraints

- No verdict may change for a project following the shipped `.gitignore` split: every entry under discussion is either ignored there or classifies `in-flight` or `unclassified`, and neither class is a fault.
- `hooks/dist/lib/staging-drift.*` is rebuilt in the same commit as the source, and `cd hooks && npm test` exits 0.
- The hook-test surface has 12 lines of head-room at HEAD; a test that grows is funded by a cut in the same file.
- Option 1 removes rows that exist; under the directive that is not consent the executor may assume alone, which is why the discussion runs over this record before any edit, and why an unconverged discussion leaves the record open and the two steps skipped.

## Recommendation

Option 1. The comment's own argument for keeping the rows is false, and once it is corrected nothing supports two membership criteria except a `why` string on a file nobody should have. The measurable property (list equals rule) is worth more than the hint, and it is the property the comment already claims to hold.

---
Answered: 260921-0742_*_does-live-state-keep-rows-for-retired-surfaces.md `## Recommendation` — option 1: `LIVE_STATE` plus `LIVE_PREFIXES` is exactly the classes `rules/workbench-tracking.md` `## The four classes` names; the three retired rows and the paragraph keeping them leave (step 6), the two missing class L rows are added and the "in full" sentence made true (step 7), and the `portfolio.md` leftover hint goes to `docs/upgrading-to-v11.md` `### 5` as a follow-on edit outside this package; ruled by orchestrator, Kai Stalmann <ks@qantr.com>, under the work item's directive (`260920-2151-sieben-neue-defekte-selbstaendig-abarbeiten.md`: decide everything about the solution yourself), after a four-round discussion that converged.
