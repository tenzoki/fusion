# Step 6 — the stash and pop skills leave, and the commit lock keeps its own file

**Status:** Complete
**Agent:** coder
**Date:** 2026-08-15
**Source:** 260815-0029_*_plan-remove-eight-mechanisms-and-cap-growth.md, step 6
**HEAD at start:** `04ea182`

## What was done

`skills/circle-stash/` (33 379 bytes) and `skills/circle-pop/` (19 341 bytes) were deleted
with `git rm -r`, together with `hooks/lib/__tests__/circle-stash-git-exclusion.test.ts`, the
only test whose whole subject was the stash skill's git-stash pathspec.

`rules/workbench-stash-and-lock.md` was renamed with `git mv` to `rules/commit-lock.md` and
truncated to its `## Commit lock` half. The `## Stashes` half — opt-in behaviour, snapshot
layout, ten-field manifest schema, lifecycle, boundary events, cross-references — was the
definition for the two deleted skills and went with them. The heading `## Commit lock` was
kept verbatim, because four shipped citations use the adjacent `` `file` `## Section` `` form
that the reference lint resolves as a heading anchor.

The file's lede was rewritten: its audience justification named the two skills as half the
reason the file is emitted to `orchestrator` alone, and that half is gone. The commit lock
alone still carries it. The provenance header now names both causes, the original partition
and this Circle's rename, in the two-Circle-citation form `rules/rule-file-provenance.md`
allows.

`bin/fusion-rules` emission `1e` now emits `commit-lock.md`, with the comment block above it
rewritten on the same grounds.

## `RULE_BASELINE` moved with the name and was not re-cut

`hooks/lib/__tests__/rules-emission-golden.test.ts` carried the entry
`"workbench-stash-and-lock.md": 9_250`. It is now `"commit-lock.md": 9_250` — the same
number, re-keyed. A rename is neither of the two re-baselining events the file's
`## Re-baselining` section names, and re-cutting the entry to the truncated file's 5 663
bytes would have credited this step with a floor reduction rather than with the shrink it
actually produced. The role key `"circle-records.md + workbench-stash-and-lock.md"` was
renamed to `"circle-records.md + commit-lock.md"` and its `overRelease` prose rewritten: the
old text justified the role's overage partly by "the stash protocol its two skills need",
an argument that dies with them.

Measured through the regenerated golden, the orchestrator's per-dispatch rule text drops
112 010 → 104 181 bytes, of which 7 367 is the rule file's own shrink (13 030 → 5 663) and
462 the conventions and Circle-records edits below. Every other agent drops 398. Nothing
grew.

## The edits the step's list named, and what each was

Gate-forced (a test asserts it):

- `CLAUDE.md` — the two skills out of the skill listing at `:21`, because
  `derivable-enumerations-lint` reads every `/fusion:<name>` token in the whole file in both
  directions; the `/fusion:circle-stash` mention inside the `fusion-workbench/` Layout row
  at `:54`, for the same reason; the `` `rules/workbench-stash-and-lock.md` `` path citation
  in the `bin/fusion-commit-lock` row at `:41`, which the reference lint would report as
  dangling; and the `DEFINITION_SITES` echo at `:136`.
- `README-agents.md` — the two skill-table rows (asserted one row per skill directory), and
  the Conditional bullet at `:197`, where the lint requires the rule file and its full
  derived agent set on one line.
- `agents/coderev.md`, `agents/ontorev.md` — the `**Not-opened:**` example cited
  `skills/circle-stash/SKILL.md`, a path-shaped token the reference lint resolves.
- `hooks/lib/__tests__/reference-resolution-lint.test.ts` — the `STASH_DIR` entry in
  `ROOT_VARS` and the fixture test that consumed it. The gate's own "every non-plugin
  `ROOT_VARS` entry is load-bearing" test would have failed on the next run: with the skill
  gone, nothing in the surface put a plugin-shaped path behind that variable.
- `hooks/lib/__tests__/derivable-enumerations-lint.test.ts` — the stash-manifest field-count
  check, whose subject was the deleted `` ```yaml `` block. The sections were renumbered and
  the header comment's enumeration list corrected; the gate now re-derives seven
  enumerations, not eight.
- `hooks/lib/__tests__/fusion-paths.test.ts` — the two names out of `SKILLS`, which the
  resolver test walks by name.

Narrative or comment-only, edited here because the step's own change made the text false:

- `rules/fusion-workbench-conventions.md` — the header-table row is now "The commit lock";
  `stashes/` left the layout tree; the `## Stashes` pointer section was deleted and the
  `## Commit lock` pointer re-pointed; the `.active-circle` writer set dropped from four
  lifecycle skills to two, an enumeration that declares itself closed.
