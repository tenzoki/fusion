# README-agents cleanup step numbers — the half S10 could not reach

**Agent:** coder
**Status:** Complete
**Circle:** 260907-0829-message-between-checkouts-read-before-pull

## Task

Finish the defect record `260907-1942_*_the-cleanup-pipelines-step-numbering-has-drifted-in-its-own-body-and-in-readme-agents.md`.
Plan step S10 corrected the four drift sites inside `skills/cleanup/SKILL.md` and left the record
open, because its dispatch was bounded to that one file. The remaining half is `README-agents.md`,
which labelled both `/fusion:log-activity` and `/fusion:curate` "Cleanup Step 6".

## What the pipeline actually says

Read from `skills/cleanup/SKILL.md` `## Arguments` as it now stands rather than from the record's
wording. The selector table fixes the runtime order: Step 3 reconcile, Step 4 archive, Step 5
`log-activity`, Step 6 `claude-md` (and the message half). The flag list in the same section fixes
`--full` to Step 6.

## Changes

`README-agents.md`, two edits:

- the `/fusion:log-activity` row of the skill table: **Cleanup Step 6** → **Cleanup Step 5**. The
  `/fusion:curate` row was already correct at Step 6 and was left alone.
- the `curator` `**Scope:**` row of `## Dispatch parameters`: "`/fusion:cleanup` Step 5 /
  `--only claude-md`" → "Step 6". This site is not named in the record; it is the same defect and
  was corrected in the same pass.

## The requested sweep, and what it found

Every `Step <n>` token in `README-agents.md` was read against the selector table. Beyond the three
corrected sites, none is wrong. Two classes are easy to misread as drift and are not:

- the `## Step 2` / `## Step 6` citations in the three `curator` parameter rows are headings of
  `skills/curate/SKILL.md`'s own body, not pipeline steps, and both resolve there.
- `/fusion:next` and `/fusion:direct` step citations belong to those skills' bodies.

One finding was reported and deliberately not repaired: the `/fusion:cleanup` row of the skill table
describes the order as "archives (tier-1), reconciles `CLAUDE.md` at a user gate, logs activity",
reversing Steps 5 and 6. It names no step number, so it sits outside this record's acceptance test,
and the same sentence stands in `skills/cleanup/SKILL.md`'s frontmatter `description`, which this
task was not scoped to touch. Repairing one of the two alone would put them out of sync, so both
belong in one follow-up.

## Record

`Resolved:` note appended; marker renamed `_o_` → `_c_` with `git mv`, so the rename is staged.

The two paths below are the rename's operands, not citations of the record — cite it as
`260907-1942_*_the-cleanup-pipelines-step-numbering-has-drifted-in-its-own-body-and-in-readme-agents.md`.

```
from: fusion-workbench/shared/issues/260907-1942_o_the-cleanup-pipelines-step-numbering-has-drifted-in-its-own-body-and-in-readme-agents.md
to:   fusion-workbench/shared/issues/260907-1942_c_the-cleanup-pipelines-step-numbering-has-drifted-in-its-own-body-and-in-readme-agents.md
```

## Verification

`cd hooks && npx vitest run lib/__tests__/derivable-enumerations-lint.test.ts` — exit 0
(20 tests passed). The full suite was not run, per the dispatch;
`reference-resolution-lint.test.ts` is known red on a pinned count a later step re-approves and was
not touched.
