# The exclusion test's two comments describe the code as it now stands

**Agent:** coder
**Date:** 2026-08-10 11:18
**Status:** Complete
**Task:** fix `260810-0947_*_the-circle-stash-exclusion-test-describes-a-mechanism-and-a-code-shape-that-no-longer-exist.md` — the circle-stash exclusion test describes a mechanism and a code shape that no longer exist
**Source record:**
- `260810-0947_*_the-circle-stash-exclusion-test-describes-a-mechanism-and-a-code-shape-that-no-longer-exist.md`

**Origin:** Not Circle work; no Circle active. The other half of the scope decision the
executor of `260810-0505_*_circle-stash-step-7-6-still-swallows-the-push-exit-code-the-branch-exists-to-avoid.md` made when it declined to widen out of the skill body (its own
log is `260810-0941-coder-circle-stash-push-exit-code.md`, "Left for the user").

## What was wrong

Comments only. Both claims were true when written and were left standing by `72b798e`,
which corrected the same two things in `skills/circle-stash/SKILL.md`:

- `:176-177` said `git stash push <pathspec> --include-untracked` runs `git add --all`
  internally. It runs a bare `git add -- <pathspec>`; the `-u` form is the one git uses
  *without* `--include-untracked`.
- `:188` described `|| true` swallowing the push exit code. That code is gone — both
  terminators now capture `PUSH_RC` and take a failure branch.

## What changed — `hooks/lib/__tests__/circle-stash-git-exclusion.test.ts` (only file touched)

Three comment edits and one addition. No assertion changed; nothing in the file wanted one.

- The `--all` comment rewritten from `SKILL.md:333` and `:335` rather than paraphrased, so
  the two do not drift apart again. It now carries the **measurement** — on an ignored
  workbench against `':/' ":(exclude)$WB_NAME"`, `git add -n --all` → 1, bare
  `git add -n` → 1, `git add -n -u` → **0** — and names that third spelling as the single
  case where the three disagree. That is what stops a maintainer concluding the probe's
  spelling is interchangeable with git's internal one.
- The `|| true` comment replaced by the shape of the failure the assertion below it
  measures: git creates an entry and leaves the tree unchanged, the stack depth reads that
  as a save, and `PUSH_RC` is what catches it.
- **The addition the record asked for:** the `extractBashBlock` doc comment now states that
  taking the *first* bash block is a coupling the skill body has to honour — Step 7.6 stays
  one block, and a split silently truncates the script here and fails four cases on
  assertions that look unrelated. Placed on the extractor, where the "first" actually lives;
  the file header was adjusted to say "the first ```bash block" so the two agree.

## Verification

`cd hooks && npm test` — **exit 1**, 39 files, 1 failed. The failure is
`lib/__tests__/fusion-plane.test.ts` (7 cases across `map --rebuild` and the live-rebuild
groups), which belongs to the concurrent task editing `bin/fusion-plane`; both that script
and that test file are modified in the working tree by that task, not by this one. Nothing
failed naming the file this task touched.

Scoped evidence for this file: `npx vitest run lib/__tests__/circle-stash-git-exclusion.test.ts`
— exit 0, 8 tests, all green, including the four configuration cases that execute the
extracted block.

## Left for the user

- Not committed, and the issue marker not renamed: the user does both after validating.
