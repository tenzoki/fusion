# Does `LIVE_STATE` keep rows for retired surfaces, or is it exactly what the tracking rule names?

---
**Domain:** code
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Partners:** orchestrator (first partner) and consultant
**Rounds:** 4
**Ceiling:** 8
**Outcome:** converged
**Cross-references:** 260920-2228_*_does-the-staging-classifiers-live-state-list-keep-rows-for-retired-surfaces.md, 260918-1335_*_the-live-state-comment-keeps-two-retired-rows-for-a-consequence-classify-cannot-produce.md, 260918-1409_*_the-live-state-list-claims-class-l-in-full-while-two-class-l-entries-classify-as-unclassified.md, 260911-1339_*_staging-drift-still-classifies-a-pointer-a-rule-says-nothing-creates-and-names-a-turn-boundary-trigger-it-does-not-have.md, 260920-2228_*_seven-new-defects-worked-autonomously-with-a-second-opinion-each.md

---

## Question

The decision record `260920-2228_*_does-the-staging-classifiers-live-state-list-keep-rows-for-retired-surfaces.md` asks what the membership rule of `LIVE_STATE` in `hooks/lib/staging-drift.ts` is: exactly the classes `rules/workbench-tracking.md` names (option 1, drop the three retired rows `agentstate.yaml`, `orchestrator-live.md`, `portfolio.md`), or those classes plus a row per retired surface (option 2), or the rows kept with an expiry (option 3). This discussion is step 6's second opinion in the plan `260920-2228_*_seven-new-defects-worked-autonomously-with-a-second-opinion-each.md`; it runs before any edit, and its outcome is written onto the decision record as its `Answered:` line, ruled by the orchestrator under the work item's directive. The first partner opens on the record's recommendation, option 1. HEAD at rounds 1 to 4: `97651091`. Round 4 advanced no claim; the consultant confirmed the register as written, correcting two citations in place: C5's `rules/workbench-tracking.md:36` is `:32`, and C13's "requires a row for every class L entry" compresses a disjunction that also accepts a comment saying which entries it omits and why.

## What held up

### C1 — `classify()` in `hooks/lib/staging-drift.ts` sends a root-level basename with no `LIVE_STATE` row and no store or prefix match to `unclassified`, never to `record`; the comment's reason for keeping the `agentstate.yaml` and `orchestrator-live.md` rows (a dropped row would move a leftover to `record`) is false at HEAD.

- **Advanced by:** first partner
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** `hooks/lib/staging-drift.ts:436-492`: `record` is reached only via `ROOT_RECORDS` (empty at `:270`), the `_circle.md` branch, the item-record shape or a `STORES` segment; the fall-through at `:489` is `unclassified`. Probe on the compiled module: `classify("some-root-leftover.md","")` returns `unclassified`. The comment at `:192-194` states a consequence the code cannot produce.

### C2 — `.checkout-id` and `.cadence-anchors` are class L in `rules/workbench-tracking.md` `## The four classes` and have no `LIVE_STATE` row, so the comment's "class L in full" is false at HEAD.

- **Advanced by:** first partner
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** `rules/workbench-tracking.md:24` lists both in class L; neither is in `LIVE_STATE` (`hooks/lib/staging-drift.ts:213-222`) nor `LIVE_PREFIXES` (`:225-228`); the probe returns `unclassified` for both; the comment at `:190-191` claims "class L in full PLUS those two".

### C3 — Under option 1 no `verdict=` line of `bin/fusion-staging-drift` changes for any input.

- **Advanced by:** first partner
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** `hooks/lib/staging-drift.ts:569`: `fault = (klass === "record" || klass === "commit-message") && !staged`; `hooks/staging-drift.ts:93` prints `verdict=unstaged` iff any fault. A dropped row moves an entry to `unclassified` (C1), which never sets `fault`.

### C4 — The `portfolio.md` row is pinned by `hooks/lib/__tests__/staging-drift.test.ts`, so option 1 removes those test lines: a shrink on the bounded hook-test surface.

- **Advanced by:** first partner
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** `staging-drift.test.ts:340` has `"portfolio.md"` in the loop asserting `in-flight`; `:346` asserts `toContain("until v11 removed both")`; the fixture write is at `:326-330`. The loop's other three entries stay.

### C5 — "Exactly the classes the rule names" is checkable by a test reading the class L row of `rules/workbench-tracking.md`; "the rule's classes plus every retired surface" is checkable from no shipped text.

- **Advanced by:** first partner
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** the class L cell at `rules/workbench-tracking.md:24` is one parseable row. No shipped file enumerates retired surfaces: every hit for the three names in `rules/`, `hooks/lib/*.ts`, `skills/`, `agents/` is incidental prose (`rules/workbench-tracking.md:32`, `staging-drift.test.ts:357`), none a list.

