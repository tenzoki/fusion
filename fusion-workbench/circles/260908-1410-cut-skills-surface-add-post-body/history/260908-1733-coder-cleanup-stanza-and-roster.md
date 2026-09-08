# coder — cleanup's read-and-perform stanza, and the roster obligations

**Status:** Complete
**Date:** 2026-09-08
**Circle:** 260908-1410-cut-skills-surface-add-post-body
**Plan:** `260908-1612_o_cut-the-skills-surface-and-add-the-post-step-body.md`, steps 10 and 11
**Agent:** coder

## What was implemented

### Step 10 — `skills/cleanup/SKILL.md`

`### The message half` is now a read-and-perform stanza in the shape Steps 4, 5 and 6 already use: it reads `$FUSION_SRC/skills/post/SKILL.md` and executes that procedure inline, and states that the body owns the composition contract. What stays behind is only cleanup's own — the draft riding as a second question in the same `AskUserQuestion` call so the walk-away property holds, `--skip claude-md` dropping the message with the step, `--dry-run` putting no draft, and `--only forum` running the half alone on the standalone shape. The "Accepted once" paragraph is unchanged. Nothing restates the twenty-line cap, the two language halves or the filename shape.

The span measured 2 070 bytes before and 978 after, a cut of 1 092 against the plan's estimate of 1 120.

The enumeration at line 11 now names four passes — archive, activity log, `CLAUDE.md`, message — and points at Steps 4 and 5 and both halves of Step 6. Line 57's "the three that replace commands fusion used to expose on their own" and the selector table are untouched, as the step directs.

### Step 11 — the roster surfaces

`CLAUDE.md`, one bullet: a `/fusion:post` token (which `derivable-enumerations-lint` requires), "Three further bodies" became four and names `post` as Step 6's message half, the selector list gained `--only forum`, "Two of those three selectors" became two of four with `forum` and `claude-md` named as the two that are not the body's own name, and the two-way-match sentence follows at four. `post` was not added to the situational list.

`README-agents.md`: one table row in the pattern the lint parses, `` | `/fusion:post` | `skills/post/SKILL.md` | … |``, placed after the `/fusion:curate` row. Line 235's "Three more bodies in the table" became four and names `post` — a site no input to this Circle named and no lint reads.

### The pin

`reference-resolution-lint`'s `BASELINE` moved from `{paths: 1692, anchors: 237}` to `{paths: 1702, anchors: 240}`, re-approved in place with an entry naming what moved it. Attribution was by single-file revert against the full tree, one file at a time: full tree 1702/240, cleanup body reverted 1704/242, `CLAUDE.md` reverted 1702/240, `README-agents.md` reverted 1701/240. So the cleanup body carries −2 paths and −2 anchors, the agents README +1 path, `CLAUDE.md` nothing, summing to the −1 path and −2 anchors observed against the 1703/242 the tree read after step 8.

No growth baseline moved: `SKILL_BASELINE`, `AGENT_BASELINE` and `TEST_LINE_BASELINE` in `hooks/lib/__tests__/surface-growth-bound.test.ts` and `RULE_BASELINE` in `hooks/lib/__tests__/rules-emission-golden.test.ts` are unmodified — `git diff --stat` over both files prints nothing. The lint test file stands at 1 005 lines, unchanged, the entry having been rewritten in place.

## Verification

`cd hooks && npx vitest run lib/__tests__/derivable-enumerations-lint.test.ts lib/__tests__/reference-resolution-lint.test.ts lib/__tests__/path-literal-lint.test.ts lib/__tests__/workbench-citation-lint.test.ts` — exit 0, 93 tests passed across 4 files.

`bin/fusion-prose-metric` on the three edited files reports `over` on each, as it did at HEAD before these edits: cleanup 67 → 68 em-dashes, `CLAUDE.md` 143 → 143, `README-agents.md` 94 → 96. The helper reports and never gates.

`wc -c skills/cleanup/SKILL.md`: 25 027 before, 23 977 after. `wc -c skills/*/SKILL.md` totals 256 421 against the budget of 260 614, 4 193 free.

## Files changed

- `/Users/k1/Projects/productive/fusion-news/skills/cleanup/SKILL.md`
- `/Users/k1/Projects/productive/fusion-news/CLAUDE.md`
- `/Users/k1/Projects/productive/fusion-news/README-agents.md`
- `/Users/k1/Projects/productive/fusion-news/hooks/lib/__tests__/reference-resolution-lint.test.ts`

## Left for the dispatcher

The commit is the dispatcher's, over steps 8, 10 and 11 together. The surface-growth golden is still stale by design and is regenerated once at step 16.
