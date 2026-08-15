# Turn 2 — structured data and the records

**Sender:** ontorev
**Reviewed-range:** `7c12d6a..5d29b6d`
**Not-opened:** `hooks/dist/**` (44 generated files, verified by reproduction rather than by reading — see Check 4), `bin/monitor`, `README.md`, `README-agents.md`, `README-hooks.md`, `CLAUDE.md`, `docs/philosophy.md`, `docs/working-model.md`, `agents/coderev.md`, `agents/ontorev.md`, `agents/orchestrator.md`, `agents/playmaker.md`, `bin/fusion-rules`, `bin/fusion-source-root`, `rules/circle-records.md`, `rules/commit-lock.md`, `rules/fusion-workbench-conventions.md` (diff only), `rules/workbench-stash-and-lock.md`, `skills/**`, `hooks/tracker.ts`, `hooks/lib/churn.ts`, `hooks/lib/escalation.ts`, `hooks/lib/fail-open.ts`, `hooks/lib/guard-state-file.ts`, `hooks/lib/paths.ts`, `hooks/lib/project-relative.ts`, `hooks/lib/self-detect.ts`, `hooks/lib/staging-drift.ts`, `hooks/lib/review-coverage.ts`, `hooks/lib/state-drift.ts`, `hooks/turn-budget.ts`, `hooks/review-coverage.ts`, `hooks/state-drift.ts`, `hooks/lib/__tests__/churn.test.ts`, `hooks/lib/__tests__/churn-key-anchor.test.ts`, `hooks/lib/__tests__/circle-stash-git-exclusion.test.ts`, `hooks/lib/__tests__/clear-halt-concurrent-halt.test.ts`, `hooks/lib/__tests__/derivable-enumerations-lint.test.ts`, `hooks/lib/__tests__/fusion-commit-lock.test.ts`, `hooks/lib/__tests__/fusion-count-sources.test.ts`, `hooks/lib/__tests__/fusion-paths.test.ts`, `hooks/lib/__tests__/guard-state-shape.test.ts`, `hooks/lib/__tests__/helpers/guard-harness.ts`, `hooks/lib/__tests__/hook-fail-open.test.ts`, `hooks/lib/__tests__/legacy-halt-clearing.test.ts`, `hooks/lib/__tests__/monitor-warnings-panel.test.ts`, `hooks/lib/__tests__/path-literal-lint.test.ts`, `hooks/lib/__tests__/reference-resolution-lint.test.ts`, `hooks/lib/__tests__/review-coverage.test.ts`, `hooks/lib/__tests__/staging-drift.test.ts`, `hooks/lib/__tests__/state-drift.test.ts`, `hooks/lib/__tests__/turn-budget-lint.test.ts`

Prose and TypeScript were `coderev`'s half this Turn and are listed above as not opened by me. The two
test files the dispatch put in my scope, `hooks/lib/__tests__/config.test.ts` and
`hooks/lib/__tests__/rules-emission-golden.test.ts`, were opened and are deliberately absent from that list.

## Summary

The five checks the dispatch named all pass, and three of them pass on reproduction rather than on the
executor's word: the guard-config pair differs only by this repository's own Turn budget, no
`RULE_BASELINE` number moved in either commit that touched it, and the committed `hooks/dist/` is
byte-identical to a plain `tsc` run. Four defects are filed, none of them in the configuration files the
Turn edited. Three are records that point at paths a rename has moved, one of them written and broken
inside a single commit; the fourth is that `churn` left the configuration surface without the retirement
notice the shipped template promises, through a mechanism that could not have carried one.

The range holds **nine** commits, not the seven the dispatch listed — `89ca95a` and `53f2ed2` are in it
and `bin/fusion-review-coverage` reports all nine uncovered. This review covers all nine.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 0 |
| Medium | 2 |
| Low | 2 |

## The five named checks

**1. The byte-identical pair — holds.**
`diff fusion-guard.json templates/fusion-guard.json` returns one hunk, `2d1`, the line
`"orchestrator": { "maxTurns": 12 },`. `PROJECT_SET_KEYS` at `hooks/lib/__tests__/config.test.ts:1261`
is `["orchestrator"]`, so the cut the comparison makes removes exactly that line and every remaining byte
is identical. The whole suite is green at HEAD (below), so this is measured twice.

**2. The conjunction edit — holds, and both halves are the same sentence.**
The surviving `_gitTracked` clause reads *"…, when it escalates to a halt, and how many Turns the
orchestrator may run — …"*. The list was four items and is three, not two; the serial comma before `and`
is correct and the sentence needed no other repair. The two files' `_gitTracked` values are byte-identical:
the `diff` in check 1 would have shown a second hunk otherwise.

**3. `RULE_BASELINE` across two commits — holds, and the check was worth running.**
Per-commit, over all nine commits, the only line that moved in `RULE_BASELINE` is in `5d29b6d`:

