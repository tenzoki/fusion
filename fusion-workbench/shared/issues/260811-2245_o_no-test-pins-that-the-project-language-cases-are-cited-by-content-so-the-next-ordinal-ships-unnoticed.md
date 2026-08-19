# No test pins that the `## Project language` cases are cited by content, so the next ordinal ships unnoticed

---

**Severity:** Low — the text fix is in; nothing stops it being undone
**Domain:** code
**Filed by:** coder (working `260811-2145`, Turn 4 finding 1)
**Affects:** `hooks/lib/__tests__/deliverable-language-lint.test.ts`
**Cross-references:**
`archive/260817-1907-safe-cleanup-scoped/shared/issues/260811-2145_*_the-deliverable-language-case-is-the-third-bullet-and-two-citing-surfaces-send-the-reader-to-the-fourth.md` (its second acceptance criterion, carried here)

---

## What is wrong

`260811-2145` was fixed by removing every ordinal citation of `## Project language`: `agents/orchestrator.md` and `CLAUDE.md` now say "the customer-deliverable case", the form `agents/editor.md` already used, and the two in-section back-references in `rules/fusion-workbench-conventions.md` were rewritten the same way. That is its first acceptance criterion.

Its second is not met. `hooks/lib/__tests__/deliverable-language-lint.test.ts` reads the section and asserts on its content, never on a position — which is why it did not catch the original defect and why it will not catch the next one. Nothing now prevents a future edit reintroducing "the fourth case", and the failure mode is the one the record documented: the citation does not merely miss, it resolves silently to the bullet stating the opposite rule.

## Why it was not done with the fix

The task that fixed `260811-2145` was dispatched with an explicit four-file set that did not include this test, and with an instruction not to build machinery for the citation form. Exceeding the set silently would have been the worse of the two errors, so the criterion is carried here rather than dropped.

## Fix direction

One case in `deliverable-language-lint.test.ts`: assert that no shipped surface citing `## Project language` names a case by ordinal — a text check over `agents/orchestrator.md`, `CLAUDE.md`, `agents/editor.md` and the rule file itself, matching `/(first|second|third|fourth|fifth) case/` within a window around the section name. Cheap, and the only kind of check that can catch the next one.

## Acceptance criteria

- A case in `deliverable-language-lint.test.ts` fails when any of those surfaces cites a `## Project language` case by ordinal.
- It is measured to fail against the text as `9f84254` left it, the way the other controls in this test directory are.

---
**Reconciliation 260817-1836** (reconciler, domain `code`). Re-verified reproducible at HEAD `2552586`: `hooks/lib/__tests__/deliverable-language-lint.test.ts` has no ordinal-citation scan; it tests only the deliverable-language default. Marker stays open. Log: `shared/history/260817-1836-reconciliation.md`.
