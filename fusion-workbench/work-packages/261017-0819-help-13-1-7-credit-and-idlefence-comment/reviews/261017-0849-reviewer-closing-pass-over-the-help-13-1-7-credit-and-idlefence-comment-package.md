# Closing review: the help topic's 13.1.7 credit and the idleFence comment (13.1.8, before the tag)

**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Reviewed-range:** `ddab3bf1..0dbce04b`
**Not-opened:** none
**Domain:** code
**Work-item:** 261017-0819-help-13-1-7-credit-and-idlefence-comment
**Cross-references:** `261017-0821-plan-help-13-1-7-credit-and-idlefence-comment.md`, `261017-0000-help-13-1-7-note-credits-the-release-with-a-proposal-check-13-1-6-already-had.md`, `261017-0000-reviewer-closing-pass-over-the-migrate-landed-fence-wording-package.md`, `261017-0849-migrate-landed-cell-docs-in-the-helper-header-and-readme-hooks-still-presuppose-a-git-reset.md`

## Summary

Verdict: **accept**. Nothing blocks the tag. `hooks/migrate.ts` changes in two comment lines only, the dist is their compile, and the help paragraph is true for 13.1.6, 13.1.7 and 13.1.8 against the code at each tag. One Low finding: two documentation mirrors of the landed-fence cell still presuppose the git reset this package removed from the comment.

## Totals

Critical 0, High 0, Medium 0, Low 1.

## What was checked

All probes ran in a scratch clone at `0dbce04b` (absolute `cd`, `pwd` checked). No whole-tree git command ran in the live repository.

**`hooks/migrate.ts`, comment only.** `git diff ddab3bf1..0dbce04b -- hooks/migrate.ts` is one hunk inside the `idleFence` doc comment: one ` *` line out, two ` *` lines in. No code line moves. `hooks/dist/migrate.js` carries the same two-line change and nothing else. `migrate.test.ts` is not in the range's diff, so it passed unedited.

**The new comment matches the code.** It says a rollback that landed chunks fails the check "whatever brought the tree back to legacy Markdown after them (a git reset is one way)". `idleFence` returns null when `own.landed.length > 0`. `ownFence` requires `i.state === "legacy"` and the record's own `begin_id`. No reset is read. The text contains neither `met a git reset` nor `then met`. The parenthesis with its two backticked basenames is byte-identical.

**Help paragraph against each tag.**
- 13.1.7, "states only what it checked": `git diff v13.1.6..v13.1.7 -- hooks/migrate.ts` drops "nothing was written or lost" from `landedWay`'s `head` and rewrites `landedThenReset` to name what `stale` found, with a reset as "one way here". No guard condition changes. True. The removed clause is gone, which meets the issue's acceptance.
- 13.1.6, "says so … and names how to end it by hand": at `v13.1.6` `landedThenReset` said "then the tree was reset to Markdown", and `landedWay` named the hand deletion. True of what 13.1.6 printed.
- 13.1.8, "changes nothing that runs; it corrects the 13.1.7 note": `git diff v13.1.7..0dbce04b` outside the workbench is the comment, its dist, the help paragraph, the golden and three version strings. True.
- "13.1.2 to 13.1.7 each change only `/fusion:migrate`": each tag pair's diff outside the workbench touches migrate's skill, hook or helper plus docs, tests and release strings, and nothing else that runs. True.
- "13.1.2 to 13.1.8 need no migration": no tag pair in that span touches the setup marker, the store layout or the codec. True.

**Growth bounds.** `wc -c skills/help/SKILL.md` is 16 372 and the skills total 225 038, both equal to the golden. That is +19 bytes, with 2 990 left of the budget the plan computed. No baseline or head-room constant is in the diff.

