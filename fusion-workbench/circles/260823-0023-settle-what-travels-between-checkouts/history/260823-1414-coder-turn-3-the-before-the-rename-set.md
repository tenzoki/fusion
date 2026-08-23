# Turn 3: the four items that had to land before the `_t_` -> `_c_` rename

**Date:** 2026-08-23 14:14
**Agent:** coder
**Circle:** `260823-0023-settle-what-travels-between-checkouts`
**Status:** Complete

## Task

The Turn 3 review at
`circles/260823-0023-settle-what-travels-between-checkouts/reviews/260823-1410-coderev-c2-turn-3.md`
sequenced its seven findings around the rename. This pass took the two the review put **before** it
and the two cheapest of the four it put after: findings 2, 4, 6 and 7. Findings 1 (stranded records),
3 (the Grounding correction) and 5 (the `pointer-present` identity) were out of scope by the dispatch
and are untouched.

## What was done

**1. The corpus question is filed as an open decision** at
`shared/decisions/260823-1414_*_does-the-workbench-citation-gates-corpus-cover-review-files.md`.
`shared/` per the Origin Rule: the corpus is a framework-wide surface and the question outlives the
Circle. Four options, each with its cost, and no answer. What it adds to the closure note it rescues
is a measurement, because the two options that matter were asserted rather than counted. Over
`circles/*/reviews/` and `shared/reviews/` at HEAD, resolving bare-record tokens outside fenced
blocks: 90 review files, 522 such tokens, **270 dangling in 64 files**. `shared/reviews/` alone
carries 116 in 22 of its 34 files. The reviews of a **non-terminal** Circle carry **zero**, all three
of them this Circle's own, repaired by hand at Turn 3. So admitting every review costs 270 repairs
before the clause could be armed, and admitting only a live Circle's reviews costs none today. The
record states plainly that this scan is not the project's own parser and is a floor rather than the
gate's figure.

**2. The four dangling C1 Circle-record citations were rewritten to `_*_`**, at the file and line the
review named. All four now resolve to exactly one file, `_c_circle.md`. Three further `_t_circle.md`
tokens in the same analysis were left standing on purpose, and the closed record says which and why:
a scratch-Circle mention, a table row whose subject is a class rather than a file, and two lines of
verbatim `git` output inside a fence.

**3. `hooks/lib/__tests__/workbench-citation-lint.test.ts:331-333`** no longer claims the tree carries
no live plan. The claim was dropped rather than corrected: a corrected count is the same defect with a
later expiry date. Three comment lines replaced by three.

**4. `rules/circle-records.md` now authorises the head field's wildcard**, in a **new sibling
section** rather than by widening the existing one, plus the template at `:135` and the worked example
at `:164`. The refusal is the substance here and is recorded in the closed defect: the dispatch's
natural reading was to rename `### Citation form in the portfolio`, and that heading is cited by name
in twenty-six places, four of them in shipped text. Renaming it would have committed this Circle's own
defect class inside its last repair of that class.

## Verification

`cd hooks && npm test`, exit 0. 41 files, 724 tests, unchanged from the pre-change run.

Two gates moved and both were handled by their own documented path rather than by a baseline edit:

- `fixtures/rules-emission.golden` and `fixtures/surface-growth.golden` were **regenerated**, which
  each file's header names as the expected response. Neither `RULE_BASELINE` nor any of the three
  surface baselines was touched.
- `reference-resolution-lint.test.ts` `BASELINE.records` was **re-approved 117 -> 118**, with a
  six-line accounting entry above the constant naming the one token that moved it: the new rules
  section's citation of defect `260823-1408`. `paths` and `anchors` are unmoved. That pin has its own
  re-approval protocol, exercised six times already in this range; it is not one of the four growth
  budgets the dispatch reserved.

## Head-room

| Surface | Budget | Before | After | Moved by this pass |
|---|---|---|---|---|
| always-on rules (hard bound, universal core) | 12 000 B | 3 321 free | 3 321 free | nothing |
| `agents/` | 18 000 B | 14 787 free | 14 787 free | nothing |
| `skills/` | 20 000 B | 202 free | 202 free | nothing |
| hook-test lines | 2 500 | 194 free | **188 free** | +6 (the pin's accounting entry) |

`rules/circle-records.md` went 18 747 -> 20 172 bytes. It is **role-specific**, going to `orchestrator`,
`playmaker` and `shaper`, so it is measured by the report and not by the hard bound, whose core the
pass did not touch. The three role totals are now 121 087 / 120 258 / 115 424 bytes against
`DRIFT_CEILING = 145 144`, leaving the largest 24 057.

Em-dashes: the new decision record carries **0** at 1 318 prose words. `rules/circle-records.md` holds
39 before and after, the addition contributing none; its rate falls 17.8 -> 16.4 per 1000 words on the
added words alone, and it stands over the ceiling either way, as it did before.

## Records closed

Four, each with a `Resolved:` note and `_o_` -> `_c_`, all under
`circles/260823-0023-settle-what-travels-between-checkouts/issues/`: `260823-1402_*`, `260823-1404_*`,
`260823-1407_*`, `260823-1408_*`.

**The renames were checked for what they break**, that being the fault three of the four items descend
from. A tree-wide search for `260823-14NN_<letter>_` outside the wildcard form returns nothing: the
Turn 3 review, the new decision record and the new rules section all cite these four with `_*_`, and
no other file cites them at all.

## Not done, deliberately

No commit. No Grounding prose. Findings 1, 3 and 5 left filed and open.
