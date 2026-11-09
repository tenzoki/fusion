The plan's exit codes for steps 16 and 17 collide with the ones `overview` already uses
---
`bin/fusion-campaign overview`, built in plan step 7b, takes its exit codes from `bin/fusion-forum`: 2, 3, 5, 6 and 7 for the `state=` values it shares with that helper, and adds 1 (the helper could not run) and 4 (the workbench at the commit was not read by the codec). The plan's later steps assign codes of their own on the same helper: step 16 gives 5 to the refusal while a package is held, and step 17 gives 7 to `state=conflict` and 8 to `rejected`. 5 and 7 are taken, so one helper would answer two different conditions with one code.
---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>

**Evidence.** Reported by the code-implementer on plan step 7b; the header of `bin/fusion-campaign` is the authoritative exit table. The orchestrator ran a bare `overview` on branch `campaign` in step 7b's validation: `state=no-upstream`, exit 5. The codes of steps 16 and 17 are read from the plan and not built.

**Acceptance.** Before step 16 is dispatched, the plan carries one exit table for the helper across all its sub-commands, with no code meaning two things, and the header of `bin/fusion-campaign` and the callers named in steps 19 and 20 (the orchestrator's Step 4, the skill body) follow it.

**Cross-references:** `261108-2301-plan-campaign-the-frame-for-work-spread-over-several-checkouts.md` (steps 7, 16, 17, 19, 20)
