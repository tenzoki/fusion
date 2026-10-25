Plan step 15 as written would mark `commit` and `cleanup` supported on Prior
---
Step 15 says: `support.prior` to `supported` "for every entry whose profile has a `prior` part". `skill-commit` and `skill-cleanup` have `prior` parts, so the step marks both supported. The intent that both stay unsupported is written only in the span map's Recommendation 2 and in the messages of `87675d99` and `ec6c968e`. Severity: Medium. Fusion fixes this.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Domain:** code
**Executor:** the orchestrator, at the user's word (plan amendment), or code-implementer (a test)
**Cross-references:** 261025-2352-reviewer-closing-review-of-prior-handover-c-skill-profiles.md; 261023-1854-plan-prior-full-surface-handover-h1-to-h9.md (step 15); 261025-2218-skill-span-map-for-entry-profiles.md (`## Implications`, Recommendation 2)

## Defect

- Plan `261023-1854-plan-prior-full-surface-handover-h1-to-h9.md`, step 15, Changes: "`support.prior` to `supported` for every entry whose profile has a `prior` part".
- `catalog/profiles/skill-commit/parts/*-prior.md` (5 parts) and `skill-cleanup/parts/*-prior.md` (9 parts) exist, and say the entry has nothing to commit on Prior (`skill-commit/parts/03-prior.md`, `skill-cleanup/parts/01-prior.md`).
- `catalog/catalog.json`: both are `prior: unsupported` today, with all fourteen other skills. No test or field distinguishes the two.
- The step-15 executor, data-implementer, works from the plan step. The exception is in an analysis and two commit messages. This is the same hand-off gap as package B's Finding 3.

The five `requires` changes need no such note: they follow from the parts. With all sixteen skills set `supported` in a scratch copy and `requires` from the span map's Finding 5, `checkEntries` and the Prior lint pass (`npm test`, 259 passed).

## Fix direction

Amend step 15's Changes line to name the exception and its condition (request 76 question 1). Or add a catalog test that holds `commit` and `cleanup` at `prior: unsupported` until a ruling removes it.

## Acceptance

- The step-15 brief, or a test, names `commit` and `cleanup` as staying `prior: unsupported`.
- After step 15, `catalog.json` shows both unsupported, and the other fourteen as the plan says.
