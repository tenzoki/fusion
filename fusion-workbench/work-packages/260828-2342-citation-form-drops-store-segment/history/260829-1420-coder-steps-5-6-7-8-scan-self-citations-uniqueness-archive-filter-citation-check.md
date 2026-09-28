# coder: plan steps 5, 6, 7 and 8 of `260829-1226_*_citation-form-drops-store-segment.md`

**Filed by:** coder, Kai Stalmann <ks@qantr.com>
**Date:** 2026-08-29
**Status:** Complete
**Commit:** none (the orchestrator commits; these steps land in commit B with steps 2 to 4 and 10)

## What was done

**Step 5, the `$SCAN_*` self-citations.** 19 lines rewritten (the widened grep found 20 at start; `agents/orchestrator.md` had 15, the plan's count was taken before the curator run). Each now reads "fusion's own record `<stamp>_*_<slug>.md`" with the `in`/`under $SCAN_*` clause dropped; the six bare stamps among them (`260827-0745_*_may-the-curators-evidence-pass-be-bounded-by-its-own-previous-run.md`, `260817-1613` twice, `260827-1330_*_does-the-session-ask-for-its-directive-first-and-wait-silently.md`, `260827-1120_*_how-often-does-the-review-pass-run.md`, `260827-1310_*_does-the-coherence-gate-ask-when-its-own-verdict-is-ok.md`, `260810-1535_*_the-orchestrators-commit-procedure-truncates-any-message-containing-an-apostrophe.md`) take their full slug, read off `find` over the workbench, `archive/` included. Files: `agents/orchestrator.md`, `agents/curator.md`, `agents/planner.md`, `skills/archive/SKILL.md` (two lines), `skills/next/SKILL.md`. The lint is one `it` in `reference-resolution-lint.test.ts` (22 lines) walking `surface()`: no non-fenced line carries both a stamp and `$SCAN_`; the failure names file, line and the storeless rewrite. It caught one line the grep did not, `rules/circle-records.md:65`, where a `$SCAN_CIRCLES` mention and a binding-decision citation shared a paragraph without one placing the other; the paragraph is split at "Binding decision:", no word changed. The widened grep returns nothing.

**Step 6, the uniqueness test.** One `describe` at the tail of `workbench-citation-lint.test.ts` (29 lines): every basename matching `^[0-9]{6}-[0-9]{4}(_[a-z]_|-).+\.md$` under the whole workbench, marker normalised to `_*_`, is unique, collisions listed pairwise; a second `it` asserts the walk saw `archive/`. Green at 0 collisions.

**Step 7, the archive filter.** `skills/archive/SKILL.md` filter 3 derives one `grep -E` key from the basename, escaped, with the marker position generalised to `_[a-z*]_`; `-e "$rel"` dropped. `archive-filter-key.test.ts` (40 lines) extracts the `key="$(basename "$f" | sed -E '...')"` assignment from the skill body by regex, runs it through bash on `260811-1534_i_foo.md`, and checks with `grep -E` that the key matches `_*_`, `_c_`, and the store-prefixed spelling, and not `260811-1535_i_foo.md`; a markerless candidate escapes to a literal. The filter line is 72 bytes longer than the one it replaces; paid by the step-5 cuts in the same file (-26) and one shortened sentence after the block (-32). `skills/archive/SKILL.md` ends 14 bytes over HEAD.

**Step 8, `bin/fusion-citation-check`.** `hooks/citation-check.ts` is the entry (corpus: live workbench minus `archive/`, `stashes/`, `.migration-v2-backup/`, plus `CLAUDE.md`, `rules/*.md`, `.claude/rules/*.md`, `docs/**/*.md` at the project root; `KEY=value` block, violation rows, `--undecidable`; exit 0 ran, 1 usage, 2 no workbench). The wrapper mirrors `bin/fusion-staging-drift` (exit 3 on a missing build). `.gitignore` gains `!bin/fusion-citation-check`; `CLAUDE.md` gains the Layout row, `README-hooks.md` the entry-point row. `fusion-citation-check.test.ts` (70 lines) spawns the built entry over a scratch project (a fabricated-name fixture, `foo`, was exempt by the grammar; the fixture uses `alpha`/`beta`) and asserts `files=4`, `store-prefixed=1`, `resolved=2`, `verdict=violations`, the one row, and exit 2 outside a workbench.

## Measurements

- Reference-resolution pin re-approved 1520 -> 1537 (anchors 215 unchanged); shares by single-file revert: wrapper header +7, `CLAUDE.md` row +7, `README-hooks.md` row +3. Removing the wrapper file reads as -9 because the two docs' citations of it then dangle.
- Goldens regenerated; no baseline map edited. `agents/` +353 bytes over HEAD (curator +60, orchestrator +156, planner +90, shaper +47 from step 4). `skills/` 240 346 -> 240 358 (+12 over HEAD; archive +14, migrate -10, next +8). Hook tests +189 lines over HEAD (three new files 40+45+70, workbench lint +29, reference lint +3 with the re-approval comment).
- `bin/fusion-citation-check` on this repository: `files=1704 tokens=17712 judged=10364 resolved=1413 dangling=707 store-prefixed=8227 undecidable=6052 exempt=1313 verdict=violations` before step 10's sweep.

## Verification

`cd hooks && npm run build && npm test` — exit 1. Three red: `workbench-citation-lint` "passes on the whole corpus" and `reference-resolution-lint` "passes on the whole surface" (every finding `store-prefixed`, cleared by step 10's sweep), and `committed-dist` "git ls-files bin/ equals the directory listing", because `bin/fusion-citation-check` is untracked until the orchestrator stages it (the coder runs no `git add`). 791 of 794 green.
