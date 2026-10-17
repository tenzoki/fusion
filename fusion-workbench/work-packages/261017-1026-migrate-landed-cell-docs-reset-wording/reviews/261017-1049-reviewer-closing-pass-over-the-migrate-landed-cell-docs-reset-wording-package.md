# Closing review: the landed-cell reset wording in the migrate docs (13.1.9, before the tag)

**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Reviewed-range:** `0dbce04b..f95c0b28`
**Not-opened:** none
**Domain:** code
**Work-item:** 261017-1026-migrate-landed-cell-docs-reset-wording
**Cross-references:** `261017-1027-plan-migrate-landed-cell-docs-reset-wording.md`, `261017-0849-migrate-landed-cell-docs-in-the-helper-header-and-readme-hooks-still-presuppose-a-git-reset.md`, `261017-0849-reviewer-closing-pass-over-the-help-13-1-7-credit-and-idlefence-comment-package.md`, `261017-1049-migrate-landed-cell-docs-drop-the-stale-condition-so-an-interrupted-rollback-meets-their-premise.md`

## Summary

Verdict: **accept**. Nothing blocks the tag. Every stop clause the plan names that can hold before the tag holds, the issue's acceptance is met, no code line moved, and all five release surfaces read 13.1.9. One Low finding: the new wording drops the stale-record condition the old wording carried implicitly, so an interrupted rollback (cell A) meets the stated premise and is not named.

## Totals

Critical 0, High 0, Medium 0, Low 1.

## What was checked

All probes ran in a scratch clone at `f95c0b28` (absolute `cd`, `pwd` checked). No whole-tree git command ran in the live repository. The marketplace clone was read with a path-limited `git diff` only.

**No code line moved.** `git diff 0dbce04b..f95c0b28 -- bin/fusion-migrate install.sh` has no changed line that does not begin with `#`. `git diff --stat` over `hooks/ codec/ bin/ agents/ rules/ skills/ docs/` names only `bin/fusion-migrate`, the surface golden and `skills/help/SKILL.md`. `hooks/migrate.ts`, `hooks/dist/` and `migrate.test.ts` are not in the range.

**The issue's acceptance.** `grep -c "before the reset"` prints 0 for `bin/fusion-migrate` and `README-hooks.md`. Each text names a reset only inside "(a git reset is one way there)". `README-hooks.md` changes in the `migrate.ts` row alone. The quiet-cell sentence before each clause ("Over a tree a git reset made legacy again", "left over a tree a git reset made legacy again") is byte-identical. Every backticked token in both clauses (`status`, `.json-state/maintenance.json`, `record=stale`, `journal/`) is unchanged.

**The wording against `landedFence`/`ownFence`.** `ownFence` holds on `i.state === "legacy"`, this record's `rollback.begin_id` as the fence, with `landed` the stored rollback chunks; `landedFence` adds `landed.length > 0` and no intent standing. No reset is read. The new clause claims chunks landed and a legacy tree, and names a reset as one way there. That much matches. It omits the `stale` gate every caller puts in front of `landedFence`: see the finding.

**Help paragraph.** "Coming from 13.1.8 or earlier", "13.1.2 to 13.1.9 need no migration", "13.1.2 to 13.1.7 each change only `/fusion:migrate`" unchanged, and "13.1.9 changes nothing that runs; it corrects two descriptions of an undo." placed before the 13.1.8 sentence. True against the range: outside the workbench the diff is comment lines, two README lines, version strings, the help paragraph and the golden. The other two paragraphs are untouched, per `README-agents.md` `## Releasing` step 0.

**Tests.** `npm test` in `hooks/`: one red file, `workbench-citation-lint`, with exactly the two pre-existing findings in the two 261010-1045 issue files and no third. `committed-dist` was red in the clone for want of the gitignored lock file; with the live repo's `hooks/package-lock.json` copied in, its 4 tests pass. Totals: 1179 passed, 14 skipped. `reference-resolution-lint` passes with `BASELINE` unedited. The surface golden reads `help/SKILL.md 16447`, total 225113, inside the bound.

**Release surfaces** (`README-agents.md` `## Releasing`). `plugin.json` `version`, the `install.sh` header pin, the `README.md` pin and the marketplace clone's fusion entry all read 13.1.9. The marketplace diff is that one line. `plugin.json` `description` and the marketplace `description` compare equal. `bin/fusion-review-coverage --since v13.1.8` ends `carried=none`. Validate and smoke run were not repeated here; the release commit message states both passed.

## Findings

### Low: the landed clause drops the stale condition (`bin/fusion-migrate` header, `README-hooks.md` `migrate.ts` row)

New text in the header: "Where rollback chunks of it landed and the tree then reads as legacy Markdown (a git reset is one way there), it names them …". The README row reads the same.

Every caller of `landedFence` in `hooks/migrate.ts` gates it on `stale`: `endLeftFence` (`const reset = shows !== null ? landedFence(wb, s, i) : null;`), `preconditions`, `current` and `setAside`. `stale` returns null while a rollback is in flight and the plan index holds. So cell A, a rollback cut after a chunk and before chunk 0, is legacy, own fence, chunks landed, and current. `migrate.test.ts` "cell A: a rollback cut after its first chunk over a legacy tree is current, --end-fence leaves its fence" shows `record=current` and `--end-fence` exit 5 with the fence kept. By code reading (inference; the test asserts no stderr) the refusal there is the generic one and names no chunk, against what both texts now say.

The old "before the reset" bound the clause to the reset tree of the preceding sentence and so carried staleness. The plan's `**Decidability:**` line read the cell off `landedFence` alone. No user harm follows: the named hand deletion still requires `record=stale`. Scope: the two documentation mirrors; `docs/upgrading-to-v13.md` `**Undo.**` is scoped by its paragraph's opening on `record=stale` and is correct.

Fix direction: name the stale record in both clauses. Filed as `261017-1049-migrate-landed-cell-docs-drop-the-stale-condition-so-an-interrupted-rollback-meets-their-premise.md`.

## Cross-cutting observations

13.1.6, 13.1.7, 13.1.8 and 13.1.9 each touched a description of the landed cell, and this finding asks for another. Each pass has fixed one mirror against one function. The cell is defined by a conjunction spread over two layers (`landedFence`'s conditions plus each caller's `stale` gate), and every text that paraphrases it reads only one layer. A wording fix that quotes `landedThenReset`'s doc comment ("the chunks landed, the fence, the legacy tree and `stale`'s finding") would cover all of it.

## Recommended sequencing

Tag `v13.1.9` as planned. The Low issue can ride the next migrate-touching release; it needs no patch of its own.
