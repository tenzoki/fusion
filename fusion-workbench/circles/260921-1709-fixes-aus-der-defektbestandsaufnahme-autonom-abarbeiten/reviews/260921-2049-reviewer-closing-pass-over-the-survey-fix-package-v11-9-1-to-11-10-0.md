# Closing review: the survey fix package, v11.9.1 to the 11.10.0 bump

**Review domain:** code
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Reviewed-range:** `9f9e26e4..64b607a9`
**Not-opened:** `hooks/dist/citation-check.d.ts`, `hooks/dist/citation-check.js`, `hooks/dist/citation-sweep.d.ts`, `hooks/dist/citation-sweep.js`, `hooks/dist/lib/citation-form.d.ts`, `hooks/dist/lib/citation-form.js`, `hooks/dist/lib/citation-scan.d.ts`, `hooks/dist/lib/citation-scan.js`, `hooks/dist/lib/config.d.ts`, `hooks/dist/lib/config.js`, `hooks/dist/lib/domain-cascade.js`, `hooks/dist/lib/events-query.d.ts`, `hooks/dist/lib/events-query.js`, `hooks/dist/lib/git.d.ts`, `hooks/dist/lib/git.js`, `hooks/dist/lib/review-coverage.js`, `hooks/dist/lib/staging-drift.d.ts`, `hooks/dist/lib/staging-drift.js`, `hooks/dist/session-start.js`, `hooks/lib/__tests__/fixtures/rules-emission.golden`, `hooks/lib/__tests__/fixtures/surface-growth.golden`, `fusion-workbench/.fusion-setup`, `5e8248d7.md`, `260921-1653-open-defect-survey-at-11-9-1.md`, `260921-1709-fixes-aus-der-defektbestandsaufnahme-autonom-abarbeiten.md`, `260921-1718_*_the-vitest-config-cites-a-decision-with-its-store-segment-in-a-file-no-citation-corpus-reads.md`, `260921-1931_*_a-coder-ran-git-reset-hard-in-the-live-tree-and-an-hour-of-uncommitted-event-log-rows-is-gone.md`, `260921-1718_*_does-a-slash-command-token-in-shipped-text-become-a-pinned-class-and-what-exempts-a-historical-mention.md`, `260921-1718_*_does-the-grammar-read-a-storeless-bracket-marked-citation-or-state-the-asymmetry-as-a-decision.md`, `260921-1718_*_does-the-v11-upgrade-note-track-live-v11-behaviour-or-stay-frozen-at-v11-0-0.md`, `260921-1718_*_how-does-a-dispatched-agent-learn-the-gate-conditions-before-it-dispatches-another-agent.md`, `260921-1718_*_where-does-presence-read-what-another-checkout-is-working-on-now-that-no-session-row-carries-it.md`, `260921-1718_*_which-decidable-property-if-any-exempts-a-realistic-probe-fixture-from-the-citation-gate.md`, `260921-2002_*_does-reading-the-bracket-marker-form-sweep-the-frozen-stores-or-does-the-sweep-first-learn-to-skip-them.md`
**Work-item:** 260921-1709-fixes-aus-der-defektbestandsaufnahme-autonom-abarbeiten
**Plan reviewed against:** `260921-1726_*_the-33-open-defects-of-the-11-9-1-survey-worked-autonomously-as-one-package.md`

The range is `v11.9.1..64b607a9`. The tag resolves to `9f9e26e4`; the dispatch named `6157af3c..64b607a9` (32 commits), which excludes `6157af3c`, a workbench-only commit. This pass covered all 33 (`bin/fusion-review-coverage --since v11.9.1` prints `commits=33`).

## Summary

