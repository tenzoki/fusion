# The step that spent the always-on rule budget reported "green" without the figure its siblings report

---

Four bounded surfaces are measured in this repository, and this Circle spent budget on two of them.
Every step that touched the hook-test surface reported the remaining head-room as a number — 1 877,
then 1 525, then 1 371, then 1 099, then 768. The step that touched the always-on rule set reported
that the bound was green and stopped there.

The always-on set is the most expensive surface of the four: `CLAUDE.md` describes its floor as
charged to every one of the fifteen agents on every dispatch. The convention line added at plan
step 9 put **+987 bytes** into `rules/fusion-workbench-conventions.md`, which is in the always-on
core.

**Measured 2026-08-20 at HEAD `bbfc912`.** The core stands at 92 367 bytes against a
`RULE_BASELINE` floor of 86 573 and a `GROWTH_BUDGET` of 12 000, so **6 206 bytes remain**. The
regeneration log of the same Circle reported the figure before the spend — 7 193 bytes — so the two
reconcile exactly against the 987, and the practice of stating it existed inside this Circle before
the step that skipped it.

A second thing worth naming beside it. The plan's head-room paragraph states "`rules/` is not one of
the three surfaces `surface-growth-bound.test.ts` measures. Writing there costs no budget." That is
true of the file plan step 4 wrote into — `rules/circle-records.md` is a conditional emission — and
false of the file step 9 wrote into. The plan was right about its own steps; the sentence generalises
one step above what it measured, and step 9's line was not in the plan when it was written.

---

**Severity:** Low — no bound is over and no number was edited. What is missing is the figure that
makes the next author's decision, on the surface where the decision is most expensive.
**Domain:** code
**Filed by:** `coderev`, reviewing `b91c01c..bbfc912`
**Owner:** `coder`
**Affects:** `circles/260819-1645-four-constraints-on-deep-change/history/260820-0742-coder-arm-the-blocking-workbench-citation-gate.md`
`## The convention line` and `## Head-room`;
`circles/260819-1645-four-constraints-on-deep-change/planning/260819-2016_*_four-constraints-on-deep-change.md`
`## Current State`, the head-room paragraph
**Cross-references:** `hooks/lib/__tests__/rules-emission-golden.test.ts` `RULE_BASELINE` and
`GROWTH_BUDGET`; `hooks/lib/__tests__/helpers/growth-bound.ts` `## Re-baselining`

## Fix direction

Add the figure to the step's `## Head-room` section, which already reports the hook-test surface's,
and qualify the plan's sentence to the file it was measured against.

---
**Reconciliation 260820-0830** (reconciler, domain `code`, HEAD `04db0b0`) — **still open;
the reporting gap is what reproduces, not a red bound.** `rules-emission-golden.test.ts` and
`surface-growth-bound.test.ts` were both re-run by this pass and are green (15 and 12 cases). The
always-on set measures **99 720 bytes** at HEAD, by `bin/fusion-rules coder | xargs wc -c` — the one
command that gives the whole floor in this repository, because `coder` draws no conditional rule.
The record's point stands: the step reported green without the head-room figure its siblings report,
and the plan's "writing there costs no budget" was true of step 4's file and false of step 9's.
Marker unchanged.
