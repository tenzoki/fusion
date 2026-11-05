`commit` and `cleanup` stay held on Prior though request 76 question 1 is answered
---
`catalog/src/__tests__/prior-held-unsupported.test.ts` holds both entries at `prior: unsupported`, on the condition that request 76 question 1 is answered. Prior has answered it, so the hold now stands on no stated condition, and their `prior` parts still describe the model that answer replaced. Severity: Low. Nothing runs wrong: Prior refuses both entries by name.
---
**Filed by:** data-implementer, Kai Stalmann <ks@qantr.com>
**Executor:** code-implementer, after a ruling and a request to Prior
**Cross-references:** 261105-1023-plan-fusion-13-4-2-corrected-candidate.md; 261025-2352-plan-step-15-as-written-would-mark-commit-and-cleanup-supported-on-prior.md

**Evidence.**

- The test's header names the condition: "the condition is request 76, question 1". Its failure message says only a ruling lifts the hold, and that the ruling removes the id from `HELD`.
- `codec/fixtures/prior/REQUESTS.md`, request 77 question 5, point 1: `commit` and `cleanup` "become entries only after this is confirmed".
- `Prior: docs/design/fusion-entry-v2-request76-77-prior-response.md` at `52a2703`: request 76 question 1 is accepted "as request 77 question 5, point 1", and that point is accepted (a run's commits reach the user's branch as made). H1 binds 25 entries and refuses these 2 by name.
- `catalog/profiles/skill-commit/parts/01-prior.md` and `catalog/profiles/skill-cleanup/parts/01-prior.md` still say the workspace is "a fresh checkout at the run's base revision" and name `schemas/entry-result.v1.json`, both replaced by request 77. Their citations of question 1 still say the answer is Prior's to give.
- Request 76 question 14 is accepted with no push in `entry.v2`, and question 4 is deferred, so a supported `cleanup` could not push on Prior.

**Why it is not in 13.4.2.** Lifting the hold adds two entries to Prior's surface, which a correction candidate must not do unasked (the plan's `## Approach`).

**Acceptance.** Either way, the hold's stated condition is true again and `cd catalog && npm test` exits 0 with the Claude render diff empty:

- Lifted: a ruling is recorded, `HELD` no longer names the entry, its `prior` parts describe the step-17 model, and a request to Prior names the added entries.
- Kept: a ruling is recorded, and the test's header names that ruling as the condition in place of question 1.
