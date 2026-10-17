# migrate: `/fusion:migrate`'s **Interrupted.** says a rollback refused with exit 8 names the way out, but ending its fence can itself be refused, and that message names none

---
`skills/migrate/SKILL.md` `## Step 7` **Interrupted.** says: "A `rollback` refused with exit 8 says on stderr whether its fence stands and, if so, the way out (the same helper's `rollback` again or `rollback --end-fence`)". In `refusedFirstChunk`, where work is stored since the plan, the helper sends `maintenance end` itself. If the codec refuses that request, the call exits 8 with "<refusal>; ending the fence <id> this rollback began then failed: …". The fence stands, and the message names no way out.
---
**Filed by:** implementation-planner, Kai Stalmann <ks@qantr.com>
**Severity:** Low
**Cross-references:** `261017-1823-plan-migrate-docs-defer-conditions-to-status-and-messages.md`, `261017-1708-migrate-messages-name-end-fence-as-ending-a-fence-it-then-refuses-to-end.md`

**Evidence (read at `68ff12b7`, not reproduced).**
- `hooks/migrate.ts` `refusedFirstChunk`: where `work` is non-empty, `endRollbackFence` is called inside `try`. Its `catch` returns `new Stop((e as Stop).code ?? EXIT.fault, …)`, so a refused `maintenance end` is exit 8, and the text names no command.
- `hooks/migrate.ts` `send`: a refusal is `Stop(EXIT.refused)`, exit 8.

**Reach.** Rare: the codec has to refuse the end of a fence that it reported as standing a moment before. The skill then shows the message and asks which way to take, while the message offers none.

**Fix direction.** Either the skill sentence stops promising a way out ("shows what stderr says about the fence"), which is a cut, or the message names one. The skill stands at 28 997 bytes against its 29 000 cap, so the wording must not grow. Not part of 13.1.12.

**Acceptance.** No sentence of `skills/migrate/SKILL.md` promises a way out for an exit-8 rollback where the message names none, and the skill does not grow.
