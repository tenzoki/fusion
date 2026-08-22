# Planner session — C0, the cut-only Circle

**Status:** Complete
**Agent:** planner, dispatched by the orchestrator at Phase 0b.2
**Date:** 2026-08-22
**HEAD at start:** `370bfc5` (release: fusion v10.5.0)
**Circle:** none active. Everything written here landed in the shared stores.
**Executors offered:** `coder`, `ontocoder`, `analyst`

## What was asked

Plan capability C0 of the approved spec `shared/planning/260822-1136_o_spec-fusion-becomes-a-multi-user-tool.md`, and nothing else. C0 is the cut-only Circle that buys head-room on the plugin's four growth-bounded surfaces so the multi-user rebuild has room to write into. C1 through C4 were out of scope.

## What was measured, before anything was planned

All four bounds were re-measured at HEAD rather than taken from the spec, each summed the way its own test sums it. The figures came back identical to the spec's, so nothing moved between the two measurements.

| Surface | Floor | Budget | Now | Remaining |
|---|---|---|---|---|
| Always-on rule core | 86 573 | 98 573 | 95 064 | 3 509 bytes |
| `agents/*.md` | 399 843 | 417 843 | 416 205 | 1 638 bytes |
| `skills/*/SKILL.md` | 220 439 | 240 439 | 240 409 | 30 bytes |
| Hook test suite | 17 875 | 20 375 | 20 363 | 12 lines |

Four further measurements were taken because the plan's central question is whether the required cut exists at all.

**Where the growth sits.** On `agents/*.md`, `orchestrator.md` holds 10 948 of the surface's 16 362 bytes of growth, and eight of the fifteen prompts have not moved a byte since the arming. On `skills/*/SKILL.md`, `setup/SKILL.md` holds 11 385 of 19 970 and `help/SKILL.md` 4 049. On the hook tests, five files with no baseline entry account for 1 553 of the 2 488 lines and are counted in full.

**How much restated text there is.** Splitting the three markdown surfaces into sentences and keeping those of 70 characters or more, 73 distinct sentences appear in more than one file: 24 685 bytes of `agents/*.md` and 12 022 bytes of `skills/*/SKILL.md` sit in such sentences, against requirements of 10 362 and about 4 300. Exact-match identity is a floor on the duplication, not an estimate of it, and some of it is legitimate — the Setup bootstrap sentences stand in all fifteen prompts because an agent has to be told to run `bin/fusion-rules` before it can read the file that would otherwise carry them.

**How much comment the hook test suite carries.** 7 167 of 20 363 lines, 35 per cent, against 11 544 lines of code. Only ten comment lines are duplicated across files, so the hook test surface has no restatement margin comparable to the other two. It is the surface on which the plan may fall short.

**Two structural findings that changed what the plan may do.** First, a re-baseline is available under the spec's own acceptance criteria and must not be taken: head-room after cutting X bytes with no re-baseline is `1 638 + X` on `agents/`, while a re-baseline gives a flat 18 000 whatever X is, so below a full cut it absolves growth nobody removed. Second, cutting `agents/` or `skills/` moves the count pin in `hooks/lib/__tests__/reference-resolution-lint.test.ts`, and the attribution comment that convention asks for costs lines on the hook test surface, which has 12. The hook tests therefore have to be cut first. `surface()` in that gate does not walk `hooks/lib/__tests__/`, so the hook-test cut itself moves no pin.

## What was produced

**Plan:** `shared/planning/260822-1154_o_plan-c0-cut-only-circle-buys-head-room-on-four-bounded-surfaces.md`. Nine steps and two user gates. Step 1 routes to `analyst` and produces the cut ledger; steps 2 through 9 route to `coder`. No step routes to `ontocoder`, and the plan says why rather than inventing one for symmetry.

The plan's approach is not a new cut policy. `shared/issues/260811-1734_o_reduce-the-surface-so-a-claim-cannot-go-stale-in-several-places-at-once.md` is the standing umbrella record for exactly this work, and three further open records name concrete instances in `skills/`. C0 executes what is already filed.

**Decision records, both open:**

- `shared/decisions/260822-1154_o_does-a-cut-only-circle-re-baseline-the-surfaces-it-cuts.md`. Three options with the arithmetic; the recommendation is that it never re-baselines. The plan proceeds on that answer and is not blocked on the record.
- `shared/decisions/260822-1154_o_does-the-hook-test-line-budget-cover-comment-prose.md`. Raised twice already and answered nowhere. Filed with no recommendation, because every option that changes what the surface counts needs a baseline recomputation C0 is forbidden to make and the user has rejected declaring a third re-baselining moment.

**Defect:** `shared/issues/260822-1154_o_an-open-defect-cites-a-test-file-deleted-eleven-days-ago-and-half-of-it-is-unfixable.md`. `shared/issues/260810-0510` names `hooks/lib/__tests__/queue-ground-lint.test.ts:222-256`, deleted in `dd312eb`. Part 1 of that record is unfixable; part 2 stands. The record also notes a second finding worth measuring: `workbench-citation-lint` did not redden on that dangling path, and establishing why belongs in its own record.

## What was deliberately not done

No agent was dispatched. The cut ledger step 1 describes is the analyst's to run and the planner's to specify.

No cut to `agents/orchestrator.md` beyond restatement is proposed. The dispatch asked for that to be answered in one direction or the other, and the answer is: the 12 000 bytes come from the 24 685 bytes of `agents/*.md` that stand in sentences another shipped file also carries, of which `orchestrator.md` is the largest single holder. A deeper cut is available and large; the arming note in `hooks/lib/__tests__/surface-growth-bound.test.ts` says nothing asks for it, and Gate A is where that would change.

No cut to the always-on rule core is proposed. It has 3 509 bytes, no target was set for it, and it is the one surface charged to every dispatch of every agent.

`cd hooks && npm test` was run after the records were written, to confirm that four new workbench files reddened none of the three gates that recompute their corpus from the tree.
