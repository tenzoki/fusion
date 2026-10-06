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
