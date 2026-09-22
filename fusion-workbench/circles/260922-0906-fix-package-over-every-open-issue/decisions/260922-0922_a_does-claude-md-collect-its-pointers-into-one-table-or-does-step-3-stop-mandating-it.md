# Does `CLAUDE.md` collect its pointers into one table, or does Step 3 stop mandating it?

---
**Domain:** code
**Filed by:** planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260916-2208_*_step-3-mandates-one-collected-pointer-table-and-the-criterions-first-application-leaves-eighteen-scattered.md, 260916-1006_*_how-does-a-consuming-project-bring-its-claude-md-to-the-lean-convention-when-the-curator-asks-a-different-question.md, 260922-0922_*_the-51-open-issues-at-451bb312-worked-autonomously-as-one-package.md

---

## Question

`rules/context-lean-claude-md.md` `### Step 3` says to collect the pointer lines into the one table described under *What stays always-on* and names a scatter as the failure. Fusion's own `CLAUDE.md`, the file the rule's worked examples come from, carries 24 `Detail:` pointer lines at `451bb312`, 9 inside the `## Layout` table and 15 as bullets or bare sentences under `## What this is`, `## Conventions`, `## Release process` and `## Where to look when something breaks`. A consuming project reading the rule and then its one worked application sees them disagree. The defect record says the fork is the user's: either the file changes shape, which decides what four of its sections are left holding, or the rule's mandate softens. Neither is a text repair an executor can make on its own.

## Options

1. **Collect**: every pointer in `CLAUDE.md` moves into the `## Layout` table (or a second pointer table beside it); the four sections keep only the sentences that are not pointers.
   - Pros: the rule stands as written; one scan surface for a reader.
   - Cons: `## Conventions` becomes a table of file-and-section cells, which reads worse than the bullets it replaces; the passage a pointer stands in is what tells a reader why the topic matters, and a table cell loses it.
2. **Soften Step 3**: a pointer may stay where its passage stood when the section around it survives with content of its own; the one-table mandate holds for pointers whose sections were emptied by the cut.
   - Pros: matches what fusion's own file did on 2026-09-16 and what the curator's placement criterion already treats as a passage; a consuming project is told the same thing twice.
   - Cons: the rule gains a condition; "survives with content of its own" has to be decidable, which the passage criterion's Step 1 makes it (a passage is the text under one heading at the chosen level).
3. **Split the difference by count**: Step 3 mandates the table above a threshold of scattered pointers.
   - Pros: none the other two lack.
   - Cons: a threshold nobody derived; the rule would carry a number with no measurement behind it.

## Constraints

- Whichever lands, the rule and `CLAUDE.md` agree in the same commit (the defect's own acceptance).
- `rules/context-lean-claude-md.md` is emitted to `curator` only, so no dispatch-path row moves by more than that one path; `CLAUDE.md` is charged to all eleven, so option 1 is measured on the dispatch-path bound.

## Recommendation

Option 2. The rule was written against a file whose sections had been emptied; fusion's own file kept its sections, and a pointer inside a surviving passage is where a reader looks for it. Option 1 would have the rule's example rewritten to fit the rule rather than the rule stated for the case its example demonstrates.

---
Answered: 260922-0922_*_does-claude-md-collect-its-pointers-into-one-table-or-does-step-3-stop-mandating-it.md `## Options` — option 2: Step 3 softens; a pointer may stay where its passage stood when the section around it survives with content of its own (a passage being the text under one heading at the chosen level), and the one-table mandate holds for pointers whose sections the cut emptied; `CLAUDE.md` keeps its shape; ruled by user, Kai Stalmann <ks@qantr.com>, 260922-1221.
