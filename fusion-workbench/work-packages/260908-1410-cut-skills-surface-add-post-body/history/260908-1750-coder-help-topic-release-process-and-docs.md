# coder — the help topic, the release-process check, the record, and the intro doc

**Status:** Complete
**Date:** 2026-09-08
**Circle:** 260908-1410-cut-skills-surface-add-post-body
**Plan:** `260908-1612_*_cut-the-skills-surface-and-add-the-post-step-body.md`, steps 12 through 15
**Agent:** coder

## What was implemented

### Step 12 — the help topic's update section

The three release paragraphs in `skills/help/SKILL.md` `### 4. Update` were swapped for three
covering v10.25, v10.24 and v10.23, newest first. The labelling convention the planner established
was kept: each paragraph is labelled by the install the reader is coming from and describes the
releases after it, so the new labels read v10.24, v10.23 and v10.22. Source material was
`docs/upgrading-to-v10-25.md`, `docs/upgrading-to-v10-24.md` and `docs/upgrading-to-v10-23.md`.
The standing pointer paragraph beneath them is unchanged, and no quote of shipped source was
compressed to make room.

The three paragraphs measured 2 297 bytes before and 2 518 after: **net +221 against a cap of 700.**
Separately, and counted separately as the step directs, `--only forum` joined the selector list in
the same body's cleanup line, at +16 bytes. The `skills/*/SKILL.md` total moved from 256 421 to
256 658, leaving 3 956 free of the 260 614 budget.

### Step 13 — where the release process names this surface

The check went into release step 0 of `CLAUDE.md` `## Release process`, as a before-tagging clause
after the review-coverage passage, rather than into the four-surface enumeration. That placement
keeps "four version surfaces" and "A fifth thing to keep coherent" both true, because the update
topic carries release paragraphs and not a version string, so it is not a version surface and it is
not a thing that has to agree with a second copy of itself.

One sentence inside step 0 had to move with it, and it is a cardinality rather than a preference.
The step read "Every other check in this step asks whether the plugin *loads*" beside the
review-coverage check, which is a universal over the step: a third kind of check makes it false
wherever it is placed. It now reads "The checks above it ask whether the plugin *loads*", which is
true of the validate, smoke and guard-root checks that precede it and says nothing about the one
added below. Nothing else in the file moved.

### Step 14 — the record

`260906-2014_*_the-help-topic-on-updates-has-missed-two-releases-and-names-none-of-the-last-three.md`
carries a `Resolved:` note and its marker is renamed `_o_` → `_c_`. Both acceptance clauses are met
and the note names where each was met, citing by heading anchor rather than by line.

### Step 15 — the intro doc

`docs/fusion-intro.md`'s list of individually reachable steps gained `--only forum`. The eight-step
count in the same sentence is untouched, because the message pass is Step 6's half. No `/fusion:post`
row was added to the command table, which lists administrative and situational commands only.

The plan's claim about the two other docs was checked rather than trusted:
`docs/messages-between-checkouts.md` and `docs/upgrading-to-v10-25.md` each already describe
`--only forum` in the standalone shape the shipped body carries (its own single confirmation, no git,
the file carried in the next commit), so neither needed an edit.

### The pin

`reference-resolution-lint`'s `BASELINE` moved from `{paths: 1702, anchors: 240}` to
`{paths: 1700, anchors: 241}`, re-approved in place with an entry naming what moved it. Attribution
was by single-file revert against the full tree, one file at a time: full tree 1700/241, the help
body reverted 1703/241, `CLAUDE.md` reverted 1699/240, `docs/fusion-intro.md` reverted 1700/241. So
the help body carries −3 paths and no anchor, `CLAUDE.md` +1 of each, and the intro doc nothing,
which sums to the −2 paths and +1 anchor observed. The help body loses paths because the retired
release paragraphs spelled more shipped files than their successors do; the entry enumerates both
sets rather than counting them.

No growth baseline moved: `SKILL_BASELINE`, `AGENT_BASELINE` and `TEST_LINE_BASELINE` in
`hooks/lib/__tests__/surface-growth-bound.test.ts` and `RULE_BASELINE` in
`hooks/lib/__tests__/rules-emission-golden.test.ts` are unmodified, and `git diff --stat` over both
files plus `hooks/lib/__tests__/fixtures/surface-growth.golden` prints nothing. The lint test file
stands at 1 005 lines, unchanged, the entry having been rewritten in place. The surface-growth
golden stays out of date until step 16, as the plan directs.

## Verification

`cd hooks && npx vitest run lib/__tests__/derivable-enumerations-lint.test.ts
lib/__tests__/reference-resolution-lint.test.ts lib/__tests__/workbench-citation-lint.test.ts
lib/__tests__/path-literal-lint.test.ts`, exit 0, 93 tests passed.

`bin/fusion-prose-metric` on each edited file, exit 0. No edit added an em-dash: `skills/help/SKILL.md`
reads 33 before and after, `CLAUDE.md` 143 before and after, the record 1 before and after, and
`docs/fusion-intro.md` 1 and `ok`. The three that read `over` read `over` at HEAD as well.

## Not done here

Steps 16 and 17, the golden rebuild and the full suite, are a separate dispatch. Nothing was
committed; the rename of the record is staged by the dispatcher.
