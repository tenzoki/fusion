# Reconciliation — Circle 260816-1741-guard-becomes-observation-only, final pass

**Date:** 2026-08-17
**Agent:** reconciler
**Domain:** `code`
**Trigger:** orchestrator Phase 3, before the Circle's `_t_` → closed transition
**Range verified:** `3d41d4a..9ae7974` — 21 commits after the anchor, 22 counting it
**Status:** Complete

## Verdict in one line

The Circle's work is done and verified; its tracking files had stopped being written to after
step 14, and this pass caught them up. Three issues were stale-open and are closed; five are
genuinely open; two new defects came out of the pass.

## What was reviewed

| Store | Read | Updated |
|---|---|---|
| Circle planning | 1 plan | 1 — status, four step markers, reconciliation log, `_p_` → `_c_` |
| Circle issues | 21 | 8 — 3 closed, 5 annotated and left open |
| Circle decisions | 3 | 0 — all three already `_i_` with cited commits |
| Circle reviews | 2 | 2 — reconciliation annotation appended to each |
| Circle history | 22 | 0 — this file is the 23rd |
| Shared decisions | 30 active (`_o_`/`_a_`) across all stores | 0 |
| Shared issues | 337 | 0 — the one this Circle produced (`260817-1217_o_*`) verified still open |

New defects filed: 2, both in this Circle's issue store.

## The plan

`260816-1915_c_the-compliance-guard-becomes-observation-only.md` — every one of the 18 tasks
landed. Four markers were stale and are corrected: steps **7b** (`6890ea2`) and **15**
(`9ae7974`) carried no `[DONE]`, the amendment's **step 16** (`5763550`) carried none at all, and
the header still read `Approved`. The file is now `**Status:** Complete` and its marker is `_c_`.

**Nothing was found to be marked done that was not done.** That is the direction of drift this
pass exists to catch, and it did not occur here. Every substantive claim was checked against the
tree — `guard.ts` down to 223 lines with no `block` call, `escalation.ts` / `clear-halt.ts` /
`project-relative.ts` absent with no compiled orphan in `hooks/dist/`, `paths.ts` reduced to a
single export, `self-detect.ts` to `isFusionPluginRoot` alone, the four configuration files
renamed or deleted, `docs/upgrading-to-v10.md` present, `cd hooks && npm test` green at 35 files
and 653 tests, and the tag `v10.0.0` resolving to `e331332`. The full evidence table is in the
plan's own `## Reconciliation Log`.

## Issues closed on verified evidence (3)

- **`260816-2123`** — the `CLAUDE.md` citation lint. Closed on the remedy the record itself
  recommended and the user chose: the curator pass ran inside the Circle as step 16. Verified by
  running the gate, not by reading the diff — 34 cases green.
- **`260816-2317`** — the dangling set that grew to four at step 7b, and the Layout row that went
  false with it. Closed on both halves: the two new paths are gone *and* the row was rewritten
  rather than repaired at its paths, which is the half no lint can see. Each of the four false
  prose statements was checked individually at `CLAUDE.md:30`.
- **`260817-1032`** — the growth baselines. Closed because its own `## What was done instead` is
  what landed: `TEST_LINE_BASELINE` moved alone, and
  `hooks/lib/__tests__/surface-growth-bound.test.ts:112-181` carries the argument and cites the
  record by path at `:174`.

## Issues left open, with reasons (5)

**Two are corrections to this Circle's own Grounding and are due at the closure transition.**
`260816-1917_o_*` (the test list) and `260816-1917_o_*` (the text-surface list) each have their
substantive half discharged — `guard-state-shape.test.ts` was correctly kept and is green, and all
three omitted surfaces were correctly fixed — while `_t_circle.md:101` and `:106-115` still say
otherwise. The Circle record is not the reconciler's to edit; it is transitioned by the
orchestrator, the playmaker or the shaper. **After the transition the record is history, so a
closed Circle would carry two false statements about its own scope permanently.** This is the
single most actionable item in this pass.

**Three are open against the shipped surface, and one of them has now shipped in a release.**

- `260816-2318_o_*` — `agents/orchestrator.md:132` still scopes its repeat-to-the-user mandate to
  dropped keys, so the v10 migration notice reaches a consuming project's chat through no mandate.
  Read at HEAD; unchanged. Medium, shipped to every consumer.
- `260816-2319_o_*` — the `answer`-site case in `hook-fail-open.test.ts:300-321` still carries its
  four original assertions and no bound in its comment. Green, and green is the problem.
- `260816-2320_o_*` — re-measured by grep at HEAD: `MultiEdit`, `NotebookEdit` and `notebook_path`
  appear in one test file only, as matcher entries. Two of the four tools of the guard's only
  remaining product reach no integration case.

**Nothing was misfiled.** Every one of the 21 Circle issues is a defect in the "go fix it" sense,
and none is an open question that belongs in the decision store. There is no
"Misfiled — should be a decision" section this pass, and that is a finding rather than an
omission: the reviewers filed cleanly.

## New defects (2)

- **`260817-1417_o_the-release-went-out-over-a-turn-whose-six-shipped-file-commits-no-review-opened.md`**
  The plan's `## Where this Circle stops` names this Circle's review pass as a precondition of the
  tag. Turn 3 had no review pass. `bin/fusion-review-coverage --since 3d41d4a` reports
  `uncovered=9`; six touch shipped files, 35 files between them, and `v10.0.0` points at one of
  the six. This is **not** the coverage-policy question — that is answered
  (`shared/decisions/260815-2109_a_*`, options 3 then 1, coverage advisory) and was followed here.
  It is the plan's own clause, unmet and unrecorded until now.
- **`260817-1417_o_one-commit-in-this-circles-range-is-written-in-german-while-the-artifact-language-is-en.md`**
  `9ae7974` is written in German. The project's artifact language is `en`, and
  `rules/fusion-workbench-conventions.md` `## Project language` names commit messages as the
  worked case that settled the rule. One of 21 in this range. Low; not rewritable, since the
  commit is published.

## Two answered decisions worth naming, neither in this Circle's scope

Both are `_a_` and unimplemented, and both were load-bearing for this pass:

- `shared/decisions/260815-2109_a_may-a-circle-close-over-an-uncovered-review-range-and-who-decides.md`
  — its option 3, the filter of the uncovered set to shipped-file commits, is not in
  `bin/fusion-review-coverage`, so this pass split the nine by hand. Its own text predicted that
  an unfiltered number "will be argued with every time it fires, and will lose".
- `shared/decisions/260816-0119_a_can-anything-carry-the-rename-to-citation-obligation-when-a-record-marker-moves.md`
  — renaming the plan `_p_` → `_c_` leaves 33 workbench citations naming a marker it no longer
  carries. Five of the 33 were already stale at `_o_` before this pass, so the rot predates the
  rename. No lint breaks: `reference-resolution-lint.test.ts` scans the plugin's shipped text and
  not the workbench.

That decision record also asked, at low confidence, to be re-measured over the next two Circles:
does reconciliation reliably substitute for review? **This is the second such Circle, and this pass
found two defects in the uncovered range that no reviewer opened.** That is a data point in its
favour, recorded here so the re-measurement has something to read.

## Coherence

The three-edge verdict is written to the orchestrator's session history file,
`circles/260816-1741-guard-becomes-observation-only/history/260816-1841-orchestrator-session.md`
`## Coherence`, not here.
