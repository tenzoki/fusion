# Does the 2026-09-27 ruling on the growth bound reach the hook tests and the shipped text FJ03 changes?

---
**Domain:** code
**Filed by:** implementation-planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260928-1338-json-control-data-and-markdown-artefacts.md, 260929-1810_*_plan-fj03a-the-record-client-the-format-gate-and-scope-and-order-on-json.md, 260927-2319_*_does-the-growth-bound-on-shipped-text-yield-to-the-dual-host-prompt-set.md, 260928-1341_*_does-the-json-codec-live-in-its-own-package-or-under-hooks.md, 260822-1154_*_does-a-cut-only-circle-re-baseline-the-surfaces-it-cuts.md, 260929-1810_*_where-do-the-claude-side-consumers-of-the-codec-live-and-how-do-they-reach-it.md

---

## Question

FJ03 is the first package of this work that changes bounded surfaces. Measured at fusion `b4c8f7ca` from `hooks/lib/__tests__/surface-growth-bound.test.ts` and `hooks/lib/__tests__/fixtures/surface-growth.golden`: `agents/*.md` has 3 806 bytes of room, `skills/*/SKILL.md` 25 559 bytes, the hook tests 6 lines. The per-dispatch-path bound stands at zero head-room; three paths were re-measured and stand 47 bytes (orchestrator), 309 bytes (implementation-planner) and 677 bytes (reviewer) under their rows.

The ruling of 2026-09-27 (the first record cited above, answered) says the growth bound does not stop the dual-host work, yields first by a head-room raise, and that "the concrete measure is decided in the plan for FH03 at measured figures". Its question names the dual-host prompt set and the dispatch text. The decision that gave the codec its own package observed that the ruling "says nothing about the test-line bound". The specification's section 9 (Prior `e3bc25b`) states that budget adjustments follow the existing user decision and need no new release of a byte budget; that sentence is Prior's reading of a fusion ruling and binds nothing here. FJ03a needs an estimated 150 to 250 hook-test lines (a new client test, a fixture helper, the rewritten scope and order tests); FJ03d rewrites about 38 000 bytes of state grammar in `rules/fusion-workbench-conventions.md`, which is charged to all eleven dispatch paths, and about 30 000 bytes in `agents/orchestrator.md`. The estimates are inference from the survey, not measurements.

## Options

1. **The ruling reaches FJ03, surface by surface, by the head-room raise.** Each step that grows a bounded surface measures its net growth, raises that surface's head-room by exactly that figure in the same commit, and logs the raise in `README-hooks.md` with the figure before and after and a reduction date. No baseline moves.
   - Pros: the instrument's own fourth event, used as the ruling names it; every added line stays charged above an unmoved floor; FJ03a can start.
   - Cons: it extends a ruling given on the prompt set to the test-line bound; the hook tests have been raised five times already.
2. **Cuts first, inside each surface.** The room is found where the growth is: the tests of the Markdown head readers are replaced and not kept beside the new ones, and nothing is raised until a measured shortfall remains after that.
   - Pros: the bound keeps its meaning; the rewrite of a reader is mostly a replacement, so the shortfall may be small.
   - Cons: the new client and the fixture helper have no predecessor to replace; a shortfall found mid-step stops the step until somebody rules.
3. **The consumer tests leave the hook suite.** They are written in `codec/`, whose suite no bound measures (option 2 of the consumer-placement record).
   - Pros: no raise and no cut.
   - Cons: it decides an architecture by a budget; the decision that created `codec/` stated that the package was no way around a bound.

## Constraints

- No baseline moves outside the three events `hooks/lib/__tests__/helpers/growth-bound.ts` names; a cut-only change never re-baselines.
- The dispatch-path bound is not raised by this record: FJ03a changes no file on a dispatch path, and how FJ03d's rule rewrite meets a bound at zero head-room is decided when FJ03d is planned, at measured figures.
- A raise is logged where the earlier nine are, `README-hooks.md` `### Growth bounds on the shipped text`.

## Recommendation

Option 2 first, then option 1 for the measured remainder. Each step replaces what it retires and reports its net growth; what remains after the replacement is raised to the line under the 2026-09-27 ruling and logged. That keeps the raise as small as the work allows and keeps the ruling's reach explicit: the user confirms it once, here, for the surfaces FJ03 touches.

---
Answered: Prior `docs/design/fusion-fj03a-prior-plan-response.md` `## B. Replace retired tests, then adjust the measured remainder` at Prior `b2a931b` — option 2 first, then option 1 for the measured remainder: retired tests are replaced, the remaining net growth is raised with before and after figures in `README-hooks.md`, the baseline kept, and no further approval is needed for that measured raise; the user gave the Prior side's acceptance as the answer on 2026-09-29; ruled by user, Kai Stalmann <ks@qantr.com>
