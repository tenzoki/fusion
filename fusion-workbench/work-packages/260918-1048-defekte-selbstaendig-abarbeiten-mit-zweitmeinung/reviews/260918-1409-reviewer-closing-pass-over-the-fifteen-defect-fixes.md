# Closing review: the autonomous defect package, fifteen fixes with a second opinion each

**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Reviewed-range:** `1aeb3679..f7545a4c`
**Not-opened:** none
**Review domain:** code
**Work-item:** 260918-1048-defekte-selbstaendig-abarbeiten-mit-zweitmeinung
**Plan:** `260918-1124_*_autonomous-defect-package-fifteen-fixes-with-a-second-opinion-each.md`

## Summary

All fifteen fixes do what their defect record's `Resolved:` line says, and every acceptance the plan states that can be re-run at HEAD passes (the greps, the byte and line counts, the compiled `classify()` probe). The two executable changes are correct and each is pinned by a test that fails without it. `hooks/dist/` is in step with source for all six changed `.ts` files. Two defects were found beside the range's edits, both pre-existing, both in text the range touched without repairing: a false "class L in full" claim in the block step 13 edited, and a section of `README-agents.md` that describes three retired parameters as live and carries five moved line citations, in the section step 3 edited. Neither blocks closure.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 0 |
| Medium | 1 |
| Low | 1 |

## The dispatch's five asks, answered

1. **Each fix against its record's acceptance and `Resolved:` line.** Fifteen records renamed `_o_` → `_c_` in the range, each with a `Resolved:` line. Every claim in those lines that names a file, a count or a command was re-derived at HEAD:
   - `grep -c nineteen CLAUDE.md` = 0; `wc -c CLAUDE.md` = 8 105 (the line says 8 105).
   - `README-hooks.md` `### Growth bounds on the shipped text`: the dispatch-path sentence names `CLAUDE.md`; the one surviving `this file` is the possessive the line names.
   - `README-agents.md:80` reduced to two sentences; the `reconciler` row reads `code` \| `data`; the editor paragraph carries "option 3". The five removed tokens match the 28th re-approval entry (below).
   - `README-agents.md:200` points at "the `skills/` section heading below"; `grep -n '^### .skills/'` returns line 241 and it is the only heading naming `skills/`. Not the anchor citation the plan's acceptance wrote (the heading carries backticks, which the anchor form cannot nest); the `Resolved:` line says so.
   - No `jq` over a `.jsonl` log without `fromjson?` remains in shipped text (the two `agents/ontocoder.md` hits read a JSON file). The README claims were checked: `bin/fusion-commit-lock:376` and the orchestrator prompt's `echo … >>` are the two shell appenders of the orchestrator log; `emitEvent` at `hooks/lib/events.ts:151` is the single writer of the hook log.
   - `agents/orchestrator.md:34` names one record, `260824-2013_*_do-the-nine-skill-bodies-that-present-dialogs-follow-the-dialog-ban.md`, whose marker is `_d_`, matching "deferred"; `grep -n 'tools:'` returns lines 170 and 604 only.
   - `bin/fusion-source-root` exit-2 paragraph carries "from memory"; `bash -n` was not needed, the edit is comment-only.
   - `grep -c 'two events'` and `grep -c fifteen` on `rules-emission-golden.test.ts` both 0; the file is 1 330 lines; the header's retirement date `2026-09-11` (line 71) is what the two rewritten sentences cite.
   - `hooks/citation-sweep.ts` and `hooks/lib/citation-scan.ts` carry one figure (42) stamped `3276b1e1`, and the 29 is explained against `260829-1346_*`'s own grep (`^\+\*\*Date:\*\*`, one label of seven).
   - `grep -rn 'Step 3b'` over `hooks agents skills rules bin docs README*.md CLAUDE.md` returns nothing; the eighth site in `bin/fusion-staging-drift:46` is the one the record did not list, and item numbers 3, 4, 5 and 7 match `### Step 4 — commit` at HEAD.
   - `derivable-enumerations-lint.test.ts` is 476 lines with a sixth `CLAIMS` row; `staging-drift.test.ts` is 653 with one new case; `commit-message-path.test.ts` is 385.
   - Step 15: `agents/orchestrator.md` is 89 241 bytes (89 188 − 182 + 235, as the two `Resolved:` lines state); the golden fixture carries that figure. Regenerating `surface-growth.golden` is not a baseline move: the baseline is `AGENT_BASELINE` in `surface-growth-bound.test.ts`, untouched.

2. **The two executable changes.**
   - `hooks/lib/staging-drift.ts:468`: `segments[0] === "circles" && segments.length === 3 && segments[2] === `${segments[1]}.md``. `rel` reaches `classify()` workbench-relative with `/` separators (`:564-566`), and `git status --untracked-files=all` (`:510`) means a new container's files are listed individually, so the branch sees the record. Probed on the compiled module with a synthetic path of the container shape (the container store, a `YYMMDD-HHMM-<slug>` directory, and that same name plus `.md` inside it): `record`, "a work item's own record"; a sibling `note.md` in the same directory: `unclassified`. Pinned by the new `staging-drift.test.ts` case, which asserts `unstaged=1`, the record row's class and `why`, and the sibling's class.
   - `derivable-enumerations-lint.test.ts:170`: the row's regex matches `README-agents.md:49` and nothing else in that file; the loop asserts at least one hit and every hit equal to `agentNames().length` (11 at HEAD). The `Resolved:` line's rehearsal (one prompt moved aside) is the test's own failure path.

