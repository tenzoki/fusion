# Analysis: FJ03d step 10, the per-hit classification table at the side branch head

**Date:** 2026-10-05 10:16
**Type:** Impact
**Status:** Complete
**Requested by:** orchestrator
**Cross-references:** 261005-1016-fj03d-step10-classification-re-run-at-the-side-branch-head.md, 261005-0504-fj03d-step2-classification-per-hit-table.md, 261004-2212_*_plan-fj03d-rules-prompts-and-live-predicates-switched-with-this-workbench-in-one-window.md

Sibling of `261005-1016-fj03d-step10-classification-re-run-at-the-side-branch-head.md`, which holds the command, the class rules, the totals and the findings. This file holds the classifier's rule list and one row per line of the command's output at `fj03d` `29dac3c5`, in output order. The hit text is not reproduced, so that no record name inside a quoted line becomes a citation token here; re-run the command to read it.

Patterns column: `H` bold head field, `He` escaped head field, `Hs` quoted head-field key, `M` marker literal, `C` marker class in a glob or regex, `P` progress mark. The column **Step-2 row** gives the class and basis of the step-2 row with the same file and the same line text, `no step-2 row` where the base has none, and `unchanged file` where the file's blob is identical at `84047ad7` and `29dac3c5`. It is shown for comparison only; no class was taken from it.

## The rule list

One rule per file and line set. A rule naming lines overrides the file's `all hits` rule. `codec/src/` is a directory rule. The classifier halts when a hit matches no rule or several, and when a rule names a line that is no hit; it completed with 433 rows.

| # | File | Lines | Class | Basis | Reason |
|---|---|---|---|---|---|
| 1 | `agents/analyst.md` | 165, 232 | other kind | `analysis-head` | `**Status:**` of an analysis report or snapshot template, a report kind with no control file |
| 2 | `agents/consultant.md` | 102 | other kind | `analysis-head` | `**Status:**` of a consultation report template |
| 3 | `agents/orchestrator.md` | 372, 438, 568 | other kind | `kept-gate-string` | the fixed event-log detail `answered by **Mode:** autonomous`; the state it reports is read from `mode` in JSON (ruling c) |
| 4 | `agents/orchestrator.md` | 601 | other kind | `kept-gate-string` | the same fixed detail string; the line also carries the `**Mode:** apply` dispatch-parameter homonym |
| 5 | `agents/orchestrator.md` | 487 | other kind | `history` | anecdote of a past commit (three marked records left HEAD); names no procedure |
| 6 | `agents/policy-curator.md` | 264, 373, 386 | other kind | `homonym` | `**Mode:** survey\|apply` is the policy-curator's dispatch parameter |
| 7 | `agents/policy-curator.md` | 414 | other kind | `analysis-head` | `**Status:**` of the policy-curator run file |
| 8 | `rules/commit-lock.md` | all hits | other kind | `history` | measured incident narrative, no procedure |
| 9 | `rules/fusion-workbench-conventions.md` | 287, 322, 340 | converted | `json` | describes the legacy letters inside the converted rule and says they are not read for state (ruling b) |
| 10 | `rules/user-facing-output.md` | all hits | other kind | `jargon-example` | names marker tokens as jargon not to show a user |
| 11 | `skills/archive/SKILL.md` | 151 | converted | `name-grammar` | filter-3 citation key: marker slot wildcarded |
| 12 | `skills/archive/SKILL.md` | 202 | other kind | `homonym` | `**Mode:**` line of the archive MANIFEST |
| 13 | `skills/curate/SKILL.md` | all hits | other kind | `homonym` | `**Mode:** survey\|apply` dispatch parameter |
| 14 | `skills/migrate/SKILL.md` | all hits | legacy-only | `migrate` | /fusion:migrate survey recognising older layouts |
| 15 | `docs/upgrading-to-v10-2.md` | all hits | legacy-only | `upgrade-note` | historical upgrade note |
| 16 | `docs/upgrading-to-v10-3.md` | all hits | legacy-only | `upgrade-note` | historical upgrade note |
| 17 | `docs/upgrading-to-v10-4.md` | all hits | legacy-only | `upgrade-note` | historical upgrade note |
| 18 | `docs/upgrading-to-v10-6.md` | all hits | legacy-only | `upgrade-note` | historical upgrade note |
| 19 | `docs/upgrading-to-v11.md` | all hits | legacy-only | `upgrade-note` | historical upgrade note |
| 20 | `docs/upgrading-to-v13.md` | 21, 22, 23 | converted | `json` | table row: the legacy form beside the JSON field that replaces it (ruling b) |
| 21 | `README.md` | 34, 52, 54 | legacy-only | `upgrade-note` | `Upgrading from v10.x / v11` paragraphs |
| 22 | `README.md` | 176 | converted | `json` | says an old name keeps its marker and the letter is never read for state (ruling b) |
| 23 | `README-agents.md` | 64, 65, 66 | other kind | `homonym` | dispatch-parameter roster rows for the policy-curator's `**Mode:**` |
| 24 | `README-agents.md` | 72 | other kind | `history` | the v11 removal of the shaper's dispatch rows |
| 25 | `README-hooks.md` | 262, 263 | legacy-only | `legacy-reader` | roster rows of `lib/legacy-import.ts` and `lib/legacy-repair.ts` |
| 26 | `README-hooks.md` | 594, 694, 790, 820 | other kind | `history` | growth-bound log entries |
| 27 | `codec/README.md` | all hits | other kind | `codec-contract` | the codec's reconcile `narratives` finding |
| 28 | `codec/src/` | all hits | other kind | `codec-contract` | the codec's own contract and its tests |
| 29 | `bin/fusion-work-order` | all hits | converted | `json` | states that nothing here reads the head fields |
| 30 | `bin/monitor` | all hits | other kind | `history` | citation of a historical issue record in a comment |
| 31 | `hooks/citation-sweep.ts` | all hits | converted | `name-grammar` | citation token grammar: marker slot and wildcard resolution |
| 32 | `hooks/staging-drift.ts` | all hits | converted | `name-grammar` | header example path; no state read |
| 33 | `hooks/lib/citation-corpus.ts` | all hits | converted | `json` | header: the record decides, and what the marker predicate was until step 8 (ruling b) |
| 34 | `hooks/lib/citation-scan.ts` | all hits | converted | `name-grammar` | citation scanner grammar and its comments |
| 35 | `hooks/lib/domain-cascade.ts` | all hits | other kind | `jargon-example` | comment: marker spans as corpus noise |
| 36 | `hooks/lib/edge-answers.ts` | all hits | other kind | `analysis-head` | field label as consequence group in policy-curator run files |
| 37 | `hooks/lib/legacy-import.ts` | all hits | legacy-only | `legacy-reader` | the legacy reader and mapping composer |
| 38 | `hooks/lib/legacy-repair.ts` | all hits | legacy-only | `legacy-reader` | the consented repair |
| 39 | `hooks/lib/plan-size.ts` | 42, 43, 46 | converted | `json` | header: the record decides; the marker reader went at step 8 (ruling b) |
| 40 | `hooks/lib/plan-size.ts` | 93 | converted | `name-grammar` | `isSpec` strips either name form |
| 41 | `hooks/lib/scope.ts` | all hits | converted | `json` | states that nothing here reads the head fields |
| 42 | `hooks/lib/work-graph.ts` | all hits | converted | `json` | states that nothing here reads the head fields |
| 43 | `hooks/lib/__tests__/archive-filter-key.test.ts` | all hits | converted | `name-grammar` | filter-3 citation key of the archive skill |
| 44 | `hooks/lib/__tests__/citation-form.test.ts` | all hits | converted | `name-grammar` | citation-form fixtures |
| 45 | `hooks/lib/__tests__/citation-grammar-boundaries.test.ts` | all hits | converted | `name-grammar` | scanner grammar fixtures |
| 46 | `hooks/lib/__tests__/citation-sweep.test.ts` | all hits | converted | `name-grammar` | marked names and citation tokens the sweep rewrites, on JSON fixtures and on the legacy rewriter case; no state is read |
| 47 | `hooks/lib/__tests__/commit-message-path.test.ts` | 10, 333 | other kind | `history` | citation of a historical issue |
| 48 | `hooks/lib/__tests__/commit-message-path.test.ts` | 293 | converted | `name-grammar` | path classification of a record name |
| 49 | `hooks/lib/__tests__/declared-citation-paths.test.ts` | all hits | converted | `name-grammar` | marked names as exhibit and pointer paths on a JSON workbench |
| 50 | `hooks/lib/__tests__/domain-cascade.test.ts` | all hits | other kind | `jargon-example` | fixture prose containing markers |
| 51 | `hooks/lib/__tests__/edge-answers.test.ts` | all hits | other kind | `analysis-head` | run-file fixtures for the edge-answer parse |
| 52 | `hooks/lib/__tests__/fenced-code-exemption.test.ts` | all hits | converted | `name-grammar` | dead-citation fixtures for the fence rule |
| 53 | `hooks/lib/__tests__/fusion-citation-check.test.ts` | 43, 44, 45, 71, 72, 169, 348 | converted | `name-grammar` | marked names as record paths and citation tokens on codec-placed records, and on the refusal fixture |
| 54 | `hooks/lib/__tests__/fusion-citation-check.test.ts` | 97, 105, 278, 299, 324, 325, 340 | converted | `json` | cases pinning that the record's state decides, whatever the name carries |
| 55 | `hooks/lib/__tests__/hook-fail-open.test.ts` | all hits | other kind | `history` | citation of an archived issue |
| 56 | `hooks/lib/__tests__/hook-route-exclusion.test.ts` | all hits | converted | `name-grammar` | `**Work-item:**` value parse |
| 57 | `hooks/lib/__tests__/legacy-import.test.ts` | all hits | legacy-only | `legacy-reader` | tests of the legacy reader |
| 58 | `hooks/lib/__tests__/legacy-repair.test.ts` | all hits | legacy-only | `legacy-reader` | tests of the repair |
| 59 | `hooks/lib/__tests__/marker-format-lint.test.ts` | all hits | converted | `name-grammar` | underscore-versus-bracket filename form |
| 60 | `hooks/lib/__tests__/migrate.test.ts` | all hits | legacy-only | `migrate` | tests of `bin/fusion-migrate` |
| 61 | `hooks/lib/__tests__/monitor-warnings-panel.test.ts` | all hits | other kind | `history` | citation of a historical issue |
| 62 | `hooks/lib/__tests__/path-literal-lint.test.ts` | all hits | converted | `name-grammar` | store-literal fixture |
| 63 | `hooks/lib/__tests__/plan-size.test.ts` | 131, 159 | converted | `name-grammar` | `isSpec` on a marked name; a marked name as the refusal fixture's path |
| 64 | `hooks/lib/__tests__/plan-size.test.ts` | 141, 143, 144, 151 | converted | `json` | JSON case: a live plan named `_c_` is measured, a closed one named `_o_` is not |
| 65 | `hooks/lib/__tests__/plan-stopping-section-lint.test.ts` | all hits | converted | `name-grammar` | `isSpec` of `lib/plan-size.ts` on marked names |
| 66 | `hooks/lib/__tests__/provenance-header-lint.test.ts` | 302 | other kind | `jargon-example` | fixture prose |
| 67 | `hooks/lib/__tests__/provenance-header-lint.test.ts` | all hits | converted | `name-grammar` | provenance citation-form fixtures |
| 68 | `hooks/lib/__tests__/reference-resolution-lint.test.ts` | 134, 473 | other kind | `history` | pin and re-approval log comments |
| 69 | `hooks/lib/__tests__/reference-resolution-lint.test.ts` | all hits | converted | `name-grammar` | citation-form fixtures and marker-to-wildcard normalisation |
| 70 | `hooks/lib/__tests__/review-coverage-mandate.test.ts` | all hits | other kind | `history` | citation of a historical issue |
| 71 | `hooks/lib/__tests__/rules-emission-golden.test.ts` | all hits | other kind | `history` | citation of a v11 plan |
| 72 | `hooks/lib/__tests__/sentence-identifier-containment.test.ts` | all hits | converted | `name-grammar` | record-name fixtures |
| 73 | `hooks/lib/__tests__/staging-drift.test.ts` | 36 | other kind | `jargon-example` | fixture content of a retired `portfolio.md` |
| 74 | `hooks/lib/__tests__/staging-drift.test.ts` | all hits | converted | `name-grammar` | path-classification fixtures |
| 75 | `hooks/lib/__tests__/store-name-migration.test.ts` | all hits | legacy-only | `migrate` | tests of `/fusion:migrate` store rename |
| 76 | `hooks/lib/__tests__/workbench-citation-lint.test.ts` | 184, 185, 186, 187, 188, 193, 194, 195 | converted | `json` | disagreement fixture: each name's marker says the opposite of the record's state, and the record decides |
| 77 | `hooks/lib/__tests__/workbench-citation-lint.test.ts` | 207, 208, 238, 249 | converted | `name-grammar` | frozen-prefix path fixtures and marker-normalised basename uniqueness |

