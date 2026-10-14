The Go schema validator is checked against the explorer schemas only
---
The adapter's own JSON Schema validator (`internal/steps/schema.go`) states that it "must agree with" the host's full draft 2020-12 validator "on every keyword it accepts". Its contract cases cover the four explorer schemas. The eight repair schemas use the keywords where a subset validator is most likely to diverge: `oneOf` branches with `false` property schemas (`implementer-result.v1.json`, the three exclusive verification forms), nested `if`/`then` over `const` and `enum`, and `$ref` into `$defs`. No negative case exercises them, in Go or in the catalog's ajv suite: a search for `did-not-finish` over `adapters/prior/fusionmodule` and `catalog/src/__tests__` finds only the fixture's `exit` entry. A disagreement makes the module refuse an answer the host accepts, or accept one the host refuses.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** `261014-0830-reviewer-closing-pass-over-the-prior-module-bundle-package.md`

Evidence:

- `adapters/prior/fusionmodule/internal/steps/schema.go:13-23` (the agreement claim).
- `adapters/prior/fusionmodule/internal/steps/schema_test.go:121-165`: `TestShippedSchemas` loads `explorer-request`, `explorer-role-input`, `explorer-envelope`, `explorer-result` only.
- `adapters/prior/fusionmodule/internal/fixture/repair.go:260`: the one verification entry any test builds (`status` `exit`, `exit_code` 0).
- Checked with ajv 2020 in a scratch script: the frozen schemas themselves behave as intended (done with `exit` 0 valid; `exit` with `detail`, done with `did-not-finish`, `none` with `command`, escalated with `stopped_at` null all invalid). The Go side was read, not run.

Fix direction: one shared table of contract cases (JSON documents with an expected valid or invalid verdict per repair schema), asserted by ajv in `catalog/src/__tests__/` and by `steps.CompileSchema` in a Go test that reads the same file through `FUSION_CATALOG_DIR`.

Acceptance: both suites run the shared table, it holds at least the five verification-form cases above and the four `repair-result` status branches, and both are green.