The package realises its plan: 27 of 28 steps are in the tree as the steps describe them, every sampled `Resolved:` line names a change the diff carries, the eight working answers stand on `_o_` records, and the suite is green with `committed-dist` inside it. Three defects were found, none a release blocker: a validation rule for the new `citations.exhibits` leaf that does not refuse the prefix form it documents refusing, a contradiction between the rewritten dispatch rule and the orchestrator's own consultant row, and a memo halt clause that is one step too early for the idea route.

## Totals

Critical 0. High 0. Medium 2. Low 1.

Issues filed, all in this container's issues store: `260921-2049_*_an-ellipsis-truncated-exhibits-entry-passes-the-md-rule-and-declares-a-month-of-records-exhibits.md` (Medium), `260921-2049_*_the-conventions-let-any-agent-dispatch-the-consultant-for-a-second-opinion-while-the-orchestrator-table-allows-only-fusion-discuss.md` (Medium), `260921-2049_*_the-memo-bodys-checkout-halt-fires-before-the-target-is-chosen-so-an-idea-halts-where-the-conventions-say-file.md` (Low).

## Verification

- `cd hooks && npm test`, one run, alone, on an idle tree: exit 0, 57 files, 967 tests, 33.3 s; `lib/__tests__/committed-dist.test.ts` 4 of 4 passed.
- `bin/fusion-citation-check` at `64b607a9`: `dangling=301`, `store-prefixed=404`, `verdict=clean`, `declared-exhibits=0`, the figures the commits `80e8df95`, `76b36efa` and `a891c50e` claim unchanged. `undecidable=3613` against the `3610` `76b36efa` states; the three are records added by later commits in the range.
- `bin/fusion-events presence --days 30`: two parties, `1d05b0e4` on `260907-0829-message-between-checkouts-read-before-pull`, `114caf11` on `shared`, as the presence record's `Resolved:` line states.
- `bin/fusion-paths no-such-name` from the work tree: the message names the work tree, `git pull` and `fusion --update`, exit 2; from the scratchpad: names the searched root and neither remedy, exit 2.
- `git merge-base --is-ancestor v10.24.1 main`: not an ancestor, so the new step-5 sentence in `README-agents.md` `## Releasing` ("a tag cut from anything but `main` is partial") is true of `v10.24.1`.
- The eight `Working answer (plan 260921-1726)` lines are on eight `_o_` decision records and no marker moved; the skipped step 23's record carries none.

## Findings by theme

### 1. The `citations.exhibits` leaf (Medium)

`hooks/lib/config.ts` `explainArrayOfRecordBasenames` tests `entry.endsWith(".md")` and nothing else, while `hooks/lib/citation-scan.ts` `basenameMatcher()` (line 805 at `64b607a9`) splits an entry on `…` and `...` and joins the pieces with `.*`. Probed on a scratch project: `{"citations":{"exhibits":["2601….md"]}}` prints `declared-exhibits=1`, `store-prefixed=0`, `verdict=clean` over two records under two stamps; `["….md"]` would exempt every record. The plain prefix `["2601"]` is refused as documented. Four sites written in `a891c50e` state the guarantee that is not held: the leaf paragraph in `config.ts`, the declared-exhibit paragraph in `citation-scan.ts`'s header, `README-hooks.md` `#### citations.exhibits`, and the `_citations` note in both `fusion.json` files. Fix: refuse `…` and `...` in the same rule, or require the full record shape. Issue filed.

Everything else in the feature reads as the plan says: `createScanner()` takes the list, the reason sits first in the chain and outside `RESOLUTION_PREMISED_EXEMPTIONS` so the shape-decided `store-prefixed` verdict is reached, the sweep passes the list and rewrites nothing carrying a reason, the write-time hook (`lib/citation-form.ts:358`) creates its scanner without the list and skips every hit carrying a reason, which is what makes the README's "only an unfenced token in a declared exhibit still draws its sentence" true. The `_citations` note is byte-identical in `fusion.json` and `templates/fusion.json`.

### 2. The dispatch rule against the orchestrator's own table (Medium)