## The hits

| # | File | Line | Patterns | Class | Basis | Step-2 row |
|---|---|---|---|---|---|---|
| 1 | `README-agents.md` | 64 | H | other kind | `homonym` | other kind, homonym |
| 2 | `README-agents.md` | 65 | H | other kind | `homonym` | other kind, homonym |
| 3 | `README-agents.md` | 66 | H | other kind | `homonym` | other kind, homonym |
| 4 | `README-agents.md` | 72 | H | other kind | `history` | other kind, history |
| 5 | `README-hooks.md` | 262 | H | legacy-only | `legacy-reader` | legacy-only, legacy-reader |
| 6 | `README-hooks.md` | 263 | H,M | legacy-only | `legacy-reader` | legacy-only, legacy-reader |
| 7 | `README-hooks.md` | 594 | H | other kind | `history` | other kind, history |
| 8 | `README-hooks.md` | 694 | M | other kind | `history` | other kind, history |
| 9 | `README-hooks.md` | 790 | M | other kind | `history` | other kind, history |
| 10 | `README-hooks.md` | 820 | M | other kind | `history` | other kind, history |
| 11 | `README.md` | 34 | H | legacy-only | `upgrade-note` | legacy-only, upgrade-note |
| 12 | `README.md` | 52 | H | legacy-only | `upgrade-note` | legacy-only, upgrade-note |
| 13 | `README.md` | 54 | H | legacy-only | `upgrade-note` | legacy-only, upgrade-note |
| 14 | `README.md` | 176 | M | converted | `json` | no step-2 row |
| 15 | `agents/analyst.md` | 165 | H | other kind | `analysis-head` | other kind, analysis-head |
| 16 | `agents/analyst.md` | 232 | H | other kind | `analysis-head` | other kind, analysis-head |
| 17 | `agents/consultant.md` | 102 | H | other kind | `analysis-head` | other kind, analysis-head |
| 18 | `agents/orchestrator.md` | 372 | H | other kind | `kept-gate-string` | no step-2 row |
| 19 | `agents/orchestrator.md` | 438 | H | other kind | `kept-gate-string` | no step-2 row |
| 20 | `agents/orchestrator.md` | 487 | M | other kind | `history` | other kind, history |
| 21 | `agents/orchestrator.md` | 568 | H | other kind | `kept-gate-string` | no step-2 row |
| 22 | `agents/orchestrator.md` | 601 | H | other kind | `kept-gate-string` | no step-2 row |
| 23 | `agents/policy-curator.md` | 264 | H | other kind | `homonym` | other kind, homonym |
| 24 | `agents/policy-curator.md` | 373 | H | other kind | `homonym` | other kind, homonym |
| 25 | `agents/policy-curator.md` | 386 | H | other kind | `homonym` | other kind, homonym |
| 26 | `agents/policy-curator.md` | 414 | H | other kind | `analysis-head` | other kind, analysis-head |
| 27 | `bin/fusion-work-order` | 54 | H | converted | `json` | unchanged file; converted, json |
| 28 | `bin/monitor` | 1769 | M | other kind | `history` | unchanged file; other kind, history |
| 29 | `bin/monitor` | 1936 | M | other kind | `history` | unchanged file; other kind, history |
| 30 | `codec/README.md` | 526 | H | other kind | `codec-contract` | other kind, codec-contract |
| 31 | `codec/README.md` | 527 | H | other kind | `codec-contract` | other kind, codec-contract |
| 32 | `codec/src/__tests__/install.test.ts` | 566 | H | other kind | `codec-contract` | other kind, codec-contract |
| 33 | `codec/src/__tests__/install.test.ts` | 793 | H | other kind | `codec-contract` | no step-2 row |
| 34 | `codec/src/__tests__/install.test.ts` | 907 | M | other kind | `codec-contract` | other kind, codec-contract |
| 35 | `codec/src/__tests__/install.test.ts` | 920 | M | other kind | `codec-contract` | other kind, codec-contract |
| 36 | `codec/src/__tests__/migration.test.ts` | 40 | H | other kind | `codec-contract` | unchanged file; other kind, codec-contract |
| 37 | `codec/src/__tests__/migration.test.ts` | 99 | H | other kind | `codec-contract` | unchanged file; other kind, codec-contract |
| 38 | `codec/src/__tests__/migration.test.ts` | 175 | M | other kind | `codec-contract` | unchanged file; other kind, codec-contract |
| 39 | `codec/src/__tests__/migration.test.ts` | 187 | M | other kind | `codec-contract` | unchanged file; other kind, codec-contract |
| 40 | `codec/src/__tests__/migration.test.ts` | 403 | M | other kind | `codec-contract` | unchanged file; other kind, codec-contract |
| 41 | `codec/src/__tests__/ops.test.ts` | 1286 | H | other kind | `codec-contract` | unchanged file; other kind, codec-contract |
| 42 | `codec/src/__tests__/ops.test.ts` | 1287 | H | other kind | `codec-contract` | unchanged file; other kind, codec-contract |
| 43 | `codec/src/__tests__/ops.test.ts` | 1331 | H | other kind | `codec-contract` | unchanged file; other kind, codec-contract |
| 44 | `codec/src/__tests__/ops.test.ts` | 1644 | M | other kind | `codec-contract` | unchanged file; other kind, codec-contract |
| 45 | `codec/src/__tests__/ops.test.ts` | 1645 | M | other kind | `codec-contract` | unchanged file; other kind, codec-contract |
| 46 | `codec/src/__tests__/ops.test.ts` | 2740 | H | other kind | `codec-contract` | unchanged file; other kind, codec-contract |
| 47 | `codec/src/__tests__/ops.test.ts` | 2741 | H | other kind | `codec-contract` | unchanged file; other kind, codec-contract |
| 48 | `codec/src/__tests__/ops.test.ts` | 2752 | H | other kind | `codec-contract` | unchanged file; other kind, codec-contract |
| 49 | `codec/src/__tests__/ops.test.ts` | 2754 | H | other kind | `codec-contract` | unchanged file; other kind, codec-contract |
| 50 | `codec/src/__tests__/ops.test.ts` | 3158 | H | other kind | `codec-contract` | unchanged file; other kind, codec-contract |
| 51 | `codec/src/__tests__/ops.test.ts` | 3159 | H | other kind | `codec-contract` | unchanged file; other kind, codec-contract |
| 52 | `codec/src/__tests__/ops.test.ts` | 3160 | H | other kind | `codec-contract` | unchanged file; other kind, codec-contract |
| 53 | `codec/src/__tests__/ops.test.ts` | 3161 | H | other kind | `codec-contract` | unchanged file; other kind, codec-contract |
| 54 | `codec/src/__tests__/ops.test.ts` | 3162 | H | other kind | `codec-contract` | unchanged file; other kind, codec-contract |
| 55 | `codec/src/__tests__/ops.test.ts` | 3165 | H | other kind | `codec-contract` | unchanged file; other kind, codec-contract |
| 56 | `codec/src/__tests__/ops.test.ts` | 3171 | H | other kind | `codec-contract` | unchanged file; other kind, codec-contract |
| 57 | `codec/src/__tests__/ops.test.ts` | 3176 | H | other kind | `codec-contract` | unchanged file; other kind, codec-contract |
| 58 | `codec/src/__tests__/ops.test.ts` | 3177 | H | other kind | `codec-contract` | unchanged file; other kind, codec-contract |
| 59 | `codec/src/__tests__/ops.test.ts` | 3178 | H | other kind | `codec-contract` | unchanged file; other kind, codec-contract |
| 60 | `codec/src/__tests__/ops.test.ts` | 3179 | H | other kind | `codec-contract` | unchanged file; other kind, codec-contract |
| 61 | `codec/src/__tests__/ops.test.ts` | 3180 | H | other kind | `codec-contract` | unchanged file; other kind, codec-contract |
| 62 | `codec/src/__tests__/ops.test.ts` | 3184 | M | other kind | `codec-contract` | unchanged file; other kind, codec-contract |
| 63 | `codec/src/__tests__/ops.test.ts` | 3185 | M | other kind | `codec-contract` | unchanged file; other kind, codec-contract |
| 64 | `codec/src/__tests__/ops.test.ts` | 3187 | H | other kind | `codec-contract` | unchanged file; other kind, codec-contract |
| 65 | `codec/src/__tests__/ops.test.ts` | 3192 | H | other kind | `codec-contract` | unchanged file; other kind, codec-contract |
| 66 | `codec/src/__tests__/ops.test.ts` | 3201 | H | other kind | `codec-contract` | unchanged file; other kind, codec-contract |
| 67 | `codec/src/__tests__/ops.test.ts` | 3202 | H | other kind | `codec-contract` | unchanged file; other kind, codec-contract |
| 68 | `codec/src/__tests__/ops.test.ts` | 3214 | H | other kind | `codec-contract` | unchanged file; other kind, codec-contract |
| 69 | `codec/src/__tests__/ops.test.ts` | 3219 | P | other kind | `codec-contract` | unchanged file; other kind, codec-contract |
| 70 | `codec/src/__tests__/ops.test.ts` | 3220 | P | other kind | `codec-contract` | unchanged file; other kind, codec-contract |
| 71 | `codec/src/__tests__/ops.test.ts` | 3942 | M | other kind | `codec-contract` | unchanged file; other kind, codec-contract |
| 72 | `codec/src/__tests__/ops.test.ts` | 3956 | M | other kind | `codec-contract` | unchanged file; other kind, codec-contract |
| 73 | `codec/src/__tests__/prior-mapping.test.ts` | 206 | M | other kind | `codec-contract` | unchanged file; other kind, codec-contract |
| 74 | `codec/src/__tests__/references.test.ts` | 135 | M | other kind | `codec-contract` | unchanged file; other kind, codec-contract |
| 75 | `codec/src/__tests__/references.test.ts` | 137 | M | other kind | `codec-contract` | unchanged file; other kind, codec-contract |
| 76 | `codec/src/__tests__/references.test.ts` | 160 | M | other kind | `codec-contract` | unchanged file; other kind, codec-contract |
| 77 | `codec/src/__tests__/round-trip-cli-archive.test.ts` | 266 | M | other kind | `codec-contract` | unchanged file; other kind, codec-contract |
| 78 | `codec/src/__tests__/round-trip-cli-initialize.test.ts` | 144 | H | other kind | `codec-contract` | unchanged file; other kind, codec-contract |
| 79 | `codec/src/__tests__/round-trip-cli-migration.test.ts` | 168 | M | other kind | `codec-contract` | unchanged file; other kind, codec-contract |
| 80 | `codec/src/__tests__/round-trip-cli-migration.test.ts` | 169 | M | other kind | `codec-contract` | unchanged file; other kind, codec-contract |
| 81 | `codec/src/__tests__/round-trip-cli-migration.test.ts` | 170 | M | other kind | `codec-contract` | unchanged file; other kind, codec-contract |
| 82 | `codec/src/__tests__/round-trip-cli-migration.test.ts` | 171 | M | other kind | `codec-contract` | unchanged file; other kind, codec-contract |
| 83 | `codec/src/__tests__/round-trip-cli-migration.test.ts` | 172 | M | other kind | `codec-contract` | unchanged file; other kind, codec-contract |
| 84 | `codec/src/__tests__/round-trip-cli-migration.test.ts` | 173 | M | other kind | `codec-contract` | unchanged file; other kind, codec-contract |
| 85 | `codec/src/__tests__/round-trip-cli-migration.test.ts` | 174 | M | other kind | `codec-contract` | unchanged file; other kind, codec-contract |
| 86 | `codec/src/__tests__/round-trip-cli-migration.test.ts` | 175 | M | other kind | `codec-contract` | unchanged file; other kind, codec-contract |
| 87 | `codec/src/__tests__/round-trip-cli-migration.test.ts` | 176 | M | other kind | `codec-contract` | unchanged file; other kind, codec-contract |
| 88 | `codec/src/__tests__/round-trip-cli-migration.test.ts` | 177 | M | other kind | `codec-contract` | unchanged file; other kind, codec-contract |
| 89 | `codec/src/__tests__/round-trip-cli-migration.test.ts` | 178 | M | other kind | `codec-contract` | unchanged file; other kind, codec-contract |
| 90 | `codec/src/__tests__/round-trip-cli-migration.test.ts` | 179 | M | other kind | `codec-contract` | unchanged file; other kind, codec-contract |
| 91 | `codec/src/__tests__/round-trip-cli-migration.test.ts` | 180 | M | other kind | `codec-contract` | unchanged file; other kind, codec-contract |
| 92 | `codec/src/__tests__/round-trip-cli-migration.test.ts` | 181 | M | other kind | `codec-contract` | unchanged file; other kind, codec-contract |
| 93 | `codec/src/__tests__/round-trip-cli-migration.test.ts` | 182 | M | other kind | `codec-contract` | unchanged file; other kind, codec-contract |
| 94 | `codec/src/__tests__/round-trip-cli-migration.test.ts` | 190 | M | other kind | `codec-contract` | unchanged file; other kind, codec-contract |
| 95 | `codec/src/__tests__/round-trip-cli-migration.test.ts` | 207 | H | other kind | `codec-contract` | unchanged file; other kind, codec-contract |
| 96 | `codec/src/__tests__/round-trip-cli-migration.test.ts` | 208 | H | other kind | `codec-contract` | unchanged file; other kind, codec-contract |
| 97 | `codec/src/__tests__/round-trip-cli-migration.test.ts` | 209 | H | other kind | `codec-contract` | unchanged file; other kind, codec-contract |
| 98 | `codec/src/__tests__/round-trip-cli-migration.test.ts` | 211 | H | other kind | `codec-contract` | unchanged file; other kind, codec-contract |
| 99 | `codec/src/__tests__/round-trip-cli-migration.test.ts` | 252 | C | other kind | `codec-contract` | unchanged file; other kind, codec-contract |
| 100 | `codec/src/__tests__/round-trip-cli-migration.test.ts` | 260 | H | other kind | `codec-contract` | unchanged file; other kind, codec-contract |
| 101 | `codec/src/__tests__/round-trip-cli-migration.test.ts` | 268 | H | other kind | `codec-contract` | unchanged file; other kind, codec-contract |
| 102 | `codec/src/__tests__/round-trip-cli-migration.test.ts` | 273 | H | other kind | `codec-contract` | unchanged file; other kind, codec-contract |
| 103 | `codec/src/__tests__/round-trip-cli-migration.test.ts` | 280 | H | other kind | `codec-contract` | unchanged file; other kind, codec-contract |
| 104 | `codec/src/__tests__/round-trip-cli-migration.test.ts` | 286 | H | other kind | `codec-contract` | unchanged file; other kind, codec-contract |
| 105 | `codec/src/__tests__/round-trip-cli-migration.test.ts` | 290 | H | other kind | `codec-contract` | unchanged file; other kind, codec-contract |
| 106 | `codec/src/__tests__/round-trip-cli-migration.test.ts` | 291 | H | other kind | `codec-contract` | unchanged file; other kind, codec-contract |
| 107 | `codec/src/__tests__/round-trip-cli-migration.test.ts` | 299 | H | other kind | `codec-contract` | unchanged file; other kind, codec-contract |
| 108 | `codec/src/__tests__/round-trip-cli-migration.test.ts` | 300 | P | other kind | `codec-contract` | unchanged file; other kind, codec-contract |
| 109 | `codec/src/__tests__/round-trip-cli-migration.test.ts` | 306 | M | other kind | `codec-contract` | unchanged file; other kind, codec-contract |
| 110 | `codec/src/__tests__/transitions.test.ts` | 64 | M | other kind | `codec-contract` | unchanged file; other kind, codec-contract |
| 111 | `codec/src/__tests__/transitions.test.ts` | 67 | M | other kind | `codec-contract` | unchanged file; other kind, codec-contract |
| 112 | `codec/src/__tests__/transitions.test.ts` | 76 | M | other kind | `codec-contract` | unchanged file; other kind, codec-contract |
| 113 | `codec/src/__tests__/transitions.test.ts` | 78 | M | other kind | `codec-contract` | unchanged file; other kind, codec-contract |
| 114 | `codec/src/__tests__/transitions.test.ts` | 84 | M | other kind | `codec-contract` | unchanged file; other kind, codec-contract |
| 115 | `codec/src/__tests__/transitions.test.ts` | 86 | M | other kind | `codec-contract` | unchanged file; other kind, codec-contract |
| 116 | `codec/src/cli/ops.ts` | 2011 | H | other kind | `codec-contract` | unchanged file; other kind, codec-contract |
| 117 | `codec/src/cli/ops.ts` | 2012 | H | other kind | `codec-contract` | unchanged file; other kind, codec-contract |
| 118 | `codec/src/prior/gojson.ts` | 210 | Hs | other kind | `codec-contract` | unchanged file; other kind, codec-contract |
| 119 | `codec/src/prior/packages.ts` | 211 | Hs | other kind | `codec-contract` | unchanged file; other kind, codec-contract |
| 120 | `codec/src/references.ts` | 8 | M | other kind | `codec-contract` | unchanged file; other kind, codec-contract |
| 121 | `codec/src/references.ts` | 115 | C | other kind | `codec-contract` | unchanged file; other kind, codec-contract |
| 122 | `codec/src/transitions.ts` | 247 | P | other kind | `codec-contract` | unchanged file; other kind, codec-contract |
| 123 | `docs/upgrading-to-v10-2.md` | 4 | H | legacy-only | `upgrade-note` | unchanged file; legacy-only, upgrade-note |
| 124 | `docs/upgrading-to-v10-2.md` | 23 | M | legacy-only | `upgrade-note` | unchanged file; legacy-only, upgrade-note |
| 125 | `docs/upgrading-to-v10-2.md` | 32 | H | legacy-only | `upgrade-note` | unchanged file; legacy-only, upgrade-note |
| 126 | `docs/upgrading-to-v10-2.md` | 37 | H | legacy-only | `upgrade-note` | unchanged file; legacy-only, upgrade-note |
| 127 | `docs/upgrading-to-v10-2.md` | 45 | H | legacy-only | `upgrade-note` | unchanged file; legacy-only, upgrade-note |
| 128 | `docs/upgrading-to-v10-2.md` | 66 | H | legacy-only | `upgrade-note` | unchanged file; legacy-only, upgrade-note |
| 129 | `docs/upgrading-to-v10-2.md` | 78 | H | legacy-only | `upgrade-note` | unchanged file; legacy-only, upgrade-note |
| 130 | `docs/upgrading-to-v10-2.md` | 88 | H | legacy-only | `upgrade-note` | unchanged file; legacy-only, upgrade-note |
| 131 | `docs/upgrading-to-v10-2.md` | 105 | H | legacy-only | `upgrade-note` | unchanged file; legacy-only, upgrade-note |
| 132 | `docs/upgrading-to-v10-2.md` | 108 | H | legacy-only | `upgrade-note` | unchanged file; legacy-only, upgrade-note |
| 133 | `docs/upgrading-to-v10-3.md` | 3 | H | legacy-only | `upgrade-note` | unchanged file; legacy-only, upgrade-note |
| 134 | `docs/upgrading-to-v10-3.md` | 16 | H | legacy-only | `upgrade-note` | unchanged file; legacy-only, upgrade-note |
| 135 | `docs/upgrading-to-v10-3.md` | 18 | M | legacy-only | `upgrade-note` | unchanged file; legacy-only, upgrade-note |
| 136 | `docs/upgrading-to-v10-3.md` | 19 | H,M | legacy-only | `upgrade-note` | unchanged file; legacy-only, upgrade-note |
| 137 | `docs/upgrading-to-v10-4.md` | 42 | M | legacy-only | `upgrade-note` | unchanged file; legacy-only, upgrade-note |
| 138 | `docs/upgrading-to-v10-4.md` | 73 | M | legacy-only | `upgrade-note` | unchanged file; legacy-only, upgrade-note |
| 139 | `docs/upgrading-to-v10-4.md` | 116 | H | legacy-only | `upgrade-note` | unchanged file; legacy-only, upgrade-note |
| 140 | `docs/upgrading-to-v10-4.md` | 150 | M | legacy-only | `upgrade-note` | unchanged file; legacy-only, upgrade-note |
| 141 | `docs/upgrading-to-v10-4.md` | 152 | M | legacy-only | `upgrade-note` | unchanged file; legacy-only, upgrade-note |
| 142 | `docs/upgrading-to-v10-4.md` | 153 | M | legacy-only | `upgrade-note` | unchanged file; legacy-only, upgrade-note |
| 143 | `docs/upgrading-to-v10-6.md` | 59 | H | legacy-only | `upgrade-note` | unchanged file; legacy-only, upgrade-note |
| 144 | `docs/upgrading-to-v11.md` | 25 | H | legacy-only | `upgrade-note` | unchanged file; legacy-only, upgrade-note |
| 145 | `docs/upgrading-to-v11.md` | 46 | C | legacy-only | `upgrade-note` | unchanged file; legacy-only, upgrade-note |
| 146 | `docs/upgrading-to-v11.md` | 50 | M | legacy-only | `upgrade-note` | unchanged file; legacy-only, upgrade-note |
| 147 | `docs/upgrading-to-v11.md` | 65 | H | legacy-only | `upgrade-note` | unchanged file; legacy-only, upgrade-note |
| 148 | `docs/upgrading-to-v11.md` | 66 | H | legacy-only | `upgrade-note` | unchanged file; legacy-only, upgrade-note |
| 149 | `docs/upgrading-to-v11.md` | 75 | M | legacy-only | `upgrade-note` | unchanged file; legacy-only, upgrade-note |
| 150 | `docs/upgrading-to-v11.md` | 177 | M | legacy-only | `upgrade-note` | unchanged file; legacy-only, upgrade-note |
| 151 | `docs/upgrading-to-v11.md` | 178 | M | legacy-only | `upgrade-note` | unchanged file; legacy-only, upgrade-note |
| 152 | `docs/upgrading-to-v11.md` | 179 | H | legacy-only | `upgrade-note` | unchanged file; legacy-only, upgrade-note |
| 153 | `docs/upgrading-to-v13.md` | 21 | H | converted | `json` | no step-2 row |
| 154 | `docs/upgrading-to-v13.md` | 22 | M | converted | `json` | no step-2 row |
| 155 | `docs/upgrading-to-v13.md` | 23 | P | converted | `json` | no step-2 row |
| 156 | `hooks/citation-sweep.ts` | 681 | C | converted | `name-grammar` | converted, name-grammar |
| 157 | `hooks/citation-sweep.ts` | 733 | C | converted | `name-grammar` | converted, name-grammar |
| 158 | `hooks/citation-sweep.ts` | 760 | C | converted | `name-grammar` | converted, name-grammar |
| 159 | `hooks/lib/__tests__/archive-filter-key.test.ts` | 25 | M | converted | `name-grammar` | converted, name-grammar |
| 160 | `hooks/lib/__tests__/archive-filter-key.test.ts` | 27 | M | converted | `name-grammar` | converted, name-grammar |
| 161 | `hooks/lib/__tests__/archive-filter-key.test.ts` | 28 | M | converted | `name-grammar` | converted, name-grammar |
| 162 | `hooks/lib/__tests__/archive-filter-key.test.ts` | 29 | M | converted | `name-grammar` | converted, name-grammar |
| 163 | `hooks/lib/__tests__/citation-form.test.ts` | 31 | M | converted | `name-grammar` | unchanged file; converted, name-grammar |
| 164 | `hooks/lib/__tests__/citation-form.test.ts` | 37 | M | converted | `name-grammar` | unchanged file; converted, name-grammar |
| 165 | `hooks/lib/__tests__/citation-form.test.ts` | 38 | M | converted | `name-grammar` | unchanged file; converted, name-grammar |
| 166 | `hooks/lib/__tests__/citation-form.test.ts` | 40 | M | converted | `name-grammar` | unchanged file; converted, name-grammar |
| 167 | `hooks/lib/__tests__/citation-form.test.ts` | 65 | M | converted | `name-grammar` | unchanged file; converted, name-grammar |
| 168 | `hooks/lib/__tests__/citation-form.test.ts` | 76 | M | converted | `name-grammar` | unchanged file; converted, name-grammar |
| 169 | `hooks/lib/__tests__/citation-form.test.ts` | 77 | M | converted | `name-grammar` | unchanged file; converted, name-grammar |
| 170 | `hooks/lib/__tests__/citation-form.test.ts` | 139 | M | converted | `name-grammar` | unchanged file; converted, name-grammar |
| 171 | `hooks/lib/__tests__/citation-form.test.ts` | 155 | M | converted | `name-grammar` | unchanged file; converted, name-grammar |
| 172 | `hooks/lib/__tests__/citation-form.test.ts` | 172 | M | converted | `name-grammar` | unchanged file; converted, name-grammar |
| 173 | `hooks/lib/__tests__/citation-form.test.ts` | 264 | M | converted | `name-grammar` | unchanged file; converted, name-grammar |
| 174 | `hooks/lib/__tests__/citation-form.test.ts` | 307 | M | converted | `name-grammar` | unchanged file; converted, name-grammar |
| 175 | `hooks/lib/__tests__/citation-grammar-boundaries.test.ts` | 26 | M | converted | `name-grammar` | unchanged file; converted, name-grammar |
| 176 | `hooks/lib/__tests__/citation-grammar-boundaries.test.ts` | 53 | M | converted | `name-grammar` | unchanged file; converted, name-grammar |
| 177 | `hooks/lib/__tests__/citation-grammar-boundaries.test.ts` | 64 | M | converted | `name-grammar` | unchanged file; converted, name-grammar |
| 178 | `hooks/lib/__tests__/citation-grammar-boundaries.test.ts` | 82 | M | converted | `name-grammar` | unchanged file; converted, name-grammar |
| 179 | `hooks/lib/__tests__/citation-grammar-boundaries.test.ts` | 99 | M | converted | `name-grammar` | unchanged file; converted, name-grammar |
| 180 | `hooks/lib/__tests__/citation-grammar-boundaries.test.ts` | 101 | M | converted | `name-grammar` | unchanged file; converted, name-grammar |
| 181 | `hooks/lib/__tests__/citation-grammar-boundaries.test.ts` | 103 | M | converted | `name-grammar` | unchanged file; converted, name-grammar |
| 182 | `hooks/lib/__tests__/citation-grammar-boundaries.test.ts` | 138 | M | converted | `name-grammar` | unchanged file; converted, name-grammar |
| 183 | `hooks/lib/__tests__/citation-grammar-boundaries.test.ts` | 139 | M | converted | `name-grammar` | unchanged file; converted, name-grammar |
| 184 | `hooks/lib/__tests__/citation-grammar-boundaries.test.ts` | 141 | M | converted | `name-grammar` | unchanged file; converted, name-grammar |
| 185 | `hooks/lib/__tests__/citation-grammar-boundaries.test.ts` | 229 | M | converted | `name-grammar` | unchanged file; converted, name-grammar |
| 186 | `hooks/lib/__tests__/citation-grammar-boundaries.test.ts` | 239 | M | converted | `name-grammar` | unchanged file; converted, name-grammar |
| 187 | `hooks/lib/__tests__/citation-sweep.test.ts` | 33 | M | converted | `name-grammar` | convert, legacy-branch |
| 188 | `hooks/lib/__tests__/citation-sweep.test.ts` | 38 | M | converted | `name-grammar` | convert, legacy-branch |
| 189 | `hooks/lib/__tests__/citation-sweep.test.ts` | 49 | M | converted | `name-grammar` | convert, legacy-branch |
| 190 | `hooks/lib/__tests__/citation-sweep.test.ts` | 51 | M | converted | `name-grammar` | convert, legacy-branch |
| 191 | `hooks/lib/__tests__/citation-sweep.test.ts` | 56 | M | converted | `name-grammar` | convert, legacy-branch |
| 192 | `hooks/lib/__tests__/citation-sweep.test.ts` | 58 | M | converted | `name-grammar` | convert, legacy-branch |
| 193 | `hooks/lib/__tests__/citation-sweep.test.ts` | 59 | M | converted | `name-grammar` | convert, legacy-branch |
| 194 | `hooks/lib/__tests__/citation-sweep.test.ts` | 60 | M | converted | `name-grammar` | convert, legacy-branch |
| 195 | `hooks/lib/__tests__/citation-sweep.test.ts` | 70 | M | converted | `name-grammar` | no step-2 row |
| 196 | `hooks/lib/__tests__/citation-sweep.test.ts` | 71 | M | converted | `name-grammar` | convert, legacy-branch |
| 197 | `hooks/lib/__tests__/citation-sweep.test.ts` | 72 | M | converted | `name-grammar` | convert, legacy-branch |
| 198 | `hooks/lib/__tests__/citation-sweep.test.ts` | 82 | M | converted | `name-grammar` | convert, legacy-branch |
| 199 | `hooks/lib/__tests__/citation-sweep.test.ts` | 84 | M | converted | `name-grammar` | convert, legacy-branch |
| 200 | `hooks/lib/__tests__/citation-sweep.test.ts` | 99 | H | converted | `name-grammar` | convert, legacy-branch |
| 201 | `hooks/lib/__tests__/citation-sweep.test.ts` | 111 | M | converted | `name-grammar` | convert, legacy-branch |
| 202 | `hooks/lib/__tests__/citation-sweep.test.ts` | 112 | M | converted | `name-grammar` | convert, legacy-branch |
| 203 | `hooks/lib/__tests__/citation-sweep.test.ts` | 118 | M | converted | `name-grammar` | convert, legacy-branch |
| 204 | `hooks/lib/__tests__/citation-sweep.test.ts` | 119 | M | converted | `name-grammar` | convert, legacy-branch |
| 205 | `hooks/lib/__tests__/citation-sweep.test.ts` | 173 | M | converted | `name-grammar` | convert, legacy-branch |
| 206 | `hooks/lib/__tests__/citation-sweep.test.ts` | 205 | M | converted | `name-grammar` | convert, legacy-branch |
| 207 | `hooks/lib/__tests__/citation-sweep.test.ts` | 229 | M | converted | `name-grammar` | no step-2 row |
| 208 | `hooks/lib/__tests__/citation-sweep.test.ts` | 257 | M | converted | `name-grammar` | convert, legacy-branch |
| 209 | `hooks/lib/__tests__/citation-sweep.test.ts` | 277 | M | converted | `name-grammar` | convert, legacy-branch |
| 210 | `hooks/lib/__tests__/citation-sweep.test.ts` | 293 | M | converted | `name-grammar` | convert, legacy-branch |
| 211 | `hooks/lib/__tests__/citation-sweep.test.ts` | 366 | M | converted | `name-grammar` | convert, legacy-branch |
| 212 | `hooks/lib/__tests__/citation-sweep.test.ts` | 367 | M | converted | `name-grammar` | convert, legacy-branch |
| 213 | `hooks/lib/__tests__/citation-sweep.test.ts` | 376 | M | converted | `name-grammar` | convert, legacy-branch |
| 214 | `hooks/lib/__tests__/citation-sweep.test.ts` | 390 | M | converted | `name-grammar` | convert, legacy-branch |
| 215 | `hooks/lib/__tests__/citation-sweep.test.ts` | 394 | M | converted | `name-grammar` | convert, legacy-branch |
| 216 | `hooks/lib/__tests__/citation-sweep.test.ts` | 460 | M | converted | `name-grammar` | convert, legacy-branch |
| 217 | `hooks/lib/__tests__/citation-sweep.test.ts` | 551 | M | converted | `name-grammar` | no step-2 row |
| 218 | `hooks/lib/__tests__/citation-sweep.test.ts` | 552 | M | converted | `name-grammar` | no step-2 row |
| 219 | `hooks/lib/__tests__/citation-sweep.test.ts` | 571 | M | converted | `name-grammar` | convert, legacy-branch |
| 220 | `hooks/lib/__tests__/citation-sweep.test.ts` | 572 | M | converted | `name-grammar` | convert, legacy-branch |
| 221 | `hooks/lib/__tests__/citation-sweep.test.ts` | 574 | M | converted | `name-grammar` | convert, legacy-branch |
| 222 | `hooks/lib/__tests__/citation-sweep.test.ts` | 575 | M | converted | `name-grammar` | convert, legacy-branch |
| 223 | `hooks/lib/__tests__/citation-sweep.test.ts` | 576 | M | converted | `name-grammar` | convert, legacy-branch |
| 224 | `hooks/lib/__tests__/citation-sweep.test.ts` | 602 | M | converted | `name-grammar` | convert, legacy-branch |
| 225 | `hooks/lib/__tests__/commit-message-path.test.ts` | 10 | M | other kind | `history` | unchanged file; other kind, history |
| 226 | `hooks/lib/__tests__/commit-message-path.test.ts` | 293 | M | converted | `name-grammar` | unchanged file; converted, name-grammar |
| 227 | `hooks/lib/__tests__/commit-message-path.test.ts` | 333 | M | other kind | `history` | unchanged file; other kind, history |
| 228 | `hooks/lib/__tests__/declared-citation-paths.test.ts` | 79 | M | converted | `name-grammar` | convert, legacy-branch |
| 229 | `hooks/lib/__tests__/declared-citation-paths.test.ts` | 82 | M | converted | `name-grammar` | convert, legacy-branch |
| 230 | `hooks/lib/__tests__/domain-cascade.test.ts` | 729 | M | other kind | `jargon-example` | unchanged file; other kind, jargon-example |
| 231 | `hooks/lib/__tests__/domain-cascade.test.ts` | 730 | M | other kind | `jargon-example` | unchanged file; other kind, jargon-example |
| 232 | `hooks/lib/__tests__/edge-answers.test.ts` | 69 | M | other kind | `analysis-head` | unchanged file; other kind, analysis-head |
| 233 | `hooks/lib/__tests__/edge-answers.test.ts` | 125 | Hs | other kind | `analysis-head` | unchanged file; other kind, analysis-head |
| 234 | `hooks/lib/__tests__/fenced-code-exemption.test.ts` | 37 | M | converted | `name-grammar` | unchanged file; converted, name-grammar |
| 235 | `hooks/lib/__tests__/fenced-code-exemption.test.ts` | 40 | M | converted | `name-grammar` | unchanged file; converted, name-grammar |
| 236 | `hooks/lib/__tests__/fusion-citation-check.test.ts` | 43 | M | converted | `name-grammar` | no step-2 row |
| 237 | `hooks/lib/__tests__/fusion-citation-check.test.ts` | 44 | M | converted | `name-grammar` | no step-2 row |
| 238 | `hooks/lib/__tests__/fusion-citation-check.test.ts` | 45 | M | converted | `name-grammar` | convert, legacy-branch |
| 239 | `hooks/lib/__tests__/fusion-citation-check.test.ts` | 71 | M | converted | `name-grammar` | convert, legacy-branch |
| 240 | `hooks/lib/__tests__/fusion-citation-check.test.ts` | 72 | M | converted | `name-grammar` | convert, legacy-branch |
| 241 | `hooks/lib/__tests__/fusion-citation-check.test.ts` | 97 | M | converted | `json` | no step-2 row |
| 242 | `hooks/lib/__tests__/fusion-citation-check.test.ts` | 105 | M | converted | `json` | no step-2 row |
| 243 | `hooks/lib/__tests__/fusion-citation-check.test.ts` | 169 | M | converted | `name-grammar` | no step-2 row |
| 244 | `hooks/lib/__tests__/fusion-citation-check.test.ts` | 278 | M | converted | `json` | converted, json |
| 245 | `hooks/lib/__tests__/fusion-citation-check.test.ts` | 299 | M | converted | `json` | converted, json |
| 246 | `hooks/lib/__tests__/fusion-citation-check.test.ts` | 324 | M | converted | `json` | converted, json |
| 247 | `hooks/lib/__tests__/fusion-citation-check.test.ts` | 325 | M | converted | `json` | converted, json |
| 248 | `hooks/lib/__tests__/fusion-citation-check.test.ts` | 340 | M | converted | `json` | converted, json |
| 249 | `hooks/lib/__tests__/fusion-citation-check.test.ts` | 348 | M | converted | `name-grammar` | no step-2 row |
| 250 | `hooks/lib/__tests__/hook-fail-open.test.ts` | 30 | M | other kind | `history` | unchanged file; other kind, history |
| 251 | `hooks/lib/__tests__/hook-route-exclusion.test.ts` | 227 | M | converted | `name-grammar` | unchanged file; converted, name-grammar |
| 252 | `hooks/lib/__tests__/legacy-import.test.ts` | 17 | M | legacy-only | `legacy-reader` | unchanged file; legacy-only, legacy-reader |
| 253 | `hooks/lib/__tests__/legacy-import.test.ts` | 18 | M | legacy-only | `legacy-reader` | unchanged file; legacy-only, legacy-reader |
| 254 | `hooks/lib/__tests__/legacy-import.test.ts` | 19 | M | legacy-only | `legacy-reader` | unchanged file; legacy-only, legacy-reader |
| 255 | `hooks/lib/__tests__/legacy-import.test.ts` | 20 | M | legacy-only | `legacy-reader` | unchanged file; legacy-only, legacy-reader |
| 256 | `hooks/lib/__tests__/legacy-import.test.ts` | 21 | M | legacy-only | `legacy-reader` | unchanged file; legacy-only, legacy-reader |
| 257 | `hooks/lib/__tests__/legacy-import.test.ts` | 61 | M | legacy-only | `legacy-reader` | unchanged file; legacy-only, legacy-reader |
| 258 | `hooks/lib/__tests__/legacy-import.test.ts` | 85 | He,P | legacy-only | `legacy-reader` | unchanged file; legacy-only, legacy-reader |
| 259 | `hooks/lib/__tests__/legacy-import.test.ts` | 86 | H | legacy-only | `legacy-reader` | unchanged file; legacy-only, legacy-reader |
| 260 | `hooks/lib/__tests__/legacy-import.test.ts` | 87 | M | legacy-only | `legacy-reader` | unchanged file; legacy-only, legacy-reader |
| 261 | `hooks/lib/__tests__/legacy-import.test.ts` | 89 | M | legacy-only | `legacy-reader` | unchanged file; legacy-only, legacy-reader |
| 262 | `hooks/lib/__tests__/legacy-import.test.ts` | 92 | C | legacy-only | `legacy-reader` | unchanged file; legacy-only, legacy-reader |
| 263 | `hooks/lib/__tests__/legacy-import.test.ts` | 100 | H | legacy-only | `legacy-reader` | unchanged file; legacy-only, legacy-reader |
| 264 | `hooks/lib/__tests__/legacy-import.test.ts` | 102 | H | legacy-only | `legacy-reader` | unchanged file; legacy-only, legacy-reader |
| 265 | `hooks/lib/__tests__/legacy-import.test.ts` | 103 | M | legacy-only | `legacy-reader` | unchanged file; legacy-only, legacy-reader |
| 266 | `hooks/lib/__tests__/legacy-import.test.ts` | 119 | M | legacy-only | `legacy-reader` | unchanged file; legacy-only, legacy-reader |
| 267 | `hooks/lib/__tests__/legacy-import.test.ts` | 131 | P | legacy-only | `legacy-reader` | unchanged file; legacy-only, legacy-reader |
| 268 | `hooks/lib/__tests__/legacy-import.test.ts` | 136 | M | legacy-only | `legacy-reader` | unchanged file; legacy-only, legacy-reader |
| 269 | `hooks/lib/__tests__/legacy-repair.test.ts` | 20 | M | legacy-only | `legacy-reader` | unchanged file; legacy-only, legacy-reader |
| 270 | `hooks/lib/__tests__/legacy-repair.test.ts` | 21 | M | legacy-only | `legacy-reader` | unchanged file; legacy-only, legacy-reader |
| 271 | `hooks/lib/__tests__/legacy-repair.test.ts` | 22 | M | legacy-only | `legacy-reader` | unchanged file; legacy-only, legacy-reader |
| 272 | `hooks/lib/__tests__/legacy-repair.test.ts` | 46 | P | legacy-only | `legacy-reader` | unchanged file; legacy-only, legacy-reader |
| 273 | `hooks/lib/__tests__/legacy-repair.test.ts` | 51 | M | legacy-only | `legacy-reader` | unchanged file; legacy-only, legacy-reader |
| 274 | `hooks/lib/__tests__/legacy-repair.test.ts` | 86 | H | legacy-only | `legacy-reader` | unchanged file; legacy-only, legacy-reader |
| 275 | `hooks/lib/__tests__/marker-format-lint.test.ts` | 9 | M | converted | `name-grammar` | unchanged file; converted, name-grammar |
| 276 | `hooks/lib/__tests__/marker-format-lint.test.ts` | 161 | M | converted | `name-grammar` | unchanged file; converted, name-grammar |
| 277 | `hooks/lib/__tests__/migrate.test.ts` | 24 | M | legacy-only | `migrate` | unchanged file; legacy-only, migrate |
| 278 | `hooks/lib/__tests__/migrate.test.ts` | 25 | M | legacy-only | `migrate` | unchanged file; legacy-only, migrate |
| 279 | `hooks/lib/__tests__/migrate.test.ts` | 26 | M | legacy-only | `migrate` | unchanged file; legacy-only, migrate |
| 280 | `hooks/lib/__tests__/migrate.test.ts` | 27 | M | legacy-only | `migrate` | unchanged file; legacy-only, migrate |
| 281 | `hooks/lib/__tests__/migrate.test.ts` | 28 | M | legacy-only | `migrate` | unchanged file; legacy-only, migrate |
| 282 | `hooks/lib/__tests__/migrate.test.ts` | 29 | M | legacy-only | `migrate` | unchanged file; legacy-only, migrate |
| 283 | `hooks/lib/__tests__/migrate.test.ts` | 47 | M | legacy-only | `migrate` | unchanged file; legacy-only, migrate |
| 284 | `hooks/lib/__tests__/migrate.test.ts` | 51 | M | legacy-only | `migrate` | unchanged file; legacy-only, migrate |
| 285 | `hooks/lib/__tests__/migrate.test.ts` | 100 | M | legacy-only | `migrate` | unchanged file; legacy-only, migrate |
| 286 | `hooks/lib/__tests__/migrate.test.ts` | 104 | H | legacy-only | `migrate` | unchanged file; legacy-only, migrate |
| 287 | `hooks/lib/__tests__/monitor-warnings-panel.test.ts` | 56 | M | other kind | `history` | unchanged file; other kind, history |
| 288 | `hooks/lib/__tests__/path-literal-lint.test.ts` | 192 | M | converted | `name-grammar` | unchanged file; converted, name-grammar |
| 289 | `hooks/lib/__tests__/plan-size.test.ts` | 131 | M | converted | `name-grammar` | converted, name-grammar |
| 290 | `hooks/lib/__tests__/plan-size.test.ts` | 141 | M | converted | `json` | converted, json |
| 291 | `hooks/lib/__tests__/plan-size.test.ts` | 143 | M | converted | `json` | no step-2 row |
| 292 | `hooks/lib/__tests__/plan-size.test.ts` | 144 | M | converted | `json` | no step-2 row |
| 293 | `hooks/lib/__tests__/plan-size.test.ts` | 151 | M | converted | `json` | converted, json |
| 294 | `hooks/lib/__tests__/plan-size.test.ts` | 159 | M | converted | `name-grammar` | no step-2 row |
| 295 | `hooks/lib/__tests__/plan-stopping-section-lint.test.ts` | 194 | M | converted | `name-grammar` | convert, live-predicate |
| 296 | `hooks/lib/__tests__/plan-stopping-section-lint.test.ts` | 196 | M | converted | `name-grammar` | no step-2 row |
| 297 | `hooks/lib/__tests__/provenance-header-lint.test.ts` | 138 | M | converted | `name-grammar` | unchanged file; converted, name-grammar |
| 298 | `hooks/lib/__tests__/provenance-header-lint.test.ts` | 268 | M | converted | `name-grammar` | unchanged file; converted, name-grammar |
| 299 | `hooks/lib/__tests__/provenance-header-lint.test.ts` | 302 | M | other kind | `jargon-example` | unchanged file; other kind, jargon-example |
| 300 | `hooks/lib/__tests__/provenance-header-lint.test.ts` | 359 | M | converted | `name-grammar` | unchanged file; converted, name-grammar |
| 301 | `hooks/lib/__tests__/provenance-header-lint.test.ts` | 361 | M | converted | `name-grammar` | unchanged file; converted, name-grammar |
| 302 | `hooks/lib/__tests__/reference-resolution-lint.test.ts` | 134 | M | other kind | `history` | other kind, history |
| 303 | `hooks/lib/__tests__/reference-resolution-lint.test.ts` | 267 | M | converted | `name-grammar` | converted, name-grammar |
| 304 | `hooks/lib/__tests__/reference-resolution-lint.test.ts` | 473 | H | other kind | `history` | other kind, history |
| 305 | `hooks/lib/__tests__/reference-resolution-lint.test.ts` | 551 | C | converted | `name-grammar` | converted, name-grammar |
| 306 | `hooks/lib/__tests__/reference-resolution-lint.test.ts` | 553 | C | converted | `name-grammar` | converted, name-grammar |
| 307 | `hooks/lib/__tests__/reference-resolution-lint.test.ts` | 645 | M | converted | `name-grammar` | converted, name-grammar |
| 308 | `hooks/lib/__tests__/reference-resolution-lint.test.ts` | 792 | C | converted | `name-grammar` | converted, name-grammar |
| 309 | `hooks/lib/__tests__/reference-resolution-lint.test.ts` | 794 | C | converted | `name-grammar` | converted, name-grammar |
| 310 | `hooks/lib/__tests__/reference-resolution-lint.test.ts` | 796 | C | converted | `name-grammar` | converted, name-grammar |
| 311 | `hooks/lib/__tests__/reference-resolution-lint.test.ts` | 797 | C | converted | `name-grammar` | converted, name-grammar |
| 312 | `hooks/lib/__tests__/reference-resolution-lint.test.ts` | 816 | M | converted | `name-grammar` | converted, name-grammar |
| 313 | `hooks/lib/__tests__/reference-resolution-lint.test.ts` | 833 | M | converted | `name-grammar` | converted, name-grammar |
| 314 | `hooks/lib/__tests__/reference-resolution-lint.test.ts` | 845 | C | converted | `name-grammar` | converted, name-grammar |
| 315 | `hooks/lib/__tests__/reference-resolution-lint.test.ts` | 848 | C | converted | `name-grammar` | converted, name-grammar |
| 316 | `hooks/lib/__tests__/reference-resolution-lint.test.ts` | 871 | M | converted | `name-grammar` | converted, name-grammar |
| 317 | `hooks/lib/__tests__/reference-resolution-lint.test.ts` | 879 | M | converted | `name-grammar` | converted, name-grammar |
| 318 | `hooks/lib/__tests__/reference-resolution-lint.test.ts` | 881 | M | converted | `name-grammar` | converted, name-grammar |
| 319 | `hooks/lib/__tests__/review-coverage-mandate.test.ts` | 3 | M | other kind | `history` | unchanged file; other kind, history |
| 320 | `hooks/lib/__tests__/review-coverage-mandate.test.ts` | 12 | M | other kind | `history` | unchanged file; other kind, history |
| 321 | `hooks/lib/__tests__/rules-emission-golden.test.ts` | 30 | M | other kind | `history` | other kind, history |
| 322 | `hooks/lib/__tests__/sentence-identifier-containment.test.ts` | 161 | M | converted | `name-grammar` | unchanged file; converted, name-grammar |
| 323 | `hooks/lib/__tests__/sentence-identifier-containment.test.ts` | 196 | M | converted | `name-grammar` | unchanged file; converted, name-grammar |
| 324 | `hooks/lib/__tests__/sentence-identifier-containment.test.ts` | 209 | M | converted | `name-grammar` | unchanged file; converted, name-grammar |
| 325 | `hooks/lib/__tests__/sentence-identifier-containment.test.ts` | 255 | M | converted | `name-grammar` | unchanged file; converted, name-grammar |
| 326 | `hooks/lib/__tests__/staging-drift.test.ts` | 35 | M | converted | `name-grammar` | converted, name-grammar |
| 327 | `hooks/lib/__tests__/staging-drift.test.ts` | 36 | M | other kind | `jargon-example` | other kind, jargon-example |
| 328 | `hooks/lib/__tests__/staging-drift.test.ts` | 37 | M | converted | `name-grammar` | converted, name-grammar |
| 329 | `hooks/lib/__tests__/staging-drift.test.ts` | 45 | M | converted | `name-grammar` | converted, name-grammar |
| 330 | `hooks/lib/__tests__/staging-drift.test.ts` | 139 | M | converted | `name-grammar` | converted, name-grammar |
| 331 | `hooks/lib/__tests__/staging-drift.test.ts` | 186 | M | converted | `name-grammar` | converted, name-grammar |
| 332 | `hooks/lib/__tests__/staging-drift.test.ts` | 187 | M | converted | `name-grammar` | converted, name-grammar |
| 333 | `hooks/lib/__tests__/staging-drift.test.ts` | 380 | M | converted | `name-grammar` | converted, name-grammar |
| 334 | `hooks/lib/__tests__/staging-drift.test.ts` | 386 | M | converted | `name-grammar` | converted, name-grammar |
| 335 | `hooks/lib/__tests__/staging-drift.test.ts` | 642 | M | converted | `name-grammar` | converted, name-grammar |
| 336 | `hooks/lib/__tests__/staging-drift.test.ts` | 646 | M | converted | `name-grammar` | converted, name-grammar |
| 337 | `hooks/lib/__tests__/store-name-migration.test.ts` | 43 | M | legacy-only | `migrate` | unchanged file; legacy-only, migrate |
| 338 | `hooks/lib/__tests__/store-name-migration.test.ts` | 44 | M | legacy-only | `migrate` | unchanged file; legacy-only, migrate |
| 339 | `hooks/lib/__tests__/store-name-migration.test.ts` | 45 | M | legacy-only | `migrate` | unchanged file; legacy-only, migrate |
| 340 | `hooks/lib/__tests__/store-name-migration.test.ts` | 62 | M | legacy-only | `migrate` | unchanged file; legacy-only, migrate |
| 341 | `hooks/lib/__tests__/store-name-migration.test.ts` | 92 | M | legacy-only | `migrate` | unchanged file; legacy-only, migrate |
| 342 | `hooks/lib/__tests__/store-name-migration.test.ts` | 94 | M | legacy-only | `migrate` | unchanged file; legacy-only, migrate |
| 343 | `hooks/lib/__tests__/workbench-citation-lint.test.ts` | 184 | M | converted | `json` | no step-2 row |
| 344 | `hooks/lib/__tests__/workbench-citation-lint.test.ts` | 185 | M | converted | `json` | no step-2 row |
| 345 | `hooks/lib/__tests__/workbench-citation-lint.test.ts` | 186 | M | converted | `json` | no step-2 row |
| 346 | `hooks/lib/__tests__/workbench-citation-lint.test.ts` | 187 | M | converted | `json` | no step-2 row |
| 347 | `hooks/lib/__tests__/workbench-citation-lint.test.ts` | 188 | M | converted | `json` | no step-2 row |
| 348 | `hooks/lib/__tests__/workbench-citation-lint.test.ts` | 193 | M | converted | `json` | no step-2 row |
| 349 | `hooks/lib/__tests__/workbench-citation-lint.test.ts` | 194 | M | converted | `json` | no step-2 row |
| 350 | `hooks/lib/__tests__/workbench-citation-lint.test.ts` | 195 | M | converted | `json` | no step-2 row |
| 351 | `hooks/lib/__tests__/workbench-citation-lint.test.ts` | 207 | M | converted | `name-grammar` | no step-2 row |
| 352 | `hooks/lib/__tests__/workbench-citation-lint.test.ts` | 208 | M | converted | `name-grammar` | no step-2 row |
| 353 | `hooks/lib/__tests__/workbench-citation-lint.test.ts` | 238 | C | converted | `name-grammar` | converted, name-grammar |
| 354 | `hooks/lib/__tests__/workbench-citation-lint.test.ts` | 249 | C | converted | `name-grammar` | converted, name-grammar |
| 355 | `hooks/lib/citation-corpus.ts` | 26 | M | converted | `json` | no step-2 row |
| 356 | `hooks/lib/citation-corpus.ts` | 27 | M | converted | `json` | no step-2 row |
| 357 | `hooks/lib/citation-corpus.ts` | 28 | M | converted | `json` | no step-2 row |
| 358 | `hooks/lib/citation-corpus.ts` | 36 | M | converted | `json` | no step-2 row |
| 359 | `hooks/lib/citation-scan.ts` | 84 | C | converted | `name-grammar` | converted, name-grammar |
| 360 | `hooks/lib/citation-scan.ts` | 91 | M | converted | `name-grammar` | converted, name-grammar |
| 361 | `hooks/lib/citation-scan.ts` | 97 | M | converted | `name-grammar` | converted, name-grammar |
| 362 | `hooks/lib/citation-scan.ts` | 134 | H | converted | `name-grammar` | converted, name-grammar |
| 363 | `hooks/lib/citation-scan.ts` | 149 | H | converted | `name-grammar` | converted, name-grammar |
| 364 | `hooks/lib/citation-scan.ts` | 400 | M | converted | `name-grammar` | converted, name-grammar |
| 365 | `hooks/lib/citation-scan.ts` | 465 | M | converted | `name-grammar` | converted, name-grammar |
| 366 | `hooks/lib/citation-scan.ts` | 577 | C | converted | `name-grammar` | converted, name-grammar |
| 367 | `hooks/lib/citation-scan.ts` | 590 | M | converted | `name-grammar` | converted, name-grammar |
| 368 | `hooks/lib/citation-scan.ts` | 906 | C | converted | `name-grammar` | converted, name-grammar |
| 369 | `hooks/lib/citation-scan.ts` | 1358 | M | converted | `name-grammar` | converted, name-grammar |
| 370 | `hooks/lib/domain-cascade.ts` | 721 | M | other kind | `jargon-example` | unchanged file; other kind, jargon-example |
| 371 | `hooks/lib/edge-answers.ts` | 17 | H | other kind | `analysis-head` | unchanged file; other kind, analysis-head |
| 372 | `hooks/lib/legacy-import.ts` | 33 | M | legacy-only | `legacy-reader` | unchanged file; legacy-only, legacy-reader |
| 373 | `hooks/lib/legacy-import.ts` | 34 | H,M | legacy-only | `legacy-reader` | unchanged file; legacy-only, legacy-reader |
| 374 | `hooks/lib/legacy-import.ts` | 50 | M | legacy-only | `legacy-reader` | unchanged file; legacy-only, legacy-reader |
| 375 | `hooks/lib/legacy-import.ts` | 51 | H,M | legacy-only | `legacy-reader` | unchanged file; legacy-only, legacy-reader |
| 376 | `hooks/lib/legacy-import.ts` | 87 | H | legacy-only | `legacy-reader` | unchanged file; legacy-only, legacy-reader |
| 377 | `hooks/lib/legacy-import.ts` | 137 | H | legacy-only | `legacy-reader` | unchanged file; legacy-only, legacy-reader |
| 378 | `hooks/lib/legacy-import.ts` | 232 | C | legacy-only | `legacy-reader` | unchanged file; legacy-only, legacy-reader |
| 379 | `hooks/lib/legacy-import.ts` | 233 | C | legacy-only | `legacy-reader` | unchanged file; legacy-only, legacy-reader |
| 380 | `hooks/lib/legacy-import.ts` | 249 | P | legacy-only | `legacy-reader` | unchanged file; legacy-only, legacy-reader |
| 381 | `hooks/lib/legacy-import.ts` | 252 | Hs | legacy-only | `legacy-reader` | unchanged file; legacy-only, legacy-reader |
| 382 | `hooks/lib/legacy-import.ts` | 254 | P | legacy-only | `legacy-reader` | unchanged file; legacy-only, legacy-reader |
| 383 | `hooks/lib/legacy-import.ts` | 255 | C | legacy-only | `legacy-reader` | unchanged file; legacy-only, legacy-reader |
| 384 | `hooks/lib/legacy-import.ts` | 374 | P | legacy-only | `legacy-reader` | unchanged file; legacy-only, legacy-reader |
| 385 | `hooks/lib/legacy-import.ts` | 455 | Hs | legacy-only | `legacy-reader` | unchanged file; legacy-only, legacy-reader |
| 386 | `hooks/lib/legacy-import.ts` | 458 | Hs,M | legacy-only | `legacy-reader` | unchanged file; legacy-only, legacy-reader |
| 387 | `hooks/lib/legacy-import.ts` | 460 | Hs | legacy-only | `legacy-reader` | unchanged file; legacy-only, legacy-reader |
| 388 | `hooks/lib/legacy-import.ts` | 462 | Hs | legacy-only | `legacy-reader` | unchanged file; legacy-only, legacy-reader |
| 389 | `hooks/lib/legacy-import.ts` | 464 | H | legacy-only | `legacy-reader` | unchanged file; legacy-only, legacy-reader |
| 390 | `hooks/lib/legacy-import.ts` | 519 | Hs | legacy-only | `legacy-reader` | unchanged file; legacy-only, legacy-reader |
| 391 | `hooks/lib/legacy-import.ts` | 522 | H | legacy-only | `legacy-reader` | unchanged file; legacy-only, legacy-reader |
| 392 | `hooks/lib/legacy-import.ts` | 575 | H | legacy-only | `legacy-reader` | unchanged file; legacy-only, legacy-reader |
| 393 | `hooks/lib/legacy-import.ts` | 587 | Hs | legacy-only | `legacy-reader` | unchanged file; legacy-only, legacy-reader |
| 394 | `hooks/lib/legacy-import.ts` | 602 | C | legacy-only | `legacy-reader` | unchanged file; legacy-only, legacy-reader |
| 395 | `hooks/lib/legacy-import.ts` | 627 | Hs | legacy-only | `legacy-reader` | unchanged file; legacy-only, legacy-reader |
| 396 | `hooks/lib/legacy-import.ts` | 713 | Hs | legacy-only | `legacy-reader` | unchanged file; legacy-only, legacy-reader |
| 397 | `hooks/lib/legacy-import.ts` | 716 | H | legacy-only | `legacy-reader` | unchanged file; legacy-only, legacy-reader |
| 398 | `hooks/lib/legacy-import.ts` | 718 | Hs | legacy-only | `legacy-reader` | unchanged file; legacy-only, legacy-reader |
| 399 | `hooks/lib/legacy-import.ts` | 728 | H | legacy-only | `legacy-reader` | unchanged file; legacy-only, legacy-reader |
| 400 | `hooks/lib/legacy-import.ts` | 759 | M | legacy-only | `legacy-reader` | unchanged file; legacy-only, legacy-reader |
| 401 | `hooks/lib/legacy-repair.ts` | 112 | P | legacy-only | `legacy-reader` | unchanged file; legacy-only, legacy-reader |
| 402 | `hooks/lib/legacy-repair.ts` | 133 | Hs | legacy-only | `legacy-reader` | unchanged file; legacy-only, legacy-reader |
| 403 | `hooks/lib/legacy-repair.ts` | 137 | C | legacy-only | `legacy-reader` | unchanged file; legacy-only, legacy-reader |
| 404 | `hooks/lib/legacy-repair.ts` | 141 | C | legacy-only | `legacy-reader` | unchanged file; legacy-only, legacy-reader |
| 405 | `hooks/lib/legacy-repair.ts` | 143 | Hs | legacy-only | `legacy-reader` | unchanged file; legacy-only, legacy-reader |
| 406 | `hooks/lib/legacy-repair.ts` | 226 | C | legacy-only | `legacy-reader` | unchanged file; legacy-only, legacy-reader |
| 407 | `hooks/lib/legacy-repair.ts` | 234 | P | legacy-only | `legacy-reader` | unchanged file; legacy-only, legacy-reader |
| 408 | `hooks/lib/legacy-repair.ts` | 241 | P | legacy-only | `legacy-reader` | unchanged file; legacy-only, legacy-reader |
| 409 | `hooks/lib/legacy-repair.ts` | 283 | Hs | legacy-only | `legacy-reader` | unchanged file; legacy-only, legacy-reader |
| 410 | `hooks/lib/legacy-repair.ts` | 296 | Hs | legacy-only | `legacy-reader` | unchanged file; legacy-only, legacy-reader |
| 411 | `hooks/lib/legacy-repair.ts` | 309 | H | legacy-only | `legacy-reader` | unchanged file; legacy-only, legacy-reader |
| 412 | `hooks/lib/legacy-repair.ts` | 313 | Hs | legacy-only | `legacy-reader` | unchanged file; legacy-only, legacy-reader |
| 413 | `hooks/lib/legacy-repair.ts` | 314 | H | legacy-only | `legacy-reader` | unchanged file; legacy-only, legacy-reader |
| 414 | `hooks/lib/legacy-repair.ts` | 315 | H | legacy-only | `legacy-reader` | unchanged file; legacy-only, legacy-reader |
| 415 | `hooks/lib/plan-size.ts` | 42 | M | converted | `json` | no step-2 row |
| 416 | `hooks/lib/plan-size.ts` | 43 | M | converted | `json` | no step-2 row |
| 417 | `hooks/lib/plan-size.ts` | 46 | M | converted | `json` | no step-2 row |
| 418 | `hooks/lib/plan-size.ts` | 93 | C | converted | `name-grammar` | converted, name-grammar |
| 419 | `hooks/lib/scope.ts` | 9 | H | converted | `json` | unchanged file; converted, json |
| 420 | `hooks/lib/work-graph.ts` | 8 | H | converted | `json` | unchanged file; converted, json |
| 421 | `hooks/lib/work-graph.ts` | 9 | H | converted | `json` | unchanged file; converted, json |
| 422 | `hooks/staging-drift.ts` | 23 | M | converted | `name-grammar` | unchanged file; converted, name-grammar |
| 423 | `rules/commit-lock.md` | 88 | M | other kind | `history` | unchanged file; other kind, history |
| 424 | `rules/fusion-workbench-conventions.md` | 287 | M | converted | `json` | no step-2 row |
| 425 | `rules/fusion-workbench-conventions.md` | 322 | M | converted | `json` | no step-2 row |
| 426 | `rules/fusion-workbench-conventions.md` | 340 | M | converted | `json` | no step-2 row |
| 427 | `rules/user-facing-output.md` | 44 | M | other kind | `jargon-example` | unchanged file; other kind, jargon-example |
| 428 | `skills/archive/SKILL.md` | 151 | C | converted | `name-grammar` | converted, name-grammar |
| 429 | `skills/archive/SKILL.md` | 202 | H | other kind | `homonym` | other kind, homonym |
| 430 | `skills/curate/SKILL.md` | 39 | H | other kind | `homonym` | unchanged file; other kind, homonym |
| 431 | `skills/curate/SKILL.md` | 92 | H | other kind | `homonym` | unchanged file; other kind, homonym |
| 432 | `skills/migrate/SKILL.md` | 20 | M | legacy-only | `migrate` | legacy-only, migrate |
| 433 | `skills/migrate/SKILL.md` | 58 | C | legacy-only | `migrate` | legacy-only, migrate |
