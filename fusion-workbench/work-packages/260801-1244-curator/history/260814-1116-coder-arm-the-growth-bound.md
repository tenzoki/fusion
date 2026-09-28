# Coder — plan step 5: arm the growth bound, and the stale count that had to go first

**Date:** 2026-08-14 11:16
**Status:** Complete
**Circle:** `260801-1244-curator`
**Plan:** `260814-0845_*_plan-curator.md` step 5
**Issue closed:** `260814-1051_*_the-circle-records-other-thirteen-agents-count-went-stale-when-the-curator-was-added.md`
**Binding decisions:** `260814-0738_*_how-is-the-always-on-growth-bound-armed-when-the-corpus-is-already-over-budget.md` (option 1); `260814-0845_*_are-the-sixteen-agent-claims-corrected-or-derived-away.md` (option 2)
**HEAD at start:** `00f4a0b`
**Agent:** coder

## What was implemented

Two changes in one session, in this order, because the first moves the byte size of an always-on
rule file and therefore the baseline the second sets.

### 1. The stale count in `rules/circle-records.md`

The sentence read "The other **thirteen** agents work inside a Circle without ever transitioning
one". Seventeen agents minus the three named in the sentence before it is fourteen, so the figure
was falsified when `agents/curator.md` landed in this Circle's Turn 1.

It now reads "The other agents work inside a Circle without ever transitioning one". The figure is
removed rather than refreshed, per option 2 of the `260814-0845` decision: a derived count that no
parser asserts is the class that goes stale unnoticed, and this occurrence is unasserted — the
enumeration lint reads digit claims and its own header excludes spelled-out word numbers by name.

Read in context first, as the task asked. The sentence needed nothing beyond the number: "the
other" already means the complement of `orchestrator`, `playmaker` and `shaper`, which the previous
sentence names in full. The paragraph was re-wrapped over five lines so the removal does not leave
a short line. `grep` for `thirteen|fourteen|sixteen|seventeen` over the file returns nothing else.

The file went 11 958 -> 11 949 bytes. `hooks/lib/__tests__/fixtures/rules-emission.golden` was
regenerated: the diff holds exactly the three Circle-key agents at -9 bytes each and no other
movement, which is the whole obligation the fixture's header states.

### 2. The growth bound, armed

All four changes the plan's step 5 specifies, in
`hooks/lib/__tests__/rules-emission-golden.test.ts`.

**One `growth(files)` function.** Returns emitted bytes, the floor summed from `RULE_BASELINE` over
the same files, the delta, the budget, an `over` flag and the per-file breakdown. `floorOf` is now
a call into it, and the report's ad-hoc arithmetic is gone. The hard bound and the report read this
one function over this one baseline table with two disjoint file sets, so they cannot disagree
about a byte, and no byte is counted twice or missed.

**A hard `it(...)` on the universal core alone, and the report narrowed to each role's extras.**
The core is the intersection the file already computed; the extras are what is left. The failure
message names the grown files with byte deltas, names the regeneration command, and says in its own
words that regenerating does not clear the bound — the golden records what the files weigh,
`RULE_BASELINE` records what they may weigh from.

**The arming re-baseline.** The five core entries take the sizes the regenerated golden reported at
this moment, each carrying an inline `// 2026-08-14 arming` comment. The three role-specific entries
are untouched at their 2026-08-05 figures and carry `// 2026-08-05 cut`, so the diff shows exactly
which half moved and why.

| entry | before | after |
|---|---|---|
| `agent-setup.md` | 2 792 | 3 513 |
| `fusion-workbench-conventions.md` | 34 671 | 52 027 |
| `decision-record-examples.md` | 4 191 | 4 291 |
| `user-facing-output.md` | 16 683 | 16 784 |
| `critical-stance.md` | 5 317 | 9 958 |
| `design-diagrams.md` | 5 673 | 5 673 (untouched) |
| `circle-records.md` | 9 302 | 9 302 (untouched) |
| `workbench-stash-and-lock.md` | 9 250 | 9 250 (untouched) |

