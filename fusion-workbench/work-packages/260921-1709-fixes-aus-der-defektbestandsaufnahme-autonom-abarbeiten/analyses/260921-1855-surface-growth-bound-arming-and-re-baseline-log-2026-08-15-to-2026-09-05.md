# Surface growth bound — the arming and re-baseline log, 2026-08-15 to 2026-09-05

Rolled verbatim out of the header of `hooks/lib/__tests__/surface-growth-bound.test.ts` on 2026-09-21 (step 17 of `260921-1726_*_the-33-open-defects-of-the-11-9-1-survey-worked-autonomously-as-one-package.md`), the funding cut for that plan's test-bearing steps: the three dated sections below are the log of the arming (2026-08-15), the cleanup re-baseline (2026-08-17) and the merge re-baseline (2026-09-05), moved because that file is measured by the line by the bound it implements and the sections are history, not derivation; the comment prefixes are stripped and, because the workbench sweep gate refuses a store-prefixed citation, the four citations that carried a `circles/…` store segment (lines 10, 18, 52 and 82 below) are written in the storeless form the sweep itself would have produced; nothing else is changed, so a reader can match the text against `git log` on that file. The precedent is the pin log rolled out of `reference-resolution-lint.test.ts` (decision `260822-1229_*_where-does-the-reference-resolution-pins-re-approval-attribution-log-live.md`, option 2: roll, never drop).

## The arming, 2026-08-15

This is event 2 of `## Re-baselining` in `helpers/growth-bound.ts` — a
measurement that reported starts blocking — and it follows the form the
2026-08-14 arming set, whose governing record is
`260814-0738_*_how-is-the-always-on-growth-bound-armed-when-the-corpus-is-already-over-budget.md`.

NO BYTES AND NO LINES WERE REMOVED BY THE ARMING ITSELF, and one surface grew
BECAUSE of it: this file and `helpers/growth-bound.ts` entered the baseline
below at 699 lines inside the hook-test surface they bound. A bound that
exempted its own instrument would be granting itself the one exemption it
exists to refuse, so the 699 lines are baselined like any others and the next
2 500 are what this surface has left. It is the last step of
Circle `260815-0007-remove-eight-mechanisms-and-cap-growth`, and it is
deliberately last: arming before the removals would have baselined these three
surfaces at their pre-removal size and handed this Circle its own savings back
as head-room, which is the one outcome the Circle record forbids. What the
removals did, measured at the Circle's start (`9a7da8e`) and at this arming:

  agents/*.md         460 292 -> 399 843 bytes   (-60 449; conceptrev and
                                                  investigator prompts deleted)
  skills/*/SKILL.md   294 134 -> 220 439 bytes   (-73 695; five skill bodies)
  hook test lines      25 897 ->  18 799 lines   (-7 098; fusion-plane.test.ts
                                                  and the churn/state-drift suites)

WHAT THIS ARMING ABSOLVES, written as text so it survives the numbers moving.
These surfaces had never been bounded by anything, so the baselines below
absolve every byte and every line they accumulated before today — including
the growth this Circle did not remove. Two parts of it are worth naming
because a later reader will otherwise try to reconcile them against the
removals alone:

  - The 356 test lines the Circle's own inserted step 3b added are INSIDE the
    hook-test baseline: `fusion-commit-lock.test.ts` +236 and
    `monitor-warnings-panel.test.ts` +120, both landed to make the suite safe
    to run concurrently. They were a prerequisite of the removals, not a
    product of them, and the baseline carries them.
  - `agents/orchestrator.md` stands at 139 859 bytes, 35 % of the whole
    `agents/` surface on its own. It grew through this Circle rather than
    shrinking, and the baseline takes it as it is. Nothing here asks for that
    to be cut; the bound asks only that it stop growing at the measured rate.

## The cleanup re-baseline, 2026-08-17 — the hook tests, and them alone

This is event 1 of `## Re-baselining` in `helpers/growth-bound.ts`: a cut was
done, so the surface that was cut is re-baselined onto its post-cut sizes.

THE CUT IS Circle `260816-1741-guard-becomes-observation-only`,
sixteen commits `3d41d4a..5763550`, which stopped fusion's compliance guard
from deciding anything. It removed CHECK 1, CHECK 3, the consecutive-block
counter, the halt, `hooks/clear-halt.ts`, the fusion-repository stand-down,
`isFusionPluginCwd()`, `hooks/lib/escalation.ts`,
`hooks/lib/project-relative.ts`, four of the five exports of
`hooks/lib/paths.ts`, `hooks/config.json` and `hooks/config.example.json`,
and renamed `fusion-guard.json` to `fusion.json`. Four test files went with
their subjects in `1d1d3a3`, and `project-relative.test.ts` in `3c2e1c6`.

ONE OF THE THREE SURFACES WAS CUT, AND IT IS THE ONLY ONE RE-BASELINED. The
plan step that ordered this re-baseline says all three shrink; two of them do
not. Measured off `git` at the commit before the Circle's first (`3d41d4a`)
and at its last (`5763550`):

  hook test lines      20 046 -> 17 821   (-2 225, twice the estimate)
  agents/*.md         405 229 -> 405 031  (-198, 0.05 % of the surface)
  skills/*/SKILL.md   226 897 -> 229 784  (+2 887 — this surface GREW)

