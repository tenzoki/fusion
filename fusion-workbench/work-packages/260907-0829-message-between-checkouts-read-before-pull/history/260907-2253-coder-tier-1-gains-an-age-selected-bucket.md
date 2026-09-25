# Tier 1 gains its first age-selected bucket, and one dangling anchor closes

**Agent:** coder
**Filed by:** coder, Kai Stalmann <ks@qantr.com>
**Checkout:** 1d05b0e4
**Circle:** 260907-0829-message-between-checkouts-read-before-pull
**Task:** plan step 11 of `260907-1942_*_message-between-checkouts-read-before-pull.md`, plus the repair in `260907-2248_*_renaming-the-shared-kinds-heading-dangles-the-archive-skills-anchor-citation.md`
**Status:** Complete

## What was done

One file edited: `skills/archive/SKILL.md`.

**The repair.** Step 2 renamed the shared-kinds heading in `rules/workbench-path-resolution.md`, and this skill cited it by its old wording, so `reference-resolution-lint.test.ts` reported a dangling anchor. The citation now reads `` `### The four unconditionally-shared kinds` ``, which the gate resolves by prefix against the heading as it stands, `### The four unconditionally-shared kinds, and the one that meets the target argument`. The issue carries a `Resolved:` note and its marker moved `_o_` → `_c_`.

**Step 11.** The ruling in `260907-0902_*_how-is-the-message-stores-retention-expressed-against-an-archive-step-with-one-threshold-per-run.md` is option 1, so the message bucket joins tier-1 at the run's own threshold rather than carrying one of its own. Four edits realise it:

- The `### Tier 1` table gains a `$SCAN_FORUM` row, selecting `*.md` whose `YYMMDD` filename prefix is older than the threshold.
- The tier heading widens from terminal markers to terminal markers and age, and a sentence beneath it states the basis: one audience, one short lifetime by design, and an archive that moves rather than deletes. The same sentence names the accepted cost once, that a checkout dormant longer than the threshold can lose an entry unread.
- Step 1's no-derivation sentence gains `$SCAN_FORUM` beside `$SCAN_BACKLOG` and `$SCAN_CONSULT`, since the kind exists only in the shared store.
- The markerless row of `## Marker vocabulary` gains the forum entry.

The store is named only as `$SCAN_FORUM`; no path literal was written, which `path-literal-lint.test.ts` confirms with `forum` now in its `TYPE_FOLDERS`.

## Budget

`wc -c skills/archive/SKILL.md`: 26 364 before, 26 978 after. Growth 614 bytes against the step's 900-byte allowance. No baseline was edited.

`bin/fusion-prose-metric` on the file: 55 em-dashes before and after, so the edit added none; the rate fell from 17.2 to 16.6 per 1000 prose words as the word count rose. The file was already over the ceiling of 3 before this task and the helper reports rather than gates.

## Verification

`cd hooks && npx vitest run lib/__tests__/reference-resolution-lint.test.ts lib/__tests__/path-literal-lint.test.ts` — exit 1.

`path-literal-lint.test.ts` is green. In `reference-resolution-lint.test.ts` the dangling-reference assertions are green, including the one this task repaired; what fails is the pinned-count assertion, `{paths: 1658, anchors: 228}` received against `{paths: 1646, anchors: 227}` pinned.

Attribution of the two deltas:

- **anchors +1 is this task's**, and it is the repair: the citation moved from dangling to resolved, so the gate now counts it.
- **paths +12 is not this task's.** Neither edited file gained or lost a plugin-path token; the sentence already cited `rules/workbench-path-resolution.md` and still does. The issue record named this failure when it was filed and attributed it to the new `bin/fusion-forum` header, which a sibling agent was writing in this tree at the time.

The baseline was deliberately left alone: re-approving it belongs to step 12, which regenerates both goldens and runs the suite once every step's edits are in.

## Notes for the next reader

- The decision record's `**Cross-references:**` line cites the tier heading by its pre-edit wording. That citation is not gated: `reference-resolution-lint.test.ts` scans the shipped surface (`rules/`, `agents/`, `docs/`, `templates/`, `skills/*/SKILL.md`, the root READMEs and `CLAUDE.md`, plus `bin/` and `hooks/lib` comments) and excludes the workbench tree. Left as filed, since the record is not this step's to edit.
- `"$FUSION_PLUGIN_ROOT/bin/fusion-paths" archive` exits 4 on `$SCAN_FORUM`, because the installed copy at `/Users/k1/.fusion` predates step 1. The work-tree copy emits `SCAN_FORUM=shared/forum`. This is the standing one-release-behind cost recorded in `260825-1329_*_every-session-runs-one-release-behind-on-a-bin-helper-the-same-repository-just-added.md`, not a defect in the edit.
- Plan step 11 was not marked `[DONE]` in the plan file: the dispatch bounded this task to `skills/archive/SKILL.md` and the one issue record, and siblings were editing the tree concurrently. The marking is owed to whoever holds the plan.
