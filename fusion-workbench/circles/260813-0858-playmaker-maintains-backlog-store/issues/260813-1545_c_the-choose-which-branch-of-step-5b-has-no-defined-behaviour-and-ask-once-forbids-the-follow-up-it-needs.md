# The "choose which" branch of `/fusion:next` Step 5b has no defined behaviour, and "Ask, once" forbids the follow-up it needs

**Filed by:** coderev (review of Circle `260813-0858-playmaker-maintains-backlog-store`, commit `b995049`)
**Severity:** High
**Scope:** `skills/next/SKILL.md` (the confirmation relay)

## What the file says

`skills/next/SKILL.md:161`:

> **2. Ask, once.** One `AskUserQuestion` naming the operations in plain words with their entry paths shown, and three options: perform all of them, choose which, perform none.

Two of the three options have a defined continuation. `perform all` and `perform none` are both consumed by step 3 (`skills/next/SKILL.md:163`): dispatch a second time with the approved lines, or dispatch nothing. **`choose which` is consumed by nothing.** No sentence in the step says what the skill does when the user picks it, and the bolded **"Ask, once"** reads as a prohibition on the second question that branch requires.

## Why this is the load-bearing case

Partial approval is the case the design was built for. The plan's step-3 acceptance (`.../planning/260813-1306_p_*.md`) reads: *"a proposed operation is individually nameable, so a partial confirmation has something to point at."* The **line forms** deliver that (`rules/circle-records.md:127`–`131`); the **skill body** never spends it. The one-line-per-operation shape exists so a user can approve a subset, and the step that asks has no way to record a subset.

It is also the likely answer in practice. The one entry in the store carries 13 ideas across three dispositions (`fusion-workbench/portfolio.md:155`–`186`), so "all or nothing" is the least likely thing a user will want.

## The contrast is in the same file

Step 6 has the identical shape and specifies its branch (`skills/next/SKILL.md:209`):

> On **Andere wählen**, list the anticipated Circles from the portfolio's `## Anticipated` section as a follow-up `AskUserQuestion` (one option per directory name), then proceed with the chosen one.

Step 5b carries no equivalent sentence.

## Recommendation

Either of two fixes, both one paragraph:

1. **Multi-select in one question.** Drop the three-option shape and put one `AskUserQuestion` with one option per proposed operation and multi-select on. That satisfies "Ask, once" literally, is the shape the fixed line forms were designed for, and makes "perform none" the empty selection.
2. **Name the follow-up.** Keep the three options and add the Step-6-style sentence: on "choose which", ask a follow-up `AskUserQuestion` with one option per operation, then continue at step 3 with the selected lines. This requires softening "Ask, once", which currently contradicts it.

Option 1 is the smaller change and removes the contradiction rather than qualifying it.

---
Resolved: A second `AskUserQuestion` was added after item 2, following Step 6's own precedent for the same shape: one multi-select option per proposed operation, in the report's order, and what comes back marked is the approved set. A single proposal collapses into perform-all, exactly as Step 6 merges its one-entry case; nothing marked is perform-none. The bold lead became **Ask, once — and a second time only to narrow**, and a third paragraph bounds it: at most two questions, the second strictly narrowing the first, no third, and no re-offering an operation already declined. Item 3 needed nothing — it already dispatches only when at least one operation is approved and lists only the approved lines.