**The doctrine.** `## Re-baselining after a cleanup` is now `## Re-baselining: the two events at
which the baseline moves` — after a cleanup, or at an arming, with the second stated as having
happened once and citing the `260814-0738` record. The section closes by naming what is still
forbidden: editing the baseline to make a failing bound pass, with no cut and no cut-log entry, is
neither event. The assertion inventory in the header gains the hard bound and narrows the report
entry; a new `WHY THE CORE BLOCKS AND THE EXTRAS REPORT` paragraph says why half the 2026-08-05
answer was taken back and on which line.

The cut log gains a dated entry headed as an arming and not a cut, stating that no byte was removed
and reproducing the arming-moment overshoot as text:

| role | emitted | budget | over by |
|---|---|---|---|
| core only | 86 573 | 75 654 | 10 919 |
| design-diagrams.md | 92 246 | 81 327 | 10 919 |
| circle-records.md | 98 522 | 84 956 | 13 566 |
| circle-records.md + design-diagrams.md | 104 195 | 90 629 | 13 566 |
| circle-records.md + workbench-stash-and-lock.md | 111 474 | 94 206 | 17 268 |

The entry records that the whole overshoot is core growth — 22 919 bytes since 2026-08-05, per file
— that the role-specific growth is *not* absolved because those entries did not move, and that the
spec's C10 table reads 107 bytes lower per role because it was measured at `d7786eb`, before this
Circle's own steps added that much to the conventions file.

**Unit assertions on `growth()`.** Five, on synthetic byte counts against the real baseline map, so
all four behaviours are proved without any rule file being edited: zero growth at baseline, over
once the head-room is spent, never over on a shrink however large, role-specific growth reaching
the report but not the hard bound, and the failure message naming the grown file, its delta, the
regeneration command and the re-baselining section.

`RELEASE_CAP` (105 354) and `DRIFT_CEILING` (145 144) are untouched.

## One edit the plan did not specify

The far-gate paragraph claimed `DRIFT_CEILING` "stands 33 378 bytes above today's worst-off agent".
That figure was 292 bytes wrong on the day it was read and says "today's", so it is a present-tense
claim the file makes falsely. It now reads "weeks of calm-rate growth above the worst-off agent",
which removes the figure instead of refreshing it — the same treatment the `260814-0845` decision
gives every count nothing asserts. Nothing depends on the number.

Three role comments carried derived floor figures that the re-baseline moved, and those were
updated rather than removed, because a floor moves only when `RULE_BASELINE` moves, which is a hand
edit at the same site. The one worth knowing: the orchestrator's role floor now stands **229 bytes**
under `RELEASE_CAP`, down from 23 148, so it is the role that would cross the cap first and one
core-file edit away from the justification duty firing. Its `overRelease` prose is kept, as its own
comment already explained.

## Verification

- `cd hooks && npm test` — exit 0. 1 030 tests, 49 files. No budget report printed for any role
  (`grep -c "RULE-TEXT BUDGET"` over the captured run: 0).
- `claude plugin validate .` — exit 0, "passed with warnings"; the one warning is the pre-existing
  `CLAUDE.md at the plugin root is not loaded as project context`.
- **The bound was falsified live, in both directions, rather than only asserted at unit level.**
  Appending 12 010 bytes to `rules/agent-setup.md` (an always-on file) failed the suite with
  "grown 12 021 bytes past its baseline, which is 21 beyond the 12 000 of head-room", naming
  `agent-setup.md +12 021`. The same append to `rules/design-diagrams.md` (role-specific) left the
  hard bound passing and produced the report instead. Both files were restored and re-measured at
  3 513 and 5 673 bytes; `git status` over `rules/` shows only `circle-records.md` modified.

## What is not done here

The `260814-0738` decision record still carries the answered marker `_a_`. Advancing it to `_i_`
requires the commit hash of this change, which does not exist yet — this task does not commit. The
rename and the `Implemented:` line belong to whoever commits.
