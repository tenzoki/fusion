# Can migrate's language preamble adopt the shortened form and keep its shell-string clause?

---
**Domain:** code
**Filed by:** planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** `260908-1346-the-cut-ledger-for-the-skills-surface-and-what-the-post-body-owes.md` (row 9, and its third Open Question); `260908-1612_*_cut-the-skills-surface-and-add-the-post-step-body.md` step 4; `skills/migrate/SKILL.md:12`; `skills/news/SKILL.md:18`; `rules/fusion-workbench-conventions.md` `## Project language`

---

## Question

Row 9 of the cut ledger replaces the multi-sentence language preamble in three skill bodies with the one-line form `skills/news/SKILL.md` already uses, and deliberately excludes `skills/migrate/SKILL.md`. Migrate's preamble carries a clause the short form has no room for: the strings printed by its own shell blocks stay English in every project, because they are CLI operator output.

The exclusion was made rather than measured, and it leaves the project with two forms of one preamble and no rule saying when each applies. That matters now because `skills/post/SKILL.md` adopts the short form as a new body, so the short form is becoming the default by accumulation rather than by decision.

One thing planning established that narrows the question. The exemption category is **not** unstated elsewhere: `rules/fusion-workbench-conventions.md` `## Project language` names "hook and CLI operator strings" among the universally exempt surfaces. What migrate states alone is the application of that category to its own shell blocks. So the choice is about how much of a general rule a consumer restates when its own case is unusual, not about whether the rule exists.

## Options

1. **Leave migrate as it is, and say why in one clause.** The long form stays in that one body, with a sentence naming it as the documented exception.
   - Pros: no risk to the one skill that runs against workbenches nothing else serves. Costs nothing to decide.
   - Cons: two forms with no stated boundary is what invites the next author to normalise the wrong one.
2. **Shorten migrate to the one-line form plus a second sentence for the shell-string clause.** Roughly 250 to 300 bytes rather than 682, so it frees fewer bytes than the other three sites but keeps the clause.
   - Pros: one form everywhere, with the exception carried explicitly. The saving is real, if small.
   - Cons: the clause is what stops an executor rendering migrate's `echo` lines in German, and compressing it is exactly where the meaning would be lost.
3. **Drop the clause and rely on the conventions' exemption.** The short form alone, with the reader expected to apply `## Project language` to the shell blocks.
   - Pros: the leanest, and formally sufficient, since the category is authored.
   - Cons: the application is not obvious. A body whose whole content is messages to be rendered, sitting next to blocks whose messages are not, is the case where a reader most needs the mapping spelled out.

## Constraints

- No rule file gains a byte from anything this Circle does; the Directive fixes that, so the answer may not move the clause into `rules/`.
- Whatever holds must hold for `skills/post/SKILL.md` too, which adopts the short form in the same Circle.
- The `skills/*/SKILL.md` growth bound is the binding surface, so an answer that lengthens a body needs its bytes named.

## Recommendation

Option 1 for this Circle, which is what the plan does, and the question left open for the Circle that next opens `skills/migrate/SKILL.md`. Option 2 is the likely long answer, but it is worth 250-odd bytes on a surface that has 3 483 at the pessimistic end after this work, and the risk it carries lands on the one skill nobody exercises routinely.