`skills/` grew because steps 1 and 8 added to `skills/setup/SKILL.md` — the
legacy-halt deletion offer, then the `fusion.json` seed — and step 11's
rewrites cost more bytes than the guard text they replaced. So `AGENT_BASELINE`
and `SKILL_BASELINE` DO NOT MOVE HERE. Against the 2026-08-15 arming they
stand at +5 188 and +9 345 bytes, inside their own head-room and passing;
copying those totals in would absolve 14 533 bytes of growth on the strength
of a 198-byte cut, and most of it is not even this Circle's — between the
arming (`0609945`) and `3d41d4a`, `agents/` rose 5 386 and `skills/` 6 458.
That is the silent raise `helpers/growth-bound.ts` names, and it is the same
argument that kept `rules-emission-golden.test.ts` out of this step. The gap
between the plan's claim and the measurement is filed as
`260817-1032_*_two-of-the-three-bounded-surfaces-grew-through-this-circle-so-only-the-hook-tests-baseline-moves.md`.

WHAT THIS RE-BASELINE ABSOLVES, written as text so it survives the numbers
moving. `TEST_LINE_BASELINE` drops five entries whose files are gone — 1 263
lines of `clear-halt-concurrent-halt`, `escalation`, `guard-escalation-shape`,
`guard-halt-event` and `project-relative` — and takes the survivors as they
stand. Those survivors net -369 lines against the arming baseline, and inside
that net sit 683 lines this Circle ADDED rather than cut:
`monitor-warnings-panel.test.ts` +182, `reference-resolution-lint.test.ts`
+165, `review-coverage.test.ts` +127, `turn-budget-lint.test.ts` +126,
`review-coverage-mandate.test.ts` +58, `hook-fail-open.test.ts` +14 and
`hooks-wiring.test.ts` +11. One more addition is this step's own: the
section you are reading grew THIS file, and its entry below is taken at the
grown size, on the precedent the 2026-08-15 arming set when the instrument's
699 lines entered the baseline it bounds. Those lines and the 683 above are
what this re-baseline absolves, and nothing else is.

THE SHRINK IS NOT BANKED. The floor falls 18 190 -> 17 875, so the surface's
next 2 500 lines are measured from the lower mark: it has LESS room after this
step than the -369 lying under the old baseline gave it. A cut that handed
itself its own savings back as head-room would be the arming mistake this file
already refused once.

## The merge re-baseline, 2026-09-05 — `skills/` and the hook tests

This is event 3 of `## Re-baselining` in `helpers/growth-bound.ts`, the first
use of that event and the case it was written for: two lines of development
that were each inside the bound at their own head joined, and the sum put two
surfaces over.

THE MERGE IS `420b022b` — `git merge origin/main`, joining this checkout's
line (head `18bb1f93`) to the line that shipped v10.21.0, v10.21.1 and
v10.22.0 from another checkout (head `7f9f2f4d`), from the merge base
`cda72f71`. All four figures are re-measured off `git` at those commits
rather than quoted, and the floors are re-summed at each of them:

  surface           base      this line  the other  merged     budget
  skills/ bytes     239 833   240 410    240 037    240 614    240 439
  hook-test lines    19 876    20 374     20 266     20 766     20 375

BOTH PARENTS WERE INSIDE, which is the condition event 3 turns on and the
thing a later reader is owed the numbers to check. The floors stand unmoved
at all four commits — 220 439 bytes and 17 875 lines, no baselined file added
or deleted on either line — so `skills/` had 29 bytes of head-room left on
this line and 402 on the other, and the hook tests had 1 line and 109. The
merged tree is over by 175 bytes and 391 lines. On `skills/` the merged delta
is exactly the two side deltas (+577 and +204 = +781); on the hook tests it is
+890 against +498 and +390, the two extra lines being the merge's own conflict
resolution in this suite's pin log (`reference-resolution-lint.test.ts`,
996 -> 1 001 / 997 -> 1 004). Nobody wrote 391 lines: two people wrote 498 and
390 against a shared floor that could absorb either one alone.

WHAT THIS RE-BASELINE ABSOLVES, written as text so it survives the numbers
moving. Everything the two lines added between the arming and the merge and
did not cut: on `skills/` the 20 175 bytes now standing above the 2026-08-15
arming baseline, and on the hook tests the 2 891 lines above the 2026-08-17
one — a citation grammar with its checker and its sweep, the identity helpers,
the event query, and a test file for each. None of it was cut here and none of
it is being asked for; what these two surfaces are asked from here is the rate
they were asked for before, measured from the higher mark.

THE MERGED FIGURE IS COPIED IN, NOT THE TREE THIS STEP LEAVES BEHIND. The
lines this step adds to `helpers/growth-bound.ts` and to this file are
measured FROM the new baseline like any other addition and come out of the
surface's next 2 500. That is deliberately not the 2026-08-15 precedent, where
the instrument's own 699 lines entered the baseline it bounds: an arming has no
earlier figure to move to, while event 3 names one, and taking the post-edit
figure would absolve this step's own growth on the strength of somebody else's
merge.

THE OTHER TWO BOUNDED SURFACES DO NOT MOVE. `agents/*.md` measures 411 882
bytes on the merged tree against a budget of 417 843, and the always-on rule
core passes its own bound in `rules-emission-golden.test.ts`. Event 3 reaches
only the surfaces a merge put over; copying a merged figure into a baseline
that is passing is the silent raise, whatever produced the tree.