- `rules/circle-records.md` — two reader lists that named the stash skill.
- `agents/orchestrator.md` — six passages, five of which cited the stash skill as the reader
  that makes a convention load-bearing (`progress.max_turns` as a number, the two path
  fields' mechanical readers, the `(none yet)` literal test), plus the rule-path citation at
  Step 3b.
- `agents/playmaker.md`, `README-agents.md:40`, `skills/setup/SKILL.md` — see the judgement
  below.
- `skills/cleanup/SKILL.md`, `skills/commit/SKILL.md` — the rule path in their commit-lock
  citation.
- `skills/migrate/SKILL.md` — one of three named degrading readers.
- `hooks/turn-budget.ts`, `hooks/lib/review-coverage.ts`, `hooks/lib/staging-drift.ts` —
  docstrings and one classification `why:` string.

## The judgement calls, named rather than slipped in

**`stashes/` survives as a legacy store, and the exclusions that protect it stay.** Four
surfaces exclude or reserve `stashes/`: the bracket-marker probe in `/fusion:setup`, the
never-archive list in `/fusion:archive`, the activity scan in `/fusion:log-activity`, and
playmaker's frozen-store rule. Removing them would have been the literal reading of "the
stash protocol leaves", and it would have been a regression: a consuming project that
stashed before today still holds a frozen Circle under that directory, and the setup probe
unexcluded reads its bracket-marker filenames as an unconverted workbench and refuses Setup
permanently — the deadlock `skills/setup/SKILL.md` documents having hit twice on one project.
Nothing in the shipped plugin creates such a directory any more; what is there is legacy
content, and the surviving skills go on treating it as frozen. The prose at each site was
corrected to say the skills are removed; the exclusion itself was not touched.
`skills/log-activity/SKILL.md` needed no edit at all under this reading — its two mentions
name the directory and never the skill.

**`rules/commit-lock.md` was dropped from `DEFINITION_SITES` rather than re-added under its
new name.** The plan directed the opposite, on the premise that the renamed file still names
store literals. It does not: every store literal in that file was in the stash snapshot
layout. `path-literal-lint.test.ts`'s own guard would have failed with "names no store
directory; the entry is stale, remove it". The list is now four entries, which makes its
adjacent comment ("a fifth definition site is added here") correct again, and `CLAUDE.md`'s
echo was rewritten to two inherited rule files and a fifth site.

**One statement outside the step's list was corrected**, on the step-5 precedent that a
statement the step's own change makes false and no gate can see is the step's to fix.
`rules/fusion-workbench-conventions.md` `## Which of them a tracked workbench tracks` opened
"Two consequences the lifecycle skills depend on", and the second of the two — that an
ignored path is skipped by `git stash --include-untracked` and by nothing else — had its only
dependent in the stash skill's Step 7.6. Both facts were kept, because they govern any future
command that sweeps the tree; the claim that a skill depends on the second was removed and
replaced with a sentence saying when it lost its consumer.

## Verification

`cd hooks && npm test` — exit 0. 45 test files, 830 tests, 73.8 s.

Before the step: 46 files, 842 tests. The difference is the deleted
`circle-stash-git-exclusion.test.ts` and the two removed cases (the stash-manifest field
count, and the `ROOT_VARS` non-plugin-variable fixture).

The golden was regenerated by the documented one command,
`cd hooks && UPDATE_RULES_GOLDEN=1 npx vitest run lib/__tests__/rules-emission-golden.test.ts`,
its diff read (every line a shrink, no file gained a byte), and the suite then re-run without
the flag.

## Left for someone else

- **Step 5 is not marked `[DONE]` in the plan** though it landed at `04ea182`. Step 6 is
  marked; step 5's marker was never written.
- **The plan's own `**Decidability:**` head says `derivable-enumerations-lint` re-derives
  eight enumerations and names the stash-manifest field count among them.** It re-derives
  seven now. The plan is outside this step's file list and was not edited.
- **`skills/direct/SKILL.md` is in the step's file list and needed no edit.** Its only match
  is the ordinary English word in "instead of stashing the draft verbatim".
- **The cut log in `rules-emission-golden.test.ts` still names `workbench-stash-and-lock.md`
  in three historical entries.** Those record what the file weighed on the dates they name,
  so they were left standing; the first was annotated with the rename so a reader can follow
  the name forward.
