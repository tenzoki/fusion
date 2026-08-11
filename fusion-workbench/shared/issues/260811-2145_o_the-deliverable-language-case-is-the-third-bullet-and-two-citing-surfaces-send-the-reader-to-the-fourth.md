# The deliverable-language case is the third bullet, and two citing surfaces send the reader to the fourth

---

**Severity:** Medium — a citation that resolves to the bullet stating the opposite rule, in the one place the new mechanism tells a reader to look
**Domain:** code
**Filed by:** coderev (Turn 4 review, range `b261d83..951c809`)
**Affects:** `agents/orchestrator.md:430`, `CLAUDE.md:54`
**Cross-references:**
`rules/fusion-workbench-conventions.md:195-207` (`## Project language`, the owning definition — correct);
`shared/decisions/260807-2131_i_which-language-governs-a-customer-deliverable.md` (the decision all three cite);
`shared/issues/260811-1734_o_reduce-the-surface-so-a-claim-cannot-go-stale-in-several-places-at-once.md` (the standing complaint this is another instance of)

---

## What is wrong

`9f84254` widened `## Project language` from three cases to four and inserted the customer-deliverable case as the **third** bullet. Two surfaces written in the same commit cite it as the **fourth**.

The owning file, `rules/fusion-workbench-conventions.md:195-199`, in order:

```
1. Output the user reads in the terminal … chat language
2. Output that persists as a file for the project's own use … artifact language
3. Output that persists as a file for a reader outside the project — a customer deliverable … the language the dispatching task names
4. Text that ships to consuming projects is English, whatever either declaration says
```

The same file gets its own ordinals right, twice: line 206 says "the first, second and fourth cases collapse to today's behaviour" (correct — 1, 2, 4 are the declaration-driven ones) and line 224 says "That is the **third case** above applied to the profile family" (correct).

The two citing surfaces do not:

- `agents/orchestrator.md:430` — "(`rules/fusion-workbench-conventions.md` `## Project language`, **fourth case**; decision `260807-2131_*_…`)"
- `CLAUDE.md:54` — "(decision `260807-2131_*_…`, option 3; **the fourth case** in `rules/fusion-workbench-conventions.md` `## Project language`)"

## Why it is worse than an off-by-one

The fourth bullet is not a neighbouring case that happens to be close. It says:

> Text that ships to consuming projects is **English**, whatever either declaration says.

A reader following `agents/orchestrator.md:430` to check what governs a deliverable's language lands on a bullet that says the language is fixed regardless of any declaration — the precise opposite of "the dispatching task names it, and there is no default." The citation does not merely miss; it resolves to a contradiction, and it resolves there silently.

`agents/editor.md`, which is the agent the rule governs, cites the section without an ordinal ("the customer-deliverable case in …") and is unaffected. `hooks/lib/__tests__/deliverable-language-lint.test.ts` reads the section but asserts on its content, not on any position, so nothing catches this.

## The pattern it belongs to

This is the shape this session has now met four times: a fact corrected in the file being edited and left standing in a neighbour written in the same commit. Here all three surfaces were authored in one commit, so it is not even drift over time — the ordinal was simply counted twice, differently, in one sitting.

## Fix direction

Delete the ordinals rather than correcting them. Both citing surfaces already name the section (`## Project language`) and the decision (`260807-2131`), which is enough to find the rule; the ordinal adds nothing a reader needs and adds a number that breaks when a fifth case is inserted. If a pointer inside the section is wanted, name the case rather than its position — "the customer-deliverable case", the form `agents/editor.md` already uses and the only one that survives a reordering.

## Acceptance criteria

- No shipped surface cites a `## Project language` case by ordinal.
- `deliverable-language-lint.test.ts` gains a case asserting that neither `agents/orchestrator.md` nor `CLAUDE.md` names a numbered case of that section — a text check, cheap, and the only kind that can catch the next one.
