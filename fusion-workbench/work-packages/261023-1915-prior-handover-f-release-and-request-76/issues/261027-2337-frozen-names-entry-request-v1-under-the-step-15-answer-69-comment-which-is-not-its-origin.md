FROZEN names entry-request.v1 under the step-15 answer-69 comment, which is not its origin
---
In `catalog/schemas/FROZEN`, the line for `schemas/entry-request.v1.json` now stands under "# frozen at plan step 15 on Prior's answer 69 at a4f463f". The asset was added at plan step 3 of `261023-1854-plan-prior-full-surface-handover-h1-to-h9.md` as fusion's proposal in request 76. At `ca9eb60d` a comment saying so headed it. Plan step 7 dropped that comment together with the two withdrawn entry v1 lines, although this third line stayed.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Executor:** data-implementer
**Cross-references:** 261027-2337-reviewer-13-4-1-pre-release-steps-2-to-7.md (finding 3), 261027-1612-plan-fusion-13-4-1-entry-delivery-on-the-step-17-model.md (step 7)

Evidence: `git show ca9eb60d:catalog/schemas/FROZEN` against `catalog/schemas/FROZEN:1-7`.

Fix: insert a comment line directly above the `schemas/entry-request.v1.json` line that names its origin (added at plan step 3 of `261023-1854-plan-prior-full-surface-handover-h1-to-h9`: fusion's proposal in request 76). No asset line changes.

Acceptance: the asset lines of `FROZEN` are byte-equal before and after (`grep -v '^#' catalog/schemas/FROZEN` unchanged). The comment above `schemas/entry-request.v1.json` names request 76 and plan `261023-1854`. `FUSION-CATALOG` exits 0.
---
Resolved: inserted one comment line directly above `schemas/entry-request.v1.json` in `catalog/schemas/FROZEN`, reusing the wording that headed it at `ca9eb60d`: "# added at plan step 3 of 261023-1854-plan-prior-full-surface-handover-h1-to-h9: fusion's proposal in request 76, not yet accepted by Prior". No hash or path line changed (`grep -v '^#' catalog/schemas/FROZEN` byte-equal before and after, cmp exit 0); `git diff -U0` shows the single added line. `frozen.test.ts` skips every `#` line. FUSION-CATALOG (`npm ci && npm test` in `catalog/`) exit 0, 250 tests passed.
