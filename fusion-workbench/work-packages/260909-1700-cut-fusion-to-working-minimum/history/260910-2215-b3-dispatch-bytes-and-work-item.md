# B3 — the byte counts and the claimed work item ride the `task_start` row

**Date:** 2026-09-09
**Agent:** coder
**Task:** step B3 of `260909-1843_*_implementation-cut-fusion-to-a-working-minimum.md`
**Status:** Blocked — implementation complete and verified; one shipped-surface
growth bound refuses the commit and the choice is not the executor's.

## What landed

`hooks/lib/dispatch-bytes.ts` is new and is the authoring home for the whole
measurement. `hooks/lib/orchestrator-events.ts` calls it on `task_start` and on
no other row kind; `hooks/guard.ts`'s header is rewritten where it claimed the
dispatch path writes no guard state, which stopped being true when the two memo
files landed. `README-hooks.md` gains the `lib/` table row the enumerations gate
holds in set equality with the directory.

- `bytes_prompt`, `bytes_rules`, `bytes_claude_md`, `bytes_total` and, from the
  second row a project writes for an agent, `bytes_delta`.
- The rule count runs `bin/fusion-rules <agent>` and sums what it emits. There is
  no second implementation of the emission list, which is what
  `rules/critical-stance.md` §2 forbids.
- Memoised in `.guard-state/rule-sizes.json` on the agent, the plugin root and the
  newest mtime under the rule directories. The scan covers two candidate plugin
  rule directories, the project's two, `fusion-workbench/stilwerk` and
  `CLAUDE.md` — the last two because the voice profiles are part of the emission
  and the language declarations decide which of them is emitted.
- A helper that is absent or exits non-zero makes `bytes_rules` and `bytes_total`
  absent keys and earns one `guard_advisory`. A file that does not exist is 0,
  because that is what it cost.
- The baseline is per project and per agent, in `.guard-state/byte-baseline.json`.
  The arming row carries no `bytes_delta`.
- `work_item` is the basename a `**Work-item:**` line in the dispatch prompt
  names, absent when it names none. The hook does not scan the backlog store.

## Cost, measured

Ten timed calls of each path against this repository, `hooks/dist` build:

| path | figure |
|---|---|
| cold, memo miss, one subprocess | min 33.0 ms, median 34.6 ms, max 41.7 ms |
| warm, memo hit, no subprocess | min 0.4 ms, median 0.4 ms, max 0.5 ms |

The warm path spawning nothing is asserted by counting a stub runner's calls in
`dispatch-bytes.test.ts`, not by timing and not in prose.

## Why this is blocked

`cd hooks && npm test` is 978 passed, 1 failed, exit 1. The one failure is
`surface-growth-bound.test.ts` holding the hook test suite inside its head-room:
the suite stands 232 lines past it (23 498 now, budget 23 266 = floor 20 766 +
2 500). Two other gates went red on the way and both were answered rather than
worked around — `derivable-enumerations-lint` wanted the new module's row in
`README-hooks.md`, and `reference-resolution-lint` was re-approved from 1 729 to
1 732 paths, the three citations that row carries, annotated on its own line.
`fixtures/surface-growth.golden` was regenerated, which records the growth and
absolves none of it.

The arithmetic, so the next reader does not re-derive it. The surface had **9**
lines of head-room left at HEAD (delta 2 491 against a 2 500 budget) — B1 spent
150 lines and B2 spent about 265. B3 added 241: 226 for its own test file, 13 in
the harness and 2 in `guard-state-shape.test.ts`. So a test file of zero lines
would still leave this step 6 lines over. **The bound cannot be met by writing
leaner tests; it is structural.**

`helpers/growth-bound.ts` names three events at which a baseline moves and this
is none of them, so the executor did not move it. The choice belongs to whoever
holds the plan: cut hook test lines to fund B3 and B4, take the arming event
deliberately, or accept the red until session 4's D3 re-baseline.