### C6 — The `.active-circle` removal at `157ae45b` already applied option 1's reading; option 2 would reverse that direction.

- **Advanced by:** first partner
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** `git show 157ae45b -- hooks/lib/staging-drift.ts` removes the `.active-circle` row; the message reads "the classifier drops the row for a pointer nothing creates".

### C8 — With the three rows dropped, a root leftover of any of the three files produces no fault and no verdict change, and is listed under `unclassified` with the `why` "not a record store and not live state — nothing is claimed about it"; option 1's operational effect is a heading change in the CLI listing.

- **Advanced by:** consultant
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** `hooks/lib/staging-drift.ts:489-492`; the comment at `:193` says `in-flight` provides the same silence ("nothing is claimed about them and nothing is reported").

### C9 — Option 1 is the consistent choice: it removes a false statement (C1, C2), changes no verdict (C3, C8), shrinks the bounded test surface (C4), leaves a membership rule a test can pin to `rules/workbench-tracking.md:24` (C5), and continues `157ae45b` (C6); its one real loss is the `portfolio.md` hint (C7), which `docs/upgrading-to-v11.md` `### 5` could carry in one line on an unbounded docs surface.

- **Advanced by:** consultant
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** the citations of C1 to C8.

### C10 — Adding `.checkout-id` and `.cadence-anchors` rows to `LIVE_STATE` fits under the hook growth bound.

