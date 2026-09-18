The review-coverage CLI header names "Step 3c" and "Phase 4", which the orchestrator prompt does not have
---
`hooks/review-coverage.ts:11-13` says the CLI is "Called through `bin/fusion-review-coverage` by `agents/orchestrator.md` at Step 3c (to widen the next review dispatch's scope) and at Phase 4 (to state the session's coverage)". `agents/orchestrator.md` has neither a Step 3c nor a Phase 4; both addresses went with the Turn loop. The same shape of stale caller address was corrected in `hooks/staging-drift.ts` and `hooks/lib/staging-drift.ts` by this fix; the other wrapper was out of that fix's scope and is filed here.
---
**Filed by:** coder, Kai Stalmann <ks@qantr.com>
**Cross-references:** `260911-1339_*_staging-drift-still-classifies-a-pointer-a-rule-says-nothing-creates-and-names-a-turn-boundary-trigger-it-does-not-have.md`

**Route:** `coder` — a TypeScript source header and its built `hooks/dist/` copy.

**Evidence:** `grep -n 'Step 3c\|Phase 4' hooks/review-coverage.ts` prints the two lines; `grep -n '^## Review coverage\|^## Closing a work item' agents/orchestrator.md` prints the two headings that are the callers the prompt has, and `grep -c 'Step 3c\|Phase 4' agents/orchestrator.md` prints 0.

**Acceptance:** the header names the callers the prompt has — `agents/orchestrator.md` `## Review coverage` and `## Closing a work item` step 2 — and `hooks/dist/review-coverage.js` and `hooks/dist/review-coverage.d.ts` are rebuilt from it (`cd hooks && npm run build`). Change nothing in `hooks/lib/review-coverage.ts`.
