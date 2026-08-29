The hook sentences cite fusion's own workbench ids and a fusion commit hash into a consuming project's session

---

`coverageSentence()` in `hooks/lib/review-coverage.ts:695` and `stagingSentence()` in
`hooks/lib/staging-drift.ts:642,648` close with a retrospective on the fusion incident that
motivated each check, naming fusion's own defect records (`260810-1205`, `260811-0114_*_the-queue-rebuild-and-its-history-file-never-entered-a-commit-and-survive-only-in-the-working-tree.md`,
`260811-1141_*_any-workbench-file-whose-name-contains-commit-message-is-classified-as-a-commit-message-and-the-model-is-told-to-delete-it.md`) and one fusion commit hash (`f38f37d`). Those sentences are handed back to
the model in **every** project the plugin runs in. In a consuming project none of the four
identifiers resolves: the records do not exist in that workbench, and the hash names no
object in that repository, or worse, an unrelated one.

---

## How it surfaced

Reported by the user from a consuming project. Its orchestrator read `260810-1205` as a
local record, relayed it to the user twice as evidence for a measured coverage gap, and
then had to correct itself:

> "Eine Korrektur an mir zuerst: die Kennung 260810-1205, die ich dir zweimal als Beleg
> für die Deckungslücke genannt habe, gehört zum Workbench von fusion selbst und nicht zu
> diesem Projekt. Sie kam über einen Hook in die Sitzung und ich habe sie ungeprüft
> weitergereicht. Die Lücke selbst ist echt und nachgemessen: 70 von 79 Commits."

The measurement the hook reported was correct. Only the citation was foreign, and nothing
in the sentence marks it as foreign, so the reading the orchestrator gave it is the
natural one.

## Scope

Three emission sites, all in model-facing sentence builders:

| Site | Foreign reference |
|---|---|
| `hooks/lib/review-coverage.ts:695` | `260810-1205` |
| `hooks/lib/staging-drift.ts:642` | `260811-1141_*_any-workbench-file-whose-name-contains-commit-message-is-classified-as-a-commit-message-and-the-model-is-told-to-delete-it.md` |
| `hooks/lib/staging-drift.ts:648` | `260811-0114_*_the-queue-rebuild-and-its-history-file-never-entered-a-commit-and-survive-only-in-the-working-tree.md`, `f38f37d` |

`hooks/lib/domain-cascade.ts:528` names two records in a `CascadeError` and is **not** in
scope: that module is reached only from the lint tests, so its text never enters a
consuming session.

## What the fix must not lose

The instruction each sentence carries is the part that acts, and it stays. In
`stagingSentence()` two clauses are load-bearing beyond their citations and must survive
the removal of the identifier attached to them: that deleting a file classified by name
alone is not recoverable, and that the answer to a missed record is never `git add -A`,
`-u`, a directory argument or a glob.

## Test coupling

Several cases in `hooks/lib/__tests__/review-coverage.test.ts` (lines 565, 587, 617, 629,
675) assert on the literal string `260810-1205` as a proxy for "the hook spoke". They need
a different, project-neutral proxy in the same change. `hooks/lib/__tests__/helpers/guard-harness.ts:541`
carries the same literal.

## Decided

User gate, 2026-08-17: keep only the instruction. The retrospective on fusion's own
incident leaves the emitted sentence entirely; the identifiers stay in the source comments,
where the reader is a fusion developer. All three sites plus the commit hash are in scope.

**Cross-references:** `260807-2153_*_the-exempt-surface-list-is-plugin-repo-shaped-but-ships-to-every-consumer.md` — same class, a plugin-repo-shaped surface shipping to every consumer.

---
Resolved: The retrospective clause left all three emitted sentences; only the instruction
remains. `coverageSentence()` (`hooks/lib/review-coverage.ts`) now closes on the two
role-addressed instructions alone. `stagingSentence()` (`hooks/lib/staging-drift.ts`) keeps
the not-recoverable constraint on the commit-message class without `260811-1141_*_any-workbench-file-whose-name-contains-commit-message-is-classified-as-a-commit-message-and-the-model-is-told-to-delete-it.md`, and its
closing part keeps the full staging instruction and the `git add -A` prohibition, whose
justification is now what loosening the shape *does* — it stages the deletions of renamed
records, adds nothing in their place, and takes those records out of HEAD — instead of the
commit it happened in. `hooks/lib/domain-cascade.ts` was left alone as out of scope, and the
source comments above both functions keep the identifiers, where the reader is a fusion
developer.

Test coupling: the literal proxies were replaced with project-neutral ones taken from the
part of each sentence that is emitted unconditionally — `COVERAGE_SPOKE`
("widen the next dispatch's scope") in `review-coverage.test.ts`, `STAGING_SPOKE`
("Do NOT reach for `git add -A`") in `staging-drift.test.ts`, and the third entry of
`COVERAGE_SENTENCE_MARKERS` in `helpers/guard-harness.ts`. Each carries a comment saying why
that string is the proxy. `hooks/dist/` was rebuilt; the surface golden was regenerated
(+32 hook-test lines, inside the surface's head-room, no baseline moved). `npm test` in
`hooks/`: 653 passed, exit 0.
