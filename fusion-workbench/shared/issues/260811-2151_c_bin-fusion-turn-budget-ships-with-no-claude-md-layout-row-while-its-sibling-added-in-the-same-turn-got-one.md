# `bin/fusion-turn-budget` ships with no `CLAUDE.md` Layout row, while its sibling added in the same Turn got one

---

**Severity:** Low — a new shipped helper absent from the table a developer reads first, inconsistently with the helper added three commits earlier
**Domain:** code
**Filed by:** coderev (Turn 4 review, range `b261d83..951c809`)
**Affects:** `CLAUDE.md:30-40` (the Layout table's `bin/` rows)
**Cross-references:**
`shared/issues/260810-0410_o_the-layout-tree-calls-itself-exhaustive-and-omits-the-two-plane-runtime-files.md` (the same table, the same omission class)

---

## What is wrong

This Turn added two shipped `bin/` helpers. `9f84254` added `bin/fusion-source-root` **and** its row in the `CLAUDE.md` Layout table. `61bd21f` added `bin/fusion-turn-budget` and no row — although it is the larger mechanism of the two: a new configuration leaf, a new compiled `dist/` entry point, and a value every orchestrator Setup now reads.

The table is not an inventory today: 9 of the 15 files in `bin/` have rows, and `fusion-count-sources`, `fusion-state-drift`, `fusion-review-coverage`, `fusion-staging-drift` and `fusion-commit-lock` are also absent. So this is not a broken promise of exhaustiveness — it is an inconsistency **inside one Turn**, where the same obligation was met for one helper and not the other, and where the omitted one is the one a project owner needs to find in order to discover that the Turn budget is theirs to set.

## Fix direction

Add the row, in the shape `a0bd3fb` established three commits later for `bin/fusion-churn-rank` — cite the helper's own header rather than restating its output contract and exit table, so a change to the helper has one surface to reach:

> `bin/fusion-turn-budget` | The orchestrator's Phase-2 Turn budget, resolved from configuration and read once at Setup (`agents/orchestrator.md` Setup Step 2, `skills/setup/SKILL.md` Step 2) instead of the number being written into the prompt. Thin bash wrapper over `hooks/dist/turn-budget.js`, resolved relative to itself. **Its own header carries the authoritative usage block** — the `KEY=value` line and the exit-code table are spelled there. A project sets its own budget with `{"orchestrator": {"maxTurns": N}}` in `fusion-guard.json`; the default is defined once, in `hooks/lib/config.ts` `DEFAULTS` (issue `260811-1712`).

Whether to close the other five gaps at the same time, or to state that the table is a selection rather than an inventory, is worth deciding once — `260810-0410` is open on the neighbouring table for the same reason.

## Acceptance criteria

- `bin/fusion-turn-budget` has a Layout row that cites its header rather than copying its contract.
- The table either lists every `bin/` file or says in one line that it does not.

---
Resolved: `bin/fusion-turn-budget` has a Layout row in `CLAUDE.md`, placed beside `bin/fusion-churn-rank` and in the shape `a0bd3fb` established — it cites the helper's own header as the authoritative usage block rather than copying the `KEY=value` line or the exit table, so a change to the output has one surface to reach. It names what a reader would otherwise get wrong: an unresolved read is a state, not a number to fill in, and the row lists the four things the orchestrator does instead of substituting one. Acceptance criterion 1 met. Criterion 2 is **not**: the table still neither lists every `bin/` file nor says that it does not. Five helpers remain without rows — `fusion-commit-lock`, `fusion-count-sources`, `fusion-review-coverage`, `fusion-staging-drift`, `fusion-state-drift` — which is five paragraphs of authored text, not the "few and obvious" the working dispatch allowed inline, and the inventory-or-selection question this record raised is the same one `260810-0410` carries for the neighbouring table. Both are carried by `shared/issues/260811-2239_o_five-shipped-bin-helpers-have-no-claude-md-layout-row-….md`, which proposes answering them together. The one-line "this table is a selection" was deliberately not written, because it answers that question in passing and removes the pull to write the five rows.
