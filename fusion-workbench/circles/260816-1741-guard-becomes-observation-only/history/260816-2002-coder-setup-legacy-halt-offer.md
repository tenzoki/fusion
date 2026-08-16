# Coder — Setup offers to delete a legacy halt

**Date:** 2026-08-16 20:02
**Agent:** coder
**Status:** Complete
**Plan:** `circles/260816-1741-guard-becomes-observation-only/planning/260816-1915_p_the-compliance-guard-becomes-observation-only.md`, step 1
**Files changed:** `skills/setup/SKILL.md`

## What was implemented

Step 1 of the plan: the guard check in `/fusion:setup` Step 3 became a migration offer.

The old bullet read `./fusion-workbench/.guard-state/escalation.json`, warned that all write
operations were blocked when `haltActive` was true, and offered to clear the halt or to
proceed with it active. Both halves of that were false at this version: nothing raises a
halt any more, and nothing reads the flag.

The replacement has three parts.

1. A read-only probe that prints `legacy halt flag present` or `no legacy halt flag`. It
   tests the file's existence and greps for `"haltActive": true`, so an absent file, an
   unreadable one and `haltActive: false` all land in the same branch.
2. The silent branch. On `no legacy halt flag` Setup says nothing at all, which is what every
   other idempotent step in this body does when it has nothing to do.
3. The offer. On `legacy halt flag present`, Setup tells the user that the flag was written by
   a mechanism fusion no longer ships, that the protected-path check that raised it was
   removed on 2026-08-12 and that no code at this version reads the flag, then offers, with
   one `AskUserQuestion` in the project's chat language, to delete the file. The default and
   recommended option deletes it; the other keeps it and the offer returns on the next run.

The text carries an explicit instruction not to describe the deletion as clearing a halt,
unblocking writes, or restoring write access, and to report it in those terms in the
Setup-complete summary. A user who reads "the halt is cleared" believes write access was
handed back, and it never left.

`clear-halt.js` is named nowhere in the new text. That is deliberate: the plan deletes it at
step 6, and the sequencing constraint in
`shared/decisions/260812-1232_*_does-the-escalation-counter-survive-a-block-source-that-ships-inert.md`
`## Constraints` requires this replacement remedy to exist before the old one goes.

## Decisions taken while implementing

- **The offer stays a bullet inside Step 3**, where the old guard check sat, rather than
  becoming a step of its own. The plan names the site (`Step 3`, `:300`) and the surrounding
  bullets already carry nested prose and shell blocks.
- **No new plugin-path or record citation was written into the skill body.**
  `reference-resolution-lint.test.ts` pins the number of citations it resolves, and a citation
  added here would have moved that pin for a reason unrelated to this step.
- **The probe was verified in both `bash` and `zsh`** against four states (file absent,
  `haltActive: false`, `haltActive: true` without whitespace, and a file that is not JSON).
  All four print the intended verdict in both shells.

## Verification

`cd hooks && npm test` — exit 1, three failing tests.

**Two failures predate this edit.** Both were reproduced on the unmodified tree before any
change was made:

- `reference-resolution-lint.test.ts` — `hooks/guard.ts:307` cites a decision record with a
  stale `_o_` marker; the record now exists under `_a_`.
- The same file's baseline case — `records` counts 94 against a pinned 95, which is the same
  dangling citation not being counted as resolved.

**One failure is caused by this edit and is expected.**
`surface-growth-bound.test.ts` — "matches the checked-in golden, surface by surface". The
skill surface grew by 1 861 bytes, so the checked-in fixture
`hooks/lib/__tests__/fixtures/surface-growth.golden` no longer matches the tree. The
head-room bound itself still passes: `skills/` sits well inside its 20 000-byte budget. Plan
step 10 regenerates that golden with `UPDATE_SURFACE_GOLDEN=1`, and this step's scope
excludes `hooks/`, so the fixture was deliberately not regenerated here.

This step's own assertion lands at plan step 9, which re-points
`legacy-halt-clearing.test.ts` onto the new text.
