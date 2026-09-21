The lib review-coverage header still names "Step 3c" and "Phase 4" after the CLI header was repaired
---
`hooks/lib/review-coverage.ts:95-96` says the CLI is "read by `agents/orchestrator.md` at Step 3c (the dispatch scope) and at Phase 4 (the session summary)". `agents/orchestrator.md` has neither a Step 3c nor a Phase 4; both addresses went with the Turn loop. The same two stale addresses stood in `hooks/review-coverage.ts:12-13` and were repaired under `260918-1334_*_the-review-coverage-cli-header-names-step-3c-and-phase-4-which-the-orchestrator-prompt-does-not-have.md`; that record excluded the lib by its own acceptance ("Change nothing in `hooks/lib/review-coverage.ts`"), so this record is the same defect at the second site. The two built copies, `hooks/dist/lib/review-coverage.js:95-96` and `hooks/dist/lib/review-coverage.d.ts:95-96`, carry the same lines.
---
**Filed by:** coder, Kai Stalmann <ks@qantr.com>
**Cross-references:** `260918-1334_*_the-review-coverage-cli-header-names-step-3c-and-phase-4-which-the-orchestrator-prompt-does-not-have.md`

**Route:** `coder` — a TypeScript source header and its two built `hooks/dist/lib/` copies.

**Evidence:** `grep -n 'Step 3c\|Phase 4' hooks/lib/review-coverage.ts hooks/dist/lib/review-coverage.js hooks/dist/lib/review-coverage.d.ts` prints lines 95 and 96 of each; `grep -c 'Step 3c\|Phase 4' agents/orchestrator.md` prints 0; `grep -n '^## Review coverage\|^## Closing a work item\|^## Ending the session' agents/orchestrator.md` prints the three headings that are the callers the prompt has.

**Acceptance:** the caller list's entry 1 names the callers the prompt has by heading anchor — `agents/orchestrator.md` `## Review coverage`, `## Closing a work item` step 2 and `## Ending the session` — in the same reading `hooks/review-coverage.ts:11-17` now carries, and `hooks/dist/lib/review-coverage.js` and `hooks/dist/lib/review-coverage.d.ts` are rebuilt from it (`cd hooks && npm run build`). `grep -c 'Step 3c\|Phase 4'` over the three files prints `0` for each. Change nothing in `hooks/review-coverage.ts`.
