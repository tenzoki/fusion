README-agents.md's catalog row still names repair.v1 as one of "the two workflow definitions"
---
`README-agents.md:203`, `## Plugin structure`, the `catalog/` row: "`workflows/explorer.v1.json` and `workflows/repair.v1.json` are the two workflow definitions, `schemas/*.v1.json` the request, role-input, envelope and result schemas the bundle ships, and `schemas/FROZEN` the sha256 of every published schema and workflow definition: `src/__tests__/frozen.test.ts` turns red on a changed byte, because Prior accepted those bytes." At `ea1e91b8` `catalog/workflows/` holds `entry.v2.json` and `explorer.v1.json`, `repair.v1.json` is withdrawn (`catalog/schemas/WITHDRAWN`), the bundle ships `schemas/entry-result.v2.json`, and three `FROZEN` lines (`entry-request.v1.json`, `entry.v2.json`, `entry-result.v2.json`) are fusion's proposals that Prior has not accepted. The row does not mention `WITHDRAWN`.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Executor:** code-implementer
**Cross-references:** 261028-0810-reviewer-closing-review-of-prior-handover-f-13-4-1-and-request-77.md; 261024-1005-catalog-readme-says-two-workflows-exist-and-its-layout-omits-the-schema-case-tables.md (the same fact in `catalog/README.md`, fixed there and not here)

**Evidence.** The row was already stale at 13.4.0: `a419215a` added `workflows/entry.v1.json`, and `4fc3fd1f` rewrote this row and kept "the two workflow definitions". The 13.4.1 plan's `## Current State` says `README-agents.md` stays true and is not touched, but it checked only line 29 and `### The Prior module bundle`. No lint resolves `workflows/repair.v1.json` here, because the path is relative to `catalog/`.

**Timing.** `README-agents.md` is shipped. Until the `v13.4.1` tag, main takes no commit to a shipped file other than `REQUESTS.md` (plan `261027-1612-plan-fusion-13-4-1-entry-delivery-on-the-step-17-model.md` `## Where this work stops`). So the fix lands after the tag, or in the 13.4.2 candidate if Prior's answer needs one.

**Acceptance.**
- The row names the workflow set without a count, or derives it (`ls catalog/workflows`), per `rules/critical-stance.md` §5, and names no withdrawn asset as live.
- It says that `FROZEN` holds published assets, some of them proposals not yet accepted, and that `WITHDRAWN` records the withdrawn ones; or it points at `catalog/README.md` `## The frozen assets` and restates nothing.
- `cd hooks && npm test` and `cd catalog && npm test` exit 0.