`rules/fusion-workbench-conventions.md` `## Dispatching another agent` (commit `b3c9047b`) binds every agent: the consultant is dispatched "only for a second opinion on a concept or, through `/fusion:discuss`". `agents/orchestrator.md` line 604, the consultant row, and the bullet at line 170 say the orchestrator dispatches it only inside `/fusion:discuss`. The rule is emitted to the orchestrator. The event log holds 40 consultant `task_start` rows on 2026-09-21 with `detail` "Second opinion, step N concept" from this and the previous package, which the row forbids and the rule allows. The coder's departure from plan step 10's wording is stated in the commit and is reasoned (the plan's wording restated the ban `c066bfd3` deleted); the orchestrator row was outside the step's file list and was not brought along. Fix direction: the row gains the second-opinion case; narrowing the rule instead is a decision for the user, since it retroactively voids 40 dispatches. Issue filed.

### 3. The memo halt clause (Low)

`skills/memo/SKILL.md` line 38 halts on an empty `$CO`, and `## Process` applies it at step 2, before step 5 picks memo, task or idea. The idea route writes a work item, which needs no checkout key and which `rules/fusion-workbench-conventions.md` `### Who filed it` says to file on exit 5 and on a missing helper. The bullet's own justification names only `memos-.md` and `tasks-.md`. Fix: "no keyed write", halt scoped to the two keyed targets. Issue filed.

### 4. `hooks/lib/git.ts` and its callers — no defect

`GIT_TIMED_OUT` is a `unique symbol` in the return union; `isTimeout` keys on `err.code === "ETIMEDOUT"`, which is the code Node's `spawnSync` sets on its timeout path and on no other; one retry under the same budget; `GIT_TIMEOUT_MS = 10_000` with the measurement cited. Every caller in the tree handles the symbol: `staging-drift.ts` (two own sentences, `currentHead` to `""`), `review-coverage.ts` (`windowCommits` and `expand` pass it through, two own sentences, `anchorDate` widens to 0), `session-start.ts` (`undefined`, residual stated in the docstring), `citation-scan.ts` `declaredCitationFiles` (`unavailable`, and a distinct `refused` reason). `citation-sweep.ts` has its own `git()` wrapper on `spawnSync` and is untouched, correctly: it is off the hook path and reports `failed`.

One residual worth a sentence, not an issue. `hooks/hooks.json` sets no `timeout`, so Claude Code's default 60 s bounds the tracker. Worst case per tracker call is now `measureStagingDrift` 2×10 s + 2×20 s = 60 s plus `measureReviewCoverage` up to 3×20 s, where it was 45 s before. The decision `260906-0035_*_what-should-the-git-helpers-budget-be-and-is-a-timeout-retried.md` names and accepts the doubling, and both measurements are throttled in `hooks/tracker.ts`, so the case needs a git that stalls twice on a throttle miss. The hook fails open either way; what is lost is that call's rows.

### 5. `bin/fusion-commit-lock` — no defect

`region_start="$(date +%s)"` beside `head_before`; `emit_commit_event` returns unless `git show -s --format=%ct HEAD` is `-ge` it. The header names both residuals the plan asked for (a committer date set before the region; a fast-forward or reset onto commits somebody committed after it began, or a clock ahead) and `rules/commit-lock.md` `### The lock writes the commit event` names the same two. The measurement claims (`--amend` and `cherry-pick` create objects with fresh dates; `--date` sets the author date only) are consistent with git. The new case dates its fixtures 2020 so a same-second root cannot read as created in the region. An empty `$region_start` makes `-ge` fail and writes no row, which is the safe side.

### 6. `hooks/lib/citation-scan.ts` — the two new statuses, no defect

`spelled-marker` fires only when `findRecord(stamp + rest)` finds exactly one record and `rest` spells `_x_`; more than one still goes to `found()` as `ambiguous`; the wildcard form never matches `markerM`. `partition()` and `scanRecordCitations()` count it as resolved, `REPORTED_STATUSES` names it, `citation-form.test.ts` pins one case. `undecidable` is confined to `dashed && !md && headField` in the `STAMP_RE` branch; a value carrying `.md` or a marker slot stays judged, which the sweep test's second row pins. The checker's figures are unchanged as claimed (above).

### 7. `hooks/lib/events-query.ts` presence — no defect

The second pass keys on the same `person\0checkout` pair as the first, skips our own rows, respects the floor, and creates no party. The three-way fallback is disjoint and complete as the comment says. `bin/fusion-events` and the README row describe the same three branches. One case pins the new branch and the statement.

### 8. The reference lint's three readings — no defect, one deviation from plan

Wrapped anchors: only a match spanning the seam counts, so a whole-line match is never counted twice; the next line's `#`, `//` or `*` prefix is stripped before the heading test. Line numbers: refused only for class (a) tokens (`PLUGIN_PATH_RE`, backticked, `:\d+` inside the backticks), which is what `rules/fusion-workbench-conventions.md` `## Filename Patterns` forbids for living text. Slash commands: existence only, `RETIRED_COMMANDS` guarded both ways. The map holds two entries (`direct`, `migrate-workbench-v2`) where plan step 21 named six; the dead-weight guard makes the other four impossible, since nothing on the surface cites them. A deviation, and the right one.

### 9. Rule and prompt text — one contradiction (theme 2), the rest consistent

`## Dispatching another agent`'s gate paragraph agrees with `README-agents.md` lines 45 and 300; no `analyst determines` or `halts and does not proceed` wording survives anywhere in the shipped text. The `**Active spec/plan:**` replace rule reads the same in `agents/orchestrator.md` lines 217 and 441 and in the conventions; `agents/curator.md` and `docs/working-model.md` say nothing that contradicts it. The help topic's new paragraph enumerates its six readings and one setting; "No setting moves" is true (one was added, none retired). `docs/upgrading-to-v11.md` names five status values and its live-note sentence; `## Releasing` step 0 carries the obligation.

### 10. `Resolved:` lines — 31 of 33 closed records read, all consistent with the diff

Every `Resolved:` line read (the eleven the dispatch asked a sample of, and twenty more) names a change the diff carries at the commit it cites, or states honestly that it closes on a re-measurement or an erratum. The rolled growth-bound log in `260921-1855-surface-growth-bound-arming-and-re-baseline-log-2026-08-15-to-2026-09-05.md` is verbatim except the four store-segment citations its preamble says it wildcarded. The one known-stale sentence the roll left in `README-hooks.md` is already `260921-1855_o_readme-hooks-says-the-two-re-baselines-are-logged-in-full-in-the-growth-bound-test-header-after-the-log-rolled-out.md`, open in this container, and shipped inside the 11.10.0 bump; not refiled.

## Cross-cutting observations

- Three of the four validation-adjacent texts written in this range restate a rule in prose at more than one site (the exhibits `.md` rule at four sites, the consultant bound at three, the checkout halt at two). Where one site was outside a step's file list, the sites drifted in the same commit that fixed the other. The plan's per-step file lists were the mechanism, and they were one file short twice.
- `bin/fusion-paths` from the work-tree copy run outside the repository prints "Searched the install at <work tree path>": the clause reads the script's own root as the install. Wording only; the install copy is what normally runs there.

## Recommended sequencing

Nothing blocks the tag. Theme 1 before the leaf reaches a consuming project, since it is a documented guarantee the loader does not hold. Theme 2 with the user's ruling on direction. Theme 3 whenever the memo body is next opened.

Verification: `cd hooks && npm test` exit 0 (57 files, 967 tests, once, alone); `bin/fusion-citation-check` `dangling=301 store-prefixed=404 verdict=clean`; the exhibits probe reproduced on a scratch project at `64b607a9`.
