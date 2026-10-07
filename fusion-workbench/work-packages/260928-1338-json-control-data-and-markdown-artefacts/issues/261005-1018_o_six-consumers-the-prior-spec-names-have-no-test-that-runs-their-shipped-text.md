Six consumers the Prior spec names have no test that runs their shipped text
---
Prior's specification §7 requires that tests check the shipped skill blocks and helpers ("Tests müssen die tatsächlich ausgelieferten Skill-Blöcke/Helper prüfen"). FJ03d step 10's consumer-to-test table, taken at `fj03d` `29dac3c5`, names six consumers with no such test.
---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:** 261005-1016-fj03d-step10-classification-re-run-at-the-side-branch-head.md, 261004-2212_*_plan-fj03d-rules-prompts-and-live-predicates-switched-with-this-workbench-in-one-window.md

The six, as the report lists them:

- the agent prompts (Setup, orchestrator, reviewer, state-auditor, policy-curator);
- `/fusion:reconcile` (5 bash blocks);
- `/fusion:cadence` (6 bash blocks);
- `/fusion:check`'s `## gitignore` loops: the `check-ignore` case in `hooks/lib/__tests__/staging-drift.test.ts` tests the repository's `.gitignore`, not the skill block;
- `/fusion:migrate` Step 7's Node gate block;
- `/fusion:help` (a text lint only).

Evidence: the consumer-to-test table of the report cited above.

Acceptance: for each of the six, a test runs the shipped block or helper on a JSON workbench, or the user rules that the consumer is accepted without one and the upgrade document's limits section says so. No step of the FJ03d plan owns this; step 11's rehearsal runs the helpers and one headless agent Setup, which covers part of the first row by behaviour and none of it by a kept test.

Resolved: rows 2 to 6 by test, row 1 by observation. Rows 2 to 6 (`/fusion:reconcile`, `/fusion:cadence` `## Process`, `/fusion:check` `## gitignore`, `/fusion:migrate` Step 7's Node gate, `/fusion:help`'s `FUSION_SRC` block): step 6 of plan `261007-1836-plan-the-four-open-defects-fixed-before-v13-is-tested.md`, `f2e8ea4b`, the tenth case group of `codec/src/__tests__/install.test.ts`, `describe("the shipped reconcile, cadence, check gitignore, migrate Step 7 and help blocks, verbatim on a JSON workbench")`, which lifts each block by heading from the installed tree and runs it on a JSON workbench; the cadence case pins the scan gap filed as `261007-1852-cadences-tree-scan-does-not-see-a-transition-only-change-on-a-json-workbench.md`. Row 1 (the agent prompts: Setup, orchestrator, reviewer, state-auditor, policy-curator): by observation, step 8's report `261007-2348-agent-dispatch-and-skill-block-observation-at-495aca7d.md`, cases (a) to (e) of the opt-in suite `hooks/lib/__tests__/agent-dispatch-observation.test.ts`, 9 of 9 passed in one run. The behaviours row 1 leaves unobserved are listed in that report's `### D4's six rows, classified`; they go to the user's ruling after the run of the further observation cases (f) to (h) added under step 9, and no limits bullet is written before that ruling.
