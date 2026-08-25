# P-4 — /fusion:setup emits the same session_start line

**Agent:** coder
**Status:** Complete
**Plan:** `circles/260825-2023-presence-travels-monitor-filters-own-checkout/planning/260825-2140_*_c4-presence-travels-and-the-monitor-reads-its-own-checkout.md` step 4

## What was implemented

`skills/setup/SKILL.md` Step 5. The `session_start` line now carries `person` and `checkout`,
stated as held from the values Step 0i already reads out of `bin/fusion-identity` rather than read
a second time, and `detail`, the session Directive and mode. The field contract is cited to
`agents/orchestrator.md` `### 2. Structured Event Log` (landed in `8655ec2`) and deliberately not
restated: the absence rule for an unresolved identity half has one authoring home and a second copy
would be the duplication this project treats as a defect.

## What this closes

`circles/260825-2023-presence-travels-monitor-filters-own-checkout/issues/260825-2140_*_the-two-session-start-emit-sites-disagree-on-the-detail-field-and-the-vocabulary-names-one.md`
carries its `Resolved:` note and its marker is `_c_`. The two emit sites now agree, and both write
what the vocabulary declares.

## Surface budget

`skills/setup/SKILL.md` 46 301 to 46 649 bytes, **+348**, against roughly 1 923 available on the
`skills/*/SKILL.md` bound and an estimate of +300 to +400. A first draft measured +434 and was
tightened rather than allowed to stand over the estimate.

## Not done, and why

The plan file's step 4 was **not** marked `[DONE]`. The dispatch bounded this task to one shipped
file plus the defect record, because three sibling tasks were editing concurrently and a shared plan
file is where a lost update lands. Whoever commits this wave marks it.

## Two gate files that had to move with the edit

The edit is one shipped file, but two gates fail on it by design and their re-approval is part of the
change rather than a way around it.

`hooks/lib/__tests__/fixtures/surface-growth.golden` was regenerated with the documented flag. The
diff is the two `skills` numbers and nothing else. Regenerating moves no baseline, so the bound the
Circle's stopping condition 8 names is untouched.

`hooks/lib/__tests__/reference-resolution-lint.test.ts` `BASELINE` moved 1404/193 to 1409/195, and the
number is **not** this step's alone. Step 9's edit to `rules/workbench-tracking.md` was in the tree
unstaged while this ran, and it contributes four of the five paths and one of the two anchors. The
split is derived from the two diffs rather than apportioned and is written into the comment beside the
constant: this step's share is one rooted heading counted twice, step 9's is that same heading plus
`bin/fusion-events` twice and `bin/monitor` once. The re-approval was written on the existing comment
line, adding no line, because the hook-test surface has zero lines of head-room.

A first re-approval at 1405/194 measured this step alone and went stale between two runs when step 9's
edit landed. That is recorded here rather than hidden: a pinned count measured over a concurrent
wave is a figure with a timestamp, and whoever moves it next re-approves on the same terms.

## Verification

`cd hooks && npm test` exits 0. 43 files, 760 tests, all passing.
