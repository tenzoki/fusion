# Analysis: growth-bound raise for 13.6.0

**Date:** 2026-11-20 11:08
**Type:** Feasibility
**Status:** Complete
**Requested by:** orchestrator (plan `261119-1248-plan-campaign-peers-follow-the-steering-session-and-report-back.md`, step 2)

## Question

Do the planner's growth ceilings for 13.6.0 fit? The ceilings cover the agents, skills and hook-test surfaces. Each must sit under the worst single day recorded for its surface in `surface-growth-bound.test.ts` `## Where each head-room comes from`. If one does not, the figure goes to the user before steps 6, 7 or 11 write a raise.

## Scope

- Tree: `/System/Volumes/Data/Projects/productive/F04-FUSION/fusion`. HEAD `00804067d4a8260fc3501f43741a3cd84615f103` (2026-11-20 10:59:20 +0100), branch `main`. After `git fetch`, `git status -sb` reads `## main...origin/main`: even with the remote. Two workbench files are modified in the work tree. Neither belongs to a measured surface: `git status --porcelain -- agents skills hooks` is empty.
- `git diff --stat 9d400cc3 HEAD -- agents skills hooks/lib/__tests__` is empty. The planner measured at `9d400cc3`, and no surface file has changed since.
- Instrument: `growth()` in `hooks/lib/__tests__/helpers/growth-bound.ts`. The dispatch named `hooks/lib/helpers/growth-bound.ts`, which does not exist. The helper's header says it must not move into `hooks/lib/`.
- Baselines and head-room: `AGENT_BASELINE`, `SKILL_BASELINE`, `TEST_LINE_BASELINE`, `AGENT_HEAD_ROOM`, `SKILL_HEAD_ROOM` and `TEST_LINE_HEAD_ROOM` in `hooks/lib/__tests__/surface-growth-bound.test.ts`.

## Method

A scratch script, `/Users/kai/.fusion-tmp/114caf11/growth-measure/measure.mts`, is not committed. It reads the three baseline maps and the three head-room constants out of the test source when it runs, so nothing was copied by hand. It imports `growth()` from the helper. It reads the files exactly as the test's `SURFACES` readers do: bytes of `agents/*.md`, bytes of `skills/*/SKILL.md`, and newline counts of every `.ts` under `hooks/lib/__tests__/` at any depth.

Command:

```
cd hooks && npx tsx /Users/kai/.fusion-tmp/114caf11/growth-measure/measure.mts /System/Volumes/Data/Projects/productive/F04-FUSION/fusion
```

Cross-check: `cd hooks && npx vitest run lib/__tests__/surface-growth-bound.test.ts` passed 12 of 12, so the bound's own run agrees that no surface is over.

The worst days were re-derived with the method the test header states, not read off its comment. The surfaces were sized from the tree with `git ls-tree -r -l` (bytes) and `git cat-file blob | wc -l` (lines), at the last commit of each of the 40 commit-days in `git log 66e4a698`. That history has 340 commits and 0 merges. The largest day-over-day rise was then taken. Scratch output: `/Users/kai/.fusion-tmp/114caf11/growth-measure/sizes.txt` and `sizes2.txt`.

## Findings

### Measured at `00804067`

| Surface | Total | Floor | Growth | Head-room | Budget | Room |
|---|---|---|---|---|---|---|
| agents (bytes) | 326 693 | 310 567 | 16 126 | 18 000 | 328 567 | **1 874** |
| skills (bytes) | 245 969 | 188 768 | 57 201 | 57 217 | 245 985 | **16** |
| hook tests (lines) | 28 140 | 24 037 | 4 103 | 4 835 | 28 872 | **732** |

All three match the planner's `## Current State` figures at `9d400cc3` exactly. That follows from the empty diff above.

### Worst single day, re-derived

