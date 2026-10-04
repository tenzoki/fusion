# How does FJ03d's rewrite of the rules and the prompts meet the dispatch-path bound at zero head-room?

---
**Domain:** code
**Filed by:** implementation-planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260929-1810_*_does-the-2026-09-27-ruling-on-the-growth-bound-reach-the-hook-tests-and-shipped-text-fj03-changes.md, 260927-2319_*_does-the-growth-bound-on-shipped-text-yield-to-the-dual-host-prompt-set.md, 261004-2212_*_plan-fj03d-rules-prompts-and-live-predicates-switched-with-this-workbench-in-one-window.md

---

## Question

The answered record on the growth bound for FJ03 left one surface open in its constraints: "how FJ03d's rule rewrite meets a bound at zero head-room is decided when FJ03d is planned, at measured figures." FJ03d rewrites the state grammar in `rules/fusion-workbench-conventions.md` (67 953 bytes, emitted to all eleven dispatch paths) and the control-state passages of the eleven agent prompts. Every byte of either is charged to a dispatch path in `hooks/lib/__tests__/rules-emission-golden.test.ts`, where `DISPATCH_HEAD_ROOM` is 0.

Margins at `9c74070b`, by inference: summing the files the work tree's `bin/fusion-rules` emits plus the prompt plus `CLAUDE.md`, against `hooks/lib/__tests__/fixtures/dispatch-path.baseline`, gives 620 bytes for `requirements-designer` (the tightest), 801 for `implementation-planner`, 959 for `orchestrator`, and at most 1 189 for any path. The test is green there. Its own report is the measurement each step reads; the sum above may count a file differently from the test. The `agents/` surface bound has 4 226 bytes of room, measured as `AGENT_BASELINE` plus 18 000 minus `cat agents/*.md | wc -c` (324 341).

## Options

1. **Cut-only, net non-positive per path at every commit.** Each step that edits a rule file or a prompt keeps every dispatch path at or under its baseline row, finding the bytes in the text it rewrites. The candidates are `## Marker globs` and the two marker tables, which stop describing live state, and the rename and annotation procedures that become one operation each. A step that cannot fit stops and returns the shortfall to the user.
   - Pros: no constant moves; the rewrite replaces grammar rather than adding beside it; the bound keeps meaning what it says.
   - Cons: a step can stop mid-rewrite on a shortfall of a few hundred bytes. The cut may push detail out of always-on rules into conditionally emitted ones.
2. **A one-time dispatch-path head-room raise for the window, the measured remainder only,** logged in `README-hooks.md` `### Growth bounds on the shipped text` with figures before and after, no baseline moved, read back afterwards.
   - Pros: the rewrite never stops on bytes.
   - Cons: the first raise of a bound that has stood at zero by construction since its arming. Every path pays for it on every dispatch.
3. **Re-arm the dispatch-path baseline at the window commit.**
   - Cons: an arming taken at a rewrite absolves the rewrite. `hooks/lib/__tests__/helpers/growth-bound.ts` `## Re-baselining` names no event that fits, so this is not an option the instrument admits.

## Constraints

- No baseline moves outside the events `hooks/lib/__tests__/helpers/growth-bound.ts` `## Re-baselining` names.
- `CLAUDE.md` is charged to all eleven paths at zero head-room; an edit there is net zero bytes or a cut.
- The `agents/`, `skills/` and hook-test surface bounds stay governed by the answered record cited first above: retired text and tests are replaced first, then the measured remainder is raised and logged.

## Recommendation

Option 1. The rewrite turns procedures (rename, annotate, glob) into calls of one helper, which should shrink the always-on text rather than grow it (inference, not yet measured). Option 2 stays available as the user's ruling on a measured shortfall, never as a default.