```
-  "workbench-stash-and-lock.md": 9_250, // 2026-08-05 cut
+  "commit-lock.md": 9_250, // 2026-08-05 cut, carried through the 2026-08-15 rename
```

The key changed, the number did not. `a69d56e` touched no baseline entry at all, and no `DRIFT_CEILING`,
`GROWTH_BUDGET` or `RELEASE_CAP` moved anywhere in the range. The rename's shrink is therefore charged
rather than absolved: `commit-lock.md` measures 5 663 bytes against a 9 250 baseline, and
`fusion-workbench-conventions.md` fell to 52 282 in the golden against a core baseline still standing at
52 027, so the hard bound keeps its full charge.

**4. The build change — the byte-identity claim reproduces.**

```
$ cd hooks && ./node_modules/.bin/tsc --outDir <scratch> && diff -r dist <scratch>
(no output)
```

The installer invariant holds: no `require()` appears anywhere in `dist/`, and the only module specifiers
are relative `./…js` paths and `node:child_process`, `node:fs`, `node:path`, `node:url`. All 44 files on
disk are the 44 git tracks, with no untracked and no ignored entry among them. `npm test` at HEAD is
green — 45 test files, 830 tests, 74 s — matching the count the event log records for `5d29b6d`. The run
left `hooks/` clean and `hooks/.build-staging/` empty, and that directory is gitignored, so nothing
transient can reach the tarball.

**5. The four decision records — each carries its citation, and each citation resolves.**
The three `_a_` records cite `shared/history/260814-2306-orchestrator-session.md`; line 103 is the exact
answer sentence for the cleanup-gate record, and `:153` is the four-answer section header, shared by the
other two. A section header is a location and satisfies the rule, but two records citing one line for two
different answers is weaker than it needs to be — answers 2 and 3 sit at `:166` and `:171`. Not filed; it
is a matter of a few lines' precision, not a broken reference.

The `_i_` record cites `:198`, exactly, and `Implemented: 332267a`. That commit does carry every element
the line claims — the staging build, the `FUSION_TEST_DIST` handoff and the fork cap — so the citation is
verified and not merely present.

## Findings

### Medium — the inserted step P-3b is in no plan and in no Turn log

`issues/260815-1247_o_the-inserted-step-p-3b-is-in-no-plan-and-in-no-turn-log-only-in-the-event-stream.md`

Turn 2 inserted a prerequisite step, dispatched it, and landed it as `332267a`. The plan at
`planning/260815-0029_o_plan-…md:138-345` lists steps 1 to 15 with no `3b`, and `_t_circle.md:216` names
"steps P-4 to P-6". Only `orchestrator-events.jsonl` has it. The plan and the record were both edited
inside this range, so neither is a file nobody touched.

This is adjacent to `issues/260815-0804_c_…-no-inline-state-marker-…`, closed this session with *"Marking
is now performed with each step's commit."* That repair held — steps 4, 5 and 6 all carry `[DONE]`
correctly. It has nothing to act on for a step the plan never contained, which is why closing the first
defect left this one reachable.

### Medium — `churn` left the configuration surface without the retirement notice the template promises

`issues/260815-1247_o_the-churn-leaves-were-removed-without-a-retirement-entry-and-the-retirement-table-could-not-have-held-one.md`

Two halves. The **surface** half: `templates/fusion-guard.json` `_what` tells every consuming project that
a key which used to configure something and no longer does is reported on every guarded call, *"because a
key that is inert AND silent would leave you believing a setting is in force when the mechanism behind it
is gone."* `churn` is now inert and silent. `hooks/lib/config.ts:42-44` justifies that with *"because no
project ever set it"* — a claim about other repositories with no measurement behind it, and the opposite
of the intent argument the same file makes for `protectedPaths` at `:120-124`. The template never shipped
the key, which weighs against a project having it; the plugin's own `hooks/config.json` did until
`04ea182`, and `_override` instructs projects to copy from exactly there, which weighs for.

The **structural** half is the one that outlives this decision: `RETIRED_CONTAINER_LEAVES` is read at
`config.ts:599`, inside the leaf loop, which is only entered when `CONTAINER_LEAF_RULES` still knows the
container — the unknown-key branch at `:569-572` takes `churn` first. An entry for a removed container
would compile, read as a promise and never fire, and the same hole opens the day any container's last live
leaf is retired. The table's docstring prescribes a procedure that is silently a no-op for that case.

`hooks/lib/config.ts` is TypeScript and `coderev` reviewed the same range. The record says so and asks for
a merge rather than two fixes if the unreachable branch was filed there too.

### Low — the implemented decision record's two cross-references were broken by the commit that transitioned it