| Surface | Recorded in the test header | Re-derived from git | Match |
|---|---|---|---|
| agents | +50 725 bytes (2026-05-16) | +50 725 (2026-05-16) | yes |
| skills | +38 025 bytes (2026-05-19) | +38 025 (2026-05-19) | yes |
| hook tests | +5 247 lines (2026-08-04) | +5 247 (2026-08-04) | yes |

### Ceiling against worst day

The ceiling is the growth this release may add, from the planner's estimates for steps 6, 7, 8 and 11. The raise is the ceiling minus the room measured above.

| Surface | Planner's estimate | Ceiling | Room now | Raise at most | Worst day | Ceiling / worst day | Verdict |
|---|---|---|---|---|---|---|---|
| agents | ~4 300 (step 6: Setup ~600, 5a ~1 200, Step 5 ~700, routing and wait ~1 800) | 6 000 | 1 874 | 4 126 | 50 725 | 11.8 % | **under; raise allowed up to 4 126** |
| skills | ~4 800 (step 7: answer ~2 000, watch ~2 000, rows ~800); step 11 help paragraph net ~0 | 7 500 | 16 | 7 484 | 38 025 | 19.7 % | **under; raise allowed up to 7 484** |
| hook tests | ~500 (steps 3–5) | 700 | 732 | 0 | 5 247 | 13.3 % | **under; no raise; 32 lines spare** |

**No ceiling exceeds its worst day.** The largest share is skills at 19.7 %. That leaves a factor of about 5 before the stop condition would fire.

## Implications

- The step-2 stop condition does not fire. Steps 6, 7 and 11 may write raises without a further user ruling, each bounded by the ceiling in the table.
- Skills has 16 bytes of room. Any skill text written before step 7, including a header edit made while step 3 renders, goes red at once. Step 7's raise has to cover all skill growth up to then, not just the campaign skill.
- Step 11's help paragraph is planned as a balanced add-and-drop. It has no room of its own, because step 7's raise is sized to step 7's text. The plan already says a red there is fixed by a cut, not a raise. The 16 bytes confirm that rule matters.
- The hook-test ceiling leaves 32 lines of margin over the ~500-line estimate plus the 200-line allowance. If steps 3–5 exceed 732 lines in total, that becomes a raise the plan did not budget, and it goes to the user (`## Where this work stops`, bullet 3).
- These ceilings stay well inside each surface's worst day, but they are spent on top of growth already charged. Agents is at 16 126 of 18 000 (90 %) and skills at 57 201 of 57 217 (99.97 %). The worst-day test measures one release's rate. It does not measure the accumulated drift, which `README-hooks.md` `### Growth bounds on the shipped text` tracks.

## Recommendations

- Orchestrator: proceed to step 3 once step 1's verdict allows. Step 2 imposes no stop.
- code-implementer, steps 6 and 7: raise `AGENT_HEAD_ROOM` and `SKILL_HEAD_ROOM` by the measured remainder at that HEAD, re-taken with the bound test, not with this report's figures. The raises are capped at 4 126 and 7 484. Leave `TEST_LINE_HEAD_ROOM` alone unless steps 3–5 overrun 732 lines.
- The plan and the dispatch name `hooks/lib/helpers/growth-bound.ts`. The real path is `hooks/lib/__tests__/helpers/growth-bound.ts`. This needs no fix in shipped text, but later dispatches should use the real path.

## Filed Issues

None. Nothing is defective. The wrong helper path appears only in this plan and its dispatch.

## Sources

- `hooks/lib/__tests__/helpers/growth-bound.ts` (`growth()`)
- `hooks/lib/__tests__/surface-growth-bound.test.ts` (baseline maps, head-room constants, `SURFACES` readers, `## Where each head-room comes from`)
- `261119-1248-plan-campaign-peers-follow-the-steering-session-and-report-back.md` (`## Current State`; step 2; steps 6, 7, 11; `## Where this work stops`)
- git: `00804067`, `9d400cc3`, `66e4a698` history (40 commit-days)

## Open Questions

None.
