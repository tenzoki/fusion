# Are the dispatch-path baseline rows re-armed at the post-cut totals, and under which event?

---
**Domain:** code
**Filed by:** planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260917-1115_*_the-claude-md-cut-banked-85-kb-of-slack-into-a-bound-whose-header-says-head-room-is-zero.md, 260909-1633_*_the-zero-sum-bounds-baseline-is-armed-at-the-moment-that-absolves-the-cut-it-must-measure.md, 260822-1154_*_does-a-cut-only-circle-re-baseline-the-surfaces-it-cuts.md, 260922-0922_*_the-51-open-issues-at-451bb312-worked-autonomously-as-one-package.md

---

## Question

`hooks/lib/__tests__/fixtures/dispatch-path.baseline` charges `CLAUDE.md` to all eleven rows at 93 432 bytes; the file measures 8 021 at `451bb312`. Every path stands roughly 78 000 to 171 000 bytes under its row on a bound whose header says head-room is zero, so the instrument currently refuses nothing. Two rules pull in opposite directions and both are on the tree. `hooks/lib/__tests__/helpers/growth-bound.ts` `## Re-baselining` event 1: a cut-only piece of work never re-baselines, and its head-room is what the cut leaves. `README-hooks.md` `### Growth bounds on the shipped text` and the fixture's own header: a cut does not bank its own savings as head-room, and this bound is zero-sum. The 2026-09-16 `CLAUDE.md` cut satisfied the first rule and voided the second. The defect record says the choice belongs in a decision, and this plan does not take it: moving a baseline is the one act the growth rule forbids without a named event.

## Options

1. **Re-arm every row at the post-cut totals, as a fourth named event for the dispatch-path surface only**: "after a cut of a shared component, the zero-sum bound follows the measurement down", logged in `README-hooks.md` with the before and after figures per row.
   - Pros: the bound measures again; the head-room-is-zero claim becomes true; the event is scoped to the one surface whose definition is zero-sum, so the refusal at event 1 for the rate surfaces stands untouched.
   - Cons: a baseline edit, which the project has refused three times on other surfaces; the cut it follows was not measured against a golden of its own.
2. **Leave the rows and rewrite the header**: the bound is stated as "head-room is what the last cut left", with the 78 022-byte figure written in and dated.
   - Pros: no baseline moves; honest text.
   - Cons: a zero-sum bound with 78 kB of slack is a rate bound with a large head-room and no derivation for it; the reviewer row (the tightest) would admit a rule-file addition of 78 kB before failing.
3. **Re-arm only the `CLAUDE.md` component**: replace 93 432 with the measured 8 021 on every row and leave the prompt and rules components as they stand.
   - Pros: the smallest edit that restores the measurement; the shared component is the one that moved.
   - Cons: the rule and prompt components have also drifted below their rows since the arming (`THE SURVIVING ROWS WERE NOT RE-CUT` in the fixture header names nine commits), so the rows would still carry slack the header does not admit.

## Constraints

- Whichever option lands, `rules-emission-golden.test.ts`'s dispatch-path case must stay green at the commit that lands it, and `README-hooks.md` logs the event with figures.
- `260822-1154_*_does-a-cut-only-circle-re-baseline-the-surfaces-it-cuts.md` (`_i_`) rules for the rate surfaces and says nothing about a zero-sum one; option 1 does not supersede it.

## Recommendation

Option 1. The dispatch-path bound is defined as zero-sum, and a zero-sum bound that is not at the measurement is not the instrument its header describes. The event is named, scoped to this surface, and logged, which is what separates it from the silent raise the growth rule exists to prevent.

---
Answered: 260922-0922_*_are-the-dispatch-path-rows-re-armed-at-the-post-cut-totals-and-under-which-event.md `## Options` — option 1: every dispatch-path row is re-armed at the post-cut totals as a fourth named event scoped to the zero-sum surface alone ("after a cut of a shared component, the zero-sum bound follows the measurement down"), logged in `README-hooks.md` with the per-row figures; `260822-1154_*` stands for the rate surfaces; ruled by user, Kai Stalmann <ks@qantr.com>, 260922-1220.

---
Implemented: the commit that carries this line — option 1. All eleven rows of `hooks/lib/__tests__/fixtures/dispatch-path.baseline` are re-armed at the sizes measured at this commit, component by component, by the same summation the bound performs; every row's slack reads `0` against a fresh measurement. The event is authored in that fixture's header, scoped to this bound alone: after a cut of a component shared by every row, a zero-sum bound follows the measurement down. `helpers/growth-bound.ts` `## Re-baselining: the three events at which a baseline moves` stands unedited, heading and body, and `260822-1154_*_does-a-cut-only-circle-re-baseline-the-surfaces-it-cuts.md` is not superseded: it rules the cut-only refusal for the three rate surfaces, and the condition admitting this event is the zero-sum definition no rate surface has. `DISPATCH_HEAD_ROOM` is still `0` and its doc comment carries the event's one condition in place of the clause saying a row never follows a cut. `README-hooks.md` `### Growth bounds on the shipped text` carries the log the ruling requires, with the eleven rows before and after by component and the two directions inside them named: the shared `CLAUDE.md` component falls 93 432 to 8 021 on every path, while the curator, ontocoder and coder prompt components are re-armed upward. The dispatch-path case is green at this commit, which was the ruling's other constraint.
