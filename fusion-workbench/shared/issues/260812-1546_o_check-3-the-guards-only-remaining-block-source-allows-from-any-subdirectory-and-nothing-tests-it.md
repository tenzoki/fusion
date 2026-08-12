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
`circles/260801-1244-guard-rules-write/issues/260804-2100_o_from-a-subdirectory-cwd-the-protected-list-matches-nothing-while-fail-closed-still-denies.md`,
`shared/planning/260812-1232_p_remove-the-protected-path-half-of-the-compliance-guard.md` (step 5),
`shared/history/260812-1546-coder-acceptance-run-against-a-project-that-is-not-this-repository.md`

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
