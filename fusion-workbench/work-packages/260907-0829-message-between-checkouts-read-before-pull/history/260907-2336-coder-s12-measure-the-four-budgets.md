# S12: the four bounded surfaces measured, both goldens regenerated, the pin re-approved

**Status:** Complete
**Filed by:** coder, Kai Stalmann <ks@qantr.com>

**Task:** step 12 of `260907-1942_*_message-between-checkouts-read-before-pull.md` — measure every bounded surface with its own collector, regenerate the two goldens by their failing-on-purpose runs, re-approve the reference-resolution pin against an attribution that must sum, and run the suite.

## What was measured, and against what the plan recorded

| Surface | Recorded head-room at `abcaa823` | Measured now | Verdict |
|---|---|---|---|
| `skills/*/SKILL.md` bytes | 13 131 | 259 060 of a 260 614 budget, 1 554 free | agrees |
| always-on rule core bytes | 9 737 | 73 317 of a 77 498 budget, 4 181 free | **the recorded figure is wrong** |
| hook-test lines | 1 518 | 22 014 of a 23 266 budget, 1 252 free | agrees |
| `agents/*.md` bytes | 4 618 | 413 225 of a 417 843 budget, 4 618 free | agrees, untouched |

Each figure comes from the bound's own reader: the two golden regenerations for the three surfaces `surface-growth-bound.test.ts` measures, and for the rule core the emission golden plus `RULE_BASELINE`, summed over the universal core the suite computes rather than over a written-down list.

**Two of the three spend claims are exact and the third is short by one line.** Skills moved 247 483 to 259 060, and the 11 577 is exactly the claimed 8 766 for the new reading skill, 614 for the archive body and 2 197 for the cleanup body. The conventions file moved 58 445 to 58 762, exactly the claimed 317. The hook tests moved 21 748 to 22 014, which is 266 against a claimed 265: the missing line is step 3's one-line addition to the path-literal gate's folder list, which the dispatch's spend list does not name.

**The always-on head-room the plan recorded is not a figure any collector produces.** It summed the five files `RULE_BASELINE` still labels the universal core, while the hard bound measures the intersection of what every agent actually loads, and two of those five left the always-on floor at the two gates of 2026-08-27. Measured with the bound's own reader, the core stood at 73 000 with 4 498 free at `abcaa823`, not 88 836 with 9 737: the margin was overstated by 5 239 bytes. Nothing was at risk — the bound passes at every point in this Circle — but the plan's Current State claimed more than twice the room it had.

## Both goldens

Regenerated with the command each header carries. Each run failed on purpose, and each was re-run without its flag and read green. `surface-growth.golden` moved on the two skill bodies, the new skill body, the new helper test, the resolver test and the one-line gate addition. `rules-emission.golden` moved on one file's size and the total in every agent block, and on nothing else.

## The pin

`reference-resolution-lint.test.ts` reads 1 686 paths and 233 anchors against a committed 1 646 and 227, with the bare-stamp count unmoved. The accumulated attribution from steps 4, 5, 8, 9, 10 and 11 sums to exactly +40 and +6, so nothing is owed to the roster repair or to this Circle's workbench records and no share overlaps another. The baseline was moved to the measured figures with the re-approval entry written in place on the same line, which keeps the file's own line count where the golden already records it.

## The one red test, and its repair on the second dispatch

The step's first run left the suite failing one test of 924, on nothing it had edited. `citation-sweep.test.ts` reported nine record citations across eight workbench records that spell the state marker where the wildcard is mandated. Six were this Circle's own coder history logs from steps 4 through 9; two predated the Circle, and one of those stood unchanged at `abcaa823`, so the gate was already red at the commit the plan measured against. Filed as `260907-2336_*_nine-record-citations-spell-the-marker-letter-and-the-sweep-gate-is-red.md`, with no repair attempted, because the files were outside the set that dispatch was allowed to touch.

A second dispatch widened the authorised set to those eight files and repaired all nine by hand. Each was tested against `rules/circle-records.md` `### Citation form in the portfolio` first, and all nine came back pointers rather than statements, so all nine were starred and none was reworded or fenced. The one that needed the test asked out loud was the playmaker log's `` `<entry>` renamed `_o_` → `_p_` ``: the statement lives in the arrow and the arrow is untouched, so starring the path token cost the line nothing and repaired a pointer that was already dangling. Two of the nine sit outside this Circle's origin and were repaired anyway — the gate recomputes its corpus from the tree and carries no baseline, so either token left standing would have reddened `npm test` for every checkout. Both are named in the issue's `Resolved:` note, which also records that `--write` was never run: the sweep refuses a tree with pending changes, and this tree has them.

## Verification

`cd hooks && npm test` — exit 1 (923 passed, 1 failed) on the first dispatch; exit 0 (924 passed of 924, 53 files) after the nine repairs. `./bin/fusion-citation-sweep --dry-run` reports `files=0 rewrites=0 bare-record=0`.

**Three of the eight files in `hooks/lib/__tests__/` that spawn scratch git projects fail nondeterministically under load, and it is not this Circle's doing.** Five full-suite runs were made across the repair: green, green, then 5 failed, then 6 failed, then green. The tree did not change between the 5-failure run and the 6-failure run, and the failing sets were only partly the same, which is what rules out a regression: a deterministic fault cannot pick a different five tests on identical inputs. The affected files are `guard-state-shape.test.ts`, `review-coverage.test.ts` and `staging-drift.test.ts`; `review-coverage.test.ts` was then run alone three times and passed 22 of 22 each time, so the condition needs vitest's parallelism to reproduce. System load average was above 6 across both red runs. One failure names the mechanism rather than just the symptom: the tracker emitted the staging-drift sentence where the test expected the review-coverage one, so the two reporters appear to contend for a single output slot and the winner depends on timing. Not filed as its own record — the repair dispatch's authorised file set was the eight records and nothing further — and reported to the user instead.