- **Advanced by:** consultant
- **Entered:** round 1
- **Last moved:** round 2
- **Evidence:** decided by C16 (C11's first sentence): `hooks/lib/staging-drift.ts` is on no bounded surface (`surface-growth-bound.test.ts:460`, `:473`, `:482`), so the two rows cost nothing against any bound. The round-2 phrase "3 030 lines of head-room" was the constant, not the room; see C15 and C16.

### C13 — The two defect records' acceptance lines pull in opposite directions on `LIVE_STATE` and are reconcilable only by an explicit split: `260918-1335` ends "Change no other row of `LIVE_STATE`" while `260918-1409` requires a row for every class L entry; adding a row is not changing one, so the fix for 1409 adds rows and the fix for 1335 drops rows, and the plan records that split rather than letting one executor read the other's constraint as a veto.

- **Advanced by:** consultant
- **Entered:** round 2
- **Last moved:** round 2
- **Evidence:** `260918-1335_o_*.md:12`; `260918-1409_o_*.md:28`; `rules/workbench-tracking.md:24` (C2).

### C14 — (C12 corrected) The one-line `portfolio.md` hint belongs in `docs/upgrading-to-v11.md` `### 5`, as a fourth leftover beside `agentstate.yaml`, `orchestrator-live.md` and `.active-circle` already named there; it is outside both defect records' scope and is a follow-on edit to name in the recommendation, not a reason to keep the row.

- **Advanced by:** first partner
- **Entered:** round 3
- **Last moved:** round 3
- **Evidence:** `docs/upgrading-to-v11.md:133-135` names exactly those three; `260918-1335_o_*.md:12` and `260918-1409_o_*.md:28` name no docs edit.

### C15 — The round-2 correction inside C11 overstated the hook-test head-room: 3 030 lines is the surface's constant, the bound is `measured total ≤ floor + constant`, the total stands at 22 246 against 22 258, so 12 lines are left and step 7's added test lines need funding from step 6's shrink or a cut in the same surface; the per-file golden figure is a measurement, not a per-file baseline.

- **Advanced by:** first partner
- **Entered:** round 3
- **Last moved:** round 3
- **Evidence:** `hooks/lib/__tests__/helpers/growth-bound.ts:147-158` (`budget = floor + headRoom`, `over = total > budget`); `surface-growth-bound.test.ts:449`, `:281-286`, `:377`; the consultant's reproduction of the walk: total 22 246, floor 19 228, budget 22 258, room 12, identical to the plan's constraints row; `npx vitest run surface-growth-bound` 12 of 12 green at HEAD; golden header `fixtures/surface-growth.golden:11-12`.

### C16 — (C11 corrected) The bound covers exactly `agents/*.md` (bytes), `skills/*/SKILL.md` (bytes) and `hooks/lib/__tests__/**.ts` (lines); `hooks/lib/staging-drift.ts` is on none, so two added `LIVE_STATE` rows cost nothing against any bound. The hook-test surface is pooled with `budget = floor + 3 030` and stands at 22 246 against 22 258 at HEAD `97651091`: 12 lines of room, so step 7's added test lines are paid for by step 6's shrink (C4) or a cut in the same surface, as the plan's constraints table says.

- **Advanced by:** consultant
- **Entered:** round 3
- **Last moved:** round 3
- **Evidence:** `helpers/growth-bound.ts:147-158`; `surface-growth-bound.test.ts:449`, `:460`, `:473`, `:482`; `fixtures/surface-growth.golden:11-12`, `:107` (total 22 246); plan `260920-2228_p_*.md:24`.

## What fell

### C7 — Apart from the `why` string on the three rows, no shipped surface tells an upgrading project that a leftover `agentstate.yaml`, `orchestrator-live.md` or `portfolio.md` is retired; option 1 loses the only such hint, and that loss is its whole cost.

- **Advanced by:** first partner
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** `docs/upgrading-to-v11.md:27` and `:133-136` tell an upgrading project that `agentstate.yaml`, `orchestrator-live.md` (and `.active-circle`) are unread leftovers it can delete; only `portfolio.md` has no such hint there. The residual cost of option 1 is the `portfolio.md` hint alone.
- **Conceded:** first partner, round 1 — `docs/upgrading-to-v11.md:133-136`.

### C12 — The one-line `portfolio.md` hint belongs in `docs/upgrading-to-v11.md` `### 5` beside the two files already named there, is outside both defect records' scope, and is a follow-on edit to name in the recommendation, not a reason to keep the row.

- **Advanced by:** first partner
- **Entered:** round 2
- **Last moved:** round 2
- **Evidence:** the placement and the scope hold (`260918-1335_o_*.md:12` and `260918-1409_o_*.md:28` name no docs), but the section names three root leftovers, not two: `agentstate.yaml`, `orchestrator-live.md`, `.active-circle` (`docs/upgrading-to-v11.md:133-135`); `portfolio.md` would be the fourth. Refuted on the count; the corrected statement is C14.
- **Conceded:** first partner, round 2 — `docs/upgrading-to-v11.md:133-135`.

### C11 — `hooks/lib/staging-drift.ts` is on no bounded surface: the bound covers exactly `agents/*.md` (bytes), `skills/*/SKILL.md` (bytes) and `hooks/lib/__tests__/**.ts` (lines), so two added rows cost nothing against any bound, and the test lines step 7 adds sit inside the pooled hook-test head-room.

- **Advanced by:** first partner
- **Entered:** round 2
- **Last moved:** round 3
- **Evidence:** `hooks/lib/__tests__/surface-growth-bound.test.ts:460`, `:473`, `:482` (the three surfaces), `:509-511` (pooled total against floor plus head-room), `:449` (3 030 lines). Correction by the consultant to the figure the first partner gave: the bound is pooled, not per file; `staging-drift.test.ts` is 653 lines at HEAD and at `80bebc96`, 20 under its golden figure of 673, so the head-room was understated and step 7's comment cut is not needed to stay inside the bound.
- **Conceded:** consultant, round 3 — `hooks/lib/__tests__/helpers/growth-bound.ts:147-158` and the reproduced walk: the second sentence and the consultant's round-2 correction fall (3 030 is the head-room constant, the per-file golden figure is a measurement, not an allowance); the first sentence stands as C16.

## What could not be decided


## Open dissent

## Recommendation

Option 1, qualified: `LIVE_STATE` plus `LIVE_PREFIXES` is exactly the classes `rules/workbench-tracking.md` `## The four classes` names (L in full, R2, R3), and the three retired rows (`agentstate.yaml`, `orchestrator-live.md`, `portfolio.md`) leave with the paragraph that keeps them. Every claim supporting that reading held up at HEAD `97651091` (C1 to C6, C8 to C10, C13 to C16); what fell were three claims about cost and figures, none of which touched the choice: the `why` strings are not the only leftover hint (C7), the upgrade note names three leftovers rather than two (C12), and the hook-test head-room is 12 lines rather than an allowance per file (C11, corrected by C16). The one real loss of option 1 is the `portfolio.md` hint, and its home is `docs/upgrading-to-v11.md` `### 5` as a fourth named leftover (C14), a follow-on edit outside both defect records. The two records' acceptance lines are reconciled by the plan's split (C13): the fix for `260918-1335` drops rows and the fix for `260918-1409` adds the two class L rows, with the "in full" sentence then true. Step 7's added test lines are funded by step 6's shrink or a cut in the same surface, as the plan says (C15, C16).

This recommendation binds nothing. The decision is the orchestrator's to write onto `260920-2228_*_does-the-staging-classifiers-live-state-list-keep-rows-for-retired-surfaces.md` under the work item's directive, and a later reading may begin a new discussion citing this one.