**Tests.** In the clone, `committed-dist`, `migrate`, `surface-growth-bound` and `reference-resolution-lint` passed, 74 tests in 4 files. The full suite showed one more red test file than the known one, `committed-dist`, before the lockfile was copied in. That is the fresh-clone case open issue `261012-2126-hooks-package-lock-json-is-ignored-and-untracked-so-npm-ci-cannot-run-in-a-clone-and-codec-gitignore-says-otherwise.md` already records. With the lockfile present it is green. The remaining red is the known `workbench-citation-lint` case with exactly its two pre-existing findings. `claude plugin validate .` reports passed with warnings, all on `hooks/hooks.json`, which is outside the range.

**Release surfaces (`README-agents.md` `## Releasing`).** `plugin.json` `version`, the `install.sh` header pin and the `README.md` pin read 13.1.8. `plugin.json`'s `description` is unchanged, and it is byte-equal to the marketplace entry's. The help topic was brought to this release as step 0 asks: a patch with no migration joins its predecessor's paragraph, relabelled "Coming from 13.1.7 or earlier". `docs/upgrading-to-v12.md` is not touched, and nothing it describes changed.

**Plan `## Where this work stops`.**
- `hooks/migrate.ts` differs only inside the `idleFence` comment, without the two banned phrases: holds.
- Dist is the build, `committed-dist` green, same commit (`0dbce04b`): holds.
- Exit codes, conditions, messages unchanged, `migrate.test.ts` unedited: holds.
- The 13.1.7 sentence lacks `cannot verify the file list`: holds.
- The issue carries `Resolved:`, closed `fixed`, no third citation finding: holds.
- Growth bounds green, golden regenerated, no constant edited: holds.
- `reference-resolution-lint` `BASELINE` unedited and passing: holds.
- Help paragraph labels and the 13.1.8 sentence: hold. The sentence is 61 bytes and cites nothing.
- Closing review before the tag: this file.
- `marketplace.json` at 13.1.8 before the push: **not yet**. It reads 13.1.7. That is step 5, still `open` in the plan record, due before the push.
- Tag on pushed `main`, cache pulled: after this review, the dispatcher's.

## Findings

### L1 (Low): two documentation mirrors still describe the landed cell as chunks landed "before the reset"

The previous closing review called the `idleFence` comment "the last place the code describes the cell by its usual cause". It was not the last:

- `bin/fusion-migrate` header, `rollback --end-fence`: "Where rollback chunks landed before the reset, it names them and the hand deletion of that file …".
- `README-hooks.md` `## Files`, the `migrate.ts` row: "… rollback chunks landed before the reset, its refusal names them …".

`landedFence` holds on any legacy tree with this record's rollback chunks stored, a tree made stale by hand included, and its own comment says nothing checks for a reset. `docs/upgrading-to-v13.md` `**Undo.**` was already reworded in 13.1.7 to "the tree then reads as legacy Markdown (a git reset is one way there)". These two mirrors were not.

Scope: documentation only, no runtime effect. Not part of this plan, which named the comment alone. Fix: reword both clauses the way `**Undo.**` reads. Filed as `261017-0849-migrate-landed-cell-docs-in-the-helper-header-and-readme-hooks-still-presuppose-a-git-reset.md`.

## Cross-cutting observations

- The idle cell (no chunk landed) is also described by a reset in the `migrate.ts` header `## Ending a fence over a legacy tree`, in `endLeftFence`'s comment and in the `bin/fusion-migrate` header ("Over a tree a git reset made legacy again"). That is the framing of the ruling `261016-1436-how-is-a-rollback-fence-ended-that-a-git-reset-left-standing-over-a-legacy-tree.md`. `idleFence`'s comment argues that a real rollback cannot reach a legacy tree without landing a chunk, so something outside the helper brought the tree back there. Not filed.
- `README-agents.md` `## Releasing` step 0 asks for the `bin/fusion-review-coverage --since v13.1.7` result in the release commit or the session log. `0dbce04b`'s message does not carry it. Run it after this file lands and state it in the session log before the tag. It is advisory.

## Recommended sequencing

- Release blocker: none. Run step 5 (marketplace 13.1.8) before the push, as planned.
- Cleanup: L1 whenever `bin/fusion-migrate` or `README-hooks.md` is next edited. It needs no code change and no release of its own.
