catalog/README.md says two workflows exist, and its layout omits the schema-case tables
---
a419215a (H6) added `catalog/workflows/entry.v1.json`, `catalog/testdata/entry-schema-cases.v1.json` and widened `catalog/src/__tests__/schema-cases.test.ts`. `catalog/README.md` `## Layout` was not updated for any of them.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** 261023-2154-reviewer-closing-review-of-prior-handover-h1-h6-h7.md (its Not-opened list carried this file)

**Evidence.** `catalog/README.md` `## Layout`, the `workflows/<id>.v1.json` row: "Two exist: `explorer.v1.json`, one durable role, and `repair.v1.json`, …". `ls catalog/workflows` gives `entry.v1.json explorer.v1.json repair.v1.json`, and `catalog/schemas/FROZEN` lists `workflows/entry.v1.json`. The table lists `testdata/catalog-decode-cases.v2.json` but neither `testdata/repair-schema-cases.v1.json` nor `testdata/entry-schema-cases.v1.json`, and lists `render.test.ts` and `frozen.test.ts` but not `schema-cases.test.ts`, which asserts both tables against ajv while `adapters/prior/fusionmodule/internal/steps/schema_cases_test.go` asserts them against the Go validator.

**Acceptance.**
- The workflows row names the set without a count (`rules/critical-stance.md` §5), or derives it (`ls catalog/workflows`).
- The layout carries a row for the schema-case tables and one for `schema-cases.test.ts`, saying both validators assert the same rows.
- `cd catalog && npm test` exits 0.
