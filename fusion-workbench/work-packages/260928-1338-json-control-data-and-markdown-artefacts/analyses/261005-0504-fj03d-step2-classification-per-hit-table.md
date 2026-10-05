# Analysis: FJ03d step 2, the per-hit classification table

**Date:** 2026-10-05 05:04
**Type:** Impact
**Status:** Complete
**Requested by:** orchestrator
**Cross-references:** 261005-0504-fj03d-step2-classification-at-the-base-commit.md, 261004-2212_*_plan-fj03d-rules-prompts-and-live-predicates-switched-with-this-workbench-in-one-window.md

Sibling of `261005-0504-fj03d-step2-classification-at-the-base-commit.md`, which holds the command, the class definitions, the totals and the findings. This file holds one row per line of the command's output at `84047ad7`, in output order, and nothing else. The hit text is not reproduced, so that no record name inside a quoted line becomes a citation token here; re-run the command to read it.

Patterns column: `H` bold head field, `He` escaped head field, `Hs` quoted head-field key, `M` marker literal, `C` marker class in a glob or regex, `P` progress mark. Step column: the plan step that converts a **convert** hit; `?` means no step of the plan names the file.

Rows: 723.

| # | File | Line | Patterns | Class | Step | Basis | Reason |
|---|---|---|---|---|---|---|---|
| 1 | `README-agents.md` | 34 | H | convert | 9 | marker/head-field | agent and rule roster states markers and head fields as current |
| 2 | `README-agents.md` | 64 | H | other kind |  | homonym | dispatch-parameter roster rows for `**Mode:**` of the policy-curator |
| 3 | `README-agents.md` | 65 | H | other kind |  | homonym | dispatch-parameter roster rows for `**Mode:**` of the policy-curator |
| 4 | `README-agents.md` | 66 | H | other kind |  | homonym | dispatch-parameter roster rows for `**Mode:**` of the policy-curator |
| 5 | `README-agents.md` | 72 | H | other kind |  | history | the v11 removal of the shaper's dispatch rows |
| 6 | `README-agents.md` | 227 | H | convert | 9 | marker/head-field | agent and rule roster states markers and head fields as current |
| 7 | `README-agents.md` | 233 | M | convert | 9 | marker/head-field | agent and rule roster states markers and head fields as current |
| 8 | `README-agents.md` | 254 | H | convert | 9 | marker/head-field | agent and rule roster states markers and head fields as current |
| 9 | `README-agents.md` | 295 | M | convert | 9 | marker/head-field | agent and rule roster states markers and head fields as current |
| 10 | `README-agents.md` | 297 | H | convert | 9 | marker/head-field | agent and rule roster states markers and head fields as current |
| 11 | `README-hooks.md` | 246 | M | convert | 9 | marker-state | roster rows describing marker liveness of plan-size and the citation lint; follows step 8 |
| 12 | `README-hooks.md` | 262 | H | legacy-only |  | legacy-reader | roster rows of `lib/legacy-import.ts` and `lib/legacy-repair.ts` |
| 13 | `README-hooks.md` | 263 | H,M | legacy-only |  | legacy-reader | roster rows of `lib/legacy-import.ts` and `lib/legacy-repair.ts` |
| 14 | `README-hooks.md` | 348 | M | convert | 9 | marker-state | roster rows describing marker liveness of plan-size and the citation lint; follows step 8 |
| 15 | `README-hooks.md` | 509 | M | convert | 9 | marker-state | roster rows describing marker liveness of plan-size and the citation lint; follows step 8 |
| 16 | `README-hooks.md` | 594 | H | other kind |  | history | growth-bound log entries |
| 17 | `README-hooks.md` | 694 | M | other kind |  | history | growth-bound log entries |
| 18 | `README-hooks.md` | 790 | M | other kind |  | history | growth-bound log entries |
| 19 | `README-hooks.md` | 820 | M | other kind |  | history | growth-bound log entries |
| 20 | `README-hooks.md` | 895 | M | convert | 9 | marker-state | roster rows describing marker liveness of plan-size and the citation lint; follows step 8 |
| 21 | `README.md` | 32 | H | legacy-only |  | upgrade-note | `Upgrading from v10.x` paragraphs |
| 22 | `README.md` | 50 | H | legacy-only |  | upgrade-note | `Upgrading from v10.x` paragraphs |
| 23 | `README.md` | 52 | H | legacy-only |  | upgrade-note | `Upgrading from v10.x` paragraphs |
| 24 | `README.md` | 169 | M | convert | 9 | marker/head-field | marker vocabularies and `**Status:**` as current state |
| 25 | `README.md` | 170 | M | convert | 9 | marker/head-field | marker vocabularies and `**Status:**` as current state |
| 26 | `README.md` | 171 | H | convert | 9 | marker/head-field | marker vocabularies and `**Status:**` as current state |
| 27 | `agents/analyst.md` | 18 | M | convert | 6 | marker-scan | Setup scans open decisions by `_o_`/`_a_` glob |
| 28 | `agents/analyst.md` | 139 | M | convert | 6 | marker-name | files a record under a marked name / directly as `_a_` (issue 260929-1810 item 3 on line 140) |
| 29 | `agents/analyst.md` | 140 | M | convert | 6 | marker-name | files a record under a marked name / directly as `_a_` (issue 260929-1810 item 3 on line 140) |
| 30 | `agents/analyst.md` | 155 | M | convert | 6 | marker-name | files a record under a marked name / directly as `_a_` (issue 260929-1810 item 3 on line 140) |
| 31 | `agents/analyst.md` | 165 | H | other kind |  | analysis-head | `**Status:**` of an analysis report or snapshot, a markerless report kind with no control file |
| 32 | `agents/analyst.md` | 182 | M | convert | 6 | marker-state | snapshot table reads a decision's state from its marker |
| 33 | `agents/analyst.md` | 232 | H | other kind |  | analysis-head | `**Status:**` of an analysis report or snapshot, a markerless report kind with no control file |
| 34 | `agents/analyst.md` | 269 | M | convert | 6 | marker-name | files a record under a marked name / directly as `_a_` (issue 260929-1810 item 3 on line 140) |
| 35 | `agents/code-implementer.md` | 44 | P | convert | 6 | marker-rename+progress | plan step `[DONE]`, issue and decision renames |
| 36 | `agents/code-implementer.md` | 45 | M | convert | 6 | marker-rename+progress | plan step `[DONE]`, issue and decision renames |
| 37 | `agents/code-implementer.md` | 46 | M | convert | 6 | marker-rename+progress | plan step `[DONE]`, issue and decision renames |
| 38 | `agents/consultant.md` | 103 | H | other kind |  | analysis-head | `**Status:**` of a consultation report |
| 39 | `agents/data-implementer.md` | 59 | M | convert | 6 | marker-rename | decision `_a_` -> `_i_` rename |
| 40 | `agents/implementation-planner.md` | 55 | M | convert | 6 | marker-scan/name | reads decisions by marker; files plan and decision under marked names |
| 41 | `agents/implementation-planner.md` | 57 | M | convert | 6 | marker-scan/name | reads decisions by marker; files plan and decision under marked names |
| 42 | `agents/implementation-planner.md` | 58 | M | convert | 6 | marker-scan/name | reads decisions by marker; files plan and decision under marked names |
| 43 | `agents/implementation-planner.md` | 59 | M | convert | 6 | marker-scan/name | reads decisions by marker; files plan and decision under marked names |
| 44 | `agents/implementation-planner.md` | 61 | M | convert | 6 | marker-scan/name | reads decisions by marker; files plan and decision under marked names |
| 45 | `agents/implementation-planner.md` | 88 | M | convert | 6 | marker-scan/name | reads decisions by marker; files plan and decision under marked names |
| 46 | `agents/implementation-planner.md` | 98 | H | convert | 6 | head-field | plan template writes `**Status:**`, which the importer strips and the plan's control record holds |
| 47 | `agents/orchestrator.md` | 86 | M | convert | 5 | marker/head/progress | orchestrator procedure on markers, head fields or step marks |
| 48 | `agents/orchestrator.md` | 87 | M,P | convert | 5 | marker/head/progress | orchestrator procedure on markers, head fields or step marks |
| 49 | `agents/orchestrator.md` | 88 | M | convert | 5 | marker/head/progress | orchestrator procedure on markers, head fields or step marks |
| 50 | `agents/orchestrator.md` | 90 | M | convert | 5 | marker/head/progress | orchestrator procedure on markers, head fields or step marks |
| 51 | `agents/orchestrator.md` | 134 | H | convert | 5 | marker/head/progress | orchestrator procedure on markers, head fields or step marks |
| 52 | `agents/orchestrator.md` | 138 | He | convert | 5 | marker/head/progress | orchestrator procedure on markers, head fields or step marks |
| 53 | `agents/orchestrator.md` | 143 | H | convert | 5 | marker/head/progress | orchestrator procedure on markers, head fields or step marks |
| 54 | `agents/orchestrator.md` | 147 | H | convert | 5 | marker/head/progress | orchestrator procedure on markers, head fields or step marks |
| 55 | `agents/orchestrator.md` | 174 | M | convert | 5 | marker/head/progress | orchestrator procedure on markers, head fields or step marks |
| 56 | `agents/orchestrator.md` | 209 | M | convert | 5 | marker/head/progress | orchestrator procedure on markers, head fields or step marks |
| 57 | `agents/orchestrator.md` | 217 | H | convert | 5 | marker/head/progress | orchestrator procedure on markers, head fields or step marks |
| 58 | `agents/orchestrator.md` | 229 | H | convert | 5 | marker/head/progress | orchestrator procedure on markers, head fields or step marks |
| 59 | `agents/orchestrator.md` | 234 | H | convert | 5 | marker/head/progress | orchestrator procedure on markers, head fields or step marks |
| 60 | `agents/orchestrator.md` | 241 | H,M | convert | 5 | marker/head/progress | orchestrator procedure on markers, head fields or step marks |
| 61 | `agents/orchestrator.md` | 242 | M,P | convert | 5 | marker/head/progress | orchestrator procedure on markers, head fields or step marks |
| 62 | `agents/orchestrator.md` | 269 | M,P | convert | 5 | marker/head/progress | orchestrator procedure on markers, head fields or step marks |
| 63 | `agents/orchestrator.md` | 300 | M | convert | 5 | marker/head/progress | orchestrator procedure on markers, head fields or step marks |
| 64 | `agents/orchestrator.md` | 383 | H,M,P | convert | 5 | marker/head/progress | orchestrator procedure on markers, head fields or step marks |
| 65 | `agents/orchestrator.md` | 392 | M | convert | 5 | marker/head/progress | orchestrator procedure on markers, head fields or step marks |
| 66 | `agents/orchestrator.md` | 394 | M | convert | 5 | marker/head/progress | orchestrator procedure on markers, head fields or step marks |
| 67 | `agents/orchestrator.md` | 398 | M | convert | 5 | marker/head/progress | orchestrator procedure on markers, head fields or step marks |
| 68 | `agents/orchestrator.md` | 400 | M | convert | 5 | marker/head/progress | orchestrator procedure on markers, head fields or step marks |
| 69 | `agents/orchestrator.md` | 404 | H | convert | 5 | marker/head/progress | orchestrator procedure on markers, head fields or step marks |
| 70 | `agents/orchestrator.md` | 410 | H | convert | 5 | marker/head/progress | orchestrator procedure on markers, head fields or step marks |
| 71 | `agents/orchestrator.md` | 411 | H | convert | 5 | marker/head/progress | orchestrator procedure on markers, head fields or step marks |
| 72 | `agents/orchestrator.md` | 412 | H | convert | 5 | marker/head/progress | orchestrator procedure on markers, head fields or step marks |
| 73 | `agents/orchestrator.md` | 413 | H | convert | 5 | marker/head/progress | orchestrator procedure on markers, head fields or step marks |
| 74 | `agents/orchestrator.md` | 414 | H | convert | 5 | marker/head/progress | orchestrator procedure on markers, head fields or step marks |
| 75 | `agents/orchestrator.md` | 415 | H | convert | 5 | marker/head/progress | orchestrator procedure on markers, head fields or step marks |
| 76 | `agents/orchestrator.md` | 421 | H | convert | 5 | marker/head/progress | orchestrator procedure on markers, head fields or step marks |
| 77 | `agents/orchestrator.md` | 433 | H | convert | 5 | marker/head/progress | orchestrator procedure on markers, head fields or step marks |
| 78 | `agents/orchestrator.md` | 445 | H | convert | 5 | marker/head/progress | orchestrator procedure on markers, head fields or step marks |
| 79 | `agents/orchestrator.md` | 447 | H | convert | 5 | marker/head/progress | orchestrator procedure on markers, head fields or step marks |
| 80 | `agents/orchestrator.md` | 451 | H | convert | 5 | marker/head/progress | orchestrator procedure on markers, head fields or step marks |
| 81 | `agents/orchestrator.md` | 496 | M | other kind |  | history | anecdote of a past commit (three `_o_` records left HEAD); names no procedure |
| 82 | `agents/orchestrator.md` | 574 | H | convert | 5 | marker/head/progress | orchestrator procedure on markers, head fields or step marks |
| 83 | `agents/orchestrator.md` | 576 | H | convert | 5 | marker/head/progress | orchestrator procedure on markers, head fields or step marks |
| 84 | `agents/orchestrator.md` | 577 | H | convert | 5 | marker/head/progress | orchestrator procedure on markers, head fields or step marks |
| 85 | `agents/orchestrator.md` | 610 | H | convert | 5 | marker/head/progress | orchestrator procedure on markers, head fields or step marks |
| 86 | `agents/policy-curator.md` | 18 | H | convert | 6 | head-field/marker | edge fields, live test by `**Status:**`, decision markers, `**Mode:** autonomous` |
| 87 | `agents/policy-curator.md` | 89 | M | convert | 6 | head-field/marker | edge fields, live test by `**Status:**`, decision markers, `**Mode:** autonomous` |
| 88 | `agents/policy-curator.md` | 162 | M | convert | 6 | head-field/marker | edge fields, live test by `**Status:**`, decision markers, `**Mode:** autonomous` |
| 89 | `agents/policy-curator.md` | 178 | M | convert | 6 | head-field/marker | edge fields, live test by `**Status:**`, decision markers, `**Mode:** autonomous` |
| 90 | `agents/policy-curator.md` | 188 | H | convert | 6 | head-field/marker | edge fields, live test by `**Status:**`, decision markers, `**Mode:** autonomous` |
| 91 | `agents/policy-curator.md` | 194 | H | convert | 6 | head-field/marker | edge fields, live test by `**Status:**`, decision markers, `**Mode:** autonomous` |
| 92 | `agents/policy-curator.md` | 198 | H | convert | 6 | head-field/marker | edge fields, live test by `**Status:**`, decision markers, `**Mode:** autonomous` |
| 93 | `agents/policy-curator.md` | 204 | H | convert | 6 | head-field/marker | edge fields, live test by `**Status:**`, decision markers, `**Mode:** autonomous` |
| 94 | `agents/policy-curator.md` | 232 | H | convert | 6 | head-field/marker | edge fields, live test by `**Status:**`, decision markers, `**Mode:** autonomous` |
| 95 | `agents/policy-curator.md` | 233 | H | convert | 6 | head-field/marker | edge fields, live test by `**Status:**`, decision markers, `**Mode:** autonomous` |
| 96 | `agents/policy-curator.md` | 240 | H | convert | 6 | head-field/marker | edge fields, live test by `**Status:**`, decision markers, `**Mode:** autonomous` |
| 97 | `agents/policy-curator.md` | 264 | H | other kind |  | homonym | `**Mode:** survey\|apply` is the policy-curator's dispatch parameter, not the package control field |
| 98 | `agents/policy-curator.md` | 321 | H | convert | 6 | head-field/marker | edge fields, live test by `**Status:**`, decision markers, `**Mode:** autonomous` |
| 99 | `agents/policy-curator.md` | 324 | H | convert | 6 | head-field/marker | edge fields, live test by `**Status:**`, decision markers, `**Mode:** autonomous` |
| 100 | `agents/policy-curator.md` | 332 | H | convert | 6 | head-field/marker | edge fields, live test by `**Status:**`, decision markers, `**Mode:** autonomous` |
| 101 | `agents/policy-curator.md` | 374 | H | other kind |  | homonym | `**Mode:** survey\|apply` is the policy-curator's dispatch parameter, not the package control field |
| 102 | `agents/policy-curator.md` | 387 | H | other kind |  | homonym | `**Mode:** survey\|apply` is the policy-curator's dispatch parameter, not the package control field |
| 103 | `agents/policy-curator.md` | 415 | H | other kind |  | analysis-head | `**Status:**` of the policy-curator run file (an analysis-kind report) |
| 104 | `agents/policy-curator.md` | 487 | H | convert | 6 | head-field/marker | edge fields, live test by `**Status:**`, decision markers, `**Mode:** autonomous` |
| 105 | `agents/policy-curator.md` | 506 | H | convert | 6 | head-field/marker | edge fields, live test by `**Status:**`, decision markers, `**Mode:** autonomous` |
| 106 | `agents/requirements-designer.md` | 107 | M | convert | 6 | marker-name | files spec and decision under `_o_` names |
| 107 | `agents/requirements-designer.md` | 123 | M | convert | 6 | marker-name | files spec and decision under `_o_` names |
| 108 | `agents/requirements-designer.md` | 129 | H | convert | 6 | head-field | spec template writes `**Status:** Draft` |
| 109 | `agents/reviewer.md` | 30 | M | convert | 6 | marker-scan | `grep '_o_'` / `'_p_'` over issues, decisions, plans |
| 110 | `agents/reviewer.md` | 31 | M | convert | 6 | marker-scan | `grep '_o_'` / `'_p_'` over issues, decisions, plans |
| 111 | `agents/state-auditor.md` | 33 | M | convert | 6 | marker/head/progress | reconcile transitions by rename, step marks, `**Status:** Complete` |
| 112 | `agents/state-auditor.md` | 62 | M | convert | 6 | marker/head/progress | reconcile transitions by rename, step marks, `**Status:** Complete` |
| 113 | `agents/state-auditor.md` | 99 | M | convert | 6 | marker/head/progress | reconcile transitions by rename, step marks, `**Status:** Complete` |
| 114 | `agents/state-auditor.md` | 116 | P | convert | 6 | marker/head/progress | reconcile transitions by rename, step marks, `**Status:** Complete` |
| 115 | `agents/state-auditor.md` | 118 | H,M,P | convert | 6 | marker/head/progress | reconcile transitions by rename, step marks, `**Status:** Complete` |
| 116 | `agents/state-auditor.md` | 122 | M | convert | 6 | marker/head/progress | reconcile transitions by rename, step marks, `**Status:** Complete` |
| 117 | `agents/state-auditor.md` | 124 | M | convert | 6 | marker/head/progress | reconcile transitions by rename, step marks, `**Status:** Complete` |
| 118 | `agents/state-auditor.md` | 127 | M | convert | 6 | marker/head/progress | reconcile transitions by rename, step marks, `**Status:** Complete` |
| 119 | `agents/state-auditor.md` | 128 | M | convert | 6 | marker/head/progress | reconcile transitions by rename, step marks, `**Status:** Complete` |
| 120 | `agents/state-auditor.md` | 132 | M | convert | 6 | marker/head/progress | reconcile transitions by rename, step marks, `**Status:** Complete` |
| 121 | `agents/state-auditor.md` | 133 | M | convert | 6 | marker/head/progress | reconcile transitions by rename, step marks, `**Status:** Complete` |
| 122 | `agents/state-auditor.md` | 134 | M | convert | 6 | marker/head/progress | reconcile transitions by rename, step marks, `**Status:** Complete` |
| 123 | `agents/state-auditor.md` | 135 | M | convert | 6 | marker/head/progress | reconcile transitions by rename, step marks, `**Status:** Complete` |
| 124 | `agents/state-auditor.md` | 138 | M | convert | 6 | marker/head/progress | reconcile transitions by rename, step marks, `**Status:** Complete` |
| 125 | `bin/fusion-checkout-name` | 244 | H | convert | ? | head-field | header reads a holder off the `**Claim:**` line; no plan step names this file |
| 126 | `bin/fusion-citation-check` | 55 | M | convert | 8 | marker-state | header: live corpus by marker |
| 127 | `bin/fusion-citation-check` | 56 | M | convert | 8 | marker-state | header: live corpus by marker |
| 128 | `bin/fusion-plan-size` | 20 | M | convert | 8 | marker-state | header: example rows and the legacy `_o_`/`_p_` liveness |
| 129 | `bin/fusion-plan-size` | 21 | M | convert | 8 | marker-state | header: example rows and the legacy `_o_`/`_p_` liveness |
| 130 | `bin/fusion-plan-size` | 29 | M | convert | 8 | marker-state | header: example rows and the legacy `_o_`/`_p_` liveness |
| 131 | `bin/fusion-rules` | 598 | M | convert | ? | marker-rename | comment: the state-auditor's act is the `_o_ -> _a_` rename; no plan step names this file |
| 132 | `bin/fusion-work-order` | 54 | H | converted |  | json | states that nothing here reads `**Status:**`/`**Depends-on:**` |
| 133 | `bin/monitor` | 1769 | M | other kind |  | history | citation of a historical issue record in a comment |
| 134 | `bin/monitor` | 1936 | M | other kind |  | history | citation of a historical issue record in a comment |
| 135 | `codec/README.md` | 527 | H | other kind |  | codec-contract | the codec's reconcile `narratives` finding |
| 136 | `codec/README.md` | 528 | H | other kind |  | codec-contract | the codec's reconcile `narratives` finding |
| 137 | `codec/src/__tests__/install.test.ts` | 557 | H | other kind |  | codec-contract | the codec's own contract and its tests (no codec byte moves in FJ03d) |
| 138 | `codec/src/__tests__/install.test.ts` | 875 | M | other kind |  | codec-contract | the codec's own contract and its tests (no codec byte moves in FJ03d) |
| 139 | `codec/src/__tests__/install.test.ts` | 888 | M | other kind |  | codec-contract | the codec's own contract and its tests (no codec byte moves in FJ03d) |
| 140 | `codec/src/__tests__/migration.test.ts` | 40 | H | other kind |  | codec-contract | the codec's own contract and its tests (no codec byte moves in FJ03d) |
| 141 | `codec/src/__tests__/migration.test.ts` | 99 | H | other kind |  | codec-contract | the codec's own contract and its tests (no codec byte moves in FJ03d) |
| 142 | `codec/src/__tests__/migration.test.ts` | 175 | M | other kind |  | codec-contract | the codec's own contract and its tests (no codec byte moves in FJ03d) |
| 143 | `codec/src/__tests__/migration.test.ts` | 187 | M | other kind |  | codec-contract | the codec's own contract and its tests (no codec byte moves in FJ03d) |
| 144 | `codec/src/__tests__/migration.test.ts` | 403 | M | other kind |  | codec-contract | the codec's own contract and its tests (no codec byte moves in FJ03d) |
| 145 | `codec/src/__tests__/ops.test.ts` | 1286 | H | other kind |  | codec-contract | the codec's own contract and its tests (no codec byte moves in FJ03d) |
| 146 | `codec/src/__tests__/ops.test.ts` | 1287 | H | other kind |  | codec-contract | the codec's own contract and its tests (no codec byte moves in FJ03d) |
| 147 | `codec/src/__tests__/ops.test.ts` | 1331 | H | other kind |  | codec-contract | the codec's own contract and its tests (no codec byte moves in FJ03d) |
| 148 | `codec/src/__tests__/ops.test.ts` | 1644 | M | other kind |  | codec-contract | the codec's own contract and its tests (no codec byte moves in FJ03d) |
| 149 | `codec/src/__tests__/ops.test.ts` | 1645 | M | other kind |  | codec-contract | the codec's own contract and its tests (no codec byte moves in FJ03d) |
| 150 | `codec/src/__tests__/ops.test.ts` | 2740 | H | other kind |  | codec-contract | the codec's own contract and its tests (no codec byte moves in FJ03d) |
| 151 | `codec/src/__tests__/ops.test.ts` | 2741 | H | other kind |  | codec-contract | the codec's own contract and its tests (no codec byte moves in FJ03d) |
| 152 | `codec/src/__tests__/ops.test.ts` | 2752 | H | other kind |  | codec-contract | the codec's own contract and its tests (no codec byte moves in FJ03d) |
| 153 | `codec/src/__tests__/ops.test.ts` | 2754 | H | other kind |  | codec-contract | the codec's own contract and its tests (no codec byte moves in FJ03d) |
| 154 | `codec/src/__tests__/ops.test.ts` | 3158 | H | other kind |  | codec-contract | the codec's own contract and its tests (no codec byte moves in FJ03d) |
| 155 | `codec/src/__tests__/ops.test.ts` | 3159 | H | other kind |  | codec-contract | the codec's own contract and its tests (no codec byte moves in FJ03d) |
| 156 | `codec/src/__tests__/ops.test.ts` | 3160 | H | other kind |  | codec-contract | the codec's own contract and its tests (no codec byte moves in FJ03d) |
| 157 | `codec/src/__tests__/ops.test.ts` | 3161 | H | other kind |  | codec-contract | the codec's own contract and its tests (no codec byte moves in FJ03d) |
| 158 | `codec/src/__tests__/ops.test.ts` | 3162 | H | other kind |  | codec-contract | the codec's own contract and its tests (no codec byte moves in FJ03d) |
| 159 | `codec/src/__tests__/ops.test.ts` | 3165 | H | other kind |  | codec-contract | the codec's own contract and its tests (no codec byte moves in FJ03d) |
| 160 | `codec/src/__tests__/ops.test.ts` | 3171 | H | other kind |  | codec-contract | the codec's own contract and its tests (no codec byte moves in FJ03d) |
| 161 | `codec/src/__tests__/ops.test.ts` | 3176 | H | other kind |  | codec-contract | the codec's own contract and its tests (no codec byte moves in FJ03d) |
| 162 | `codec/src/__tests__/ops.test.ts` | 3177 | H | other kind |  | codec-contract | the codec's own contract and its tests (no codec byte moves in FJ03d) |
| 163 | `codec/src/__tests__/ops.test.ts` | 3178 | H | other kind |  | codec-contract | the codec's own contract and its tests (no codec byte moves in FJ03d) |
| 164 | `codec/src/__tests__/ops.test.ts` | 3179 | H | other kind |  | codec-contract | the codec's own contract and its tests (no codec byte moves in FJ03d) |
| 165 | `codec/src/__tests__/ops.test.ts` | 3180 | H | other kind |  | codec-contract | the codec's own contract and its tests (no codec byte moves in FJ03d) |
| 166 | `codec/src/__tests__/ops.test.ts` | 3184 | M | other kind |  | codec-contract | the codec's own contract and its tests (no codec byte moves in FJ03d) |
| 167 | `codec/src/__tests__/ops.test.ts` | 3185 | M | other kind |  | codec-contract | the codec's own contract and its tests (no codec byte moves in FJ03d) |
| 168 | `codec/src/__tests__/ops.test.ts` | 3187 | H | other kind |  | codec-contract | the codec's own contract and its tests (no codec byte moves in FJ03d) |
| 169 | `codec/src/__tests__/ops.test.ts` | 3192 | H | other kind |  | codec-contract | the codec's own contract and its tests (no codec byte moves in FJ03d) |
| 170 | `codec/src/__tests__/ops.test.ts` | 3201 | H | other kind |  | codec-contract | the codec's own contract and its tests (no codec byte moves in FJ03d) |
| 171 | `codec/src/__tests__/ops.test.ts` | 3202 | H | other kind |  | codec-contract | the codec's own contract and its tests (no codec byte moves in FJ03d) |
| 172 | `codec/src/__tests__/ops.test.ts` | 3214 | H | other kind |  | codec-contract | the codec's own contract and its tests (no codec byte moves in FJ03d) |
| 173 | `codec/src/__tests__/ops.test.ts` | 3219 | P | other kind |  | codec-contract | the codec's own contract and its tests (no codec byte moves in FJ03d) |
| 174 | `codec/src/__tests__/ops.test.ts` | 3220 | P | other kind |  | codec-contract | the codec's own contract and its tests (no codec byte moves in FJ03d) |
| 175 | `codec/src/__tests__/ops.test.ts` | 3942 | M | other kind |  | codec-contract | the codec's own contract and its tests (no codec byte moves in FJ03d) |
| 176 | `codec/src/__tests__/ops.test.ts` | 3956 | M | other kind |  | codec-contract | the codec's own contract and its tests (no codec byte moves in FJ03d) |
| 177 | `codec/src/__tests__/prior-mapping.test.ts` | 206 | M | other kind |  | codec-contract | the codec's own contract and its tests (no codec byte moves in FJ03d) |
| 178 | `codec/src/__tests__/references.test.ts` | 135 | M | other kind |  | codec-contract | the codec's own contract and its tests (no codec byte moves in FJ03d) |
| 179 | `codec/src/__tests__/references.test.ts` | 137 | M | other kind |  | codec-contract | the codec's own contract and its tests (no codec byte moves in FJ03d) |
| 180 | `codec/src/__tests__/references.test.ts` | 160 | M | other kind |  | codec-contract | the codec's own contract and its tests (no codec byte moves in FJ03d) |
| 181 | `codec/src/__tests__/round-trip-cli-archive.test.ts` | 266 | M | other kind |  | codec-contract | the codec's own contract and its tests (no codec byte moves in FJ03d) |
| 182 | `codec/src/__tests__/round-trip-cli-initialize.test.ts` | 144 | H | other kind |  | codec-contract | the codec's own contract and its tests (no codec byte moves in FJ03d) |
| 183 | `codec/src/__tests__/round-trip-cli-migration.test.ts` | 168 | M | other kind |  | codec-contract | the codec's own contract and its tests (no codec byte moves in FJ03d) |
| 184 | `codec/src/__tests__/round-trip-cli-migration.test.ts` | 169 | M | other kind |  | codec-contract | the codec's own contract and its tests (no codec byte moves in FJ03d) |
| 185 | `codec/src/__tests__/round-trip-cli-migration.test.ts` | 170 | M | other kind |  | codec-contract | the codec's own contract and its tests (no codec byte moves in FJ03d) |
| 186 | `codec/src/__tests__/round-trip-cli-migration.test.ts` | 171 | M | other kind |  | codec-contract | the codec's own contract and its tests (no codec byte moves in FJ03d) |
| 187 | `codec/src/__tests__/round-trip-cli-migration.test.ts` | 172 | M | other kind |  | codec-contract | the codec's own contract and its tests (no codec byte moves in FJ03d) |
| 188 | `codec/src/__tests__/round-trip-cli-migration.test.ts` | 173 | M | other kind |  | codec-contract | the codec's own contract and its tests (no codec byte moves in FJ03d) |
| 189 | `codec/src/__tests__/round-trip-cli-migration.test.ts` | 174 | M | other kind |  | codec-contract | the codec's own contract and its tests (no codec byte moves in FJ03d) |
| 190 | `codec/src/__tests__/round-trip-cli-migration.test.ts` | 175 | M | other kind |  | codec-contract | the codec's own contract and its tests (no codec byte moves in FJ03d) |
| 191 | `codec/src/__tests__/round-trip-cli-migration.test.ts` | 176 | M | other kind |  | codec-contract | the codec's own contract and its tests (no codec byte moves in FJ03d) |
| 192 | `codec/src/__tests__/round-trip-cli-migration.test.ts` | 177 | M | other kind |  | codec-contract | the codec's own contract and its tests (no codec byte moves in FJ03d) |
| 193 | `codec/src/__tests__/round-trip-cli-migration.test.ts` | 178 | M | other kind |  | codec-contract | the codec's own contract and its tests (no codec byte moves in FJ03d) |
| 194 | `codec/src/__tests__/round-trip-cli-migration.test.ts` | 179 | M | other kind |  | codec-contract | the codec's own contract and its tests (no codec byte moves in FJ03d) |
| 195 | `codec/src/__tests__/round-trip-cli-migration.test.ts` | 180 | M | other kind |  | codec-contract | the codec's own contract and its tests (no codec byte moves in FJ03d) |
| 196 | `codec/src/__tests__/round-trip-cli-migration.test.ts` | 181 | M | other kind |  | codec-contract | the codec's own contract and its tests (no codec byte moves in FJ03d) |
| 197 | `codec/src/__tests__/round-trip-cli-migration.test.ts` | 182 | M | other kind |  | codec-contract | the codec's own contract and its tests (no codec byte moves in FJ03d) |
| 198 | `codec/src/__tests__/round-trip-cli-migration.test.ts` | 190 | M | other kind |  | codec-contract | the codec's own contract and its tests (no codec byte moves in FJ03d) |
| 199 | `codec/src/__tests__/round-trip-cli-migration.test.ts` | 207 | H | other kind |  | codec-contract | the codec's own contract and its tests (no codec byte moves in FJ03d) |
| 200 | `codec/src/__tests__/round-trip-cli-migration.test.ts` | 208 | H | other kind |  | codec-contract | the codec's own contract and its tests (no codec byte moves in FJ03d) |
| 201 | `codec/src/__tests__/round-trip-cli-migration.test.ts` | 209 | H | other kind |  | codec-contract | the codec's own contract and its tests (no codec byte moves in FJ03d) |
| 202 | `codec/src/__tests__/round-trip-cli-migration.test.ts` | 211 | H | other kind |  | codec-contract | the codec's own contract and its tests (no codec byte moves in FJ03d) |
| 203 | `codec/src/__tests__/round-trip-cli-migration.test.ts` | 252 | C | other kind |  | codec-contract | the codec's own contract and its tests (no codec byte moves in FJ03d) |
| 204 | `codec/src/__tests__/round-trip-cli-migration.test.ts` | 260 | H | other kind |  | codec-contract | the codec's own contract and its tests (no codec byte moves in FJ03d) |
| 205 | `codec/src/__tests__/round-trip-cli-migration.test.ts` | 268 | H | other kind |  | codec-contract | the codec's own contract and its tests (no codec byte moves in FJ03d) |
| 206 | `codec/src/__tests__/round-trip-cli-migration.test.ts` | 273 | H | other kind |  | codec-contract | the codec's own contract and its tests (no codec byte moves in FJ03d) |
| 207 | `codec/src/__tests__/round-trip-cli-migration.test.ts` | 280 | H | other kind |  | codec-contract | the codec's own contract and its tests (no codec byte moves in FJ03d) |
| 208 | `codec/src/__tests__/round-trip-cli-migration.test.ts` | 286 | H | other kind |  | codec-contract | the codec's own contract and its tests (no codec byte moves in FJ03d) |
| 209 | `codec/src/__tests__/round-trip-cli-migration.test.ts` | 290 | H | other kind |  | codec-contract | the codec's own contract and its tests (no codec byte moves in FJ03d) |
| 210 | `codec/src/__tests__/round-trip-cli-migration.test.ts` | 291 | H | other kind |  | codec-contract | the codec's own contract and its tests (no codec byte moves in FJ03d) |
| 211 | `codec/src/__tests__/round-trip-cli-migration.test.ts` | 299 | H | other kind |  | codec-contract | the codec's own contract and its tests (no codec byte moves in FJ03d) |
| 212 | `codec/src/__tests__/round-trip-cli-migration.test.ts` | 300 | P | other kind |  | codec-contract | the codec's own contract and its tests (no codec byte moves in FJ03d) |
| 213 | `codec/src/__tests__/round-trip-cli-migration.test.ts` | 306 | M | other kind |  | codec-contract | the codec's own contract and its tests (no codec byte moves in FJ03d) |
| 214 | `codec/src/__tests__/transitions.test.ts` | 64 | M | other kind |  | codec-contract | the codec's own contract and its tests (no codec byte moves in FJ03d) |
| 215 | `codec/src/__tests__/transitions.test.ts` | 67 | M | other kind |  | codec-contract | the codec's own contract and its tests (no codec byte moves in FJ03d) |
| 216 | `codec/src/__tests__/transitions.test.ts` | 76 | M | other kind |  | codec-contract | the codec's own contract and its tests (no codec byte moves in FJ03d) |
| 217 | `codec/src/__tests__/transitions.test.ts` | 78 | M | other kind |  | codec-contract | the codec's own contract and its tests (no codec byte moves in FJ03d) |
| 218 | `codec/src/__tests__/transitions.test.ts` | 84 | M | other kind |  | codec-contract | the codec's own contract and its tests (no codec byte moves in FJ03d) |
| 219 | `codec/src/__tests__/transitions.test.ts` | 86 | M | other kind |  | codec-contract | the codec's own contract and its tests (no codec byte moves in FJ03d) |
| 220 | `codec/src/cli/ops.ts` | 2011 | H | other kind |  | codec-contract | the codec's own contract and its tests (no codec byte moves in FJ03d) |
| 221 | `codec/src/cli/ops.ts` | 2012 | H | other kind |  | codec-contract | the codec's own contract and its tests (no codec byte moves in FJ03d) |
| 222 | `codec/src/prior/gojson.ts` | 210 | Hs | other kind |  | codec-contract | the codec's own contract and its tests (no codec byte moves in FJ03d) |
| 223 | `codec/src/prior/packages.ts` | 211 | Hs | other kind |  | codec-contract | the codec's own contract and its tests (no codec byte moves in FJ03d) |
| 224 | `codec/src/references.ts` | 8 | M | other kind |  | codec-contract | the codec's own contract and its tests (no codec byte moves in FJ03d) |
| 225 | `codec/src/references.ts` | 115 | C | other kind |  | codec-contract | the codec's own contract and its tests (no codec byte moves in FJ03d) |
| 226 | `codec/src/transitions.ts` | 247 | P | other kind |  | codec-contract | the codec's own contract and its tests (no codec byte moves in FJ03d) |
| 227 | `docs/fusion-intro.md` | 85 | H | convert | 9 | head-field/marker | user doc states head fields and marker vocabularies as current |
| 228 | `docs/fusion-intro.md` | 88 | H | convert | 9 | head-field/marker | user doc states head fields and marker vocabularies as current |
| 229 | `docs/fusion-intro.md` | 112 | M | convert | 9 | head-field/marker | user doc states head fields and marker vocabularies as current |
| 230 | `docs/fusion-intro.md` | 116 | H | convert | 9 | head-field/marker | user doc states head fields and marker vocabularies as current |
| 231 | `docs/fusion-intro.md` | 191 | H | convert | 9 | head-field/marker | user doc states head fields and marker vocabularies as current |
| 232 | `docs/upgrading-to-v10-2.md` | 4 | H | legacy-only |  | upgrade-note | historical upgrade note |
| 233 | `docs/upgrading-to-v10-2.md` | 23 | M | legacy-only |  | upgrade-note | historical upgrade note |
| 234 | `docs/upgrading-to-v10-2.md` | 32 | H | legacy-only |  | upgrade-note | historical upgrade note |
| 235 | `docs/upgrading-to-v10-2.md` | 37 | H | legacy-only |  | upgrade-note | historical upgrade note |
| 236 | `docs/upgrading-to-v10-2.md` | 45 | H | legacy-only |  | upgrade-note | historical upgrade note |
| 237 | `docs/upgrading-to-v10-2.md` | 66 | H | legacy-only |  | upgrade-note | historical upgrade note |
| 238 | `docs/upgrading-to-v10-2.md` | 78 | H | legacy-only |  | upgrade-note | historical upgrade note |
| 239 | `docs/upgrading-to-v10-2.md` | 88 | H | legacy-only |  | upgrade-note | historical upgrade note |
| 240 | `docs/upgrading-to-v10-2.md` | 105 | H | legacy-only |  | upgrade-note | historical upgrade note |
| 241 | `docs/upgrading-to-v10-2.md` | 108 | H | legacy-only |  | upgrade-note | historical upgrade note |
| 242 | `docs/upgrading-to-v10-3.md` | 3 | H | legacy-only |  | upgrade-note | historical upgrade note |
| 243 | `docs/upgrading-to-v10-3.md` | 16 | H | legacy-only |  | upgrade-note | historical upgrade note |
| 244 | `docs/upgrading-to-v10-3.md` | 18 | M | legacy-only |  | upgrade-note | historical upgrade note |
| 245 | `docs/upgrading-to-v10-3.md` | 19 | H,M | legacy-only |  | upgrade-note | historical upgrade note |
| 246 | `docs/upgrading-to-v10-4.md` | 42 | M | legacy-only |  | upgrade-note | historical upgrade note |
| 247 | `docs/upgrading-to-v10-4.md` | 73 | M | legacy-only |  | upgrade-note | historical upgrade note |
| 248 | `docs/upgrading-to-v10-4.md` | 116 | H | legacy-only |  | upgrade-note | historical upgrade note |
| 249 | `docs/upgrading-to-v10-4.md` | 150 | M | legacy-only |  | upgrade-note | historical upgrade note |
| 250 | `docs/upgrading-to-v10-4.md` | 152 | M | legacy-only |  | upgrade-note | historical upgrade note |
| 251 | `docs/upgrading-to-v10-4.md` | 153 | M | legacy-only |  | upgrade-note | historical upgrade note |
| 252 | `docs/upgrading-to-v10-6.md` | 59 | H | legacy-only |  | upgrade-note | historical upgrade note |
| 253 | `docs/upgrading-to-v11.md` | 25 | H | legacy-only |  | upgrade-note | historical upgrade note |
| 254 | `docs/upgrading-to-v11.md` | 46 | C | legacy-only |  | upgrade-note | historical upgrade note |
| 255 | `docs/upgrading-to-v11.md` | 50 | M | legacy-only |  | upgrade-note | historical upgrade note |
| 256 | `docs/upgrading-to-v11.md` | 65 | H | legacy-only |  | upgrade-note | historical upgrade note |
| 257 | `docs/upgrading-to-v11.md` | 66 | H | legacy-only |  | upgrade-note | historical upgrade note |
| 258 | `docs/upgrading-to-v11.md` | 75 | M | legacy-only |  | upgrade-note | historical upgrade note |
| 259 | `docs/upgrading-to-v11.md` | 177 | M | legacy-only |  | upgrade-note | historical upgrade note |
| 260 | `docs/upgrading-to-v11.md` | 178 | M | legacy-only |  | upgrade-note | historical upgrade note |
| 261 | `docs/upgrading-to-v11.md` | 179 | H | legacy-only |  | upgrade-note | historical upgrade note |
| 262 | `docs/working-model.md` | 18 | H | convert | 9 | head-field | user doc's package head example and field rules |
| 263 | `docs/working-model.md` | 19 | H | convert | 9 | head-field | user doc's package head example and field rules |
| 264 | `docs/working-model.md` | 20 | H | convert | 9 | head-field | user doc's package head example and field rules |
| 265 | `docs/working-model.md` | 21 | H | convert | 9 | head-field | user doc's package head example and field rules |
| 266 | `docs/working-model.md` | 22 | H | convert | 9 | head-field | user doc's package head example and field rules |
| 267 | `docs/working-model.md` | 32 | H | convert | 9 | head-field | user doc's package head example and field rules |
| 268 | `docs/working-model.md` | 35 | H | convert | 9 | head-field | user doc's package head example and field rules |
| 269 | `docs/working-model.md` | 46 | H | convert | 9 | head-field | user doc's package head example and field rules |
| 270 | `docs/working-model.md` | 48 | H | convert | 9 | head-field | user doc's package head example and field rules |
| 271 | `docs/working-model.md` | 50 | H | convert | 9 | head-field | user doc's package head example and field rules |
| 272 | `docs/working-model.md` | 54 | H | convert | 9 | head-field | user doc's package head example and field rules |
| 273 | `docs/working-model.md` | 106 | H | convert | 9 | head-field | user doc's package head example and field rules |
| 274 | `docs/working-model.md` | 116 | H | convert | 9 | head-field | user doc's package head example and field rules |
| 275 | `docs/working-model.md` | 164 | H | convert | 9 | head-field | user doc's package head example and field rules |
| 276 | `docs/working-model.md` | 172 | H | convert | 9 | head-field | user doc's package head example and field rules |
| 277 | `docs/working-model.md` | 173 | H | convert | 9 | head-field | user doc's package head example and field rules |
| 278 | `docs/working-model.md` | 175 | H | convert | 9 | head-field | user doc's package head example and field rules |
| 279 | `hooks/citation-sweep.ts` | 678 | C | converted |  | name-grammar | citation token grammar: marker slot and wildcard resolution of old basenames |
| 280 | `hooks/citation-sweep.ts` | 730 | C | converted |  | name-grammar | citation token grammar: marker slot and wildcard resolution of old basenames |
| 281 | `hooks/citation-sweep.ts` | 757 | C | converted |  | name-grammar | citation token grammar: marker slot and wildcard resolution of old basenames |
| 282 | `hooks/lib/__tests__/archive-filter-key.test.ts` | 25 | M | converted |  | name-grammar | filter-3 citation key of the archive skill |
| 283 | `hooks/lib/__tests__/archive-filter-key.test.ts` | 27 | M | converted |  | name-grammar | filter-3 citation key of the archive skill |
| 284 | `hooks/lib/__tests__/archive-filter-key.test.ts` | 28 | M | converted |  | name-grammar | filter-3 citation key of the archive skill |
| 285 | `hooks/lib/__tests__/archive-filter-key.test.ts` | 29 | M | converted |  | name-grammar | filter-3 citation key of the archive skill |
| 286 | `hooks/lib/__tests__/archive-filter-key.test.ts` | 41 | H | convert | 7 | legacy-branch | runs the archive skill's legacy package walk and pins its filter-2 marker text |
| 287 | `hooks/lib/__tests__/archive-filter-key.test.ts` | 43 | M | convert | 7 | legacy-branch | runs the archive skill's legacy package walk and pins its filter-2 marker text |
| 288 | `hooks/lib/__tests__/archive-filter-key.test.ts` | 44 | M | convert | 7 | legacy-branch | runs the archive skill's legacy package walk and pins its filter-2 marker text |
| 289 | `hooks/lib/__tests__/archive-filter-key.test.ts` | 45 | M | convert | 7 | legacy-branch | runs the archive skill's legacy package walk and pins its filter-2 marker text |
| 290 | `hooks/lib/__tests__/archive-filter-key.test.ts` | 46 | M | convert | 7 | legacy-branch | runs the archive skill's legacy package walk and pins its filter-2 marker text |
| 291 | `hooks/lib/__tests__/archive-filter-key.test.ts` | 54 | M | convert | 7 | legacy-branch | runs the archive skill's legacy package walk and pins its filter-2 marker text |
| 292 | `hooks/lib/__tests__/archive-filter-key.test.ts` | 55 | M | convert | 7 | legacy-branch | runs the archive skill's legacy package walk and pins its filter-2 marker text |
| 293 | `hooks/lib/__tests__/archive-filter-key.test.ts` | 59 | M | convert | 7 | legacy-branch | runs the archive skill's legacy package walk and pins its filter-2 marker text |
| 294 | `hooks/lib/__tests__/citation-form.test.ts` | 31 | M | converted |  | name-grammar | citation-form fixtures; the hook reads no liveness |
| 295 | `hooks/lib/__tests__/citation-form.test.ts` | 37 | M | converted |  | name-grammar | citation-form fixtures; the hook reads no liveness |
| 296 | `hooks/lib/__tests__/citation-form.test.ts` | 38 | M | converted |  | name-grammar | citation-form fixtures; the hook reads no liveness |
| 297 | `hooks/lib/__tests__/citation-form.test.ts` | 40 | M | converted |  | name-grammar | citation-form fixtures; the hook reads no liveness |
| 298 | `hooks/lib/__tests__/citation-form.test.ts` | 65 | M | converted |  | name-grammar | citation-form fixtures; the hook reads no liveness |
| 299 | `hooks/lib/__tests__/citation-form.test.ts` | 76 | M | converted |  | name-grammar | citation-form fixtures; the hook reads no liveness |
| 300 | `hooks/lib/__tests__/citation-form.test.ts` | 77 | M | converted |  | name-grammar | citation-form fixtures; the hook reads no liveness |
| 301 | `hooks/lib/__tests__/citation-form.test.ts` | 139 | M | converted |  | name-grammar | citation-form fixtures; the hook reads no liveness |
| 302 | `hooks/lib/__tests__/citation-form.test.ts` | 155 | M | converted |  | name-grammar | citation-form fixtures; the hook reads no liveness |
| 303 | `hooks/lib/__tests__/citation-form.test.ts` | 172 | M | converted |  | name-grammar | citation-form fixtures; the hook reads no liveness |
| 304 | `hooks/lib/__tests__/citation-form.test.ts` | 264 | M | converted |  | name-grammar | citation-form fixtures; the hook reads no liveness |
| 305 | `hooks/lib/__tests__/citation-form.test.ts` | 307 | M | converted |  | name-grammar | citation-form fixtures; the hook reads no liveness |
| 306 | `hooks/lib/__tests__/citation-grammar-boundaries.test.ts` | 26 | M | converted |  | name-grammar | scanner grammar fixtures |
| 307 | `hooks/lib/__tests__/citation-grammar-boundaries.test.ts` | 53 | M | converted |  | name-grammar | scanner grammar fixtures |
| 308 | `hooks/lib/__tests__/citation-grammar-boundaries.test.ts` | 64 | M | converted |  | name-grammar | scanner grammar fixtures |
| 309 | `hooks/lib/__tests__/citation-grammar-boundaries.test.ts` | 82 | M | converted |  | name-grammar | scanner grammar fixtures |
| 310 | `hooks/lib/__tests__/citation-grammar-boundaries.test.ts` | 99 | M | converted |  | name-grammar | scanner grammar fixtures |
| 311 | `hooks/lib/__tests__/citation-grammar-boundaries.test.ts` | 101 | M | converted |  | name-grammar | scanner grammar fixtures |
| 312 | `hooks/lib/__tests__/citation-grammar-boundaries.test.ts` | 103 | M | converted |  | name-grammar | scanner grammar fixtures |
| 313 | `hooks/lib/__tests__/citation-grammar-boundaries.test.ts` | 138 | M | converted |  | name-grammar | scanner grammar fixtures |
| 314 | `hooks/lib/__tests__/citation-grammar-boundaries.test.ts` | 139 | M | converted |  | name-grammar | scanner grammar fixtures |
| 315 | `hooks/lib/__tests__/citation-grammar-boundaries.test.ts` | 141 | M | converted |  | name-grammar | scanner grammar fixtures |
| 316 | `hooks/lib/__tests__/citation-grammar-boundaries.test.ts` | 229 | M | converted |  | name-grammar | scanner grammar fixtures |
| 317 | `hooks/lib/__tests__/citation-grammar-boundaries.test.ts` | 239 | M | converted |  | name-grammar | scanner grammar fixtures |
| 318 | `hooks/lib/__tests__/citation-sweep.test.ts` | 34 | M | convert | 8 | legacy-branch | legacy-fixture cases of the sweep (`format=legacy`), which step 8 turns into a refusal |
| 319 | `hooks/lib/__tests__/citation-sweep.test.ts` | 39 | M | convert | 8 | legacy-branch | legacy-fixture cases of the sweep (`format=legacy`), which step 8 turns into a refusal |
| 320 | `hooks/lib/__tests__/citation-sweep.test.ts` | 50 | M | convert | 8 | legacy-branch | legacy-fixture cases of the sweep (`format=legacy`), which step 8 turns into a refusal |
| 321 | `hooks/lib/__tests__/citation-sweep.test.ts` | 52 | M | convert | 8 | legacy-branch | legacy-fixture cases of the sweep (`format=legacy`), which step 8 turns into a refusal |
| 322 | `hooks/lib/__tests__/citation-sweep.test.ts` | 57 | M | convert | 8 | legacy-branch | legacy-fixture cases of the sweep (`format=legacy`), which step 8 turns into a refusal |
| 323 | `hooks/lib/__tests__/citation-sweep.test.ts` | 59 | M | convert | 8 | legacy-branch | legacy-fixture cases of the sweep (`format=legacy`), which step 8 turns into a refusal |
| 324 | `hooks/lib/__tests__/citation-sweep.test.ts` | 60 | M | convert | 8 | legacy-branch | legacy-fixture cases of the sweep (`format=legacy`), which step 8 turns into a refusal |
| 325 | `hooks/lib/__tests__/citation-sweep.test.ts` | 61 | M | convert | 8 | legacy-branch | legacy-fixture cases of the sweep (`format=legacy`), which step 8 turns into a refusal |
| 326 | `hooks/lib/__tests__/citation-sweep.test.ts` | 71 | M | convert | 8 | legacy-branch | legacy-fixture cases of the sweep (`format=legacy`), which step 8 turns into a refusal |
| 327 | `hooks/lib/__tests__/citation-sweep.test.ts` | 72 | M | convert | 8 | legacy-branch | legacy-fixture cases of the sweep (`format=legacy`), which step 8 turns into a refusal |
| 328 | `hooks/lib/__tests__/citation-sweep.test.ts` | 73 | M | convert | 8 | legacy-branch | legacy-fixture cases of the sweep (`format=legacy`), which step 8 turns into a refusal |
| 329 | `hooks/lib/__tests__/citation-sweep.test.ts` | 83 | M | convert | 8 | legacy-branch | legacy-fixture cases of the sweep (`format=legacy`), which step 8 turns into a refusal |
| 330 | `hooks/lib/__tests__/citation-sweep.test.ts` | 85 | M | convert | 8 | legacy-branch | legacy-fixture cases of the sweep (`format=legacy`), which step 8 turns into a refusal |
| 331 | `hooks/lib/__tests__/citation-sweep.test.ts` | 100 | H | convert | 8 | legacy-branch | legacy-fixture cases of the sweep (`format=legacy`), which step 8 turns into a refusal |
| 332 | `hooks/lib/__tests__/citation-sweep.test.ts` | 112 | M | convert | 8 | legacy-branch | legacy-fixture cases of the sweep (`format=legacy`), which step 8 turns into a refusal |
| 333 | `hooks/lib/__tests__/citation-sweep.test.ts` | 113 | M | convert | 8 | legacy-branch | legacy-fixture cases of the sweep (`format=legacy`), which step 8 turns into a refusal |
| 334 | `hooks/lib/__tests__/citation-sweep.test.ts` | 119 | M | convert | 8 | legacy-branch | legacy-fixture cases of the sweep (`format=legacy`), which step 8 turns into a refusal |
| 335 | `hooks/lib/__tests__/citation-sweep.test.ts` | 120 | M | convert | 8 | legacy-branch | legacy-fixture cases of the sweep (`format=legacy`), which step 8 turns into a refusal |
| 336 | `hooks/lib/__tests__/citation-sweep.test.ts` | 173 | M | convert | 8 | legacy-branch | legacy-fixture cases of the sweep (`format=legacy`), which step 8 turns into a refusal |
| 337 | `hooks/lib/__tests__/citation-sweep.test.ts` | 205 | M | convert | 8 | legacy-branch | legacy-fixture cases of the sweep (`format=legacy`), which step 8 turns into a refusal |
| 338 | `hooks/lib/__tests__/citation-sweep.test.ts` | 229 | M | convert | 8 | legacy-branch | legacy-fixture cases of the sweep (`format=legacy`), which step 8 turns into a refusal |
| 339 | `hooks/lib/__tests__/citation-sweep.test.ts` | 257 | M | convert | 8 | legacy-branch | legacy-fixture cases of the sweep (`format=legacy`), which step 8 turns into a refusal |
| 340 | `hooks/lib/__tests__/citation-sweep.test.ts` | 277 | M | convert | 8 | legacy-branch | legacy-fixture cases of the sweep (`format=legacy`), which step 8 turns into a refusal |
| 341 | `hooks/lib/__tests__/citation-sweep.test.ts` | 293 | M | convert | 8 | legacy-branch | legacy-fixture cases of the sweep (`format=legacy`), which step 8 turns into a refusal |
| 342 | `hooks/lib/__tests__/citation-sweep.test.ts` | 366 | M | convert | 8 | legacy-branch | legacy-fixture cases of the sweep (`format=legacy`), which step 8 turns into a refusal |
| 343 | `hooks/lib/__tests__/citation-sweep.test.ts` | 367 | M | convert | 8 | legacy-branch | legacy-fixture cases of the sweep (`format=legacy`), which step 8 turns into a refusal |
| 344 | `hooks/lib/__tests__/citation-sweep.test.ts` | 376 | M | convert | 8 | legacy-branch | legacy-fixture cases of the sweep (`format=legacy`), which step 8 turns into a refusal |
| 345 | `hooks/lib/__tests__/citation-sweep.test.ts` | 390 | M | convert | 8 | legacy-branch | legacy-fixture cases of the sweep (`format=legacy`), which step 8 turns into a refusal |
| 346 | `hooks/lib/__tests__/citation-sweep.test.ts` | 394 | M | convert | 8 | legacy-branch | legacy-fixture cases of the sweep (`format=legacy`), which step 8 turns into a refusal |
| 347 | `hooks/lib/__tests__/citation-sweep.test.ts` | 459 | M | convert | 8 | legacy-branch | legacy-fixture cases of the sweep (`format=legacy`), which step 8 turns into a refusal |
| 348 | `hooks/lib/__tests__/citation-sweep.test.ts` | 562 | M | convert | 8 | legacy-branch | legacy-fixture cases of the sweep (`format=legacy`), which step 8 turns into a refusal |
| 349 | `hooks/lib/__tests__/citation-sweep.test.ts` | 563 | M | convert | 8 | legacy-branch | legacy-fixture cases of the sweep (`format=legacy`), which step 8 turns into a refusal |
| 350 | `hooks/lib/__tests__/citation-sweep.test.ts` | 565 | M | convert | 8 | legacy-branch | legacy-fixture cases of the sweep (`format=legacy`), which step 8 turns into a refusal |
| 351 | `hooks/lib/__tests__/citation-sweep.test.ts` | 566 | M | convert | 8 | legacy-branch | legacy-fixture cases of the sweep (`format=legacy`), which step 8 turns into a refusal |
| 352 | `hooks/lib/__tests__/citation-sweep.test.ts` | 567 | M | convert | 8 | legacy-branch | legacy-fixture cases of the sweep (`format=legacy`), which step 8 turns into a refusal |
| 353 | `hooks/lib/__tests__/citation-sweep.test.ts` | 593 | M | convert | 8 | legacy-branch | legacy-fixture cases of the sweep (`format=legacy`), which step 8 turns into a refusal |
| 354 | `hooks/lib/__tests__/commit-message-path.test.ts` | 10 | M | other kind |  | history | citation of a historical issue |
| 355 | `hooks/lib/__tests__/commit-message-path.test.ts` | 293 | M | converted |  | name-grammar | path classification of a record name |
| 356 | `hooks/lib/__tests__/commit-message-path.test.ts` | 333 | M | other kind |  | history | citation of a historical issue |
| 357 | `hooks/lib/__tests__/declared-citation-paths.test.ts` | 79 | M | convert | 8 | legacy-branch | runs `citation-check` on a legacy fixture (no `workbench.json`) |
| 358 | `hooks/lib/__tests__/declared-citation-paths.test.ts` | 82 | M | convert | 8 | legacy-branch | runs `citation-check` on a legacy fixture (no `workbench.json`) |
| 359 | `hooks/lib/__tests__/domain-cascade.test.ts` | 729 | M | other kind |  | jargon-example | fixture prose containing markers |
| 360 | `hooks/lib/__tests__/domain-cascade.test.ts` | 730 | M | other kind |  | jargon-example | fixture prose containing markers |
| 361 | `hooks/lib/__tests__/edge-answers.test.ts` | 69 | M | other kind |  | analysis-head | run-file fixtures for the edge-answer parse |
| 362 | `hooks/lib/__tests__/edge-answers.test.ts` | 125 | Hs | other kind |  | analysis-head | run-file fixtures for the edge-answer parse |
| 363 | `hooks/lib/__tests__/fenced-code-exemption.test.ts` | 37 | M | converted |  | name-grammar | dead-citation fixtures for the scanner's fence rule |
| 364 | `hooks/lib/__tests__/fenced-code-exemption.test.ts` | 40 | M | converted |  | name-grammar | dead-citation fixtures for the scanner's fence rule |
| 365 | `hooks/lib/__tests__/fusion-citation-check.test.ts` | 43 | M | convert | 8 | legacy-branch | legacy-fixture cases of the checker |
| 366 | `hooks/lib/__tests__/fusion-citation-check.test.ts` | 45 | M | convert | 8 | legacy-branch | legacy-fixture cases of the checker |
| 367 | `hooks/lib/__tests__/fusion-citation-check.test.ts` | 46 | M | convert | 8 | legacy-branch | legacy-fixture cases of the checker |
| 368 | `hooks/lib/__tests__/fusion-citation-check.test.ts` | 48 | M | convert | 8 | legacy-branch | legacy-fixture cases of the checker |
| 369 | `hooks/lib/__tests__/fusion-citation-check.test.ts` | 74 | M | convert | 8 | legacy-branch | legacy-fixture cases of the checker |
| 370 | `hooks/lib/__tests__/fusion-citation-check.test.ts` | 75 | M | convert | 8 | legacy-branch | legacy-fixture cases of the checker |
| 371 | `hooks/lib/__tests__/fusion-citation-check.test.ts` | 183 | M | convert | 8 | legacy-branch | legacy-fixture cases of the checker |
| 372 | `hooks/lib/__tests__/fusion-citation-check.test.ts` | 184 | M | convert | 8 | legacy-branch | legacy-fixture cases of the checker |
| 373 | `hooks/lib/__tests__/fusion-citation-check.test.ts` | 294 | M | converted |  | json | JSON-controlled cases: the name decides nothing |
| 374 | `hooks/lib/__tests__/fusion-citation-check.test.ts` | 315 | M | converted |  | json | JSON-controlled cases: the name decides nothing |
| 375 | `hooks/lib/__tests__/fusion-citation-check.test.ts` | 340 | M | converted |  | json | JSON-controlled cases: the name decides nothing |
| 376 | `hooks/lib/__tests__/fusion-citation-check.test.ts` | 341 | M | converted |  | json | JSON-controlled cases: the name decides nothing |
| 377 | `hooks/lib/__tests__/fusion-citation-check.test.ts` | 356 | M | converted |  | json | JSON-controlled cases: the name decides nothing |
| 378 | `hooks/lib/__tests__/hook-fail-open.test.ts` | 30 | M | other kind |  | history | citation of an archived issue |
| 379 | `hooks/lib/__tests__/hook-route-exclusion.test.ts` | 227 | M | converted |  | name-grammar | `**Work-item:**` value parse |
| 380 | `hooks/lib/__tests__/legacy-import.test.ts` | 17 | M | legacy-only |  | legacy-reader | tests of the legacy reader |
| 381 | `hooks/lib/__tests__/legacy-import.test.ts` | 18 | M | legacy-only |  | legacy-reader | tests of the legacy reader |
| 382 | `hooks/lib/__tests__/legacy-import.test.ts` | 19 | M | legacy-only |  | legacy-reader | tests of the legacy reader |
| 383 | `hooks/lib/__tests__/legacy-import.test.ts` | 20 | M | legacy-only |  | legacy-reader | tests of the legacy reader |
| 384 | `hooks/lib/__tests__/legacy-import.test.ts` | 21 | M | legacy-only |  | legacy-reader | tests of the legacy reader |
| 385 | `hooks/lib/__tests__/legacy-import.test.ts` | 61 | M | legacy-only |  | legacy-reader | tests of the legacy reader |
| 386 | `hooks/lib/__tests__/legacy-import.test.ts` | 85 | He,P | legacy-only |  | legacy-reader | tests of the legacy reader |
| 387 | `hooks/lib/__tests__/legacy-import.test.ts` | 86 | H | legacy-only |  | legacy-reader | tests of the legacy reader |
| 388 | `hooks/lib/__tests__/legacy-import.test.ts` | 87 | M | legacy-only |  | legacy-reader | tests of the legacy reader |
| 389 | `hooks/lib/__tests__/legacy-import.test.ts` | 89 | M | legacy-only |  | legacy-reader | tests of the legacy reader |
| 390 | `hooks/lib/__tests__/legacy-import.test.ts` | 92 | C | legacy-only |  | legacy-reader | tests of the legacy reader |
| 391 | `hooks/lib/__tests__/legacy-import.test.ts` | 100 | H | legacy-only |  | legacy-reader | tests of the legacy reader |
| 392 | `hooks/lib/__tests__/legacy-import.test.ts` | 102 | H | legacy-only |  | legacy-reader | tests of the legacy reader |
| 393 | `hooks/lib/__tests__/legacy-import.test.ts` | 103 | M | legacy-only |  | legacy-reader | tests of the legacy reader |
| 394 | `hooks/lib/__tests__/legacy-import.test.ts` | 119 | M | legacy-only |  | legacy-reader | tests of the legacy reader |
| 395 | `hooks/lib/__tests__/legacy-import.test.ts` | 131 | P | legacy-only |  | legacy-reader | tests of the legacy reader |
| 396 | `hooks/lib/__tests__/legacy-import.test.ts` | 136 | M | legacy-only |  | legacy-reader | tests of the legacy reader |
| 397 | `hooks/lib/__tests__/legacy-repair.test.ts` | 20 | M | legacy-only |  | legacy-reader | tests of the repair |
| 398 | `hooks/lib/__tests__/legacy-repair.test.ts` | 21 | M | legacy-only |  | legacy-reader | tests of the repair |
| 399 | `hooks/lib/__tests__/legacy-repair.test.ts` | 22 | M | legacy-only |  | legacy-reader | tests of the repair |
| 400 | `hooks/lib/__tests__/legacy-repair.test.ts` | 46 | P | legacy-only |  | legacy-reader | tests of the repair |
| 401 | `hooks/lib/__tests__/legacy-repair.test.ts` | 51 | M | legacy-only |  | legacy-reader | tests of the repair |
| 402 | `hooks/lib/__tests__/legacy-repair.test.ts` | 86 | H | legacy-only |  | legacy-reader | tests of the repair |
| 403 | `hooks/lib/__tests__/marker-format-lint.test.ts` | 9 | M | converted |  | name-grammar | underscore-versus-bracket filename form |
| 404 | `hooks/lib/__tests__/marker-format-lint.test.ts` | 161 | M | converted |  | name-grammar | underscore-versus-bracket filename form |
| 405 | `hooks/lib/__tests__/migrate.test.ts` | 24 | M | legacy-only |  | migrate | tests of `bin/fusion-migrate` |
| 406 | `hooks/lib/__tests__/migrate.test.ts` | 25 | M | legacy-only |  | migrate | tests of `bin/fusion-migrate` |
| 407 | `hooks/lib/__tests__/migrate.test.ts` | 26 | M | legacy-only |  | migrate | tests of `bin/fusion-migrate` |
| 408 | `hooks/lib/__tests__/migrate.test.ts` | 27 | M | legacy-only |  | migrate | tests of `bin/fusion-migrate` |
| 409 | `hooks/lib/__tests__/migrate.test.ts` | 28 | M | legacy-only |  | migrate | tests of `bin/fusion-migrate` |
| 410 | `hooks/lib/__tests__/migrate.test.ts` | 29 | M | legacy-only |  | migrate | tests of `bin/fusion-migrate` |
| 411 | `hooks/lib/__tests__/migrate.test.ts` | 47 | M | legacy-only |  | migrate | tests of `bin/fusion-migrate` |
| 412 | `hooks/lib/__tests__/migrate.test.ts` | 51 | M | legacy-only |  | migrate | tests of `bin/fusion-migrate` |
| 413 | `hooks/lib/__tests__/migrate.test.ts` | 100 | M | legacy-only |  | migrate | tests of `bin/fusion-migrate` |
| 414 | `hooks/lib/__tests__/migrate.test.ts` | 104 | H | legacy-only |  | migrate | tests of `bin/fusion-migrate` |
| 415 | `hooks/lib/__tests__/monitor-warnings-panel.test.ts` | 56 | M | other kind |  | history | citation of a historical issue |
| 416 | `hooks/lib/__tests__/path-literal-lint.test.ts` | 192 | M | converted |  | name-grammar | store-literal fixture |
| 417 | `hooks/lib/__tests__/plan-size.test.ts` | 73 | M | convert | 8 | legacy-branch | legacy-fixture cases and `markerOf` |
| 418 | `hooks/lib/__tests__/plan-size.test.ts` | 80 | M | convert | 8 | legacy-branch | legacy-fixture cases and `markerOf` |
| 419 | `hooks/lib/__tests__/plan-size.test.ts` | 85 | M | convert | 8 | legacy-branch | legacy-fixture cases and `markerOf` |
| 420 | `hooks/lib/__tests__/plan-size.test.ts` | 107 | M | convert | 8 | legacy-branch | legacy-fixture cases and `markerOf` |
| 421 | `hooks/lib/__tests__/plan-size.test.ts` | 127 | M | convert | 8 | legacy-branch | legacy-fixture cases and `markerOf` |
| 422 | `hooks/lib/__tests__/plan-size.test.ts` | 128 | M | convert | 8 | legacy-branch | legacy-fixture cases and `markerOf` |
| 423 | `hooks/lib/__tests__/plan-size.test.ts` | 129 | M | convert | 8 | legacy-branch | legacy-fixture cases and `markerOf` |
| 424 | `hooks/lib/__tests__/plan-size.test.ts` | 130 | M | convert | 8 | legacy-branch | legacy-fixture cases and `markerOf` |
| 425 | `hooks/lib/__tests__/plan-size.test.ts` | 131 | M | convert | 8 | legacy-branch | legacy-fixture cases and `markerOf` |
| 426 | `hooks/lib/__tests__/plan-size.test.ts` | 132 | M | convert | 8 | legacy-branch | legacy-fixture cases and `markerOf` |
| 427 | `hooks/lib/__tests__/plan-size.test.ts` | 138 | M | convert | 8 | legacy-branch | legacy-fixture cases and `markerOf` |
| 428 | `hooks/lib/__tests__/plan-size.test.ts` | 139 | M | convert | 8 | legacy-branch | legacy-fixture cases and `markerOf` |
| 429 | `hooks/lib/__tests__/plan-size.test.ts` | 147 | M | convert | 8 | legacy-branch | legacy-fixture cases and `markerOf` |
| 430 | `hooks/lib/__tests__/plan-size.test.ts` | 148 | M | convert | 8 | legacy-branch | legacy-fixture cases and `markerOf` |
| 431 | `hooks/lib/__tests__/plan-size.test.ts` | 149 | M | convert | 8 | legacy-branch | legacy-fixture cases and `markerOf` |
| 432 | `hooks/lib/__tests__/plan-size.test.ts` | 150 | M | convert | 8 | legacy-branch | legacy-fixture cases and `markerOf` |
| 433 | `hooks/lib/__tests__/plan-size.test.ts` | 161 | M | convert | 8 | legacy-branch | legacy-fixture cases and `markerOf` |
| 434 | `hooks/lib/__tests__/plan-size.test.ts` | 164 | M | converted |  | name-grammar | `isSpec` on either name form |
| 435 | `hooks/lib/__tests__/plan-size.test.ts` | 165 | M | converted |  | name-grammar | `isSpec` on either name form |
| 436 | `hooks/lib/__tests__/plan-size.test.ts` | 166 | M | converted |  | name-grammar | `isSpec` on either name form |
| 437 | `hooks/lib/__tests__/plan-size.test.ts` | 181 | M | converted |  | json | JSON case: a live `_c_` name is measured, a closed `_o_` one not |
| 438 | `hooks/lib/__tests__/plan-size.test.ts` | 183 | M | converted |  | json | JSON case: a live `_c_` name is measured, a closed `_o_` one not |
| 439 | `hooks/lib/__tests__/plan-size.test.ts` | 184 | M | converted |  | json | JSON case: a live `_c_` name is measured, a closed `_o_` one not |
| 440 | `hooks/lib/__tests__/plan-size.test.ts` | 191 | M | converted |  | json | JSON case: a live `_c_` name is measured, a closed `_o_` one not |
| 441 | `hooks/lib/__tests__/plan-stopping-section-lint.test.ts` | 31 | M | convert | 8 | live-predicate | own-tree lint: live plans by marker, its test-scoped `isSpec` strips only the marked form |
| 442 | `hooks/lib/__tests__/plan-stopping-section-lint.test.ts` | 32 | M | convert | 8 | live-predicate | own-tree lint: live plans by marker, its test-scoped `isSpec` strips only the marked form |
| 443 | `hooks/lib/__tests__/plan-stopping-section-lint.test.ts` | 57 | M | convert | 8 | live-predicate | own-tree lint: live plans by marker, its test-scoped `isSpec` strips only the marked form |
| 444 | `hooks/lib/__tests__/plan-stopping-section-lint.test.ts` | 58 | M | convert | 8 | live-predicate | own-tree lint: live plans by marker, its test-scoped `isSpec` strips only the marked form |
| 445 | `hooks/lib/__tests__/plan-stopping-section-lint.test.ts` | 64 | C | convert | 8 | live-predicate | own-tree lint: live plans by marker, its test-scoped `isSpec` strips only the marked form |
| 446 | `hooks/lib/__tests__/plan-stopping-section-lint.test.ts` | 71 | M | convert | 8 | live-predicate | own-tree lint: live plans by marker, its test-scoped `isSpec` strips only the marked form |
| 447 | `hooks/lib/__tests__/plan-stopping-section-lint.test.ts` | 82 | C | convert | 8 | live-predicate | own-tree lint: live plans by marker, its test-scoped `isSpec` strips only the marked form |
| 448 | `hooks/lib/__tests__/plan-stopping-section-lint.test.ts` | 167 | M | convert | 8 | live-predicate | own-tree lint: live plans by marker, its test-scoped `isSpec` strips only the marked form |
| 449 | `hooks/lib/__tests__/plan-stopping-section-lint.test.ts` | 237 | M | convert | 8 | live-predicate | own-tree lint: live plans by marker, its test-scoped `isSpec` strips only the marked form |
| 450 | `hooks/lib/__tests__/plan-stopping-section-lint.test.ts` | 238 | M | convert | 8 | live-predicate | own-tree lint: live plans by marker, its test-scoped `isSpec` strips only the marked form |
| 451 | `hooks/lib/__tests__/plan-stopping-section-lint.test.ts` | 244 | M | convert | 8 | live-predicate | own-tree lint: live plans by marker, its test-scoped `isSpec` strips only the marked form |
| 452 | `hooks/lib/__tests__/plan-stopping-section-lint.test.ts` | 245 | M | convert | 8 | live-predicate | own-tree lint: live plans by marker, its test-scoped `isSpec` strips only the marked form |
| 453 | `hooks/lib/__tests__/plan-stopping-section-lint.test.ts` | 248 | M | convert | 8 | live-predicate | own-tree lint: live plans by marker, its test-scoped `isSpec` strips only the marked form |
| 454 | `hooks/lib/__tests__/provenance-header-lint.test.ts` | 138 | M | converted |  | name-grammar | provenance citation-form fixtures |
| 455 | `hooks/lib/__tests__/provenance-header-lint.test.ts` | 268 | M | converted |  | name-grammar | provenance citation-form fixtures |
| 456 | `hooks/lib/__tests__/provenance-header-lint.test.ts` | 302 | M | other kind |  | jargon-example | fixture prose |
| 457 | `hooks/lib/__tests__/provenance-header-lint.test.ts` | 359 | M | converted |  | name-grammar | provenance citation-form fixtures |
| 458 | `hooks/lib/__tests__/provenance-header-lint.test.ts` | 361 | M | converted |  | name-grammar | provenance citation-form fixtures |
| 459 | `hooks/lib/__tests__/reference-resolution-lint.test.ts` | 134 | M | other kind |  | history | pin and re-approval log comments |
| 460 | `hooks/lib/__tests__/reference-resolution-lint.test.ts` | 267 | M | converted |  | name-grammar | citation-form fixtures and marker-to-wildcard normalisation |
| 461 | `hooks/lib/__tests__/reference-resolution-lint.test.ts` | 473 | H | other kind |  | history | pin and re-approval log comments |
| 462 | `hooks/lib/__tests__/reference-resolution-lint.test.ts` | 480 | H | other kind |  | history | pin and re-approval log comments |
| 463 | `hooks/lib/__tests__/reference-resolution-lint.test.ts` | 551 | C | converted |  | name-grammar | citation-form fixtures and marker-to-wildcard normalisation |
| 464 | `hooks/lib/__tests__/reference-resolution-lint.test.ts` | 553 | C | converted |  | name-grammar | citation-form fixtures and marker-to-wildcard normalisation |
| 465 | `hooks/lib/__tests__/reference-resolution-lint.test.ts` | 645 | M | converted |  | name-grammar | citation-form fixtures and marker-to-wildcard normalisation |
| 466 | `hooks/lib/__tests__/reference-resolution-lint.test.ts` | 792 | C | converted |  | name-grammar | citation-form fixtures and marker-to-wildcard normalisation |
| 467 | `hooks/lib/__tests__/reference-resolution-lint.test.ts` | 794 | C | converted |  | name-grammar | citation-form fixtures and marker-to-wildcard normalisation |
| 468 | `hooks/lib/__tests__/reference-resolution-lint.test.ts` | 796 | C | converted |  | name-grammar | citation-form fixtures and marker-to-wildcard normalisation |
| 469 | `hooks/lib/__tests__/reference-resolution-lint.test.ts` | 797 | C | converted |  | name-grammar | citation-form fixtures and marker-to-wildcard normalisation |
| 470 | `hooks/lib/__tests__/reference-resolution-lint.test.ts` | 816 | M | converted |  | name-grammar | citation-form fixtures and marker-to-wildcard normalisation |
| 471 | `hooks/lib/__tests__/reference-resolution-lint.test.ts` | 833 | M | converted |  | name-grammar | citation-form fixtures and marker-to-wildcard normalisation |
| 472 | `hooks/lib/__tests__/reference-resolution-lint.test.ts` | 845 | C | converted |  | name-grammar | citation-form fixtures and marker-to-wildcard normalisation |
| 473 | `hooks/lib/__tests__/reference-resolution-lint.test.ts` | 848 | C | converted |  | name-grammar | citation-form fixtures and marker-to-wildcard normalisation |
| 474 | `hooks/lib/__tests__/reference-resolution-lint.test.ts` | 871 | M | converted |  | name-grammar | citation-form fixtures and marker-to-wildcard normalisation |
| 475 | `hooks/lib/__tests__/reference-resolution-lint.test.ts` | 879 | M | converted |  | name-grammar | citation-form fixtures and marker-to-wildcard normalisation |
| 476 | `hooks/lib/__tests__/reference-resolution-lint.test.ts` | 881 | M | converted |  | name-grammar | citation-form fixtures and marker-to-wildcard normalisation |
| 477 | `hooks/lib/__tests__/review-coverage-mandate.test.ts` | 3 | M | other kind |  | history | citation of a historical issue |
| 478 | `hooks/lib/__tests__/review-coverage-mandate.test.ts` | 12 | M | other kind |  | history | citation of a historical issue |
| 479 | `hooks/lib/__tests__/rules-emission-golden.test.ts` | 30 | M | other kind |  | history | citation of a v11 plan |
| 480 | `hooks/lib/__tests__/rules-emission-golden.test.ts` | 281 | M | convert | ? | marker-rename | comment: the state-auditor's act is the `_o_ -> _a_` rename; no plan step names this file |
| 481 | `hooks/lib/__tests__/sentence-identifier-containment.test.ts` | 161 | M | converted |  | name-grammar | record-name fixtures |
| 482 | `hooks/lib/__tests__/sentence-identifier-containment.test.ts` | 196 | M | converted |  | name-grammar | record-name fixtures |
| 483 | `hooks/lib/__tests__/sentence-identifier-containment.test.ts` | 209 | M | converted |  | name-grammar | record-name fixtures |
| 484 | `hooks/lib/__tests__/sentence-identifier-containment.test.ts` | 255 | M | converted |  | name-grammar | record-name fixtures |
| 485 | `hooks/lib/__tests__/staging-drift.test.ts` | 34 | M | converted |  | name-grammar | path-classification fixtures |
| 486 | `hooks/lib/__tests__/staging-drift.test.ts` | 35 | M | other kind |  | jargon-example | fixture content of a retired `portfolio.md` |
| 487 | `hooks/lib/__tests__/staging-drift.test.ts` | 36 | M | converted |  | name-grammar | path-classification fixtures |
| 488 | `hooks/lib/__tests__/staging-drift.test.ts` | 44 | M | converted |  | name-grammar | path-classification fixtures |
| 489 | `hooks/lib/__tests__/staging-drift.test.ts` | 138 | M | converted |  | name-grammar | path-classification fixtures |
| 490 | `hooks/lib/__tests__/staging-drift.test.ts` | 185 | M | converted |  | name-grammar | path-classification fixtures |
| 491 | `hooks/lib/__tests__/staging-drift.test.ts` | 186 | M | converted |  | name-grammar | path-classification fixtures |
| 492 | `hooks/lib/__tests__/staging-drift.test.ts` | 379 | M | converted |  | name-grammar | path-classification fixtures |
| 493 | `hooks/lib/__tests__/staging-drift.test.ts` | 385 | M | converted |  | name-grammar | path-classification fixtures |
| 494 | `hooks/lib/__tests__/staging-drift.test.ts` | 622 | M | converted |  | name-grammar | path-classification fixtures |
| 495 | `hooks/lib/__tests__/staging-drift.test.ts` | 626 | M | converted |  | name-grammar | path-classification fixtures |
| 496 | `hooks/lib/__tests__/store-name-migration.test.ts` | 43 | M | legacy-only |  | migrate | tests of `/fusion:migrate` store rename |
| 497 | `hooks/lib/__tests__/store-name-migration.test.ts` | 44 | M | legacy-only |  | migrate | tests of `/fusion:migrate` store rename |
| 498 | `hooks/lib/__tests__/store-name-migration.test.ts` | 45 | M | legacy-only |  | migrate | tests of `/fusion:migrate` store rename |
| 499 | `hooks/lib/__tests__/store-name-migration.test.ts` | 62 | M | legacy-only |  | migrate | tests of `/fusion:migrate` store rename |
| 500 | `hooks/lib/__tests__/store-name-migration.test.ts` | 92 | M | legacy-only |  | migrate | tests of `/fusion:migrate` store rename |
| 501 | `hooks/lib/__tests__/store-name-migration.test.ts` | 94 | M | legacy-only |  | migrate | tests of `/fusion:migrate` store rename |
| 502 | `hooks/lib/__tests__/workbench-citation-lint.test.ts` | 202 | M | convert | 8 | live-predicate | own-tree lint: `inCorpus = isLiveRecord` and terminal-marker regexes over the tree |
| 503 | `hooks/lib/__tests__/workbench-citation-lint.test.ts` | 205 | M | convert | 8 | live-predicate | own-tree lint: `inCorpus = isLiveRecord` and terminal-marker regexes over the tree |
| 504 | `hooks/lib/__tests__/workbench-citation-lint.test.ts` | 216 | M | convert | 8 | live-predicate | own-tree lint: `inCorpus = isLiveRecord` and terminal-marker regexes over the tree |
| 505 | `hooks/lib/__tests__/workbench-citation-lint.test.ts` | 219 | C | convert | 8 | live-predicate | own-tree lint: `inCorpus = isLiveRecord` and terminal-marker regexes over the tree |
| 506 | `hooks/lib/__tests__/workbench-citation-lint.test.ts` | 250 | M | convert | 8 | live-predicate | own-tree lint: `inCorpus = isLiveRecord` and terminal-marker regexes over the tree |
| 507 | `hooks/lib/__tests__/workbench-citation-lint.test.ts` | 251 | M | convert | 8 | live-predicate | own-tree lint: `inCorpus = isLiveRecord` and terminal-marker regexes over the tree |
| 508 | `hooks/lib/__tests__/workbench-citation-lint.test.ts` | 252 | M | convert | 8 | live-predicate | own-tree lint: `inCorpus = isLiveRecord` and terminal-marker regexes over the tree |
| 509 | `hooks/lib/__tests__/workbench-citation-lint.test.ts` | 261 | M | convert | 8 | live-predicate | own-tree lint: `inCorpus = isLiveRecord` and terminal-marker regexes over the tree |
| 510 | `hooks/lib/__tests__/workbench-citation-lint.test.ts` | 262 | M | convert | 8 | live-predicate | own-tree lint: `inCorpus = isLiveRecord` and terminal-marker regexes over the tree |
| 511 | `hooks/lib/__tests__/workbench-citation-lint.test.ts` | 269 | M | convert | 8 | live-predicate | own-tree lint: `inCorpus = isLiveRecord` and terminal-marker regexes over the tree |
| 512 | `hooks/lib/__tests__/workbench-citation-lint.test.ts` | 270 | M | convert | 8 | live-predicate | own-tree lint: `inCorpus = isLiveRecord` and terminal-marker regexes over the tree |
| 513 | `hooks/lib/__tests__/workbench-citation-lint.test.ts` | 278 | C | convert | 8 | live-predicate | own-tree lint: `inCorpus = isLiveRecord` and terminal-marker regexes over the tree |
| 514 | `hooks/lib/__tests__/workbench-citation-lint.test.ts` | 303 | C | convert | 8 | live-predicate | own-tree lint: `inCorpus = isLiveRecord` and terminal-marker regexes over the tree |
| 515 | `hooks/lib/__tests__/workbench-citation-lint.test.ts` | 316 | C | converted |  | name-grammar | marker-normalised basename uniqueness |
| 516 | `hooks/lib/__tests__/workbench-citation-lint.test.ts` | 327 | C | converted |  | name-grammar | marker-normalised basename uniqueness |
| 517 | `hooks/lib/citation-corpus.ts` | 103 | M | convert | 8 | live-predicate | `isLiveRecord`, `OPEN_ISSUE_RE`, `LIVE_DECISION_RE`, `LIVE_PLAN_RE`, `CIRCLE_RECORD_RE` and their rationale |
| 518 | `hooks/lib/citation-corpus.ts` | 108 | M | convert | 8 | live-predicate | `isLiveRecord`, `OPEN_ISSUE_RE`, `LIVE_DECISION_RE`, `LIVE_PLAN_RE`, `CIRCLE_RECORD_RE` and their rationale |
| 519 | `hooks/lib/citation-corpus.ts` | 110 | M | convert | 8 | live-predicate | `isLiveRecord`, `OPEN_ISSUE_RE`, `LIVE_DECISION_RE`, `LIVE_PLAN_RE`, `CIRCLE_RECORD_RE` and their rationale |
| 520 | `hooks/lib/citation-corpus.ts` | 124 | M | convert | 8 | live-predicate | `isLiveRecord`, `OPEN_ISSUE_RE`, `LIVE_DECISION_RE`, `LIVE_PLAN_RE`, `CIRCLE_RECORD_RE` and their rationale |
| 521 | `hooks/lib/citation-corpus.ts` | 143 | C | convert | 8 | live-predicate | `isLiveRecord`, `OPEN_ISSUE_RE`, `LIVE_DECISION_RE`, `LIVE_PLAN_RE`, `CIRCLE_RECORD_RE` and their rationale |
| 522 | `hooks/lib/citation-corpus.ts` | 172 | H | convert | 8 | live-predicate | `isLiveRecord`, `OPEN_ISSUE_RE`, `LIVE_DECISION_RE`, `LIVE_PLAN_RE`, `CIRCLE_RECORD_RE` and their rationale |
| 523 | `hooks/lib/citation-corpus.ts` | 176 | M | convert | 8 | live-predicate | `isLiveRecord`, `OPEN_ISSUE_RE`, `LIVE_DECISION_RE`, `LIVE_PLAN_RE`, `CIRCLE_RECORD_RE` and their rationale |
| 524 | `hooks/lib/citation-corpus.ts` | 187 | M | convert | 8 | live-predicate | `isLiveRecord`, `OPEN_ISSUE_RE`, `LIVE_DECISION_RE`, `LIVE_PLAN_RE`, `CIRCLE_RECORD_RE` and their rationale |
| 525 | `hooks/lib/citation-corpus.ts` | 188 | M | convert | 8 | live-predicate | `isLiveRecord`, `OPEN_ISSUE_RE`, `LIVE_DECISION_RE`, `LIVE_PLAN_RE`, `CIRCLE_RECORD_RE` and their rationale |
| 526 | `hooks/lib/citation-corpus.ts` | 190 | M | convert | 8 | live-predicate | `isLiveRecord`, `OPEN_ISSUE_RE`, `LIVE_DECISION_RE`, `LIVE_PLAN_RE`, `CIRCLE_RECORD_RE` and their rationale |
| 527 | `hooks/lib/citation-corpus.ts` | 191 | C | convert | 8 | live-predicate | `isLiveRecord`, `OPEN_ISSUE_RE`, `LIVE_DECISION_RE`, `LIVE_PLAN_RE`, `CIRCLE_RECORD_RE` and their rationale |
| 528 | `hooks/lib/citation-corpus.ts` | 242 | M | convert | 8 | live-predicate | `isLiveRecord`, `OPEN_ISSUE_RE`, `LIVE_DECISION_RE`, `LIVE_PLAN_RE`, `CIRCLE_RECORD_RE` and their rationale |
| 529 | `hooks/lib/citation-corpus.ts` | 246 | M | convert | 8 | live-predicate | `isLiveRecord`, `OPEN_ISSUE_RE`, `LIVE_DECISION_RE`, `LIVE_PLAN_RE`, `CIRCLE_RECORD_RE` and their rationale |
| 530 | `hooks/lib/citation-corpus.ts` | 248 | M | convert | 8 | live-predicate | `isLiveRecord`, `OPEN_ISSUE_RE`, `LIVE_DECISION_RE`, `LIVE_PLAN_RE`, `CIRCLE_RECORD_RE` and their rationale |
| 531 | `hooks/lib/citation-corpus.ts` | 255 | M | convert | 8 | live-predicate | `isLiveRecord`, `OPEN_ISSUE_RE`, `LIVE_DECISION_RE`, `LIVE_PLAN_RE`, `CIRCLE_RECORD_RE` and their rationale |
| 532 | `hooks/lib/citation-corpus.ts` | 259 | M | convert | 8 | live-predicate | `isLiveRecord`, `OPEN_ISSUE_RE`, `LIVE_DECISION_RE`, `LIVE_PLAN_RE`, `CIRCLE_RECORD_RE` and their rationale |
| 533 | `hooks/lib/citation-corpus.ts` | 260 | M | convert | 8 | live-predicate | `isLiveRecord`, `OPEN_ISSUE_RE`, `LIVE_DECISION_RE`, `LIVE_PLAN_RE`, `CIRCLE_RECORD_RE` and their rationale |
| 534 | `hooks/lib/citation-corpus.ts` | 265 | C | convert | 8 | live-predicate | `isLiveRecord`, `OPEN_ISSUE_RE`, `LIVE_DECISION_RE`, `LIVE_PLAN_RE`, `CIRCLE_RECORD_RE` and their rationale |
| 535 | `hooks/lib/citation-scan.ts` | 84 | C | converted |  | name-grammar | citation scanner grammar (marker slot, truncation, wildcard) |
| 536 | `hooks/lib/citation-scan.ts` | 91 | M | converted |  | name-grammar | citation scanner grammar (marker slot, truncation, wildcard) |
| 537 | `hooks/lib/citation-scan.ts` | 97 | M | converted |  | name-grammar | citation scanner grammar (marker slot, truncation, wildcard) |
| 538 | `hooks/lib/citation-scan.ts` | 134 | H | converted |  | name-grammar | citation scanner grammar (marker slot, truncation, wildcard) |
| 539 | `hooks/lib/citation-scan.ts` | 149 | H | converted |  | name-grammar | citation scanner grammar (marker slot, truncation, wildcard) |
| 540 | `hooks/lib/citation-scan.ts` | 400 | M | converted |  | name-grammar | citation scanner grammar (marker slot, truncation, wildcard) |
| 541 | `hooks/lib/citation-scan.ts` | 465 | M | converted |  | name-grammar | citation scanner grammar (marker slot, truncation, wildcard) |
| 542 | `hooks/lib/citation-scan.ts` | 577 | C | converted |  | name-grammar | citation scanner grammar (marker slot, truncation, wildcard) |
| 543 | `hooks/lib/citation-scan.ts` | 590 | M | converted |  | name-grammar | citation scanner grammar (marker slot, truncation, wildcard) |
| 544 | `hooks/lib/citation-scan.ts` | 906 | C | converted |  | name-grammar | citation scanner grammar (marker slot, truncation, wildcard) |
| 545 | `hooks/lib/citation-scan.ts` | 1358 | M | converted |  | name-grammar | citation scanner grammar (marker slot, truncation, wildcard) |
| 546 | `hooks/lib/domain-cascade.ts` | 721 | M | other kind |  | jargon-example | comment: `_o_` spans as corpus noise for the domain detector |
| 547 | `hooks/lib/edge-answers.ts` | 17 | H | other kind |  | analysis-head | field label as the consequence group in policy-curator run files |
| 548 | `hooks/lib/legacy-import.ts` | 33 | M | legacy-only |  | legacy-reader | the legacy reader and mapping composer |
| 549 | `hooks/lib/legacy-import.ts` | 34 | H,M | legacy-only |  | legacy-reader | the legacy reader and mapping composer |
| 550 | `hooks/lib/legacy-import.ts` | 50 | M | legacy-only |  | legacy-reader | the legacy reader and mapping composer |
| 551 | `hooks/lib/legacy-import.ts` | 51 | H,M | legacy-only |  | legacy-reader | the legacy reader and mapping composer |
| 552 | `hooks/lib/legacy-import.ts` | 87 | H | legacy-only |  | legacy-reader | the legacy reader and mapping composer |
| 553 | `hooks/lib/legacy-import.ts` | 137 | H | legacy-only |  | legacy-reader | the legacy reader and mapping composer |
| 554 | `hooks/lib/legacy-import.ts` | 232 | C | legacy-only |  | legacy-reader | the legacy reader and mapping composer |
| 555 | `hooks/lib/legacy-import.ts` | 233 | C | legacy-only |  | legacy-reader | the legacy reader and mapping composer |
| 556 | `hooks/lib/legacy-import.ts` | 249 | P | legacy-only |  | legacy-reader | the legacy reader and mapping composer |
| 557 | `hooks/lib/legacy-import.ts` | 252 | Hs | legacy-only |  | legacy-reader | the legacy reader and mapping composer |
| 558 | `hooks/lib/legacy-import.ts` | 254 | P | legacy-only |  | legacy-reader | the legacy reader and mapping composer |
| 559 | `hooks/lib/legacy-import.ts` | 255 | C | legacy-only |  | legacy-reader | the legacy reader and mapping composer |
| 560 | `hooks/lib/legacy-import.ts` | 374 | P | legacy-only |  | legacy-reader | the legacy reader and mapping composer |
| 561 | `hooks/lib/legacy-import.ts` | 455 | Hs | legacy-only |  | legacy-reader | the legacy reader and mapping composer |
| 562 | `hooks/lib/legacy-import.ts` | 458 | Hs,M | legacy-only |  | legacy-reader | the legacy reader and mapping composer |
| 563 | `hooks/lib/legacy-import.ts` | 460 | Hs | legacy-only |  | legacy-reader | the legacy reader and mapping composer |
| 564 | `hooks/lib/legacy-import.ts` | 462 | Hs | legacy-only |  | legacy-reader | the legacy reader and mapping composer |
| 565 | `hooks/lib/legacy-import.ts` | 464 | H | legacy-only |  | legacy-reader | the legacy reader and mapping composer |
| 566 | `hooks/lib/legacy-import.ts` | 519 | Hs | legacy-only |  | legacy-reader | the legacy reader and mapping composer |
| 567 | `hooks/lib/legacy-import.ts` | 522 | H | legacy-only |  | legacy-reader | the legacy reader and mapping composer |
| 568 | `hooks/lib/legacy-import.ts` | 575 | H | legacy-only |  | legacy-reader | the legacy reader and mapping composer |
| 569 | `hooks/lib/legacy-import.ts` | 587 | Hs | legacy-only |  | legacy-reader | the legacy reader and mapping composer |
| 570 | `hooks/lib/legacy-import.ts` | 602 | C | legacy-only |  | legacy-reader | the legacy reader and mapping composer |
| 571 | `hooks/lib/legacy-import.ts` | 627 | Hs | legacy-only |  | legacy-reader | the legacy reader and mapping composer |
| 572 | `hooks/lib/legacy-import.ts` | 713 | Hs | legacy-only |  | legacy-reader | the legacy reader and mapping composer |
| 573 | `hooks/lib/legacy-import.ts` | 716 | H | legacy-only |  | legacy-reader | the legacy reader and mapping composer |
| 574 | `hooks/lib/legacy-import.ts` | 718 | Hs | legacy-only |  | legacy-reader | the legacy reader and mapping composer |
| 575 | `hooks/lib/legacy-import.ts` | 728 | H | legacy-only |  | legacy-reader | the legacy reader and mapping composer |
| 576 | `hooks/lib/legacy-import.ts` | 759 | M | legacy-only |  | legacy-reader | the legacy reader and mapping composer |
| 577 | `hooks/lib/legacy-repair.ts` | 112 | P | legacy-only |  | legacy-reader | the consented repair |
| 578 | `hooks/lib/legacy-repair.ts` | 133 | Hs | legacy-only |  | legacy-reader | the consented repair |
| 579 | `hooks/lib/legacy-repair.ts` | 137 | C | legacy-only |  | legacy-reader | the consented repair |
| 580 | `hooks/lib/legacy-repair.ts` | 141 | C | legacy-only |  | legacy-reader | the consented repair |
| 581 | `hooks/lib/legacy-repair.ts` | 143 | Hs | legacy-only |  | legacy-reader | the consented repair |
| 582 | `hooks/lib/legacy-repair.ts` | 226 | C | legacy-only |  | legacy-reader | the consented repair |
| 583 | `hooks/lib/legacy-repair.ts` | 234 | P | legacy-only |  | legacy-reader | the consented repair |
| 584 | `hooks/lib/legacy-repair.ts` | 241 | P | legacy-only |  | legacy-reader | the consented repair |
| 585 | `hooks/lib/legacy-repair.ts` | 283 | Hs | legacy-only |  | legacy-reader | the consented repair |
| 586 | `hooks/lib/legacy-repair.ts` | 296 | Hs | legacy-only |  | legacy-reader | the consented repair |
| 587 | `hooks/lib/legacy-repair.ts` | 309 | H | legacy-only |  | legacy-reader | the consented repair |
| 588 | `hooks/lib/legacy-repair.ts` | 313 | Hs | legacy-only |  | legacy-reader | the consented repair |
| 589 | `hooks/lib/legacy-repair.ts` | 314 | H | legacy-only |  | legacy-reader | the consented repair |
| 590 | `hooks/lib/legacy-repair.ts` | 315 | H | legacy-only |  | legacy-reader | the consented repair |
| 591 | `hooks/lib/plan-size.ts` | 42 | M | convert | 8 | live-predicate | legacy liveness by marker (`markerOf`, `LIVE_MARKERS`) |
| 592 | `hooks/lib/plan-size.ts` | 47 | M | converted |  | json | the JSON branch: a marker in a name decides nothing |
| 593 | `hooks/lib/plan-size.ts` | 48 | M | converted |  | json | the JSON branch: a marker in a name decides nothing |
| 594 | `hooks/lib/plan-size.ts` | 98 | C | convert | 8 | live-predicate | legacy liveness by marker (`markerOf`, `LIVE_MARKERS`) |
| 595 | `hooks/lib/plan-size.ts` | 109 | C | converted |  | name-grammar | `isSpec` strips either name form |
| 596 | `hooks/lib/scope.ts` | 9 | H | converted |  | json | states that nothing here reads `**Status:**`/`**Claim:**` |
| 597 | `hooks/lib/work-graph.ts` | 8 | H | converted |  | json | states that nothing here reads `**Status:**`/`**Depends-on:**` |
| 598 | `hooks/lib/work-graph.ts` | 9 | H | converted |  | json | states that nothing here reads `**Status:**`/`**Depends-on:**` |
| 599 | `hooks/plan-size.ts` | 30 | M | convert | 8 | marker-state | header example output names marker-live plans under a v11 store |
| 600 | `hooks/plan-size.ts` | 31 | M | convert | 8 | marker-state | header example output names marker-live plans under a v11 store |
| 601 | `hooks/staging-drift.ts` | 23 | M | converted |  | name-grammar | header example: a legacy Circle path classified as a record row; no state read |
| 602 | `rules/commit-lock.md` | 88 | M | other kind |  | history | measured incident narrative, no procedure |
| 603 | `rules/context-manifest.md` | 120 | H | convert | 4 | head-field | states the claim criterion as `**Status:**`/`**Claim:**` (same defect as issue 260930-1219) |
| 604 | `rules/context-manifest.md` | 121 | H | convert | 4 | head-field | states the claim criterion as `**Status:**`/`**Claim:**` (same defect as issue 260930-1219) |
| 605 | `rules/decision-record-examples.md` | 5 | M | convert | 4 | marker-rename | worked transitions as renames |
| 606 | `rules/decision-record-examples.md` | 9 | M | convert | 4 | marker-rename | worked transitions as renames |
| 607 | `rules/decision-record-examples.md` | 13 | M | convert | 4 | marker-rename | worked transitions as renames |
| 608 | `rules/decision-record-examples.md` | 47 | M | convert | 4 | marker-rename | worked transitions as renames |
| 609 | `rules/decision-record-examples.md` | 58 | M | convert | 4 | marker-rename | worked transitions as renames |
| 610 | `rules/decision-record-examples.md` | 69 | M | convert | 4 | marker-rename | worked transitions as renames |
| 611 | `rules/decision-record-examples.md` | 73 | M | convert | 4 | marker-rename | worked transitions as renames |
| 612 | `rules/decision-record-examples.md` | 77 | M | convert | 4 | marker-rename | worked transitions as renames |
| 613 | `rules/decision-record-examples.md` | 81 | M | convert | 4 | marker-rename | worked transitions as renames |
| 614 | `rules/decision-record-examples.md` | 88 | M | convert | 4 | marker-rename | worked transitions as renames |
| 615 | `rules/decision-record-examples.md` | 90 | M | convert | 4 | marker-rename | worked transitions as renames |
| 616 | `rules/decision-record-examples.md` | 94 | M | convert | 4 | marker-rename | worked transitions as renames |
| 617 | `rules/decision-record-examples.md` | 98 | M | convert | 4 | marker-rename | worked transitions as renames |
| 618 | `rules/decision-record-examples.md` | 105 | M | convert | 4 | marker-rename | worked transitions as renames |
| 619 | `rules/decision-record-examples.md` | 107 | M | convert | 4 | marker-rename | worked transitions as renames |
| 620 | `rules/decision-record-examples.md` | 113 | M | convert | 4 | marker-rename | worked transitions as renames |
| 621 | `rules/decision-record-examples.md` | 116 | M | convert | 4 | marker-rename | worked transitions as renames |
| 622 | `rules/fusion-workbench-conventions.md` | 87 | H | convert | 3 | grammar-definition | the Markdown control grammar's definition; step 3 rewrites each named section |
| 623 | `rules/fusion-workbench-conventions.md` | 135 | H | convert | 3 | grammar-definition | the Markdown control grammar's definition; step 3 rewrites each named section |
| 624 | `rules/fusion-workbench-conventions.md` | 190 | H | convert | 3 | grammar-definition | the Markdown control grammar's definition; step 3 rewrites each named section |
| 625 | `rules/fusion-workbench-conventions.md` | 191 | H | convert | 3 | grammar-definition | the Markdown control grammar's definition; step 3 rewrites each named section |
| 626 | `rules/fusion-workbench-conventions.md` | 192 | H | convert | 3 | grammar-definition | the Markdown control grammar's definition; step 3 rewrites each named section |
| 627 | `rules/fusion-workbench-conventions.md` | 193 | H | convert | 3 | grammar-definition | the Markdown control grammar's definition; step 3 rewrites each named section |
| 628 | `rules/fusion-workbench-conventions.md` | 194 | H | convert | 3 | grammar-definition | the Markdown control grammar's definition; step 3 rewrites each named section |
| 629 | `rules/fusion-workbench-conventions.md` | 205 | H | convert | 3 | grammar-definition | the Markdown control grammar's definition; step 3 rewrites each named section |
| 630 | `rules/fusion-workbench-conventions.md` | 207 | H | convert | 3 | grammar-definition | the Markdown control grammar's definition; step 3 rewrites each named section |
| 631 | `rules/fusion-workbench-conventions.md` | 209 | H | convert | 3 | grammar-definition | the Markdown control grammar's definition; step 3 rewrites each named section |
| 632 | `rules/fusion-workbench-conventions.md` | 211 | H | convert | 3 | grammar-definition | the Markdown control grammar's definition; step 3 rewrites each named section |
| 633 | `rules/fusion-workbench-conventions.md` | 219 | M | convert | 3 | grammar-definition | the Markdown control grammar's definition; step 3 rewrites each named section |
| 634 | `rules/fusion-workbench-conventions.md` | 221 | H | convert | 3 | grammar-definition | the Markdown control grammar's definition; step 3 rewrites each named section |
| 635 | `rules/fusion-workbench-conventions.md` | 225 | H | convert | 3 | grammar-definition | the Markdown control grammar's definition; step 3 rewrites each named section |
| 636 | `rules/fusion-workbench-conventions.md` | 229 | H | convert | 3 | grammar-definition | the Markdown control grammar's definition; step 3 rewrites each named section |
| 637 | `rules/fusion-workbench-conventions.md` | 233 | H | convert | 3 | grammar-definition | the Markdown control grammar's definition; step 3 rewrites each named section |
| 638 | `rules/fusion-workbench-conventions.md` | 272 | H | convert | 3 | grammar-definition | the Markdown control grammar's definition; step 3 rewrites each named section |
| 639 | `rules/fusion-workbench-conventions.md` | 276 | M | convert | 3 | grammar-definition | the Markdown control grammar's definition; step 3 rewrites each named section |
| 640 | `rules/fusion-workbench-conventions.md` | 284 | M | convert | 3 | grammar-definition | the Markdown control grammar's definition; step 3 rewrites each named section |
| 641 | `rules/fusion-workbench-conventions.md` | 288 | H | convert | 3 | grammar-definition | the Markdown control grammar's definition; step 3 rewrites each named section |
| 642 | `rules/fusion-workbench-conventions.md` | 310 | M | convert | 3 | grammar-definition | the Markdown control grammar's definition; step 3 rewrites each named section |
| 643 | `rules/fusion-workbench-conventions.md` | 311 | M | convert | 3 | grammar-definition | the Markdown control grammar's definition; step 3 rewrites each named section |
| 644 | `rules/fusion-workbench-conventions.md` | 312 | M | convert | 3 | grammar-definition | the Markdown control grammar's definition; step 3 rewrites each named section |
| 645 | `rules/fusion-workbench-conventions.md` | 313 | M | convert | 3 | grammar-definition | the Markdown control grammar's definition; step 3 rewrites each named section |
| 646 | `rules/fusion-workbench-conventions.md` | 315 | M | convert | 3 | grammar-definition | the Markdown control grammar's definition; step 3 rewrites each named section |
| 647 | `rules/fusion-workbench-conventions.md` | 316 | M | convert | 3 | grammar-definition | the Markdown control grammar's definition; step 3 rewrites each named section |
| 648 | `rules/fusion-workbench-conventions.md` | 317 | M | convert | 3 | grammar-definition | the Markdown control grammar's definition; step 3 rewrites each named section |
| 649 | `rules/fusion-workbench-conventions.md` | 318 | M | convert | 3 | grammar-definition | the Markdown control grammar's definition; step 3 rewrites each named section |
| 650 | `rules/fusion-workbench-conventions.md` | 319 | M | convert | 3 | grammar-definition | the Markdown control grammar's definition; step 3 rewrites each named section |
| 651 | `rules/fusion-workbench-conventions.md` | 330 | M | convert | 3 | grammar-definition | the Markdown control grammar's definition; step 3 rewrites each named section |
| 652 | `rules/fusion-workbench-conventions.md` | 331 | M | convert | 3 | grammar-definition | the Markdown control grammar's definition; step 3 rewrites each named section |
| 653 | `rules/fusion-workbench-conventions.md` | 332 | M | convert | 3 | grammar-definition | the Markdown control grammar's definition; step 3 rewrites each named section |
| 654 | `rules/fusion-workbench-conventions.md` | 333 | M | convert | 3 | grammar-definition | the Markdown control grammar's definition; step 3 rewrites each named section |
| 655 | `rules/fusion-workbench-conventions.md` | 334 | M | convert | 3 | grammar-definition | the Markdown control grammar's definition; step 3 rewrites each named section |
| 656 | `rules/fusion-workbench-conventions.md` | 338 | M | convert | 3 | grammar-definition | the Markdown control grammar's definition; step 3 rewrites each named section |
| 657 | `rules/fusion-workbench-conventions.md` | 344 | M | convert | 3 | grammar-definition | the Markdown control grammar's definition; step 3 rewrites each named section |
| 658 | `rules/fusion-workbench-conventions.md` | 345 | M | convert | 3 | grammar-definition | the Markdown control grammar's definition; step 3 rewrites each named section |
| 659 | `rules/fusion-workbench-conventions.md` | 347 | M | convert | 3 | grammar-definition | the Markdown control grammar's definition; step 3 rewrites each named section |
| 660 | `rules/fusion-workbench-conventions.md` | 351 | M | convert | 3 | grammar-definition | the Markdown control grammar's definition; step 3 rewrites each named section |
| 661 | `rules/fusion-workbench-conventions.md` | 357 | M | convert | 3 | grammar-definition | the Markdown control grammar's definition; step 3 rewrites each named section |
| 662 | `rules/fusion-workbench-conventions.md` | 358 | C | convert | 3 | grammar-definition | the Markdown control grammar's definition; step 3 rewrites each named section |
| 663 | `rules/fusion-workbench-conventions.md` | 362 | M | convert | 3 | grammar-definition | the Markdown control grammar's definition; step 3 rewrites each named section |
| 664 | `rules/fusion-workbench-conventions.md` | 364 | H,M | convert | 3 | grammar-definition | the Markdown control grammar's definition; step 3 rewrites each named section |
| 665 | `rules/fusion-workbench-conventions.md` | 370 | M | convert | 3 | grammar-definition | the Markdown control grammar's definition; step 3 rewrites each named section |
| 666 | `rules/fusion-workbench-conventions.md` | 380 | P | convert | 3 | grammar-definition | the Markdown control grammar's definition; step 3 rewrites each named section |
| 667 | `rules/fusion-workbench-conventions.md` | 381 | P | convert | 3 | grammar-definition | the Markdown control grammar's definition; step 3 rewrites each named section |
| 668 | `rules/fusion-workbench-conventions.md` | 382 | P | convert | 3 | grammar-definition | the Markdown control grammar's definition; step 3 rewrites each named section |
| 669 | `rules/fusion-workbench-conventions.md` | 383 | P | convert | 3 | grammar-definition | the Markdown control grammar's definition; step 3 rewrites each named section |
| 670 | `rules/fusion-workbench-conventions.md` | 384 | H,M,P | convert | 3 | grammar-definition | the Markdown control grammar's definition; step 3 rewrites each named section |
| 671 | `rules/fusion-workbench-conventions.md` | 393 | M | convert | 3 | grammar-definition | the Markdown control grammar's definition; step 3 rewrites each named section |
| 672 | `rules/fusion-workbench-conventions.md` | 400 | M | convert | 3 | grammar-definition | the Markdown control grammar's definition; step 3 rewrites each named section |
| 673 | `rules/fusion-workbench-conventions.md` | 410 | M | convert | 3 | grammar-definition | the Markdown control grammar's definition; step 3 rewrites each named section |
| 674 | `rules/fusion-workbench-conventions.md` | 416 | M | convert | 3 | grammar-definition | the Markdown control grammar's definition; step 3 rewrites each named section |
| 675 | `rules/fusion-workbench-conventions.md` | 422 | M | convert | 3 | grammar-definition | the Markdown control grammar's definition; step 3 rewrites each named section |
| 676 | `rules/fusion-workbench-conventions.md` | 428 | M | convert | 3 | grammar-definition | the Markdown control grammar's definition; step 3 rewrites each named section |
| 677 | `rules/fusion-workbench-conventions.md` | 435 | M | convert | 3 | grammar-definition | the Markdown control grammar's definition; step 3 rewrites each named section |
| 678 | `rules/fusion-workbench-conventions.md` | 436 | M | convert | 3 | grammar-definition | the Markdown control grammar's definition; step 3 rewrites each named section |
| 679 | `rules/fusion-workbench-conventions.md` | 437 | M | convert | 3 | grammar-definition | the Markdown control grammar's definition; step 3 rewrites each named section |
| 680 | `rules/fusion-workbench-conventions.md` | 473 | M | convert | 3 | grammar-definition | the Markdown control grammar's definition; step 3 rewrites each named section |
| 681 | `rules/fusion-workbench-conventions.md` | 479 | M | convert | 3 | grammar-definition | the Markdown control grammar's definition; step 3 rewrites each named section |
| 682 | `rules/fusion-workbench-conventions.md` | 505 | H | convert | 3 | grammar-definition | the Markdown control grammar's definition; step 3 rewrites each named section |
| 683 | `rules/fusion-workbench-conventions.md` | 509 | M | convert | 3 | grammar-definition | the Markdown control grammar's definition; step 3 rewrites each named section |
| 684 | `rules/orchestrator-rebalance.md` | 37 | M | convert | 4 | marker-rename | Revise Evidence base files an `_o_` decision and renames `_i_` -> `_s_` |
| 685 | `rules/orchestrator-rebalance.md` | 58 | M | convert | 4 | marker-rename | Revise Evidence base files an `_o_` decision and renames `_i_` -> `_s_` |
| 686 | `rules/orchestrator-rebalance.md` | 59 | M | convert | 4 | marker-rename | Revise Evidence base files an `_o_` decision and renames `_i_` -> `_s_` |
| 687 | `rules/orchestrator-rebalance.md` | 65 | H | convert | 4 | head-field | history file `**Status:**` write (issue 260929-1810 item 5) |
| 688 | `rules/rule-file-provenance.md` | 33 | M | convert | 4 | marker-state/head-field | argues from markers moving with a record's life and from a package's `**Status:**` field |
| 689 | `rules/rule-file-provenance.md` | 34 | H | convert | 4 | marker-state/head-field | argues from markers moving with a record's life and from a package's `**Status:**` field |
| 690 | `rules/user-facing-output.md` | 44 | M | other kind |  | jargon-example | names `_o_`/`_t_` as tokens not to show a user; reads and writes no state |
| 691 | `rules/workbench-tracking.md` | 26 | H | convert | 4 | head-field | per-checkout half of a container is the `**Claim:**` field; step 4 rewrites this rule |
| 692 | `rules/workbench-tracking.md` | 32 | H | convert | 4 | head-field | per-checkout half of a container is the `**Claim:**` field; step 4 rewrites this rule |
| 693 | `skills/archive/SKILL.md` | 69 | H,M | convert | 7 | legacy-branch | tier tables and walks select by marker and `**Status:**`; the body JSON replaces at Step 3 but keeps for a legacy workbench |
| 694 | `skills/archive/SKILL.md` | 84 | M | convert | 7 | legacy-branch | tier tables and walks select by marker and `**Status:**`; the body JSON replaces at Step 3 but keeps for a legacy workbench |
| 695 | `skills/archive/SKILL.md` | 85 | M | convert | 7 | legacy-branch | tier tables and walks select by marker and `**Status:**`; the body JSON replaces at Step 3 but keeps for a legacy workbench |
| 696 | `skills/archive/SKILL.md` | 86 | H | convert | 7 | legacy-branch | tier tables and walks select by marker and `**Status:**`; the body JSON replaces at Step 3 but keeps for a legacy workbench |
| 697 | `skills/archive/SKILL.md` | 87 | M | convert | 7 | legacy-branch | tier tables and walks select by marker and `**Status:**`; the body JSON replaces at Step 3 but keeps for a legacy workbench |
| 698 | `skills/archive/SKILL.md` | 88 | H,M | convert | 7 | legacy-branch | tier tables and walks select by marker and `**Status:**`; the body JSON replaces at Step 3 but keeps for a legacy workbench |
| 699 | `skills/archive/SKILL.md` | 106 | M | convert | 7 | legacy-branch | tier tables and walks select by marker and `**Status:**`; the body JSON replaces at Step 3 but keeps for a legacy workbench |
| 700 | `skills/archive/SKILL.md` | 107 | M | convert | 7 | legacy-branch | tier tables and walks select by marker and `**Status:**`; the body JSON replaces at Step 3 but keeps for a legacy workbench |
| 701 | `skills/archive/SKILL.md` | 108 | M | convert | 7 | legacy-branch | tier tables and walks select by marker and `**Status:**`; the body JSON replaces at Step 3 but keeps for a legacy workbench |
| 702 | `skills/archive/SKILL.md` | 109 | M | convert | 7 | legacy-branch | tier tables and walks select by marker and `**Status:**`; the body JSON replaces at Step 3 but keeps for a legacy workbench |
| 703 | `skills/archive/SKILL.md` | 110 | H | convert | 7 | legacy-branch | tier tables and walks select by marker and `**Status:**`; the body JSON replaces at Step 3 but keeps for a legacy workbench |
| 704 | `skills/archive/SKILL.md` | 148 | He,C | convert | 7 | legacy-branch | tier tables and walks select by marker and `**Status:**`; the body JSON replaces at Step 3 but keeps for a legacy workbench |
| 705 | `skills/archive/SKILL.md` | 153 | H | convert | 7 | legacy-branch | tier tables and walks select by marker and `**Status:**`; the body JSON replaces at Step 3 but keeps for a legacy workbench |
| 706 | `skills/archive/SKILL.md` | 155 | H | convert | 7 | legacy-branch | tier tables and walks select by marker and `**Status:**`; the body JSON replaces at Step 3 but keeps for a legacy workbench |
| 707 | `skills/archive/SKILL.md` | 158 | He | convert | 7 | legacy-branch | tier tables and walks select by marker and `**Status:**`; the body JSON replaces at Step 3 but keeps for a legacy workbench |
| 708 | `skills/archive/SKILL.md` | 161 | H | convert | 7 | legacy-branch | tier tables and walks select by marker and `**Status:**`; the body JSON replaces at Step 3 but keeps for a legacy workbench |
| 709 | `skills/archive/SKILL.md` | 174 | C | converted |  | name-grammar | filter-3 citation key: marker position wildcarded so old and new citations match |
| 710 | `skills/archive/SKILL.md` | 225 | H | other kind |  | homonym | `**Mode:**` line of the archive MANIFEST |
| 711 | `skills/check/SKILL.md` | 239 | H | convert | 7 | head-field | says a package's `**Claim:**` names its checkout |
| 712 | `skills/curate/SKILL.md` | 39 | H | other kind |  | homonym | `**Mode:** survey\|apply` dispatch parameter |
| 713 | `skills/curate/SKILL.md` | 92 | H | other kind |  | homonym | `**Mode:** survey\|apply` dispatch parameter |
| 714 | `skills/discuss/SKILL.md` | 91 | M | convert | 7 | legacy-branch | legacy body: `_o_` filename and the `_o_` -> `_c_` rename; JSON paragraphs sit beside it |
| 715 | `skills/discuss/SKILL.md` | 94 | M | convert | 7 | legacy-branch | legacy body: `_o_` filename and the `_o_` -> `_c_` rename; JSON paragraphs sit beside it |
| 716 | `skills/discuss/SKILL.md` | 195 | M | convert | 7 | legacy-branch | legacy body: `_o_` filename and the `_o_` -> `_c_` rename; JSON paragraphs sit beside it |
| 717 | `skills/migrate/SKILL.md` | 20 | M | legacy-only |  | migrate | /fusion:migrate survey recognising older layouts |
| 718 | `skills/migrate/SKILL.md` | 58 | C | legacy-only |  | migrate | /fusion:migrate survey recognising older layouts |
| 719 | `skills/wp-order/SKILL.md` | 13 | H | convert | 7 | head-field | locates the conventions paragraph by the `**Depends-on:**` field name, which step 3 rewrites |
| 720 | `skills/wp/SKILL.md` | 33 | H | convert | 7 | legacy-branch | legacy flow writes `**Status:** open` and the head block; the JSON section files through `create` |
| 721 | `skills/wp/SKILL.md` | 43 | H | convert | 7 | legacy-branch | legacy flow writes `**Status:** open` and the head block; the JSON section files through `create` |
| 722 | `skills/wp/SKILL.md` | 52 | H | convert | 7 | legacy-branch | legacy flow writes `**Status:** open` and the head block; the JSON section files through `create` |
| 723 | `skills/wp/SKILL.md` | 59 | H | convert | 7 | legacy-branch | legacy flow writes `**Status:** open` and the head block; the JSON section files through `create` |
