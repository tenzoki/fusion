# coder — C2 step 6: the `/fusion:next` briefing states its provenance

**Date:** 2026-08-23
**Status:** Complete
**Plan:** `260823-0800_*_c2-what-travels-between-checkouts-is-settled.md` step 6

## What was implemented

Step 5 item 3 of `skills/next/SKILL.md` now renders the portfolio's provenance
beside the counts. The item reads the `**Generated:**` value out of the portfolio
header that Step 4 already `cat`s, and it is told in the same clause not to stamp
a time of its own — the rendered time would then be when the briefing ran rather
than when the ranking was made, which is exactly the staleness the value exists to
expose. A second paragraph carries the checkout qualification and cites
`rules/workbench-tracking.md` `## The four classes` for why `portfolio.md` never
travels, rather than restating the reasoning.

Placement follows the plan and `rules/user-facing-output.md` `## Information
architecture`: the provenance qualifies the recommendation, so it sits with the
counts and not above them. Nothing else in the render moved — items 1, 2 and 4 and
the Step 5b relay are untouched.

Language needed no new convention. Step 5's own preamble already states that its
specimen lines are English because the file ships to projects of every language and
are rendered in the project's chat language (`## Tone`); the new specimen sits
inside that list and inherits it.

## Two gate re-approvals outside the named file

Both are machine-recorded counts that my one edit moved, and both are the response
the gates themselves prescribe.

- `hooks/lib/__tests__/fixtures/surface-growth.golden` — regenerated with
  `UPDATE_SURFACE_GOLDEN=1`, per the golden's own header. `next/SKILL.md 25485 →
  26218`, `total 237062 → 237795`. No baseline moved, so the bound still applies.
- `hooks/lib/__tests__/reference-resolution-lint.test.ts` — `BASELINE` re-approved
  from `{ paths: 1291, anchors: 179 }` to `{ paths: 1292, anchors: 180 }`. The two
  new resolutions are the one path `rules/workbench-tracking.md` and the one anchor
  `## The four classes` that the added citation introduces. `records` unchanged.

## Measurement

`skills/` head-room after the edit: **2 644 bytes** (total 237 795, floor 220 439,
budget 240 439). The step spent 733 of the 3 377 available.

## Verification

`cd hooks && npm test` — exit 0, 41 files, 724 tests.
