# Guard the setup marker's version resolution

**Agent:** coder
**Date:** 2026-08-23
**Circle:** 260823-0023-settle-what-travels-between-checkouts
**Status:** Complete
**Task:** Fix the high-severity Turn 1 review finding `260823-1110_*_the-conditional-marker-write-has-no-plugin-root-guard-so-an-empty-version-wipes-the-record.md`

## What changed

`skills/setup/SKILL.md`, Step 0, the setup-marker write. Four edits, one mechanism:

1. One guard line ahead of the condition, in the shape Step 0e already uses: `[ -n "$V" ] || { echo "marker-version-unresolved"; exit 0; }`.
2. The introducing sentence gains the third condition it now carries: the shipped version has to be readable at all.
3. Two paragraphs of prose after the block: what the token means, that it is not the same state as a match, that Setup is not blocked, that the outcome is reported, and that an existing empty-version marker is left rather than repaired because the unchanged condition already repairs the field.
4. The Setup-complete summary at the end of the skill gains the marker write as an item to report.

The pre-v4 refusal text was not touched.

## Why this shape

Steps 0b, 0d, 0e and 0f each guard the plugin root and none of them halts the run. Step 0e is the closest neighbour: it prints a token to stdout, changes nothing, and requires the token to be reported. That is exactly the required behaviour here, so the fix reuses it rather than inventing a second form. No sentinel version string was introduced: a placeholder would be a second thing to keep right, and the honest outcome of an unreadable version is no marker rather than a marker asserting a version nobody read.

A workbench that reaches this block with the root unset has also missed the monitor copy, the stylometric profiles and the configuration seed. Writing a marker over that would assert a setup that did not happen, so the fresh-workbench branch writing nothing is a property rather than a gap: the run says so, and re-running after a session restart completes it.

## Verification

Seven cases in a scratch tree, running the block extracted verbatim from the edited file. All passed; the tree was destroyed afterwards.

`npm test` from `hooks/` — 724 passed, 41 files, exit 0.

`hooks/lib/__tests__/fixtures/surface-growth.golden` was regenerated: two lines, `setup/SKILL.md` and the `skills` total, both +1 341 bytes. No baseline moved. Head-room on `skills/` falls from 2 644 to 1 303 bytes.

Not committed — the orchestrator commits.
