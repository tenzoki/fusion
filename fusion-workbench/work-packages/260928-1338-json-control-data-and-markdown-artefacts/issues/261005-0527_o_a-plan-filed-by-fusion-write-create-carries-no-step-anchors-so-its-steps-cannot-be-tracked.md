A plan filed by `bin/fusion-write create` carries no step anchors, so its steps cannot be tracked
---
`bin/fusion-write create --kind plan` sends the plan's control as `INITIAL_CONTROL.plan` in `hooks/lib/record-write.ts`: `steps: []`, `criteria: []`. The codec's plan progress updates only ids the stored plan has and never adds one (`planProgress` in `codec/src/cli/ops.ts`, refusal `unresolved-reference/unknown-step-id`). A plan created after the migration can therefore never record a step through `transition --steps`; only plans imported by `/fusion:migrate` carry anchors.
---
**Filed by:** code-implementer, Kai Stalmann <ks@qantr.com>
**Cross-references:** 261004-2212_*_plan-fj03d-rules-prompts-and-live-predicates-switched-with-this-workbench-in-one-window.md (step 6 expects the planner's numbered steps as anchors), 261001-1804_*_what-stable-step-anchor-does-an-imported-plan-carry-and-which-criteria.md

**Evidence:** at `84047ad7`, `hooks/lib/record-write.ts` `INITIAL_CONTROL` (`plan: { state: "open", steps: [], criteria: [], acceptance: null }`) and the create branch that sends `structuredClone(INITIAL_CONTROL[kind])` as the payload; `codec/src/cli/ops.ts` `planProgress`, step 3 ("plan progress updates the steps it has and never adds one"). `bin/fusion-write`'s header lists no flag for steps on `create`.

**Effect:** FJ03d step 3 states it in `rules/fusion-workbench-conventions.md` `### Planning files` (a plan filed by `create` tracks its state alone). Step 6's planner text ("numbered steps under `## Implementation Steps` as the anchors") has no write route for a new plan.

**Acceptance:** either `create --kind plan` derives one anchor per numbered step under `## Implementation Steps` from the narrative (as `hooks/lib/legacy-import.ts` `scanPlan` does at import), or the conventions and the planner prompt state that a new plan's progress is its state alone; a test files a plan through `bin/fusion-write create` and records a step, or pins the refusal.
