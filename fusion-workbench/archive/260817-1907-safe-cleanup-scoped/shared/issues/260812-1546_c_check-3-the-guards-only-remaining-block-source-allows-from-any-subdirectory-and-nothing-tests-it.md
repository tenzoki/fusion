CHECK 3, the guard's only remaining block source, allows from any subdirectory and nothing tests it

---
Measured in step 10's acceptance run against a scratch consuming project. The decision-governed
check is now the guard's only source of a block. Its glob match is anchored to `process.cwd()`
(`hooks/guard.ts:353` → `normalizeToRelative` → `projectRelative(filePath, process.cwd())`), so a
project-relative pattern in `guard.categoryPaths` can only match when the session's working
directory IS the project root. From any subdirectory the same write is allowed, silently.

Same project, same configuration (`decisions: [api]`, `categoryPaths: {api: ["src/api/**"]}`,
`categorySensitivity: {api: "high"}`), same absolute `file_path`, three working directories:

    cwd = <root>            Edit <root>/src/api/service.ts  ->  block
    cwd = <root>/src        Edit <root>/src/api/service.ts  ->  allow
    cwd = <root>/sub/deep   Edit <root>/src/api/service.ts  ->  allow

No test pins this. `protected-snapshot-subdirectory.test.ts` was the suite's only end-to-end case
for a guard VERDICT under a subdirectory cwd, and it was deleted in step 5 of the removal plan; the
plan states its lesson "survives in `churn-key-anchor.test.ts` for churn and in
`session-start-subdirectory.test.ts` for the warning", and neither of those two asks the question of
a guard verdict. `project-relative.test.ts` covers the function in isolation and cannot reach the
verdict.

---
**Witness:** coder, step 10 acceptance run, scratch project at `/private/tmp/fusion-accept-260812/proj`
**Severity:** medium — a project that configured a block does not get it from a subdirectory, and
the suite would not notice if that behaviour changed in either direction
**Affected:** `hooks/guard.ts:353`, `hooks/lib/project-relative.ts`, the test suite (no coverage)
**Cross-references:**
`260804-2100_*_from-a-subdirectory-cwd-the-protected-list-matches-nothing-while-fail-closed-still-denies.md`,
`260812-1232_*_remove-the-protected-path-half-of-the-compliance-guard.md` (step 5),
`260812-1546-coder-acceptance-run-against-a-project-that-is-not-this-repository.md`

## What is and is not new here

The behaviour is documented. `hooks/session-start.ts` warns about it at SessionStart, in a message
this run confirmed fires and reads "from here they inspect the wrong directory and let through what
they would otherwise stop", and `README-hooks.md` was rewritten in step 9 to name CHECK 3 as the
cwd-anchored check. So this is not an undocumented behaviour; it is an untracked and untested one.

What changed on 2026-08-12 is which mechanism carries the residual and what stands behind it. The
issue that tracked it, `260804-2100`, is about the protected list, and `hooks/session-start.ts:29`
now describes that issue as "open and now moot" because its subject was deleted. That reading is
correct for the record and leaves the class untracked: the same assumption now reaches the only
check that can still block, and the root-anchored measurement that used to catch what the
cwd-anchored deny let past went with the removal. The docstring's "the same assumption with milder
consequences" is true of the frequency, not of the backstop — there is no longer one.

## The narrow fix, if one is wanted

`projectRelative` already takes the directory to anchor against as an argument, precisely so a caller
can choose. `churnKey` passes the workbench root. Passing `findWorkbenchRoot() ?? process.cwd()` at
`hooks/guard.ts:353` would make CHECK 3 answer the same way from every directory in the project. That
is a behaviour change to a live check and is not filed as decided here.

---
Resolved: the guard has no block source at all, so the class this record tracks has no carrier left. `2f624ca` (plan step P-2) deleted CHECK 3 from `hooks/guard.ts`; `fab8a4b` (P-7a) deleted the four keys that armed it (`decisions`, `guard.categoryPaths`, `guard.categorySensitivity`, `guard.defaultSensitivity`) together with `findRelevantDecisions` and `sensitivityLevel`; and `3c2e1c6` (P-5, first half) deleted `hooks/lib/project-relative.ts` with its last caller, which is the cwd anchoring measured here. The narrow fix this record offered — passing `findWorkbenchRoot() ?? process.cwd()` at the old `hooks/guard.ts:353` — has no site to be applied at, and the missing coverage it names is coverage of a verdict that can no longer occur. The cwd-anchored assumption itself is not gone from the project: `bin/fusion-plugin-cwd`, `bin/fusion-rules`, `bin/fusion-paths` and `bin/fusion-source-root` still resolve their work-tree preference against cwd with no upward walk, and `hooks/session-start.ts` warns about exactly that. What is gone is its reach into a guard verdict, which is what this record is about. Plan: `260816-1915_*_the-compliance-guard-becomes-observation-only.md`.
