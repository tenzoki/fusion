# Coder — the four-class partition is written into rules/workbench-tracking.md

**Date:** 2026-08-23 08:35
**Agent:** coder
**Circle:** `circles/260823-0023-settle-what-travels-between-checkouts`
**Task:** plan step 1 of `circles/260823-0023-settle-what-travels-between-checkouts/planning/260823-0800_*_c2-what-travels-between-checkouts-is-settled.md`
**Status:** Complete

## What was implemented

`rules/workbench-tracking.md` was rewritten. The two-bullet record-versus-live-state split is gone,
replaced by the four-class partition transcribed from
`shared/planning/260822-1136_*_spec-fusion-becomes-a-multi-user-tool.md` `## The state partition`
(R1 travels with one writer per file, R2 travels and is appended by many, R3 travels and is written
once or per item, L stays in the checkout). The table ranges over every entry of the layout tree in
`rules/fusion-workbench-conventions.md` `## fusion-workbench Layout` plus the two frozen stores, and
the paragraph above it states the tiling property and the obligation on a new root-anchored surface.

`portfolio.md` moved to class L, and the clause calling it authored text rather than machine-refreshed
was deleted. The `.guard-state/` per-file split and the archive-roll paragraph were kept, restated
against the class names.

Three statements the file becomes the authoring home for, each appearing once: that a multi-checkout
arrangement requires the project to track its workbench and why; that
`fusion-workbench/orchestrator-events.jsonl` carries a union merge driver, with the rule line, why
`git check-attr merge -- <path>` is the question a mechanism asks about it rather than a text search
of `.gitattributes`, and what `/fusion:setup` does in each of the three branches; and that
`.fusion-setup` is written when it is missing or when the plugin version changes rather than on every
run.

`shared/issues/260816-1049_*_the-split-calls-portfolio-md-not-machine-refreshed-and-the-playmaker-regenerates-it-in-full.md`
carries a `Resolved:` note and is renamed `_o_` -> `_c_`. The note is written against the Circle's
answer 6 and names the record's own fix direction (keep `portfolio.md` in the records group under a
corrected ground) as superseded, so the closure does not read as agreement.

## Two files outside the step's declared list, and why

The dispatch bounded the step to two files. Two more were required to reach the acceptance criterion
"`npm test` is green", both mechanical consequences of the rule edit rather than content decisions:

- `hooks/lib/__tests__/reference-resolution-lint.test.ts` — the reference-resolution pin moved
  (paths 1284 -> 1286, anchors 175 -> 176, records 116 -> 118). Every token is accounted for in the
  re-approval block written above `const BASELINE`, per that gate's own stated protocol and decision
  `260822-1229_*_where-does-the-reference-resolution-pins-re-approval-attribution-log-live.md`.
- `hooks/lib/__tests__/fixtures/surface-growth.golden` — regenerated with `UPDATE_SURFACE_GOLDEN=1`
  because the re-approval block added 8 lines to a bounded surface. No growth baseline moved; the
  hook-test surface went 20 088 -> 20 096 lines against a 2 500-line head-room, leaving 279.

## Verification

`cd hooks && npm test` — exit 0, 41 files / 724 tests passed. Run twice: once after the rule rewrite
and the pin re-approval, once after an em-dash reduction pass.

`bin/fusion-prose-metric rules/workbench-tracking.md` — 0 em-dashes over 1 955 prose words, against
13.3 per 1000 at HEAD `3ee8eaf`. Reported, not gated.

## Out of scope, named rather than silently left

Two further surfaces still classify `portfolio.md` as an authored record: `hooks/lib/staging-drift.ts`
`ROOT_RECORDS` and the class table in `agents/orchestrator.md`. Both are filed as
`circles/260823-0023-settle-what-travels-between-checkouts/issues/260823-0800_*_two-further-surfaces-classify-portfolio-md-as-an-authored-record.md`
and are outside this step's file bound.
