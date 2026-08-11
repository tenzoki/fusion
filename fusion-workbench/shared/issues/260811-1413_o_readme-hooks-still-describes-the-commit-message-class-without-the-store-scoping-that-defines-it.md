# README-hooks still describes the `commit-message` class without the store scoping that defines it

---
**Severity:** Low — the fifth surface describing a class that was redefined at four
**Domain:** code
**Filed by:** coderev, reviewing Turn 2 range `270c566..1d5eed6` (commit `337c01b`)
**Affects:** `README-hooks.md:180` — the `lib/staging-drift.ts` row
**Cross-references:** `shared/issues/260811-1141_c_any-workbench-file-whose-name-contains-commit-message-…` (the fix); `hooks/lib/__tests__/derivable-enumerations-lint.test.ts:347` (the lint that reads this table and checks only that rows exist)

---

## The defect

`337c01b` redefined the `commit-message` class from *"a file whose name says it holds a commit
message"* to *"a commit-message-shaped name that no artifact store owns"*, and carried the new
definition into four places: `hooks/lib/staging-drift.ts` (the docstring, the constant's comment
and the model-facing sentence), `hooks/tracker.ts`'s header, `agents/orchestrator.md`'s class
table, and `skills/commit/SKILL.md`.

`README-hooks.md:180` still reads:

> `commit-message` (a message file that belongs under `/tmp`)

That is the pre-fix definition. It is the user-facing description of this exact module, and it is
the one surface a reader consults who is not already inside the code.

## Why it survived

`derivable-enumerations-lint.test.ts` reads this table, but it checks that a row exists per
`lib/*.ts` file — not what the row says. So the row is watched for existence and unwatched for
content, which is why four synchronised edits missed the fifth site without failing anything.

## Fix direction

One clause: `commit-message` (a commit-message-shaped name that no artifact store owns — the class
the improvised `.commit-msg-tmp` lands in). Consider whether the row's prose is worth pinning to
the module the way `describeReach()` pins the domain-cascade paragraph; if not, the row should say
less rather than say a definition that can drift.