`issues/260815-1247_o_the-implemented-decision-records-two-cross-references-were-broken-by-the-commit-that-transitioned-it.md`

`shared/decisions/260811-2009_i_…md:7` names `260810-1135_o_…` and `260811-1409_o_…`. Commit `332267a`
renamed both to `_c_` while moving this record from `_o_` to `_a_`. One commit, no drift, no race.

### Low — a backlog entry's Related line points at a marker the playmaker has since moved

`issues/260815-1247_o_a-backlog-entrys-related-line-points-at-a-marker-the-playmaker-has-since-moved.md`

`shared/backlog/260814-2312_c_…md:6` cites `260814-1733_p_radical-simplification.md`, now `_c_`. Its
sibling cites the same store as `260811-0826_*_observations.md` and survives. Two citation forms in one
directory, both written by the same maintenance pass, and the backlog is where this hurts most: the
`_o_`↔`_p_` rename is the playmaker's **autonomous** write, so a pointer can be invalidated with no gate
and no record beyond the rename.

Both closed backlog entries carry a `Promoted:` line naming the Circle they became, which is what `_c_`
requires. Both were transitioned at `38b80d0`, before this range; they are reported here because Turn 1
declared them not opened.

## Standing issues this range added instances to — cross-referenced, not refiled

- **`shared/issues/260811-2146_o_half-the-decision-records-carry-a-status-that-disagrees-with-their-marker…`.**
  `a69d56e` renamed `260811-2009` from `_a_` to `_i_` and left `**Status:** answered` in the head. A fresh
  instance of the standing class. Re-measured at HEAD across `shared/decisions/` and every
  `circles/*/decisions/`: **35 mismatched of 90**, where that record measured 34 of 67. The store grew by
  23 records and the mismatch count by 1, so the rate has fallen sharply — but the class is live and this
  Turn contributed to it. The unfilled-template-stub half is nearly gone: 1 non-open record still carries
  it, against the 12 recorded.
- **`issues/260815-1206_o_three-churn-references-survive-step-4-in-files-the-step-does-not-name.md`.**
  Item 2 of that record is `.claude-plugin/plugin.json:4`, whose shipped `description` still advertises
  "churn detection". Confirmed still true at HEAD and **not refiled**. The manifest is otherwise correct
  for this range: no version bump is due, since the release is the plan's own step 15.
- **`issues/260815-0804_o_a-decision-records-cross-reference-points-at-an-a-circle-md-that-activation-renamed.md`.**
  The two findings above are the second and third instances of its class, now across three stores. That
  record defers the citation-form convention to a decision against `rules/circle-records.md`; the evidence
  for taking that decision is stronger than it was.

## Verified clean, no finding

- `hooks/config.json` and `hooks/config.example.json` — the `churn` block is gone from both and the
  `_comment` in `config.json` was corrected in the same edit to say "the escalation threshold" rather than
  "the escalation and churn thresholds". No orphan reference to the two leaves survives in either file.
- `fusion-workbench/orchestrator-events.jsonl` — 1 526 lines, all 1 526 parse as JSON, no blank or
  truncated record. Timestamps follow the project's UTC-without-`Z` convention throughout. Every commit in
  the range has a `commit` event, `5d29b6d` included.
- `bin/fusion-state-drift` — `verdict=clean`, `drift=0`, all five rows agreeing.
- `hooks/lib/__tests__/fixtures/rules-emission.golden` — the two regenerations are consistent with the
  text that was deleted and with the file rename. Every agent drops 474 bytes on
  `fusion-workbench-conventions.md`; `orchestrator` additionally drops 7 367 as
  `workbench-stash-and-lock.md` (13 030) becomes `commit-lock.md` (5 663), and `circle-records.md` drops 64
  for `orchestrator`, `playmaker` and `shaper`. Every per-agent total is the sum of its own lines.
- `hooks/tsconfig.json` — the added `.build-staging` exclusion is required by the new build and is the
  correct place for it; the `include` globs are unchanged, which is what keeps the prune rule in
  `scripts/build.mjs` sound.
- `.gitignore` — `hooks/.build-staging/` is covered. (The stale `!bin/fusion-churn-rank` exception on the
  same file is already filed as item 1 of `260815-1206`.)

## Recommended sequencing

1. **The plan gap first** (`P-3b`). It is the only finding a resumed session would act wrongly on, and
   steps 11 and 13 both touch the hooks build that step changed. Cheapest of the four to fix.
2. **The churn retirement question.** Part of it is a decision, not an executor's call, and the plan's
   step 15 ships a release — whatever a consuming project is going to be told, it should be true in the
   release that removes the mechanism.
3. **The two dangling citations**, together. They are one edit each and the same class.
4. **The citation-form convention**, once three instances have accumulated in three stores. Not this
   Turn's work, but the decision `260815-0804` deferred is now cheap to take.