3. **New false claims, dangling references, wrong citation forms.** Every path and anchor the range added was resolved: `helpers/guard-harness.ts`, `hooks/lib/events.ts`, `bin/fusion-events`, `README-agents.md` `### Orchestrator observability` (line 164), `agents/orchestrator.md` `## Staging check` / `### Step 4 — commit` / `## Ending the session` / `## Closing a work item`, `rules/fusion-workbench-conventions.md` `## Backlog entries — work items`, `## Re-baselining: the three events at which a baseline moves` (`growth-bound.ts:18`), and the five records the `Resolved:` lines file beside themselves. The `review-coverage.ts:104` claim "once per work item, at its closure" matches `## Closing a work item` step 2. All record citations are in the storeless wildcarded form. Nothing added is false. What was left standing beside the edits is the two findings below.

4. **The re-approval entries on `reference-resolution-lint.test.ts:464`.** The line carries three entries dated 2026-09-18; the 27th was there at `1aeb3679`, the 28th and 29th are this range's. The 28th attributes −3 paths / −2 anchors to the `README-agents.md` bullet cut: the old bullet carried `README-agents.md` `## Dispatch parameters`, `agents/planner.md`, and `rules/fusion-workbench-conventions.md` `## Project language`, which is exactly three paths and two anchors, and the two corrected cells add no token. The 29th attributes +3 paths / +1 anchor to the `jq` edits: `bin/fusion-events`, `hooks/lib/events.ts`, `README-agents.md` with `### Orchestrator observability`, all present in the new text. `BASELINE` moves `anchors: 290 → 289` and `paths` returns to 1679, which is 290 − 2 + 1 and 1679 − 3 + 3. Attribution matches the diff.

5. **`hooks/dist/` in step.** `cd hooks && npm run build` then `git status --porcelain hooks/dist` prints nothing. Six source files changed, six `dist` modules changed, and they correspond one to one.

## Findings by theme

### Theme: a comment guarantee the range reasoned from is false for two entries

**Medium → filed as Low.** `hooks/lib/staging-drift.ts:176-178` says `LIVE_STATE` "holds two of that partition's classes in full". `rules/workbench-tracking.md` `## The four classes` puts `.checkout-id` and `.cadence-anchors` in class L; neither has a row, and the compiled `classify()` returns `unclassified` for both. The same paragraph spans class L as "`.session-marker` through `portfolio.md`", a retired row. Step 13's `Resolved:` line rests on the class-L reading of this block. No verdict changes (`fault` is false in both classes), which is why it is Low. Issue: `260918-1409_*_the-live-state-list-claims-class-l-in-full-while-two-class-l-entries-classify-as-unclassified.md`.

### Theme: the roster section step 3 edited still contradicts itself two paragraphs apart

**Medium.** `README-agents.md:53` describes `**Draft:**`, `**Answers:**` and `**Initiated by:**` as live parameters with a stated bound and cites `agents/shaper.md:70`; `README-agents.md:72` says the three went at v11, and no prompt or skill body carries them. In the same table, five `path:line` entries have moved (`agents/reconciler.md:28-30`, `:41-43` → line 40; `agents/orchestrator.md:434` → 230; `agents/orchestrator.md:485`, `:1321` → 201 and 598, on a 617-line file; `agents/reviewer.md:15` → 24), which is the case `rules/fusion-workbench-conventions.md` `## Filename Patterns` gives for banning the form in living text. Issue: `260918-1410_*_the-dispatch-parameters-section-describes-three-retired-parameters-as-live-and-five-of-its-line-citations-are-stale.md`.

## Cross-cutting observations

- **A third consumer of the four-class split.** `rules/fusion-workbench-conventions.md` `## fusion-workbench Layout` obliges a new root-anchored entry to land in its tree and in `rules/workbench-tracking.md` "in the same commit". `hooks/lib/staging-drift.ts` `LIVE_STATE` is a third place that reads that split, and the sentence does not name it; two entries reached the first two and not the third. Named in the first issue's acceptance as a rule edit to decide with the fix.
- **Line-number citations survive where the lint cannot see them.** The range repaired `Step 3b` labels in eight places and moved three test-file comments onto heading anchors, which is the right direction. The same section of `README-agents.md` the range edited keeps twelve `path:N` entries, five stale, and one names a line past the end of its file: `reference-resolution-lint` resolves the path half only. The same blind spot is stated in three of the fifteen closed records ("why no gate sees it").
- **The package's own discipline held.** Every `Resolved:` line's counts re-derive; every funding cut removed restated rationale rather than attribution (the two files' pin lines are intact); the two goldens that moved (`surface-growth.golden`, `BASELINE.anchors`) moved for the stated reason and by the stated amount.

## Recommended sequencing

Nothing blocks closing the work item. Both issues are follow-on cleanup for `coder`: the `README-agents.md` one first, since it is a false present-tense claim in a section that calls itself the single authoring home; the `LIVE_STATE` one together with `260918-1335_*`, since both edit the same comment block and a fix to one should read the other.
